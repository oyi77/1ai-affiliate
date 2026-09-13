/**
 * Gapfill Routes - Reports (Laporan)
 * Routes for laporan-iklan, analytic-harian, laporan-taglink, laporan-order.
 */

const express = require('express');
const router = express.Router();
const pool = require('../../db/mysql');

// ── GET /laporan-iklan ────────────────────────────────────────────────
router.get('/laporan-iklan', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT
        c.aff_campaign_id,
        ac.aff_campaign_name,
        COUNT(c.click_id) AS clicks,
        COALESCE(SUM(cl.conversions), 0) AS conversions,
        COALESCE(SUM(c.click_payout), 0) AS payout
      FROM 1ai_clicks c
      LEFT JOIN 1ai_aff_campaigns ac ON ac.aff_campaign_id = c.aff_campaign_id
      LEFT JOIN (
        SELECT aff_campaign_id, COUNT(*) AS conversions
        FROM 1ai_conversion_logs
        GROUP BY aff_campaign_id
      ) cl ON cl.aff_campaign_id = c.aff_campaign_id
      GROUP BY c.aff_campaign_id, ac.aff_campaign_name
      ORDER BY clicks DESC
    `);
    res.json({ data: rows });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch laporan iklan', detail: err.message });
  }
});

// ── GET /analytic-harian ──────────────────────────────────────────────
router.get('/analytic-harian', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT
        DATE(FROM_UNIXTIME(c.click_time)) AS date,
        COUNT(c.click_id) AS clicks,
        COALESCE(SUM(cl.conversions), 0) AS conversions,
        COALESCE(SUM(c.click_payout), 0) AS payout
      FROM 1ai_clicks c
      LEFT JOIN (
        SELECT DATE(FROM_UNIXTIME(conversion_time)) AS conv_date,
               COUNT(*) AS conversions
        FROM 1ai_conversion_logs
        GROUP BY DATE(FROM_UNIXTIME(conversion_time))
      ) cl ON cl.conv_date = DATE(FROM_UNIXTIME(c.click_time))
      GROUP BY DATE(FROM_UNIXTIME(c.click_time))
      ORDER BY date DESC
    `);
    res.json({ data: rows });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch analytic harian', detail: err.message });
  }
});

// ── GET /laporan-taglink ──────────────────────────────────────────────
router.get('/laporan-taglink', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM 1ai_taglink_mappings ORDER BY id DESC'
    );
    res.json({ data: rows });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch laporan taglink', detail: err.message });
  }
});

// ── GET /laporan-order ────────────────────────────────────────────────
router.get('/laporan-order', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT
        cl.conversion_id,
        cl.click_id,
        cl.aff_campaign_id,
        ac.aff_campaign_name,
        ac.aff_campaign_payout,
        cl.conversion_time
      FROM 1ai_conversion_logs cl
      LEFT JOIN 1ai_aff_campaigns ac ON ac.aff_campaign_id = cl.aff_campaign_id
      ORDER BY cl.conversion_time DESC
    `);
    res.json({ data: rows });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch laporan order', detail: err.message });
  }
});

module.exports = router;