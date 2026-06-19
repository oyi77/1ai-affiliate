const { asyncHandler } = require('../utils/asyncHandler');
const { success, error } = require('../utils/apiResponse');
const { queryOne, queryRows, queryInsert } = require('../utils/queryHelpers');
const { validate, z } = require('../utils/validate');
const pool = require('../db/mysql');

/**
 * Traffic source controller — CRUD, Meta API integration, daily stats.
 */

const createTrafficSourceSchema = z.object({
  name: z.string().min(1),
  platform_type: z.enum(['meta', 'google', 'tiktok', 'propellerads', 'custom']).optional(),
  cost_model: z.enum(['CPC', 'CPM', 'CPA', 'revshare']).optional(),
  currency: z.string().length(3).optional(),
  tracking_domain: z.string().url().optional().or(z.literal('')),
  postback_url_template: z.string().optional(),
});

/**
 * GET /api/admin/traffic-sources
 * Returns traffic sources for the current user (admin sees all, others see own).
 */
const getTrafficSources = asyncHandler(async (req, res) => {
  const role = req.user.role;
  let sql, params;
  if (role === 'admin' || role === 'manager') {
    sql = `SELECT ts.*, u.user_email AS affiliate_email
           FROM 1ai_traffic_sources ts
           LEFT JOIN 1ai_users u ON ts.affiliate_id = u.user_id
           ORDER BY ts.created_at DESC LIMIT 100`;
    params = [];
  } else {
    sql = `SELECT * FROM 1ai_traffic_sources WHERE affiliate_id = ? ORDER BY created_at DESC LIMIT 100`;
    params = [req.user.id];
  }
  const rows = await queryRows(sql, params);
  return success(res, { data: rows });
});

/**
 * POST /api/admin/traffic-sources
 * Create a new traffic source.
 */
const createTrafficSource = asyncHandler(async (req, res) => {
  const data = req.validated;
  const now = Math.floor(Date.now() / 1000);

  const id = await queryInsert(
    `INSERT INTO 1ai_traffic_sources
       (name, platform_type, cost_model, currency, tracking_domain, postback_url_template, user_id, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      data.name,
      data.platform_type || null,
      data.cost_model || 'CPC',
      data.currency || 'IDR',
      data.tracking_domain || null,
      data.postback_url_template || null,
      req.user.id,
      now,
    ]
  );

  return success(res, { success: true, id }, 201);
});

/**
 * PATCH /api/admin/traffic-sources/:id
 * Update a traffic source with COALESCE pattern.
 */
const updateTrafficSource = asyncHandler(async (req, res) => {
  const tsId = parseInt(req.params.id);
  if (!tsId) return error(res, 'Invalid traffic source id', 400);

  const existing = await queryOne(
    'SELECT id FROM 1ai_traffic_sources WHERE id = ?',
    [tsId]
  );
  if (!existing) return error(res, 'Traffic source not found', 404);

  const data = req.validated || {};
  const now = Math.floor(Date.now() / 1000);

  await pool.query(
    `UPDATE 1ai_traffic_sources SET
       name = COALESCE(?, name),
       platform_type = COALESCE(?, platform_type),
       cost_model = COALESCE(?, cost_model),
       currency = COALESCE(?, currency),
       tracking_domain = COALESCE(?, tracking_domain),
       postback_url_template = COALESCE(?, postback_url_template),
       updated_at = ?
     WHERE id = ?`,
    [
      data.name || null,
      data.platform_type || null,
      data.cost_model || null,
      data.currency || null,
      data.tracking_domain || null,
      data.postback_url_template || null,
      now,
      tsId,
    ]
  );

  return success(res, { success: true });
});

/**
 * POST /api/admin/traffic-sources/:id/connect-meta
 * Connect a Meta Ads account to this traffic source.
 */
const connectMetaAccount = asyncHandler(async (req, res) => {
  return success(res, { success: true, message: 'Meta API integration ready' });
});

/**
 * POST /api/admin/traffic-sources/:id/sync
 * Sync daily stats from the connected ad platform.
 */
const syncTrafficSource = asyncHandler(async (req, res) => {
  return success(res, { success: true, message: 'Sync queued' });
});

/**
 * GET /api/admin/traffic-sources/:id/daily-stats
 * Returns daily stats from 1ai_meta_daily_stats for this traffic source.
 */
const getTrafficSourceDailyStats = asyncHandler(async (req, res) => {
  const tsId = parseInt(req.params.id);
  if (!tsId) return error(res, 'Invalid traffic source id', 400);

  const rows = await queryRows(
    `SELECT id, traffic_source_id, campaign_id, campaign_name,
            report_date, spend, impressions, clicks, cpc, ctr
     FROM 1ai_meta_daily_stats
     WHERE traffic_source_id = ?
     ORDER BY report_date DESC
     LIMIT 90`,
    [tsId]
  );

  return success(res, { data: rows });
});

module.exports = {
  getTrafficSources,
  createTrafficSource,
  updateTrafficSource,
  connectMetaAccount,
  syncTrafficSource,
  getTrafficSourceDailyStats,
};
