'use strict';

/**
 * Ad-block Detection Service
 * Logs & aggregates ad-block detection events.
 */

const pool = require('../db/mysql');

/**
 * Log an ad-block detection event.
 * @param {Object} opts
 * @param {string} opts.visitorId
 * @param {string} [opts.detectionMethod] - bait_script|iframe_test|api_test|header_analysis|extension_check
 * @param {string} [opts.blockerType] - uBlock / AdBlock / Brave / etc
 * @param {number} [opts.offerId]
 * @param {string} [opts.pageUrl]
 * @param {string} [opts.ipAddress]
 * @param {string} [opts.userAgent]
 */
async function logDetection({ visitorId, detectionMethod, blockerType, offerId, pageUrl, ipAddress, userAgent }) {
  try {
    const [result] = await pool.query(
      `INSERT INTO 1ai_ad_block_log
         (visitor_id, ip_address, user_agent, ad_block_detected, detection_method, blocker_type, offer_id, page_url, created_at)
       VALUES (?, ?, ?, 1, ?, ?, ?, ?, UNIX_TIMESTAMP())`,
      [visitorId, ipAddress || null, userAgent || null, detectionMethod || null, blockerType || null, offerId || null, pageUrl || null]
    );
    return { id: result.insertId };
  } catch (err) {
    console.error('adBlockService.logDetection error:', err.message);
    // Non-critical — return a synthetic id so callers don't break
    return { id: -1 };
  }
}

/**
 * Aggregate ad-block stats for a specific offer (or overall when omitted).
 * @param {number} [offerId]
 * @returns {Promise<{ total: number, byMethod: Object, byBlocker: Object }>}
 */
async function getStats(offerId) {
  const offerClause = offerId ? 'WHERE offer_id = ?' : '';
  const params = offerId ? [offerId] : [];

  const [[{ total }]] = await pool.query(
    `SELECT COUNT(*) AS total FROM 1ai_ad_block_log ${offerClause}`, params
  );

  const [byMethod] = await pool.query(
    `SELECT detection_method, COUNT(*) AS cnt FROM 1ai_ad_block_log ${offerClause} GROUP BY detection_method ORDER BY cnt DESC`, params
  );

  const [byBlocker] = await pool.query(
    `SELECT blocker_type, COUNT(*) AS cnt FROM 1ai_ad_block_log ${offerClause} GROUP BY blocker_type ORDER BY cnt DESC`, params
  );

  const [[{ uniqueVisitors }]] = await pool.query(
    `SELECT COUNT(DISTINCT visitor_id) AS uniqueVisitors FROM 1ai_ad_block_log ${offerClause}`, params
  );

  return {
    total,
    uniqueVisitors,
    byMethod: byMethod.reduce((acc, r) => { acc[r.detection_method || 'unknown'] = r.cnt; return acc; }, {}),
    byBlocker: byBlocker.reduce((acc, r) => { acc[r.blocker_type || 'unknown'] = r.cnt; return acc; }, {}),
  };
}

/**
 * Paginated ad-block log for a visitor.
 * @param {string} visitorId
 * @param {number} [page=1]
 * @param {number} [limit=50]
 * @returns {Promise<{ rows: Array, total: number, page: number, limit: number }>}
 */
async function getVisitorLog(visitorId, page = 1, limit = 50) {
  const offset = (page - 1) * limit;

  const [[{ total }]] = await pool.query(
    'SELECT COUNT(*) AS total FROM 1ai_ad_block_log WHERE visitor_id = ?', [visitorId]
  );

  const [rows] = await pool.query(
    `SELECT id, detection_method, blocker_type, offer_id, page_url, ip_address, created_at
     FROM 1ai_ad_block_log
     WHERE visitor_id = ?
     ORDER BY created_at DESC
     LIMIT ? OFFSET ?`,
    [visitorId, limit, offset]
  );

  return { rows, total, page, limit };
}

/**
 * Offers with high ad-block detection rates.
 * @returns {Promise<Array<{ offer_id: number, total: number, unique_visitors: number, last_detected: number }>>}
 */
async function getBlockedOffers() {
  const [rows] = await pool.query(
    `SELECT offer_id, COUNT(*) AS total, COUNT(DISTINCT visitor_id) AS unique_visitors, MAX(created_at) AS last_detected
     FROM 1ai_ad_block_log
     WHERE offer_id IS NOT NULL
     GROUP BY offer_id
     ORDER BY total DESC
     LIMIT 100`
  );
  return rows;
}

async function recordHit(visitorId) {
  try {
    await pool.query(
      `INSERT INTO 1ai_ad_block_visitors (visitor_id, hits, first_seen, last_seen)
       VALUES (?, 1, UNIX_TIMESTAMP(), UNIX_TIMESTAMP())
       ON DUPLICATE KEY UPDATE hits = hits + 1, last_seen = UNIX_TIMESTAMP()`,
      [visitorId]
    );
  } catch (err) {
    console.error('adBlockService.recordHit error:', err.message);
    // Non-critical — silently ignore
  }
}

module.exports = { logDetection, getStats, getVisitorLog, getBlockedOffers, recordHit };
