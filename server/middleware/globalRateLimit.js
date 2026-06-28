'use strict';

/**
 * Global Rate Limiter — protects all endpoints from abuse.
 * 
 * Three tiers:
 * - Global: 100 req/min per IP
 * - Auth: 10 req/min per IP
 * - API: 60 req/min per user
 */

class SlidingWindow {
  constructor(windowMs, max) {
    this.windowMs = windowMs;
    this.max = max;
    this.store = new Map();
  }

  check(key) {
    const now = Date.now();
    let entry = this.store.get(key);
    if (!entry) { entry = { hits: [], lastCleanup: now }; this.store.set(key, entry); }

    // Cleanup old hits
    entry.hits = entry.hits.filter(t => now - t < this.windowMs);

    if (entry.hits.length >= this.max) {
      const retryAfter = Math.ceil((entry.hits[0] + this.windowMs - now) / 1000);
      return { allowed: false, retryAfter, remaining: 0 };
    }

    entry.hits.push(now);
    return { allowed: true, remaining: this.max - entry.hits.length };
  }

  // Periodic cleanup to prevent memory leak
  cleanup() {
    const now = Date.now();
    for (const [key, entry] of this.store) {
      entry.hits = entry.hits.filter(t => now - t < this.windowMs);
      if (entry.hits.length === 0) this.store.delete(key);
    }
  }
}

const windows = {
  global: new SlidingWindow(60_000, 100),      // 100 req/min per IP
  auth: new SlidingWindow(60_000, 10),          // 10 req/min per IP
  api: new SlidingWindow(60_000, 200),          // 200 req/min per user
  write: new SlidingWindow(60_000, 30),         // 30 writes/min per user
};

// Cleanup every 5 minutes
setInterval(() => {
  Object.values(windows).forEach(w => w.cleanup());
}, 5 * 60_000);

function rateLimitGlobal(req, res, next) {
  const key = req.ip || req.connection?.remoteAddress || 'unknown';
  const result = windows.global.check(key);
  if (!result.allowed) {
    return res.status(429).json({ error: 'Too many requests', retryAfter: result.retryAfter });
  }
  res.set('X-RateLimit-Remaining', String(result.remaining));
  next();
}

function rateLimitWrite(req, res, next) {
  const key = req.user?.id || req.ip || 'unknown';
  const result = windows.write.check(key);
  if (!result.allowed) {
    return res.status(429).json({ error: 'Too many write requests', retryAfter: result.retryAfter });
  }
  next();
}

module.exports = { rateLimitGlobal, rateLimitWrite, windows };
