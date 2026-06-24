/**
 * Content Integration Routes
 * 
 * Handles requests from 1ai-content and 1ai-social for affiliate link generation.
 */

const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const pool = require('../db/mysql');
const { authenticate } = require('../middleware/auth');

// ══════════════════════════════════════════════════════════════════════
// Inter-service Auth Middleware
// ══════════════════════════════════════════════════════════════════════

function verifyServiceAuth(req, res, next) {
  const serviceKey = req.headers['x-service-key'];
  const serviceName = req.headers['x-service-name'];
  const timestamp = req.headers['x-timestamp'];

  const expectedKey = process.env.ECOSYSTEM_API_KEY || '';
  
  if (!expectedKey) {
    return res.status(500).json({ error: 'ECOSYSTEM_API_KEY not configured' });
  }

  if (serviceKey !== expectedKey) {
    return res.status(401).json({ error: 'Invalid service key' });
  }

  if (!['1ai-content', '1ai-social'].includes(serviceName)) {
    return res.status(401).json({ error: 'Invalid service name' });
  }

  // Check timestamp (5 minute tolerance)
  const ts = parseInt(timestamp);
  if (isNaN(ts) || Math.abs(Date.now() - ts) > 300_000) {
    return res.status(401).json({ error: 'Request expired' });
  }

  next();
}

// ══════════════════════════════════════════════════════════════════════
// Routes
// ══════════════════════════════════════════════════════════════════════

/**
 * POST /api/affiliate/generate-link
 * Generate tracking link for content publishing
 */
router.post('/generate-link', verifyServiceAuth, async (req, res) => {
  try {
    const { user_id, destination_url, campaign_id, platform, sub_id } = req.body;
    
    const trackingId = uuidv4();
    if (!process.env.TRACKING_URL) return res.status(500).json({ error: 'TRACKING_URL not configured' });
    const trackingUrl = `${process.env.TRACKING_URL}/${trackingId}`;
    
    // Store tracking link in database
    await pool.query(
      `INSERT INTO tracking_links (tracking_id, user_id, destination_url, campaign_id, platform, sub_id, created_at)
       VALUES (?, ?, ?, ?, ?, ?, NOW())`,
      [trackingId, user_id, destination_url, campaign_id || null, platform || null, sub_id || null]
    );

    res.json({
      tracking_id: trackingId,
      tracking_url: trackingUrl,
      short_url: trackingUrl,
    });
  } catch (error) {
    console.error('Failed to generate tracking link:', error);
    res.status(500).json({ error: 'Failed to generate tracking link' });
  }
});

/**
 * POST /api/affiliate/conversion
 * Receive conversion events from social media platforms
 */
router.post('/conversion', verifyServiceAuth, async (req, res) => {
  try {
    const {
      tracking_id,
      user_id,
      conversion_type,
      revenue,
      currency,
      commission,
      campaign_id,
      platform,
      metadata,
    } = req.body;

    // Store conversion event
    await pool.query(
      `INSERT INTO conversions (tracking_id, user_id, conversion_type, revenue, currency, commission, campaign_id, platform, metadata, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [tracking_id, user_id, conversion_type, revenue || 0, currency || 'IDR', commission || 0, campaign_id || null, platform || null, JSON.stringify(metadata || {})]
    );

    // Update click count
    await pool.query(
      `UPDATE tracking_links SET click_count = click_count + 1 WHERE tracking_id = ?`,
      [tracking_id]
    );

    // Notify 1ai-content about conversion
    if (commission > 0) {
      const contentServiceUrl = process.env.CONTENT_SERVICE_URL || 'http://127.0.0.1:3000';
      const contentServiceKey = process.env.CONTENT_SERVICE_KEY || '';
      
      try {
        await fetch(`${contentServiceUrl}/webhook/conversion-update`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Service-Key': contentServiceKey,
            'X-Service-Name': '1ai-affiliate',
            'X-Timestamp': Date.now().toString(),
          },
          body: JSON.stringify({
            click_id: tracking_id,
            tracking_id,
            user_id,
            conversion_type,
            revenue,
            currency,
            commission,
            campaign_id,
            platform,
            metadata,
          }),
        });
      } catch (err) {
        console.error('Failed to notify 1ai-content:', err);
      }
    }

    res.json({
      accepted: true,
      conversion_id: `conv_${Date.now()}`,
    });
  } catch (error) {
    console.error('Failed to process conversion:', error);
    res.status(500).json({ accepted: false, error: 'Internal error' });
  }
});

/**
 * GET /api/affiliate/campaigns
 * List CPA campaigns
 */
router.get('/campaigns', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT * FROM campaigns WHERE status = 'active' ORDER BY created_at DESC`
    );
    
    res.json({
      campaigns: rows,
      total: rows.length,
    });
  } catch (error) {
    console.error('Failed to list campaigns:', error);
    res.status(500).json({ error: 'Failed to list campaigns' });
  }
});

/**
 * GET /api/affiliate/analytics
 * Get affiliate analytics
 */
router.get('/analytics', async (req, res) => {
  try {
    const { user_id, start_date, end_date } = req.query;
    
    const [rows] = await pool.query(
      `SELECT 
         conversion_type,
         COUNT(*) as count,
         SUM(revenue) as total_revenue,
         SUM(commission) as total_commission
       FROM conversions
       WHERE user_id = ?
         AND created_at BETWEEN ? AND ?
       GROUP BY conversion_type`,
      [user_id, start_date || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), end_date || new Date().toISOString()]
    );
    
    res.json({
      analytics: rows,
      user_id,
    });
  } catch (error) {
    console.error('Failed to get analytics:', error);
    res.status(500).json({ error: 'Failed to get analytics' });
  }
});

/**
 * GET /api/affiliate/health
 * Health check for content integration
 */
/**
 * GET /api/affiliate/stats
 * Affiliate dashboard stats (clicks, earnings, conversions)
 */
router.get('/stats', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const [[aff]] = await pool.query('SELECT id, balance FROM 1ai_affiliates WHERE user_id = ?', [userId]);
    if (!aff) return res.json({ data: { totalClicks: 0, totalConversions: 0, totalEarnings: 0, conversionRate: 0 } });

    const [[clicks]] = await pool.query('SELECT COUNT(*) as cnt FROM 1ai_clicks');
    const [[conversions]] = await pool.query('SELECT COUNT(*) as cnt FROM 1ai_conversion_logs WHERE affiliate_id = ?', [aff.id]);
    const [[earnings]] = await pool.query('SELECT COALESCE(SUM(affiliate_payout_snapshot), 0) as total FROM 1ai_conversion_logs WHERE affiliate_id = ?', [aff.id]);

    res.json({
      data: {
        totalClicks: clicks?.cnt || 0,
        totalConversions: conversions?.cnt || 0,
        totalEarnings: earnings?.total || aff.balance || 0,
        conversionRate: clicks?.cnt ? ((conversions?.cnt || 0) / clicks.cnt * 100).toFixed(2) : 0,
      }
    });
  } catch (error) {
    console.error('Affiliate stats error:', error.message);
    res.status(500).json({ error: 'Failed to fetch affiliate stats' });
  }
});

/**
 * GET /api/affiliate/links
 * Affiliate's tracking links
 */
router.get('/links', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const [[aff]] = await pool.query('SELECT id, affiliate_code FROM 1ai_affiliates WHERE user_id = ?', [userId]);
    if (!aff) return res.json({ data: [] });

    const [links] = await pool.query(
      `SELECT c.aff_campaign_id as id, c.aff_campaign_name as name,
              c.aff_campaign_status as status, c.aff_campaign_payout as payout,
              COUNT(cl.click_id) as clicks
       FROM 1ai_aff_campaigns c
       LEFT JOIN 1ai_clicks cl ON cl.aff_campaign_id = c.aff_campaign_id
       GROUP BY c.aff_campaign_id
       ORDER BY c.aff_campaign_id DESC LIMIT 50`
    );
    res.json({ data: links });
  } catch (error) {
    console.error('Affiliate links error:', error.message);
    res.status(500).json({ error: 'Failed to fetch affiliate links' });
  }
});

/**
 * GET /api/affiliate/earnings
 * Affiliate's earnings history
 */
router.get('/earnings', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const [[aff]] = await pool.query('SELECT id FROM 1ai_affiliates WHERE user_id = ?', [userId]);
    if (!aff) return res.json({ data: [] });

    const [earnings] = await pool.query(
      `SELECT cl.conversion_id as id, cl.conversion_time as date,
              cl.affiliate_payout_snapshot as amount, cl.status,
              ac.aff_campaign_name as campaign
       FROM 1ai_conversion_logs cl
       LEFT JOIN 1ai_aff_campaigns ac ON ac.aff_campaign_id = cl.aff_campaign_id
       WHERE cl.affiliate_id = ?
       ORDER BY cl.conversion_time DESC LIMIT 50`,
      [aff.id]
    );
    res.json({ data: earnings });
  } catch (error) {
    console.error('Affiliate earnings error:', error.message);
    res.status(500).json({ error: 'Failed to fetch affiliate earnings' });
  }
});
router.get('/health', (req, res) => {
  res.json({ status: 'healthy', service: 'content-integration' });
});

module.exports = router;
