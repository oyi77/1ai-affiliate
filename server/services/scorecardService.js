'use strict';

const pool = require('../db/mysql');
const { queryOne, queryRows, queryInsert } = require('../utils/queryHelpers');

/**
 * Get current scorecard for an affiliate.
 * @param {number} affiliateId
 * @returns {Promise<object|null>}
 */
async function getScorecard(affiliateId) {
  return queryOne('SELECT * FROM 1ai_affiliate_scorecards WHERE affiliate_id = ?', [affiliateId]);
}

/**
 * Get scorecard history entries for an affiliate.
 * @param {number} affiliateId
 * @param {number} [limit=30]
 * @returns {Promise<Array>}
 */
async function getScorecardHistory(affiliateId, limit = 30) {
  return queryRows(
    `SELECT * FROM 1ai_scorecard_history WHERE affiliate_id = ? ORDER BY calculated_at DESC LIMIT ?`,
    [affiliateId, limit]
  );
}

/**
 * Get all scorecards, optionally filtered by tier.
 * @param {string} [tier]
 * @returns {Promise<Array>}
 */
async function getScorecards(tier) {
  if (tier) {
    return queryRows(
      'SELECT * FROM 1ai_affiliate_scorecards WHERE tier = ? ORDER BY overall_score DESC',
      [tier]
    );
  }
  return queryRows('SELECT * FROM 1ai_affiliate_scorecards ORDER BY overall_score DESC');
}

/**
 * Compute and persist a scorecard for the given affiliate.
 * Reads click/conversion data and produces five sub-scores plus a
 * weighted overall score, then upserts the scorecard and inserts a
 * history row.
 *
 * @param {number} affiliateId
 * @returns {Promise<object>} — the persisted scorecard row
 */
async function calculateScorecard(affiliateId) {
  const now = Math.floor(Date.now() / 1000);

  // ── Gather click & conversion stats ──────────────────────────────
  const [statsRows] = await pool.query(
    `SELECT
       COUNT(*)                                                     AS total_clicks,
       COALESCE(SUM(payout), 0)                                     AS total_revenue,
       COALESCE(SUM(converted), 0)                                   AS total_conversions,
       COALESCE(SUM(CASE WHEN converted = 1 THEN payout ELSE 0 END), 0) AS conv_revenue
     FROM 1ai_click_log
     WHERE affiliate_id = ?`,
    [affiliateId]
  );
  const stats = statsRows[0] || { total_clicks: 0, total_revenue: 0, total_conversions: 0, conv_revenue: 0 };

  // ── Daily breakdown for consistency & growth ─────────────────────
  const [dailyRows] = await pool.query(
    `SELECT
       DATE(FROM_UNIXTIME(clicked_at))                               AS day,
       COUNT(*)                                                      AS clicks,
       COALESCE(SUM(converted), 0)                                   AS conversions
     FROM 1ai_click_log
     WHERE affiliate_id = ?
     GROUP BY DATE(FROM_UNIXTIME(clicked_at))
     ORDER BY day ASC`,
    [affiliateId]
  );

  // ── Month-over-month revenue growth ──────────────────────────────
  const [monthRows] = await pool.query(
    `SELECT
       DATE_FORMAT(FROM_UNIXTIME(clicked_at), '%Y-%m')               AS month,
       COALESCE(SUM(payout), 0)                                      AS revenue
     FROM 1ai_click_log
     WHERE affiliate_id = ?
     GROUP BY month
     ORDER BY month ASC`,
    [affiliateId]
  );

  const totalClicks = Number(stats.total_clicks) || 0;
  const totalConversions = Number(stats.total_conversions) || 0;
  const totalRevenue = Number(stats.total_revenue) || 0;
  const days = dailyRows.length;
  const months = monthRows.length;

  // ── Compute scores (0–100 scale) ─────────────────────────────────

  // conversion_rate_score: based on overall conversion rate
  let conversionRateScore = 0;
  if (totalClicks > 0) {
    const rate = totalConversions / totalClicks;
    // 5%+ → 100, 2% → 50, 0% → 0
    conversionRateScore = Math.min(100, Math.round((rate / 0.05) * 100));
  }

  // volume_score: based on total clicks
  let volumeScore = 0;
  // 5000+ clicks → 100, scaled proportionally
  volumeScore = Math.min(100, Math.round((totalClicks / 5000) * 100));

  // quality_score: consistency of conversion rates across days
  let qualityScore = 60; // default when little data
  if (days >= 3) {
    const rates = dailyRows.map(r => (Number(r.clicks) > 0 ? Number(r.conversions) / Number(r.clicks) : 0));
    const avgRate = rates.reduce((a, b) => a + b, 0) / rates.length;
    if (avgRate > 0) {
      const variance = rates.reduce((sum, r) => sum + (r - avgRate) ** 2, 0) / rates.length;
      const cv = Math.sqrt(variance) / avgRate; // coefficient of variation
      // Lower CV = more consistent → higher score
      qualityScore = Math.min(100, Math.max(0, Math.round((1 - Math.min(cv, 2) / 2) * 100)));
    }
  }

  // growth_score: month-over-month revenue growth
  let growthScore = 30; // default for no or single month
  if (months >= 2) {
    const revenues = monthRows.map(r => Number(r.revenue));
    const growthRates = [];
    for (let i = 1; i < revenues.length; i++) {
      if (revenues[i - 1] > 0) {
        growthRates.push(revenues[i] / revenues[i - 1]);
      }
    }
    if (growthRates.length > 0) {
      const avgGrowth = growthRates.reduce((a, b) => a + b, 0) / growthRates.length;
      // 2x+ growth → 100, 1x (flat) → 50, 0x → 0
      growthScore = Math.min(100, Math.max(0, Math.round((avgGrowth / 2) * 100)));
    } else if (revenues.length > 0 && revenues[revenues.length - 1] > 0) {
      // Positive revenue in latest month = some growth
      growthScore = 50;
    }
  }

  // revenue_score: based on total revenue
  let revenueScore = 0;
  // $5000+ → 100
  revenueScore = Math.min(100, Math.round((totalRevenue / 5000) * 100));

  // overall_score: weighted average
  const overallScore = Math.min(100, Math.round(
    conversionRateScore * 0.25 +
    volumeScore * 0.20 +
    qualityScore * 0.20 +
    growthScore * 0.15 +
    revenueScore * 0.20
  ));

  // ── Determine tier based on overall score ────────────────────────
  let tier = 'bronze';
  if (overallScore >= 90) tier = 'diamond';
  else if (overallScore >= 75) tier = 'platinum';
  else if (overallScore >= 60) tier = 'gold';
  else if (overallScore >= 40) tier = 'silver';

  // ── Compute rank among all affiliates ────────────────────────────
  const [rankRows] = await pool.query(
    `SELECT COUNT(*) + 1 AS rank FROM 1ai_affiliate_scorecards
     WHERE overall_score > ?`,
    [overallScore]
  );
  const rank = rankRows[0]?.rank || 0;

  const [countRows] = await pool.query(
    'SELECT COUNT(*) AS total FROM 1ai_affiliate_scorecards'
  );
  const totalAffiliates = countRows[0]?.total || 0;

  // ── Upsert into scorecards table ─────────────────────────────────
  await pool.query(
    `INSERT INTO 1ai_affiliate_scorecards
       (affiliate_id, overall_score, conversion_rate_score, volume_score,
        quality_score, growth_score, revenue_score, tier, rank,
        total_affiliates, calculated_at, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE
       overall_score           = VALUES(overall_score),
       conversion_rate_score   = VALUES(conversion_rate_score),
       volume_score            = VALUES(volume_score),
       quality_score           = VALUES(quality_score),
       growth_score            = VALUES(growth_score),
       revenue_score           = VALUES(revenue_score),
       tier                    = VALUES(tier),
       rank                    = VALUES(rank),
       total_affiliates        = VALUES(total_affiliates),
       calculated_at           = VALUES(calculated_at),
       updated_at              = VALUES(updated_at)`,
    [
      affiliateId, overallScore, conversionRateScore, volumeScore,
      qualityScore, growthScore, revenueScore, tier, rank,
      totalAffiliates, now, now, now
    ]
  );

  // ── Insert history row ───────────────────────────────────────────
  await pool.query(
    `INSERT INTO 1ai_scorecard_history
       (affiliate_id, overall_score, tier, rank, calculated_at)
     VALUES (?, ?, ?, ?, ?)`,
    [affiliateId, overallScore, tier, rank, now]
  );

  // Return the fresh record
  return queryOne('SELECT * FROM 1ai_affiliate_scorecards WHERE affiliate_id = ?', [affiliateId]);
}

module.exports = { getScorecard, getScorecardHistory, getScorecards, calculateScorecard };
