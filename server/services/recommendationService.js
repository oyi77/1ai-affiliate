'use strict';

const { queryOne, queryRows, queryInsert, queryUpdate } = require('../utils/queryHelpers');

/**
 * Create a manual offer recommendation for an affiliate.
 * @param {number} affiliateId
 * @param {number} offerId
 * @param {number} score - decimal score
 * @param {string} reason - recommendation reason
 * @param {string} recType - recommendation_type enum value
 * @param {number} [expiresAt] - unix timestamp when this recommendation expires
 * @returns {Promise<number>} insertId
 */
async function createRecommendation(affiliateId, offerId, score, reason, recType, expiresAt) {
  const now = Math.floor(Date.now() / 1000);
  return queryInsert(
    `INSERT INTO 1ai_offer_recommendations
     (affiliate_id, offer_id, score, reason, recommendation_type, expires_at, clicked, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, 0, ?, ?)`,
    [affiliateId, offerId, score, reason, recType, expiresAt || null, now, now]
  );
}

/**
 * List recommendations for an affiliate, optionally filtered by type.
 * @param {number} affiliateId
 * @param {string} [type] - recommendation_type to filter by
 * @returns {Promise<Array>}
 */
async function getRecommendations(affiliateId, type) {
  if (type) {
    return queryRows(
      'SELECT * FROM 1ai_offer_recommendations WHERE affiliate_id = ? AND recommendation_type = ? ORDER BY score DESC, created_at DESC',
      [affiliateId, type]
    );
  }
  return queryRows(
    'SELECT * FROM 1ai_offer_recommendations WHERE affiliate_id = ? ORDER BY score DESC, created_at DESC',
    [affiliateId]
  );
}

/**
 * Log a click on a recommendation. Marks the recommendation as clicked and
 * records the event in the recommendation_logs table.
 * @param {number} recommendationId
 * @returns {Promise<{clicked: boolean, logId: number}>}
 */
async function logClick(recommendationId) {
  const rec = await queryOne(
    'SELECT id, affiliate_id, offer_id, recommendation_type FROM 1ai_offer_recommendations WHERE id = ?',
    [recommendationId]
  );

  if (!rec) {
    const err = new Error('Recommendation not found');
    err.status = 404;
    throw err;
  }

  // Mark clicked (idempotent — already = 1 is fine)
  await queryUpdate(
    'UPDATE 1ai_offer_recommendations SET clicked = 1, updated_at = ? WHERE id = ?',
    [Math.floor(Date.now() / 1000), recommendationId]
  );

  // Insert click log
  const now = Math.floor(Date.now() / 1000);
  const logId = await queryInsert(
    `INSERT INTO 1ai_recommendation_logs
     (affiliate_id, offer_id, recommendation_type, clicked, clicked_at, created_at)
     VALUES (?, ?, ?, 1, ?, ?)`,
    [rec.affiliate_id, rec.offer_id, rec.recommendation_type, now, now]
  );

  return { clicked: true, logId };
}

/**
 * Delete a recommendation by id.
 * @param {number} id
 * @returns {Promise<number>} affectedRows
 */
async function deleteRecommendation(id) {
  return queryUpdate('DELETE FROM 1ai_offer_recommendations WHERE id = ?', [id]);
}

/**
 * Placeholder for the auto-recommendation engine.
 * Actual logic runs via a background cron job.
 * @returns {Promise<{message: string}>}
 */
async function generateAutoRecommendations() {
  return { message: 'Auto-recommendation engine runs via background cron' };
}

module.exports = {
  createRecommendation,
  getRecommendations,
  logClick,
  deleteRecommendation,
  generateAutoRecommendations,
};
