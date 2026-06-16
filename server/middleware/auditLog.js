const pool = require('../db/mysql');
const logger = require('../logger');

const MUTATING_METHODS = ['POST', 'PUT', 'PATCH', 'DELETE'];
const SENSITIVE_KEYS = ['password', 'token', 'apiKey', 'secret', 'api_key', 'credit_card'];

function sanitizeBody(body) {
  if (!body || typeof body !== 'object') return body;
  const out = Array.isArray(body) ? [...body] : { ...body };
  for (const key of Object.keys(out)) {
    if (SENSITIVE_KEYS.some(sk => key.toLowerCase().includes(sk))) {
      out[key] = '[REDACTED]';
    } else if (typeof out[key] === 'object' && out[key] !== null) {
      out[key] = sanitizeBody(out[key]);
    }
  }
  return out;
}

async function writeAuditLog(req, res) {
  if (!MUTATING_METHODS.includes(req.method)) return;
  if (!req.user) return;

  const userId = req.user.id || req.user.user_id || null;
  const role = req.user.role || null;
  const action = `${req.method} ${req.route?.path || req.path}`;
  const resourceType = req.path.split('/')[1] || 'unknown';
  const resourceId = req.params?.id || req.params?.offerId || null;
  const payload = sanitizeBody(req.body);
  const ipAddress = req.ip || req.connection?.remoteAddress || null;
  const userAgent = req.get('User-Agent') || null;

  try {
    await pool.query(
      `INSERT INTO 1ai_audit_log
       (user_id, user_role, action, resource_type, resource_id, payload, ip_address, user_agent, status_code)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [userId, role, action, resourceType, resourceId, JSON.stringify(payload), ipAddress, userAgent, res.statusCode]
    );
  } catch (err) {
    // 1ai_audit_log table is created in Phase B migration; degrade to structured log only.
    logger.warn({
      err,
      userId,
      role,
      action,
      resourceType,
      resourceId,
      payload,
      ipAddress,
      statusCode: res.statusCode,
    }, 'Audit log write failed');
  }
}

function auditLog() {
  return async (req, res, next) => {
    if (!MUTATING_METHODS.includes(req.method) || !req.user) return next();

    const originalSend = res.json.bind(res);
    res.json = (body) => {
      res.json = originalSend;
      writeAuditLog(req, res).catch(() => {});
      return originalSend(body);
    };

    next();
  };
}

module.exports = { auditLog, writeAuditLog };
