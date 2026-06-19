const { asyncHandler } = require('../utils/asyncHandler');
const { success, created, error } = require('../utils/apiResponse');
const { queryOne, queryRows, queryInsert } = require('../utils/queryHelpers');
const { validate, z } = require('../utils/validate');
const pool = require('../db/mysql');

/**
 * Balance ledger CRUD — tracks deposits, withdrawals, spend, and adjustments.
 */

const createBalanceEntrySchema = z.object({
  amount: z.number(),
  type: z.enum(['deposit', 'withdrawal', 'spend', 'adjustment']),
  traffic_source_id: z.number().int().positive().optional(),
  note: z.string().optional(),
});

/**
 * GET /api/admin/balance
 * List balance entries with optional filters.
 */
const getBalanceEntries = asyncHandler(async (req, res) => {
  const { type, traffic_source_id } = req.query;
  const conditions = ['user_id = ?'];
  const params = [req.user.id];

  if (type) {
    conditions.push('type = ?');
    params.push(type);
  }
  if (traffic_source_id) {
    conditions.push('traffic_source_id = ?');
    params.push(parseInt(traffic_source_id));
  }

  const rows = await queryRows(
    `SELECT * FROM 1ai_balance_ledger WHERE ${conditions.join(' AND ')} ORDER BY created_at DESC`,
    params
  );
  return success(res, { data: rows });
});

/**
 * POST /api/admin/balance
 * Create a new balance entry.
 */
const createBalanceEntry = asyncHandler(async (req, res) => {
  const data = req.validated;
  const now = Math.floor(Date.now() / 1000);

  const id = await queryInsert(
    `INSERT INTO 1ai_balance_ledger (user_id, traffic_source_id, amount, type, note, created_at)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [
      req.user.id,
      data.traffic_source_id || null,
      data.amount,
      data.type,
      data.note || null,
      now,
    ]
  );

  return created(res, { success: true, id });
});

/**
 * GET /api/admin/balance/summary
 * Aggregate totals: deposits, withdrawals, spend, current balance.
 */
const getBalanceSummary = asyncHandler(async (req, res) => {
  const rows = await queryRows(
    `SELECT type, SUM(amount) as total FROM 1ai_balance_ledger WHERE user_id = ? GROUP BY type`,
    [req.user.id]
  );

  const summary = { deposits: 0, withdrawals: 0, spend: 0, adjustments: 0 };
  for (const row of rows) {
    if (row.type === 'deposit') summary.deposits = Number(row.total);
    else if (row.type === 'withdrawal') summary.withdrawals = Number(row.total);
    else if (row.type === 'spend') summary.spend = Number(row.total);
    else if (row.type === 'adjustment') summary.adjustments = Number(row.total);
  }

  summary.current_balance = summary.deposits - summary.withdrawals - summary.spend + summary.adjustments;

  return success(res, summary);
});

module.exports = {
  getBalanceEntries,
  createBalanceEntry,
  getBalanceSummary,
  createBalanceEntrySchema,
  validate: validate,
};
