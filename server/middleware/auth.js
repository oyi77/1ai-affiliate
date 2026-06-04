const jwt = require('jsonwebtoken');
const pool = require('../db/mysql');

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me';

/**
 * Authenticate via JWT (issued by PHP V3 API or Express login).
 * Supports two modes:
 *   - Bearer token → verify JWT, extract user_id
 *   - X-API-Key → call PHP V3 Auth to validate
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
      // We don't get user_id from health endpoint — use key as identity for admin ops
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
    req.user = decoded; // { id, email, role }
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

/**
 * Admin-only middleware. Must run AFTER authenticate.
 */
function requireAdmin(req, res, next) {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
}

/**
 * Generate JWT matching user in 202_users table.
 */
async function generateToken(userRow) {
  return jwt.sign(
    {
      id: userRow.user_id,
      email: userRow.user_email,
      role: (userRow.user_role === 2 || userRow.user_role === 'admin' || userRow.user_role === '1') ? 'admin' : 'user',
    },
    JWT_SECRET,
    { expiresIn: '24h' }
  );
}

module.exports = { authenticate, requireAdmin, generateToken, JWT_SECRET };
