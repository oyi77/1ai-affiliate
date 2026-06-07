const pool = require('../db/mysql');
const { firePostback, normalizeInteger } = require('../controllers/postbackController');

/**
 * Postback queue processor — handles retries with exponential backoff
 * Run as periodic task (every 5-10 seconds)
 */
class PostbackQueue {
  constructor() {
    this.processing = false;
  }

  async start() {
    if (this.processing) return;
    this.processing = true;

    console.log('[PostbackQueue] Starting processor...');

    // Run every 10 seconds
    setInterval(() => this.process(), 10000);
  }

  async process() {
    try {
      // Find all pending/retry postbacks due for processing
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
   * Enqueue postback for processing
   */
  async enqueue(postbackLogId) {
    try {
      const [existing] = await pool.query(
        'SELECT id FROM 1ai_postback_queue WHERE postback_log_id = ?',
        [postbackLogId]
      );

      if (existing.length) {
        // Already queued
        return;
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
}

module.exports = new PostbackQueue();
