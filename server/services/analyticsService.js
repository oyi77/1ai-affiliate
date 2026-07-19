'use strict';

const { queryOne, queryRows, queryInsert, queryUpdate } = require('../utils/queryHelpers');

// ─── Dashboards ──────────────────────────────────────────────────────────────

/**
 * Create a new analytics dashboard.
 * @param {number} affiliateId
 * @param {string} name
 * @param {object} config
 * @param {boolean} isPublic
 * @returns {Promise<number>} insertId
 */
async function createDashboard(affiliateId, name, config, isPublic) {
  const now = Math.floor(Date.now() / 1000);
  return queryInsert(
    `INSERT INTO 1ai_analytics_dashboards
     (affiliate_id, name, config, is_public, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [affiliateId, name, JSON.stringify(config), isPublic ? 1 : 0, now, now]
  );
}

/**
 * Get all dashboards for an affiliate.
 * @param {number} affiliateId
 * @returns {Promise<Array>}
 */
async function getDashboards(affiliateId) {
  return queryRows(
    'SELECT * FROM 1ai_analytics_dashboards WHERE affiliate_id = ? ORDER BY created_at DESC',
    [affiliateId]
  );
}

/**
 * Get a single dashboard by id.
 * @param {number} id
 * @returns {Promise<object|null>}
 */
async function getDashboard(id) {
  return queryOne('SELECT * FROM 1ai_analytics_dashboards WHERE id = ?', [id]);
}

/**
 * Update a dashboard.
 * @param {number} id
 * @param {object} data - fields to update (name, config, is_public)
 * @returns {Promise<number>} affectedRows
 */
async function updateDashboard(id, data) {
  const now = Math.floor(Date.now() / 1000);
  const sets = [];
  const params = [];

  if (data.name !== undefined) {
    sets.push('name = ?');
    params.push(data.name);
  }
  if (data.config !== undefined) {
    sets.push('config = ?');
    params.push(JSON.stringify(data.config));
  }
  if (data.isPublic !== undefined) {
    sets.push('is_public = ?');
    params.push(data.isPublic ? 1 : 0);
  }

  if (sets.length === 0) return 0;

  sets.push('updated_at = ?');
  params.push(now);
  params.push(id);

  return queryUpdate(
    `UPDATE 1ai_analytics_dashboards SET ${sets.join(', ')} WHERE id = ?`,
    params
  );
}

/**
 * Delete a dashboard.
 * @param {number} id
 * @returns {Promise<number>} affectedRows
 */
async function deleteDashboard(id) {
  return queryUpdate('DELETE FROM 1ai_analytics_dashboards WHERE id = ?', [id]);
}

// ─── Reports ─────────────────────────────────────────────────────────────────

/**
 * Create a report under a dashboard.
 * @param {number} dashboardId
 * @param {string} name
 * @param {string} reportType - enum from report_type
 * @param {object} config
 * @param {string} chartType - enum from chart_type
 * @param {number} sortOrder
 * @returns {Promise<number>} insertId
 */
async function createReport(dashboardId, name, reportType, config, chartType, sortOrder) {
  const now = Math.floor(Date.now() / 1000);
  return queryInsert(
    `INSERT INTO 1ai_analytics_reports
     (dashboard_id, name, report_type, config, chart_type, sort_order, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [dashboardId, name, reportType, JSON.stringify(config), chartType, sortOrder || 0, now, now]
  );
}

/**
 * Get all reports for a dashboard, ordered by sort_order.
 * @param {number} dashboardId
 * @returns {Promise<Array>}
 */
async function getReportsByDashboard(dashboardId) {
  return queryRows(
    'SELECT * FROM 1ai_analytics_reports WHERE dashboard_id = ? ORDER BY sort_order ASC, created_at ASC',
    [dashboardId]
  );
}

/**
 * Update a report.
 * @param {number} id
 * @param {object} data - fields to update (name, report_type, config, chart_type, sort_order)
 * @returns {Promise<number>} affectedRows
 */
async function updateReport(id, data) {
  const now = Math.floor(Date.now() / 1000);
  const sets = [];
  const params = [];

  if (data.name !== undefined) {
    sets.push('name = ?');
    params.push(data.name);
  }
  if (data.reportType !== undefined) {
    sets.push('report_type = ?');
    params.push(data.reportType);
  }
  if (data.config !== undefined) {
    sets.push('config = ?');
    params.push(JSON.stringify(data.config));
  }
  if (data.chartType !== undefined) {
    sets.push('chart_type = ?');
    params.push(data.chartType);
  }
  if (data.sortOrder !== undefined) {
    sets.push('sort_order = ?');
    params.push(data.sortOrder);
  }

  if (sets.length === 0) return 0;

  sets.push('updated_at = ?');
  params.push(now);
  params.push(id);

  return queryUpdate(
    `UPDATE 1ai_analytics_reports SET ${sets.join(', ')} WHERE id = ?`,
    params
  );
}

/**
 * Delete a report.
 * @param {number} id
 * @returns {Promise<number>} affectedRows
 */
async function deleteReport(id) {
  return queryUpdate('DELETE FROM 1ai_analytics_reports WHERE id = ?', [id]);
}

// ─── Tracking Plans ──────────────────────────────────────────────────────────

/**
 * Create a tracking plan.
 * @param {number} affiliateId
 * @param {string} name
 * @param {object} schema - schema_definition JSON
 * @returns {Promise<number>} insertId
 */
async function createPlan(affiliateId, name, schema) {
  const now = Math.floor(Date.now() / 1000);
  return queryInsert(
    `INSERT INTO 1ai_analytics_tracking_plans
     (affiliate_id, name, schema_definition, status, created_at, updated_at)
     VALUES (?, ?, ?, 'active', ?, ?)`,
    [affiliateId, name, JSON.stringify(schema), now, now]
  );
}

/**
 * Get all tracking plans for an affiliate.
 * @param {number} affiliateId
 * @returns {Promise<Array>}
 */
async function getPlans(affiliateId) {
  return queryRows(
    'SELECT * FROM 1ai_analytics_tracking_plans WHERE affiliate_id = ? ORDER BY created_at DESC',
    [affiliateId]
  );
}

/**
 * Update a tracking plan.
 * @param {number} id
 * @param {object} data - fields to update (name, schema, status)
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
  if (data.schema !== undefined) {
    sets.push('schema_definition = ?');
    params.push(JSON.stringify(data.schema));
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
    `UPDATE 1ai_analytics_tracking_plans SET ${sets.join(', ')} WHERE id = ?`,
    params
  );
}

module.exports = {
  createDashboard, getDashboards, getDashboard, updateDashboard, deleteDashboard,
  createReport, getReportsByDashboard, updateReport, deleteReport,
  createPlan, getPlans, updatePlan,
};
