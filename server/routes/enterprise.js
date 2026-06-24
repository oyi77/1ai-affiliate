'use strict';

const express = require('express');
const router = express.Router();
const pool = require('../db/mysql');
const { authenticate, requireAdmin } = require('../middleware/auth');
const crypto = require('crypto');

router.use(authenticate);
router.use(requireAdmin);

// ── A/B Tests ──────────────────────────────────────────────────────
router.get('/ab-tests', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM 1ai_ab_tests ORDER BY id DESC');
    for (const r of rows) {
      if (typeof r.variants === 'string') { try { r.variants = JSON.parse(r.variants); } catch {} }
    }
    res.json({ data: rows });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/ab-tests', async (req, res) => {
  try {
    const { name, offer_id, variants, status } = req.body;
    if (!name) return res.status(400).json({ error: 'name required' });
    const now = Math.floor(Date.now() / 1000);
    const [result] = await pool.query(
      `INSERT INTO 1ai_ab_tests (name, offer_id, variants, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)`,
      [name, offer_id || null, JSON.stringify(variants || []), status || 'active', now, now]
    );
    res.status(201).json({ id: result.insertId });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── API Keys ───────────────────────────────────────────────────────
router.get('/api-keys', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT k.id, k.api_key, k.user_id, k.scope, k.created_at, u.user_name, u.user_email
       FROM 1ai_api_keys k LEFT JOIN 1ai_users u ON k.user_id = u.user_id ORDER BY k.id DESC`
    );
    res.json({ data: rows });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/api-keys', async (req, res) => {
  try {
    const { user_id, scope } = req.body;
    if (!user_id) return res.status(400).json({ error: 'user_id required' });
    const apiKey = crypto.randomBytes(32).toString('hex');
    const [result] = await pool.query(
      `INSERT INTO 1ai_api_keys (api_key, user_id, scope, created_at) VALUES (?, ?, ?, UNIX_TIMESTAMP())`,
      [apiKey, user_id, scope || '[*]']
    );
    res.status(201).json({ id: result.insertId, api_key: apiKey });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/api-keys/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM 1ai_api_keys WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── Scheduled Exports ──────────────────────────────────────────────
router.get('/scheduled-exports', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM 1ai_scheduled_exports ORDER BY id DESC');
    res.json({ data: rows });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/scheduled-exports', async (req, res) => {
  try {
    const { name, report_type, schedule, format, recipients } = req.body;
    if (!name) return res.status(400).json({ error: 'name required' });
    const now = Math.floor(Date.now() / 1000);
    const [result] = await pool.query(
      `INSERT INTO 1ai_scheduled_exports (user_id, name, report_type, schedule, format, recipients, enabled, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, 1, ?, ?)`,
      [req.user.id, name, report_type || 'summary', schedule || 'daily', format || 'csv', JSON.stringify(recipients || []), now, now]
    );
    res.status(201).json({ id: result.insertId });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/scheduled-exports/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM 1ai_scheduled_exports WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── White Label ────────────────────────────────────────────────────
router.get('/white-label', async (req, res) => {
  try {
    const [[row]] = await pool.query('SELECT * FROM 1ai_white_label WHERE user_id = ?', [req.user.id]);
    res.json({ data: row || { logo_url: null, brand_name: null, custom_domain: null } });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/white-label', async (req, res) => {
  try {
    const { logo_url, brand_name, custom_domain, primary_color } = req.body;
    const now = Math.floor(Date.now() / 1000);
    await pool.query(
      `INSERT INTO 1ai_white_label (user_id, logo_url, brand_name, custom_domain, primary_color, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE logo_url = VALUES(logo_url), brand_name = VALUES(brand_name), custom_domain = VALUES(custom_domain), primary_color = VALUES(primary_color), updated_at = VALUES(updated_at)`,
      [req.user.id, logo_url || null, brand_name || null, custom_domain || null, primary_color || '#6366f1', now, now]
    );
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
