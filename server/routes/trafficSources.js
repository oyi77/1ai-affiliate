const express = require('express');
const router = express.Router();
const { authenticate, requireAdmin } = require('../middleware/auth');
const { requireRole } = require('../middleware/roleMiddleware');
const { validate } = require('../utils/validate');
const {
  getTrafficSources,
  createTrafficSource,
  updateTrafficSource,
  connectMetaAccount,
  syncTrafficSource,
  getTrafficSourceDailyStats,
  createTrafficSourceSchema,
} = require('../controllers/trafficSourceController');

router.use(authenticate);

router.get('/', requireRole('admin', 'affiliate', 'advertiser'), getTrafficSources);
router.post('/', requireAdmin, validate(createTrafficSourceSchema), createTrafficSource);
router.patch('/:id', requireAdmin, updateTrafficSource);
router.post('/:id/connect-meta', requireAdmin, connectMetaAccount);
router.post('/:id/sync', requireAdmin, syncTrafficSource);
router.get('/:id/daily-stats', requireAdmin, getTrafficSourceDailyStats);

module.exports = router;
