const express = require('express');
const router = express.Router();
const { authenticate, requireAdmin } = require('../middleware/auth');
const { requireRole } = require('../middleware/roleMiddleware');
const {
  getClicks,
  getConversions,
  getLaporanIklan,
  getAnalyticHarian,
  getLaporanTaglink,
  exportLaporanIklanPdf,
  getLaporanOrder,
  compareCampaigns,
  getCampaignClicks,
  getCampaignConversions,
  getAttribution,
  getCustomReport,
} = require('../controllers/reportController');
router.use(authenticate);

router.get('/clicks', requireRole('admin', 'affiliate', 'advertiser'), getClicks);
router.get('/conversions', requireAdmin, getConversions);
router.get('/ads', requireAdmin, getLaporanIklan);
router.get('/daily', requireAdmin, getAnalyticHarian);
router.get('/taglink', requireAdmin, getLaporanTaglink);
router.get('/campaign/:id/clicks', requireAdmin, getCampaignClicks);
router.get('/campaign/:id/conversions', requireAdmin, getCampaignConversions);
router.get('/attribution', requireAdmin, getAttribution);
router.get('/ads.pdf', requireAdmin, exportLaporanIklanPdf);
router.get('/orders', requireAdmin, getLaporanOrder);
router.post('/custom', requireAdmin, getCustomReport);
router.get('/compare', requireAdmin, compareCampaigns);

// GEO/Device/Browser/OS breakdown
router.get('/breakdown', requireAdmin, async (req, res) => {
  const pool = require('../db/mysql');
  const { getBreakdownByDimension } = require('../services/reportService');
  try {
    const { dimension, date_from, date_to } = req.query;
    if (!dimension) return res.status(400).json({ error: 'dimension required: country, device, os, browser' });
    const rows = await getBreakdownByDimension(pool, { dimension, dateFrom: date_from, dateTo: date_to });
    res.json({ data: rows, dimension });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
