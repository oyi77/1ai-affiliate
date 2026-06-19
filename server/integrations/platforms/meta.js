'use strict';

const GRAPH_API = 'https://graph.facebook.com/v19.0';

const meta = {
  id: 'meta',
  name: 'Meta Ads',
  icon: '📘',
  description: 'Facebook & Instagram campaign stats',
  auth_fields: [
    { key: 'access_token', label: 'Access Token', type: 'password', required: true },
    { key: 'act_id', label: 'Ad Account ID (act_XXX)', type: 'text', required: true },
  ],
  cost_models: ['CPC', 'CPM', 'CPA'],
};

async function testConnection(config) {
  const url = `${GRAPH_API}/me?access_token=${encodeURIComponent(config.access_token)}`;
  const res = await fetch(url);
  const json = await res.json();
  if (json.error) return { ok: false, error: json.error.message };
  return { ok: true, account: json.name };
}

async function fetchStats(pool, trafficSourceId, config, dateFrom, dateTo) {
  const now = Math.floor(Date.now() / 1000);
  let synced = 0;
  const errors = [];

  const current = new Date(dateFrom + 'T00:00:00Z');
  const end = new Date(dateTo + 'T00:00:00Z');

  while (current <= end) {
    const dateStr = current.toISOString().slice(0, 10);
    try {
      const timeRange = JSON.stringify({ since: dateStr, until: dateStr });
      const fields = 'campaign_name,campaign_id,spend,impressions,clicks';
      const url = `${GRAPH_API}/${encodeURIComponent(config.act_id)}/insights?fields=${fields}&time_range=${encodeURIComponent(timeRange)}&level=campaign&access_token=${encodeURIComponent(config.access_token)}`;
      const res = await fetch(url);
      const json = await res.json();
      if (json.error) throw new Error(json.error.message);

      for (const row of (json.data || [])) {
        await pool.query(
          `INSERT INTO 1ai_meta_daily_stats (traffic_source_id, campaign_id, campaign_name, report_date, spend, impressions, clicks, platform, created_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, 'meta', ?)
           ON DUPLICATE KEY UPDATE campaign_name=VALUES(campaign_name), spend=VALUES(spend), impressions=VALUES(impressions), clicks=VALUES(clicks)`,
          [trafficSourceId, row.campaign_id, row.campaign_name, dateStr, parseFloat(row.spend)||0, parseInt(row.impressions)||0, parseInt(row.clicks)||0, now]
        );
        synced++;
      }
    } catch (err) {
      errors.push(`${dateStr}: ${err.message}`);
    }
    current.setUTCDate(current.getUTCDate() + 1);
  }

  await pool.query('UPDATE 1ai_traffic_sources SET last_synced_at = ? WHERE id = ?', [now, trafficSourceId]);
  return { synced, errors };
}

module.exports = { meta, testConnection, fetchStats };
