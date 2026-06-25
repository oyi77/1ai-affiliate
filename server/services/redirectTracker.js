'use strict';

/**
 * Redirect Tracker — Track redirect chains with timing, hops, and metadata.
 * Used to log the full redirect path from click to final destination.
 */

const pool = require('../db/mysql');

/**
 * Record a redirect hop in the chain.
 * @param {Object} params
 * @param {string} params.click_id - Unique click identifier
 * @param {string} params.from_url - Source URL
 * @param {string} params.to_url - Destination URL
 * @param {number} params.hop_number - Position in redirect chain (1-based)
 * @param {number} params.status_code - HTTP status code (301, 302, etc.)
 * @param {number} params.redirect_time_ms - Time taken for this redirect in ms
 * @param {string} params.method - HTTP method used
 * @param {Object} params.headers - Response headers (relevant ones)
 */
async function recordRedirect({ click_id, from_url, to_url, hop_number, status_code, redirect_time_ms, method, headers }) {
  try {
    await pool.query(
      `INSERT INTO 1ai_redirect_log (click_id, from_url, to_url, hop_number, status_code, redirect_time_ms, method, content_type, server_header, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, UNIX_TIMESTAMP())`,
      [
        click_id,
        (from_url || '').substring(0, 2048),
        (to_url || '').substring(0, 2048),
        hop_number || 1,
        status_code || 302,
        redirect_time_ms || 0,
        method || 'GET',
        headers?.['content-type'] || null,
        headers?.['server'] || null,
      ]
    );
  } catch (err) {
    // Table may not exist yet — fail silently
    console.error('recordRedirect error:', err.message);
  }
}

/**
 * Record the full redirect chain for a click.
 * @param {string} click_id
 * @param {Array<{from, to, status, time_ms}>} chain
 */
async function recordRedirectChain(click_id, chain) {
  for (let i = 0; i < chain.length; i++) {
    const hop = chain[i];
    await recordRedirect({
      click_id,
      from_url: hop.from,
      to_url: hop.to,
      hop_number: i + 1,
      status_code: hop.status || 302,
      redirect_time_ms: hop.time_ms || 0,
      method: hop.method || 'GET',
      headers: hop.headers || {},
    });
  }
}

/**
 * Get redirect chain for a click.
 * @param {string} click_id
 * @returns {Array} Ordered redirect hops
 */
async function getRedirectChain(click_id) {
  try {
    const [rows] = await pool.query(
      `SELECT * FROM 1ai_redirect_log WHERE click_id = ? ORDER BY hop_number ASC`,
      [click_id]
    );
    return rows;
  } catch {
    return [];
  }
}

/**
 * Get redirect analytics — average hops, time, status distribution.
 * @param {Object} filters
 * @returns {Object}
 */
async function getRedirectAnalytics(filters = {}) {
  try {
    const where = [];
    const params = [];

    if (filters.campaign_id) {
      where.push('rl.click_id IN (SELECT click_id FROM 1ai_click_log WHERE offer_id = ?)');
      params.push(filters.campaign_id);
    }
    if (filters.start_date) {
      where.push('rl.created_at >= ?');
      params.push(filters.start_date);
    }
    if (filters.end_date) {
      where.push('rl.created_at <= ?');
      params.push(filters.end_date);
    }

    const whereClause = where.length ? `WHERE ${where.join(' AND ')}` : '';

    const [[stats]] = await pool.query(
      `SELECT
         COUNT(DISTINCT rl.click_id) as total_clicks,
         AVG(rl.hop_number) as avg_hops,
         AVG(rl.redirect_time_ms) as avg_redirect_time_ms,
         MAX(rl.redirect_time_ms) as max_redirect_time_ms,
         SUM(CASE WHEN rl.status_code = 301 THEN 1 ELSE 0 END) as permanent_redirects,
         SUM(CASE WHEN rl.status_code = 302 THEN 1 ELSE 0 END) as temporary_redirects,
         SUM(CASE WHEN rl.status_code >= 400 THEN 1 ELSE 0 END) as error_redirects
       FROM 1ai_redirect_log rl ${whereClause}`,
      params
    );

    // Status code distribution
    const [statusDist] = await pool.query(
      `SELECT rl.status_code, COUNT(*) as count
       FROM 1ai_redirect_log rl ${whereClause}
       GROUP BY rl.status_code ORDER BY count DESC`,
      params
    );

    return {
      ...stats,
      status_distribution: statusDist,
    };
  } catch (err) {
    console.error('getRedirectAnalytics error:', err.message);
    return { total_clicks: 0, avg_hops: 0, avg_redirect_time_ms: 0 };
  }
}

module.exports = {
  recordRedirect,
  recordRedirectChain,
  getRedirectChain,
  getRedirectAnalytics,
};
