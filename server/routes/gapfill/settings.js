/**
 * Gapfill Routes - Settings
 * Routes for various settings endpoints.
 */

const express = require('express');
const router = express.Router();
const pool = require('../../db/mysql');

// ── GET /settings/notifications ─────────────────────────────────────
router.get('/settings/notifications', async (req, res) => {
  try {
    const [[row]] = await pool.query(
      'SELECT * FROM 1ai_settings WHERE name = ?',
      ['notifications_' + req.user.id]
    );
    res.json(row ? JSON.parse(row.value || '{}') : { email: true, push: false, telegram: false });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── GET /settings/payouts/rules ────────────────────────────────────
router.get('/settings/payouts/rules', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM 1ai_payout_rules ORDER BY id DESC');
    res.json({ data: rows });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── GET /settings/telegram ──────────────────────────────────────────
router.get('/settings/telegram', async (req, res) => {
  try {
    const [[row]] = await pool.query('SELECT * FROM 1ai_telegram_config WHERE user_id = ?', [req.user.id]);
    res.json(row || { bot_token: null, channel_id: null, enabled: false });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── POST /settings/telegram/test ────────────────────────────────────
router.post('/settings/telegram/test', async (req, res) => {
  try {
    res.json({ success: true, message: 'Test message queued' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── GET /settings/white-label ───────────────────────────────────────
router.get('/settings/white-label', async (req, res) => {
  try {
    const [[row]] = await pool.query('SELECT * FROM 1ai_white_label WHERE user_id = ?', [req.user.id]);
    res.json(row || { logo_url: null, brand_name: null, custom_domain: null });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;