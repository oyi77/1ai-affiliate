/**
 * autoPayoutCron.js
 *
 * Schedules automatic payout processing. On each tick:
 *   1. Scans approved affiliate earnings above each user's threshold.
 *   2. Marks them paid and deducts from affiliate balance.
 *   3. Posts revenue entry to 1ai-hub Capital Pool (fire-and-forget).
 *
 * Schedule: every day at 02:00 WIB (19:00 UTC previous day = "0 19 * * *")
 * Override via PAYOUT_CRON_SCHEDULE env var (standard cron syntax, UTC).
 */

const cron = require('node-cron');
const logger = require('../logger');
const { processAutoPayouts } = require('../services/payoutService');

const SCHEDULE = process.env.PAYOUT_CRON_SCHEDULE || '0 19 * * *';

function start(pool) {
  if (!cron.validate(SCHEDULE)) {
    logger.error({ schedule: SCHEDULE }, '[autoPayoutCron] Invalid cron schedule — skipping startup');
    return;
  }

  cron.schedule(SCHEDULE, async () => {
    logger.info('[autoPayoutCron] Running auto-payout cycle');
    try {
      const results = await processAutoPayouts(pool);
      const totalProcessed = results.reduce((n, r) => n + (r.processed || 0), 0);
      const totalAmount = results.reduce((n, r) => n + (r.total || 0), 0);
      logger.info(
        { users: results.length, earnings: totalProcessed, total_usd: totalAmount },
        '[autoPayoutCron] Cycle complete',
      );
    } catch (err) {
      logger.error({ err }, '[autoPayoutCron] Cycle failed');
    }
  });

  logger.info({ schedule: SCHEDULE }, '[autoPayoutCron] Scheduled');
}

module.exports = { start };
