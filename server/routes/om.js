'use strict';

/**
 * Offer Manager (OM) Routes
 * Offer vetting workflow: approve, reject, request changes
 * Accessible by 'om' and 'admin' roles
 */

const express = require('express');
const router = express.Router();
const { authenticate, requireAdmin, requireRole } = require('../middleware/auth');

const {
    getPendingOffers,
    getOfferDetail,
    approveOffer,
    rejectOffer,
    requestChanges,
    getApprovedOffers
} = require('../controllers/omController');

// All OM routes require authentication + om or admin role
router.use(authenticate);

/**
 * GET /api/om/offers/pending
 * Get all offers pending OM approval
 * Access: om, admin
 */
router.get('/offers/pending', requireRole('om', 'admin'), getPendingOffers);

/**
 * GET /api/om/offers/approved
 * Get all approved offers (for assignment)
 * Access: om, admin
 */
router.get('/offers/approved', requireRole('om', 'admin'), getApprovedOffers);

/**
 * GET /api/om/offers/:id
 * Get detailed offer information for review
 * Access: om, admin
 */
router.get('/offers/:id', requireRole('om', 'admin'), getOfferDetail);

/**
 * POST /api/om/offers/:id/approve
 * Approve a pending offer
 * Access: om, admin
 */
router.post('/offers/:id/approve', requireRole('om', 'admin'), approveOffer);

/**
 * POST /api/om/offers/:id/reject
 * Reject a pending offer with reason
 * Access: om, admin
 */
router.post('/offers/:id/reject', requireRole('om', 'admin'), rejectOffer);

/**
 * POST /api/om/offers/:id/request-changes
 * Request changes on a pending offer
 * Access: om, admin
 */
router.post('/offers/:id/request-changes', requireRole('om', 'admin'), requestChanges);

module.exports = router;
