const pool = require('../db/mysql');
const { firePostback, normalizeInteger } = require('../controllers/postbackController');

/**
 * Postback queue processor — handles retries with exponential backoff.
 *
 * CRITICAL STATE MACHINE INVARIANT:
 *   - 'queued'     = enqueued, waiting for first attempt
 *   - 'retry'      = has retries remaining, will be reprocessed
 *   - 'processing' = a worker has it right now
 *   - 'completed'  = delivered (terminal happy path)
 *   - 'failed'     = exhausted retries (terminal — WILL NOT be reprocessed)
 *
 * MUST stay synchronized with 1ai_postback_logs.status — both tables are
 * written from two different code paths (queue here, controller in
 * postbackController.js). If they diverge, the queue will silently drop or
 * double-process a postback. The full-lifecycle test
 *   server/tests/postback.test.js "should exhaust retries and stop reprocessing"
 * asserts this invariant end-to-end.
 *
 * Run as periodic task (every 5-10 seconds).
 */
class PostbackQueue {
  constructor() {
    this.processing = false;
  }

  async start() {
    if (this.processing) return;
    this.processing = true;

    console.log('[PostbackQueue] Starting processor...');
    setInterval(() => this.process(), 10000);
  }

  async process() {
    try {
      const [queue] = await pool.query(
        `SELECT pql.id, pql.postback_log_id
         FROM 1ai_postback_queue pql
         WHERE pql.status IN ('queued', 'retry')
         AND (pql.scheduled_at <= NOW() OR scheduled_at IS NULL)
         LIMIT 10`,
        []
      );

      for (const item of queue) {
        await this.processItem(item.postback_log_id);
      }
    } catch (err) {
      console.error('[PostbackQueue] Process error:', err);
    }
  }

  async processItem(postbackLogId) {
    try {
      await pool.query('UPDATE 1ai_postback_queue SET status = ? WHERE postback_log_id = ?', ['processing', postbackLogId]);

      const [targets] = await pool.query(
        `SELECT pbl.id, pbl.offer_id, o.postback_enabled
         FROM 1ai_postback_logs pbl
         LEFT JOIN 1ai_offers o ON o.id = pbl.offer_id
         WHERE pbl.id = ?
         LIMIT 1`,
        [postbackLogId]
      );

      if (!targets.length || !targets[0].postback_enabled) {
        const errorMessage = targets.length ? 'Postback not enabled for offer' : 'Postback log not found';
        await pool.query(
          `UPDATE 1ai_postback_logs SET status = ?, error_message = ? WHERE id = ?`,
          ['failed', errorMessage, postbackLogId]
        );
        await pool.query('UPDATE 1ai_postback_queue SET status = ? WHERE postback_log_id = ?', ['failed', postbackLogId]);
        console.error(`[PostbackQueue] Postback ${postbackLogId} skipped:`, errorMessage);
        return;
      }

      await firePostback(postbackLogId);

      await pool.query('UPDATE 1ai_postback_queue SET status = ? WHERE postback_log_id = ?', ['completed', postbackLogId]);

      console.log(`[PostbackQueue] Postback ${postbackLogId} sent successfully`);
    } catch (err) {
      const [logs] = await pool.query(
        `SELECT pbl.retry_count, o.postback_retries
         FROM 1ai_postback_logs pbl
         LEFT JOIN 1ai_offers o ON o.id = pbl.offer_id
         WHERE pbl.id = ?`,
        [postbackLogId]
      );

      const maxRetries = logs.length ? normalizeInteger(logs[0].postback_retries, 3, 0, 10) : 3;
      if (logs.length && logs[0].retry_count < maxRetries) {
        const nextRetry = new Date(Date.now() + Math.pow(2, logs[0].retry_count) * 60000);
        await pool.query(
          'UPDATE 1ai_postback_queue SET status = ?, scheduled_at = ? WHERE postback_log_id = ?',
          ['retry', nextRetry, postbackLogId]
        );
        console.log(`[PostbackQueue] Postback ${postbackLogId} scheduled for retry at ${nextRetry}`);
      } else {
        await pool.query(
          'UPDATE 1ai_postback_queue SET status = ?, scheduled_at = ? WHERE postback_log_id = ?',
          ['failed', null, postbackLogId]
        );
        console.error(`[PostbackQueue] Postback ${postbackLogId} failed after retries:`, err.message);
      }
    }
  }

  /**
   * Enqueue postback for processing.
   * Idempotent: a postback_log_id can only be in the queue once.
   */
  async enqueue(postbackLogId) {
    try {
      const [existing] = await pool.query(
        'SELECT id FROM 1ai_postback_queue WHERE postback_log_id = ?',
        [postbackLogId]
      );

      if (existing.length) {
        return; // Already queued
      }

      await pool.query(
        'INSERT INTO 1ai_postback_queue (postback_log_id, status) VALUES (?, ?)',
        [postbackLogId, 'queued']
      );

      console.log(`[PostbackQueue] Postback ${postbackLogId} enqueued`);
    } catch (err) {
      console.error('[PostbackQueue] Enqueue error:', err);
    }
  }

  /**
   * Dead-letter check: find postbacks stuck in 'retry' for too long.
   * Returns rows where status='retry' AND scheduled_at is in the past
   * but the postback has not been picked up — likely a stuck worker.
   */
  async findStuckPostbacks(olderThanMinutes = 60) {
    try {
      const [rows] = await pool.query(
        `SELECT pql.id, pql.postback_log_id, pql.scheduled_at, pbl.retry_count
         FROM 1ai_postback_queue pql
         JOIN 1ai_postback_logs pbl ON pbl.id = pql.postback_log_id
         WHERE pql.status = 'retry'
         AND pql.scheduled_at < DATE_SUB(NOW(), INTERVAL ? MINUTE)`,
        [olderThanMinutes]
      );
      return rows;
    } catch (err) {
      console.error('[PostbackQueue] Stuck postback check error:', err);
      return [];
    }
  }
}

module.exports = new PostbackQueue();
