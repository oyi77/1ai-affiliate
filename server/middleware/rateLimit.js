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

module.exports = { rateLimitPostback, resetRateLimit, REQUEST_LIMIT, TIME_WINDOW_MS };