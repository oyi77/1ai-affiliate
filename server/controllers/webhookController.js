/**
 * Webhook Management Controller
 * CRUD for outbound webhooks + test endpoint.
 */

const crypto = require('crypto');
const { asyncHandler } = require('../utils/asyncHandler');
const { success, created, error } = require('../utils/apiResponse');
const { queryOne, queryRows, queryInsert, queryUpdate } = require('../utils/queryHelpers');
const { validate, z } = require('../utils/validate');
const { triggerZapierWebhook, buildTestPayload } = require('../services/zapierService');

// ── Zod schemas ──────────────────────────────────────────────

const createWebhookSchema = z.object({
  url: z.string().url('Must be a valid URL').refine(
    u => u.startsWith('https://') || u.startsWith('http://localhost') || u.startsWith('http://127.0.0.1'),
    'URL must use HTTPS (or HTTP for localhost)'
  ),
  events: z.array(z.string().min(1)).min(1, 'At least one event is required'),
  secret: z.string().max(128).optional(),
  enabled: z.boolean().optional(),
});

const updateWebhookSchema = z.object({
  url: z.string().url().optional(),
  events: z.array(z.string().min(1)).min(1).optional(),
  secret: z.string().max(128).optional(),
  enabled: z.boolean().optional(),
});

// ── Validation middleware ────────────────────────────────────

const validateCreateWebhook = validate(createWebhookSchema);
const validateUpdateWebhook = validate(updateWebhookSchema);

// ── Handlers ─────────────────────────────────────────────────

const AVAILABLE_EVENTS = ['conversion', 'click', 'fraud', 'payout', 'cap_reached', '*'];

const getWebhooks = asyncHandler(async (req, res) => {
  const rows = await queryRows(
    `SELECT id, url, events, enabled, last_triggered_at, created_at, updated_at
     FROM 1ai_webhooks
     WHERE user_id = ?
     ORDER BY created_at DESC`,
    [req.user.id]
  );

  // Parse JSON events field
  const webhooks = rows.map(row => ({
    ...row,
    events: typeof row.events === 'string' ? JSON.parse(row.events) : row.events,
  }));

  return success(res, { data: webhooks, available_events: AVAILABLE_EVENTS });
});

const createWebhook = asyncHandler(async (req, res) => {
  const data = req.validated;
  const now = Math.floor(Date.now() / 1000);

  const id = await queryInsert(
    `INSERT INTO 1ai_webhooks (user_id, url, events, secret, enabled, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      req.user.id,
      data.url,
      JSON.stringify(data.events),
      data.secret || null,
      data.enabled !== false ? 1 : 0,
      now,
      now,
    ]
  );

  return created(res, {
    success: true,
    id,
    url: data.url,
    events: data.events,
  });
});

const updateWebhook = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const data = req.validated;
  const now = Math.floor(Date.now() / 1000);

  const existing = await queryOne(
    'SELECT id FROM 1ai_webhooks WHERE id = ? AND user_id = ?',
    [id, req.user.id]
  );

  if (!existing) {
    return error(res, 'Webhook not found', 404);
  }

  const sets = [];
  const params = [];

  if (data.url !== undefined) { sets.push('url = ?'); params.push(data.url); }
  if (data.events !== undefined) { sets.push('events = ?'); params.push(JSON.stringify(data.events)); }
  if (data.secret !== undefined) { sets.push('secret = ?'); params.push(data.secret); }
  if (data.enabled !== undefined) { sets.push('enabled = ?'); params.push(data.enabled ? 1 : 0); }

  if (sets.length === 0) {
    return error(res, 'No fields to update', 400);
  }

  sets.push('updated_at = ?');
  params.push(now);
  params.push(id, req.user.id);

  await queryUpdate(
    `UPDATE 1ai_webhooks SET ${sets.join(', ')} WHERE id = ? AND user_id = ?`,
    params
  );

  return success(res, { success: true });
});

const deleteWebhook = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const affected = await queryUpdate(
    'DELETE FROM 1ai_webhooks WHERE id = ? AND user_id = ?',
    [id, req.user.id]
  );

  if (affected === 0) {
    return error(res, 'Webhook not found', 404);
  }

  return success(res, { success: true });
});

const testWebhook = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const webhook = await queryOne(
    'SELECT id, url, secret FROM 1ai_webhooks WHERE id = ? AND user_id = ?',
    [id, req.user.id]
  );

  if (!webhook) {
    return error(res, 'Webhook not found', 404);
  }

  const testPayload = buildTestPayload(webhook.url);
  const result = await triggerZapierWebhook(webhook.url, testPayload, webhook.secret);

  if (result.success) {
    // Update last_triggered_at
    await queryUpdate(
      'UPDATE 1ai_webhooks SET last_triggered_at = ? WHERE id = ?',
      [Math.floor(Date.now() / 1000), id]
    );
    return success(res, { success: true, status: result.status, message: 'Test webhook delivered' });
  }

  return error(res, result.error || 'Webhook delivery failed', 400);
});

module.exports = {
  getWebhooks,
  createWebhook,
  updateWebhook,
  deleteWebhook,
  testWebhook,
  validateCreateWebhook,
  validateUpdateWebhook,
};
