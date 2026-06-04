const pool = require('../db/mysql');
const { generateToken } = require('../middleware/auth');
const crypto = require('crypto');

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
      `SELECT user_id, user_email, user_pass AS user_password, user_role FROM users WHERE ${column} = ?`,
      [email]
    );

    if (rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = rows[0];

    // password_verify — PHP uses bcrypt by default
    const bcrypt = require('bcryptjs');
    const valid = await bcrypt.compare(password, user.user_password);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check if user is also an affiliate
    const [affRows] = await pool.query(
      'SELECT id, affiliate_code FROM affiliates WHERE user_id = ?',
      [user.user_id]
    );

    const token = await generateToken(user);

    res.json({
      token,
      user: {
        id: user.user_id,
        email: user.user_email,
        role: (user.user_role === 2 || user.user_role === 'admin' || user.user_role === '1') ? 'admin' : 'user',
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
      'SELECT user_id, user_email, user_name, user_role FROM users WHERE user_id = ?',
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
       FROM affiliates a
       LEFT JOIN affiliate_earnings ae ON a.id = ae.affiliate_id
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

module.exports = { login, getMe };
