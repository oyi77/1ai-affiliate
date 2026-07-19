'use strict';

const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { asyncHandler } = require('../utils/asyncHandler');
const svc = require('../services/analyticsService');

// ─── Dashboards ──────────────────────────────────────────────────────────────

// GET /api/analytics/dashboards — list all dashboards for current affiliate
router.get('/dashboards', authenticate, asyncHandler(async (req, res) => {
  const rows = await svc.getDashboards(req.user.id);
  res.json({ data: rows });
}));

// POST /api/analytics/dashboards — create a dashboard
router.post('/dashboards', authenticate, asyncHandler(async (req, res) => {
  const { name, config, is_public } = req.body;
  if (!name) {
    return res.status(400).json({ error: 'name is required' });
  }
  const id = await svc.createDashboard(
    req.user.id,
    name,
    config || {},
    is_public || false
  );
  res.status(201).json({ data: { id } });
}));

// GET /api/analytics/dashboards/:id — get a single dashboard
router.get('/dashboards/:id', authenticate, asyncHandler(async (req, res) => {
  const dashboard = await svc.getDashboard(parseInt(req.params.id, 10));
  if (!dashboard) {
    return res.status(404).json({ error: 'Dashboard not found' });
  }
  // Ensure affiliate can only access own dashboards or public ones
  if (dashboard.affiliate_id !== req.user.id && !dashboard.is_public) {
    return res.status(404).json({ error: 'Dashboard not found' });
  }
  res.json({ data: dashboard });
}));

// PUT /api/analytics/dashboards/:id — update a dashboard
router.put('/dashboards/:id', authenticate, asyncHandler(async (req, res) => {
  const id = parseInt(req.params.id, 10);
  const existing = await svc.getDashboard(id);
  if (!existing || existing.affiliate_id !== req.user.id) {
    return res.status(404).json({ error: 'Dashboard not found' });
  }
  const { name, config, is_public } = req.body;
  const affected = await svc.updateDashboard(id, { name, config, isPublic: is_public });
  res.json({ data: { updated: affected > 0 } });
}));

// DELETE /api/analytics/dashboards/:id — delete a dashboard
router.delete('/dashboards/:id', authenticate, asyncHandler(async (req, res) => {
  const id = parseInt(req.params.id, 10);
  const existing = await svc.getDashboard(id);
  if (!existing || existing.affiliate_id !== req.user.id) {
    return res.status(404).json({ error: 'Dashboard not found' });
  }
  const affected = await svc.deleteDashboard(id);
  res.json({ data: { deleted: affected > 0 } });
}));

// ─── Reports ─────────────────────────────────────────────────────────────────

// POST /api/analytics/reports — create a report
router.post('/reports', authenticate, asyncHandler(async (req, res) => {
  const { dashboard_id, name, report_type, config, chart_type, sort_order } = req.body;
  if (!dashboard_id || !name || !report_type) {
    return res.status(400).json({ error: 'dashboard_id, name, and report_type are required' });
  }
  // Verify dashboard ownership
  const dashboard = await svc.getDashboard(parseInt(dashboard_id, 10));
  if (!dashboard || dashboard.affiliate_id !== req.user.id) {
    return res.status(404).json({ error: 'Dashboard not found' });
  }
  const id = await svc.createReport(
    parseInt(dashboard_id, 10),
    name,
    report_type,
    config || {},
    chart_type || 'table',
    sort_order || 0
  );
  res.status(201).json({ data: { id } });
}));

// GET /api/analytics/dashboards/:id/reports — list reports for a dashboard
router.get('/dashboards/:id/reports', authenticate, asyncHandler(async (req, res) => {
  const dashboardId = parseInt(req.params.id, 10);
  const dashboard = await svc.getDashboard(dashboardId);
  if (!dashboard || dashboard.affiliate_id !== req.user.id) {
    return res.status(404).json({ error: 'Dashboard not found' });
  }
  const rows = await svc.getReportsByDashboard(dashboardId);
  res.json({ data: rows });
}));

// PUT /api/analytics/reports/:id — update a report
router.put('/reports/:id', authenticate, asyncHandler(async (req, res) => {
  const id = parseInt(req.params.id, 10);
  // Verify ownership via dashboard
  const report = await svc.getReportsByDashboard(0); // placeholder
  // Instead, do a direct ownership check by joining through dashboard
  const pool = require('../db/mysql');
  const [rows] = await pool.query(
    `SELECT r.id, d.affiliate_id
     FROM 1ai_analytics_reports r
     JOIN 1ai_analytics_dashboards d ON d.id = r.dashboard_id
     WHERE r.id = ?`,
    [id]
  );
  if (!rows || !rows[0] || rows[0].affiliate_id !== req.user.id) {
    return res.status(404).json({ error: 'Report not found' });
  }
  const { name, report_type, config, chart_type, sort_order } = req.body;
  const affected = await svc.updateReport(id, {
    name,
    reportType: report_type,
    config,
    chartType: chart_type,
    sortOrder: sort_order,
  });
  res.json({ data: { updated: affected > 0 } });
}));

// DELETE /api/analytics/reports/:id — delete a report
router.delete('/reports/:id', authenticate, asyncHandler(async (req, res) => {
  const id = parseInt(req.params.id, 10);
  const pool = require('../db/mysql');
  const [rows] = await pool.query(
    `SELECT r.id, d.affiliate_id
     FROM 1ai_analytics_reports r
     JOIN 1ai_analytics_dashboards d ON d.id = r.dashboard_id
     WHERE r.id = ?`,
    [id]
  );
  if (!rows || !rows[0] || rows[0].affiliate_id !== req.user.id) {
    return res.status(404).json({ error: 'Report not found' });
  }
  const affected = await svc.deleteReport(id);
  res.json({ data: { deleted: affected > 0 } });
}));

// ─── Tracking Plans ──────────────────────────────────────────────────────────

// GET /api/analytics/tracking-plans — list tracking plans
router.get('/tracking-plans', authenticate, asyncHandler(async (req, res) => {
  const rows = await svc.getPlans(req.user.id);
  res.json({ data: rows });
}));

// POST /api/analytics/tracking-plans — create a tracking plan
router.post('/tracking-plans', authenticate, asyncHandler(async (req, res) => {
  const { name, schema } = req.body;
  if (!name) {
    return res.status(400).json({ error: 'name is required' });
  }
  const id = await svc.createPlan(req.user.id, name, schema || {});
  res.status(201).json({ data: { id } });
}));

// PUT /api/analytics/tracking-plans/:id — update a tracking plan
router.put('/tracking-plans/:id', authenticate, asyncHandler(async (req, res) => {
  const id = parseInt(req.params.id, 10);
  // Verify ownership
  const pool = require('../db/mysql');
  const [rows] = await pool.query(
    'SELECT id, affiliate_id FROM 1ai_analytics_tracking_plans WHERE id = ?',
    [id]
  );
  if (!rows || !rows[0] || rows[0].affiliate_id !== req.user.id) {
    return res.status(404).json({ error: 'Tracking plan not found' });
  }
  const { name, schema, status } = req.body;
  const affected = await svc.updatePlan(id, { name, schema, status });
  res.json({ data: { updated: affected > 0 } });
}));

module.exports = router;
