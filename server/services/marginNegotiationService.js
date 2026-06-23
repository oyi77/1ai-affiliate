'use strict';

/**
 * Margin Negotiation Service
 * Manages payout proposals between affiliates and offer managers.
 */

const pool = require('../db/mysql');

async function getNegotiations() {
  const [rows] = await pool.query(
    `SELECT n.*, o.name AS offer_name, a.affiliate_code
     FROM 1ai_margin_negotiations n
     LEFT JOIN 1ai_offers o ON o.id = n.offer_id
     LEFT JOIN 1ai_affiliates a ON a.id = n.affiliate_id
     ORDER BY n.id DESC LIMIT 200`
  );
  return rows;
}

async function propose({ offer_id, affiliate_id, proposed_payout, current_payout, reason, proposed_by }) {
  const [result] = await pool.query(
    `INSERT INTO 1ai_margin_negotiations
     (offer_id, affiliate_id, proposed_payout, current_payout, reason, proposed_by, status, created_at)
     VALUES (?, ?, ?, ?, ?, ?, 'pending', UNIX_TIMESTAMP())`,
    [offer_id, affiliate_id, proposed_payout, current_payout || 0, reason || '', proposed_by || 'admin']
  );
  return { id: result.insertId };
}

async function approve(id, admin_user_id) {
  const [result] = await pool.query(
    `UPDATE 1ai_margin_negotiations
     SET status = 'approved', approved_by = ?, approved_at = NOW()
     WHERE id = ? AND status = 'pending'`,
    [admin_user_id, id]
  );
  return { affected: result.affectedRows };
}

async function reject(id, admin_user_id) {
  const [result] = await pool.query(
    `UPDATE 1ai_margin_negotiations
     SET status = 'rejected', reviewed_by = ?, reviewed_at = UNIX_TIMESTAMP()
     WHERE id = ? AND status = 'pending'`,
    [admin_user_id, id]
  );
  return { affected: result.affectedRows };
}

async function expire() {
  const [result] = await pool.query(
    `UPDATE 1ai_margin_negotiations
     SET status = 'expired'
     WHERE status = 'pending' AND expires_at IS NOT NULL AND expires_at < UNIX_TIMESTAMP()`
  );
  return { expired: result.affectedRows };
}

module.exports = { getNegotiations, propose, approve, reject, expire };
