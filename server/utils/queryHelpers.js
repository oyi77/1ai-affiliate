const pool = require('../db/mysql');

/**
 * Execute a query and return the first row, or null if no results.
 */
async function queryOne(sql, params = []) {
  const [rows] = await pool.query(sql, params);
  return rows[0] || null;
}

/**
 * Execute a query and return all rows as an array.
 */
async function queryRows(sql, params = []) {
  const [rows] = await pool.query(sql, params);
  return rows;
}

/**
 * Execute an INSERT and return the insertId.
 */
async function queryInsert(sql, params = []) {
  const [result] = await pool.query(sql, params);
  return result.insertId;
}

/**
 * Execute an UPDATE/DELETE and return affectedRows.
 */
async function queryUpdate(sql, params = []) {
  const [result] = await pool.query(sql, params);
  return result.affectedRows;
}

module.exports = { queryOne, queryRows, queryInsert, queryUpdate };
