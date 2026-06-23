'use strict';

/**
 * Fraud Detection Service
 * Wraps fraudRuleEngine + mlFraudService for unified API.
 */

const pool = require('../db/mysql');

async function getBlacklist() {
  const [rows] = await pool.query(
    'SELECT * FROM 1ai_fraud_blacklist ORDER BY created_at DESC LIMIT 500'
  );
  return rows;
}

async function addToBlacklist({ type, value, reason, severity, created_by }) {
  const [result] = await pool.query(
    `INSERT INTO 1ai_fraud_blacklist (type, value, reason, severity, created_by, created_at)
     VALUES (?, ?, ?, ?, ?, UNIX_TIMESTAMP())`,
    [type || 'ip', value, reason || '', severity || 'medium', created_by || 0]
  );
  return { id: result.insertId };
}

async function removeFromBlacklist(id) {
  const [result] = await pool.query('DELETE FROM 1ai_fraud_blacklist WHERE id = ?', [id]);
  return { deleted: result.affectedRows > 0 };
}

async function checkClick({ ip, user_agent, offer_id }) {
  const [rows] = await pool.query(
    `SELECT * FROM 1ai_fraud_blacklist
     WHERE (type = 'ip' AND value = ?)
        OR (type = 'ua' AND value = ?)
     LIMIT 5`,
    [ip || '', user_agent || '']
  );
  return { blocked: rows.length > 0, matches: rows };
}

async function checkConversion({ click_id, affiliate_id }) {
  // Basic velocity check
  const [recent] = await pool.query(
    `SELECT COUNT(*) AS cnt FROM 1ai_conversion_logs
     WHERE affiliate_id = ? AND conversion_time > UNIX_TIMESTAMP(DATE_SUB(NOW(), INTERVAL 1 HOUR))`,
    [affiliate_id]
  );
  return { suspicious: recent[0]?.cnt > 50, count: recent[0]?.cnt || 0 };
}

module.exports = { getBlacklist, addToBlacklist, removeFromBlacklist, checkClick, checkConversion };
