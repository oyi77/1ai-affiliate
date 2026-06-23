'use strict';

/**
 * Multi-Model Tracking Service
 * CPC, CPV, and CPM payout models.
 */

const pool = require('../db/mysql');

async function getEarnings(affiliateId) {
  const [rows] = await pool.query(
    `SELECT payout_model, COUNT(*) AS count, COALESCE(SUM(payout_amount), 0) AS total
     FROM 1ai_affiliate_earnings
     WHERE affiliate_id = ?
     GROUP BY payout_model`,
    [affiliateId]
  );
  return rows;
}

async function getCpmStatus(offerId, affiliateId) {
  const [rows] = await pool.query(
    `SELECT * FROM 1ai_cpm_batches
     WHERE offer_id = ? AND affiliate_id = ?
     ORDER BY id DESC LIMIT 10`,
    [offerId, affiliateId]
  );
  return rows;
}

async function recordCpc({ click_id, affiliate_id, offer_id, payout }) {
  const [result] = await pool.query(
    `INSERT INTO 1ai_affiliate_earnings
     (affiliate_id, conversion_id, payout_amount, status, payout_model, created_at)
     VALUES (?, NULL, ?, 'pending', 'CPC', UNIX_TIMESTAMP())`,
    [affiliate_id, payout || 0]
  );
  return { id: result.insertId };
}

async function recordCpv({ click_id, affiliate_id, offer_id, payout }) {
  const [result] = await pool.query(
    `INSERT INTO 1ai_affiliate_earnings
     (affiliate_id, conversion_id, payout_amount, status, payout_model, created_at)
     VALUES (?, NULL, ?, 'pending', 'CPV', UNIX_TIMESTAMP())`,
    [affiliate_id, payout || 0]
  );
  return { id: result.insertId };
}

async function recordCpm({ offer_id, affiliate_id, impressions, payout }) {
  const [result] = await pool.query(
    `INSERT INTO 1ai_cpm_batches
     (offer_id, affiliate_id, impressions, payout, status, created_at)
     VALUES (?, ?, ?, ?, 'pending', UNIX_TIMESTAMP())`,
    [offer_id, affiliate_id, impressions || 0, payout || 0]
  );
  return { id: result.insertId };
}

module.exports = { getEarnings, getCpmStatus, recordCpc, recordCpv, recordCpm };
