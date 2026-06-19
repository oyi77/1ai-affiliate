const { asyncHandler } = require('../utils/asyncHandler');
const { success, created, error } = require('../utils/apiResponse');
const { validate, z } = require('../utils/validate');
const pool = require('../db/mysql');
const automationService = require('../services/automationService');

const configSchemas = {
  auto_pause: z.object({
    action: z.literal('pause_campaign'),
    target: z.string().optional().default('meta'),
    days: z.number().int().min(1).max(30).optional().default(3),
    order_threshold: z.number().int().min(0).optional().default(0),
  }),
  auto_scale: z.object({
    action: z.literal('increase_budget'),
    roas_threshold: z.number().min(0).optional().default(3.0),
    increase_pct: z.number().int().min(1).max(100).optional().default(20),
    max_budget: z.number().min(0).optional(),
    days: z.number().int().min(1).max(30).optional().default(3),
  }),
  sleep_schedule: z.object({
    action: z.enum(['pause_all', 'log']).optional().default('pause_all'),
    start_hour: z.number().int().min(0).max(23),
    end_hour: z.number().int().min(0).max(23),
    resume_after: z.boolean().optional().default(true),
  }),
  balance_alert: z.object({
    action: z.literal('telegram_alert'),
    threshold: z.number().min(0),
  }),
  performance_alert: z.object({
    action: z.enum(['telegram_alert', 'log']).optional().default('telegram_alert'),
    metric: z.enum(['roas', 'spend']).optional().default('roas'),
    threshold: z.number().min(0),
    condition: z.enum(['below', 'above']).optional().default('below'),
    days: z.number().int().min(1).max(30).optional().default(1),
  }),
};

const saveRuleSchema = z.object({
  id: z.number().int().optional(),
  rule_type: z.enum(['auto_pause', 'auto_scale', 'sleep_schedule', 'balance_alert', 'performance_alert']),
  name: z.string().min(1).max(128),
  config: z.record(z.unknown()),
  enabled: z.boolean().optional().default(true),
}).refine(
  (data) => {
    const schema = configSchemas[data.rule_type];
    if (!schema) return true;
    const result = schema.safeParse(data.config);
    return result.success;
  },
  { message: 'Invalid config for the selected rule type', path: ['config'] }
);

const getRules = asyncHandler(async (req, res) => {
  const rules = await automationService.getRules(pool, req.user.id);
  return success(res, { data: rules });
});

const saveRule = asyncHandler(async (req, res) => {
  const data = req.validated;
  const ruleId = await automationService.saveRule(pool, req.user.id, data);
  return data.id
    ? success(res, { success: true, id: ruleId })
    : created(res, { success: true, id: ruleId });
});

const deleteRule = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const affected = await automationService.deleteRule(pool, id, req.user.id);
  if (!affected) return error(res, 'Rule not found', 404);
  return success(res, { success: true });
});

const runRules = asyncHandler(async (req, res) => {
  const results = await automationService.evaluateRules(pool);
  return success(res, { success: true, triggered: results.length, results });
});

module.exports = {
  getRules,
  saveRule: [validate(saveRuleSchema), saveRule],
  deleteRule,
  runRules,
};
