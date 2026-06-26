'use strict';

/**
 * Offer Browser API — For affiliates to browse approved offers.
 * 
 * This is different from the admin offers endpoint:
 * - Only shows APPROVED offers (approval_status = 'approved')
 * - Only shows ACTIVE offers (status = 'active')
 * - Includes offer details relevant to affiliates (payout, geo, vertical)
 * - Includes "Generate Link" functionality
 */

const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const pool = require('../db/mysql');
const crypto = require('crypto');

// All routes require authentication
router.use(authenticate);

/**
 * GET /api/offers
 * Browse approved offers (for affiliates)
 */
router.get('/', async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 50, 200);
    const offset = parseInt(req.query.offset) || 0;
    const vertical = req.query.vertical;
    const geo = req.query.geo;
    const search = req.query.search;

    let where = "o.status = 'active' AND o.approval_status = 'approved'";
    const params = [];

    if (vertical) { where += ' AND o.vertical = ?'; params.push(vertical); }
    if (geo) { where += ' AND (o.geo = ? OR o.geo = "Global")'; params.push(geo); }
    if (search) { where += ' AND o.name LIKE ?'; params.push(`%${search}%`); }

    const [offers] = await pool.query(
      `SELECT o.id, o.name, o.type, o.payout, o.payout_currency, o.vertical, o.geo,
              o.notes, o.cap_daily, o.affiliate_url, o.product_image_url,
              a.company_name as advertiser_name,
              (SELECT COUNT(*) FROM 1ai_affiliate_links al WHERE al.offer_id = o.id) as affiliate_count,
              (SELECT COUNT(*) FROM 1ai_conversion_logs cl WHERE cl.aff_campaign_id = o.id) as total_conversions
       FROM 1ai_offers o
       LEFT JOIN 1ai_advertisers a ON a.id = o.advertiser_id
       WHERE ${where}
       ORDER BY o.payout DESC, o.created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    const [[{ total }]] = await pool.query(
      `SELECT COUNT(*) as total FROM 1ai_offers o WHERE ${where}`,
      params
    );

    res.json({ data: offers, total, limit, offset });
  } catch (err) {
    console.error('Offer browser error:', err.message);
    res.status(500).json({ error: 'Failed to fetch offers' });
  }
});

/**
 * GET /api/offers/:id
 * Get offer details (for affiliates)
 */
router.get('/:id', async (req, res) => {
  try {
    const [[offer]] = await pool.query(
      `SELECT o.id, o.name, o.type, o.payout, o.payout_currency, o.vertical, o.geo,
              o.notes, o.cap_daily, o.affiliate_url, o.product_image_url, o.traffic_allowed,
              a.company_name as advertiser_name
       FROM 1ai_offers o
       LEFT JOIN 1ai_advertisers a ON a.id = o.advertiser_id
       WHERE o.id = ? AND o.status = 'active' AND o.approval_status = 'approved'`,
      [req.params.id]
    );

    if (!offer) return res.status(404).json({ error: 'Offer not found' });

    // Get affiliate's existing links for this offer
    const userId = req.user.id;
    const [[aff]] = await pool.query('SELECT id, affiliate_code FROM 1ai_affiliates WHERE user_id = ?', [userId]);
    
    let existingLinks = [];
    if (aff) {
      [existingLinks] = await pool.query(
        'SELECT id, slug, clicks, conversions, created_at FROM 1ai_affiliate_links WHERE offer_id = ? AND affiliate_id = ?',
        [offer.id, aff.id]
      );
    }

    res.json({ data: { ...offer, existing_links: existingLinks, affiliate_code: aff?.affiliate_code } });
  } catch (err) {
    console.error('Offer detail error:', err.message);
    res.status(500).json({ error: 'Failed to fetch offer details' });
  }
});

/**
 * POST /api/offers/:id/generate-link
 * Generate a tracking link for an offer
 */
router.post('/:id/generate-link', async (req, res) => {
  try {
    const userId = req.user.id;
    const [[aff]] = await pool.query('SELECT id, affiliate_code FROM 1ai_affiliates WHERE user_id = ?', [userId]);
    if (!aff) return res.status(403).json({ error: 'Affiliate profile not found' });

    // Verify offer exists and is approved
    const [[offer]] = await pool.query(
      `SELECT id, name, affiliate_url, status, approval_status FROM 1ai_offers WHERE id = ? AND status = 'active' AND approval_status = 'approved'`,
      [req.params.id]
    );
    if (!offer) return res.status(404).json({ error: 'Offer not found or not approved' });

    // Check if affiliate already has a link for this offer
    const [[existing]] = await pool.query(
      'SELECT id, slug FROM 1ai_affiliate_links WHERE offer_id = ? AND affiliate_id = ?',
      [offer.id, aff.id]
    );
    if (existing) {
      return res.json({ data: { slug: existing.slug, offer_id: offer.id, offer_name: offer.name } });
    }

    // Generate unique slug
    const slug = crypto.randomBytes(4).toString('base64url');
    const linkToken = crypto.randomBytes(16).toString('hex');

    // Create affiliate link
    const [result] = await pool.query(
      `INSERT INTO 1ai_affiliate_links (affiliate_id, offer_id, slug, link_token, clicks, conversions, status, created_at)
       VALUES (?, ?, ?, ?, 0, 0, 'active', UNIX_TIMESTAMP())`,
      [aff.id, offer.id, slug, linkToken]
    );

    res.status(201).json({
      data: {
        id: result.insertId,
        slug,
        offer_id: offer.id,
        offer_name: offer.name,
        tracking_url: `https://track.berkahkarya.org/go/${slug}`,
      }
    });
  } catch (err) {
    console.error('Generate link error:', err.message);
    res.status(500).json({ error: 'Failed to generate link' });
  }
});

/**
 * GET /api/offers/categories
 * Get available verticals/categories
 */
router.get('/meta/categories', async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT DISTINCT vertical FROM 1ai_offers WHERE status = 'active' AND approval_status = 'approved' AND vertical IS NOT NULL ORDER BY vertical"
    );
    res.json({ data: rows.map(r => r.vertical) });
  } catch (err) {
    res.json({ data: [] });
  }
});

module.exports = router;
