'use strict';

const logger = require('../logger');
const redisClient = require('../lib/redisClient');

const LIMITS = {
  global: { windowMs: 60_000, max: 100 },
  write: { windowMs: 60_000, max: 30 },
};

function logBackendError(limiter, err) {
  logger.error({
    event: 'rate_limit_backend_error',
    limiter,
    err,
  }, 'distributed rate limit backend failed');
}

function isRateLimitBypassed() {
  return (
    process.env.RATE_LIMIT_DISABLED === 'true' ||
    (process.env.NODE_ENV === 'test' && process.env.RATE_LIMIT_STRICT !== 'true')
  );
}

async function applyLimit(limiter, key, req, res, next, message, includeRemaining) {
  if (isRateLimitBypassed()) {
    if (includeRemaining) {
      res.set('X-RateLimit-Remaining', '999');
    }
    return next();
  }

  try {
    const config = LIMITS[limiter];
    const result = await redisClient.consume({
      limiter,
      key,
      windowMs: config.windowMs,
      max: config.max,
    });

    if (!result.allowed) {
      return res.status(429).json({ error: message, retryAfter: result.retryAfter });
    }

    if (includeRemaining) {
      res.set('X-RateLimit-Remaining', String(result.remaining));
    }

    return next();
  } catch (err) {
    logBackendError(limiter, err);
    return next();
  }
}

async function rateLimitGlobal(req, res, next) {
  const key = req.ip || req.connection?.remoteAddress || 'unknown';
  return applyLimit('global', key, req, res, next, 'Too many requests', true);
}

async function rateLimitWrite(req, res, next) {
  const key = req.user?.id || req.ip || 'unknown';
  return applyLimit('write', String(key), req, res, next, 'Too many write requests', false);
}

module.exports = {
  rateLimitGlobal,
  rateLimitWrite,
  LIMITS,
};
