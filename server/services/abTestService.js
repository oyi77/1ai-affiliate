'use strict';

/**
 * A/B Testing Service
 * Split traffic between landing pages / offers based on configured weights.
 */

const pool = require('../db/mysql');

/**
 * Get or assign a variant for a click.
 * Uses consistent hashing: same click_id always gets the same variant.
 */
async function assignVariant(testId, clickId) {
  // Check if already assigned
  const [existing] = await pool.query(
    'SELECT variant_name FROM 1ai_ab_test_results WHERE test_id = ? AND click_id = ? LIMIT 1',
    [testId, clickId]
  );
  if (existing.length) return existing[0].variant_name;

  // Load test config
  const [tests] = await pool.query('SELECT variants FROM 1ai_ab_tests WHERE id = ? AND status = "active"', [testId]);
  if (!tests.length) return null;

  const variants = typeof tests[0].variants === 'string' ? JSON.parse(tests[0].variants) : tests[0].variants;

  // Weighted random selection
  const totalWeight = variants.reduce((sum, v) => sum + (v.weight || 50), 0);
  const hash = simpleHash(clickId + ':' + testId);
  const bucket = hash % totalWeight;
  let cumulative = 0;
  let selected = variants[0];

  for (const v of variants) {
    cumulative += (v.weight || 50);
    if (bucket < cumulative) { selected = v; break; }
  }

  // Record assignment
  const now = Math.floor(Date.now() / 1000);
  await pool.query(
    'INSERT INTO 1ai_ab_test_results (test_id, variant_name, click_id, created_at) VALUES (?, ?, ?, ?)',
    [testId, selected.name, clickId, now]
  );

  return selected.name;
}

/**
 * Record a conversion for an A/B test variant.
 */
async function recordConversion(testId, clickId, revenue = 0) {
  await pool.query(
    'UPDATE 1ai_ab_test_results SET converted = 1, revenue = ? WHERE test_id = ? AND click_id = ?',
    [revenue, testId, clickId]
  );
}

/**
 * Get test results — clicks, conversions, revenue per variant.
 */
async function getResults(testId) {
  const [rows] = await pool.query(`
    SELECT variant_name,
           COUNT(*) AS clicks,
           SUM(converted) AS conversions,
           COALESCE(SUM(revenue), 0) AS revenue,
           ROUND(SUM(converted) / COUNT(*) * 100, 2) AS conversion_rate
    FROM 1ai_ab_test_results
    WHERE test_id = ?
    GROUP BY variant_name
    ORDER BY conversion_rate DESC
  `, [testId]);
  return rows;
}

// ponytail: simple hash for consistent bucketing, not cryptographic
function simpleHash(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

module.exports = { assignVariant, recordConversion, getResults };
