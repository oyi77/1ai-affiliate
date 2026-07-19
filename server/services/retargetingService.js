'use strict';

const { queryOne, queryRows, queryInsert, queryUpdate } = require('../utils/queryHelpers');

/**
 * Create a retargeting pixel for an affiliate.
 * @param {number} affiliateId
 * @param {string} pixelType - facebook|tiktok|pinterest|taboola|outbrain|custom
 * @param {string} pixelId
 * @param {string} pixelCode
 * @param {string} fireOn - click|conversion|view|both
 * @returns {Promise<number>} insertId
 */
async function createPixel(affiliateId, pixelType, pixelId, pixelCode, fireOn) {
  const now = Math.floor(Date.now() / 1000);
  return queryInsert(
    `INSERT INTO 1ai_retargeting_pixels
     (affiliate_id, pixel_type, pixel_id, pixel_code, fire_on, status, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, 'active', ?, ?)`,
    [affiliateId, pixelType, pixelId, pixelCode, fireOn, now, now]
  );
}

/**
 * List retargeting pixels for an affiliate.
 * @param {number} affiliateId
 * @returns {Promise<Array>}
 */
async function getPixels(affiliateId) {
  return queryRows(
    'SELECT * FROM 1ai_retargeting_pixels WHERE affiliate_id = ? ORDER BY created_at DESC',
    [affiliateId]
  );
}

/**
 * Update a retargeting pixel. Only whitelisted columns are accepted.
 * @param {number} id
 * @param {object} data - fields to update
 * @returns {Promise<number>} affectedRows
 */
async function updatePixel(id, data) {
  const now = Math.floor(Date.now() / 1000);
  const allowed = ['pixel_type', 'pixel_id', 'pixel_code', 'fire_on', 'status'];
  const sets = [];
  const params = [];

  for (const key of allowed) {
    if (data[key] !== undefined) {
      sets.push(`${key} = ?`);
      params.push(data[key]);
    }
  }

  if (sets.length === 0) return 0;

  sets.push('updated_at = ?');
  params.push(now);
  params.push(id);

  return queryUpdate(
    `UPDATE 1ai_retargeting_pixels SET ${sets.join(', ')} WHERE id = ?`,
    params
  );
}

/**
 * Soft-delete a retargeting pixel (set status='inactive').
 * @param {number} id
 * @returns {Promise<number>} affectedRows
 */
async function deletePixel(id) {
  const now = Math.floor(Date.now() / 1000);
  return queryUpdate(
    'UPDATE 1ai_retargeting_pixels SET status = ?, updated_at = ? WHERE id = ?',
    ['inactive', now, id]
  );
}

/**
 * Fire a retargeting event.
 * @param {number} pixelId
 * @param {number} clickId
 * @param {string} eventType - page_view|add_to_cart|purchase|lead|registration|custom
 * @param {object|null} eventData - arbitrary JSON payload
 * @param {string} ip
 * @param {string} ua
 * @returns {Promise<number>} insertId
 */
async function fireEvent(pixelId, clickId, eventType, eventData, ip, ua) {
  const firedAt = Math.floor(Date.now() / 1000);
  return queryInsert(
    `INSERT INTO 1ai_retargeting_events
     (pixel_id, click_id, event_type, event_data, ip_address, user_agent, fired_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [pixelId, clickId, eventType, eventData ? JSON.stringify(eventData) : null, ip, ua, firedAt]
  );
}

/**
 * Get event statistics grouped by event_type for a pixel.
 * @param {number} pixelId
 * @returns {Promise<Array>}
 */
async function getPixelStats(pixelId) {
  return queryRows(
    `SELECT event_type, COUNT(*) AS count,
            MIN(fired_at) AS first_fired, MAX(fired_at) AS last_fired
     FROM 1ai_retargeting_events
     WHERE pixel_id = ?
     GROUP BY event_type
     ORDER BY count DESC`,
    [pixelId]
  );
}

module.exports = { createPixel, getPixels, updatePixel, deletePixel, fireEvent, getPixelStats };
