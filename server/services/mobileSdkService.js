'use strict';

const crypto = require('crypto');
const { queryOne, queryRows, queryInsert, queryUpdate } = require('../utils/queryHelpers');

/**
 * Register a new SDK app and generate a 64-char hex API key.
 * @param {number} affiliateId
 * @param {string} appName
 * @param {string} appPackage
 * @param {string} platform - ios|android|flutter|react_native|other
 * @returns {Promise<{id: number, api_key: string}>}
 */
async function registerApp(affiliateId, appName, appPackage, platform) {
  const now = Math.floor(Date.now() / 1000);
  const apiKey = crypto.randomBytes(32).toString('hex');

  const id = await queryInsert(
    `INSERT INTO 1ai_sdk_apps (affiliate_id, app_name, app_package, platform, api_key, status, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, 'active', ?, ?)`,
    [affiliateId, appName, appPackage, platform, apiKey, now, now]
  );

  return { id, api_key: apiKey };
}

/**
 * Get an SDK app by its primary key.
 * @param {number} id
 * @returns {Promise<object|null>}
 */
async function getAppById(id) {
  return queryOne('SELECT * FROM 1ai_sdk_apps WHERE id = ?', [id]);
}

/**
 * List all SDK apps for a given affiliate, newest first.
 * @param {number} affiliateId
 * @returns {Promise<object[]>}
 */
async function listApps(affiliateId) {
  return queryRows(
    'SELECT * FROM 1ai_sdk_apps WHERE affiliate_id = ? ORDER BY created_at DESC',
    [affiliateId]
  );
}

/**
 * Revoke an SDK app by ID.
 * @param {number} id
 * @returns {Promise<number>} affected rows
 */
async function revokeApp(id) {
  const now = Math.floor(Date.now() / 1000);
  return queryUpdate(
    'UPDATE 1ai_sdk_apps SET status = ?, updated_at = ? WHERE id = ?',
    ['revoked', now, id]
  );
}

/**
 * Create a new SDK event.
 * @param {number} sdkAppId
 * @param {string} eventType
 * @param {object|null} eventData
 * @param {string|null} deviceId
 * @param {string|null} advertisingId
 * @param {string|null} ipAddress
 * @param {string|null} userAgent
 * @returns {Promise<number>} insertId
 */
async function createEvent(sdkAppId, eventType, eventData, deviceId, advertisingId, ipAddress, userAgent) {
  const now = Math.floor(Date.now() / 1000);
  const eventDataStr = eventData ? JSON.stringify(eventData) : null;

  return queryInsert(
    `INSERT INTO 1ai_sdk_events (sdk_app_id, event_type, event_data, device_id, advertising_id, ip_address, user_agent, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [sdkAppId, eventType, eventDataStr, deviceId, advertisingId, ipAddress, userAgent, now]
  );
}

/**
 * Look up an SDK app by its API key.
 * @param {string} apiKey
 * @returns {Promise<object|null>}
 */
async function getAppByApiKey(apiKey) {
  return queryOne('SELECT * FROM 1ai_sdk_apps WHERE api_key = ?', [apiKey]);
}

module.exports = { registerApp, getAppById, listApps, revokeApp, createEvent, getAppByApiKey };
