'use strict';

/**
 * Offer Manager (OM) Controller
 * Handles offer vetting workflow: approve, reject, request changes
 * Only accessible by 'om' and 'admin' roles
 */

const db = require('../db/mysql');
const { validationResult } = require('express-validator');

/**
 * Get all offers pending OM approval
 * GET /api/om/offers/pending
 */
async function getPendingOffers(req, res) {
    try {
        const [rows] = await db.query(
            `SELECT o.*, u.user_name AS advertiser_name
             FROM 1ai_offers o
             JOIN 1ai_users u ON u.user_id = o.advertiser_id
             WHERE o.approval_status = 'pending'
             ORDER BY o.id DESC
             LIMIT 100`
        );
        res.json({ ok: true, offers: rows, total: rows.length });
    } catch (err) {
        console.error('[OM] getPendingOffers error:', err);
        res.status(500).json({ error: 'Failed to fetch pending offers' });
    }
}

/**
 * Get single offer details for review
 * GET /api/om/offers/:id
 */
async function getOfferDetail(req, res) {
    try {
        const offerId = parseInt(req.params.id, 10);
        if (!offerId) return res.status(400).json({ error: 'Invalid offer ID' });

        const [offers] = await db.query(
            `SELECT o.*, u.user_name AS advertiser_name, u.user_email
             FROM 1ai_offers o
             JOIN 1ai_users u ON u.user_id = o.advertiser_id
             WHERE o.id = ?`,
            [offerId]
        );

        if (offers.length === 0) {
            return res.status(404).json({ error: 'Offer not found' });
        }

        // Get approval history
        const [log] = await db.query(
            `SELECT * FROM 1ai_offer_approval_log
             WHERE offer_id = ?
             ORDER BY created_at DESC
             LIMIT 20`,
            [offerId]
        );

        res.json({ ok: true, offer: offers[0], approvalHistory: log });
    } catch (err) {
        console.error('[OM] getOfferDetail error:', err);
        res.status(500).json({ error: 'Failed to fetch offer detail' });
    }
}

/**
 * Approve an offer (pending → approved)
 * POST /api/om/offers/:id/approve
 */
async function approveOffer(req, res) {
    try {
        const offerId = parseInt(req.params.id, 10);
        if (!offerId) return res.status(400).json({ error: 'Invalid offer ID' });

        const { notes } = req.body || {};
        const omUserId = req.user?.id;
        const omRole = req.user?.role || 'om';

        // Verify offer exists and is pending
        const [offers] = await db.query(
            `SELECT id, name, approval_status, payout_model, payout, network_payout
             FROM 1ai_offers WHERE id = ?`,
            [offerId]
        );

        if (offers.length === 0) {
            return res.status(404).json({ error: 'Offer not found' });
        }
        const offer = offers[0];

        if (offer.approval_status !== 'pending') {
            return res.status(409).json({
                error: `Offer is already ${offer.approval_status}. Cannot approve.`
            });
        }

        // Verify margin safety: payout must leave room for network_payout
        if (offer.network_payout && offer.payout) {
            const marginPct = ((offer.network_payout - offer.payout) / offer.network_payout) * 100;
            if (marginPct < offer.margin_floor_pct) {
                return res.status(422).json({
                    error: `Offer payout $${offer.payout} exceeds margin floor. Payout must leave at least ${offer.margin_floor_pct}% margin. Max payout: $${(offer.network_payout * (1 - offer.margin_floor_pct / 100)).toFixed(4)}`
                });
            }
        }

        // Begin transaction
        const conn = await db.getConnection();
        try {
            await conn.beginTransaction();

            // Update offer status
            await conn.query(
                `UPDATE 1ai_offers
                 SET approval_status = 'approved', approved_by = ?, approved_at = NOW(), rejection_reason = NULL
                 WHERE id = ?`,
                [omUserId, offerId]
            );

            // Log the approval
            await conn.query(
                `INSERT INTO 1ai_offer_approval_log (offer_id, action, actor_id, actor_role, notes, metadata)
                 VALUES (?, 'approved', ?, ?, ?, ?)`,
                [
                    offerId, omUserId, omRole,
                    notes || null,
                    JSON.stringify({
                        payout: offer.payout,
                        payout_model: offer.payout_model,
                        network_payout: offer.network_payout,
                        margin_pct: offer.network_payout
                            ? Number(((offer.network_payout - offer.payout) / offer.network_payout * 100).toFixed(2))
                            : null
                    })
                ]
            );

            await conn.commit();
            res.json({
                ok: true,
                message: `Offer "${offer.name}" approved`,
                offerId
            });
        } catch (txErr) {
            await conn.rollback();
            throw txErr;
        } finally {
            conn.release();
        }
    } catch (err) {
        console.error('[OM] approveOffer error:', err);
        res.status(500).json({ error: 'Failed to approve offer' });
    }
}

/**
 * Reject an offer with reason
 * POST /api/om/offers/:id/reject
 */
async function rejectOffer(req, res) {
    try {
        const offerId = parseInt(req.params.id, 10);
        if (!offerId) return res.status(400).json({ error: 'Invalid offer ID' });

        const { reason, notes } = req.body || {};
        if (!reason || reason.trim().length < 10) {
            return res.status(422).json({ error: 'Rejection reason required (min 10 characters)' });
        }

        const omUserId = req.user?.id;
        const omRole = req.user?.role || 'om';

        const [offers] = await db.query(
            `SELECT id, name, approval_status FROM 1ai_offers WHERE id = ?`,
            [offerId]
        );

        if (offers.length === 0) {
            return res.status(404).json({ error: 'Offer not found' });
        }
        const offer = offers[0];

        if (offer.approval_status !== 'pending') {
            return res.status(409).json({ error: `Offer is already ${offer.approval_status}. Cannot reject.` });
        }

        const conn = await db.getConnection();
        try {
            await conn.beginTransaction();

            await conn.query(
                `UPDATE 1ai_offers
                 SET approval_status = 'rejected', rejection_reason = ?, approved_by = ?, approved_at = NOW()
                 WHERE id = ?`,
                [reason, omUserId, offerId]
            );

            await conn.query(
                `INSERT INTO 1ai_offer_approval_log (offer_id, action, actor_id, actor_role, notes, metadata)
                 VALUES (?, 'rejected', ?, ?, ?, ?)`,
                [
                    offerId, omUserId, omRole,
                    notes || null,
                    JSON.stringify({ rejection_reason: reason })
                ]
            );

            await conn.commit();
            res.json({
                ok: true,
                message: `Offer "${offer.name}" rejected`,
                reason,
                offerId
            });
        } catch (txErr) {
            await conn.rollback();
            throw txErr;
        } finally {
            conn.release();
        }
    } catch (err) {
        console.error('[OM] rejectOffer error:', err);
        res.status(500).json({ error: 'Failed to reject offer' });
    }
}

/**
 * Request changes on a pending offer
 * POST /api/om/offers/:id/request-changes
 */
async function requestChanges(req, res) {
    try {
        const offerId = parseInt(req.params.id, 10);
        if (!offerId) return res.status(400).json({ error: 'Invalid offer ID' });

        const { notes, changes } = req.body || {};
        if (!notes || notes.trim().length < 10) {
            return res.status(422).json({ error: 'Change request notes required (min 10 characters)' });
        }

        const [offers] = await db.query(
            `SELECT id, name, approval_status FROM 1ai_offers WHERE id = ?`,
            [offerId]
        );

        if (offers.length === 0) {
            return res.status(404).json({ error: 'Offer not found' });
        }
        const offer = offers[0];

        if (offer.approval_status !== 'pending') {
            return res.status(409).json({ error: `Offer is already ${offer.approval_status}.` });
        }

        await db.query(
            `UPDATE 1ai_offers
             SET approval_status = 'changes_requested', om_notes = ?, rejection_reason = NULL
             WHERE id = ?`,
            [notes, offerId]
        );

        await db.query(
            `INSERT INTO 1ai_offer_approval_log (offer_id, action, actor_id, actor_role, notes, metadata)
             VALUES (?, 'changes_requested', ?, ?, ?, ?)`,
            [
                offerId, req.user.id, req.user.role,
                notes,
                changes ? JSON.stringify({ requested_changes: changes }) : null
            ]
        );

        res.json({
            ok: true,
            message: `Changes requested for "${offer.name}"`,
            offerId,
            notes
        });
    } catch (err) {
        console.error('[OM] requestChanges error:', err);
        res.status(500).json({ error: 'Failed to request changes' });
    }
}

/**
 * List all approved offers (for AM/Admin to assign)
 * GET /api/om/offers/approved
 */
async function getApprovedOffers(req, res) {
    try {
        const [rows] = await db.query(
            `SELECT o.*, u.user_name AS advertiser_name
             FROM 1ai_offers o
             JOIN 1ai_users u ON u.user_id = o.advertiser_id
             WHERE o.approval_status IN ('approved', 'changes_requested')
             ORDER BY o.id DESC
             LIMIT 200`
        );
        res.json({ ok: true, offers: rows, total: rows.length });
    } catch (err) {
        console.error('[OM] getApprovedOffers error:', err);
        res.status(500).json({ error: 'Failed to fetch approved offers' });
    }
}

module.exports = {
    getPendingOffers,
    getOfferDetail,
    approveOffer,
    rejectOffer,
    requestChanges,
    getApprovedOffers
};
