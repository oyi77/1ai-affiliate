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
       (name, platform_type, cost_model, currency, tracking_domain,
        postback_url_template, user_id, affiliate_id, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      data.name,
      data.platform_type || null,
      data.cost_model || 'CPC',
      data.currency || 'IDR',
      data.tracking_domain || null,
      data.postback_url_template || null,
      req.user.id,
      null,
      now,
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
 * POST /api/admin/traffic-sources/:id/connect
 * Generic connect — works for any registered integration.
 * Body: { platform_type, ...auth_fields }
 */
const connectIntegration = asyncHandler(async (req, res) => {
  const tsId = parseInt(req.params.id);
  if (!tsId) return error(res, 'Invalid traffic source id', 400);

  const { platform_type, ...credentials } = req.body;
  if (!platform_type) return error(res, 'platform_type required', 400);

  const registry = require('../integrations/registry');
  const integration = registry.get(platform_type);
  if (!integration) return error(res, `Unknown platform: ${platform_type}. Available: ${registry.listAll().map(i => i.id).join(', ')}`, 400);

  // Validate required fields
  for (const field of integration.meta.auth_fields.filter(f => f.required)) {
    if (!credentials[field.key]) return error(res, `${field.key} required`, 400);
  }

  // Test connection
  const test = await integration.testConnection(credentials);
  if (!test.ok) return error(res, `Connection test failed: ${test.error}`, 400);

  await pool.query(
    `UPDATE 1ai_traffic_sources SET api_config = ?, platform_type = ?, updated_at = ? WHERE id = ?`,
    [JSON.stringify(credentials), platform_type, Math.floor(Date.now() / 1000), tsId]
  );
  return success(res, { success: true, platform: platform_type, account: test.account });
});

/**
 * POST /api/admin/traffic-sources/:id/sync
 * Generic sync — dispatches to the registered integration.
 */
const syncTrafficSource = asyncHandler(async (req, res) => {
  const tsId = parseInt(req.params.id);
  if (!tsId) return error(res, 'Invalid traffic source id', 400);

  const ts = await queryOne('SELECT id, platform_type, api_config FROM 1ai_traffic_sources WHERE id = ?', [tsId]);
  if (!ts) return error(res, 'Traffic source not found', 404);

  const config = typeof ts.api_config === 'string' ? JSON.parse(ts.api_config) : ts.api_config;
  if (!config) return error(res, 'No API config. Connect first.', 400);

  const registry = require('../integrations/registry');
  if (!registry.get(ts.platform_type)) return error(res, `No integration for: ${ts.platform_type}`, 400);

  const { date_from, date_to } = req.query;
  const dateFrom = date_from || new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0];
  const dateTo = date_to || new Date().toISOString().split('T')[0];

  const result = await registry.sync(ts.platform_type, pool, tsId, config, dateFrom, dateTo);
  return success(res, { success: true, platform: ts.platform_type, synced: result.synced, errors: result.errors });
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
  connectIntegration,
  syncTrafficSource,
  getTrafficSourceDailyStats,
  createTrafficSourceSchema,
  validate: validate,
};
