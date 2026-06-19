const { queryOne, queryRows, queryInsert, queryUpdate } = require('../utils/queryHelpers');

const TELEGRAM_API = 'https://api.telegram.org/bot';

/**
 * Send a message via Telegram Bot API.
 */
async function sendTelegramMessage(botToken, chatId, message) {
  const url = `${TELEGRAM_API}${botToken}/sendMessage`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text: message, parse_mode: 'HTML' }),
  });
  const data = await res.json();
  if (!data.ok) {
    const err = new Error(data.description || 'Telegram API error');
    err.status = 400;
    throw err;
  }
  return data;
}

/**
 * Send a test connection message.
 */
async function testConnection(botToken, chatId) {
  return sendTelegramMessage(botToken, chatId, '🔔 <b>Test message</b> from 1AI Affiliate');
}

/**
 * Aggregate today's stats for a user and send a Telegram summary.
 */
async function sendDailySummary(pool, userId) {
  const config = await getTelegramConfig(pool, userId);
  if (!config || !config.bot_token || !config.chat_id || !config.daily_summary_enabled) {
    return { sent: false, reason: 'Daily summary not configured' };
  }

  const todayStart = Math.floor(new Date(new Date().setHours(0, 0, 0, 0)) / 1000);

  const stats = await queryOne(
    `SELECT
       COUNT(*) AS total_conversions,
       COALESCE(SUM(payout_amount), 0) AS total_earnings,
       COALESCE(SUM(CASE WHEN status = 'pending' THEN payout_amount ELSE 0 END), 0) AS pending_earnings,
       COALESCE(SUM(CASE WHEN status = 'approved' THEN payout_amount ELSE 0 END), 0) AS approved_earnings
     FROM 1ai_affiliate_earnings ae
     JOIN 1ai_affiliates a ON ae.affiliate_id = a.id
     WHERE a.user_id = ? AND ae.created_at >= ?`,
    [userId, todayStart]
  );

  const clicks = await queryOne(
    `SELECT COUNT(*) AS total_clicks
     FROM 1ai_clicks c
     JOIN 1ai_affiliates a ON c.affiliate_id = a.id
     WHERE a.user_id = ? AND c.created_at >= ?`,
    [userId, todayStart]
  );

  const msg = [
    '📊 <b>1AI Affiliate — Daily Summary</b>',
    '',
    `📅 ${new Date().toISOString().slice(0, 10)}`,
    `👆 Clicks: <b>${clicks?.total_clicks || 0}</b>`,
    `💰 Conversions: <b>${stats?.total_conversions || 0}</b>`,
    `💵 Earnings: <b>Rp ${Number(stats?.total_earnings || 0).toLocaleString('id-ID')}</b>`,
    `⏳ Pending: <b>Rp ${Number(stats?.pending_earnings || 0).toLocaleString('id-ID')}</b>`,
    `✅ Approved: <b>Rp ${Number(stats?.approved_earnings || 0).toLocaleString('id-ID')}</b>`,
  ].join('\n');

  await sendTelegramMessage(config.bot_token, config.chat_id, msg);

  await queryUpdate(
    'UPDATE 1ai_telegram_config SET last_sent_at = UNIX_TIMESTAMP() WHERE user_id = ?',
    [userId]
  );

  return { sent: true };
}

/**
 * Send a balance alert when balance drops below threshold.
 */
async function sendBalanceAlert(pool, userId, balance) {
  const config = await getTelegramConfig(pool, userId);
  if (!config || !config.bot_token || !config.chat_id || !config.balance_alert_enabled) {
    return { sent: false };
  }

  const threshold = Number(config.balance_alert_threshold) || 200000;
  if (Number(balance) >= threshold) {
    return { sent: false, reason: 'Balance above threshold' };
  }

  const msg = [
    '⚠️ <b>Balance Alert</b>',
    '',
    `Your balance (Rp ${Number(balance).toLocaleString('id-ID')}) is below the threshold of Rp ${threshold.toLocaleString('id-ID')}.`,
  ].join('\n');

  await sendTelegramMessage(config.bot_token, config.chat_id, msg);
  return { sent: true };
}

/**
 * Get telegram config for a user.
 */
async function getTelegramConfig(pool, userId) {
  return queryOne('SELECT * FROM 1ai_telegram_config WHERE user_id = ?', [userId]);
}

/**
 * Save (upsert) telegram config for a user.
 */
async function saveTelegramConfig(pool, userId, data) {
  const existing = await getTelegramConfig(pool, userId);
  const now = Math.floor(Date.now() / 1000);

  if (existing) {
    await pool.query(
      `UPDATE 1ai_telegram_config SET
         bot_token = ?, chat_id = ?, daily_summary_enabled = ?,
         balance_alert_enabled = ?, balance_alert_threshold = ?,
         performance_alert_enabled = ?, updated_at = ?
       WHERE user_id = ?`,
      [
        data.bot_token ?? existing.bot_token,
        data.chat_id ?? existing.chat_id,
        data.daily_summary_enabled ?? existing.daily_summary_enabled,
        data.balance_alert_enabled ?? existing.balance_alert_enabled,
        data.balance_alert_threshold ?? existing.balance_alert_threshold,
        data.performance_alert_enabled ?? existing.performance_alert_enabled,
        now,
        userId,
      ]
    );
  } else {
    await pool.query(
      `INSERT INTO 1ai_telegram_config
         (user_id, bot_token, chat_id, daily_summary_enabled, balance_alert_enabled,
          balance_alert_threshold, performance_alert_enabled, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userId,
        data.bot_token || '',
        data.chat_id || '',
        data.daily_summary_enabled ? 1 : 0,
        data.balance_alert_enabled ? 1 : 0,
        data.balance_alert_threshold || 200000,
        data.performance_alert_enabled ? 1 : 0,
        now,
        now,
      ]
    );
  }

  return getTelegramConfig(pool, userId);
}

module.exports = {
  sendTelegramMessage,
  sendDailySummary,
  sendBalanceAlert,
  testConnection,
  getTelegramConfig,
  saveTelegramConfig,
};
