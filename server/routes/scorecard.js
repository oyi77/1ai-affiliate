'use strict';

const express = require('express');
const router = express.Router();
const { authenticate, requireAdmin } = require('../middleware/auth');
const { asyncHandler } = require('../utils/asyncHandler');
const svc = require('../services/scorecardService');

// ─── My Scorecard ─────────────────────────────────────────────────────────────

// GET /api/scorecard — current scorecard for logged-in affiliate
router.get('/', authenticate, asyncHandler(async (req, res) => {
  const result = await svc.getScorecard(req.user.id);
  if (!result) {
    return res.status(404).json({ error: 'Scorecard not found. Try calculating first.' });
  }
  res.json({ data: result });
}));

// GET /api/scorecard/history — scorecard history for logged-in affiliate
router.get('/history', authenticate, asyncHandler(async (req, res) => {
  const limit = Math.min(parseInt(req.query.limit) || 30, 365);
  const rows = await svc.getScorecardHistory(req.user.id, limit);
  res.json({ data: rows });
}));

// GET /api/scorecard/leaderboard — all scorecards ordered by overall_score DESC
router.get('/leaderboard', authenticate, asyncHandler(async (req, res) => {
  const { tier } = req.query;
  const rows = await svc.getScorecards(tier || null);
  res.json({ data: rows });
}));

// POST /api/scorecard/calculate — recalculate scorecard
//   body: { affiliate_id? } — self by default; admin can specify any affiliate
router.post('/calculate', authenticate, asyncHandler(async (req, res) => {
  const targetId = req.body.affiliate_id && req.user.role === 'admin'
    ? parseInt(req.body.affiliate_id)
    : req.user.id;

  const result = await svc.calculateScorecard(targetId);
  res.json({ data: result });
}));

// ─── Admin ────────────────────────────────────────────────────────────────────

// GET /api/scorecard/admin — admin view all scorecards
router.get('/admin', authenticate, requireAdmin, asyncHandler(async (req, res) => {
  const { tier } = req.query;
  const rows = await svc.getScorecards(tier || null);
  res.json({ data: rows });
}));

module.exports = router;
