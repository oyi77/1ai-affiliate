'use strict';
/**
 * User / affiliate / VIP-profile admin handlers.
 * Split from server/controllers/adminController.js (800-line gate).
 */

const pool = require('../db/mysql');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { queryRows, queryOne, ensureVipTable } = require('./adminShared');

async function getUsers(req, res) {
  try {
    const [rows] = await pool.query(
      `SELECT user_id, user_name, user_email, user_role, user_date_added
       FROM 1ai_users
       ORDER BY user_date_added DESC
       LIMIT 100`
    );
    res.json({ data: rows });
  } catch (err) {
    console.error('getUsers error:', err);
    res.status(500).json({ error: err.message });
  }
}

async function createUser(req, res) {
  try {
    const { email, name, role, password } = req.body;
    if (!email || !password || !role) return res.status(400).json({ error: 'email, password, role required' });
    if (!['admin', 'affiliate', 'advertiser'].includes(role)) return res.status(400).json({ error: 'role must be admin, affiliate, or advertiser' });

    const [existing] = await pool.query('SELECT user_id FROM 1ai_users WHERE user_email = ?', [email]);
    if (existing.length) return res.status(409).json({ error: 'User already exists' });

    const hash = await bcrypt.hash(password, 10);
    const appKey = crypto.randomBytes(16).toString('hex');
    const [result] = await pool.query(
      `INSERT INTO 1ai_users
        (user_name, user_email, user_pass, user_role, user_date_added, user_active,
         user_app_key, clickserver_api_key, install_hash, user_hash, modal_status, vip_perks_status)
      VALUES (?, ?, ?, ?, UNIX_TIMESTAMP(), 1, ?, '', '', '', 0, 0)`,
      [name || email.split('@')[0], email, hash, role, appKey]
    );
    const userId = result.insertId;

    if (role === 'affiliate') {
      const code = (name || email).toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 8) + userId.toString().padStart(4, '0');
      await pool.query(
        'INSERT INTO 1ai_affiliates (user_id, affiliate_code, tier, created_at) VALUES (?, ?, ?, UNIX_TIMESTAMP())',
        [userId, code, 'starter']
      );
      await pool.query('INSERT INTO 1ai_offer_affiliate_access (affiliate_id, offer_id) SELECT a.id, o.id FROM 1ai_affiliates a, 1ai_offers o WHERE a.user_id = ?', [userId]);
    }

    res.json({ success: true, user_id: userId, email, role });
  } catch (err) {
    console.error('createUser error:', err);
    res.status(500).json({ error: err.message });
  }
}

async function getAffiliates(req, res) {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 100, 500);
    const [rows] = await pool.query(
      `SELECT a.*, u.user_email, u.user_name, u.user_date_added
       FROM 1ai_affiliates a
       JOIN 1ai_users u ON a.user_id = u.user_id
       ORDER BY a.created_at DESC
       LIMIT ?`,
      [limit]
    );
    const enriched = rows.map(a => ({
      ...a,
      username: a.user_name || a.user_email,
      joined_at: a.user_date_added,
    }));
    res.json({ data: enriched });
  } catch (err) {
    console.error('getAffiliates error:', err);
    res.status(500).json({ error: err.message });
  }
}

async function getVipProfile(req, res) {
  try {
    await ensureVipTable();
    const profile = await queryOne('SELECT monthly_traffic, primary_vertical, preferred_payout, notes, status, updated_at FROM 1ai_affiliate_vip_profiles WHERE user_id = ?', [req.user.id]);
    const user = await queryOne('SELECT vip_perks_status, install_hash FROM 1ai_users WHERE user_id = ?', [req.user.id]);
    res.json({
      monthly_traffic: profile.monthly_traffic || '',
      primary_vertical: profile.primary_vertical || '',
      preferred_payout: profile.preferred_payout || '',
      notes: profile.notes || '',
      status: profile.status || (user.vip_perks_status ? 'submitted' : 'open'),
      updated_at: profile.updated_at || null,
      install_hash: user.install_hash || null,
    });
  } catch (err) {
    console.error('getVipProfile error:', err);
    res.status(500).json({ error: err.message });
  }
}

async function saveVipProfile(req, res) {
  try {
    await ensureVipTable();
    const monthlyTraffic = String(req.body.monthly_traffic || '').slice(0, 50);
    const primaryVertical = String(req.body.primary_vertical || '').slice(0, 80);
    const preferredPayout = String(req.body.preferred_payout || '').slice(0, 80);
    const notes = String(req.body.notes || '').slice(0, 2000);
    await pool.query(
      `INSERT INTO 1ai_affiliate_vip_profiles (user_id, monthly_traffic, primary_vertical, preferred_payout, notes, status, updated_at)
       VALUES (?, ?, ?, ?, ?, 'submitted', UNIX_TIMESTAMP())
       ON DUPLICATE KEY UPDATE monthly_traffic = VALUES(monthly_traffic), primary_vertical = VALUES(primary_vertical), preferred_payout = VALUES(preferred_payout), notes = VALUES(notes), status = 'submitted', updated_at = UNIX_TIMESTAMP()`,
      [req.user.id, monthlyTraffic, primaryVertical, preferredPayout, notes]
    );
    await queryRows('UPDATE 1ai_users SET vip_perks_status = 1 WHERE user_id = ?', [req.user.id]);
    res.json({ saved: true, status: 'submitted' });
  } catch (err) {
    console.error('saveVipProfile error:', err);
    res.status(500).json({ error: err.message });
  }
}

module.exports = {
  getUsers,
  createUser,
  getAffiliates,
  getVipProfile,
  saveVipProfile,

};
