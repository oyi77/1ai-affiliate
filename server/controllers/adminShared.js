'use strict';
/**
 * Shared DB helpers + small pure utilities for admin controllers.
 * Split from server/controllers/adminController.js (800-line gate).
 */

const pool = require('../db/mysql');

/**
 * Admin controller — dashboard data from the shared tracking database.
 */

async function queryRows(sql, params = []) {
  try {
    const [rows] = await pool.query(sql, params);
    return rows;
  } catch (err) {
    console.error('queryRows error:', err.message, 'SQL:', sql.substring(0, 120));
    return [];
  }
}

async function queryOne(sql, params = [], fallback = {}) {
  const rows = await queryRows(sql, params);
  return rows[0] || fallback;
}

function toNumber(value) {
  return Number(value || 0);
}

function startExpression(range) {
  const allowed = {
    '1d': 'UNIX_TIMESTAMP(DATE_SUB(NOW(), INTERVAL 1 DAY))',
    '7d': 'UNIX_TIMESTAMP(DATE_SUB(NOW(), INTERVAL 7 DAY))',
    '30d': 'UNIX_TIMESTAMP(DATE_SUB(NOW(), INTERVAL 30 DAY))',
    '90d': 'UNIX_TIMESTAMP(DATE_SUB(NOW(), INTERVAL 90 DAY))',
    mtd: "UNIX_TIMESTAMP(DATE_FORMAT(NOW(), '%Y-%m-01'))",
    ytd: "UNIX_TIMESTAMP(MAKEDATE(YEAR(NOW()), 1))",
  };
  return allowed[range] || allowed['30d'];
}

function csvEscape(value) {
  const text = String(value ?? '');
  if (/[",\n]/.test(text)) return `"${text.replace(/"/g, '""')}"`;
  return text;
}

function buildCsv(headers, rows) {
  return [headers.map(csvEscape).join(','), ...rows.map(r => headers.map(h => csvEscape(r[h])).join(','))].join('\n');
}

async function ensureVipTable() {
  await pool.query(`CREATE TABLE IF NOT EXISTS 1ai_affiliate_vip_profiles (
    user_id INT PRIMARY KEY,
    monthly_traffic VARCHAR(50) DEFAULT '',
    primary_vertical VARCHAR(80) DEFAULT '',
    preferred_payout VARCHAR(80) DEFAULT '',
    notes TEXT NULL,
    status VARCHAR(30) DEFAULT 'submitted',
    updated_at INT DEFAULT 0
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`);
}

module.exports = {
  queryRows,
  queryOne,
  toNumber,
  startExpression,
  csvEscape,
  buildCsv,
  ensureVipTable,

};
