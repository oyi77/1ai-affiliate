'use strict';

const { queryOne, queryRows, queryInsert, queryUpdate } = require('../utils/queryHelpers');

// ─── Plans ────────────────────────────────────────────────────────────────────

/**
 * Create a recurring commission plan.
 * @param {number} offerId
 * @param {string} name
 * @param {string} commissionType - subscription_revenue|recurring_percentage|fixed_recurring
 * @param {number} commissionValue
 * @param {string} billingCycle - weekly|monthly|quarterly|yearly
 * @param {number} maxDurationMonths
 * @returns {Promise<number>} insertId
 */
async function createPlan(offerId, name, commissionType, commissionValue, billingCycle, maxDurationMonths) {
  const now = Math.floor(Date.now() / 1000);
  return queryInsert(
    `INSERT INTO 1ai_recurring_commission_plans
     (offer_id, name, commission_type, commission_value, billing_cycle, max_duration_months, status, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, 'active', ?, ?)`,
    [offerId, name, commissionType, commissionValue, billingCycle, maxDurationMonths, now, now]
  );
}

/**
 * Get all plans for an offer.
 * @param {number} offerId
 * @returns {Promise<Array>}
 */
async function getPlans(offerId) {
  return queryRows(
    'SELECT * FROM 1ai_recurring_commission_plans WHERE offer_id = ? ORDER BY created_at DESC',
    [offerId]
  );
}

/**
 * Get a single plan by id.
 * @param {number} id
 * @returns {Promise<object|null>}
 */
async function getPlan(id) {
  return queryOne('SELECT * FROM 1ai_recurring_commission_plans WHERE id = ?', [id]);
}

/**
 * Update a plan. Only provided fields are updated.
 * @param {number} id
 * @param {object} data
 * @returns {Promise<number>} affectedRows
 */
async function updatePlan(id, data) {
  const now = Math.floor(Date.now() / 1000);
  const sets = [];
  const params = [];

  if (data.name !== undefined) {
    sets.push('name = ?');
    params.push(data.name);
  }
  if (data.commissionType !== undefined) {
    sets.push('commission_type = ?');
    params.push(data.commissionType);
  }
  if (data.commissionValue !== undefined) {
    sets.push('commission_value = ?');
    params.push(data.commissionValue);
  }
  if (data.billingCycle !== undefined) {
    sets.push('billing_cycle = ?');
    params.push(data.billingCycle);
  }
  if (data.maxDurationMonths !== undefined) {
    sets.push('max_duration_months = ?');
    params.push(data.maxDurationMonths);
  }
  if (data.status !== undefined) {
    sets.push('status = ?');
    params.push(data.status);
  }

  if (sets.length === 0) return 0;

  sets.push('updated_at = ?');
  params.push(now);
  params.push(id);

  return queryUpdate(
    `UPDATE 1ai_recurring_commission_plans SET ${sets.join(', ')} WHERE id = ?`,
    params
  );
}

/**
 * Get all active plans.
 * @returns {Promise<Array>}
 */
async function getActivePlans() {
  return queryRows(
    "SELECT * FROM 1ai_recurring_commission_plans WHERE status = 'active' ORDER BY created_at DESC"
  );
}

// ─── Commissions ──────────────────────────────────────────────────────────────

/**
 * Calculate and create a recurring commission entry.
 * Determines the amount based on the plan's commission_type and value.
 * @param {number} planId
 * @param {number} affiliateId
 * @param {number} offerId
 * @param {number} grossAmount
 * @param {number} periodStart - Unix timestamp
 * @param {number} periodEnd - Unix timestamp
 * @returns {Promise<number>} insertId
 */
async function calculateCommission(planId, affiliateId, offerId, grossAmount, periodStart, periodEnd) {
  const plan = await getPlan(planId);
  if (!plan) throw new Error('Plan not found');
  if (plan.status !== 'active') throw new Error('Plan is not active');

  let commissionAmount;
  switch (plan.commission_type) {
    case 'subscription_revenue':
    case 'recurring_percentage':
      commissionAmount = grossAmount * (plan.commission_value / 100);
      break;
    case 'fixed_recurring':
      commissionAmount = plan.commission_value;
      break;
    default:
      throw new Error(`Unknown commission_type: ${plan.commission_type}`);
  }

  const now = Math.floor(Date.now() / 1000);
  const id = await queryInsert(
    `INSERT INTO 1ai_recurring_commissions
     (plan_id, affiliate_id, offer_id, period_start, period_end, gross_amount, commission_amount, status, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, 'pending', ?)`,
    [planId, affiliateId, offerId, periodStart, periodEnd, grossAmount, commissionAmount, now]
  );

  await logAction(id, 'calculated', `Commission calculated: ${commissionAmount} (${plan.commission_type} @ ${plan.commission_value})`);

  return id;
}

/**
 * Get commissions for an affiliate, optionally filtered by status.
 * @param {number} affiliateId
 * @param {string} [status]
 * @returns {Promise<Array>}
 */
async function getCommissions(affiliateId, status) {
  let sql = `SELECT rc.*, rcp.name AS plan_name, rcp.commission_type
             FROM 1ai_recurring_commissions rc
             LEFT JOIN 1ai_recurring_commission_plans rcp ON rcp.id = rc.plan_id
             WHERE rc.affiliate_id = ?`;
  const params = [affiliateId];

  if (status) {
    sql += ' AND rc.status = ?';
    params.push(status);
  }

  sql += ' ORDER BY rc.created_at DESC';
  return queryRows(sql, params);
}

/**
 * Mark a commission as paid.
 * @param {number} id
 * @returns {Promise<number>} affectedRows
 */
async function markPaid(id) {
  const now = Math.floor(Date.now() / 1000);
  const affected = await queryUpdate(
    "UPDATE 1ai_recurring_commissions SET status = 'paid', paid_at = ? WHERE id = ? AND status = 'pending'",
    [now, id]
  );

  if (affected > 0) {
    await logAction(id, 'paid', 'Commission marked as paid');
  }

  return affected;
}

// ─── Logs ─────────────────────────────────────────────────────────────────────

/**
 * Insert a log entry for a recurring commission.
 * @param {number} recurringId
 * @param {string} action - calculated|paid|failed|retried|cancelled
 * @param {string} notes
 * @returns {Promise<number>} insertId
 */
async function logAction(recurringId, action, notes) {
  const now = Math.floor(Date.now() / 1000);
  return queryInsert(
    `INSERT INTO 1ai_recurring_commission_logs
     (recurring_id, action, notes, created_at)
     VALUES (?, ?, ?, ?)`,
    [recurringId, action, notes, now]
  );
}

module.exports = {
  createPlan, getPlans, getPlan, updatePlan, getActivePlans,
  calculateCommission, getCommissions, markPaid,
  logAction,
};
