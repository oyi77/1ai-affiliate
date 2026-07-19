/**
 * Offer Recommendation routes
 * - GET  /api/recommendations        — list recommendations for current affiliate
 * - POST /api/recommendations        — create a manual recommendation
 * - POST /api/recommendations/:id/click — log a click
 * - DELETE /api/recommendations/:id  — delete a recommendation
 * - POST /api/recommendations/generate — trigger auto-recommendation engine
 *
 * Mount: app.use('/api', router)
 */
const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { asyncHandler } = require('../utils/asyncHandler');
const svc = require('../services/recommendationService');

// ── GET /api/recommendations ─────────────────────────────────────────
router.get('/', authenticate, asyncHandler(async (req, res) => {
  const { type } = req.query;
  const rows = await svc.getRecommendations(req.user.id, type || null);
  res.json({ data: rows });
}));

// ── POST /api/recommendations ────────────────────────────────────────
router.post('/', authenticate, asyncHandler(async (req, res) => {
  const { offer_id, score, reason, recommendation_type, expires_at } = req.body;
  if (!offer_id || score === undefined || !reason || !recommendation_type) {
    return res.status(400).json({ error: 'offer_id, score, reason, and recommendation_type are required' });
  }
  const id = await svc.createRecommendation(
    req.user.id, offer_id, score, reason, recommendation_type,
    expires_at ? parseInt(expires_at, 10) : null
  );
  res.status(201).json({ data: { id } });
}));

// ── POST /api/recommendations/generate ────────────────────────────────
router.post('/generate', authenticate, asyncHandler(async (req, res) => {
  const result = await svc.generateAutoRecommendations();
  res.json({ data: result });
}));

// ── POST /api/recommendations/:id/click ──────────────────────────────
router.post('/:id/click', authenticate, asyncHandler(async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (!id || isNaN(id)) {
    return res.status(400).json({ error: 'Invalid recommendation id' });
  }
  const result = await svc.logClick(id);
  res.json({ data: result });
}));

// ── DELETE /api/recommendations/:id ──────────────────────────────────
router.delete('/:id', authenticate, asyncHandler(async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (!id || isNaN(id)) {
    return res.status(400).json({ error: 'Invalid recommendation id' });
  }
  const affected = await svc.deleteRecommendation(id);
  if (!affected) {
    return res.status(404).json({ error: 'Not found' });
  }
  res.json({ success: true });
}));

module.exports = router;
