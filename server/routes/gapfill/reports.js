'use strict';
/**
 * Gapfill Routes - Reports
 * Split from server/routes/gapfill.js (800-line gate).
 */

const express = require('express');
const router = express.Router();
const pool = require('../../db/mysql');


// ── Reports: Conversions ───────────────────────────────────────────
router.get('/reports/conversions', async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(parseInt(req.query.limit) || 50, 200);
    const offset = (page - 1) * limit;
    const [rows] = await pool.query(
      `SELECT c.*, o.name as offer_name, a.user_name as affiliate_name
       FROM 1ai_conversions c
       LEFT JOIN 1ai_offers o ON c.offer_id = o.id
       LEFT JOIN 1ai_affiliates af ON c.affiliate_id = af.id
       LEFT JOIN 1ai_users a ON af.user_id = a.user_id
       ORDER BY c.id DESC LIMIT ? OFFSET ?`,
      [limit, offset]
    );
    const [[{ total }]] = await pool.query('SELECT COUNT(*) as total FROM 1ai_conversions');
    res.json({ data: rows, pagination: { page, limit, total } });
  } catch (err) { res.status(500).json({ error: err.message }); }
});



// ── Reports: Clicks ────────────────────────────────────────────────
router.get('/reports/clicks', async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(parseInt(req.query.limit) || 50, 200);
    const offset = (page - 1) * limit;
    const [rows] = await pool.query(
      `SELECT cl.click_id as id, cl.click_time, cl.aff_campaign_id, cl.click_payout, cl.click_ip,
              ac.aff_campaign_name as campaign_name
       FROM 1ai_clicks cl
       LEFT JOIN 1ai_aff_campaigns ac ON cl.aff_campaign_id = ac.aff_campaign_id
       ORDER BY cl.click_id DESC LIMIT ? OFFSET ?`,
      [limit, offset]
    );
    const [[{ total }]] = await pool.query('SELECT COUNT(*) as total FROM 1ai_clicks');
    res.json({ data: rows, pagination: { page, limit, total } });
  } catch (err) { res.status(500).json({ error: err.message }); }
});


// ── Reports: Ad Performance (Laporan Iklan) ────────────────────────
router.get('/reports/ads', async (req, res) => {
  try {
    const dateFrom = req.query.date_from || new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0];
    const dateTo = req.query.date_to || new Date().toISOString().split('T')[0];
    const [rows] = await pool.query(
      `SELECT o.name as campaign_name,
              COALESCE(click_counts.clicks, 0) as clicks,
              COUNT(DISTINCT cv.id) as conversions,
              COALESCE(SUM(cv.revenue), 0) as revenue,
              COALESCE(SUM(cv.payout), 0) as payout
       FROM 1ai_offers o
       LEFT JOIN 1ai_conversions cv ON cv.offer_id = o.id AND cv.created_at >= UNIX_TIMESTAMP(?) AND cv.created_at <= UNIX_TIMESTAMP(?)
       LEFT JOIN (
         SELECT ac.aff_campaign_id, COUNT(cl.click_id) as clicks
         FROM 1ai_clicks cl
         JOIN 1ai_aff_campaigns ac ON cl.aff_campaign_id = ac.aff_campaign_id
         WHERE cl.click_time >= UNIX_TIMESTAMP(?) AND cl.click_time <= UNIX_TIMESTAMP(?)
         GROUP BY ac.aff_campaign_id
       ) click_counts ON click_counts.aff_campaign_id = o.id
       GROUP BY o.id, o.name, click_counts.clicks ORDER BY clicks DESC`,
      [dateFrom, dateTo + ' 23:59:59', dateFrom, dateTo + ' 23:59:59']
    );
    res.json({ data: rows, date_from: dateFrom, date_to: dateTo });
  } catch (err) { res.status(500).json({ error: err.message }); }
});


// ── Reports: Daily Analytics ───────────────────────────────────────
router.get('/reports/daily', async (req, res) => {
  try {
    const dateFrom = req.query.date_from || new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0];
    const dateTo = req.query.date_to || new Date().toISOString().split('T')[0];
    const [rows] = await pool.query(
      `SELECT DATE(FROM_UNIXTIME(click_time)) as date,
              COUNT(*) as clicks,
              COUNT(DISTINCT aff_campaign_id) as campaigns
       FROM 1ai_clicks
       WHERE click_time >= UNIX_TIMESTAMP(?) AND click_time <= UNIX_TIMESTAMP(?)
       GROUP BY DATE(FROM_UNIXTIME(click_time))
       ORDER BY date DESC`,
      [dateFrom, dateTo + ' 23:59:59']
    );
    res.json({ data: rows, date_from: dateFrom, date_to: dateTo });
  } catch (err) { res.status(500).json({ error: err.message }); }
});


// ── Reports: Taglink ───────────────────────────────────────────────
router.get('/reports/taglink', async (req, res) => {
  try {
    const dateFrom = req.query.date_from || new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0];
    const dateTo = req.query.date_to || new Date().toISOString().split('T')[0];
    const [rows] = await pool.query(
      `SELECT tm.taglink as tag, tm.offer_id, o.name as offer_name,
              tm.meta_campaign_name, tm.status
       FROM 1ai_taglink_mappings tm
       LEFT JOIN 1ai_offers o ON tm.offer_id = o.id
       ORDER BY tm.id DESC LIMIT 100`
    );
    res.json({ data: rows });
  } catch (err) { res.status(500).json({ error: err.message }); }
});



// ── Reports: Orders (Laporan Order) ───────────────────────────────
router.get('/reports/orders', async (req, res) => {
  try {
    const dateFrom = req.query.date_from || new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0];
    const dateTo = req.query.date_to || new Date().toISOString().split('T')[0];
    const [rows] = await pool.query(
      `SELECT cv.id, cv.click_id, o.name as campaign_name, cv.payout, cv.revenue, cv.status, cv.created_at
       FROM 1ai_conversions cv
       LEFT JOIN 1ai_offers o ON cv.offer_id = o.id
       WHERE cv.created_at >= UNIX_TIMESTAMP(?) AND cv.created_at <= UNIX_TIMESTAMP(?)
       ORDER BY cv.id DESC LIMIT 100`,
      [dateFrom, dateTo + ' 23:59:59']
    );
    res.json({ data: rows });
  } catch (err) { res.status(500).json({ error: err.message }); }
});



// ── Advertiser Payouts (Laporan Pembayaran) ────────────────────────
router.get('/advertisers/:id/payouts', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT id, user_id, reference, amount, status, tripay_ref, created_at, paid_at
       FROM 1ai_affiliate_payments ORDER BY id DESC LIMIT 100`
    );
    res.json({ data: rows });
  } catch (err) { res.status(500).json({ error: err.message }); }
});


router.post('/advertisers/:id/payouts', async (req, res) => {
  try {
    const { user_id, amount, reference } = req.body;
    if (!user_id || !amount) return res.status(400).json({ error: 'user_id and amount required' });
    const ref = reference || `PAY-${new Date().toISOString().slice(0,10).replace(/-/g,'')}-${Math.random().toString(36).slice(2,8).toUpperCase()}`;
    const [result] = await pool.query(
      `INSERT INTO 1ai_affiliate_payments (user_id, reference, amount, status, created_at) VALUES (?, ?, ?, 'pending', UNIX_TIMESTAMP())`,
      [user_id, ref, amount]
    );
    res.status(201).json({ id: result.insertId, reference: ref });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
