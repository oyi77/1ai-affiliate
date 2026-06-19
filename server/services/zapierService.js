/**
 * Zapier / Generic Webhook Service
 * Fires outbound HTTP POST to registered webhook URLs when events occur.
 * Integrates with the webhook management system.
 */

const crypto = require('crypto');

/**
 * Trigger a single Zapier-style webhook URL with a JSON payload.
 *
 * @param {string} url — Webhook destination URL
 * @param {object} data — Event payload
 * @param {string} [secret] — Optional HMAC-SHA256 signing secret
 * @returns {Promise<{success: boolean, status?: number, error?: string}>}
 */
async function triggerZapierWebhook(url, data, secret) {
  const body = JSON.stringify(data);
  const headers = {
    'Content-Type': 'application/json',
    'User-Agent': '1ai-Affiliate-Webhook/1.0',
  };

  if (secret) {
    const signature = crypto.createHmac('sha256', secret).update(body).digest('hex');
    headers['X-Webhook-Signature'] = `sha256=${signature}`;
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers,
      body,
      signal: controller.signal,
    });

    clearTimeout(timeout);
    return { success: res.ok, status: res.status };
  } catch (err) {
    clearTimeout(timeout);
    if (err.name === 'AbortError') {
      return { success: false, error: 'Webhook request timed out (10s)' };
    }
    return { success: false, error: err.message };
  }
}

/**
 * Fire all registered webhooks for a given user and event type.
 * Looks up active webhooks from 1ai_webhooks, filters by event match,
 * and fires them concurrently. Updates last_triggered_at.
 *
 * @param {import('mysql2/promise').Pool} pool
 * @param {number} userId
 * @param {string} event — Event name: 'conversion', 'click', 'fraud', 'payout', etc.
 * @param {object} payload — Event data to send
 */
async function fireWebhooksForEvent(pool, userId, event, payload) {
  try {
    const [rows] = await pool.query(
      `SELECT id, url, events, secret
       FROM 1ai_webhooks
       WHERE user_id = ? AND enabled = 1`,
      [userId]
    );

    const matching = rows.filter(row => {
      let events;
      try {
        events = typeof row.events === 'string' ? JSON.parse(row.events) : row.events;
      } catch {
        return false;
      }
      return Array.isArray(events) && (events.includes(event) || events.includes('*'));
    });

    if (matching.length === 0) return;

    const webhookPayload = {
      event,
      timestamp: Math.floor(Date.now() / 1000),
      data: payload,
    };

    // Fire with retry (exponential backoff: 1s, 4s, 16s, 64s)
    const MAX_RETRIES = 4;
    for (let i = 0; i < matching.length; i++) {
      const wh = matching[i];
      let result;
      for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
        result = await triggerZapierWebhook(wh.url, webhookPayload, wh.secret);
        if (result.success) break;
        if (attempt < MAX_RETRIES) {
          const delay = Math.pow(4, attempt) * 1000; // 1s, 4s, 16s, 64s
          await new Promise(r => setTimeout(r, delay));
        }
      }
      if (result.success) {
        pool.query('UPDATE 1ai_webhooks SET last_triggered_at = ? WHERE id = ?', [now, wh.id]).catch(() => {});
      } else {
        // Dead letter — log failure after all retries exhausted
        pool.query(
          'INSERT INTO 1ai_webhook_queue (webhook_id, event, payload, status, attempts, last_error, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
          [wh.id, event, JSON.stringify(webhookPayload), 'dead', MAX_RETRIES + 1, result.error, now]
        ).catch(() => {});
      }
    }
  } catch (err) {
    console.error('fireWebhooksForEvent error:', err.message);
  }
}

/**
 * Build a standardized webhook test payload.
 *
 * @param {string} webhookUrl — The URL being tested
 * @returns {object} — Test payload
 */
function buildTestPayload(webhookUrl) {
  return {
    event: 'test',
    timestamp: Math.floor(Date.now() / 1000),
    data: {
      message: 'This is a test webhook from 1ai-Affiliate',
      webhook_url: webhookUrl,
      test_id: crypto.randomUUID(),
    },
  };
}

module.exports = { triggerZapierWebhook, fireWebhooksForEvent, buildTestPayload };
