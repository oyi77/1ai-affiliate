'use strict';

const express = require('express');
const router = express.Router();
const { asyncHandler } = require('../utils/asyncHandler');
const { authenticate } = require('../middleware/auth');
const retargetingService = require('../services/retargetingService');

// GET /api/retargeting/pixels — list pixels for authenticated affiliate
router.get('/pixels', authenticate, asyncHandler(async (req, res) => {
  const pixels = await retargetingService.getPixels(req.user.id);
  res.json({ data: pixels });
}));

// POST /api/retargeting/pixels — create a pixel
router.post('/pixels', authenticate, asyncHandler(async (req, res) => {
  const { pixelType, pixelId, pixelCode, fireOn } = req.body;

  if (!pixelType || !pixelId || !pixelCode || !fireOn) {
    return res.status(400).json({ error: 'pixelType, pixelId, pixelCode, fireOn required' });
  }

  const id = await retargetingService.createPixel(req.user.id, pixelType, pixelId, pixelCode, fireOn);
  res.status(201).json({ data: { id } });
}));

// PUT /api/retargeting/pixels/:id — update a pixel
router.put('/pixels/:id', authenticate, asyncHandler(async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (!id) return res.status(400).json({ error: 'Invalid pixel id' });

  const affected = await retargetingService.updatePixel(id, req.body);
  if (!affected) return res.status(404).json({ error: 'Pixel not found' });

  res.json({ data: { affected } });
}));

// DELETE /api/retargeting/pixels/:id — soft delete
router.delete('/pixels/:id', authenticate, asyncHandler(async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (!id) return res.status(400).json({ error: 'Invalid pixel id' });

  const affected = await retargetingService.deletePixel(id);
  if (!affected) return res.status(404).json({ error: 'Pixel not found' });

  res.json({ data: { affected } });
}));

// POST /api/retargeting/events — fire a retargeting event
router.post('/events', authenticate, asyncHandler(async (req, res) => {
  const { pixelId, clickId, eventType, eventData } = req.body;

  if (!pixelId || !clickId || !eventType) {
    return res.status(400).json({ error: 'pixelId, clickId, eventType required' });
  }

  const ip = req.headers['x-forwarded-for'] || req.ip;
  const ua = req.headers['user-agent'] || '';
  const id = await retargetingService.fireEvent(pixelId, clickId, eventType, eventData, ip, ua);
  res.status(201).json({ data: { id } });
}));

// GET /api/retargeting/pixels/:id/stats — pixel event stats
router.get('/pixels/:id/stats', authenticate, asyncHandler(async (req, res) => {
  const pixelId = parseInt(req.params.id, 10);
  if (!pixelId) return res.status(400).json({ error: 'Invalid pixel id' });

  const stats = await retargetingService.getPixelStats(pixelId);
  res.json({ data: stats });
}));

module.exports = router;
