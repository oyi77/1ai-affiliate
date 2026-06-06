// Role-based middleware for admin routes

function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: `Role required: ${roles.join(' or ')}` });
    }
    next();
  };
}

function requireAffiliate(req, res, next) {
  return requireRole('affiliate')(req, res, next);
}

function requireAdvertiser(req, res, next) {
  return requireRole('advertiser')(req, res, next);
}

module.exports = { requireRole, requireAffiliate, requireAdvertiser };