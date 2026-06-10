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
    }
  });
}

module.exports = { start };
