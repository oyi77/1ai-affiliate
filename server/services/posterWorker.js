const cron = require('node-cron');
const posterService = require('./posterService');

function start() {
  const schedule = process.env.POSTER_CRON || '0 * * * *';

  console.log(`[PosterWorker] Starting with crontab: "${schedule}"`);

  cron.schedule(schedule, async () => {
    console.log('[PosterWorker] Tick — checking queue...');
    try {
      const row = await posterService.fetchNextPending();
      if (!row) {
        console.log('[PosterWorker] No pending products');
        return;
      }

      const caption = posterService.formatCaption(row);
      await posterService.postToTelegram(caption, row.image_url);
      await posterService.markPosted(row.id);

      console.log(`[PosterWorker] Posted product #${row.id}: ${row.product_name}`);
    } catch (err) {
      console.error('[PosterWorker] Error:', err.message);
      // Find the pending row that caused the failure (it's no longer locked)
      const failedRow = await posterService.fetchNextPending();
      if (failedRow) {
        await posterService.markFailed(failedRow.id, err.message);
        console.log(`[PosterWorker] Marked #${failedRow.id} as failed`);
      }
    }
  });
}

module.exports = { start };
