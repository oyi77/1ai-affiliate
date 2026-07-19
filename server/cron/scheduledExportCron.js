/**
 * scheduledExportCron.js
 *
 * Executes all active scheduled export configurations.
 * Each export runs a report query and emails the result (CSV/JSON).
 *
 * Schedule: every day at 07:00 UTC.
 * Override via SCHEDULED_EXPORT_CRON_SCHEDULE env var (standard cron syntax, UTC).
 */

const cron = require('node-cron');
const logger = require('../logger');
const { runScheduledExports } = require('../services/scheduledExportService');

const SCHEDULE = process.env.SCHEDULED_EXPORT_CRON_SCHEDULE || '0 7 * * *';

function start() {
  if (!cron.validate(SCHEDULE)) {
    logger.error({ schedule: SCHEDULE }, '[scheduledExportCron] Invalid cron schedule — skipping startup');
    return;
  }

  cron.schedule(SCHEDULE, async () => {
    logger.info('[scheduledExportCron] Running scheduled exports');
    try {
      const result = await runScheduledExports();
      logger.info(
        { executed: result.executed, errors: result.errors.length },
        '[scheduledExportCron] Cycle complete',
      );
    } catch (err) {
      logger.error({ err }, '[scheduledExportCron] Cycle failed');
    }
  });

  logger.info({ schedule: SCHEDULE }, '[scheduledExportCron] Scheduled');
}

module.exports = { start };
