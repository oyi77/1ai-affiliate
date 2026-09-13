/**
 * Gapfill Routes - Day Parting & Webhooks
 * Routes for day-parting configuration and webhooks management.
 */

const express = require('express');
const router = express.Router();
const pool = require('../../db/mysql');

// ── GET /day-parting ──────────────────────────────────────────────────
router.get('/day-parting', async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT value FROM 1ai_settings WHERE name = 'day_parting' LIMIT 1"
    );
    const config = rows.length ? JSON.parse(rows[0].value) : {};
    res.json({ data: config });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch day-parting config', detail: err.message });
  }
});

// ── PUT /day-parting ──────────────────────────────────────────────────
router.put('/day-parting', async (req, res) => {
  try {
    const value = JSON.stringify(req.body);
    await pool.query(
      `INSERT INTO 1ai_settings (name, value)
       VALUES ('day_parting', ?)
       ON DUPLICATE KEY UPDATE value = VALUES(value)`,
      [value]
    );
    res.json({ data: req.body });
  } catch (err) {
    res.status(500).json({ error: 'Failed to save day-parting config', detail: err.message });
  }
});

// ── GET /webhooks ─────────────────────────────────────────────────────
router.get('/webhooks', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM 1ai_webhooks ORDER BY id DESC'
    );
    res.json({ data: rows });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch webhooks', detail: err.message });
  }
});

// ── POST /webhooks ────────────────────────────────────────────────────
router.post('/webhooks', async (req, res) => {
  try {
    const [result] = await pool.query(
      'INSERT INTO 1ai_webhooks SET ?', [req.body]
    );
    res.status(201).json({ data: { id: result.insertId, ...req.body } });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create webhook', detail: err.message });
  }
});

// ── PUT /webhooks/:id ─────────────────────────────────────────────────
router.put('/webhooks/:id', async (req, res) => {
  try {
    const [result] = await pool.query(
      'UPDATE 1ai_webhooks SET ? WHERE id = ?', [req.body, req.params.id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Webhook not found' });
    res.json({ data: { id: Number(req.params.id), ...req.body } });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update webhook', detail: err.message });
  }
});

// ── DELETE /webhooks/:id ──────────────────────────────────────────────
router.delete('/webhooks/:id', async (req, res) => {
  try {
    const [result] = await pool.query(
      'DELETE FROM 1ai_webhooks WHERE id = ?', [req.params.id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Webhook not found' });
    res.json({ data: { deleted: true } });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete webhook', detail: err.message });
  }
});

module.exports = router;