'use strict';

/**
 * API Key Authentication Middleware
 * Accepts Bearer token (JWT) OR X-API-Key header.
 */

const { validateKey } = require('../services/apiKeyService');

function apiKeyAuth(req, res, next) {
  // Already authenticated via JWT
  if (req.user) return next();

  const apiKey = req.headers['x-api-key'];
  if (!apiKey) return res.status(401).json({ error: 'Authentication required' });

  validateKey(apiKey).then(keyData => {
    if (!keyData) return res.status(401).json({ error: 'Invalid or expired API key' });

    // Check scopes
    if (keyData.scopes && req.method !== 'GET') {
      if (!keyData.scopes.includes('write') && !keyData.scopes.includes('admin')) {
        return res.status(403).json({ error: 'API key lacks write permission' });
      }
    }

    // Set user context from key
    req.user = { id: keyData.user_id, role: 'api_key', api_key_id: keyData.id };
    next();
  }).catch(() => res.status(500).json({ error: 'Auth error' }));
}

module.exports = { apiKeyAuth };
