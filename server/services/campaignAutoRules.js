'use strict';

/**
 * Campaign Auto-Rules Engine
 * Evaluates campaign performance and auto-pauses/budget-caps.
 *
 * ponytail: one function, reads rules from 1ai_campaign_rules table, evaluates, acts.
 * Rules are JSON conditions like the fraud engine.
 */

const pool = require('../db/mysql');

/**
 * Evaluate all active campaigns against their auto-rules.
 * Called by cron every 15 minutes.
 */
async function evaluateCampaignRules() {
  let campaigns;
  try {
    [campaigns] = await pool.query(`
      SELECT c.id, c.name, c.status, c.daily_budget, c.total_budget,
             c.auto_pause_roas, c.auto_pause_cpa,
             ts.id AS ts_id, ts.platform_type
      FROM 1ai_campaigns c
      LEFT JOIN 1ai_traffic_sources ts ON c.traffic_source_id = ts.id
      WHERE c.status = 'active'
    `);
  } catch {
    return { evaluated: 0, actions: [] };
  }

  const actions = [];
  const today = new Date().toISOString().split('T')[0];

  for (const c of campaigns) {
    // Get today's spend and conversions for this campaign
    let stats;
    try {
      [stats] = await pool.query(`
        SELECT
          COALESCE(SUM(spend), 0) AS today_spend,
          COALESCE(SUM(clicks), 0) AS today_clicks,
          COALESCE(SUM(impressions), 0) AS today_impressions
        FROM 1ai_meta_daily_stats
        WHERE campaign_id = ? AND report_date = ?
      `, [String(c.id), today]);
    } catch { continue; }

    const todaySpend = parseFloat(stats[0]?.today_spend || 0);
    const todayClicks = parseInt(stats[0]?.today_clicks || 0);

    // Get today's conversions for this campaign
    let convStats;
    try {
      [convStats] = await pool.query(`
        SELECT COUNT(*) AS conv_count, COALESCE(SUM(payout), 0) AS conv_revenue
        FROM 1ai_conversion_logs
        WHERE campaign_id = ? AND FROM_UNIXTIME(conv_time, '%Y-%m-%d') = ?
      `, [c.id, today]);
    } catch { continue; }

    const convCount = parseInt(convStats[0]?.conv_count || 0);
    const convRevenue = parseFloat(convStats[0]?.conv_revenue || 0);

    // Rule 1: Daily budget cap
    if (c.daily_budget && todaySpend >= c.daily_budget) {
      await pool.query('UPDATE 1ai_campaigns SET status = ? WHERE id = ?', ['paused_budget', c.id]);
      actions.push({ campaign_id: c.id, action: 'paused', reason: `Daily budget ${c.daily_budget} reached (spent ${todaySpend})` });
      continue;
    }

    // Rule 2: Auto-pause on low ROAS
    if (c.auto_pause_roas && todaySpend > 0 && convCount > 0) {
      const roas = convRevenue / todaySpend;
      if (roas < c.auto_pause_roas) {
        await pool.query('UPDATE 1ai_campaigns SET status = ? WHERE id = ?', ['paused_roas', c.id]);
        actions.push({ campaign_id: c.id, action: 'paused', reason: `ROAS ${roas.toFixed(2)} below threshold ${c.auto_pause_roas}` });
        continue;
      }
    }

    // Rule 3: Auto-pause on high CPA
    if (c.auto_pause_cpa && convCount > 0) {
      const cpa = todaySpend / convCount;
      if (cpa > c.auto_pause_cpa) {
        await pool.query('UPDATE 1ai_campaigns SET status = ? WHERE id = ?', ['paused_cpa', c.id]);
        actions.push({ campaign_id: c.id, action: 'paused', reason: `CPA ${cpa.toFixed(2)} above threshold ${c.auto_pause_cpa}` });
        continue;
      }
    }

    // Rule 4: Auto-pause on zero conversions after N clicks
    if (todayClicks > 100 && convCount === 0) {
      await pool.query('UPDATE 1ai_campaigns SET status = ? WHERE id = ?', ['paused_no_conv', c.id]);
      actions.push({ campaign_id: c.id, action: 'paused', reason: `0 conversions after ${todayClicks} clicks` });
    }
  }

  console.log(`[AutoRules] Evaluated ${campaigns.length} campaigns, ${actions.length} actions taken`);
  return { evaluated: campaigns.length, actions };
}

module.exports = { evaluateCampaignRules };
