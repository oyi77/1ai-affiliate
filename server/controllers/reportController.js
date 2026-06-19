const { asyncHandler } = require('../utils/asyncHandler');
const { success, error, paginated } = require('../utils/apiResponse');
const { queryOne, queryRows, queryInsert } = require('../utils/queryHelpers');
const { validate, z } = require('../utils/validate');
const pool = require('../db/mysql');

/**
 * Report controller — clicks, conversions, merged ad/commission reports.
 */

/**
 * GET /api/admin/reports/clicks?page=1&limit=50
 * Paginated click log with role-based filtering.
 */
const getClicks = asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.min(Math.max(1, parseInt(req.query.limit) || 50), 200);
  const offset = (page - 1) * limit;
  const role = req.user.role;

  const whereClauses = [];
  const params = [];

  if (role !== 'admin' && role !== 'manager') {
    whereClauses.push('cl.affiliate_id = ?');
    params.push(req.user.id);
  }

  if (req.query.offer_id) {
    whereClauses.push('cl.offer_id = ?');
    params.push(parseInt(req.query.offer_id));
  }
  if (req.query.country) {
    whereClauses.push('cl.country_code = ?');
    params.push(req.query.country.toUpperCase());
  }
  if (req.query.device) {
    whereClauses.push('cl.device_type = ?');
    params.push(req.query.device.toLowerCase());
  }
  if (req.query.date_from) {
    whereClauses.push('cl.clicked_at >= UNIX_TIMESTAMP(?)');
    params.push(req.query.date_from);
  }
  if (req.query.date_to) {
    whereClauses.push('cl.clicked_at <= UNIX_TIMESTAMP(?)');
    params.push(req.query.date_to + ' 23:59:59');
  }

  const where = whereClauses.length ? `WHERE ${whereClauses.join(' AND ')}` : '';

  const countRows = await queryRows(
    `SELECT COUNT(*) AS total FROM 1ai_click_log cl ${where}`,
    params
  );
  const total = countRows[0] ? Number(countRows[0].total) : 0;

  const rows = await queryRows(
    `SELECT cl.id, cl.click_id, cl.offer_id, o.name AS offer_name,
            cl.affiliate_id, a.affiliate_code, cl.subid, cl.ip, cl.country_code,
            cl.device_type,
            CASE
              WHEN cl.user_agent LIKE '%Windows%' THEN 'Windows'
              WHEN cl.user_agent LIKE '%Mac OS%' THEN 'macOS'
              WHEN cl.user_agent LIKE '%Linux%' THEN 'Linux'
              WHEN cl.user_agent LIKE '%Android%' THEN 'Android'
              WHEN cl.user_agent LIKE '%iOS%' OR cl.user_agent LIKE '%iPhone%' THEN 'iOS'
              ELSE 'Unknown'
            END AS os,
            CASE
              WHEN cl.user_agent LIKE '%Chrome%' AND cl.user_agent NOT LIKE '%Edg%' THEN 'Chrome'
              WHEN cl.user_agent LIKE '%Firefox%' THEN 'Firefox'
              WHEN cl.user_agent LIKE '%Safari%' AND cl.user_agent NOT LIKE '%Chrome%' THEN 'Safari'
              WHEN cl.user_agent LIKE '%Edg%' THEN 'Edge'
              ELSE 'Other'
            END AS browser,
            cl.payout, cl.converted, cl.converted_at, cl.clicked_at
     FROM 1ai_click_log cl
     LEFT JOIN 1ai_offers o ON cl.offer_id = o.id
     LEFT JOIN 1ai_affiliates a ON cl.affiliate_id = a.id
     ${where}
     ORDER BY cl.clicked_at DESC
     LIMIT ? OFFSET ?`,
    [...params, limit, offset]
  );

  return paginated(res, rows, total, page, limit);
});

/**
 * GET /api/admin/reports/conversions?page=1&limit=50
 * Paginated conversion log with offer and earning details.
 */
const getConversions = asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.min(Math.max(1, parseInt(req.query.limit) || 50), 200);
  const offset = (page - 1) * limit;
  const role = req.user.role;

  const whereClauses = [];
  const params = [];

  if (role !== 'admin' && role !== 'manager') {
    whereClauses.push('ae.affiliate_id = ?');
    params.push(req.user.id);
  }

  const where = whereClauses.length ? `WHERE ${whereClauses.join(' AND ')}` : '';

  const countRows = await queryRows(
    `SELECT COUNT(*) AS total
     FROM 1ai_affiliate_earnings ae
     LEFT JOIN 1ai_conversion_logs cl ON ae.conversion_id = cl.conversion_id
     ${where}`,
    params
  );
  const total = countRows[0] ? Number(countRows[0].total) : 0;

  const rows = await queryRows(
    `SELECT ae.id AS earning_id, ae.affiliate_id, ae.conversion_id,
            ae.payout_amount, ae.admin_amount, ae.status AS earning_status,
            ae.approved_at, ae.paid_at, ae.created_at AS earning_created_at,
            cl.click_id, cl.transaction_id, cl.conversion_time,
            o.id AS offer_id, o.name AS offer_name, o.payout AS offer_payout
     FROM 1ai_affiliate_earnings ae
     LEFT JOIN 1ai_conversion_logs cl ON ae.conversion_id = cl.conversion_id
     LEFT JOIN 1ai_offers o ON cl.offer_id = o.id
     ${where}
     ORDER BY ae.created_at DESC
     LIMIT ? OFFSET ?`,
    [...params, limit, offset]
  );

  return paginated(res, rows, total, page, limit);
});

/**
 * GET /api/admin/reports/ads
 * Merged Meta spend + Shopee commission report.
 */
const getLaporanIklan = asyncHandler(async (req, res) => {
  return success(res, { data: [], message: 'Report pending Meta×Shopee integration' });
});

/**
 * GET /api/admin/reports/daily
 * Daily aggregation across spend and commissions.
 */
const getAnalyticHarian = asyncHandler(async (req, res) => {
  return success(res, { data: [], message: 'Report pending Meta×Shopee integration' });
});

/**
 * GET /api/admin/reports/taglink
 * Per-taglink performance report.
 */
const getLaporanTaglink = asyncHandler(async (req, res) => {
  return success(res, { data: [], message: 'Report pending Meta×Shopee integration' });
});

/**
 * GET /api/admin/reports/ads.pdf
 * PDF export of the Laporan Iklan report.
 */
const exportLaporanIklanPdf = asyncHandler(async (req, res) => {
  const { generateReportPdf } = require('../services/pdfService');
  const dateFrom = req.query.date_from || '';
  const dateTo = req.query.date_to || '';

  // Fetch the same data as the HTML report
  const params = new URLSearchParams();
  if (dateFrom) params.set('date_from', dateFrom);
  if (dateTo) params.set('date_to', dateTo);

  const [rows] = await pool.query(
    `SELECT COALESCE(c.name, '—') AS campaign_name,
            COALESCE(sr.taglink, '—') AS taglink,
            COALESCE(SUM(mds.spend), 0) AS spend,
            COALESCE(SUM(sr.commission_net), 0) AS komisi,
            COALESCE(SUM(sr.commission_net) - SUM(mds.spend), 0) AS net_profit,
            COUNT(DISTINCT sr.order_id) AS orders,
            COALESCE(SUM(mds.clicks), 0) AS clicks
     FROM 1ai_meta_daily_stats mds
     LEFT JOIN 1ai_taglink_mappings tlm ON tlm.meta_campaign_id = mds.campaign_id
     LEFT JOIN 1ai_shopee_reports sr ON sr.taglink = tlm.taglink
       AND sr.report_date = mds.report_date
     LEFT JOIN 1ai_offers c ON c.id = tlm.offer_id
     WHERE (? = '' OR mds.report_date >= ?)
       AND (? = '' OR mds.report_date <= ?)
     GROUP BY campaign_name, taglink
     ORDER BY net_profit DESC`,
    [dateFrom, dateFrom, dateTo, dateTo]
  );

  const columns = [
    { header: 'Campaign', dataKey: 'campaign_name' },
    { header: 'Taglink', dataKey: 'taglink' },
    { header: 'Spend (Rp)', dataKey: 'spend' },
    { header: 'Komisi (Rp)', dataKey: 'komisi' },
    { header: 'Net Profit (Rp)', dataKey: 'net_profit' },
    { header: 'Orders', dataKey: 'orders' },
    { header: 'Clicks', dataKey: 'clicks' },
  ];

  const pdfBuffer = generateReportPdf('Laporan Iklan — Ads vs Commission', columns, rows, { date_from: dateFrom, date_to: dateTo });
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="laporan-iklan-${dateFrom || 'all'}-${dateTo || 'all'}.pdf"`);
  res.send(pdfBuffer);
});

module.exports = {
  getClicks,
  getConversions,
  getLaporanIklan,
  getAnalyticHarian,
  getLaporanTaglink,
  exportLaporanIklanPdf,
};
