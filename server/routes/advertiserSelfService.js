'use strict';

/**
 * Advertiser Self-Service API
 * Endpoints for advertisers to manage their own offers, view conversions, payouts
 */

const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { requireRole } = require('../middleware/roleMiddleware');
const pool = require('../db/mysql');

// All routes require advertiser role
router.use(authenticate);
router.use(requireRole('advertiser', 'admin'));

/**
 * GET /api/advertiser/dashboard
 * Summary stats for the advertiser
 */
router.get('/dashboard', async (req, res) => {
  try {
    const userId = req.user.id;
    const [[adv]] = await pool.query('SELECT id, company_name, status FROM 1ai_advertisers WHERE user_id = ?', [userId]);
    if (!adv) return res.status(404).json({ error: 'Advertiser profile not found' });

    // Count offers
    const [[offerStats]] = await pool.query(
      'SELECT COUNT(*) as total, SUM(CASE WHEN status = ? THEN 1 ELSE 0 END) as active FROM 1ai_offers WHERE advertiser_id = ?',
      ['active', adv.id]
    );

    // Count conversions for this advertiser's offers
    const [[convStats]] = await pool.query(
      `SELECT COUNT(*) as total, SUM(CASE WHEN cl.status = 'approved' THEN 1 ELSE 0 END) as approved,
              SUM(CASE WHEN cl.status = 'pending' THEN 1 ELSE 0 END) as pending,
              COALESCE(SUM(cl.network_payout_snapshot), 0) as total_payout
       FROM 1ai_conversion_logs cl
       JOIN 1ai_offers o ON o.id = cl.aff_campaign_id
       WHERE o.advertiser_id = ?`,
      [adv.id]
    );

    // Recent clicks on advertiser's offers
    const [[clickStats]] = await pool.query(
      `SELECT COUNT(*) as total_clicks FROM 1ai_clicks c
       JOIN 1ai_aff_campaigns ac ON ac.aff_campaign_id = c.aff_campaign_id
       WHERE ac.aff_campaign_id IN (SELECT id FROM 1ai_offers WHERE advertiser_id = ?)`,
      [adv.id]
    );

    res.json({
      data: {
        advertiser: adv,
        offers: { total: offerStats.total || 0, active: offerStats.active || 0 },
        conversions: {
          total: convStats.total || 0,
          approved: convStats.approved || 0,
          pending: convStats.pending || 0,
          total_payout: parseFloat(convStats.total_payout || 0),
        },
        clicks: { total: clickStats.total_clicks || 0 },
      }
    });
  } catch (err) {
    console.error('Advertiser dashboard error:', err.message);
    res.status(500).json({ error: 'Failed to load dashboard' });
  }
});

/**
 * GET /api/advertiser/offers
 * List offers belonging to this advertiser
 */
router.get('/offers', async (req, res) => {
  try {
    const userId = req.user.id;
    const [[adv]] = await pool.query('SELECT id FROM 1ai_advertisers WHERE user_id = ?', [userId]);
    if (!adv) return res.json({ data: [] });

    const [offers] = await pool.query(
      `SELECT o.*,
              (SELECT COUNT(*) FROM 1ai_conversion_logs cl WHERE cl.aff_campaign_id = o.id) as conversion_count,
              (SELECT COALESCE(SUM(cl.network_payout_snapshot), 0) FROM 1ai_conversion_logs cl WHERE cl.aff_campaign_id = o.id) as total_revenue
       FROM 1ai_offers o WHERE o.advertiser_id = ? ORDER BY o.created_at DESC`,
      [adv.id]
    );
    res.json({ data: offers });
  } catch (err) {
    console.error('Advertiser offers error:', err.message);
    res.status(500).json({ error: 'Failed to fetch offers' });
  }
});

/**
 * POST /api/advertiser/offers
 * Create a new offer (advertiser self-service)
 */
router.post('/offers', async (req, res) => {
  try {
    const userId = req.user.id;
    const [[adv]] = await pool.query('SELECT id FROM 1ai_advertisers WHERE user_id = ?', [userId]);
    if (!adv) return res.status(403).json({ error: 'Advertiser profile not found' });

    const { name, affiliate_url, type, payout, payout_currency, vertical, geo, notes, cap_daily } = req.body;
    if (!name) return res.status(400).json({ error: 'Offer name is required' });

    const [result] = await pool.query(
      `INSERT INTO 1ai_offers (name, advertiser_id, affiliate_url, type, payout, payout_currency, vertical, geo, notes, cap_daily, status, approval_status, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active', 'pending', UNIX_TIMESTAMP(), UNIX_TIMESTAMP())`,
      [name, adv.id, affiliate_url || null, type || 'CPA', payout || 0, payout_currency || 'USD', vertical || null, geo || 'Global', notes || null, cap_daily || null]
    );

    res.status(201).json({ data: { id: result.insertId, name }, message: 'Offer created. Pending admin approval.' });
  } catch (err) {
    console.error('Advertiser create offer error:', err.message);
    res.status(500).json({ error: 'Failed to create offer' });
  }
});

/**
 * GET /api/advertiser/conversions
 * View conversions for advertiser's offers
 */
router.get('/conversions', async (req, res) => {
  try {
    const userId = req.user.id;
    const [[adv]] = await pool.query('SELECT id FROM 1ai_advertisers WHERE user_id = ?', [userId]);
    if (!adv) return res.json({ data: [] });

    const limit = Math.min(parseInt(req.query.limit) || 50, 200);
    const status = req.query.status; // pending, approved, rejected

    let where = 'o.advertiser_id = ?';
    const params = [adv.id];
    if (status) { where += ' AND cl.status = ?'; params.push(status); }

    const [conversions] = await pool.query(
      `SELECT cl.conversion_id, cl.click_id, cl.conversion_time, cl.network_payout_snapshot,
              cl.affiliate_payout_snapshot, cl.status, cl.affiliate_status,
              o.name as offer_name, o.id as offer_id
       FROM 1ai_conversion_logs cl
       JOIN 1ai_offers o ON o.id = cl.aff_campaign_id
       WHERE ${where}
       ORDER BY cl.conversion_time DESC LIMIT ?`,
      [...params, limit]
    );
    res.json({ data: conversions });
  } catch (err) {
    console.error('Advertiser conversions error:', err.message);
    res.status(500).json({ error: 'Failed to fetch conversions' });
  }
});

/**
 * POST /api/advertiser/conversions/:id/approve
 * Approve a conversion
 */
router.post('/conversions/:id/approve', async (req, res) => {
  try {
    const userId = req.user.id;
    const [[adv]] = await pool.query('SELECT id FROM 1ai_advertisers WHERE user_id = ?', [userId]);
    if (!adv) return res.status(403).json({ error: 'Advertiser profile not found' });

    // Verify the conversion belongs to this advertiser
    const [[conv]] = await pool.query(
      `SELECT cl.conversion_id FROM 1ai_conversion_logs cl
       JOIN 1ai_offers o ON o.id = cl.aff_campaign_id
       WHERE cl.conversion_id = ? AND o.advertiser_id = ?`,
      [req.params.id, adv.id]
    );
    if (!conv) return res.status(404).json({ error: 'Conversion not found' });

    await pool.query(
      `UPDATE 1ai_conversion_logs SET status = 'approved', approved_by = ?, approved_at = UNIX_TIMESTAMP() WHERE conversion_id = ?`,
      [userId, req.params.id]
    );
    res.json({ message: 'Conversion approved' });
  } catch (err) {
    console.error('Approve conversion error:', err.message);
    res.status(500).json({ error: 'Failed to approve conversion' });
  }
});

/**
 * POST /api/advertiser/conversions/:id/reject
 * Reject a conversion
 */
router.post('/conversions/:id/reject', async (req, res) => {
  try {
    const userId = req.user.id;
    const [[adv]] = await pool.query('SELECT id FROM 1ai_advertisers WHERE user_id = ?', [userId]);
    if (!adv) return res.status(403).json({ error: 'Advertiser profile not found' });

    const [[conv]] = await pool.query(
      `SELECT cl.conversion_id FROM 1ai_conversion_logs cl
       JOIN 1ai_offers o ON o.id = cl.aff_campaign_id
       WHERE cl.conversion_id = ? AND o.advertiser_id = ?`,
      [req.params.id, adv.id]
    );
    if (!conv) return res.status(404).json({ error: 'Conversion not found' });

    await pool.query(
      `UPDATE 1ai_conversion_logs SET status = 'rejected', reject_reason = ?, approved_by = ?, approved_at = UNIX_TIMESTAMP() WHERE conversion_id = ?`,
      [req.body.reason || 'Rejected by advertiser', userId, req.params.id]
    );
    res.json({ message: 'Conversion rejected' });
  } catch (err) {
    console.error('Reject conversion error:', err.message);
    res.status(500).json({ error: 'Failed to reject conversion' });
  }
});

/**
 * POST /api/advertiser/conversions/batch-approve
 * Batch approve multiple conversions
 */
router.post('/conversions/batch-approve', async (req, res) => {
  try {
    const userId = req.user.id;
    const [[adv]] = await pool.query('SELECT id FROM 1ai_advertisers WHERE user_id = ?', [userId]);
    if (!adv) return res.status(403).json({ error: 'Advertiser profile not found' });

    const { ids } = req.body;
    if (!ids || !Array.isArray(ids) || ids.length === 0) return res.status(400).json({ error: 'ids array required' });

    const [result] = await pool.query(
      `UPDATE 1ai_conversion_logs SET status = 'approved', approved_by = ?, approved_at = UNIX_TIMESTAMP()
       WHERE conversion_id IN (?) AND aff_campaign_id IN (SELECT id FROM 1ai_offers WHERE advertiser_id = ?)`,
      [userId, ids, adv.id]
    );
    res.json({ message: `${result.affectedRows} conversions approved` });
  } catch (err) {
    console.error('Batch approve error:', err.message);
    res.status(500).json({ error: 'Failed to batch approve' });
  }
});

/**
 * GET /api/advertiser/payouts
 * View payout history
 */
router.get('/payouts', async (req, res) => {
  try {
    const userId = req.user.id;
    const [[adv]] = await pool.query('SELECT id FROM 1ai_advertisers WHERE user_id = ?', [userId]);
    if (!adv) return res.json({ data: [] });

    const [payouts] = await pool.query(
      'SELECT * FROM 1ai_advertiser_payouts WHERE advertiser_id = ? ORDER BY created_at DESC LIMIT 50',
      [adv.id]
    ).catch(() => [[]]); // Table may not exist yet

    res.json({ data: payouts });
  } catch (err) {
    console.error('Advertiser payouts error:', err.message);
    res.status(500).json({ error: 'Failed to fetch payouts' });
  }
});

/**
 * GET /api/advertiser/profile
 * Get advertiser profile
 */
router.get('/profile', async (req, res) => {
  try {
    const userId = req.user.id;
    const [[adv]] = await pool.query(
      'SELECT id, user_id, company_name, website, status, platform_type, commission_type, default_commission_rate, logo_url, notes FROM 1ai_advertisers WHERE user_id = ?',
      [userId]
    );
    if (!adv) return res.status(404).json({ error: 'Advertiser profile not found' });
    res.json({ data: adv });
  } catch (err) {
    console.error('Advertiser profile error:', err.message);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

/**
 * PUT /api/advertiser/profile
 * Update advertiser profile
 */
router.put('/profile', async (req, res) => {
  try {
    const userId = req.user.id;
    const { company_name, website, notes } = req.body;

    await pool.query(
      'UPDATE 1ai_advertisers SET company_name = COALESCE(?, company_name), website = COALESCE(?, website), notes = COALESCE(?, notes), updated_at = UNIX_TIMESTAMP() WHERE user_id = ?',
      [company_name || null, website || null, notes || null, userId]
    );
    res.json({ message: 'Profile updated' });
  } catch (err) {
    console.error('Advertiser profile update error:', err.message);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

module.exports = router;
