'use strict';
/**
 * Gapfill Routes - Third-Party Integrations (Taglinks, Shopee, Meta, TrackPro, Traffic Rules)
 * Split from server/routes/gapfill.js (800-line gate).
 */

const express = require('express');
const router = express.Router();
const pool = require('../../db/mysql');



// ── Campaign Taglinks CRUD ──────────────────────────────────────
router.get('/campaign-taglinks', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM 1ai_campaign_taglinks ORDER BY id DESC');
    res.json({ data: rows });
  } catch (err) { res.status(500).json({ error: err.message }); }
});


router.post('/campaign-taglinks', async (req, res) => {
  try {
    const { campaign_name, taglink, source, notes } = req.body;
    if (!campaign_name || !taglink) return res.status(400).json({ error: 'campaign_name and taglink required' });
    const [result] = await pool.query(
      'INSERT INTO 1ai_campaign_taglinks (campaign_name, taglink, source, notes) VALUES (?, ?, ?, ?)',
      [campaign_name, taglink, source || 'manual', notes || null]
    );
    res.json({ success: true, id: result.insertId });
  } catch (err) { res.status(500).json({ error: err.message }); }
});


router.delete('/campaign-taglinks/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM 1ai_campaign_taglinks WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});


// ── Shopee Payouts CRUD ─────────────────────────────────────────
router.get('/shopee-payouts', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM 1ai_shopee_payouts ORDER BY id DESC');
    res.json({ data: rows });
  } catch (err) { res.status(500).json({ error: err.message }); }
});


router.post('/shopee-payouts', async (req, res) => {
  try {
    const { amount, shopee_account, report_id, issued_date, notes } = req.body;
    if (!amount) return res.status(400).json({ error: 'amount required' });
    const [result] = await pool.query(
      "INSERT INTO 1ai_shopee_payouts (amount, shopee_account, report_id, status, issued_date, notes, created_at) VALUES (?, ?, ?, 'pending', ?, ?, UNIX_TIMESTAMP())",
      [amount, shopee_account || null, report_id || null, issued_date || null, notes || null]
    );
    res.json({ success: true, id: result.insertId });
  } catch (err) { res.status(500).json({ error: err.message }); }
});


router.post('/shopee-payouts/:id/pay', async (req, res) => {
  try {
    await pool.query("UPDATE 1ai_shopee_payouts SET status='paid', paid_date=CURDATE() WHERE id=?", [req.params.id]);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});


// ── Meta Accounts CRUD ───────────────────────────────────────────
router.get('/meta-accounts', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM 1ai_meta_accounts ORDER BY id DESC');
    res.json({ data: rows });
  } catch (err) { res.status(500).json({ error: err.message }); }
});


router.post('/meta-accounts', async (req, res) => {
  try {
    const { act_id, account_name, access_token } = req.body;
    if (!act_id) return res.status(400).json({ error: 'act_id required' });
    const [result] = await pool.query(
      "INSERT INTO 1ai_meta_accounts (user_id, act_id, account_name, access_token, created_at) VALUES (?, ?, ?, ?, UNIX_TIMESTAMP())",
      [req.user.id, act_id, account_name || null, access_token || null]
    );
    res.json({ success: true, id: result.insertId });
  } catch (err) { res.status(500).json({ error: err.message }); }
});



// ── TrackPro Sync ─────────────────────────────────────────────────
router.get('/trackpro/status', async (req, res) => {
  try {
    const trackproService = require('../services/trackproService');
    const status = await trackproService.getSyncStatus();
    res.json({ data: status });
  } catch (err) { res.status(500).json({ error: err.message }); }
});


router.post('/trackpro/sync', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ error: 'TrackPro credentials required' });
    const trackproService = require('../services/trackproService');
    const scraped = await trackproService.scrapeTrackPro({ username, password });
    const imported = await trackproService.importTrackProData(scraped);
    res.json({ success: true, dashboard: scraped.dashboard, imported, scrapedAt: scraped.scrapedAt });
  } catch (err) {
    console.error('TrackPro sync error:', err);
    res.status(500).json({ error: err.message });
  }
});


router.get('/trackpro/data', async (req, res) => {
  try {
    const [spend] = await pool.query('SELECT date, campaign_name, spend, clicks FROM 1ai_daily_spend ORDER BY date DESC LIMIT 30');
    const [payouts] = await pool.query('SELECT * FROM 1ai_shopee_payouts ORDER BY id DESC LIMIT 20');
    const [meta] = await pool.query('SELECT act_id, account_name, balance, status FROM 1ai_meta_accounts ORDER BY id DESC');
    const [taglinks] = await pool.query('SELECT * FROM 1ai_campaign_taglinks ORDER BY id DESC LIMIT 20');
    res.json({ data: { spend, payouts, metaAccounts: meta, taglinks } });
  } catch (err) { res.status(500).json({ error: err.message }); }
});



// ── Traffic Rules CRUD ─────────────────────────────────────────────
router.get('/traffic-rules', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT r.*, o.name as offer_name FROM 1ai_traffic_rules r
       LEFT JOIN 1ai_offers o ON r.offer_id = o.id
       WHERE r.user_id = ? ORDER BY r.priority DESC, r.id DESC`,
      [req.user.id]
    );
    for (const r of rows) {
      if (typeof r.conditions === 'string') { try { r.conditions = JSON.parse(r.conditions); } catch {} }
    }
    res.json({ data: rows });
  } catch (err) { res.status(500).json({ error: err.message }); }
});


router.post('/traffic-rules', async (req, res) => {
  try {
    const { name, offer_id, conditions, action, target_url, landing_page_id, weight, enabled, priority } = req.body;
    if (!name) return res.status(400).json({ error: 'name required' });
    const now = Math.floor(Date.now() / 1000);
    const [result] = await pool.query(
      `INSERT INTO 1ai_traffic_rules (user_id, name, offer_id, conditions, action, target_url, landing_page_id, weight, enabled, priority, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [req.user.id, name, offer_id || null, JSON.stringify(conditions || {}), action || 'redirect', target_url || null, landing_page_id || null, weight || 100, enabled !== false ? 1 : 0, priority || 0, now, now]
    );
    res.status(201).json({ id: result.insertId });
  } catch (err) { res.status(500).json({ error: err.message }); }
});


router.patch('/traffic-rules/:id', async (req, res) => {
  try {
    const { name, offer_id, conditions, action, target_url, landing_page_id, weight, enabled, priority } = req.body;
    const now = Math.floor(Date.now() / 1000);
    const fields = [];
    const params = [];
    if (name !== undefined) { fields.push('name = ?'); params.push(name); }
    if (offer_id !== undefined) { fields.push('offer_id = ?'); params.push(offer_id); }
    if (conditions !== undefined) { fields.push('conditions = ?'); params.push(JSON.stringify(conditions)); }
    if (action !== undefined) { fields.push('action = ?'); params.push(action); }
    if (target_url !== undefined) { fields.push('target_url = ?'); params.push(target_url); }
    if (landing_page_id !== undefined) { fields.push('landing_page_id = ?'); params.push(landing_page_id); }
    if (weight !== undefined) { fields.push('weight = ?'); params.push(weight); }
    if (enabled !== undefined) { fields.push('enabled = ?'); params.push(enabled ? 1 : 0); }
    if (priority !== undefined) { fields.push('priority = ?'); params.push(priority); }
    fields.push('updated_at = ?'); params.push(now);
    params.push(req.params.id, req.user.id);
    await pool.query(`UPDATE 1ai_traffic_rules SET ${fields.join(', ')} WHERE id = ? AND user_id = ?`, params);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});


router.delete('/traffic-rules/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM 1ai_traffic_rules WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
