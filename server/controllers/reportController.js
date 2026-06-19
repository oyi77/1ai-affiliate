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
            cl.click_id, cl.conversion_time,
            oc.offer_id, o.name AS offer_name, o.payout AS offer_payout
     FROM 1ai_affiliate_earnings ae
     LEFT JOIN 1ai_conversion_logs cl ON ae.conversion_id = cl.conversion_id
     LEFT JOIN 1ai_offer_campaigns oc ON cl.aff_campaign_id = oc.aff_campaign_id
     LEFT JOIN 1ai_offers o ON oc.offer_id = o.id
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
  const { dateFrom, dateTo, advertiser_id, traffic_source_id } = req.query;
  const { getLaporanIklan } = require('../services/reportService');
  const data = await getLaporanIklan(pool, { dateFrom, dateTo, advertiserId: advertiser_id, trafficSourceId: traffic_source_id });
  return success(res, { data });
});

/**
 * GET /api/admin/reports/daily
 * Daily aggregation across spend and commissions.
 */
const getAnalyticHarian = asyncHandler(async (req, res) => {
  const { dateFrom, dateTo, group_by } = req.query;
  const { getAnalyticHarian } = require('../services/reportService');
  const data = await getAnalyticHarian(pool, { dateFrom, dateTo, groupBy: group_by });
  return success(res, { data });
});

/**
 * GET /api/admin/reports/taglink
 * Per-taglink performance report.
 */
const getLaporanTaglink = asyncHandler(async (req, res) => {
  const { dateFrom, dateTo } = req.query;
  const { getLaporanTaglink } = require('../services/reportService');
  const data = await getLaporanTaglink(pool, { dateFrom, dateTo });
  return success(res, { data });
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

/**
 * GET /api/admin/reports/orders
 * Order-level report grouped by date: spend, estimasi kotor, komisi update, profit/loss, komisi bersih.
 */
const getLaporanOrder = asyncHandler(async (req, res) => {
  const { date_from, date_to } = req.query;
  let where = '1=1';
  const params = [];
  if (date_from) { where += ' AND sr.report_date >= ?'; params.push(date_from); }
  if (date_to) { where += ' AND sr.report_date <= ?'; params.push(date_to); }

  const rows = await queryRows(
    `SELECT sr.report_date AS tanggal_transaksi,
            COALESCE(SUM(mds.spend), 0) AS spend,
            COALESCE(SUM(sr.order_amount), 0) AS estimasi_kotor,
            COALESCE(SUM(sr.commission_gross), 0) AS komisi_update,
            COALESCE(SUM(sr.commission_net) - SUM(mds.spend), 0) AS profit_loss,
            COALESCE(SUM(sr.commission_net), 0) AS komisi_bersih,
            CASE WHEN SUM(sr.commission_net) > 0 THEN 'completed' ELSE 'pending' END AS status
     FROM 1ai_shopee_reports sr
     LEFT JOIN 1ai_taglink_mappings tlm ON tlm.taglink = sr.taglink
     LEFT JOIN 1ai_meta_daily_stats mds ON mds.campaign_id = tlm.meta_campaign_id AND mds.report_date = sr.report_date
     WHERE ${where}
     GROUP BY sr.report_date
     ORDER BY sr.report_date DESC`,
    params
  );
  return success(res, { data: rows });
});

/**
 * GET /api/admin/reports/compare?ids=1,2,3
 * Side-by-side campaign comparison with clicks, conversions, revenue, spend, EPC, CR, ROAS.
 */
const compareCampaigns = asyncHandler(async (req, res) => {
  const idsParam = req.query.ids;
  if (!idsParam) {
    return error(res, 'ids query parameter is required (comma-separated campaign IDs)', 400);
  }

  const ids = idsParam.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id) && id > 0);
  if (ids.length < 2) {
    return error(res, 'At least 2 valid campaign IDs are required', 400);
  }
  if (ids.length > 10) {
    return error(res, 'Maximum 10 campaigns can be compared', 400);
  }

  const placeholders = ids.map(() => '?').join(',');
  const rows = await queryRows(
    `SELECT
       c.id,
       c.name,
       c.status,
       COALESCE(SUM(cl_stats.total_clicks), 0) AS clicks,
       COALESCE(SUM(cl_stats.total_conversions), 0) AS conversions,
       COALESCE(SUM(cl_stats.total_revenue), 0) AS revenue,
       COALESCE(SUM(mds_stats.total_spend), 0) AS spend,
       CASE WHEN COALESCE(SUM(cl_stats.total_clicks), 0) > 0
         THEN ROUND(COALESCE(SUM(cl_stats.total_revenue), 0) / SUM(cl_stats.total_clicks), 2)
         ELSE 0 END AS epc,
       CASE WHEN COALESCE(SUM(cl_stats.total_clicks), 0) > 0
         THEN ROUND(COALESCE(SUM(cl_stats.total_conversions), 0) / SUM(cl_stats.total_clicks) * 100, 2)
         ELSE 0 END AS cr,
       CASE WHEN COALESCE(SUM(mds_stats.total_spend), 0) > 0
         THEN ROUND((COALESCE(SUM(cl_stats.total_revenue), 0) - SUM(mds_stats.total_spend)) / SUM(mds_stats.total_spend) * 100, 2)
         ELSE 0 END AS roi,
       CASE WHEN COALESCE(SUM(mds_stats.total_spend), 0) > 0
         THEN ROUND(COALESCE(SUM(cl_stats.total_revenue), 0) / SUM(mds_stats.total_spend), 2)
         ELSE 0 END AS roas
     FROM 1ai_campaigns c
     LEFT JOIN (
       SELECT campaign_id,
              COUNT(*) AS total_clicks,
              SUM(CASE WHEN converted = 1 THEN 1 ELSE 0 END) AS total_conversions,
              COALESCE(SUM(payout), 0) AS total_revenue
       FROM 1ai_click_log
       GROUP BY campaign_id
     ) cl_stats ON cl_stats.campaign_id = c.id
     LEFT JOIN (
       SELECT campaign_id,
              COALESCE(SUM(spend), 0) AS total_spend
       FROM 1ai_meta_daily_stats
       GROUP BY campaign_id
     ) mds_stats ON mds_stats.campaign_id = c.id
     WHERE c.id IN (${placeholders})
     GROUP BY c.id, c.name, c.status`,
    ids
  );

  // Calculate best/worst per metric
  const metrics = ['clicks', 'conversions', 'revenue', 'spend', 'epc', 'cr', 'roi', 'roas'];
  const bestWorst = {};
  for (const metric of metrics) {
    const values = rows.map(r => Number(r[metric]) || 0);
    if (values.length > 0) {
      bestWorst[metric] = {
        best: Math.max(...values),
        worst: Math.min(...values),
      };
    }
  }

  return success(res, { data: rows, bestWorst });
});

/**
 * GET /api/admin/reports/campaign/:id/clicks — drill-down clicks for a campaign
 */
const getCampaignClicks = asyncHandler(async (req, res) => {
  const campaignId = parseInt(req.params.id);
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.min(Math.max(1, parseInt(req.query.limit) || 50), 200);
  const offset = (page - 1) * limit;

  const [rows] = await pool.query(
    `SELECT cl.* FROM 1ai_click_log cl
     WHERE cl.campaign_id = ?
     ORDER BY cl.clicked_at DESC LIMIT ? OFFSET ?`,
    [campaignId, limit, offset]
  );
  const [cnt] = await pool.query('SELECT COUNT(*) AS total FROM 1ai_click_log WHERE campaign_id = ?', [campaignId]);
  return paginated(res, rows, { page, limit, total: cnt[0]?.total || 0 });
});

/**
 * GET /api/admin/reports/campaign/:id/conversions — drill-down conversions for a campaign
 */
const getCampaignConversions = asyncHandler(async (req, res) => {
  const campaignId = parseInt(req.params.id);
  const [rows] = await pool.query(
    `SELECT * FROM 1ai_conversion_logs WHERE campaign_id = ? ORDER BY created_at DESC LIMIT 100`,
    [campaignId]
  );
  return success(res, { data: rows });
});

/**
 * GET /api/admin/reports/attribution?model=first|last|linear
 */
const getAttribution = asyncHandler(async (req, res) => {
  const model = req.query.model || 'first';
  const dateFrom = req.query.date_from;
  const dateTo = req.query.date_to;

  const conditions = [];
  const params = [];
  if (dateFrom) { conditions.push('cl.converted_at >= UNIX_TIMESTAMP(?)'); params.push(dateFrom); }
  if (dateTo) { conditions.push('cl.converted_at <= UNIX_TIMESTAMP(?)'); params.push(dateTo + ' 23:59:59'); }
  const where = conditions.length ? `WHERE ${conditions.join(' AND ')} AND cl.converted = 1` : 'WHERE cl.converted = 1';

  let touchpointCol;
  switch (model) {
    case 'last': touchpointCol = 'cl.offer_id'; break;
    case 'linear': touchpointCol = 'cl.affiliate_id'; break;
    case 'first':
    default: touchpointCol = 'cl.campaign_id'; break;
  }

  const [rows] = await pool.query(`
    SELECT ${touchpointCol} AS touchpoint_id,
           COUNT(*) AS conversions,
           COALESCE(SUM(cl.payout), 0) AS revenue
    FROM 1ai_click_log cl
    ${where}
    GROUP BY touchpoint_id
    ORDER BY conversions DESC
    LIMIT 50
  `, params);

  return success(res, { model, data: rows });
});

/**
 * POST /api/admin/reports/custom — Custom report builder
 */
const getCustomReport = asyncHandler(async (req, res) => {
  const { dimensions = [], metrics = [], date_from, date_to, limit = 100 } = req.body;

  const validDimensions = { campaign: 'o.name', offer: 'o.name', affiliate: 'a.name', country: 'cl.country_code', device: 'cl.device_type', date: 'FROM_UNIXTIME(cl.clicked_at, "%Y-%m-%d")' };
  const validMetrics = { clicks: 'COUNT(*)', conversions: 'SUM(cl.converted)', revenue: 'COALESCE(SUM(cl.payout), 0)' };

  const selectDims = dimensions.filter(d => validDimensions[d]).map(d => `${validDimensions[d]} AS ${d}`);
  const selectMets = metrics.filter(m => validMetrics[m]).map(m => `${validMetrics[m]} AS ${m}`);

  if (!selectDims.length && !selectMets.length) {
    return res.status(400).json({ error: 'Select at least one dimension or metric' });
  }

  const selectClauses = [...selectDims, ...selectMets].join(', ');
  const groupBy = selectDims.length ? `GROUP BY ${selectDims.map((_, i) => i + 1).join(', ')}` : '';

  const conditions = [];
  const params = [];
  if (date_from) { conditions.push('cl.clicked_at >= UNIX_TIMESTAMP(?)'); params.push(date_from); }
  if (date_to) { conditions.push('cl.clicked_at <= UNIX_TIMESTAMP(?)'); params.push(date_to + ' 23:59:59'); }
  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

  const sql = `
    SELECT ${selectClauses}
    FROM 1ai_click_log cl
    LEFT JOIN 1ai_offers o ON cl.offer_id = o.id
    LEFT JOIN 1ai_affiliates a ON cl.affiliate_id = a.id
    ${where}
    ${groupBy}
    ORDER BY ${selectMets.length ? selectMets[0].split(' AS ')[0] : '1'} DESC
    LIMIT ?
  `;
  params.push(Math.min(limit, 500));

  const [rows] = await pool.query(sql, params);
  return success(res, { data: rows, dimensions, metrics });
});
module.exports = {
  getClicks,
  getConversions,
  getLaporanIklan,
  getAnalyticHarian,
  getLaporanTaglink,
  exportLaporanIklanPdf,
  getLaporanOrder,
  compareCampaigns,
  getCampaignClicks,
  getCampaignConversions,
  getAttribution,
  getCustomReport,
};
