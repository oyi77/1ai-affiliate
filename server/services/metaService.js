/**
 * Meta Ads Graph API client.
 * Uses native fetch (Node 18+). No external HTTP library.
 */

const GRAPH_API = 'https://graph.facebook.com/v19.0';

/**
 * Validate a Meta access token via the debug_token endpoint.
 * @param {string} accessToken
 * @returns {Promise<{valid: boolean, expires_at?: number, scopes?: string[], error?: string}>}
 */
async function validateToken(accessToken) {
  try {
    const url = `${GRAPH_API}/debug_token?input_token=${encodeURIComponent(accessToken)}&access_token=${encodeURIComponent(accessToken)}`;
    const res = await fetch(url);
    const json = await res.json();

    if (json.error) {
      return { valid: false, error: json.error.message || 'Token validation failed' };
    }

    const data = json.data || {};
    return {
      valid: !!data.is_valid,
      expires_at: data.expires_at || null,
      scopes: data.scopes || [],
    };
  } catch (err) {
    return { valid: false, error: err.message };
  }
}

/**
 * Fetch the ad account name from Meta Graph API.
 * @param {string} actId — Ad account ID (act_XXXXXXX)
 * @param {string} accessToken
 * @returns {Promise<{name: string, id: string} | null>}
 */
async function fetchAccountName(actId, accessToken) {
  const url = `${GRAPH_API}/${encodeURIComponent(actId)}?fields=name&access_token=${encodeURIComponent(accessToken)}`;
  const res = await fetch(url);
  const json = await res.json();

  if (json.error) {
    throw new Error(json.error.message || 'Failed to fetch account name');
  }

  return { name: json.name, id: json.id };
}

/**
 * Fetch daily campaign insights for a single date.
 * @param {string} actId — Ad account ID
 * @param {string} accessToken
 * @param {string} dateStr — YYYY-MM-DD
 * @returns {Promise<Array<{campaign_id: string, campaign_name: string, spend: string, impressions: string, clicks: string, cpc: string, ctr: string}>>}
 */
async function fetchDailyInsights(actId, accessToken, dateStr) {
  const timeRange = JSON.stringify({ since: dateStr, until: dateStr });
  const fields = 'campaign_name,campaign_id,spend,impressions,clicks,cpc,ctr';
  const url = `${GRAPH_API}/${encodeURIComponent(actId)}/insights?fields=${fields}&time_range=${encodeURIComponent(timeRange)}&level=campaign&access_token=${encodeURIComponent(accessToken)}`;

  const res = await fetch(url);
  const json = await res.json();

  if (json.error) {
    throw new Error(json.error.message || 'Failed to fetch insights');
  }

  return json.data || [];
}

/**
 * Sync Meta daily insights for a date range into 1ai_meta_daily_stats.
 * Loops each day, fetches campaign-level insights, and upserts results.
 * Updates last_synced_at on the traffic source when done.
 *
 * @param {import('mysql2/promise').Pool} pool
 * @param {number} trafficSourceId
 * @param {string} actId
 * @param {string} accessToken
 * @param {string} dateFrom — YYYY-MM-DD
 * @param {string} dateTo — YYYY-MM-DD
 * @returns {Promise<{synced: number, errors: string[]}>}
 */
async function syncTrafficSourceStats(pool, trafficSourceId, actId, accessToken, dateFrom, dateTo) {
  const now = Math.floor(Date.now() / 1000);
  let synced = 0;
  const errors = [];

  const current = new Date(dateFrom + 'T00:00:00Z');
  const end = new Date(dateTo + 'T00:00:00Z');

  while (current <= end) {
    const dateStr = current.toISOString().slice(0, 10);

    try {
      const insights = await fetchDailyInsights(actId, accessToken, dateStr);

      for (const row of insights) {
        await pool.query(
          `INSERT INTO 1ai_meta_daily_stats
             (traffic_source_id, campaign_id, campaign_name, report_date,
              spend, impressions, clicks, cpc, ctr, created_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE
             campaign_name = VALUES(campaign_name),
             spend = VALUES(spend),
             impressions = VALUES(impressions),
             clicks = VALUES(clicks),
             cpc = VALUES(cpc),
             ctr = VALUES(ctr)`,
          [
            trafficSourceId,
            row.campaign_id,
            row.campaign_name || null,
            dateStr,
            parseFloat(row.spend) || 0,
            parseInt(row.impressions, 10) || 0,
            parseInt(row.clicks, 10) || 0,
            parseFloat(row.cpc) || 0,
            parseFloat(row.ctr) || 0,
            now,
          ]
        );
        synced++;
      }
    } catch (err) {
      errors.push(`${dateStr}: ${err.message}`);
    }

    current.setUTCDate(current.getUTCDate() + 1);
  }

  // Update last_synced_at on the traffic source
  await pool.query(
    'UPDATE 1ai_traffic_sources SET last_synced_at = ? WHERE id = ?',
    [now, trafficSourceId]
  );

  return { synced, errors };
}

module.exports = { validateToken, fetchAccountName, fetchDailyInsights, syncTrafficSourceStats };
