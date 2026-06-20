const C = require('../utils/constants');
const pool = require('../db/mysql');
const { generateToken } = require('../middleware/auth');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

// Password reset key expiry: 3 days (in seconds)
const RESET_KEY_EXPIRY = C.DEFAULTS.RESET_KEY_EXPIRY_SEC;

/**
 * Login using users table (same DB as PHP tracking platform).
 * Password verified via PHP's password_hash() / password_verify().
 */
async function login(req, res) {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password required' });
  }

  try {
    // Accept username or email — user_name if no @, user_email if has @
    const isEmail = email.includes('@');
    const column = isEmail ? 'user_email' : 'user_name';
    const [rows] = await pool.query(
      `SELECT user_id, user_email, user_pass AS user_password, user_role FROM 1ai_users WHERE ${column} = ?`,
      [email]
    );

    if (rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = rows[0];

    // password_verify — PHP uses bcrypt by default
    const valid = await bcrypt.compare(password, user.user_password);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check if user is also an affiliate
    const [affRows] = await pool.query(
      'SELECT id, affiliate_code FROM 1ai_affiliates WHERE user_id = ?',
      [user.user_id]
    );

    const token = await generateToken(user);

    const [existingKeys] = await pool.query(
      'SELECT api_key FROM 1ai_api_keys WHERE user_id = ? LIMIT 1',
      [user.user_id]
    );
    let apiKey = existingKeys.length > 0 ? existingKeys[0].api_key : null;

    if (!apiKey) {
      apiKey = crypto.randomBytes(32).toString('hex');
      await pool.query(
        "INSERT INTO 1ai_api_keys (api_key, user_id, scope, created_at) VALUES (?, ?, '[*]', UNIX_TIMESTAMP())",
        [apiKey, user.user_id]
      );
    }

    res.json({
      token,
      apiKey,
      user: {
        id: user.user_id,
        email: user.user_email,
        role: user.user_role,
        affiliate: affRows.length > 0 ? affRows[0] : null,
      },
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * Get current user profile from users.
 * Called by client-user dashboard.
 */
async function getMe(req, res) {
  try {
    const [rows] = await pool.query(
      'SELECT user_id, user_email, user_name, user_role FROM 1ai_users WHERE user_id = ?',
      [req.user.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Attach affiliate data
    const [affRows] = await pool.query(
      `SELECT a.*,
        COALESCE(SUM(CASE WHEN ae.status IN ('pending','approved') THEN ae.payout_amount ELSE 0 END), 0) AS balance,
        COUNT(CASE WHEN ae.status IN ('pending','approved') THEN 1 ELSE NULL END) AS pending_conversions,
        COUNT(CASE WHEN ae.status = 'paid' THEN 1 ELSE NULL END) AS paid_conversions
       FROM 1ai_affiliates a
       LEFT JOIN 1ai_affiliate_earnings ae ON a.id = ae.affiliate_id
       WHERE a.user_id = ?
       GROUP BY a.id`,
      [req.user.id]
    );

    res.json({
      user: rows[0],
      affiliate: affRows.length > 0 ? affRows[0] : null,
    });
  } catch (err) {
    console.error('getMe error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * Forgot password — generates a reset key and returns it.
 * In production, this would email the user. For now, returns the key directly.
 */
async function forgotPassword(req, res) {
  const { username, email } = req.body;
  if (!username || !email) {
    return res.status(400).json({ error: 'Username and email required' });
  }

  try {
    const [rows] = await pool.query(
      'SELECT user_id, user_name, user_email FROM 1ai_users WHERE user_name = ? AND user_email = ?',
      [username, email]
    );

    if (rows.length === 0) {
      // Don't reveal whether user exists
      return res.json({ message: 'If the account exists, a reset key has been generated.' });
    }

    const user = rows[0];
    const resetKey = crypto.randomBytes(32).toString('hex');
    const resetTime = Math.floor(Date.now() / 1000);

    await pool.query(
      'UPDATE 1ai_users SET user_pass_key = ?, user_pass_time = ? WHERE user_id = ?',
      [resetKey, resetTime, user.user_id]
    );

    // Send reset email (optional — requires SMTP_HOST env var)
    if (process.env.SMTP_HOST) {
      try {
        const nodemailer = require('nodemailer');
        const transporter = nodemailer.createTransport({
          host: process.env.SMTP_HOST, port: parseInt(process.env.SMTP_PORT || '587'),
          secure: process.env.SMTP_SECURE === 'true',
          auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } : undefined,
        });
        const baseUrl = process.env.APP_URL || 'https://affiliate.berkahkarya.org';
        await transporter.sendMail({
          from: process.env.SMTP_FROM || 'noreply@berkahkarya.org',
          to: user.user_email,
          subject: 'Password Reset — 1ai-Affiliate',
          text: `Click this link to reset your password: ${baseUrl}/pass-reset.php?uid=${user.user_id}&key=${resetKey}\n\nThis link expires in 3 days. If you didn't request this, ignore this email.`,
        });
      } catch (emailErr) {
        console.error('Reset email send failed:', emailErr.message);
      }
    }
    res.json({ message: 'If that email exists, a reset link has been sent.' });
  } catch (err) {
    console.error('Forgot password error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * Reset password — verifies reset key (not expired) and sets new password.
 */
async function resetPassword(req, res) {
  const { key, password } = req.body;
  if (!key || !password) {
    return res.status(400).json({ error: 'Reset key and new password required' });
  }
  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters' });
  }

  try {
    const [rows] = await pool.query(
      'SELECT user_id, user_pass_key, user_pass_time FROM 1ai_users WHERE user_pass_key = ?',
      [key]
    );

    if (rows.length === 0) {
      return res.status(400).json({ error: 'Invalid or expired reset key' });
    }

    const user = rows[0];
    const now = Math.floor(Date.now() / 1000);

    if (!user.user_pass_time || (now - user.user_pass_time) > RESET_KEY_EXPIRY) {
      // Clear the key so it can't be reused
      await pool.query('UPDATE 1ai_users SET user_pass_key = NULL, user_pass_time = 0 WHERE user_id = ?', [user.user_id]);
      return res.status(400).json({ error: 'Reset key has expired. Please request a new one.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await pool.query(
      'UPDATE 1ai_users SET user_pass = ?, user_pass_key = NULL, user_pass_time = 0 WHERE user_id = ?',
      [hashedPassword, user.user_id]
    );

    res.json({ message: 'Password has been reset successfully.' });
  } catch (err) {
    console.error('Reset password error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * Change password for authenticated user.
 */
async function changePassword(req, res) {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) {
    return res.status(400).json({ error: 'Current password and new password required' });
  }
  if (newPassword.length < 6) {
    return res.status(400).json({ error: 'New password must be at least 6 characters' });
  }

  try {
    const [rows] = await pool.query(
      'SELECT user_pass FROM 1ai_users WHERE user_id = ?',
      [req.user.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const valid = await bcrypt.compare(currentPassword, rows[0].user_pass);
    if (!valid) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await pool.query('UPDATE 1ai_users SET user_pass = ? WHERE user_id = ?', [hashedPassword, req.user.id]);

    res.json({ message: 'Password changed successfully' });
  } catch (err) {
    console.error('Change password error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * Get current user's API key for PHP V3 API access.
 */
async function getApiKey(req, res) {
  try {
    const [rows] = await pool.query(
      'SELECT api_key, scope FROM api_keys WHERE user_id = ? LIMIT 1',
      [req.user.id]
    );
    if (rows.length === 0) {
      return res.json({ configured: false, message: 'No API key configured.' });
    }
    res.json({ configured: true, api_key: rows[0].api_key, scope: rows[0].scope });
  } catch (err) {
    console.error('getApiKey error:', err);
    res.status(500).json({ error: err.message });
  }
}

/**
 * Generate a new API key (replaces existing one).
 */
async function regenerateApiKey(req, res) {
  try {
    const apiKey = crypto.randomBytes(32).toString('hex');
    await pool.query(
      'DELETE FROM api_keys WHERE user_id = ?',
      [req.user.id]
    );
    await pool.query(
      "INSERT INTO api_keys (api_key, user_id, scope) VALUES (?, ?, '[*]')",
      [apiKey, req.user.id]
    );
    res.json({ api_key: apiKey, message: 'API key regenerated.' });
  } catch (err) {
    console.error('regenerateApiKey error:', err);
    res.status(500).json({ error: err.message });
  }
}

/**
 * Register a new affiliate (public, no auth required).
 * Creates a user row + affiliate profile, returns JWT.
 */
async function registerAffiliate(req, res) {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email, and password are required' });
  }
  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters' });
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Invalid email format' });
  }

  // Check duplicate email
  const [existing] = await pool.query('SELECT user_id FROM 1ai_users WHERE user_email = ?', [email]);
  if (existing.length > 0) {
    return res.status(409).json({ error: 'Email already registered' });
  }

  const hashed = await bcrypt.hash(password, 12);
  const now = Math.floor(Date.now() / 1000);

  const [result] = await pool.query(
    `INSERT INTO 1ai_users (user_name, user_email, user_pass, user_role, user_registered, user_active, user_date_added)
     VALUES (?, ?, ?, 'affiliate', ?, 1, ?)`,
    [name, email, hashed, now, now]
  );
  const userId = result.insertId;

  // Generate unique affiliate code
  const affiliateCode = `AFF${userId}${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
  await pool.query(
    `INSERT INTO 1ai_affiliates (user_id, affiliate_code, tier, balance, created_at, updated_at)
     VALUES (?, ?, 'starter', 0, ?, ?)`,
    [userId, affiliateCode, now, now]
  );

  const userRow = { user_id: userId, user_email: email, user_role: 'affiliate' };
  const token = await generateToken(userRow);

  res.status(201).json({
    token,
    user: {
      id: userId,
      email,
      role: 'affiliate',
      affiliate_code: affiliateCode,
    },
  });
}

module.exports = { login, getMe, forgotPassword, resetPassword, changePassword, getApiKey, regenerateApiKey, registerAffiliate };
