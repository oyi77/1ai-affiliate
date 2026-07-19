'use strict';

/**
 * Marketplace Profile Routes
 * - GET  /api/marketplace/profile       — my profile (auth)
 * - PUT  /api/marketplace/profile       — upsert my profile (auth)
 * - GET  /api/marketplace/featured      — public featured profiles
 * - GET  /api/marketplace/search        — public search
 * - GET  /api/marketplace/profile/:id   — view by affiliate id (public)
 * - POST /api/marketplace/profile/feature — admin toggle featured
 */

const express = require('express');
const router = express.Router();
const { authenticate, requireAdmin } = require('../middleware/auth');
const { asyncHandler } = require('../utils/asyncHandler');
const svc = require('../services/marketplaceService');

// ── My profile (authenticated) ────────────────────────────────────────────

// GET /api/marketplace/profile — get own profile
router.get('/profile', authenticate, asyncHandler(async (req, res) => {
  const profile = await svc.getProfile(req.user.id);
  if (!profile) {
    return res.status(404).json({ error: 'Profile not found. Create one with PUT.' });
  }
  res.json({ data: profile });
}));

// PUT /api/marketplace/profile — create or update own profile
router.put('/profile', authenticate, asyncHandler(async (req, res) => {
  const {
    headline,
    bio,
    avatar_url,
    website_url,
    social_links,
    traffic_sources,
    geo_reach,
    vertical_specialties,
    monthly_visitors,
  } = req.body;

  await svc.upsertProfile(
    req.user.id,
    headline,
    bio,
    avatar_url,
    website_url,
    social_links,
    traffic_sources,
    geo_reach,
    vertical_specialties,
    monthly_visitors
  );

  res.json({ success: true });
}));

// ── Public endpoints ──────────────────────────────────────────────────────

// GET /api/marketplace/featured — featured top-rated profiles
router.get('/featured', asyncHandler(async (req, res) => {
  const limit = parseInt(req.query.limit, 10) || 20;
  const rows = await svc.getFeaturedProfiles(limit);
  res.json({ data: rows });
}));

// GET /api/marketplace/search — search profiles
router.get('/search', asyncHandler(async (req, res) => {
  const { keyword, vertical, min_rating, page, limit } = req.query;
  const result = await svc.searchProfiles(keyword, vertical, min_rating, page, limit);
  res.json({ data: result.rows, total: result.total });
}));

// GET /api/marketplace/profile/:id — view any profile by affiliate id
router.get('/profile/:id', asyncHandler(async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (!id) {
    return res.status(400).json({ error: 'Invalid affiliate id' });
  }
  const profile = await svc.getProfile(id);
  if (!profile) {
    return res.status(404).json({ error: 'Profile not found' });
  }
  res.json({ data: profile });
}));

// ── Admin ─────────────────────────────────────────────────────────────────

// POST /api/marketplace/profile/feature — toggle featured flag
router.post('/profile/feature', authenticate, requireAdmin, asyncHandler(async (req, res) => {
  const { affiliate_id, featured } = req.body;
  if (!affiliate_id) {
    return res.status(400).json({ error: 'affiliate_id required' });
  }
  const profile = await svc.getProfile(affiliate_id);
  if (!profile) {
    return res.status(404).json({ error: 'Profile not found' });
  }
  await svc.updateProfile(profile.id, { featured: !!featured });
  res.json({ success: true });
}));

module.exports = router;
