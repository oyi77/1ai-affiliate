'use strict';

const express = require('express');
const router = express.Router();
const { authenticate, requireAdmin } = require('../middleware/auth');
const { asyncHandler } = require('../utils/asyncHandler');
const ltv = require('../services/ltvService');

// GET /api/ltv/settings/:offerId — get LTV settings for an offer
router.get('/settings/:offerId', authenticate, asyncHandler(async (req, res) => {
  const offerId = parseInt(req.params.offerId, 10);
  if (!offerId) return res.status(400).json({ error: 'Invalid offerId' });

  const result = await ltv.getLtvSettings(offerId);
  if (!result) return res.status(404).json({ error: 'LTV settings not found' });

  res.json({ data: result });
}));

// PUT /api/ltv/settings/:offerId — upsert LTV settings (admin only)
router.put('/settings/:offerId', authenticate, requireAdmin, asyncHandler(async (req, res) => {
  const offerId = parseInt(req.params.offerId, 10);
  if (!offerId) return res.status(400).json({ error: 'Invalid offerId' });

  const { lookback_days, min_conversions, status } = req.body;
  if (!lookback_days || !status) {
    return res.status(400).json({ error: 'lookback_days and status required' });
  }

  const id = await ltv.upsertLtvSettings(offerId, lookback_days, min_conversions || 3, status);
  res.json({ data: { id } });
}));

// GET /api/ltv — my LTV calculations
router.get('/', authenticate, asyncHandler(async (req, res) => {
  const result = await ltv.getLtv(req.user.id, req.query.offer_id, req.query.campaign_id);
  if (!result) return res.status(404).json({ error: 'LTV data not found' });

  res.json({ data: result });
}));

// POST /api/ltv/calculate — trigger LTV calculation
router.post('/calculate', authenticate, asyncHandler(async (req, res) => {
  const { offer_id, campaign_id } = req.body;
  if (!offer_id || !campaign_id) {
    return res.status(400).json({ error: 'offer_id and campaign_id required' });
  }

  const id = await ltv.calculateLtv(req.user.id, parseInt(offer_id, 10), parseInt(campaign_id, 10));
  res.status(201).json({ data: { id } });
}));

// GET /api/ltv/top — top affiliates by LTV
router.get('/top', authenticate, asyncHandler(async (req, res) => {
  const limit = Math.min(parseInt(req.query.limit, 10) || 10, 100);
  const rows = await ltv.getTopLtv(limit);
  res.json({ data: rows });
}));

module.exports = router;
