const { queryRows } = require('../utils/queryHelpers');
const telegramService = require('../services/telegramService');

/**
 * Send daily summary to all users with daily_summary_enabled.
 * Intended to be called by node-cron at 08:00 WIB (01:00 UTC).
 */
async function sendDailySummaryForAllUsers(pool) {
  const configs = await queryRows(
    `SELECT user_id FROM 1ai_telegram_config
     WHERE daily_summary_enabled = 1
       AND bot_token IS NOT NULL AND bot_token != ''
       AND chat_id IS NOT NULL AND chat_id != ''`
  );

  const results = { total: configs.length, sent: 0, failed: 0 };

  for (const config of configs) {
    try {
      const res = await telegramService.sendDailySummary(pool, config.user_id);
      if (res.sent) {
        results.sent++;
      }
    } catch (err) {
      console.error(`[telegramDailySummary] Failed for user ${config.user_id}:`, err.message);
      results.failed++;
    }
  }

  console.log(`[telegramDailySummary] Completed: ${results.sent} sent, ${results.failed} failed, ${results.total} total`);
  return results;
}

module.exports = { sendDailySummaryForAllUsers };
