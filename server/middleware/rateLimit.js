const REQUEST_LIMIT = 10;
const TIME_WINDOW_MS = 1000;
const requestLog = new Map();

function getRequestIp(req) {
  return req.ip || req.connection?.remoteAddress || 'unknown';
}

function rateLimitPostback(req, res, next) {
  const ip = getRequestIp(req);
  const now = Date.now();
  const previous = requestLog.get(ip) || [];
  const recent = previous.filter(entry => now - entry.timestamp < TIME_WINDOW_MS);

  if (recent.length >= REQUEST_LIMIT) {
    requestLog.set(ip, recent);
    return res.status(429).json({
      error: 'Too many requests',
      retryAfter: Math.ceil((recent[0].timestamp + TIME_WINDOW_MS - now) / 1000)
    });
  }

  recent.push({ timestamp: now });
  requestLog.set(ip, recent);
  next();
}

function resetRateLimit() {
  requestLog.clear();
}

const AUTH_REQUEST_LIMIT = 5;
const AUTH_TIME_WINDOW_MS = 60000;
const authRequestLog = new Map();

function rateLimitAuth(req, res, next) {
  const ip = getRequestIp(req);
  const now = Date.now();
  const previous = authRequestLog.get(ip) || [];
  const recent = previous.filter(entry => now - entry.timestamp < AUTH_TIME_WINDOW_MS);

  if (recent.length >= AUTH_REQUEST_LIMIT) {
    authRequestLog.set(ip, recent);
    return res.status(429).json({
      error: 'Too many attempts. Please try again later.',
      retryAfter: Math.ceil((recent[0].timestamp + AUTH_TIME_WINDOW_MS - now) / 1000)
    });
  }

  recent.push({ timestamp: now });
  authRequestLog.set(ip, recent);
  next();
}

function resetAuthRateLimit() {
  authRequestLog.clear();
}

module.exports = {
  rateLimitPostback,
  resetRateLimit,
  rateLimitAuth,
  resetAuthRateLimit,
  REQUEST_LIMIT,
  TIME_WINDOW_MS,
  AUTH_REQUEST_LIMIT,
  AUTH_TIME_WINDOW_MS
};