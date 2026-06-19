/**
 * Merged report queries — joins Meta ad spend with Shopee commissions
 * via taglink mappings.
 */

/**
 * Laporan Iklan — merged campaign spend + commission report.
 * Joins 1ai_meta_daily_stats with 1ai_shopee_reports via 1ai_taglink_mappings.
 * Groups by campaign + date.
 *
 * @param {import('mysql2/promise').Pool} pool
 * @param {object} filters
 * @param {string} [filters.dateFrom] — YYYY-MM-DD
 * @param {string} [filters.dateTo] — YYYY-MM-DD
 * @param {number} [filters.advertiserId]
 * @param {number} [filters.trafficSourceId]
 * @returns {Promise<Array<{campaign_name: string, taglink: string, spend: number, komisi: number, net_profit: number, order_count: number, clicks: number, roas: number}>>}
 */
async function getLaporanIklan(pool, { dateFrom, dateTo, advertiserId, trafficSourceId } = {}) {
  const conditions = [];
  const params = [];

  if (dateFrom) {
    conditions.push('m.report_date >= ?');
    params.push(dateFrom);
  }
  if (dateTo) {
    conditions.push('m.report_date <= ?');
    params.push(dateTo);
  }
  if (trafficSourceId) {
    conditions.push('m.traffic_source_id = ?');
    params.push(trafficSourceId);
  }
  if (advertiserId) {
    conditions.push('sr.advertiser_id = ?');
    params.push(advertiserId);
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  const sql = `
    SELECT
      m.campaign_name,
      tm.taglink,
      m.report_date,
      COALESCE(SUM(m.spend), 0) AS spend,
      COALESCE(SUM(sr.commission_net), 0) AS komisi,
      COALESCE(SUM(sr.commission_net), 0) - COALESCE(SUM(m.spend), 0) AS net_profit,
      COUNT(DISTINCT sr.order_id) AS order_count,
      COALESCE(SUM(m.clicks), 0) AS clicks,
      CASE WHEN COALESCE(SUM(m.spend), 0) > 0
           THEN ROUND(SUM(sr.commission_net) / SUM(m.spend), 2)
           ELSE 0 END AS roas
    FROM 1ai_meta_daily_stats m
    LEFT JOIN 1ai_taglink_mappings tm
      ON tm.traffic_source_id = m.traffic_source_id
     AND tm.meta_campaign_id = m.campaign_id
    LEFT JOIN 1ai_shopee_reports sr
      ON sr.taglink = tm.taglink
     AND sr.report_date = m.report_date
    ${where}
    GROUP BY m.campaign_name, tm.taglink, m.report_date
    ORDER BY m.report_date DESC, m.campaign_name
  `;

  const [rows] = await pool.query(sql, params);
  return rows;
}

/**
 * Analytic Harian — daily aggregation across spend and commissions.
 * Groups by date across both tables.
 *
 * @param {import('mysql2/promise').Pool} pool
 * @param {object} filters
 * @param {string} [filters.dateFrom] — YYYY-MM-DD
 * @param {string} [filters.dateTo] — YYYY-MM-DD
 * @returns {Promise<Array<{date: string, spend: number, komisi: number, net_profit: number, clicks: number, orders: number}>>}
 */
async function getAnalyticHarian(pool, { dateFrom, dateTo, groupBy = 'daily' } = {}) {
  const conditions = [];
  const params = [];

  if (dateFrom) {
    conditions.push('d.day >= ?');
    params.push(dateFrom);
  }
  if (dateTo) {
    conditions.push('d.day <= ?');
    params.push(dateTo);
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  // Date grouping expressions
  const groupExprs = {
    hourly: "DATE_FORMAT(day, '%Y-%m-%d %H:00:00')",
    daily: "day",
    weekly: "DATE(day - INTERVAL WEEKDAY(day) DAY)",
    monthly: "DATE_FORMAT(day, '%Y-%m-01')",
  };
  const groupExpr = groupExprs[groupBy] || groupExprs.daily;

  const sql = `
    SELECT
      ${groupExpr} AS date,
      COALESCE(SUM(s.spend), 0) AS spend,
      COALESCE(SUM(c.komisi), 0) AS komisi,
      COALESCE(SUM(c.komisi), 0) - COALESCE(SUM(s.spend), 0) AS net_profit,
      COALESCE(SUM(s.clicks), 0) AS clicks,
      COALESCE(SUM(c.orders), 0) AS orders
    FROM (
      SELECT DISTINCT report_date AS day FROM 1ai_meta_daily_stats
      UNION
      SELECT DISTINCT report_date AS day FROM 1ai_shopee_reports
    ) d
    LEFT JOIN (
      SELECT report_date, SUM(spend) AS spend, SUM(clicks) AS clicks
      FROM 1ai_meta_daily_stats
      GROUP BY report_date
    ) s ON s.report_date = d.day
    LEFT JOIN (
      SELECT report_date, SUM(commission_net) AS komisi, COUNT(DISTINCT order_id) AS orders
      FROM 1ai_shopee_reports
      GROUP BY report_date
    ) c ON c.report_date = d.day
    ${where}
    GROUP BY date
    ORDER BY date DESC
  `;

  const [rows] = await pool.query(sql, params);
  return rows;
}

/**
 * Laporan Taglink — per-taglink performance report.
 * Groups by taglink across both tables.
 *
 * @param {import('mysql2/promise').Pool} pool
 * @param {object} filters
 * @param {string} [filters.dateFrom] — YYYY-MM-DD
 * @param {string} [filters.dateTo] — YYYY-MM-DD
 * @returns {Promise<Array<{taglink: string, spend: number, komisi: number, net_profit: number, orders: number, roas: number}>>}
 */
async function getLaporanTaglink(pool, { dateFrom, dateTo } = {}) {
  const conditions = [];
  const params = [];

  if (dateFrom) {
    conditions.push('COALESCE(sr.report_date, m.report_date) >= ?');
    params.push(dateFrom);
  }
  if (dateTo) {
    conditions.push('COALESCE(sr.report_date, m.report_date) <= ?');
    params.push(dateTo);
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  const sql = `
    SELECT
      taglink,
      COALESCE(SUM(spend), 0) AS spend,
      COALESCE(SUM(komisi), 0) AS komisi,
      COALESCE(SUM(komisi), 0) - COALESCE(SUM(spend), 0) AS net_profit,
      COALESCE(SUM(order_count), 0) AS orders,
      CASE WHEN COALESCE(SUM(spend), 0) > 0
           THEN ROUND(SUM(komisi) / SUM(spend), 2)
           ELSE 0 END AS roas
    FROM (
      SELECT
        sr.taglink AS taglink,
        sr.report_date,
        0 AS spend,
        SUM(sr.commission_net) AS komisi,
        COUNT(DISTINCT sr.order_id) AS order_count
      FROM 1ai_shopee_reports sr
      WHERE sr.taglink IS NOT NULL
      GROUP BY sr.taglink, sr.report_date

      UNION ALL

      SELECT
        tm.taglink AS taglink,
        m.report_date,
        SUM(m.spend) AS spend,
        0 AS komisi,
        0 AS order_count
      FROM 1ai_meta_daily_stats m
      JOIN 1ai_taglink_mappings tm
        ON tm.traffic_source_id = m.traffic_source_id
       AND tm.meta_campaign_id = m.campaign_id
      GROUP BY tm.taglink, m.report_date
    ) combined
    ${where}
    GROUP BY taglink
    ORDER BY roas DESC
  `;

  const [rows] = await pool.query(sql, params);
  return rows;
}

/**
 * Get report breakdown by dimension (country, device, os, browser).
 */
async function getBreakdownByDimension(pool, { dimension, dateFrom, dateTo } = {}) {
  const validDimensions = { country: 'country_code', device: 'device_type', os: 'os', browser: 'browser' };
  const col = validDimensions[dimension];
  if (!col) throw new Error(`Invalid dimension: ${dimension}. Use: country, device, os, browser`);

  const conditions = [];
  const params = [];
  if (dateFrom) { conditions.push('clicked_at >= UNIX_TIMESTAMP(?)'); params.push(dateFrom); }
  if (dateTo) { conditions.push('clicked_at <= UNIX_TIMESTAMP(?)'); params.push(dateTo + ' 23:59:59'); }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

  // For os/browser, parse user_agent
  let selectExpr;
  if (dimension === 'os') {
    selectExpr = `CASE
      WHEN user_agent RLIKE 'Windows' THEN 'Windows'
      WHEN user_agent RLIKE 'Mac OS' THEN 'macOS'
      WHEN user_agent RLIKE 'Linux' THEN 'Linux'
      WHEN user_agent RLIKE 'Android' THEN 'Android'
      WHEN user_agent RLIKE 'iPhone|iPad' THEN 'iOS'
      ELSE 'Other'
    END AS dimension_value`;
  } else if (dimension === 'browser') {
    selectExpr = `CASE
      WHEN user_agent RLIKE 'Chrome' THEN 'Chrome'
      WHEN user_agent RLIKE 'Firefox' THEN 'Firefox'
      WHEN user_agent RLIKE 'Safari' THEN 'Safari'
      WHEN user_agent RLIKE 'Edge' THEN 'Edge'
      WHEN user_agent RLIKE 'Opera|OPR' THEN 'Opera'
      ELSE 'Other'
    END AS dimension_value`;
  } else {
    selectExpr = `COALESCE(${col}, 'Unknown') AS dimension_value`;
  }

  const sql = `
    SELECT ${selectExpr},
           COUNT(*) AS clicks,
           SUM(converted) AS conversions,
           COALESCE(SUM(payout), 0) AS revenue
    FROM 1ai_click_log
    ${where}
    GROUP BY dimension_value
    ORDER BY clicks DESC
    LIMIT 100
  `;

  const [rows] = await pool.query(sql, params);
  return rows;
}

module.exports = { getLaporanIklan, getAnalyticHarian, getLaporanTaglink, getBreakdownByDimension };
