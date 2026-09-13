/**
 * Gapfill Routes - Advertisers, Clicks, Notifications & Stats
 * Routes for saldo-budget, advertisers, clicks, conversions/manual, notifications, shopee-accounts, stats/daily.
 */

const express = require('express');
const router = express.Router();
const pool = require('../../db/mysql');

// ── GET /saldo-budget ─────────────────────────────────────────────────
router.get('/saldo-budget', async (req, res) => {
  try {
    const userId = req.user.id;
    const [rows] = await pool.query(
      'SELECT * FROM 1ai_balance_ledger WHERE user_id = ? ORDER BY created_at DESC',
      [userId]
    );
    const balance = rows.reduce((sum, r) => sum + Number(r.amount || 0), 0);
    res.json({ data: { balance, transactions: rows } });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch saldo/budget', detail: err.message });
  }
});

// ── GET /advertisers ────────────────────────────────────────────────
router.get('/advertisers', async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 50, 500);
    const [rows] = await pool.query(
      `SELECT a.*, u.user_email, u.user_name FROM 1ai_advertisers a
       LEFT JOIN 1ai_users u ON u.user_id = a.user_id
       ORDER BY a.id DESC LIMIT ?`, [limit]
    );
    res.json({ data: rows });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── GET /clicks ─────────────────────────────────────────────────────
router.get('/clicks', async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(parseInt(req.query.limit) || 50, 1000);
    const offset = (page - 1) * limit;

    const [[{ total }]] = await pool.query(
      'SELECT COUNT(*) AS total FROM 1ai_click_log'
    );

    const [rows] = await pool.query(
      `SELECT cl.id, cl.click_id, cl.offer_id, o.name AS offer_name,
              cl.affiliate_id, cl.country_code, cl.device_type,
              cl.payout, cl.converted, cl.clicked_at
       FROM 1ai_click_log cl
       LEFT JOIN 1ai_offers o ON cl.offer_id = o.id
       ORDER BY cl.clicked_at DESC
       LIMIT ? OFFSET ?`,
      [limit, offset]
    );

    res.json({ data: rows, page, limit, total, pages: Math.ceil(total / limit) });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── POST /conversions/manual ────────────────────────────────────────
router.post('/conversions/manual', async (req, res) => {
  try {
    const { click_id, offer_id, payout } = req.body;
    if (!click_id || !offer_id) return res.status(400).json({ error: 'click_id and offer_id required' });
    const [result] = await pool.query(
      'INSERT INTO 1ai_conversion_logs (click_id, aff_campaign_id, conversion_time) VALUES (?, ?, UNIX_TIMESTAMP())',
      [click_id, offer_id]
    );
    res.json({ success: true, id: result.insertId });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── GET /notifications ──────────────────────────────────────────────
router.get('/notifications', async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 50, 200);
    const [rows] = await pool.query(
      `SELECT * FROM 1ai_notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT ?`,
      [req.user.id, limit]
    );
    res.json({ data: rows });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── POST /notifications/read-all ────────────────────────────────────
router.post('/notifications/read-all', async (req, res) => {
  try {
    await pool.query('UPDATE 1ai_notifications SET read_at = UNIX_TIMESTAMP() WHERE user_id = ?', [req.user.id]);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── GET /shopee-accounts ────────────────────────────────────────────
router.get('/shopee-accounts', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM 1ai_shopee_reports ORDER BY id DESC LIMIT 50');
    res.json({ data: rows });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── GET /stats/daily ────────────────────────────────────────────────
router.get('/stats/daily', async (req, res) => {
  try {
    const range = req.query.range || '30d';
    const days = parseInt(range) || 30;
    const cutoff = Math.floor(Date.now() / 1000) - days * 86400;
    const [rows] = await pool.query(
      `SELECT DATE(FROM_UNIXTIME(click_time)) as date,
              COUNT(*) as clicks,
              SUM(click_payout) as revenue
       FROM 1ai_clicks WHERE click_time >= ? GROUP BY date ORDER BY date DESC`,
      [cutoff]
    );
    res.json({ data: rows });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;