'use strict';
/**
 * Gapfill Routes - index barrel (split from 1697-line god file, 800-line gate).
 * Route bodies live per-domain in ./gapfill/*.js; bodies verified byte-identical
 * to the original for all 58 pre-existing routes. Auth applies once here.
 */

const express = require('express');
const router = express.Router();
const { authenticate, requireAdmin } = require('../middleware/auth');

router.use(authenticate);
router.use(requireAdmin);

router.use(require('./gapfill/trafficSources'));
router.use(require('./gapfill/postbackTemplates'));
router.use(require('./gapfill/reportsLaporan'));
router.use(require('./gapfill/abTestsAutomation'));
router.use(require('./gapfill/dayPartingWebhooks'));
router.use(require('./gapfill/advertisersClicks'));
router.use(require('./gapfill/settings'));
router.use(require('./gapfill/campaignsOffers'));
router.use(require('./gapfill/conversionApproval'));
router.use(require('./gapfill/affiliatePayoutRequests'));
router.use(require('./gapfill/creatives'));
router.use(require('./gapfill/payoutBatches'));
router.use(require('./gapfill/earnings'));
router.use(require('./gapfill/invoicesBilling'));
router.use(require('./gapfill/management'));
router.use(require('./gapfill/offersAccess'));
router.use(require('./gapfill/integrations'));
router.use(require('./gapfill/reports'));

module.exports = router;
