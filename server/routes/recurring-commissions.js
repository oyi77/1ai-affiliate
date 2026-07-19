'use strict';

/**
 * /api/recurring-commissions — recurring commission plan and commission management
 */
const express = require('express');
const router = express.Router();
const { authenticate, requireAdmin } = require('../middleware/auth');
const { asyncHandler } = require('../utils/asyncHandler');
const svc = require('../services/recurringCommissionService');

// ─── Plans ────────────────────────────────────────────────────────────────────

/**
 * GET /api/recurring-commissions/plans — list all plans for an offer
 */
router.get('/plans', authenticate, asyncHandler(async (req, res) => {
  const { offer_id } = req.query;
  if (!offer_id) {
    return res.status(400).json({ error: 'offer_id query parameter is required' });
  }
  const rows = await svc.getPlans(parseInt(offer_id, 10));
  res.json({ data: rows });
}));

/**
 * POST /api/recurring-commissions/plans — create a plan (admin)
 */
router.post('/plans', authenticate, requireAdmin, asyncHandler(async (req, res) => {
  const { offer_id, name, commission_type, commission_value, billing_cycle, max_duration_months } = req.body;
  if (!offer_id || !name || !commission_type || commission_value == null || !billing_cycle) {
    return res.status(400).json({ error: 'offer_id, name, commission_type, commission_value, and billing_cycle are required' });
  }
  try {
    const id = await svc.createPlan(offer_id, name, commission_type, commission_value, billing_cycle, max_duration_months || null);
    res.status(201).json({ data: { id } });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'A plan with this offer and commission type already exists' });
    }
    throw err;
  }
}));

/**
 * PUT /api/recurring-commissions/plans/:id — update a plan (admin)
 */
router.put('/plans/:id', authenticate, requireAdmin, asyncHandler(async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (!id) return res.status(400).json({ error: 'Invalid plan id' });

  const existing = await svc.getPlan(id);
  if (!existing) return res.status(404).json({ error: 'Plan not found' });

  const { name, commission_type, commission_value, billing_cycle, max_duration_months, status } = req.body;
  const data = {};
  if (name !== undefined) data.name = name;
  if (commission_type !== undefined) data.commissionType = commission_type;
  if (commission_value !== undefined) data.commissionValue = commission_value;
  if (billing_cycle !== undefined) data.billingCycle = billing_cycle;
  if (max_duration_months !== undefined) data.maxDurationMonths = max_duration_months;
  if (status !== undefined) data.status = status;

  const affected = await svc.updatePlan(id, data);
  res.json({ data: { updated: affected > 0 } });
}));

// ─── Commissions ──────────────────────────────────────────────────────────────

/**
 * GET /api/recurring-commissions — list my commissions
 */
router.get('/', authenticate, asyncHandler(async (req, res) => {
  const { status } = req.query;
  const rows = await svc.getCommissions(req.user.id, status || null);
  res.json({ data: rows });
}));

/**
 * GET /api/recurring-commissions/admin — list all commissions (admin)
 */
router.get('/admin', authenticate, requireAdmin, asyncHandler(async (req, res) => {
  const { affiliate_id, status } = req.query;
  let sql = `SELECT rc.*, rcp.name AS plan_name, rcp.commission_type, a.name AS affiliate_name
             FROM 1ai_recurring_commissions rc
             LEFT JOIN 1ai_recurring_commission_plans rcp ON rcp.id = rc.plan_id
             LEFT JOIN 1ai_affiliates a ON a.id = rc.affiliate_id
             WHERE 1=1`;
  const params = [];

  if (affiliate_id) {
    sql += ' AND rc.affiliate_id = ?';
    params.push(parseInt(affiliate_id, 10));
  }
  if (status) {
    sql += ' AND rc.status = ?';
    params.push(status);
  }

  sql += ' ORDER BY rc.created_at DESC';

  const pool = require('../db/mysql');
  const [rows] = await pool.query(sql, params);
  res.json({ data: rows });
}));

/**
 * POST /api/recurring-commissions/:id/mark-paid — mark a commission as paid (admin)
 */
router.post('/:id/mark-paid', authenticate, requireAdmin, asyncHandler(async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (!id) return res.status(400).json({ error: 'Invalid commission id' });

  const affected = await svc.markPaid(id);
  if (!affected) return res.status(404).json({ error: 'Commission not found or already paid' });

  res.json({ success: true });
}));

/**
 * POST /api/recurring-commissions/calculate — trigger commission calculation (admin)
 */
router.post('/calculate', authenticate, requireAdmin, asyncHandler(async (req, res) => {
  const { plan_id, affiliate_id, offer_id, gross_amount, period_start, period_end } = req.body;
  if (!plan_id || !affiliate_id || !offer_id || gross_amount == null || !period_start || !period_end) {
    return res.status(400).json({ error: 'plan_id, affiliate_id, offer_id, gross_amount, period_start, and period_end are required' });
  }

  const id = await svc.calculateCommission(
    parseInt(plan_id, 10),
    parseInt(affiliate_id, 10),
    parseInt(offer_id, 10),
    parseFloat(gross_amount),
    parseInt(period_start, 10),
    parseInt(period_end, 10)
  );
  res.status(201).json({ data: { id } });
}));

module.exports = router;
