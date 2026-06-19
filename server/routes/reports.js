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
} = require('../controllers/reportController');

router.use(authenticate);

router.get('/clicks', requireRole('admin', 'affiliate', 'advertiser'), getClicks);
router.get('/conversions', requireAdmin, getConversions);
router.get('/ads', requireAdmin, getLaporanIklan);
router.get('/daily', requireAdmin, getAnalyticHarian);
router.get('/taglink', requireAdmin, getLaporanTaglink);
router.get('/ads.pdf', requireAdmin, exportLaporanIklanPdf);
router.get('/orders', requireAdmin, getLaporanOrder);

module.exports = router;
