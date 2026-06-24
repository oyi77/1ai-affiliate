const jwt = require('jsonwebtoken');
const pool = require('../db/mysql');
const logger = require('../logger');

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  console.error('FATAL: JWT_SECRET environment variable is required');
  process.exit(1);
}

/**
 * Authenticate via JWT (issued by Node login endpoint).
 * Supports two modes:
 *   - Bearer token → verify JWT, extract user_id + role
 *   - X-API-Key → delegate to PHP V3 Auth to validate
 */
async function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  const apiKey = req.headers['x-api-key'];

  // API key mode — delegate to PHP V3 Auth
  if (apiKey && !authHeader) {
    try {
      const V3_API_URL = process.env.V3_API_URL || 'http://localhost/api/v3';
      const resp = await fetch(`${V3_API_URL}/system/health`, {
        headers: { 'Authorization': `Bearer ${apiKey}` }
      });
      if (!resp.ok) {
        logger.warn({ apiKey: `${apiKey.slice(0, 4)}...`, status: resp.status }, 'API key rejected');
        return res.status(401).json({ error: 'Invalid API key' });
      }
      req.user = { id: 0, role: 'admin', apiKey };
      return next();
    } catch (e) {
      logger.error({ err: e }, 'Auth service unreachable');
      return res.status(401).json({ error: 'Auth service unreachable' });
    }
  }

  // JWT mode — also accept ?token= query param for SSE/EventSource
  let token = null;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  } else if (req.query.token) {
    token = req.query.token;
  }
  if (!token) {
    return res.status(401).json({ error: 'Authorization required' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (!decoded || !decoded.role) {
      logger.warn({ user: decoded?.id }, 'JWT missing role claim');
      return res.status(401).json({ error: 'Invalid token payload' });
    }
    req.user = decoded; // { id, email, role, affiliateId? }
    next();
  } catch (err) {
    const reason = err.name === 'TokenExpiredError' ? 'Token expired' : 'Invalid or expired token';
    logger.warn({ err }, reason);
    return res.status(401).json({ error: reason });
  }
}

/**
 * Require one or more roles. Usage: requireRole('admin', 'manager')
 * Must run AFTER authenticate.
 */
function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
    if (!roles.includes(req.user.role)) {
      logger.warn({ userId: req.user.id, role: req.user.role, required: roles, path: req.path }, 'Authorization denied');
      return res.status(403).json({ error: `Role required: ${roles.join(' or ')}` });
    }
    next();
  };
}

/**
 * Admin-only shortcut.
 */
function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    logger.warn({ userId: req.user?.id, role: req.user?.role, path: req.path }, 'Admin authorization denied');
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
}

/**
 * Generate JWT for authenticated user.
 * user_role is a string: 'admin' | 'affiliate' | 'advertiser' | 'manager'
 */
async function generateToken(userRow) {
  const role = userRow.user_role;
  const payload = {
    id: userRow.user_id,
    email: userRow.user_email,
    role,
  };

  // Include affiliateId in JWT when user is an affiliate
  if (role === 'affiliate') {
    const [affRows] = await pool.query(
      'SELECT id FROM 1ai_affiliates WHERE user_id = ?',
      [userRow.user_id]
    );
    if (affRows.length) payload.affiliateId = affRows[0].id;
  }

  return jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' });
}

module.exports = { authenticate, requireAdmin, requireRole, generateToken, JWT_SECRET };
