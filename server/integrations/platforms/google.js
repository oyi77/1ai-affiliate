'use strict';
const C = require('../../utils/constants');

const TOKEN_URL = C.URLS.GOOGLE_TOKEN_URL;
const API_URL = C.URLS.GOOGLE_ADS_API;

const meta = {
  id: 'google',
  name: 'Google Ads',
  icon: '🔍',
  description: 'Search, Display & YouTube campaign stats',
  auth_fields: [
    { key: 'client_id', label: 'OAuth Client ID', type: 'text', required: true },
    { key: 'client_secret', label: 'OAuth Client Secret', type: 'password', required: true },
    { key: 'refresh_token', label: 'Refresh Token', type: 'password', required: true },
    { key: 'customer_id', label: 'Customer ID (no dashes)', type: 'text', required: true },
    { key: 'developer_token', label: 'Developer Token (optional)', type: 'text', required: false },
  ],
  cost_models: ['CPC', 'CPM', 'CPA'],
};

async function refreshAccessToken(config) {
  const res = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ client_id: config.client_id, client_secret: config.client_secret, refresh_token: config.refresh_token, grant_type: 'refresh_token' }),
  });
  const json = await res.json();
  if (json.error) throw new Error(`Google OAuth: ${json.error_description || json.error}`);
  return json.access_token;
}

async function testConnection(config) {
  try {
    const token = await refreshAccessToken(config);
    return { ok: true, account: config.customer_id };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

async function fetchStats(pool, trafficSourceId, config, dateFrom, dateTo) {
  const accessToken = await refreshAccessToken(config);
  const devToken = config.developer_token || process.env.GOOGLE_ADS_DEVELOPER_TOKEN || '';
  const now = Math.floor(Date.now() / 1000);
  const errors = [];

  // Validate date format to prevent GAQL injection
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateFrom) || !/^\d{4}-\d{2}-\d{2}$/.test(dateTo)) {
    throw new Error('Invalid date format. Use YYYY-MM-DD.');
  }
  const query = `SELECT campaign.id, campaign.name, metrics.impressions, metrics.clicks, metrics.cost_micros
    FROM campaign WHERE segments.date BETWEEN '${dateFrom}' AND '${dateTo}' AND campaign.status != 'REMOVED'`;

  const res = await fetch(`${API_URL}/customers/${config.customer_id}/googleAds:searchStream`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${accessToken}`, 'developer-token': devToken },
    body: JSON.stringify({ query: query.trim() }),
  });
  const json = await res.json();
  if (json.error) { errors.push(json.error.message); await pool.query('UPDATE 1ai_traffic_sources SET last_synced_at = ? WHERE id = ?', [now, trafficSourceId]); return { synced: 0, errors }; }

  let synced = 0;
  for (const batch of (Array.isArray(json) ? json : [json])) {
    for (const row of (batch.results || [])) {
      await pool.query(
        `INSERT INTO 1ai_meta_daily_stats (traffic_source_id, campaign_id, campaign_name, report_date, spend, impressions, clicks, platform, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, 'google', ?)
         ON DUPLICATE KEY UPDATE campaign_name=VALUES(campaign_name), spend=VALUES(spend), impressions=VALUES(impressions), clicks=VALUES(clicks)`,
        [trafficSourceId, row.campaign?.id, row.campaign?.name, dateFrom, parseInt(row.metrics?.costMicros||0)/1e6, parseInt(row.metrics?.impressions||0), parseInt(row.metrics?.clicks||0), now]
      );
      synced++;
    }
  }

  await pool.query('UPDATE 1ai_traffic_sources SET last_synced_at = ? WHERE id = ?', [now, trafficSourceId]);
  return { synced, errors };
}

module.exports = { meta, testConnection, fetchStats };
