const express = require('express');
const { authenticate, requireAdmin } = require('../middleware/auth');
const c = require('../controllers/contentController');

const router = express.Router();

/**
 * Public status endpoint — no auth required (used by SPA to check feature availability).
 */
router.get('/status', (req, res) => {
  const { GEMINI_API_KEY, GEMINI_MODEL } = require('../config/gemini');
  res.json({
    enabled: Boolean(GEMINI_API_KEY),
    model: GEMINI_MODEL,
    tools: ['banner', 'carousel', 'caption', 'brand-kit', 'ab-test', 'bg-remove'],
  });
});

/**
 * Content generation endpoints — require auth.
 * Admins get full access; affiliates get the same tools (for their own campaigns).
 */
router.use(authenticate);

// 6 Gemini-powered tools
router.post('/banner',        c.generateBanner);
router.post('/carousel',      c.generateCarousel);
router.post('/caption',       c.generateCaption);
router.post('/brand-kit',     c.generateBrandKit);
router.post('/ab-test',       c.generateABTest);
router.post('/bg-remove',     c.generateBgRemovePrompt);

module.exports = router;
