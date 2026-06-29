'use strict';

const express = require('express');
const router = express.Router();
const { authenticate, requireAdmin } = require('../middleware/auth');
const pool = require('../db/mysql');
const settings = require('../services/settingsService');

router.use(authenticate);
router.use(requireAdmin);

// ── GET /api/admin/finance/overview ──────────────────────────────
router.get('/overview', async (req, res) => {
  try {
    const [[deposits]] = await pool.query(
      "SELECT COALESCE(SUM(amount), 0) AS total FROM 1ai_balance_ledger WHERE type = 'deposit'"
    );
    const [[withdrawals]] = await pool.query(
      "SELECT COALESCE(SUM(ABS(amount)), 0) AS total FROM 1ai_balance_ledger WHERE type = 'withdrawal'"
    );
    const [[spending]] = await pool.query(
      "SELECT COALESCE(SUM(ABS(amount)), 0) AS total FROM 1ai_balance_ledger WHERE type = 'spend'"
    );
    const [[adjustments]] = await pool.query(
      "SELECT COALESCE(SUM(amount), 0) AS total FROM 1ai_balance_ledger WHERE type = 'adjustment'"
    );

    const [[earnings]] = await pool.query(
      "SELECT COALESCE(SUM(payout_amount), 0) AS total FROM 1ai_affiliate_earnings"
    );
    const [[pendingEarnings]] = await pool.query(
      "SELECT COALESCE(SUM(payout_amount), 0) AS total FROM 1ai_affiliate_earnings WHERE status IN ('pending','approved')"
    );

    res.json({
      data: {
        deposits: Number(deposits.total),
        withdrawals: Number(withdrawals.total),
        spending: Number(spending.total),
        adjustments: Number(adjustments.total),
        net_revenue: Number(deposits.total) - Number(withdrawals.total) - Number(spending.total) + Number(adjustments.total),
        total_earnings: Number(earnings.total),
        pending_earnings: Number(pendingEarnings.total),
      },
    });
  } catch (err) {
    console.error('Finance overview error:', err.message);
    res.status(500).json({ error: 'Failed to fetch finance overview' });
  }
});

// ── GET /api/admin/finance/users ─────────────────────────────────
router.get('/users', async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(Math.max(1, parseInt(req.query.limit) || 50), 200);
    const offset = (page - 1) * limit;
    const search = req.query.search || '';
    const role = req.query.role || '';

    let where = 'WHERE 1=1';
    const params = [];
    if (search) {
      where += ' AND (u.user_email LIKE ? OR u.user_name LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }
    if (role && ['admin', 'affiliate', 'advertiser'].includes(role)) {
      where += ' AND u.user_role = ?';
      params.push(role);
    }

    const [[{ total }]] = await pool.query(
      `SELECT COUNT(*) AS total FROM 1ai_users u ${where}`,
      params
    );

    const [users] = await pool.query(
      `SELECT u.user_id, u.user_email, u.user_name, u.user_role,
              COALESCE(bl.deposits, 0) AS deposits,
              COALESCE(bl.withdrawals, 0) AS withdrawals,
              COALESCE(bl.spending, 0) AS spending,
              COALESCE(bl.deposits, 0) - COALESCE(bl.withdrawals, 0) - COALESCE(bl.spending, 0) AS balance
       FROM 1ai_users u
       LEFT JOIN (
         SELECT user_id,
           SUM(CASE WHEN type = 'deposit' OR type = 'adjustment' THEN amount ELSE 0 END) AS deposits,
           SUM(CASE WHEN type = 'withdrawal' THEN ABS(amount) ELSE 0 END) AS withdrawals,
           SUM(CASE WHEN type = 'spend' THEN ABS(amount) ELSE 0 END) AS spending
         FROM 1ai_balance_ledger GROUP BY user_id
       ) bl ON bl.user_id = u.user_id
       ${where}
       ORDER BY balance DESC
       LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    res.json({ data: users, page, limit, total, pages: Math.ceil(total / limit) });
  } catch (err) {
    console.error('Finance users error:', err.message);
    res.status(500).json({ error: 'Failed to fetch user finances' });
  }
});

// ── POST /api/admin/finance/credit ───────────────────────────────
router.post('/credit', async (req, res) => {
  try {
    const { user_id, amount, note } = req.body;
    if (!user_id || !amount) return res.status(400).json({ error: 'user_id and amount required' });
    const numAmount = Number(amount);
    if (isNaN(numAmount) || numAmount <= 0) return res.status(400).json({ error: 'Amount must be positive' });

    await pool.query(
      'INSERT INTO 1ai_balance_ledger (user_id, amount, type, note, created_at) VALUES (?, ?, ?, ?, UNIX_TIMESTAMP())',
      [user_id, numAmount, 'adjustment', note || `Manual credit by admin #${req.user.id}`]
    );

    res.json({ success: true, credited: numAmount });
  } catch (err) {
    console.error('Credit error:', err.message);
    res.status(500).json({ error: 'Failed to credit balance' });
  }
});

// ── POST /api/admin/finance/debit ────────────────────────────────
router.post('/debit', async (req, res) => {
  try {
    const { user_id, amount, note } = req.body;
    if (!user_id || !amount) return res.status(400).json({ error: 'user_id and amount required' });
    const numAmount = Number(amount);
    if (isNaN(numAmount) || numAmount <= 0) return res.status(400).json({ error: 'Amount must be positive' });

    await pool.query(
      'INSERT INTO 1ai_balance_ledger (user_id, amount, type, note, created_at) VALUES (?, ?, ?, ?, UNIX_TIMESTAMP())',
      [user_id, -numAmount, 'adjustment', note || `Manual debit by admin #${req.user.id}`]
    );

    res.json({ success: true, debited: numAmount });
  } catch (err) {
    console.error('Debit error:', err.message);
    res.status(500).json({ error: 'Failed to debit balance' });
  }
});

// ── GET /api/admin/finance/pricing ───────────────────────────────
router.get('/pricing', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM 1ai_feature_pricing ORDER BY feature_key');
    res.json({ data: rows });
  } catch (err) {
    res.json({ data: [] });
  }
});

// ── PUT /api/admin/finance/pricing ───────────────────────────────
router.put('/pricing', async (req, res) => {
  try {
    const { feature_key, price, unit, description } = req.body;
    if (!feature_key || price === undefined) return res.status(400).json({ error: 'feature_key and price required' });

    await pool.query(
      `INSERT INTO 1ai_feature_pricing (feature_key, price, currency, unit, description, updated_at, updated_by)
       VALUES (?, ?, 'IDR', ?, ?, UNIX_TIMESTAMP(), ?)
       ON DUPLICATE KEY UPDATE price = VALUES(price), unit = COALESCE(VALUES(unit), unit), description = COALESCE(VALUES(description), description), updated_at = VALUES(updated_at), updated_by = VALUES(updated_by)`,
      [feature_key, Number(price), unit || null, description || null, req.user.id]
    );

    res.json({ success: true });
  } catch (err) {
    console.error('Pricing update error:', err.message);
    res.status(500).json({ error: 'Failed to update pricing' });
  }
});

// ── GET /api/admin/finance/exchange-rate ─────────────────────────
router.get('/exchange-rate', async (req, res) => {
  try {
    const rate = Number(await settings.get('wallet_usd_idr_rate')) || 15500;
    const source = await settings.get('wallet_rate_source') || 'manual';
    const minUsd = Number(await settings.get('wallet_min_topup_usd')) || 10;

    let dbRate = null;
    try {
      const [[row]] = await pool.query("SELECT * FROM 1ai_exchange_rates WHERE currency_pair = 'USD_IDR'");
      if (row) dbRate = row;
    } catch (_) {}

    res.json({
      data: {
        currency_pair: 'USD_IDR',
        rate,
        source,
        min_topup_usd: minUsd,
        min_topup_idr: minUsd * rate,
        db_rate: dbRate,
      },
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch exchange rate' });
  }
});

// ── POST /api/admin/finance/exchange-rate ────────────────────────
router.post('/exchange-rate', async (req, res) => {
  try {
    const { rate, source, min_topup_usd } = req.body;

    if (rate !== undefined) {
      await settings.set('wallet_usd_idr_rate', String(rate));
      try {
        await pool.query(
          `INSERT INTO 1ai_exchange_rates (currency_pair, rate, source, fetched_at, updated_at)
           VALUES ('USD_IDR', ?, 'manual', UNIX_TIMESTAMP(), UNIX_TIMESTAMP())
           ON DUPLICATE KEY UPDATE rate = VALUES(rate), source = 'manual', updated_at = VALUES(updated_at)`,
          [Number(rate)]
        );
      } catch (_) {}
    }

    if (source) await settings.set('wallet_rate_source', source);
    if (min_topup_usd !== undefined) await settings.set('wallet_min_topup_usd', String(min_topup_usd));

    res.json({ success: true });
  } catch (err) {
    console.error('Exchange rate update error:', err.message);
    res.status(500).json({ error: 'Failed to update exchange rate' });
  }
});

// ── GET /api/admin/finance/boost-orders ──────────────────────────
router.get('/boost-orders', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT bo.*, u.user_email, u.user_name
       FROM 1ai_boost_orders bo
       LEFT JOIN 1ai_users u ON u.user_id = bo.user_id
       ORDER BY bo.created_at DESC LIMIT 100`
    );
    res.json({ data: rows });
  } catch (err) {
    res.json({ data: [] });
  }
});
// ── GET /api/admin/finance/networks ─────────────────────────────
router.get('/networks', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT id, name, status, api_base_url, documentation_url, last_synced_at,
              (SELECT COUNT(*) FROM 1ai_offers WHERE network_id = 1ai_networks.id) as offer_count
       FROM 1ai_networks ORDER BY id`
    );
    res.json({ data: rows });
  } catch (err) {
    res.json({ data: [] });
  }
});

// ── POST /api/admin/finance/networks/:id/sync ───────────────────
router.post('/networks/:id/sync', async (req, res) => {
  try {
    const { syncNetworkOffers } = require('../services/networkSyncService');
    const result = await syncNetworkOffers(parseInt(req.params.id));
    res.json({ data: result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── POST /api/admin/finance/networks/sync-all ───────────────────
router.post('/networks/sync-all', async (req, res) => {
  try {
    const { syncAllNetworks } = require('../services/networkSyncService');
    const results = await syncAllNetworks();
    res.json({ data: results });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
