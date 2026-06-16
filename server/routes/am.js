'use strict';

/**
 * Account Manager (AM) Routes
 * Offer assignment (Specific vs Global), AM-to-affiliate mapping
 * Accessible by 'am', 'admin', and partially 'affiliate' roles
 */

const express = require('express');
const router = express.Router();
const { authenticate, requireAdmin } = require('../middleware/auth');
const { requireRole } = require('../middleware/roleMiddleware');

const {
    assignOfferToAffiliate,
    assignOfferGlobally,
    removeAssignment,
    listAssignments,
    listAmMappings,
    mapAmToAffiliate
} = require('../controllers/amController');

// All AM routes require authentication
router.use(authenticate);

/**
 * POST /api/am/assign
 * Assign offer to a specific affiliate
 * Access: am, admin
 */
router.post('/assign', requireRole('am', 'admin'), assignOfferToAffiliate);

/**
 * POST /api/am/assign-global
 * Assign offer globally to all publishers
 * Access: am, admin
 */
router.post('/assign-global', requireRole('am', 'admin'), assignOfferGlobally);

/**
 * DELETE /api/am/assign/:id
 * Remove an assignment (specific or global)
 * Access: am, admin
 */
router.delete('/assign/:id', requireRole('am', 'admin'), removeAssignment);

/**
 * GET /api/am/assignments
 * List all assignments with optional filters
 * Access: am, admin, affiliate (own only, filtered by controller)
 */
router.get('/assignments', requireRole('am', 'admin', 'affiliate'), listAssignments);

/**
 * GET /api/am/mappings
 * List AM-to-affiliate mappings
 * Access: am, admin
 */
router.get('/mappings', requireRole('am', 'admin'), listAmMappings);

/**
 * POST /api/am/map
 * Map an AM to an affiliate (Admin only)
 * Access: admin
 */
router.post('/map', requireAdmin, mapAmToAffiliate);

module.exports = router;
