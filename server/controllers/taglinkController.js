const { asyncHandler } = require('../utils/asyncHandler');
const { success, created, error } = require('../utils/apiResponse');
const { queryOne, queryRows, queryInsert, queryUpdate } = require('../utils/queryHelpers');
const { validate, z } = require('../utils/validate');
const pool = require('../db/mysql');

/**
 * Taglink mapping CRUD — links taglinks to offers, traffic sources, and Meta campaigns.
 */

const createTaglinkSchema = z.object({
  taglink: z.string().min(1),
  offer_id: z.number().int().positive().optional(),
  traffic_source_id: z.number().int().positive().optional(),
  meta_campaign_id: z.string().optional(),
  meta_campaign_name: z.string().optional(),
  advertiser_id: z.number().int().positive().optional(),
  budget_daily: z.number().min(0).optional(),
  status: z.enum(['active', 'paused', 'archived']).optional(),
});

const updateTaglinkSchema = z.object({
  taglink: z.string().min(1).optional(),
  offer_id: z.number().int().positive().nullable().optional(),
  traffic_source_id: z.number().int().positive().nullable().optional(),
  meta_campaign_id: z.string().nullable().optional(),
  meta_campaign_name: z.string().nullable().optional(),
  advertiser_id: z.number().int().positive().nullable().optional(),
  budget_daily: z.number().min(0).nullable().optional(),
  status: z.enum(['active', 'paused', 'archived']).optional(),
});

/**
 * GET /api/admin/taglinks
 * List all taglink mappings for the current user.
 */
const getTaglinks = asyncHandler(async (req, res) => {
  const rows = await queryRows(
    'SELECT * FROM 1ai_taglink_mappings WHERE user_id = ? ORDER BY created_at DESC',
    [req.user.id]
  );
  return success(res, { data: rows });
});

/**
 * POST /api/admin/taglinks
 * Create a new taglink mapping.
 */
const createTaglink = asyncHandler(async (req, res) => {
  const data = req.validated;
  const now = Math.floor(Date.now() / 1000);

  const id = await queryInsert(
    `INSERT INTO 1ai_taglink_mappings (user_id, taglink, offer_id, traffic_source_id, meta_campaign_id, meta_campaign_name, advertiser_id, budget_daily, status, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      req.user.id,
      data.taglink,
      data.offer_id || null,
      data.traffic_source_id || null,
      data.meta_campaign_id || null,
      data.meta_campaign_name || null,
      data.advertiser_id || null,
      data.budget_daily || null,
      data.status || 'active',
      now,
      now,
    ]
  );

  return created(res, { success: true, id });
});

/**
 * PATCH /api/admin/taglinks/:id
 * Update a taglink mapping.
 */
const updateTaglink = asyncHandler(async (req, res) => {
  const id = parseInt(req.params.id);
  if (!id) return error(res, 'Invalid taglink id', 400);

  const existing = await queryOne(
    'SELECT id FROM 1ai_taglink_mappings WHERE id = ? AND user_id = ?',
    [id, req.user.id]
  );
  if (!existing) return error(res, 'Taglink not found', 404);

  const data = req.validated;
  const fields = [];
  const params = [];

  for (const [key, val] of Object.entries(data)) {
    fields.push(`${key} = ?`);
    params.push(val);
  }

  if (fields.length === 0) return error(res, 'No fields to update', 400);

  fields.push('updated_at = ?');
  params.push(Math.floor(Date.now() / 1000));
  params.push(id);

  await pool.query(
    `UPDATE 1ai_taglink_mappings SET ${fields.join(', ')} WHERE id = ?`,
    params
  );

  return success(res, { success: true });
});

/**
 * DELETE /api/admin/taglinks/:id
 * Delete a taglink mapping.
 */
const deleteTaglink = asyncHandler(async (req, res) => {
  const id = parseInt(req.params.id);
  if (!id) return error(res, 'Invalid taglink id', 400);

  const affected = await queryUpdate(
    'DELETE FROM 1ai_taglink_mappings WHERE id = ? AND user_id = ?',
    [id, req.user.id]
  );
  if (!affected) return error(res, 'Taglink not found', 404);

  return success(res, { success: true });
});

module.exports = {
  getTaglinks,
  createTaglink,
  updateTaglink,
  deleteTaglink,
  createTaglinkSchema,
  updateTaglinkSchema,
  validate: validate,
};
