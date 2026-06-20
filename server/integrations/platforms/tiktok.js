'use strict';
const C = require('../../utils/constants');

const API_URL = C.URLS.TIKTOK_ADS_API;

const meta = {
  id: 'tiktok',
  name: 'TikTok Ads',
  icon: '🎵',
  description: 'TikTok For Business campaign stats',
  auth_fields: [
    { key: 'access_token', label: 'Access Token', type: 'password', required: true },
    { key: 'advertiser_id', label: 'Advertiser ID', type: 'text', required: true },
  ],
  cost_models: ['CPC', 'CPM', 'CPA'],
};

async function testConnection(config) {
  try {
    const res = await fetch(`${API_URL}/ advertiser/info/`, {
      method: 'GET',
      headers: { 'Access-Token': config.access_token },
    });
    const json = await res.json();
    if (json.code !== 0) return { ok: false, error: json.message };
    return { ok: true, account: config.advertiser_id };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

async function fetchStats(pool, trafficSourceId, config, dateFrom, dateTo) {
  const now = Math.floor(Date.now() / 1000);
  const errors = [];

  const res = await fetch(`${API_URL}/report/integrated/get/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Access-Token': config.access_token },
    body: JSON.stringify({
      advertiser_id: config.advertiser_id,
      report_type: 'BASIC',
      data_level: 'AUCTION_CAMPAIGN',
      dimensions: ['campaign_id', 'stat_time_day'],
      metrics: ['spend', 'impressions', 'clicks'],
      start_date: dateFrom,
      end_date: dateTo,
      page_size: 1000,
    }),
  });

  const json = await res.json();
  if (json.code !== 0) { errors.push(json.message); await pool.query('UPDATE 1ai_traffic_sources SET last_synced_at = ? WHERE id = ?', [now, trafficSourceId]); return { synced: 0, errors }; }

  let synced = 0;
  for (const row of (json.data?.list || [])) {
    await pool.query(
      `INSERT INTO 1ai_meta_daily_stats (traffic_source_id, campaign_id, campaign_name, report_date, spend, impressions, clicks, platform, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'tiktok', ?)
       ON DUPLICATE KEY UPDATE campaign_name=VALUES(campaign_name), spend=VALUES(spend), impressions=VALUES(impressions), clicks=VALUES(clicks)`,
      [trafficSourceId, row.dimensions?.campaign_id, row.dimensions?.campaign_name || `Campaign ${row.dimensions?.campaign_id}`, row.dimensions?.stat_time_day || dateFrom, parseFloat(row.metrics?.spend||0), parseInt(row.metrics?.impressions||0), parseInt(row.metrics?.clicks||0), now]
    );
    synced++;
  }

  await pool.query('UPDATE 1ai_traffic_sources SET last_synced_at = ? WHERE id = ?', [now, trafficSourceId]);
  return { synced, errors };
}

module.exports = { meta, testConnection, fetchStats };
