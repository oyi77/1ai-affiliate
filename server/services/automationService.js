const { queryOne, queryRows, queryInsert, queryUpdate } = require('../utils/queryHelpers');

/**
 * Automation rules engine — evaluates rules and executes actions.
 */

async function getRules(pool, userId) {
  return queryRows(
    'SELECT * FROM 1ai_automation_rules WHERE user_id = ? ORDER BY created_at DESC',
    [userId]
  );
}

async function saveRule(pool, userId, data) {
  const { id, rule_type, name, config, enabled } = data;
  const now = Math.floor(Date.now() / 1000);

  if (id) {
    await queryUpdate(
      `UPDATE 1ai_automation_rules SET rule_type = ?, name = ?, config = ?, enabled = ?, updated_at = ? WHERE id = ? AND user_id = ?`,
      [rule_type, name, JSON.stringify(config), enabled ? 1 : 0, now, id, userId]
    );
    return id;
  }

  return queryInsert(
    `INSERT INTO 1ai_automation_rules (user_id, rule_type, name, config, enabled, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [userId, rule_type, name, JSON.stringify(config), enabled ? 1 : 0, now, now]
  );
}

async function deleteRule(pool, ruleId, userId) {
  return queryUpdate(
    'DELETE FROM 1ai_automation_rules WHERE id = ? AND user_id = ?',
    [ruleId, userId]
  );
}

/**
 * Evaluate all enabled rules and execute matching actions.
 * Returns an array of { ruleId, ruleName, action, result } for each triggered rule.
 */
async function evaluateRules(pool) {
  const rules = await queryRows(
    'SELECT * FROM 1ai_automation_rules WHERE enabled = 1'
  );

  const results = [];
  const now = Math.floor(Date.now() / 1000);

  for (const rule of rules) {
    const config = typeof rule.config === 'string' ? JSON.parse(rule.config) : rule.config;
    let matched = false;
    let matchedData = {};

    try {
      switch (rule.rule_type) {
        case 'auto_pause':
          matched = await evaluateAutoPause(pool, rule.user_id, config, matchedData);
          break;
        case 'auto_scale':
          matched = await evaluateAutoScale(pool, rule.user_id, config, matchedData);
          break;
        case 'sleep_schedule':
          matched = await evaluateSleepSchedule(config, matchedData);
          break;
        case 'balance_alert':
          matched = await evaluateBalanceAlert(pool, rule.user_id, config, matchedData);
          break;
        case 'performance_alert':
          matched = await evaluatePerformanceAlert(pool, rule.user_id, config, matchedData);
          break;
      }

      if (matched) {
        const actionResult = await executeAction(pool, rule, matchedData);
        await queryUpdate(
          'UPDATE 1ai_automation_rules SET last_triggered_at = ? WHERE id = ?',
          [now, rule.id]
        );
        results.push({
          ruleId: rule.id,
          ruleName: rule.name,
          ruleType: rule.rule_type,
          action: config.action || 'none',
          result: actionResult,
        });
      }
    } catch (err) {
      results.push({
        ruleId: rule.id,
        ruleName: rule.name,
        ruleType: rule.rule_type,
        error: err.message,
      });
    }
  }

  return results;
}

async function evaluateAutoPause(pool, userId, config, matchedData) {
  const days = config.days || 3;
  const threshold = config.order_threshold || 0;
  const target = config.target || 'meta';
  const dateFrom = Math.floor(Date.now() / 1000) - days * 86400;

  if (target === 'meta') {
    const campaigns = await queryRows(
      `SELECT m.campaign_id, m.campaign_name, m.traffic_source_id,
              COALESCE(SUM(m.spend), 0) AS total_spend,
              COALESCE(SUM(m.clicks), 0) AS total_clicks
       FROM 1ai_meta_daily_stats m
       WHERE m.report_date >= FROM_UNIXTIME(?)
       GROUP BY m.campaign_id, m.campaign_name, m.traffic_source_id
       HAVING total_clicks > 0`,
      [dateFrom]
    );

    const ordersByCampaign = await queryRows(
      `SELECT tm.meta_campaign_id, COUNT(*) AS order_count
       FROM 1ai_shopee_reports sr
       JOIN 1ai_taglink_mappings tm ON sr.taglink = tm.taglink
       WHERE sr.order_time >= ?
       GROUP BY tm.meta_campaign_id`,
      [dateFrom]
    );

    const orderMap = {};
    for (const o of ordersByCampaign) {
      orderMap[o.meta_campaign_id] = Number(o.order_count);
    }

    const stale = campaigns.filter(c => {
      const orders = orderMap[c.campaign_id] || 0;
      return orders <= threshold;
    });

    if (stale.length > 0) {
      matchedData.campaigns = stale;
      return true;
    }
  }
  return false;
}

async function evaluateAutoScale(pool, userId, config, matchedData) {
  const roasThreshold = Number(config.roas_threshold) || 3.0;
  const days = config.days || 3;
  const dateFrom = Math.floor(Date.now() / 1000) - days * 86400;

  const campaigns = await queryRows(
    `SELECT m.campaign_id, m.campaign_name, m.traffic_source_id,
            COALESCE(SUM(m.spend), 0) AS total_spend
     FROM 1ai_meta_daily_stats m
     WHERE m.report_date >= FROM_UNIXTIME(?)
     GROUP BY m.campaign_id, m.campaign_name, m.traffic_source_id
     HAVING total_spend > 0`,
    [dateFrom]
  );

  const commissions = await queryRows(
    `SELECT tm.meta_campaign_id, COALESCE(SUM(sr.commission_net), 0) AS total_commission
     FROM 1ai_shopee_reports sr
     JOIN 1ai_taglink_mappings tm ON sr.taglink = tm.taglink
     WHERE sr.order_time >= ?
     GROUP BY tm.meta_campaign_id`,
    [dateFrom]
  );

  const commMap = {};
  for (const c of commissions) {
    commMap[c.meta_campaign_id] = Number(c.total_commission);
  }

  const profitable = campaigns.filter(c => {
    const spend = Number(c.total_spend);
    const comm = commMap[c.campaign_id] || 0;
    return spend > 0 && (comm / spend) >= roasThreshold;
  });

  if (profitable.length > 0) {
    matchedData.campaigns = profitable;
    return true;
  }
  return false;
}

function evaluateSleepSchedule(config, matchedData) {
  const now = new Date();
  const currentHour = now.getHours();
  const startHour = Number(config.start_hour) ?? 23;
  const endHour = Number(config.end_hour) ?? 4;

  let inWindow = false;
  if (startHour > endHour) {
    inWindow = currentHour >= startHour || currentHour < endHour;
  } else {
    inWindow = currentHour >= startHour && currentHour < endHour;
  }

  if (inWindow) {
    matchedData.currentHour = currentHour;
    matchedData.resumeAfter = config.resume_after !== false;
    return true;
  }
  return false;
}

async function evaluateBalanceAlert(pool, userId, config, matchedData) {
  const threshold = Number(config.threshold) || 200000;

  const balanceRow = await queryOne(
    `SELECT COALESCE(SUM(CASE WHEN type = 'deposit' THEN amount WHEN type = 'adjustment' THEN amount ELSE -amount END), 0) AS balance
     FROM 1ai_balance_ledger WHERE user_id = ?`,
    [userId]
  );

  const balance = Number(balanceRow?.balance || 0);
  if (balance < threshold) {
    matchedData.balance = balance;
    matchedData.threshold = threshold;
    return true;
  }
  return false;
}

async function evaluatePerformanceAlert(pool, userId, config, matchedData) {
  const metric = config.metric || 'roas';
  const threshold = Number(config.threshold) || 1.0;
  const condition = config.condition || 'below';
  const days = config.days || 1;
  const dateFrom = Math.floor(Date.now() / 1000) - days * 86400;

  const stats = await queryOne(
    `SELECT COALESCE(SUM(spend), 0) AS total_spend, COALESCE(SUM(clicks), 0) AS total_clicks
     FROM 1ai_meta_daily_stats WHERE report_date >= FROM_UNIXTIME(?)`,
    [dateFrom]
  );

  const comm = await queryOne(
    `SELECT COALESCE(SUM(commission_net), 0) AS total_commission
     FROM 1ai_shopee_reports WHERE order_time >= ?`,
    [dateFrom]
  );

  const spend = Number(stats?.total_spend || 0);
  const commission = Number(comm?.total_commission || 0);
  let currentValue = 0;

  if (metric === 'roas') {
    currentValue = spend > 0 ? commission / spend : 0;
  } else if (metric === 'spend') {
    currentValue = spend;
  }

  let triggered = false;
  if (condition === 'below' && currentValue < threshold) triggered = true;
  if (condition === 'above' && currentValue > threshold) triggered = true;

  if (triggered) {
    matchedData.metric = metric;
    matchedData.currentValue = currentValue;
    matchedData.threshold = threshold;
    return true;
  }
  return false;
}

async function executeAction(pool, rule, matchedData) {
  const config = typeof rule.config === 'string' ? JSON.parse(rule.config) : rule.config;
  const action = config.action || 'none';

  switch (action) {
    case 'pause_campaign': {
      if (matchedData.campaigns && matchedData.campaigns.length > 0) {
        const ids = matchedData.campaigns.map(c => c.campaign_id);
        return { paused: ids.length, campaign_ids: ids };
      }
      return { paused: 0 };
    }

    case 'increase_budget': {
      if (matchedData.campaigns && matchedData.campaigns.length > 0) {
        const increasePct = Number(config.increase_pct) || 20;
        return {
          scaled: matchedData.campaigns.length,
          increase_pct: increasePct,
          campaign_ids: matchedData.campaigns.map(c => c.campaign_id),
        };
      }
      return { scaled: 0 };
    }

    case 'pause_all':
      return { status: 'sleep_window_active', hour: matchedData.currentHour };

    case 'telegram_alert': {
      try {
        const telegramService = require('./telegramService');
        const tgConfig = await telegramService.getTelegramConfig(pool, rule.user_id);
        if (tgConfig?.bot_token && tgConfig?.chat_id) {
          const msg = formatAlertMessage(rule.rule_type, matchedData);
          await telegramService.sendTelegramMessage(tgConfig.bot_token, tgConfig.chat_id, msg);
          return { sent: true };
        }
        return { sent: false, reason: 'no_telegram_config' };
      } catch (err) {
        return { sent: false, error: err.message };
      }
    }

    case 'log':
      return { logged: true, data: matchedData };

    default:
      return { status: 'no_action', data: matchedData };
  }
}

function formatAlertMessage(ruleType, data) {
  const { formatIDR } = require('../utils/currency');
  switch (ruleType) {
    case 'balance_alert':
      return `⚠️ <b>Balance Alert</b>\nBalance: ${formatIDR(data.balance)}\nThreshold: ${formatIDR(data.threshold)}`;
    case 'performance_alert':
      return `📊 <b>Performance Alert</b>\nMetric: ${data.metric}\nCurrent: ${Number(data.currentValue).toFixed(2)}\nThreshold: ${data.threshold}`;
    case 'auto_pause':
      return `⏸️ <b>Auto-Pause</b>\n${data.campaigns?.length || 0} campaigns paused (0 orders)`;
    case 'auto_scale':
      return `📈 <b>Auto-Scale</b>\n${data.campaigns?.length || 0} campaigns scaled up`;
    default:
      return `🤖 <b>Automation</b>\nRule type: ${ruleType}`;
  }
}

module.exports = { getRules, saveRule, deleteRule, evaluateRules, executeAction };
