'use strict';

const C = require('../utils/constants');
const express = require('express');
const router = express.Router();
const { authenticate, requireAdmin } = require('../middleware/auth');
const { asyncHandler } = require('../utils/asyncHandler');
const { success } = require('../utils/apiResponse');
const pool = require('../db/mysql');

router.use(authenticate);

// ── White-Label ───────────────────────────────────────────────────────

const whiteLabel = require('../services/whiteLabelService');

router.get('/white-label', asyncHandler(async (req, res) => {
  const branding = await whiteLabel.getBranding(req.user.id);
  success(res, { data: branding });
}));

router.put('/white-label', asyncHandler(async (req, res) => {
  await whiteLabel.setBranding(req.user.id, req.body);
  success(res, { success: true });
}));

// ── API Keys ─────────────────────────────────────────────────────────

const apiKeyService = require('../services/apiKeyService');

router.get('/api-keys', asyncHandler(async (req, res) => {
  const keys = await apiKeyService.listKeys(req.user.id);
  success(res, { data: keys });
}));

router.post('/api-keys', asyncHandler(async (req, res) => {
  const { name, scopes, expires_in_days } = req.body;
  if (!name) return res.status(400).json({ error: 'name required' });
  const expiresAt = expires_in_days ? Math.floor(Date.now() / 1000) + (expires_in_days * C.TIME.DAY) : null;
  const result = await apiKeyService.createKey(req.user.id, name, scopes, expiresAt);
  success(res, { data: result });
}));

router.delete('/api-keys/:id', asyncHandler(async (req, res) => {
  await apiKeyService.revokeKey(req.user.id, parseInt(req.params.id));
  success(res, { success: true });
}));

// ── A/B Tests ─────────────────────────────────────────────────────────

const abTest = require('../services/abTestService');

router.get('/ab-tests', requireAdmin, asyncHandler(async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM 1ai_ab_tests ORDER BY created_at DESC LIMIT 50');
  success(res, { data: rows });
}));

router.post('/ab-tests', requireAdmin, asyncHandler(async (req, res) => {
  const { campaign_id, name, variants } = req.body;
  if (!campaign_id || !name || !variants) return res.status(400).json({ error: 'campaign_id, name, variants required' });
  const now = Math.floor(Date.now() / 1000);
  const [result] = await pool.query(
    'INSERT INTO 1ai_ab_tests (campaign_id, name, variants, created_at, updated_at) VALUES (?, ?, ?, ?, ?)',
    [campaign_id, name, JSON.stringify(variants), now, now]
  );
  success(res, { id: result.insertId });
}));

router.get('/ab-tests/:id/results', requireAdmin, asyncHandler(async (req, res) => {
  const results = await abTest.getResults(parseInt(req.params.id));
  success(res, { data: results });
}));

// ── Scheduled Exports ─────────────────────────────────────────────────

router.get('/scheduled-exports', asyncHandler(async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM 1ai_scheduled_exports WHERE user_id = ? ORDER BY created_at DESC', [req.user.id]);
  success(res, { data: rows });
}));

router.post('/scheduled-exports', asyncHandler(async (req, res) => {
  const { name, report_type, filters, schedule, format, email_to } = req.body;
  if (!name || !report_type) return res.status(400).json({ error: 'name and report_type required' });
  const now = Math.floor(Date.now() / 1000);
  const [result] = await pool.query(
    'INSERT INTO 1ai_scheduled_exports (user_id, name, report_type, filters, schedule, format, email_to, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    [req.user.id, name, report_type, JSON.stringify(filters || {}), schedule || 'daily', format || 'csv', email_to, now]
  );
  success(res, { id: result.insertId });
}));

router.delete('/scheduled-exports/:id', asyncHandler(async (req, res) => {
  await pool.query('DELETE FROM 1ai_scheduled_exports WHERE id = ? AND user_id = ?', [parseInt(req.params.id), req.user.id]);
  success(res, { success: true });
}));

// ── Postback Templates ────────────────────────────────────────────────

router.get('/postback-templates', asyncHandler(async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM 1ai_postback_templates ORDER BY is_default DESC, network_name');
  success(res, { data: rows });
}));

module.exports = router;
