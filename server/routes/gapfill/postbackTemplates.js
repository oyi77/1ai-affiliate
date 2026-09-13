/**
 * Gapfill Routes - Postback Templates
 * CRUD routes for postback templates with preview and test functionality.
 */

const express = require('express');
const router = express.Router();
const pool = require('../../db/mysql');

const { substitutePostbackMacros } = require('./helpers');

// ── GET /postback-templates ───────────────────────────────────────────
router.get('/postback-templates', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM 1ai_postback_templates ORDER BY id DESC'
    );
    res.json({ data: rows });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch postback templates', detail: err.message });
  }
});

// ── POST /postback-templates ──────────────────────────────────────────
router.post('/postback-templates', async (req, res) => {
  try {
    const [result] = await pool.query(
      'INSERT INTO 1ai_postback_templates SET ?', [req.body]
    );
    res.status(201).json({ data: { id: result.insertId, ...req.body } });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create postback template', detail: err.message });
  }
});

// ── PUT /postback-templates/:id ───────────────────────────────────────
router.put('/postback-templates/:id', async (req, res) => {
  try {
    const [result] = await pool.query(
      'UPDATE 1ai_postback_templates SET ? WHERE id = ?', [req.body, req.params.id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Template not found' });
    res.json({ data: { id: Number(req.params.id), ...req.body } });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update postback template', detail: err.message });
  }
});

// ── DELETE /postback-templates/:id ────────────────────────────────────
router.delete('/postback-templates/:id', async (req, res) => {
  try {
    const [result] = await pool.query(
      'DELETE FROM 1ai_postback_templates WHERE id = ?', [req.params.id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Template not found' });
    res.json({ data: { deleted: true } });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete postback template', detail: err.message });
  }
});

// ── GET /postback-templates/:id/preview ─────────────────────────────
router.get('/postback-templates/:id/preview', async (req, res) => {
  try {
    const [[template]] = await pool.query(
      'SELECT * FROM 1ai_postback_templates WHERE id = ?', [req.params.id]
    );
    if (!template) return res.status(404).json({ error: 'Template not found' });
    const sampleData = {
      click_id: 'abc123',
      payout: '10.00',
      status: 'approved',
      transaction_id: 'txn_001',
      sub_id: 'sub_01',
      offer_id: '1'
    };
    const macros = template.macros ? (typeof template.macros === 'string' ? JSON.parse(template.macros) : template.macros) : {};
    const mergedData = { ...sampleData, ...macros };
    const previewUrl = substitutePostbackMacros(template.url_template, mergedData);
    res.json({ data: { ...template, preview_url: previewUrl, sample_data: mergedData } });
  } catch (err) {
    res.status(500).json({ error: 'Failed to preview postback template', detail: err.message });
  }
});

// ── POST /postback-templates/:id/test ──────────────────────────────
router.post('/postback-templates/:id/test', async (req, res) => {
  try {
    const [[template]] = await pool.query(
      'SELECT * FROM 1ai_postback_templates WHERE id = ?', [req.params.id]
    );
    if (!template) return res.status(404).json({ error: 'Template not found' });
    const testData = req.body.data || {
      click_id: 'test_click',
      payout: '1.00',
      status: 'approved',
      transaction_id: 'test_txn',
      sub_id: 'test_sub',
      offer_id: '0'
    };
    const macros = template.macros ? (typeof template.macros === 'string' ? JSON.parse(template.macros) : template.macros) : {};
    const mergedData = { ...macros, ...testData };
    const url = substitutePostbackMacros(template.url_template, mergedData);
    const method = (template.method || 'GET').toUpperCase();
    const headers = template.headers ? (typeof template.headers === 'string' ? JSON.parse(template.headers) : template.headers) : {};
    const fetchOptions = { method, headers: { 'User-Agent': '1ai-postback-test', ...headers } };
    if (method === 'POST' && req.body.payload) {
      fetchOptions.headers['Content-Type'] = 'application/json';
      fetchOptions.body = JSON.stringify(req.body.payload);
    }
    const response = await fetch(url, fetchOptions);
    const responseBody = await response.text();
    res.json({
      data: {
        url,
        method,
        status: response.status,
        response_body: responseBody.substring(0, 2000),
        sent_data: mergedData
      }
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to test postback', detail: err.message });
  }
});

module.exports = router;