const express = require('express');
const router = express.Router();
const { authenticate, requireAdmin } = require('../middleware/auth');
const {
  getAdvertisers,
  createAdvertiser,
  updateAdvertiser,
  uploadAdvertiserReport,
  getAdvertiserReports,
  getAdvertiserPayouts,
  createAdvertiserPayout,
} = require('../controllers/advertiserController');

router.use(authenticate);

router.get('/', requireAdmin, getAdvertisers);
router.post('/', requireAdmin, createAdvertiser);
router.patch('/:id', requireAdmin, updateAdvertiser);
router.post('/:id/upload', requireAdmin, uploadAdvertiserReport);
router.get('/:id/reports', requireAdmin, getAdvertiserReports);
router.get('/:id/payouts', requireAdmin, getAdvertiserPayouts);
router.post('/:id/payouts', requireAdmin, createAdvertiserPayout);

module.exports = router;
