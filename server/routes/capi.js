const express = require('express');
const router = express.Router();
const p = require('../db/mysql');
const { authenticate, requireAdmin } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');

// GET /api/capi/config — get CAPI config for current affiliate
router.get('/config', authenticate, asyncHandler(async (req, res) => {
  const [config] = await p.query(
    'SELECT * FROM `1ai_capi_config` WHERE affiliate_id = ? AND status = "active"',
    [req.user.id]
  );
  res.json({ data: config });
}));

// POST /api/capi/config — upsert CAPI config
router.post('/config', authenticate, asyncHandler(async (req, res) => {
  const { pixel_id, access_token, test_event_code } = req.body;
  if (!pixel_id || !access_token) {
    return res.status(400).json({ error: 'pixel_id and access_token required' });
  }
  await p.query(
    `INSERT INTO \`1ai_capi_config\` (affiliate_id, pixel_id, access_token, test_event_code, status, created_at)
     VALUES (?, ?, ?, ?, 'active', UNIX_TIMESTAMP())
     ON DUPLICATE KEY UPDATE pixel_id = VALUES(pixel_id), access_token = VALUES(access_token),
       test_event_code = VALUES(test_event_code)`,
    [req.user.id, pixel_id, access_token, test_event_code || null]
  );
  res.json({ success: true });
}));

// DELETE /api/capi/config — remove CAPI config
router.delete('/config', authenticate, asyncHandler(async (req, res) => {
  await p.query(
    'UPDATE `1ai_capi_config` SET status = "inactive" WHERE affiliate_id = ?',
    [req.user.id]
  );
  res.json({ success: true });
}));

// POST /api/capi/event — fire a CAPI event
router.post('/event', authenticate, asyncHandler(async (req, res) => {
  const { event_name, event_time, user_data, custom_data } = req.body;
  if (!event_name) return res.status(400).json({ error: 'event_name required' });

  const [configs] = await p.query(
    'SELECT * FROM `1ai_capi_config` WHERE affiliate_id = ? AND status = "active"',
    [req.user.id]
  );

  const results = [];
  const capiService = require('../services/capiService');

  for (const cfg of configs) {
    try {
      const r = await capiService.sendMetaConversion(cfg.access_token, cfg.pixel_id, {
        event_name, event_time: event_time || Math.floor(Date.now() / 1000),
        user_data: { client_ip_address: req.ip, client_user_agent: req.get('User-Agent'), ...user_data },
        custom_data, action_source: 'website',
      });
      results.push({ pixel_id: cfg.pixel_id, result: r });
    } catch (err) {
      results.push({ pixel_id: cfg.pixel_id, error: err.message });
    }
  }

  res.json({ data: results });
}));

// GET /api/admin/capi/configs — admin list all configs
router.get('/admin/configs', authenticate, requireAdmin, asyncHandler(async (req, res) => {
  const [rows] = await p.query(
    `SELECT c.*, a.name AS affiliate_name
     FROM \`1ai_capi_config\` c
     LEFT JOIN \`1ai_affiliates\` a ON a.id = c.affiliate_id
     ORDER BY c.created_at DESC`
  );
  res.json({ data: rows });
}));

module.exports = router;
