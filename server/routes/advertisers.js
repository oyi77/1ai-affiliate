const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

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
  validateCreateAdvertiser,
  validateUpdateAdvertiser,
  validateCreatePayout,
} = require('../controllers/advertiserController');

router.use(authenticate);

router.get('/', requireAdmin, getAdvertisers);
router.post('/', requireAdmin, validateCreateAdvertiser, createAdvertiser);
router.patch('/:id', requireAdmin, validateUpdateAdvertiser, updateAdvertiser);
router.post('/:id/upload', requireAdmin, upload.single('file'), uploadAdvertiserReport);
router.get('/:id/reports', requireAdmin, getAdvertiserReports);
router.get('/:id/payouts', requireAdmin, getAdvertiserPayouts);
router.post('/:id/payouts', requireAdmin, validateCreatePayout, createAdvertiserPayout);

module.exports = router;
