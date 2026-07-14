/**
 * Ad-block detection routes
 * - POST /api/ad-block/report    — external (no auth)
 * - GET  /api/admin/ad-block/stats   — admin
 * - GET  /api/admin/ad-block/offers  — admin
 *
 * Mount: app.use('/api', router)
 */
const express = require('express');
const router = express.Router();
const { authenticate, requireAdmin } = require('../middleware/auth');
const adBlock = require('../services/adBlockService');

// ── External report (no auth — called by browser script) ────────────
router.post('/ad-block/report', async (req, res) => {
  try {
    const { visitor_id, method, blocker_type, offer_id, page_url } = req.body;
    if (!visitor_id) {
      return res.status(400).json({ error: 'visitor_id required' });
    }

    const ipAddress = req.headers['x-forwarded-for']?.split(',')[0]?.trim()
      || req.headers['x-real-ip']
      || req.ip;

    const userAgent = req.headers['user-agent'] || '';

    const result = await adBlock.logDetection({
      visitorId: visitor_id,
      detectionMethod: method,
      blockerType: blocker_type,
      offerId: offer_id ? parseInt(offer_id) : undefined,
      pageUrl: page_url,
      ipAddress,
      userAgent,
    });

    // Also bump the visitor counter
    await adBlock.recordHit(visitor_id);

    res.json({ success: true, id: result.id });
  } catch (err) {
    console.error('Ad-block report error:', err.message);
    res.status(500).json({ error: 'Failed to log ad-block detection' });
  }
});

// ── Admin routes (authenticated) ────────────────────────────────────
router.get('/admin/ad-block/stats', authenticate, requireAdmin, async (req, res) => {
  try {
    const stats = await adBlock.getStats(req.query.offer_id ? parseInt(req.query.offer_id) : undefined);
    res.json(stats);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/admin/ad-block/offers', authenticate, requireAdmin, async (req, res) => {
  try {
    const offers = await adBlock.getBlockedOffers();
    res.json({ offers });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
