const crypto = require('crypto');
const pool = require('../db/mysql');
const logger = require('../logger');

const TTL_MS = 24 * 60 * 60 * 1000; // 24 hours
const memoryCache = new Map();
const REQUEST_METHODS = ['POST', 'PUT', 'PATCH', 'DELETE'];

function hashPayload(body) {
  const str = body ? JSON.stringify(body) : '';
  return crypto.createHash('sha256').update(str).digest('hex');
}

function keyFingerprint(req) {
  const userId = req.user?.id || req.user?.sub || 0;
  const payloadHash = hashPayload(req.body);
  return `${userId}:${req.method}:${req.path}:${payloadHash}`;
}

function cleanupMemoryCache() {
  const now = Date.now();
  for (const [key, entry] of memoryCache) {
    if (entry.expiresAt < now) memoryCache.delete(key);
  }
}

async function findStoredResponse(fingerprint, idempotencyKey) {
  try {
    const [rows] = await pool.query(
      `SELECT response_status, response_body, created_at
       FROM 1ai_idempotency_keys
       WHERE key_hash = ? AND fingerprint = ? AND created_at > DATE_SUB(NOW(), INTERVAL 1 DAY)`,
      [idempotencyKey, fingerprint]
    );
    if (rows.length) return rows[0];
  } catch (err) {
    // Table may not exist in Phase A before migration B; fall back to memory.
    if (!/ER_NO_SUCH_TABLE/.test(err.message && err.sqlMessage || err.message || '')) {
      logger.warn({ err }, 'Idempotency DB lookup failed');
    }
  }
  return null;
}

async function storeResponse(idempotencyKey, fingerprint, statusCode, body) {
  try {
    await pool.query(
      `INSERT INTO 1ai_idempotency_keys (key_hash, fingerprint, response_status, response_body)
       VALUES (?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE response_status = VALUES(response_status), response_body = VALUES(response_body), created_at = NOW()`,
      [idempotencyKey, fingerprint, statusCode, JSON.stringify(body)]
    );
  } catch (err) {
    if (/ER_NO_SUCH_TABLE/.test(err.message && err.sqlMessage || err.message || '')) {
      // Degrade to memory until migration B creates the table.
      memoryCache.set(`${idempotencyKey}:${fingerprint}`, {
        statusCode,
        body,
        expiresAt: Date.now() + TTL_MS,
      });
    } else {
      logger.warn({ err }, 'Idempotency DB store failed');
    }
  }
}

function idempotency() {
  return async (req, res, next) => {
    if (!REQUEST_METHODS.includes(req.method)) return next();

    const idempotencyKey = req.get('Idempotency-Key') || req.get('X-Idempotency-Key');
    if (!idempotencyKey) return next();

    const fingerprint = keyFingerprint(req);
    const cacheKey = `${idempotencyKey}:${fingerprint}`;

    cleanupMemoryCache();

    // Check memory first
    const mem = memoryCache.get(cacheKey);
    if (mem && mem.expiresAt > Date.now()) {
      logger.info({ idempotencyKey, path: req.path }, 'Returning cached idempotent response (memory)');
      return res.status(mem.statusCode).json(mem.body);
    }

    const stored = await findStoredResponse(fingerprint, idempotencyKey);
    if (stored) {
      logger.info({ idempotencyKey, path: req.path }, 'Returning cached idempotent response (DB)');
      let body = stored.response_body;
      try { body = JSON.parse(body); } catch (_) { /* keep raw */ }
      return res.status(stored.response_status).json(body);
    }

    // Intercept response to store it
    const originalSend = res.json.bind(res);
    res.json = (body) => {
      res.json = originalSend;
      storeResponse(idempotencyKey, fingerprint, res.statusCode, body).catch(() => {});
      return originalSend(body);
    };

    next();
  };
}

module.exports = { idempotency, keyFingerprint, REQUEST_METHODS };
