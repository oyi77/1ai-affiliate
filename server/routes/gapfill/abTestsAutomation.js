/**
 * Gapfill Routes - AB Tests & Automation
 * Routes for AB tests and automation rules.
 */

const express = require('express');
const router = express.Router();
const pool = require('../../db/mysql');

// ── GET /ab-tests ─────────────────────────────────────────────────────
router.get('/ab-tests', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM 1ai_ab_tests ORDER BY id DESC'
    );
    res.json({ data: rows });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch AB tests', detail: err.message });
  }
});

// ── POST /ab-tests ────────────────────────────────────────────────────
router.post('/ab-tests', async (req, res) => {
  try {
    const [result] = await pool.query(
      'INSERT INTO 1ai_ab_tests SET ?', [req.body]
    );
    res.status(201).json({ data: { id: result.insertId, ...req.body } });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create AB test', detail: err.message });
  }
});

// ── GET /automation ───────────────────────────────────────────────────
router.get('/automation', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM 1ai_automation_rules ORDER BY id DESC'
    );
    res.json({ data: rows });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch automation rules', detail: err.message });
  }
});

// ── POST /automation ──────────────────────────────────────────────────
router.post('/automation', async (req, res) => {
  try {
    const [result] = await pool.query(
      'INSERT INTO 1ai_automation_rules SET ?', [req.body]
    );
    res.status(201).json({ data: { id: result.insertId, ...req.body } });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create automation rule', detail: err.message });
  }
});

// ── PUT /automation/:id ───────────────────────────────────────────────
router.put('/automation/:id', async (req, res) => {
  try {
    const [result] = await pool.query(
      'UPDATE 1ai_automation_rules SET ? WHERE id = ?', [req.body, req.params.id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Rule not found' });
    res.json({ data: { id: Number(req.params.id), ...req.body } });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update automation rule', detail: err.message });
  }
});

module.exports = router;