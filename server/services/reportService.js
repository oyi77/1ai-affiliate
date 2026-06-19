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
async function getAnalyticHarian(pool, { dateFrom, dateTo } = {}) {
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

  const sql = `
    SELECT
      d.day AS date,
      COALESCE(s.spend, 0) AS spend,
      COALESCE(c.komisi, 0) AS komisi,
      COALESCE(c.komisi, 0) - COALESCE(s.spend, 0) AS net_profit,
      COALESCE(s.clicks, 0) AS clicks,
      COALESCE(c.orders, 0) AS orders
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
    ORDER BY d.day DESC
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

module.exports = { getLaporanIklan, getAnalyticHarian, getLaporanTaglink };
