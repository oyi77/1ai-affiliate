'use strict';

/**
 * HMAC Service — Sign and verify click IDs with HMAC-SHA256.
 * Prevents postback forgery by cryptographically binding click IDs to a secret.
 */

const crypto = require('crypto');

// FALLBACK_DEFAULT: used when DB/Redis secret is unavailable
const DEFAULT_SECRET = '1ai-hmac-default-secret-change-me';

let _secret = null;

/**
 * Get the HMAC secret. Lazy-loaded from env or fallback.
 */
function getSecret() {
  if (!_secret) {
    _secret = process.env.HMAC_CLICK_SECRET || DEFAULT_SECRET;
  }
  return _secret;
}

/**
 * Set the HMAC secret (for runtime configuration).
 */
function setSecret(secret) {
  _secret = secret;
}

/**
 * Generate an HMAC-signed click ID.
 * Format: {click_id}.{hmac_signature}
 * 
 * @param {string} clickId - Raw click ID
 * @returns {string} Signed click ID
 */
function signClickId(clickId) {
  const secret = getSecret();
  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(clickId);
  const signature = hmac.digest('hex').substring(0, 16); // 16 chars is enough
  return `${clickId}.${signature}`;
}

/**
 * Verify an HMAC-signed click ID.
 * 
 * @param {string} signedClickId - Signed click ID (format: click_id.signature)
 * @returns {{ valid: boolean, clickId: string }}
 */
function verifyClickId(signedClickId) {
  if (!signedClickId || typeof signedClickId !== 'string') {
    return { valid: false, clickId: null };
  }

  const parts = signedClickId.split('.');
  if (parts.length < 2) {
    return { valid: false, clickId: null };
  }

  const signature = parts.pop();
  const clickId = parts.join('.');

  const secret = getSecret();
  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(clickId);
  const expectedSignature = hmac.digest('hex').substring(0, 16);

  // Constant-time comparison to prevent timing attacks
  const valid = crypto.timingSafeEqual(
    Buffer.from(signature, 'hex'),
    Buffer.from(expectedSignature, 'hex')
  );

  return { valid, clickId };
}

/**
 * Generate a click ID with timestamp and random component.
 * Format: {timestamp_base36}{random_5chars}
 */
function generateClickId() {
  return Date.now().toString(36) + crypto.randomBytes(3).toString('base64url').substring(0, 5);
}

module.exports = {
  signClickId,
  verifyClickId,
  generateClickId,
  getSecret,
  setSecret,
};
