const pool = require('../db/mysql');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

/**
 * Get current user's profile: email, timezone, api_key, integrations
 */
async function getProfile(req, res) {
  try {
    const [rows] = await pool.query(
      `SELECT user_id, user_name, user_email, user_timezone, user_api_key,
              clickserver_api_key, customer_api_key, user_slack_incoming_webhook,
              user_role, user_date_added
       FROM 1ai_users WHERE user_id = ?`,
      [req.user.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = rows[0];

    // Get integration keys from users_pref
    const [prefRows] = await pool.query(
      'SELECT prefs FROM 1ai_users_pref WHERE user_id = ?',
      [req.user.id]
    );

    let prefs = {};
    if (prefRows.length > 0 && prefRows[0].prefs) {
      try {
        prefs = JSON.parse(prefRows[0].prefs);
      } catch (e) { /* ignore invalid JSON */ }
    }

    res.json({
      id: user.user_id,
      username: user.user_name,
      email: user.user_email,
      timezone: user.user_timezone || 'America/New_York',
      role: user.user_role,
      api_key: user.user_api_key || null,
      clickserver_api_key: user.clickserver_api_key || null,
      customer_api_key: user.customer_api_key || null,
      slack_webhook: user.user_slack_incoming_webhook || null,
      date_added: user.user_date_added,
      integrations: {
        cb_key: prefs.cb_key || null,
        jvzoo_secret_key: prefs.jvzoo_secret_key || null,
        zaxaa_api_signature: prefs.zaxaa_api_signature || null,
        ipqs_api_key: prefs.ipqs_api_key || null,
        maxmind_isp: prefs.maxmind_isp || 0,
        auto_db_optimization_days: prefs.auto_db_optimization_days || 0,
      },
    });
  } catch (err) {
    console.error('getProfile error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * Update user profile (email, timezone)
 */
async function updateProfile(req, res) {
  const { email, timezone } = req.body;

  try {
    const updates = [];
    const values = [];

    if (email) {
      updates.push('user_email = ?');
      values.push(email);
    }
    if (timezone) {
      updates.push('user_timezone = ?');
      values.push(timezone);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    values.push(req.user.id);
    await pool.query(`UPDATE 1ai_users SET ${updates.join(', ')} WHERE user_id = ?`, values);

    res.json({ message: 'Profile updated successfully' });
  } catch (err) {
    console.error('updateProfile error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * Generate a new REST API key
 */
async function generateApiKey(req, res) {
  try {
    const apiKey = '1ai_' + crypto.randomBytes(29).toString('hex');  // 4 + 58 = 62 chars, fits VARCHAR(64)

    await pool.query('UPDATE 1ai_users SET user_api_key = ? WHERE user_id = ?', [apiKey, req.user.id]);

    res.json({ api_key: apiKey });
  } catch (err) {
    console.error('generateApiKey error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * Remove the REST API key
 */
async function removeApiKey(req, res) {
  try {
    await pool.query('UPDATE 1ai_users SET user_api_key = NULL WHERE user_id = ?', [req.user.id]);
    res.json({ message: 'API key removed' });
  } catch (err) {
    console.error('removeApiKey error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * Get integration keys (ClickBank, JVZoo, Zaxaa, Slack, IPQS)
 */
async function getIntegrations(req, res) {
  try {
    const [prefRows] = await pool.query(
      'SELECT prefs FROM 1ai_users_pref WHERE user_id = ?',
      [req.user.id]
    );

    let prefs = {};
    if (prefRows.length > 0 && prefRows[0].prefs) {
      try {
        prefs = JSON.parse(prefRows[0].prefs);
      } catch (e) { /* ignore */ }
    }

    const [userRows] = await pool.query(
      'SELECT clickserver_api_key, customer_api_key, user_slack_incoming_webhook FROM 1ai_users WHERE user_id = ?',
      [req.user.id]
    );

    const user = userRows[0] || {};

    res.json({
      cb_key: prefs.cb_key || null,
      jvzoo_secret_key: prefs.jvzoo_secret_key || null,
      zaxaa_api_signature: prefs.zaxaa_api_signature || null,
      ipqs_api_key: prefs.ipqs_api_key || null,
      slack_webhook: user.user_slack_incoming_webhook || null,
      clickserver_api_key: user.clickserver_api_key || null,
      customer_api_key: user.customer_api_key || null,
    });
  } catch (err) {
    console.error('getIntegrations error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * Update an integration key
 */
/**
 * Get postback configuration for the current user.
 */
async function getPostback(req, res) {
  try {
    const [rows] = await pool.query(
      'SELECT postback_url FROM 1ai_users WHERE user_id = ?',
      [req.user.id]
    );
    res.json({ url: rows[0]?.postback_url || null, configured: !!(rows[0]?.postback_url) });
  } catch (err) {
    console.error('getPostback error:', err);
    res.status(500).json({ error: err.message });
  }
}

/**
 * Update postback URL for the current user.
 */
async function updatePostback(req, res) {
  const { url } = req.body;
  try {
    await pool.query('UPDATE 1ai_users SET postback_url = ? WHERE user_id = ?', [url, req.user.id]);
    res.json({ url, message: 'Postback URL saved' });
  } catch (err) {
    console.error('updatePostback error:', err);
    res.status(500).json({ error: err.message });
  }
}

async function updateIntegration(req, res) {
  const { key, value } = req.body;

  const allowedKeys = [
    'cb_key', 'jvzoo_secret_key', 'zaxaa_api_signature',
    'ipqs_api_key', 'slack_webhook', 'clickserver_api_key', 'customer_api_key'
  ];

  if (!allowedKeys.includes(key)) {
    return res.status(400).json({ error: `Invalid key. Allowed: ${allowedKeys.join(', ')}` });
  }

  try {
    // Some keys go in users table, some in users_pref
    const userTableKeys = ['slack_webhook', 'clickserver_api_key', 'customer_api_key'];
    const userColumnMap = {
      slack_webhook: 'user_slack_incoming_webhook',
      clickserver_api_key: 'clickserver_api_key',
      customer_api_key: 'p1ai_customer_api_key',
    };

    if (userTableKeys.includes(key)) {
      const col = userColumnMap[key];
      await pool.query(`UPDATE 1ai_users SET ${col} = ? WHERE user_id = ?`, [value, req.user.id]);
    } else {
      // Store in users_pref JSON
      const [prefRows] = await pool.query(
        'SELECT prefs FROM 1ai_users_pref WHERE user_id = ?',
        [req.user.id]
      );

      let prefs = {};
      if (prefRows.length > 0 && prefRows[0].prefs) {
        try { prefs = JSON.parse(prefRows[0].prefs); } catch (e) { /* ignore */ }
      }

      prefs[key] = value;

      if (prefRows.length > 0) {
        await pool.query('UPDATE 1ai_users_pref SET prefs = ? WHERE user_id = ?', [JSON.stringify(prefs), req.user.id]);
      } else {
        await pool.query('INSERT INTO 1ai_users_pref (user_id, prefs) VALUES (?, ?)', [req.user.id, JSON.stringify(prefs)]);
      }
    }

    res.json({ message: `${key} updated successfully` });
  } catch (err) {
    console.error('updateIntegration error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * Get white-label config for current user.
 */
async function getWhiteLabel(req, res) {
  const userId = req.user.id;
  const [rows] = await pool.query('SELECT * FROM 1ai_white_label WHERE user_id = ?', [userId]);
  const config = rows[0] || {
    brand_name: '',
    logo_url: '',
    primary_color: '#6366f1',
    custom_domain: '',
    hide_branding: 0,
  };
  res.json({ data: config });
}

/**
 * Save white-label config (upsert).
 */
async function saveWhiteLabel(req, res) {
  const userId = req.user.id;
  const { brand_name, logo_url, primary_color, custom_domain, hide_branding } = req.body || {};
  const now = Math.floor(Date.now() / 1000);
  await pool.query(
    `INSERT INTO 1ai_white_label (user_id, brand_name, logo_url, primary_color, custom_domain, hide_branding, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE brand_name = VALUES(brand_name), logo_url = VALUES(logo_url),
       primary_color = VALUES(primary_color), custom_domain = VALUES(custom_domain),
       hide_branding = VALUES(hide_branding), updated_at = VALUES(updated_at)`,
    [userId, brand_name || null, logo_url || null, primary_color || '#6366f1', custom_domain || null, hide_branding ? 1 : 0, now, now]
  );
  res.json({ success: true });
}

module.exports = {
  getProfile,
  updateProfile,
  generateApiKey,
  removeApiKey,
  getIntegrations,
  updateIntegration,
  getPostback,
  updatePostback,
  getWhiteLabel,
  saveWhiteLabel,
};