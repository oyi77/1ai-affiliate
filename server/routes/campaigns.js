const express = require('express');
const router = express.Router();
const { authenticate, requireAdmin } = require('../middleware/auth');
const { requireRole } = require('../middleware/roleMiddleware');
const { validate } = require('../utils/validate');
const {
  getCampaigns,
  createCampaign,
  updateCampaign,
  linkOfferToCampaign,
  setOfferRotation,
  setOfferRotationSchema,
} = require('../controllers/campaignController');

router.use(authenticate);

router.get('/', requireRole('admin', 'advertiser'), getCampaigns);
router.post('/', requireAdmin, createCampaign);
router.patch('/:id', requireAdmin, updateCampaign);
router.post('/:id/rotation', requireAdmin, validate(setOfferRotationSchema), setOfferRotation);

module.exports = router;
