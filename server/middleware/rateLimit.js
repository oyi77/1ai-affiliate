const logger = require('../logger');

function getClientIdentifier(req) {
  return req.user?.id
    ? `user:${req.user.id}`
    : req.ip || req.connection?.remoteAddress || 'unknown';
}

class SlidingWindow {
  constructor(windowMs, max) {
    this.windowMs = windowMs;
    this.max = max;
    this.log = new Map();
  }

  allow(identifier) {
    const now = Date.now();
    const previous = this.log.get(identifier) || [];
    const recent = previous.filter(entry => now - entry.timestamp < this.windowMs);

    if (recent.length >= this.max) {
      this.log.set(identifier, recent);
      return { allowed: false, retryAfter: Math.ceil((recent[0].timestamp + this.windowMs - now) / 1000) };
    }

    recent.push({ timestamp: now });
    this.log.set(identifier, recent);
    return { allowed: true };
  }

  reset(identifier) {
    if (identifier) {
      this.log.delete(identifier);
    } else {
      this.log.clear();
    }
  }
}

// Original constants preserved for backward compatibility.
const REQUEST_LIMIT = 10;
const TIME_WINDOW_MS = 1000;
const AUTH_REQUEST_LIMIT = 5;
const AUTH_TIME_WINDOW_MS = 60000;

// Per-endpoint tier windows.
const windows = {
  auth: new SlidingWindow(AUTH_TIME_WINDOW_MS, AUTH_REQUEST_LIMIT),       // login: 5/min
  register: new SlidingWindow(60 * 1000, 3),                              // register: 3/min
  admin: new SlidingWindow(60 * 1000, 100),                               // admin CRUD: 100/min
  write: new SlidingWindow(60 * 1000, 60),
  postback: new SlidingWindow(TIME_WINDOW_MS, REQUEST_LIMIT),
  ai: new SlidingWindow(60 * 1000, 30),
  read: new SlidingWindow(60 * 1000, 300),
};

function createMiddleware(window, name, message) {
  return function rateLimitMiddleware(req, res, next) {
    const id = getClientIdentifier(req);
    const result = window.allow(id);
    if (result.allowed) return next();

    logger.warn({ identifier: id, path: req.path, tier: name }, 'Rate limit exceeded');
    return res.status(429).json({
      error: message || 'Too many requests',
      retryAfter: result.retryAfter,
    });
  };
}

const rateLimitAuth = createMiddleware(windows.auth, 'auth', 'Too many attempts. Please try again later.');
const rateLimitRegister = createMiddleware(windows.register, 'register', 'Too many registration attempts. Please try again later.');
const rateLimitAdmin = createMiddleware(windows.admin, 'admin');
const rateLimitWrite = createMiddleware(windows.write, 'write');
const rateLimitPostback = createMiddleware(windows.postback, 'postback');
const rateLimitAi = createMiddleware(windows.ai, 'ai');
const rateLimitRead = createMiddleware(windows.read, 'read');

function resetRateLimit(identifier) {
  windows.postback.reset(identifier);
}

function resetAuthRateLimit(identifier) {
  windows.auth.reset(identifier);
}

function resetTier(tier, identifier) {
  windows[tier]?.reset(identifier);
}

module.exports = {
  rateLimitAuth,
  rateLimitRegister,
  rateLimitAdmin,
  rateLimitWrite,
  rateLimitPostback,
  rateLimitAi,
  rateLimitRead,
  resetRateLimit,
  resetAuthRateLimit,
  resetTier,
  REQUEST_LIMIT,
  TIME_WINDOW_MS,
  AUTH_REQUEST_LIMIT,
  AUTH_TIME_WINDOW_MS,
};
