const jwt = require('jsonwebtoken');
const pool = require('../db/mysql');

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me';

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
      if (!resp.ok) return res.status(401).json({ error: 'Invalid API key' });
      req.user = { id: 0, role: 'admin', apiKey };
      return next();
    } catch (e) {
      return res.status(401).json({ error: 'Auth service unreachable' });
    }
  }

  // JWT mode
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authorization required' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // { id, email, role, affiliateId? }
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
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
