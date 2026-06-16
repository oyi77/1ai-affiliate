'use strict';

/**
 * Margin Negotiation Service
 * Manages payout negotiation between affiliates and offer managers with margin safety
 */

const db = require('../db/mysql');

const NEGOTIATION_EXPIRY_DAYS = 7;

/**
 * Propose a new payout for an affiliate on an offer
 * @param {number} offer_id
 * @param {number} affiliate_id
 * @param {number} proposed_payout
 * @param {string} reason
 * @param {string} proposed_by - 'affiliate' | 'am' | 'admin'
 * @param {number} [volume_commitment] - monthly volume commitment
 * @returns {Promise<Object>} negotiation record
 */
async function proposePayout(offer_id, affiliate_id, proposed_payout, reason, proposed_by, volume_commitment) {
    if (!offer_id || !affiliate_id || !proposed_payout) {
        throw new Error('offer_id, affiliate_id, and proposed_payout are required');
    }

    if (!reason || reason.trim().length < 10) {
        throw new Error('Reason must be at least 10 characters');
    }

    const validProposers = ['affiliate', 'am', 'admin'];
    if (!validProposers.includes(proposed_by)) {
        throw new Error(`proposed_by must be one of: ${validProposers.join(', ')}`);
    }

    // Verify offer exists
    const [offers] = await db.query(
        `SELECT id, name, payout, network_payout, margin_floor_pct, payout_model
         FROM 1ai_offers WHERE id = ?`,
        [offer_id]
    );

    if (offers.length === 0) {
        throw new Error('Offer not found');
    }

    const offer = offers[0];

    // Verify affiliate exists
    const [affiliates] = await db.query(
        `SELECT a.id, a.affiliate_code, a.tier, u.user_active
         FROM 1ai_affiliates a
         JOIN 1ai_users u ON u.user_id = a.user_id
         WHERE a.id = ?`,
        [affiliate_id]
    );

    if (affiliates.length === 0) {
        throw new Error('Affiliate not found');
    }

    // Auto-calculate margin for proposed payout
    const marginInfo = await autoCalculateMargin(offer, proposed_payout);

    // Check if proposed payout violates margin floor
    if (!marginInfo.safe) {
        throw new Error(
            `Proposed payout $${proposed_payout} violates margin floor. ` +
            `Current margin: ${marginInfo.margin_pct}%, floor: ${offer.margin_floor_pct}%. ` +
            `Max allowed payout: $${marginInfo.max_safe_payout.toFixed(4)}`
        );
    }

    // Check for existing pending negotiation
    const [existing] = await db.query(
        `SELECT id, status, proposed_payout FROM 1ai_margin_negotiations
         WHERE offer_id = ? AND affiliate_id = ? AND status = 'pending'
         ORDER BY id DESC LIMIT 1`,
        [offer_id, affiliate_id]
    );

    if (existing.length > 0) {
        throw new Error(
            `A pending negotiation already exists (ID: ${existing[0].id}) ` +
            `with proposed payout $${existing[0].proposed_payout}. ` +
            `Please cancel or wait for the existing negotiation to be resolved.`
        );
    }

    // Create negotiation record
    const [result] = await db.query(
        `INSERT INTO 1ai_margin_negotiations
         (offer_id, affiliate_id, current_payout, proposed_payout, reason,
          proposed_by, volume_commitment, margin_pct, network_payout,
          status, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', NOW())`,
        [
            offer_id, affiliate_id,
            offer.payout, proposed_payout, reason,
            proposed_by, volume_commitment || null,
            marginInfo.margin_pct,
            offer.network_payout
        ]
    );

    return {
        id: result.insertId,
        offer_id,
        affiliate_id,
        current_payout: offer.payout,
        proposed_payout,
        reason,
        proposed_by,
        volume_commitment: volume_commitment || null,
        margin_pct: marginInfo.margin_pct,
        network_payout: offer.network_payout,
        margin_floor_pct: offer.margin_floor_pct,
        status: 'pending'
    };
}

/**
 * Auto-calculate margin percentage for a payout on an offer
 * @param {Object|number} offer - offer row object or offer_id
 * @param {number} payout - the proposed payout amount
 * @returns {Object} { margin_pct, safe, max_safe_payout, network_payout }
 */
async function autoCalculateMargin(offer, payout) {
    let offerData = offer;

    if (typeof offer === 'number') {
        const [offers] = await db.query(
            `SELECT id, network_payout, margin_floor_pct FROM 1ai_offers WHERE id = ?`,
            [offer]
        );
        if (offers.length === 0) {
            return { margin_pct: 0, safe: false, error: 'Offer not found', max_safe_payout: 0, network_payout: 0 };
        }
        offerData = offers[0];
    }

    const networkPayout = parseFloat(offerData.network_payout) || 0;
    const marginFloorPct = parseFloat(offerData.margin_floor_pct) || 0;
    const proposedPayout = parseFloat(payout) || 0;

    if (networkPayout <= 0) {
        return { margin_pct: 0, safe: false, error: 'Invalid network payout', max_safe_payout: 0, network_payout: 0 };
    }

    if (proposedPayout <= 0) {
        return { margin_pct: 0, safe: false, error: 'Invalid payout amount', max_safe_payout: 0, network_payout };
    }

    const marginPct = ((networkPayout - proposedPayout) / networkPayout) * 100;
    const maxSafePayout = networkPayout * (1 - marginFloorPct / 100);
    const safe = marginPct >= marginFloorPct;

    return {
        margin_pct: Number(marginPct.toFixed(2)),
        safe,
        max_safe_payout: Number(maxSafePayout.toFixed(4)),
        network_payout: networkPayout,
        margin_floor_pct: marginFloorPct
    };
}

/**
 * Approve a pending negotiation and update affiliate access
 * @param {number} id - negotiation ID
 * @param {number} admin_user_id - approving admin/OM user ID
 * @returns {Promise<Object>} updated records
 */
async function approveNegotiation(id, admin_user_id) {
    if (!id || !admin_user_id) {
        throw new Error('Negotiation ID and admin_user_id are required');
    }

    // Fetch negotiation
    const [negotiations] = await db.query(
        `SELECT n.*, o.margin_floor_pct, o.payout AS offer_payout, o.network_payout
         FROM 1ai_margin_negotiations n
         JOIN 1ai_offers o ON o.id = n.offer_id
         WHERE n.id = ?`,
        [id]
    );

    if (negotiations.length === 0) {
        throw new Error('Negotiation not found');
    }

    const neg = negotiations[0];

    if (neg.status !== 'pending') {
        throw new Error(`Negotiation is already ${neg.status}. Cannot approve.`);
    }

    // Re-validate margin floor
    if (neg.network_payout && neg.proposed_payout) {
        const marginPct = ((neg.network_payout - neg.proposed_payout) / neg.network_payout) * 100;
        if (marginPct < neg.margin_floor_pct) {
            throw new Error(
                `Proposed payout $${neg.proposed_payout} no longer meets margin floor. ` +
                `Current margin: ${marginPct.toFixed(2)}%, floor: ${neg.margin_floor_pct}%. ` +
                `Offer network payout may have changed.`
            );
        }
    }

    const conn = await db.getConnection();
    try {
        await conn.beginTransaction();

        // Update negotiation status
        await conn.query(
            `UPDATE 1ai_margin_negotiations
             SET status = 'approved', approved_by = ?, approved_at = NOW()
             WHERE id = ?`,
            [admin_user_id, id]
        );

        // Update or insert into offer_affiliate_access with custom payout
        const [existingAccess] = await conn.query(
            `SELECT id FROM 1ai_offer_affiliate_access
             WHERE offer_id = ? AND affiliate_id = ?`,
            [neg.offer_id, neg.affiliate_id]
        );

        if (existingAccess.length > 0) {
            await conn.query(
                `UPDATE 1ai_offer_affiliate_access
                 SET custom_payout = ?, assigned_by = ?, assigned_at = NOW(),
                     assignment_type = 'negotiated'
                 WHERE id = ?`,
                [neg.proposed_payout, admin_user_id, existingAccess[0].id]
            );
        } else {
            await conn.query(
                `INSERT INTO 1ai_offer_affiliate_access
                 (offer_id, affiliate_id, custom_payout, assigned_by, assignment_type, is_global, auto_approve)
                 VALUES (?, ?, ?, ?, 'negotiated', 0, 1)`,
                [neg.offer_id, neg.affiliate_id, neg.proposed_payout, admin_user_id]
            );
        }

        // Update offer base payout to reflect negotiated rate
        await conn.query(
            `UPDATE 1ai_offers SET payout = ? WHERE id = ? AND payout < ?`,
            [neg.proposed_payout, neg.offer_id, neg.proposed_payout]
        );

        await conn.commit();

        return {
            negotiation_id: id,
            offer_id: neg.offer_id,
            affiliate_id: neg.affiliate_id,
            approved_payout: neg.proposed_payout,
            status: 'approved',
            approved_by: admin_user_id
        };
    } catch (err) {
        await conn.rollback();
        console.error('[MarginNegotiation] approveNegotiation error:', err);
        throw err;
    } finally {
        conn.release();
    }
}

/**
 * Reject a pending negotiation
 * @param {number} id - negotiation ID
 * @param {string} reason - rejection reason
 * @returns {Promise<Object>} updated record
 */
async function rejectNegotiation(id, reason) {
    if (!id) throw new Error('Negotiation ID is required');
    if (!reason || reason.trim().length < 5) {
        throw new Error('Rejection reason required (min 5 characters)');
    }

    const [negotiations] = await db.query(
        `SELECT id, status FROM 1ai_margin_negotiations WHERE id = ?`,
        [id]
    );

    if (negotiations.length === 0) {
        throw new Error('Negotiation not found');
    }

    if (negotiations[0].status !== 'pending') {
        throw new Error(`Negotiation is already ${negotiations[0].status}. Cannot reject.`);
    }

    await db.query(
        `UPDATE 1ai_margin_negotiations
         SET status = 'rejected', rejection_reason = ?, rejected_at = NOW()
         WHERE id = ?`,
        [reason, id]
    );

    return { id, status: 'rejected', rejection_reason: reason };
}

/**
 * Expire pending negotiations older than the expiry threshold
 * @returns {Promise<number>} number of expired negotiations
 */
async function expireOldNegotiations() {
    const [result] = await db.query(
        `UPDATE 1ai_margin_negotiations
         SET status = 'expired', expired_at = NOW()
         WHERE status = 'pending'
           AND created_at < DATE_SUB(NOW(), INTERVAL ? DAY)`,
        [NEGOTIATION_EXPIRY_DAYS]
    );

    return result.affectedRows || 0;
}

/**
 * Get negotiation history for an offer or affiliate
 * @param {Object} filters
 * @param {number} [filters.offer_id]
 * @param {number} [filters.affiliate_id]
 * @param {string} [filters.status] - 'pending' | 'approved' | 'rejected' | 'expired'
 * @returns {Promise<Array>} negotiation records
 */
async function getNegotiations(filters = {}) {
    let sql = `
        SELECT n.*, o.name AS offer_name, aff.affiliate_code,
               u_approver.user_name AS approver_name
        FROM 1ai_margin_negotiations n
        JOIN 1ai_offers o ON o.id = n.offer_id
        LEFT JOIN 1ai_affiliates aff ON aff.id = n.affiliate_id
        LEFT JOIN 1ai_users u_approver ON u_approver.user_id = n.approved_by
        WHERE 1=1
    `;
    const params = [];

    if (filters.offer_id) {
        sql += ' AND n.offer_id = ?';
        params.push(filters.offer_id);
    }
    if (filters.affiliate_id) {
        sql += ' AND n.affiliate_id = ?';
        params.push(filters.affiliate_id);
    }
    if (filters.status) {
        sql += ' AND n.status = ?';
        params.push(filters.status);
    }

    sql += ' ORDER BY n.created_at DESC LIMIT 200';

    const [rows] = await db.query(sql, params);
    return rows;
}

module.exports = {
    proposePayout,
    autoCalculateMargin,
    approveNegotiation,
    rejectNegotiation,
    expireOldNegotiations,
    getNegotiations,
    NEGOTIATION_EXPIRY_DAYS
};
