'use strict';

const express = require('express');
const router  = express.Router();
const { authenticate } = require('../middleware/auth');
const pool = require('../db/mysql');

router.use(authenticate);

// ── GET /api/boost/orders ─────────────────────────────────────────
router.get('/orders', async (req, res) => {
  try {
    const userId = req.user.id;
    const page   = Math.max(1, parseInt(req.query.page) || 1);
    const limit  = Math.min(Math.max(1, parseInt(req.query.limit) || 20), 100);
    const offset = (page - 1) * limit;

    const [[{ total }]] = await pool.query(
      'SELECT COUNT(*) AS total FROM 1ai_boost_orders WHERE user_id = ?', [userId]
    );
    const [rows] = await pool.query(
      `SELECT bo.*, o.name AS offer_name
       FROM 1ai_boost_orders bo
       LEFT JOIN 1ai_offers o ON o.id = bo.offer_id
       WHERE bo.user_id = ?
       ORDER BY bo.created_at DESC LIMIT ? OFFSET ?`,
      [userId, limit, offset]
    );

    res.json({ data: rows, page, limit, total, pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch boost orders' });
  }
});

// ── GET /api/boost/orders/:id ─────────────────────────────────────
router.get('/orders/:id', async (req, res) => {
  try {
    const [[order]] = await pool.query(
      `SELECT bo.*, o.name AS offer_name
       FROM 1ai_boost_orders bo
       LEFT JOIN 1ai_offers o ON o.id = bo.offer_id
       WHERE bo.id = ? AND bo.user_id = ?`,
      [req.params.id, req.user.id]
    );
    if (!order) return res.status(404).json({ error: 'Order not found' });
    res.json({ data: order });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch boost order' });
  }
});

// ── POST /api/boost/orders ────────────────────────────────────────
router.post('/orders', async (req, res) => {
  const conn = await pool.getConnection();
  try {
    const { offer_id, fanpage_count, post_content, target_url, post_images } = req.body;
    const userId = req.user.id;

    if (!fanpage_count || fanpage_count < 1) {
      return res.status(400).json({ error: 'fanpage_count must be >= 1' });
    }

    // Get price per fanpage from feature pricing
    const [[pricingRow]] = await pool.query(
      "SELECT price FROM 1ai_feature_pricing WHERE feature_key = 'boost_per_fp'"
    );
    const costPerFp = pricingRow ? Number(pricingRow.price) : 100;
    const totalCost = costPerFp * Number(fanpage_count);

    await conn.beginTransaction();

    // Check balance
    const [[balRow]] = await conn.query(
      `SELECT COALESCE(SUM(CASE WHEN type='deposit' OR type='adjustment' THEN amount ELSE 0 END), 0)
            - COALESCE(SUM(CASE WHEN type='withdrawal' THEN ABS(amount) ELSE 0 END), 0)
            - COALESCE(SUM(CASE WHEN type='spend' THEN ABS(amount) ELSE 0 END), 0) AS balance
       FROM 1ai_balance_ledger WHERE user_id = ? FOR UPDATE`,
      [userId]
    );
    const balance = Number(balRow.balance);
    if (balance < totalCost) {
      await conn.rollback();
      return res.status(402).json({ error: 'Insufficient balance', required: totalCost, available: balance });
    }

    // Create boost order
    const [result] = await conn.query(
      `INSERT INTO 1ai_boost_orders
         (user_id, offer_id, status, fanpage_count, post_content, post_images, target_url, cost_per_fanpage, total_cost, created_at)
       VALUES (?, ?, 'pending', ?, ?, ?, ?, ?, ?, UNIX_TIMESTAMP())`,
      [userId, offer_id || null, fanpage_count, post_content || null,
       JSON.stringify(post_images || []), target_url || null, costPerFp, totalCost]
    );

    // Deduct from wallet
    await conn.query(
      'INSERT INTO 1ai_balance_ledger (user_id, amount, type, note, created_at) VALUES (?, ?, ?, ?, UNIX_TIMESTAMP())',
      [userId, -totalCost, 'spend', `Boost order #${result.insertId} — ${fanpage_count} fanpages`]
    );
    await conn.query(
      `INSERT INTO 1ai_wallet_spending (user_id, feature, feature_id, amount, description, created_at)
       VALUES (?, 'boost', ?, ?, ?, UNIX_TIMESTAMP())`,
      [userId, String(result.insertId), totalCost, `Boost order #${result.insertId}`]
    );

    await conn.commit();

    res.status(201).json({
      data: { id: result.insertId, total_cost: totalCost, fanpage_count, status: 'pending' }
    });
  } catch (err) {
    await conn.rollback();
    console.error('Boost order error:', err.message);
    res.status(500).json({ error: 'Failed to create boost order' });
  } finally {
    conn.release();
  }
});

// ── POST /api/boost/orders/:id/cancel ────────────────────────────
router.post('/orders/:id/cancel', async (req, res) => {
  const conn = await pool.getConnection();
  try {
    const userId = req.user.id;
    const [[order]] = await conn.query(
      "SELECT * FROM 1ai_boost_orders WHERE id = ? AND user_id = ? AND status = 'pending'",
      [req.params.id, userId]
    );
    if (!order) return res.status(404).json({ error: 'Order not found or not cancellable' });

    await conn.beginTransaction();

    // Cancel order
    await conn.query(
      "UPDATE 1ai_boost_orders SET status = 'cancelled' WHERE id = ?", [order.id]
    );

    // Refund to wallet
    const refund = Number(order.total_cost);
    if (refund > 0) {
      await conn.query(
        'INSERT INTO 1ai_balance_ledger (user_id, amount, type, note, created_at) VALUES (?, ?, ?, ?, UNIX_TIMESTAMP())',
        [userId, refund, 'adjustment', `Refund: Boost order #${order.id} cancelled`]
      );
    }

    await conn.commit();
    res.json({ success: true, refunded: refund });
  } catch (err) {
    await conn.rollback();
    res.status(500).json({ error: 'Failed to cancel boost order' });
  } finally {
    conn.release();
  }
});

module.exports = router;
