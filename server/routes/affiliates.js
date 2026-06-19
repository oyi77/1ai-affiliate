const express = require('express');
const router = express.Router();
const { authenticate, requireAdmin } = require('../middleware/auth');
const { requireRole } = require('../middleware/roleMiddleware');
const {
  getAffiliates,
  createAffiliate,
  getEarnings,
  approveEarning,
} = require('../controllers/affiliateController');

router.use(authenticate);

router.get('/', requireAdmin, getAffiliates);
router.post('/', requireAdmin, createAffiliate);
router.get('/earnings', requireRole('admin', 'affiliate', 'advertiser'), getEarnings);
router.post('/earnings/:id/approve', requireAdmin, approveEarning);

module.exports = router;
