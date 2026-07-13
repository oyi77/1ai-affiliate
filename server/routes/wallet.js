'use strict';

const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const { authenticate } = require('../middleware/auth');
const pool = require('../db/mysql');
const paymentGateway = require('../services/paymentGateway');
const settings = require('../services/settingsService');

router.use(authenticate);

// ── GET /api/wallet ──────────────────────────────────────────────
// Returns wallet summary for current user
router.get('/', async (req, res) => {
  try {
    const userId = req.user.id;

    // Balance from ledger
    const [[balRow]] = await pool.query(
      `SELECT
        COALESCE(SUM(CASE WHEN type = 'deposit' OR type = 'adjustment' THEN amount ELSE 0 END), 0) AS deposits,
        COALESCE(SUM(CASE WHEN type = 'withdrawal' THEN ABS(amount) ELSE 0 END), 0) AS withdrawals,
        COALESCE(SUM(CASE WHEN type = 'spend' THEN ABS(amount) ELSE 0 END), 0) AS spending
       FROM 1ai_balance_ledger WHERE user_id = ?`,
      [userId]
    );

    const deposits = Number(balRow.deposits);
    const withdrawals = Number(balRow.withdrawals);
    const spending = Number(balRow.spending);
    const balance = deposits - withdrawals - spending;

    // Pending earnings
    const [[earnRow]] = await pool.query(
      `SELECT COALESCE(SUM(payout_amount), 0) AS pending
       FROM 1ai_affiliate_earnings WHERE affiliate_id = (SELECT id FROM 1ai_affiliates WHERE user_id = ?) AND status = 'pending'`,
      [userId]
    );

    const walletEnabled = await settings.get('wallet_enabled');
    const minTopupUsd = Number(await settings.get('wallet_min_topup_usd')) || 10;
    const rate = Number(await settings.get('wallet_usd_idr_rate')) || 15500;
    const minTopupIdr = minTopupUsd * rate;

    res.json({
      data: {
        balance,
        deposits,
        withdrawals,
        spending,
        pending_earnings: Number(earnRow.pending),
        currency: await settings.get('default_currency') || 'IDR',
        min_topup: minTopupIdr,
        min_topup_usd: minTopupUsd,
        exchange_rate: rate,
        wallet_enabled: walletEnabled === 'true' || walletEnabled === true,
      },
    });
  } catch (err) {
    console.error('Wallet summary error:', err.message);
    res.status(500).json({ error: 'Failed to fetch wallet summary' });
  }
});

// ── GET /api/wallet/transactions ─────────────────────────────────
// Paginated transaction history (ledger + spending)
router.get('/transactions', async (req, res) => {
  try {
    const userId = req.user.id;
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(Math.max(1, parseInt(req.query.limit) || 50), 200);
    const offset = (page - 1) * limit;
    const type = req.query.type; // filter: deposit, withdrawal, spend, adjustment

    let where = 'WHERE user_id = ?';
    const params = [userId];
    if (type && ['deposit', 'withdrawal', 'spend', 'adjustment'].includes(type)) {
      where += ' AND type = ?';
      params.push(type);
    }

    const [[{ total }]] = await pool.query(
      `SELECT COUNT(*) AS total FROM 1ai_balance_ledger ${where}`,
      params
    );

    const [rows] = await pool.query(
      `SELECT id, amount, type, note, traffic_source_id, created_at
       FROM 1ai_balance_ledger ${where}
       ORDER BY created_at DESC LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    res.json({ data: rows, page, limit, total, pages: Math.ceil(total / limit) });
  } catch (err) {
    console.error('Wallet transactions error:', err.message);
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
});

// ── GET /api/wallet/spending ─────────────────────────────────────
// Spending breakdown by feature
router.get('/spending', async (req, res) => {
  try {
    const userId = req.user.id;
    const days = parseInt(req.query.days) || 30;
    const cutoff = Math.floor(Date.now() / 1000) - days * 86400;

    const [rows] = await pool.query(
      `SELECT feature, SUM(amount) AS total, COUNT(*) AS count
       FROM 1ai_wallet_spending
       WHERE user_id = ? AND created_at >= ?
       GROUP BY feature ORDER BY total DESC`,
      [userId, cutoff]
    );

    res.json({ data: rows.map(r => ({ feature: r.feature, total: Number(r.total), count: Number(r.count) })) });
  } catch (err) {
    // Table may not exist yet
    res.json({ data: [] });
  }
});

// ── GET /api/wallet/pricing ──────────────────────────────────────
// List all feature prices
router.get('/pricing', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM 1ai_feature_pricing ORDER BY feature_key');
    const pricing = {};
    for (const r of rows) {
      pricing[r.feature_key] = { price: Number(r.price), currency: r.currency, unit: r.unit, description: r.description };
    }
    res.json({ data: pricing });
  } catch (err) {
    // Table may not exist yet
    res.json({ data: {} });
  }
});

// ── POST /api/wallet/topup ───────────────────────────────────────
// Create a topup payment via gateway
router.post('/topup', async (req, res) => {
  try {
    const { amount, method } = req.body;
    const userId = req.user.id;

    if (!amount || !method) {
      return res.status(400).json({ error: 'Amount and method required' });
    }

    const numAmount = Number(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      return res.status(400).json({ error: 'Amount must be a positive number' });
    }

    // Resolve method to internal gateway
    let gateway;
    try {
      gateway = paymentGateway.resolveGateway(method);
    } catch (e) {
      return res.status(400).json({ error: e.message });
    }

    // Check minimum topup
    const minTopupUsd = Number(await settings.get('wallet_min_topup_usd')) || 10;
    const rate = Number(await settings.get('wallet_usd_idr_rate')) || 15500;
    const minTopup = minTopupUsd * rate;

    if (numAmount < minTopup) {
      return res.status(400).json({
        error: `Minimum topup is Rp ${minTopup.toLocaleString('id-ID')} (USD ${minTopupUsd})`,
        min_amount: minTopup,
        min_usd: minTopupUsd,
      });
    }

    // Check wallet enabled
    const walletEnabled = await settings.get('wallet_enabled');
    if (walletEnabled === 'false') {
      return res.status(403).json({ error: 'Wallet is currently disabled' });
    }

    const currency = (await settings.get('default_currency')) || 'IDR';
    const result = await paymentGateway.createPayment({
      gateway,
      amount: numAmount,
      currency,
      method,
      userId,
      purpose: 'wallet_topup',
      metadata: { type: 'wallet_topup', user_email: req.user.email },
    });

    res.json({
      data: {
        reference: result.reference,
        amount: result.amount,
        checkout_url: result.checkout_url,
        qr_url: result.qr_url,
        pay_code: result.pay_code,
      },
    });
  } catch (err) {
    console.error('Topup error:', err.message);
    res.status(500).json({ error: err.message || 'Topup failed' });
  }
});


// ── GET /api/wallet/topup/status/:ref ────────────────────────────
router.get('/topup/status/:ref', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT reference, amount, status, paid_at, created_at FROM 1ai_payments WHERE reference = ? AND user_id = ?',
      [req.params.ref, req.user.id]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Payment not found' });
    res.json({ data: rows[0] });
  } catch (err) {
    res.status(500).json({ error: 'Failed to check payment status' });
  }
});

// ── POST /api/wallet/withdraw ────────────────────────────────────
router.post('/withdraw', async (req, res) => {
  try {
    const { amount, method, details } = req.body;
    const userId = req.user.id;

    if (!amount || !method) {
      return res.status(400).json({ error: 'Amount and method required' });
    }

    const numAmount = Number(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      return res.status(400).json({ error: 'Amount must be positive' });
    }

    // Check balance
    const [[balRow]] = await pool.query(
      `SELECT
        COALESCE(SUM(CASE WHEN type = 'deposit' OR type = 'adjustment' THEN amount ELSE 0 END), 0) -
        COALESCE(SUM(CASE WHEN type = 'withdrawal' THEN ABS(amount) ELSE 0 END), 0) -
        COALESCE(SUM(CASE WHEN type = 'spend' THEN ABS(amount) ELSE 0 END), 0) AS balance
       FROM 1ai_balance_ledger WHERE user_id = ?`,
      [userId]
    );

    const balance = Number(balRow.balance);
    if (balance < numAmount) {
      return res.status(400).json({ error: 'Insufficient balance', available: balance });
    }

    // Record withdrawal
    await pool.query(
      'INSERT INTO 1ai_balance_ledger (user_id, amount, type, note, created_at) VALUES (?, ?, ?, ?, UNIX_TIMESTAMP())',
      [userId, -numAmount, 'withdrawal', `Withdrawal via ${method}${details ? ': ' + JSON.stringify(details) : ''}`]
    );

    res.json({ success: true, withdrawn: numAmount, remaining: balance - numAmount });
  } catch (err) {
    console.error('Withdraw error:', err.message);
    res.status(500).json({ error: 'Failed to process withdrawal' });
  }
});

// ── POST /api/wallet/spend (internal) ────────────────────────────
// Deduct from wallet for feature usage
router.post('/spend', async (req, res) => {
  const conn = await pool.getConnection();
  try {
    const { feature, feature_id, amount, description, metadata, idempotency_key } = req.body;
    const userId = req.body.user_id || req.user.id; // Allow admin to spend on behalf

    if (!feature || !amount) {
      return res.status(400).json({ error: 'Feature and amount required' });
    }

    const numAmount = Number(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      return res.status(400).json({ error: 'Amount must be positive' });
    }

    // Idempotency check
    if (idempotency_key) {
      const [[existing]] = await conn.query(
        'SELECT id FROM 1ai_wallet_spending WHERE user_id = ? AND metadata->>"$.idempotency_key" = ?',
        [userId, idempotency_key]
      );
      if (existing) {
        return res.json({ success: true, idempotent: true, message: 'Already processed' });
      }
    }

    await conn.beginTransaction();

    // Lock balance row
    const [[balRow]] = await conn.query(
      `SELECT
        COALESCE(SUM(CASE WHEN type = 'deposit' OR type = 'adjustment' THEN amount ELSE 0 END), 0) -
        COALESCE(SUM(CASE WHEN type = 'withdrawal' THEN ABS(amount) ELSE 0 END), 0) -
        COALESCE(SUM(CASE WHEN type = 'spend' THEN ABS(amount) ELSE 0 END), 0) AS balance
       FROM 1ai_balance_ledger WHERE user_id = ? FOR UPDATE`,
      [userId]
    );

    const balance = Number(balRow.balance);
    if (balance < numAmount) {
      await conn.rollback();
      return res.status(402).json({
        error: 'Insufficient balance',
        required: numAmount,
        available: balance,
      });
    }

    // Insert spending ledger entry
    await conn.query(
      'INSERT INTO 1ai_balance_ledger (user_id, amount, type, note, created_at) VALUES (?, ?, ?, ?, UNIX_TIMESTAMP())',
      [userId, -numAmount, 'spend', description || `${feature}: ${feature_id || 'unknown'}`]
    );

    // Insert spending log
    await conn.query(
      `INSERT INTO 1ai_wallet_spending (user_id, feature, feature_id, amount, description, metadata, created_at)
       VALUES (?, ?, ?, ?, ?, ?, UNIX_TIMESTAMP())`,
      [userId, feature, feature_id || null, numAmount, description || null, JSON.stringify({ ...(metadata || {}), idempotency_key })]
    );

    await conn.commit();

    const newBalance = balance - numAmount;
    res.json({ success: true, deducted: numAmount, remaining: newBalance });
  } catch (err) {
    await conn.rollback();
    console.error('Wallet spend error:', err.message);
    res.status(500).json({ error: 'Failed to process spending' });
  } finally {
    conn.release();
  }
});

module.exports = router;
