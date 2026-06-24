'use strict';

const express = require('express');
const router = express.Router();
const pool = require('../db/mysql');
const { authenticate } = require('../middleware/auth');
const crypto = require('crypto');

router.use(authenticate);

// ── Generate TOTP secret ───────────────────────────────────────────
router.post('/setup', async (req, res) => {
  try {
    // Generate a random secret (base32)
    const secret = crypto.randomBytes(20).toString('base64url').substring(0, 32);

    // Generate 8 backup codes
    const backupCodes = Array.from({ length: 8 }, () =>
      crypto.randomBytes(4).toString('hex').toUpperCase()
    );

    // Store temporarily (not enabled yet)
    await pool.query(
      'UPDATE 1ai_users SET totp_secret = ?, totp_backup_codes = ? WHERE user_id = ?',
      [secret, JSON.stringify(backupCodes), req.user.id]
    );

    // Generate otpauth URI for QR code
    const issuer = '1AI Affiliate';
    const accountName = req.user.email || `user_${req.user.id}`;
    const otpauthUrl = `otpauth://totp/${encodeURIComponent(issuer)}:${encodeURIComponent(accountName)}?secret=${secret}&issuer=${encodeURIComponent(issuer)}&algorithm=SHA1&digits=6&period=30`;

    res.json({
      secret,
      backup_codes: backupCodes,
      otpauth_url: otpauthUrl,
      qr_url: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(otpauthUrl)}`
    });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── Verify and enable 2FA ──────────────────────────────────────────
router.post('/verify', async (req, res) => {
  try {
    const { code } = req.body;
    if (!code || code.length !== 6) return res.status(400).json({ error: '6-digit code required' });

    const [[user]] = await pool.query(
      'SELECT totp_secret FROM 1ai_users WHERE user_id = ?',
      [req.user.id]
    );

    if (!user?.totp_secret) return res.status(400).json({ error: '2FA not set up. Call /setup first.' });

    // Verify TOTP code
    const valid = verifyTOTP(user.totp_secret, code);
    if (!valid) return res.status(400).json({ error: 'Invalid code. Try again.' });

    // Enable 2FA
    await pool.query(
      'UPDATE 1ai_users SET totp_enabled = 1 WHERE user_id = ?',
      [req.user.id]
    );

    res.json({ success: true, message: '2FA enabled successfully' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── Disable 2FA ────────────────────────────────────────────────────
router.post('/disable', async (req, res) => {
  try {
    const { code } = req.body;
    if (!code) return res.status(400).json({ error: 'Current 2FA code required to disable' });

    const [[user]] = await pool.query(
      'SELECT totp_secret, totp_enabled FROM 1ai_users WHERE user_id = ?',
      [req.user.id]
    );

    if (!user?.totp_enabled) return res.status(400).json({ error: '2FA is not enabled' });

    const valid = verifyTOTP(user.totp_secret, code);
    if (!valid) return res.status(400).json({ error: 'Invalid code' });

    await pool.query(
      'UPDATE 1ai_users SET totp_enabled = 0, totp_secret = NULL, totp_backup_codes = NULL WHERE user_id = ?',
      [req.user.id]
    );

    res.json({ success: true, message: '2FA disabled' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── Get 2FA status ─────────────────────────────────────────────────
router.get('/status', async (req, res) => {
  try {
    const [[user]] = await pool.query(
      'SELECT totp_enabled FROM 1ai_users WHERE user_id = ?',
      [req.user.id]
    );
    res.json({ enabled: !!user?.totp_enabled });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── TOTP verification (RFC 6238) ───────────────────────────────────
function verifyTOTP(secret, code) {
  // Simple TOTP implementation using crypto
  // In production, use a library like 'otpauth' or 'speakeasy'
  const time = Math.floor(Date.now() / 1000 / 30);

  // Check current and adjacent windows (±1 for clock skew)
  for (let offset = -1; offset <= 1; offset++) {
    const expected = generateTOTP(secret, time + offset);
    if (expected === code) return true;
  }
  return false;
}

function generateTOTP(secret, counter) {
  // HMAC-SHA1 based TOTP
  const key = Buffer.from(secret, 'base64url');
  const counterBuffer = Buffer.alloc(8);
  counterBuffer.writeBigInt64BE(BigInt(counter));

  const hmac = crypto.createHmac('sha1', key).update(counterBuffer).digest();
  const offset = hmac[hmac.length - 1] & 0x0f;
  const code = (
    ((hmac[offset] & 0x7f) << 24) |
    ((hmac[offset + 1] & 0xff) << 16) |
    ((hmac[offset + 2] & 0xff) << 8) |
    (hmac[offset + 3] & 0xff)
  ) % 1000000;

  return String(code).padStart(6, '0');
}

module.exports = router;
