/**
 * treasuryClient.js
 *
 * Thin HTTP client for posting revenue entries to 1ai-hub /treasury/entry.
 * Fire-and-forget by default — affiliate payouts MUST NOT block on hub availability.
 *
 * Required env vars:
 *   TREASURY_HUB_URL   - e.g. http://localhost:8000
 *   TREASURY_HUB_TOKEN - Bearer token for hub authentication (optional if hub is internal-only)
 */

const logger = require('../logger');

const HUB_URL = process.env.TREASURY_HUB_URL || '';
const HUB_TOKEN = process.env.TREASURY_HUB_TOKEN || '';

/** @type {number} milliseconds before giving up on hub */
const REQUEST_TIMEOUT_MS = 5_000;

/**
 * Post a revenue entry to the Capital Pool.
 *
 * @param {object} entry
 * @param {string} entry.source        - system identifier, e.g. "1ai-affiliate"
 * @param {number} entry.amount_usd    - positive float
 * @param {'in'|'out'} entry.direction
 * @param {string} [entry.note]        - human-readable description
 * @param {string} [entry.workflow]    - e.g. "wf6_affiliate_payout"
 * @param {object} [entry.metadata]    - arbitrary JSON
 * @returns {Promise<boolean>} true if hub accepted the entry, false on any error
 */
async function recordToTreasury(entry) {
  if (!HUB_URL) {
    logger.warn('[treasuryClient] TREASURY_HUB_URL not set — skipping treasury record');
    return false;
  }

  const payload = {
    source: entry.source,
    amount_usd: entry.amount_usd,
    direction: entry.direction,
    note: entry.note ?? '',
    workflow: entry.workflow ?? null,
    metadata: entry.metadata ?? {},
  };

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };
    if (HUB_TOKEN) {
      headers['Authorization'] = `Bearer ${HUB_TOKEN}`;
    }

    const res = await fetch(`${HUB_URL}/treasury/entry`, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    if (!res.ok) {
      const text = await res.text().catch(() => '(no body)');
      logger.error(
        { status: res.status, body: text, entry: payload },
        '[treasuryClient] Hub rejected entry',
      );
      return false;
    }

    logger.info(
      { entry: payload },
      '[treasuryClient] Treasury entry recorded',
    );
    return true;
  } catch (err) {
    if (err.name === 'AbortError') {
      logger.warn({ entry: payload }, '[treasuryClient] Hub request timed out');
    } else {
      logger.error({ err, entry: payload }, '[treasuryClient] Failed to reach hub');
    }
    return false;
  } finally {
    clearTimeout(timer);
  }
}

module.exports = { recordToTreasury };
