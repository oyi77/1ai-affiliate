'use strict';

/**
 * ML-Style Fraud Detection
 * Statistical behavioral analysis — no external ML library needed.
 * ponytail: heuristic scoring based on click patterns, not actual ML models.
 * Upgrade path: replace heuristics with a trained model when data volume justifies it.
 */

const pool = require('../db/mysql');

/**
 * Analyze click behavior patterns for an IP.
 * Returns a risk score 0-100 based on statistical anomalies.
 */
async function analyzeBehavior(ip, currentClick = {}) {
  const signals = [];
  let totalScore = 0;

  // 1. Click timing analysis — clicks at inhuman speed
  const [recentClicks] = await pool.query(
    `SELECT created_at FROM 1ai_fraud_click_velocity WHERE ip_address = ? ORDER BY created_at DESC LIMIT 20`,
    [ip]
  ).catch(() => [[]]);

  if (recentClicks.length >= 3) {
    const intervals = [];
    for (let i = 0; i < recentClicks.length - 1; i++) {
      const diff = new Date(recentClicks[i].created_at).getTime() - new Date(recentClicks[i + 1].created_at).getTime();
      intervals.push(diff);
    }
    const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
    const stdDev = Math.sqrt(intervals.reduce((sum, i) => sum + Math.pow(i - avgInterval, 2), 0) / intervals.length);

    // Very regular intervals = bot (stddev near 0)
    if (stdDev < 100 && avgInterval < 5000) {
      signals.push({ name: 'regular_timing', score: 30, detail: `Avg interval: ${avgInterval.toFixed(0)}ms, StdDev: ${stdDev.toFixed(0)}ms` });
      totalScore += 30;
    }

    // Extremely fast clicks
    if (avgInterval < 500) {
      signals.push({ name: 'inhuman_speed', score: 25, detail: `Avg interval: ${avgInterval.toFixed(0)}ms` });
      totalScore += 25;
    }
  }

  // 2. Geographic anomaly — click from country != previous clicks
  if (currentClick.country_code) {
    const [prevCountries] = await pool.query(
      `SELECT country_code, COUNT(*) AS cnt FROM 1ai_click_log WHERE ip = ? AND country_code IS NOT NULL GROUP BY country_code ORDER BY cnt DESC LIMIT 3`,
      [ip]
    ).catch(() => [[]]);

    if (prevCountries.length > 1) {
      const countries = prevCountries.map(r => r.country_code);
      if (!countries.includes(currentClick.country_code)) {
        signals.push({ name: 'geo_anomaly', score: 15, detail: `New country: ${currentClick.country_code}, previous: ${countries.join(',')}` });
        totalScore += 15;
      }
    }
  }

  // 3. Device fingerprint change — same IP, different device_type
  if (currentClick.device_type) {
    const [prevDevices] = await pool.query(
      `SELECT device_type, COUNT(*) AS cnt FROM 1ai_click_log WHERE ip = ? AND device_type != 'unknown' GROUP BY device_type ORDER BY cnt DESC LIMIT 3`,
      [ip]
    ).catch(() => [[]]);

    if (prevDevices.length > 0 && !prevDevices.find(r => r.device_type === currentClick.device_type)) {
      signals.push({ name: 'device_switch', score: 10, detail: `Device changed: ${currentClick.device_type} vs ${prevDevices[0].device_type}` });
      totalScore += 10;
    }
  }

  // 4. Conversion rate anomaly — high click count, zero conversions
  const [convStats] = await pool.query(
    `SELECT COUNT(*) AS clicks, SUM(converted) AS conversions FROM 1ai_click_log WHERE ip = ?`,
    [ip]
  ).catch(() => [[]]);

  if (convStats[0]?.clicks > 20 && convStats[0]?.conversions === 0) {
    signals.push({ name: 'zero_conversion', score: 15, detail: `${convStats[0].clicks} clicks, 0 conversions` });
    totalScore += 15;
  }

  // 5. Multi-affiliate abuse — same IP clicking for many affiliates
  const [multiAff] = await pool.query(
    `SELECT COUNT(DISTINCT affiliate_id) AS aff_count FROM 1ai_click_log WHERE ip = ?`,
    [ip]
  ).catch(() => [[]]);

  if (multiAff[0]?.aff_count > 5) {
    signals.push({ name: 'multi_affiliate', score: 20, detail: `Clicking for ${multiAff[0].aff_count} affiliates` });
    totalScore += 20;
  }

  const finalScore = Math.min(100, totalScore);
  let action = 'allow';
  if (finalScore >= 70) action = 'block';
  else if (finalScore >= 40) action = 'review';

  return { score: finalScore, action, signals };
}

module.exports = { analyzeBehavior };
