'use strict';

const express = require('express');
const router = express.Router();
const { success, error } = require('../utils/apiResponse');
const { asyncHandler } = require('../utils/asyncHandler');
const { authenticate, requireAdmin } = require('../middleware/auth');
const crossDeviceService = require('../services/crossDeviceService');

// ── Static routes before parameterized ──────────────────────────────────────

// POST /api/affiliate/cross-device/track — unauthenticated tracking endpoint
router.post('/track', asyncHandler(async (req, res) => {
  const { fingerprint, deviceData } = req.body;

  if (!fingerprint) {
    return error(res, 'fingerprint is required', 400);
  }

  const visitorId = await crossDeviceService.getOrCreateVisitor(fingerprint, deviceData || null);
  res.json({ data: { visitor_id: visitorId } });
}));

// POST /api/affiliate/cross-device/merge — merge two visitor profiles
router.post('/merge', authenticate, asyncHandler(async (req, res) => {
  const { sourceVisitorId, targetVisitorId, reason } = req.body;

  if (!sourceVisitorId || !targetVisitorId) {
    return error(res, 'sourceVisitorId and targetVisitorId are required', 400);
  }

  const mergedId = await crossDeviceService.mergeVisitors(
    parseInt(sourceVisitorId, 10),
    parseInt(targetVisitorId, 10),
    reason || 'manual_merge'
  );

  success(res, { data: { merged_visitor_id: mergedId } });
}));

// GET /api/admin/cross-device/search — admin fingerprint lookup
router.get('/search', authenticate, requireAdmin, asyncHandler(async (req, res) => {
  const { fingerprint } = req.query;

  if (!fingerprint) {
    return error(res, 'fingerprint query parameter is required', 400);
  }

  // Accept raw JSON string or plain fingerprint value
  let fp;
  try { fp = JSON.parse(fingerprint); } catch { fp = fingerprint; }

  const visitor = await crossDeviceService.lookupByFingerprint(fp);
  if (!visitor) {
    return error(res, 'No visitor found for this fingerprint', 404);
  }

  success(res, { data: visitor });
}));

// ── Parameterized route (must be last) ──────────────────────────────────────

// GET /api/affiliate/cross-device/:visitorId
router.get('/:visitorId', authenticate, asyncHandler(async (req, res) => {
  const { visitorId } = req.params;

  const stats = await crossDeviceService.getVisitorStats(parseInt(visitorId, 10));
  if (!stats) {
    return error(res, 'Visitor not found', 404);
  }

  success(res, { data: stats });
}));

module.exports = router;
