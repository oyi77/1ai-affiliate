'use strict';

/**
 * TEMPLATE: How to add a new ad platform integration.
 *
 * 1. Copy this file → server/integrations/platforms/yourplatform.js
 * 2. Fill in the 3 exports: meta, testConnection, fetchStats
 * 3. Done. The registry auto-discovers it.
 *
 * That's it. No route changes, no controller changes, no cron changes.
 */

const meta = {
  // Unique ID — matches platform_type in 1ai_traffic_sources
  id: 'yourplatform',
  // Display name in the integration marketplace
  name: 'Your Platform',
  // Emoji icon for the UI
  icon: '🌐',
  // One-line description
  description: 'What this platform does',
  // Fields the user must fill in to connect.
  // key = field name stored in api_config JSON
  // type = 'text' | 'password' | 'select'
  // required = true | false
  auth_fields: [
    { key: 'api_key', label: 'API Key', type: 'password', required: true },
    { key: 'account_id', label: 'Account ID', type: 'text', required: true },
  ],
  // Cost models this platform supports
  cost_models: ['CPC', 'CPM'],
};

/**
 * Test if credentials are valid.
 * Called when user hits "Connect" or "Test Connection".
 *
 * @param {object} config — values from auth_fields
 * @returns {Promise<{ok: boolean, account?: string, error?: string}>}
 */
async function testConnection(config) {
  // Call the platform's /me or /account endpoint to verify credentials
  // Return { ok: true, account: 'Account Name' } on success
  // Return { ok: false, error: 'Reason' } on failure
  return { ok: false, error: 'Not implemented' };
}

/**
 * Fetch campaign stats and upsert into 1ai_meta_daily_stats.
 * Called by the auto-sync cron and the manual sync endpoint.
 *
 * @param {import('mysql2/promise').Pool} pool
 * @param {number} trafficSourceId — 1ai_traffic_sources.id
 * @param {object} config — values from auth_fields
 * @param {string} dateFrom — YYYY-MM-DD
 * @param {string} dateTo — YYYY-MM-DD
 * @returns {Promise<{synced: number, errors: string[]}>}
 */
async function fetchStats(pool, trafficSourceId, config, dateFrom, dateTo) {
  const now = Math.floor(Date.now() / 1000);
  let synced = 0;
  const errors = [];

  // 1. Call the platform's reporting API
  // 2. For each campaign row:
  //    await pool.query(
  //      `INSERT INTO 1ai_meta_daily_stats
  //         (traffic_source_id, campaign_id, campaign_name, report_date, spend, impressions, clicks, platform, created_at)
  //       VALUES (?, ?, ?, ?, ?, ?, ?, '${meta.id}', ?)
  //       ON DUPLICATE KEY UPDATE campaign_name=VALUES(campaign_name), spend=VALUES(spend),
  //         impressions=VALUES(impressions), clicks=VALUES(clicks)`,
  //      [trafficSourceId, row.campaign_id, row.campaign_name, date, spend, impressions, clicks, now]
  //    );
  //    synced++;
  // 3. Update last_synced_at
  await pool.query('UPDATE 1ai_traffic_sources SET last_synced_at = ? WHERE id = ?', [now, trafficSourceId]);

  return { synced, errors };
}

module.exports = { meta, testConnection, fetchStats };
