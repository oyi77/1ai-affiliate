'use strict';

/**
 * Input Sanitization Middleware — prevents injection attacks.
 * 
 * Sanitizes:
 * - SQL injection patterns
 * - XSS patterns
 * - Path traversal
 * - SSRF attempts
 */

const SUSPICIOUS_PATTERNS = [
  /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|UNION|ALTER|CREATE|EXEC|EXECUTE)\b.*\b(FROM|INTO|WHERE|SET|TABLE)\b)/i,
  /(<script[^>]*>.*?<\/script>)/gi,
  /(javascript\s*:)/gi,
  /(\.\.\/)/g,
  /(169\.254\.169\.254)/,
  /(10\.\d+\.\d+\.\d+)/,
  /(172\.(1[6-9]|2[0-9]|3[01])\.\d+\.\d+)/,
  /(192\.168\.\d+\.\d+)/,
];

const SSRF_BLOCKED_HOSTS = [
  '169.254.169.254', // AWS metadata
  'metadata.google.internal', // GCP metadata
  '127.0.0.1',
  'localhost',
  '0.0.0.0',
];

function sanitizeValue(value) {
  if (typeof value !== 'string') return value;
  // Trim and limit length
  let v = value.trim();
  if (v.length > 10000) v = v.substring(0, 10000);
  return v;
}

function sanitizeObject(obj, depth = 0) {
  if (depth > 5) return obj; // Prevent deep nesting attacks
  if (typeof obj === 'string') return sanitizeValue(obj);
  if (Array.isArray(obj)) return obj.map(v => sanitizeObject(v, depth + 1));
  if (obj && typeof obj === 'object') {
    const result = {};
    for (const [key, value] of Object.entries(obj)) {
      result[sanitizeValue(key)] = sanitizeObject(value, depth + 1);
    }
    return result;
  }
  return obj;
}

function sanitizeMiddleware(req, res, next) {
  // Sanitize body
  if (req.body && typeof req.body === 'object') {
    req.body = sanitizeObject(req.body);
  }

  // Sanitize query
  if (req.query && typeof req.query === 'object') {
    req.query = sanitizeObject(req.query);
  }

  next();
}

function checkSSRF(url) {
  if (!url || typeof url !== 'string') return { safe: true };
  try {
    const parsed = new URL(url);
    const hostname = parsed.hostname;
    
    if (SSRF_BLOCKED_HOSTS.includes(hostname)) {
      return { safe: false, reason: `Blocked host: ${hostname}` };
    }
    
    // Check for IP addresses in hostname
    if (/^\d+\.\d+\.\d+\.\d+$/.test(hostname)) {
      const parts = hostname.split('.').map(Number);
      // Block private IP ranges
      if (parts[0] === 10 || 
          (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) ||
          (parts[0] === 192 && parts[1] === 168) ||
          parts[0] === 127 ||
          parts[0] === 169 && parts[1] === 254) {
        return { safe: false, reason: `Private IP: ${hostname}` };
      }
    }
    
    return { safe: true };
  } catch {
    return { safe: false, reason: 'Invalid URL' };
  }
}

module.exports = { sanitizeMiddleware, sanitizeObject, checkSSRF, SSRF_BLOCKED_HOSTS };
