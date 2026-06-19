'use strict';

/**
 * Account Manager (AM) Controller
 * Handles offer assignment (Specific vs Global), margin safety, AM-to-affiliate mapping
 */

const db = require('../db/mysql');

/**
 * Assign offer to a specific affiliate (Specific assignment)
 * POST /api/am/assign
 * Body: { offer_id, affiliate_id, custom_payout?, auto_approve?, expires_at?, notes? }
 */
async function assignOfferToAffiliate(req, res) {
    try {
        const { offer_id, affiliate_id, custom_payout, auto_approve, expires_at, notes } = req.body;
        const amUserId = req.user.id;

        // Validate required fields
        if (!offer_id || !affiliate_id) {
            return res.status(422).json({ error: 'offer_id and affiliate_id are required' });
        }

        // Verify offer exists and is approved
        const [offers] = await db.query(
            `SELECT id, name, approval_status, payout, network_payout, margin_floor_pct, payout_model
             FROM 1ai_offers WHERE id = ?`,
            [offer_id]
        );
        if (offers.length === 0) {
            return res.status(404).json({ error: 'Offer not found' });
        }
        const offer = offers[0];

        if (offer.approval_status !== 'approved') {
            return res.status(409).json({
                error: `Offer must be approved first. Current status: ${offer.approval_status}`
            });
        }

        // Verify affiliate exists by checking user_id in 1ai_users + 1ai_affiliates
        const [affiliates] = await db.query(
            `SELECT a.id, a.user_id, u.user_active
             FROM 1ai_affiliates a
             JOIN 1ai_users u ON u.user_id = a.user_id
             WHERE a.id = ?`,
            [affiliate_id]
        );
        if (affiliates.length === 0) {
            return res.status(404).json({ error: 'Affiliate not found' });
        }
        const affUserStatus = affiliates[0].user_active;

        // Evaluate custom_payout against margin floor
        let finalPayout = custom_payout || offer.payout;
        if (custom_payout) {
            if (custom_payout > offer.network_payout) {
                return res.status(422).json({
                    error: `Payout $${custom_payout} exceeds network payout $${offer.network_payout}. Negative margin not allowed.`
                });
            }
            const marginPct = ((offer.network_payout - custom_payout) / offer.network_payout) * 100;
            if (marginPct < offer.margin_floor_pct) {
                const maxPayout = offer.network_payout * (1 - offer.margin_floor_pct / 100);
                return res.status(422).json({
                    error: `Payout $${custom_payout} exceeds margin floor. Max allowed at ${offer.margin_floor_pct}% margin: $${maxPayout.toFixed(4)}`,
                    margin_floor_pct: offer.margin_floor_pct,
                    max_allowed_payout: Number(maxPayout.toFixed(4)),
                    current_margin_pct: Number(marginPct.toFixed(2))
                });
            }
        }

        // Check if assignment already exists
        const [existing] = await db.query(
            `SELECT id FROM 1ai_offer_affiliate_access WHERE offer_id = ? AND affiliate_id = ?`,
            [offer_id, affiliate_id]
        );

        const conn = await db.getConnection();
        try {
            await conn.beginTransaction();

            if (existing.length > 0) {
                // Update existing assignment
                await conn.query(
                    `UPDATE 1ai_offer_affiliate_access
                     SET custom_payout = ?, assigned_by = ?, assigned_at = NOW(),
                         assignment_type = 'specific', is_global = 0,
                         auto_approve = ?, expires_at = ?, notes = ?
                     WHERE id = ?`,
                    [
                        finalPayout, amUserId,
                        auto_approve ? 1 : 0,
                        expires_at || null,
                        notes || null,
                        existing[0].id
                    ]
                );
            } else {
                // Create new assignment
                await conn.query(
                    `INSERT INTO 1ai_offer_affiliate_access
                     (offer_id, affiliate_id, custom_payout, assigned_by, assignment_type, is_global, auto_approve, expires_at, notes)
                     VALUES (?, ?, ?, ?, 'specific', 0, ?, ?, ?)`,
                    [
                        offer_id, affiliate_id,
                        finalPayout, amUserId,
                        auto_approve ? 1 : 0,
                        expires_at || null,
                        notes || null
                    ]
                );
            }

            await conn.commit();
            res.json({
                ok: true,
                message: `Offer "${offer.name}" assigned to affiliate #${affiliate_id}`,
                assignment: {
                    offer_id,
                    affiliate_id,
                    payout: finalPayout,
                    assignment_type: 'specific',
                    auto_approve: !!auto_approve,
                    expires_at: expires_at || null
                }
            });
        } catch (txErr) {
            await conn.rollback();
            throw txErr;
        } finally {
            conn.release();
        }
    } catch (err) {
        console.error('[AM] assignOfferToAffiliate error:', err);
        res.status(500).json({ error: 'Failed to assign offer' });
    }
}

/**
 * Global assignment — makes offer visible to all publishers
 * POST /api/am/assign-global
 * Body: { offer_id, custom_payout?, expires_at?, notes? }
 */
async function assignOfferGlobally(req, res) {
    try {
        const { offer_id, custom_payout, expires_at, notes } = req.body;
        const amUserId = req.user.id;

        if (!offer_id) {
            return res.status(422).json({ error: 'offer_id is required' });
        }

        const [offers] = await db.query(
            `SELECT id, name, approval_status, payout, network_payout, margin_floor_pct FROM 1ai_offers WHERE id = ?`,
            [offer_id]
        );
        if (offers.length === 0) return res.status(404).json({ error: 'Offer not found' });
        const offer = offers[0];
        if (offer.approval_status !== 'approved') {
            return res.status(409).json({ error: `Offer must be approved first. Status: ${offer.approval_status}` });
        }

        // Margin check
        const finalPayout = custom_payout || offer.payout;
        if (finalPayout > offer.network_payout) {
            return res.status(422).json({ error: `Payout $${finalPayout} exceeds network payout $${offer.network_payout}` });
        }
        const marginPct = ((offer.network_payout - finalPayout) / offer.network_payout) * 100;
        if (marginPct < offer.margin_floor_pct) {
            const maxAllowed = offer.network_payout * (1 - offer.margin_floor_pct / 100);
            return res.status(422).json({
                error: `Payout $${finalPayout} exceeds margin floor for global assignment. Max: $${maxAllowed.toFixed(4)}`
            });
        }

        // Upsert global access marker
        const [existing] = await db.query(
            `SELECT id FROM 1ai_offer_affiliate_access
             WHERE offer_id = ? AND is_global = 1 AND affiliate_id IS NULL`,
            [offer_id]
        );

        if (existing.length > 0) {
            await db.query(
                `UPDATE 1ai_offer_affiliate_access
                 SET custom_payout = ?, assigned_by = ?, assigned_at = NOW(),
                     expires_at = ?, notes = ?
                 WHERE id = ?`,
                [finalPayout, amUserId, expires_at || null, notes || null, existing[0].id]
            );
        } else {
            await db.query(
                `INSERT INTO 1ai_offer_affiliate_access
                 (offer_id, affiliate_id, custom_payout, assigned_by, assignment_type, is_global, auto_approve, expires_at, notes)
                 VALUES (?, NULL, ?, ?, 'global', 1, 1, ?, ?)`,
                [offer_id, finalPayout, amUserId, expires_at || null, notes || null]
            );
        }

        res.json({
            ok: true,
            message: `Offer "${offer.name}" assigned globally to all publishers`,
            assignment: {
                offer_id,
                payout: finalPayout,
                assignment_type: 'global',
                expires_at: expires_at || null
            }
        });
    } catch (err) {
        console.error('[AM] assignOfferGlobally error:', err);
        res.status(500).json({ error: 'Failed global assignment' });
    }
}

/**
 * Remove assignment from an affiliate
 * POST /api/am/assign/:id/remove
 */
async function removeAssignment(req, res) {
    try {
        const assignId = parseInt(req.params.id, 10);
        if (!assignId) return res.status(400).json({ error: 'Invalid assignment ID' });

        const [existing] = await db.query(
            `SELECT id, offer_id, affiliate_id, is_global FROM 1ai_offer_affiliate_access WHERE id = ?`,
            [assignId]
        );
        if (existing.length === 0) return res.status(404).json({ error: 'Assignment not found' });

        await db.query(`DELETE FROM 1ai_offer_affiliate_access WHERE id = ?`, [assignId]);

        res.json({
            ok: true,
            message: existing[0].is_global
                ? 'Global assignment removed'
                : `Assignment removed for affiliate #${existing[0].affiliate_id}`,
            assignmentId: assignId
        });
    } catch (err) {
        console.error('[AM] removeAssignment error:', err);
        res.status(500).json({ error: 'Failed to remove assignment' });
    }
}

/**
 * List all assignments (with filters)
 * GET /api/am/assignments?offer_id=&affiliate_id=&type=
 */
async function listAssignments(req, res) {
    try {
        const { offer_id, affiliate_id, type } = req.query;
        let sql = `
            SELECT a.*, o.name AS offer_name, o.type AS payout_model, o.payout AS base_payout,
                   aff.id AS aff_id, u.user_name AS assigned_by_name
            FROM 1ai_offer_affiliate_access a
            JOIN 1ai_offers o ON o.id = a.offer_id
            LEFT JOIN 1ai_affiliates aff ON aff.id = a.affiliate_id
            LEFT JOIN 1ai_users u ON u.user_id = a.assigned_by
            WHERE 1=1
        `;
        const params = [];

        if (offer_id) { sql += ` AND a.offer_id = ?`; params.push(parseInt(offer_id)); }
        if (affiliate_id) { sql += ` AND a.affiliate_id = ?`; params.push(parseInt(affiliate_id)); }
        if (type) { sql += ` AND a.assignment_type = ?`; params.push(type); }

        sql += ` ORDER BY a.assigned_at DESC LIMIT 200`;

        const [rows] = await db.query(sql, params);
        res.json({ ok: true, assignments: rows, total: rows.length });
    } catch (err) {
        console.error('[AM] listAssignments error:', err);
        res.status(500).json({ error: 'Failed to list assignments' });
    }
}

/**
 * List AM-to-affiliate mappings
 * GET /api/am/mappings?am_user_id=&affiliate_id=
 */
async function listAmMappings(req, res) {
    try {
        const { am_user_id, affiliate_id } = req.query;
        let sql = `
            SELECT am.*, u_am.user_name AS am_name, u_admin.user_name AS assigned_by_name, aff.id AS aff_id
            FROM 1ai_am_assignments am
            JOIN 1ai_users u_am ON u_am.user_id = am.am_user_id
            LEFT JOIN 1ai_users u_admin ON u_admin.user_id = am.assigned_by
            LEFT JOIN 1ai_affiliates aff ON aff.id = am.affiliate_id
            WHERE 1=1
        `;
        const params = [];
        if (am_user_id) { sql += ` AND am.am_user_id = ?`; params.push(parseInt(am_user_id)); }
        if (affiliate_id) { sql += ` AND am.affiliate_id = ?`; params.push(parseInt(affiliate_id)); }
        sql += ` ORDER BY am.created_at DESC LIMIT 100`;

        const [rows] = await db.query(sql, params);
        res.json({ ok: true, mappings: rows, total: rows.length });
    } catch (err) {
        console.error('[AM] listAmMappings error:', err);
        res.status(500).json({ error: 'Failed to list AM mappings' });
    }
}

/**
 * Assign AM to affiliate (Admin only, delegated via middleware)
 * POST /api/am/map
 */
async function mapAmToAffiliate(req, res) {
    try {
        const { am_user_id, affiliate_id, assignment_type, notes } = req.body;
        if (!am_user_id || !affiliate_id) {
            return res.status(422).json({ error: 'am_user_id and affiliate_id required' });
        }

        // Verify AM user exists and has 'am' role
        const [amUsers] = await db.query(
            `SELECT user_id, user_role, user_name FROM 1ai_users WHERE user_id = ?`,
            [am_user_id]
        );
        if (amUsers.length === 0) return res.status(404).json({ error: 'AM user not found' });
        if (amUsers[0].user_role !== 'am' && amUsers[0].user_role !== 'admin') {
            return res.status(422).json({ error: 'User is not an Account Manager' });
        }

        // Upsert mapping
        await db.query(
            `INSERT INTO 1ai_am_assignments (am_user_id, affiliate_id, assignment_type, assigned_by, notes)
             VALUES (?, ?, ?, ?, ?)
             ON DUPLICATE KEY UPDATE assignment_type = VALUES(assignment_type), notes = VALUES(notes), updated_at = NOW()`,
            [am_user_id, affiliate_id, assignment_type || 'primary', req.user.id, notes || null]
        );

        res.json({
            ok: true,
            message: `AM ${amUsers[0].user_name} → Affiliate #${affiliate_id}`,
            mapping: { am_user_id, affiliate_id, assignment_type: assignment_type || 'primary' }
        });
    } catch (err) {
        console.error('[AM] mapAmToAffiliate error:', err);
        res.status(500).json({ error: 'Failed to map AM to affiliate' });
    }
}

module.exports = {
    assignOfferToAffiliate,
    assignOfferGlobally,
    removeAssignment,
    listAssignments,
    listAmMappings,
    mapAmToAffiliate
};
