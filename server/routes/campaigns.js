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
  createCampaignSchema,
  updateCampaignSchema,
} = require('../controllers/campaignController');

router.use(authenticate);
router.get('/', requireRole('admin', 'advertiser'), getCampaigns);
router.post('/', requireAdmin, validate(createCampaignSchema), createCampaign);
router.patch('/:id', requireAdmin, validate(updateCampaignSchema), updateCampaign);
router.post('/:id/rotation', requireAdmin, validate(setOfferRotationSchema), setOfferRotation);

module.exports = router;
