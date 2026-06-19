const express = require('express');
const router = express.Router();
const { authenticate, requireAdmin } = require('../middleware/auth');
const { requireRole } = require('../middleware/roleMiddleware');
const { validate } = require('../utils/validate');
const {
  getTrafficSources,
  createTrafficSource,
  updateTrafficSource,
  connectIntegration,
  syncTrafficSource,
  getTrafficSourceDailyStats,
  createTrafficSourceSchema,
} = require('../controllers/trafficSourceController');

router.use(authenticate);

// CRUD
router.get('/', requireRole('admin', 'affiliate', 'advertiser'), getTrafficSources);
router.post('/', requireAdmin, validate(createTrafficSourceSchema), createTrafficSource);
router.patch('/:id', requireAdmin, updateTrafficSource);

// Integration marketplace — list available integrations
router.get('/integrations', requireAdmin, (req, res) => {
  const registry = require('../integrations/registry');
  res.json({ data: registry.listAll() });
});

// Connect any platform (generic)
router.post('/:id/connect', requireAdmin, connectIntegration);

// Sync stats (generic — dispatches to the right platform)
router.post('/:id/sync', requireAdmin, syncTrafficSource);

// Daily stats
router.get('/:id/daily-stats', requireAdmin, getTrafficSourceDailyStats);

module.exports = router;
