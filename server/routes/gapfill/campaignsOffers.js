/**
 * Gapfill Routes - Campaigns & Offers
 * Routes for campaigns/:id, offers/pending, offers/:id.
 */

const express = require('express');
const router = express.Router();
const pool = require('../../db/mysql');

// ── GET /campaigns/:id ──────────────────────────────────────────────
router.get('/campaigns/:id', async (req, res) => {
  try {
    const [[row]] = await pool.query('SELECT * FROM 1ai_aff_campaigns WHERE aff_campaign_id = ?', [req.params.id]);
    if (!row) return res.status(404).json({ error: 'Campaign not found' });
    res.json(row);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── GET /offers/pending — admin sees pending applications ───────────
router.get('/offers/pending', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT oaa.id, oaa.offer_id, oaa.affiliate_id, oaa.status, oaa.created_at,
              o.name AS offer_name, u.user_name AS affiliate_name
       FROM 1ai_offer_affiliate_access oaa
       JOIN 1ai_offers o ON o.id = oaa.offer_id
       JOIN 1ai_affiliates a ON a.id = oaa.affiliate_id
       JOIN 1ai_users u ON u.user_id = a.user_id
       WHERE oaa.status = 'pending'
       ORDER BY oaa.created_at DESC`
    );
    res.json({ data: rows });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch pending applications', detail: err.message });
  }
});

// ── GET /offers/:id ─────────────────────────────────────────────────
router.get('/offers/:id', async (req, res) => {
  try {
    const [[row]] = await pool.query('SELECT * FROM 1ai_offers WHERE id = ?', [req.params.id]);
    if (!row) return res.status(404).json({ error: 'Offer not found' });
    res.json(row);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;