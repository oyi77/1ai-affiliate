'use strict';

const { queryOne, queryRows, queryInsert, queryUpdate } = require('../utils/queryHelpers');

/**
 * Create a new AI traffic rule for an affiliate.
 * @param {number} affiliateId
 * @param {string} name
 * @param {string} ruleType - geo_redirect|device_redirect|time_based|custom
 * @param {object|null} conditions
 * @param {object|null} actions
 * @param {number} priority
 * @returns {Promise<number>} insertId
 */
async function createRule(affiliateId, name, ruleType, conditions, actions, priority) {
  const now = Math.floor(Date.now() / 1000);
  const conditionsStr = conditions ? JSON.stringify(conditions) : null;
  const actionsStr = actions ? JSON.stringify(actions) : null;

  return queryInsert(
    `INSERT INTO 1ai_ai_traffic_rules (affiliate_id, name, rule_type, conditions, actions, priority, status, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, 'active', ?, ?)`,
    [affiliateId, name, ruleType, conditionsStr, actionsStr, priority, now, now]
  );
}

/**
 * List all rules for an affiliate, ordered by priority.
 * @param {number} affiliateId
 * @returns {Promise<Array>}
 */
async function getRules(affiliateId) {
  return queryRows(
    'SELECT * FROM 1ai_ai_traffic_rules WHERE affiliate_id = ? ORDER BY priority ASC',
    [affiliateId]
  );
}

/**
 * Get a single rule by id.
 * @param {number} id
 * @returns {Promise<object|null>}
 */
async function getRule(id) {
  return queryOne('SELECT * FROM 1ai_ai_traffic_rules WHERE id = ?', [id]);
}

/**
 * Update a rule. Only provided fields are changed.
 * @param {number} id
 * @param {object} data
 * @returns {Promise<number>} affectedRows
 */
async function updateRule(id, data) {
  const now = Math.floor(Date.now() / 1000);
  const sets = [];
  const params = [];

  if (data.name !== undefined) { sets.push('name = ?'); params.push(data.name); }
  if (data.rule_type !== undefined) { sets.push('rule_type = ?'); params.push(data.rule_type); }
  if (data.conditions !== undefined) { sets.push('conditions = ?'); params.push(JSON.stringify(data.conditions)); }
  if (data.actions !== undefined) { sets.push('actions = ?'); params.push(JSON.stringify(data.actions)); }
  if (data.priority !== undefined) { sets.push('priority = ?'); params.push(data.priority); }
  if (data.status !== undefined) { sets.push('status = ?'); params.push(data.status); }

  if (!sets.length) return 0;

  sets.push('updated_at = ?');
  params.push(now);
  params.push(id);

  return queryUpdate(
    `UPDATE 1ai_ai_traffic_rules SET ${sets.join(', ')} WHERE id = ?`,
    params
  );
}

/**
 * Soft-delete a rule (set status='archived').
 * @param {number} id
 * @returns {Promise<number>} affectedRows
 */
async function deleteRule(id) {
  const now = Math.floor(Date.now() / 1000);
  return queryUpdate(
    'UPDATE 1ai_ai_traffic_rules SET status = ?, updated_at = ? WHERE id = ?',
    ['archived', now, id]
  );
}

/**
 * Get active rules for an affiliate, ordered by priority.
 * @param {number} affiliateId
 * @returns {Promise<Array>}
 */
async function getActiveRules(affiliateId) {
  return queryRows(
    'SELECT * FROM 1ai_ai_traffic_rules WHERE affiliate_id = ? AND status = ? ORDER BY priority ASC',
    [affiliateId, 'active']
  );
}

/**
 * Log a traffic decision for a rule.
 * @param {number} ruleId
 * @param {string} visitorId
 * @param {boolean} matched
 * @param {string} actionTaken
 * @returns {Promise<number>} insertId
 */
async function logTraffic(ruleId, visitorId, matched, actionTaken) {
  const now = Math.floor(Date.now() / 1000);
  return queryInsert(
    `INSERT INTO 1ai_ai_traffic_logs (rule_id, visitor_id, matched, action_taken, created_at)
     VALUES (?, ?, ?, ?, ?)`,
    [ruleId, visitorId, matched ? 1 : 0, actionTaken, now]
  );
}

/**
 * Get traffic logs for a rule, most recent first.
 * @param {number} ruleId
 * @param {number} limit
 * @returns {Promise<Array>}
 */
async function getLogs(ruleId, limit = 50) {
  return queryRows(
    'SELECT * FROM 1ai_ai_traffic_logs WHERE rule_id = ? ORDER BY created_at DESC LIMIT ?',
    [ruleId, limit]
  );
}

module.exports = { createRule, getRules, getRule, updateRule, deleteRule, getActiveRules, logTraffic, getLogs };
