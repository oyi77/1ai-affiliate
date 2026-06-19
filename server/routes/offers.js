const express = require('express');
const router = express.Router();
const { authenticate, requireAdmin } = require('../middleware/auth');
const { requireRole } = require('../middleware/roleMiddleware');
const {
  getOffers,
  createOffer,
  updateOffer,
  setOfferPostback,
  getOfferPostback,
  getOfferLandingPages,
  addOfferLandingPage,
} = require('../controllers/offerController');

router.use(authenticate);

router.get('/', requireRole('admin', 'affiliate', 'advertiser'), getOffers);
router.post('/', requireRole('admin', 'advertiser'), createOffer);
router.patch('/:id', requireAdmin, updateOffer);
router.post('/:offerId/postback', requireAdmin, setOfferPostback);
router.get('/:offerId/postback', requireAdmin, getOfferPostback);
router.get('/:offerId/landing-pages', requireAdmin, getOfferLandingPages);
router.post('/:offerId/landing-pages', requireAdmin, addOfferLandingPage);

module.exports = router;
