const pool = require('../db/mysql');
const { generateToken } = require('../middleware/auth');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

// Password reset key expiry: 3 days (in seconds)
const RESET_KEY_EXPIRY = 3 * 24 * 60 * 60;

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

    // In production: send email with reset link containing the key
    res.json({ message: 'If the account exists, a reset key has been generated.' });
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
      'SELECT api_key, scope FROM 1ai_api_keys WHERE user_id = ? LIMIT 1',
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
      'DELETE FROM 1ai_api_keys WHERE user_id = ?',
      [req.user.id]
    );
    await pool.query(
      "INSERT INTO 1ai_api_keys (api_key, user_id, scope, created_at) VALUES (?, ?, '[*]', UNIX_TIMESTAMP())",
      [apiKey, req.user.id]
    );
    res.json({ api_key: apiKey, message: 'API key regenerated.' });
  } catch (err) {
    console.error('regenerateApiKey error:', err);
    res.status(500).json({ error: err.message });
  }
}

async function register(req, res) {
  const { username, email, password, role, company_name, website } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password required' });
  }
  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters' });
  }
  const userRole = (role === 'advertiser') ? 'advertiser' : 'affiliate';
  try {
    const [existing] = await pool.query('SELECT user_id FROM 1ai_users WHERE user_email = ?', [email]);
    if (existing.length > 0) {
      return res.status(409).json({ error: 'Email already registered' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const [result] = await pool.query(
      `INSERT INTO 1ai_users (user_name, user_email, user_pass, user_role, user_date_added)
       VALUES (?, ?, ?, ?, UNIX_TIMESTAMP())`,
      [username || email.split('@')[0], email, hashedPassword, userRole]
    );
    const userId = result.insertId;

    if (userRole === 'advertiser') {
      await pool.query(
        `INSERT INTO 1ai_advertisers (user_id, company_name, website, status, created_at, updated_at)
         VALUES (?, ?, ?, 'active', UNIX_TIMESTAMP(), UNIX_TIMESTAMP())`,
        [userId, company_name || username || email.split('@')[0], website || null]
      );
    } else {
      const affiliateCode = 'AFF' + userId.toString().padStart(6, '0');
      await pool.query(
        `INSERT INTO 1ai_affiliates (user_id, affiliate_code, tier, created_at, updated_at)
         VALUES (?, ?, 'starter', UNIX_TIMESTAMP(), UNIX_TIMESTAMP())`,
        [userId, affiliateCode]
      );
    }

    const user = { user_id: userId, user_email: email, user_role: userRole };
    const token = await generateToken(user);
    res.json({ token, user: { id: userId, email, role: userRole } });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

module.exports = { login, register, getMe, forgotPassword, resetPassword, changePassword, getApiKey, regenerateApiKey };
