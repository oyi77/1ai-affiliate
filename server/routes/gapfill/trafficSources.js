/**
 * Gapfill Routes - Traffic Sources & Deep Links
 * Routes for traffic sources, deep links, landing pages, and conversion log.
 */

const express = require('express');
const router = express.Router();
const pool = require('../../db/mysql');

const { substitutePostbackMacros } = require('./helpers');

// ── GET /traffic-sources ──────────────────────────────────────────────
router.get('/traffic-sources', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, name, category AS type, is_active AS status, platform_type, cost_model, created_at FROM 1ai_traffic_sources ORDER BY created_at DESC'
    );
    res.json({ data: rows });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch traffic sources', detail: err.message });
  }
});

// ── GET /deep-links ───────────────────────────────────────────────────
router.get('/deep-links', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM deep_link_pages ORDER BY id DESC'
    );
    res.json({ data: rows });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch deep links', detail: err.message });
  }
});

// ── GET /landing-pages ────────────────────────────────────────────────
router.get('/landing-pages', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT landing_page_id, user_id, landing_page_url, landing_page_status FROM landing_pages ORDER BY landing_page_id DESC'
    );
    res.json({ data: rows });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch landing pages', detail: err.message });
  }
});

// ── GET /conversion-log ───────────────────────────────────────────────
router.get('/conversion-log', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT cl.conversion_id, cl.click_id, cl.aff_campaign_id, ac.aff_campaign_name, cl.conversion_time FROM 1ai_conversion_logs cl LEFT JOIN 1ai_aff_campaigns ac ON ac.aff_campaign_id = cl.aff_campaign_id ORDER BY cl.conversion_time DESC'
    );
    res.json({ data: rows });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch conversion log', detail: err.message });
  }
});

// ── GET /traffic-sources/integrations ───────────────────────────────────
router.get('/traffic-sources/integrations', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT id, name, platform_type as type, is_active as status, postback_url_template as postback_url FROM 1ai_traffic_sources ORDER BY id DESC');
    res.json({ data: rows });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;