'use strict';

const pool = require('../db/mysql');
const { queryOne, queryRows, queryInsert, queryUpdate } = require('../utils/queryHelpers');

// ─── LTV Settings ────────────────────────────────────────────────────────────

/**
 * Get LTV settings for an offer.
 * @param {number} offerId
 * @returns {Promise<object|null>}
 */
async function getLtvSettings(offerId) {
  return queryOne('SELECT * FROM 1ai_ltv_settings WHERE offer_id = ?', [offerId]);
}

/**
 * Upsert LTV settings for an offer.
 * @param {number} offerId
 * @param {number} lookbackDays
 * @param {number} minConversions
 * @param {string} status - 'active' or 'disabled'
 * @returns {Promise<number>} insertId
 */
async function upsertLtvSettings(offerId, lookbackDays, minConversions, status) {
  const now = Math.floor(Date.now() / 1000);
  return queryInsert(
    `INSERT INTO 1ai_ltv_settings (offer_id, lookback_days, min_conversions, status, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE
       lookback_days = VALUES(lookback_days),
       min_conversions = VALUES(min_conversions),
       status = VALUES(status),
       updated_at = VALUES(updated_at)`,
    [offerId, lookbackDays, minConversions, status, now, now]
  );
}

/**
 * Update LTV settings by id.
 * @param {number} id
 * @param {object} data - fields to update
 * @returns {Promise<number>} affectedRows
 */
async function updateLtvSettings(id, data) {
  const now = Math.floor(Date.now() / 1000);
  const updates = [];
  const params = [];

  if (data.lookback_days !== undefined) {
    updates.push('lookback_days = ?');
    params.push(data.lookback_days);
  }
  if (data.min_conversions !== undefined) {
    updates.push('min_conversions = ?');
    params.push(data.min_conversions);
  }
  if (data.status !== undefined) {
    updates.push('status = ?');
    params.push(data.status);
  }

  if (updates.length === 0) return 0;

  updates.push('updated_at = ?');
  params.push(now);
  params.push(id);

  return queryUpdate(
    `UPDATE 1ai_ltv_settings SET ${updates.join(', ')} WHERE id = ?`,
    params
  );
}

// ─── LTV Calculations ────────────────────────────────────────────────────────

/**
 * Get LTV calculation for an affiliate/offer/campaign combination.
 * @param {number} affiliateId
 * @param {number} offerId
 * @param {number} campaignId
 * @returns {Promise<object|null>}
 */
async function getLtv(affiliateId, offerId, campaignId) {
  return queryOne(
    `SELECT * FROM 1ai_ltv_calculations
     WHERE affiliate_id = ? AND offer_id = ? AND campaign_id = ?`,
    [affiliateId, offerId, campaignId]
  );
}

/**
 * Get top affiliates by LTV.
 * @param {number} limit
 * @returns {Promise<Array>}
 */
async function getTopLtv(limit = 10) {
  return queryRows(
    `SELECT * FROM 1ai_ltv_calculations
     ORDER BY ltv_90d DESC
     LIMIT ?`,
    [limit]
  );
}

/**
 * Calculate LTV from conversion logs for an affiliate/offer/campaign.
 * Computes multi-period revenue, avg order value, repeat rate, and churn.
 * @param {number} affiliateId
 * @param {number} offerId
 * @param {number} campaignId
 * @returns {Promise<number>} insertId
 */
async function calculateLtv(affiliateId, offerId, campaignId) {
  const now = Math.floor(Date.now() / 1000);

  // Get conversion aggregates for each lookback window
  const windows = [
    { days: 30, field: 'ltv_30d' },
    { days: 60, field: 'ltv_60d' },
    { days: 90, field: 'ltv_90d' },
    { days: 180, field: 'ltv_180d' },
    { days: 365, field: 'ltv_365d' },
  ];

  const results = {};
  let totalConversions = 0;
  let totalRevenue = 0;

  for (const w of windows) {
    const [rows] = await pool.query(
      `SELECT
         COUNT(*) AS conversions,
         COALESCE(SUM(affiliate_payout_snapshot), 0) AS revenue
       FROM 1ai_conversion_logs
       WHERE affiliate_id = ?
         AND aff_campaign_id = ?
         AND conversion_time > ?`,
      [affiliateId, campaignId, now - w.days * 86400]
    );

    const row = rows[0];
    results[w.field] = parseFloat(row.revenue) || 0;
    totalConversions += parseInt(row.conversions, 10) || 0;
    totalRevenue += parseFloat(row.revenue) || 0;
  }

  // Customer metrics — distinct click_ids with conversions in the full period
  const [customerRows] = await pool.query(
    `SELECT
       COUNT(DISTINCT click_id) AS total_customers,
       COUNT(*) AS total_conversions
     FROM 1ai_conversion_logs
     WHERE affiliate_id = ?
       AND aff_campaign_id = ?
       AND conversion_time > ?`,
    [affiliateId, campaignId, now - 365 * 86400]
  );

  // Returning customers: click_ids that have conversions > 7 days apart
  const [returnRows] = await pool.query(
    `SELECT COUNT(*) AS returning
     FROM (
       SELECT click_id
       FROM 1ai_conversion_logs
       WHERE affiliate_id = ?
         AND aff_campaign_id = ?
         AND conversion_time > ?
       GROUP BY click_id
       HAVING MAX(conversion_time) - MIN(conversion_time) > 604800
     ) r`,
    [affiliateId, campaignId, now - 365 * 86400]
  );

  const totalCustomers = parseInt(customerRows[0].total_customers, 10) || 0;
  const returningCustomers = parseInt(returnRows[0].returning, 10) || 0;
  const avgOrderValue = totalConversions > 0 ? totalRevenue / totalConversions : 0;
  const repeatRate = totalCustomers > 0 ? returningCustomers / totalCustomers : 0;
  const churnRate = 1 - repeatRate;

  // Determine confidence based on data volume
  let confidence = 'low';
  if (totalConversions >= 100) confidence = 'high';
  else if (totalConversions >= 20) confidence = 'medium';

  return queryInsert(
    `INSERT INTO 1ai_ltv_calculations
     (affiliate_id, offer_id, campaign_id,
      ltv_30d, ltv_60d, ltv_90d, ltv_180d, ltv_365d,
      avg_order_value, repeat_rate, churn_rate, confidence, calculated_at,
      created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE
       ltv_30d = VALUES(ltv_30d),
       ltv_60d = VALUES(ltv_60d),
       ltv_90d = VALUES(ltv_90d),
       ltv_180d = VALUES(ltv_180d),
       ltv_365d = VALUES(ltv_365d),
       avg_order_value = VALUES(avg_order_value),
       repeat_rate = VALUES(repeat_rate),
       churn_rate = VALUES(churn_rate),
       confidence = VALUES(confidence),
       calculated_at = VALUES(calculated_at),
       updated_at = VALUES(updated_at)`,
    [
      affiliateId, offerId, campaignId,
      results.ltv_30d, results.ltv_60d, results.ltv_90d,
      results.ltv_180d, results.ltv_365d,
      parseFloat(avgOrderValue.toFixed(4)),
      parseFloat(repeatRate.toFixed(4)),
      parseFloat(churnRate.toFixed(4)),
      confidence, now, now, now
    ]
  );
}

module.exports = {
  getLtvSettings, upsertLtvSettings, updateLtvSettings,
  getLtv, getTopLtv, calculateLtv,
};
