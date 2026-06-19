const { asyncHandler } = require('../utils/asyncHandler');
const { success, created, error } = require('../utils/apiResponse');
const { queryOne, queryRows, queryInsert, queryUpdate } = require('../utils/queryHelpers');
const { validate, z } = require('../utils/validate');

const createRuleSchema = z.object({
  name: z.string().min(1),
  offer_id: z.number().int().positive().optional(),
  conditions: z.object({
    geo: z.array(z.string()).optional(),
    device: z.array(z.string()).optional(),
    os: z.array(z.string()).optional(),
    browser: z.array(z.string()).optional(),
    carrier: z.array(z.string()).optional(),
    connection_type: z.array(z.string()).optional(),
    time_of_day: z.object({
      start: z.string(),
      end: z.string(),
    }).optional(),
  }),
  action: z.enum(['redirect', 'show_landing', 'block']).default('redirect'),
  target_url: z.string().url().optional(),
  landing_page_id: z.number().int().positive().optional(),
  weight: z.number().int().min(1).max(100).optional(),
  enabled: z.boolean().optional(),
  priority: z.number().int().optional(),
});

const updateRuleSchema = createRuleSchema.partial();

const getRules = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const rows = await queryRows(
    'SELECT * FROM 1ai_traffic_rules WHERE user_id = ? ORDER BY priority DESC, id DESC',
    [userId]
  );
  // Parse JSON conditions for each row
  for (const row of rows) {
    if (typeof row.conditions === 'string') {
      row.conditions = JSON.parse(row.conditions);
    }
  }
  return success(res, { data: rows });
});

const createRule = [
  validate(createRuleSchema),
  asyncHandler(async (req, res) => {
    const data = req.validated;
    const userId = req.user.id;
    const now = Math.floor(Date.now() / 1000);

    const id = await queryInsert(
      `INSERT INTO 1ai_traffic_rules
        (user_id, name, offer_id, conditions, action, target_url, landing_page_id, weight, enabled, priority, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userId,
        data.name,
        data.offer_id || null,
        JSON.stringify(data.conditions),
        data.action || 'redirect',
        data.target_url || null,
        data.landing_page_id || null,
        data.weight || 100,
        data.enabled !== false ? 1 : 0,
        data.priority || 0,
        now,
        now,
      ]
    );

    return created(res, { success: true, id });
  }),
];

const updateRule = [
  validate(updateRuleSchema),
  asyncHandler(async (req, res) => {
    const id = parseInt(req.params.id);
    const userId = req.user.id;
    const data = req.validated;
    const now = Math.floor(Date.now() / 1000);

    const existing = await queryOne(
      'SELECT id FROM 1ai_traffic_rules WHERE id = ? AND user_id = ?',
      [id, userId]
    );
    if (!existing) {
      return error(res, 'Rule not found', 404);
    }

    const sets = ['updated_at = ?'];
    const params = [now];

    if (data.name !== undefined) { sets.push('name = ?'); params.push(data.name); }
    if (data.offer_id !== undefined) { sets.push('offer_id = ?'); params.push(data.offer_id); }
    if (data.conditions !== undefined) { sets.push('conditions = ?'); params.push(JSON.stringify(data.conditions)); }
    if (data.action !== undefined) { sets.push('action = ?'); params.push(data.action); }
    if (data.target_url !== undefined) { sets.push('target_url = ?'); params.push(data.target_url); }
    if (data.landing_page_id !== undefined) { sets.push('landing_page_id = ?'); params.push(data.landing_page_id); }
    if (data.weight !== undefined) { sets.push('weight = ?'); params.push(data.weight); }
    if (data.enabled !== undefined) { sets.push('enabled = ?'); params.push(data.enabled ? 1 : 0); }
    if (data.priority !== undefined) { sets.push('priority = ?'); params.push(data.priority); }

    params.push(id, userId);
    await queryUpdate(
      `UPDATE 1ai_traffic_rules SET ${sets.join(', ')} WHERE id = ? AND user_id = ?`,
      params
    );

    return success(res, { success: true });
  }),
];

const deleteRule = asyncHandler(async (req, res) => {
  const id = parseInt(req.params.id);
  const userId = req.user.id;

  const deleted = await queryUpdate(
    'DELETE FROM 1ai_traffic_rules WHERE id = ? AND user_id = ?',
    [id, userId]
  );

  if (!deleted) {
    return error(res, 'Rule not found', 404);
  }

  return success(res, { success: true });
});

module.exports = { getRules, createRule, updateRule, deleteRule };
