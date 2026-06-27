'use strict';

/**
 * HERMES API Routes — Facebook Affiliate Content Distribution System
 */

const express = require('express');
const router = express.Router();
const { authenticate } = require('../../middleware/auth');
const { normalizeCategory, generateCaption, generateHashtags, loadDatabase, validateCategoryAlignment, CATEGORIES, CTA_VARIATIONS } = require('./pipeline');

// All routes require auth
router.use(authenticate);

// ── GET /api/hermes/categories ───────────────────────────────────
router.get('/categories', (req, res) => {
  const cats = Object.entries(CATEGORIES).map(([key, val]) => ({
    id: key,
    ...val,
    cta_count: (CTA_VARIATIONS[key] || CTA_VARIATIONS.other).length,
  }));
  res.json({ data: cats });
});

// ── POST /api/hermes/validate ────────────────────────────────────
router.post('/validate', (req, res) => {
  const { video_topic, sheet_category, affiliate_category, page_category } = req.body;
  const result = validateCategoryAlignment({
    videoTopic: video_topic,
    sheetCategory: sheet_category,
    affiliateCategory: affiliate_category,
    pageCategory: page_category,
  });
  res.json({ data: result });
});

// ── POST /api/hermes/caption ─────────────────────────────────────
router.post('/caption', (req, res) => {
  const { category, affiliate_link } = req.body;
  if (!category || !affiliate_link) {
    return res.status(400).json({ error: 'category and affiliate_link required' });
  }
  const caption = generateCaption(category, affiliate_link);
  const hashtags = generateHashtags(normalizeCategory(category), 10);
  res.json({ data: { caption, hashtags, category: normalizeCategory(category) } });
});

// ── POST /api/hermes/caption/batch ───────────────────────────────
router.post('/caption/batch', (req, res) => {
  const { category, affiliate_link, count = 5 } = req.body;
  if (!category || !affiliate_link) {
    return res.status(400).json({ error: 'category and affiliate_link required' });
  }
  const captions = [];
  for (let i = 0; i < Math.min(count, 20); i++) {
    captions.push(generateCaption(category, affiliate_link));
  }
  res.json({ data: { captions, count: captions.length, category: normalizeCategory(category) } });
});

// ── POST /api/hermes/load ────────────────────────────────────────
router.post('/load', async (req, res) => {
  const { sheet_url } = req.body;
  if (!sheet_url) {
    return res.status(400).json({ error: 'sheet_url required' });
  }
  try {
    const db = await loadDatabase(sheet_url);
    res.json({ data: db });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
