'use strict';
/**
 * Gapfill Routes - Affiliate Offer Access
 * Split from server/routes/gapfill.js (800-line gate).
 */

const express = require('express');
const router = express.Router();
const pool = require('../../db/mysql');



// ═══════════════════════════════════════════════════════════════════
// AFFILIATE OFFER ACCESS FLOW
// ═══════════════════════════════════════════════════════════════════

router.post('/offers/:id/apply', async (req, res) => {
  try {
    const offerId = req.params.id;
    const [affiliates] = await pool.query(
      'SELECT id FROM 1ai_affiliates WHERE user_id = ?',
      [req.user.id]
    );
    if (!affiliates.length) return res.status(404).json({ error: 'Affiliate not found' });
    const affiliateId = affiliates[0].id;

    await pool.query(
      `INSERT INTO 1ai_offer_affiliate_access (offer_id, affiliate_id, status, assigned_by, assignment_type, created_at)
       VALUES (?, ?, 'pending', ?, 'specific', UNIX_TIMESTAMP())`,
      [offerId, affiliateId, req.user.id]
    );
    res.json({ success: true, status: 'pending' });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') return res.status(409).json({ error: 'Already applied to this offer' });
    res.status(500).json({ error: 'Failed to apply', detail: err.message });
  }
});



// ── POST /offers/access/:id/approve — admin approves application ────
router.post('/offers/access/:id/approve', async (req, res) => {
  try {
    await pool.query(
      "UPDATE 1ai_offer_affiliate_access SET status = 'approved' WHERE id = ?",
      [req.params.id]
    );
    res.json({ success: true, status: 'approved' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to approve', detail: err.message });
  }
});


// ── POST /offers/access/:id/reject — admin rejects application ──────
router.post('/offers/access/:id/reject', async (req, res) => {
  try {
    await pool.query(
      "UPDATE 1ai_offer_affiliate_access SET status = 'revoked' WHERE id = ?",
      [req.params.id]
    );
    res.json({ success: true, status: 'revoked' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to reject', detail: err.message });
  }
});

module.exports = router;
