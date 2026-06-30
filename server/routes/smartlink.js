const express = require('express');
const router = express.Router();
const pool = require('../db/mysql');
const { routeTrafficByHash, generateSmartlink, listSmartlinks, recordConversion, getSmartlinkStats } = require('../controllers/smartlinkController');
const { authenticate } = require('../middleware/auth');

// Static routes MUST come before /:hash parameterized route
router.post('/generate', authenticate, generateSmartlink);
router.get('/list', authenticate, listSmartlinks);
router.post('/convert', authenticate, recordConversion);
router.get('/stats', authenticate, getSmartlinkStats);

// GET /api/smartlink/category-mapping — return category→offer mapping from DB
router.get('/category-mapping', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, category, offer_id, geo, priority FROM 1ai_category_offer_map WHERE is_active = 1 ORDER BY category, priority'
    );
    res.json({ data: rows });
  } catch (err) {
    console.error('category-mapping error:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/smartlink/platform-ranges — list all active IP ranges
router.get('/platform-ranges', async (req, res) => {
  try {
    const { platform, range_type } = req.query;
    let sql = 'SELECT id, platform, range_type, ip_range, description, is_active, created_at, updated_at FROM 1ai_platform_ip_ranges WHERE 1=1';
    const params = [];
    if (platform) {
      sql += ' AND platform = ?';
      params.push(platform);
    }
    if (range_type) {
      sql += ' AND range_type = ?';
      params.push(range_type);
    }
    sql += ' ORDER BY platform, range_type, ip_range';
    const [rows] = await pool.query(sql, params);
    res.json({ data: rows });
  } catch (err) {
    console.error('platform-ranges list error:', err);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/smartlink/platform-ranges — add a new IP range
router.post('/platform-ranges', authenticate, async (req, res) => {
  try {
    const { platform, range_type, ip_range, description } = req.body;
    if (!platform || !ip_range) {
      return res.status(400).json({ error: 'platform and ip_range are required' });
    }
    const type = range_type || 'reviewer';
    const [result] = await pool.query(
      'INSERT INTO 1ai_platform_ip_ranges (platform, range_type, ip_range, description) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE description = VALUES(description), is_active = 1',
      [platform, type, ip_range, description || '']
    );
    res.json({ data: { id: result.insertId, platform, range_type: type, ip_range, description: description || '' } });
  } catch (err) {
    console.error('platform-ranges add error:', err);
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/smartlink/platform-ranges/:id — soft-delete an IP range
router.delete('/platform-ranges/:id', authenticate, async (req, res) => {
  try {
    const [result] = await pool.query(
      'UPDATE 1ai_platform_ip_ranges SET is_active = 0 WHERE id = ?',
      [req.params.id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Range not found' });
    }
    res.json({ data: { id: Number(req.params.id), deleted: true } });
  } catch (err) {
    console.error('platform-ranges delete error:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/smartlink/auto-map — auto-discover offers and suggest category mappings
router.get('/auto-map', async (req, res) => {
  try {
    const [offers] = await pool.query(
      "SELECT id, name, vertical, geo, affiliate_url FROM 1ai_offers WHERE status = 'active' AND affiliate_url IS NOT NULL AND affiliate_url != ''"
    );
    const [existing] = await pool.query('SELECT category, offer_id FROM 1ai_category_offer_map WHERE is_active = 1');
    const mappedOfferIds = new Set(existing.map(r => r.offer_id));

    const CATEGORY_KEYWORDS = {
      'fashion': ['fashion', 'clothing', 'outfit', 'wear', 'dress', 'kaos', 'baju'],
      'fashion muslim': ['muslim', 'modest', 'hijab', 'kerudung', 'jilbab', 'ds modest'],
      'fashion anak': ['kids', 'anak', 'baby', 'children', 'kaos anak'],
      'fashion pria': ['men', 'pria', 'mens', 'puma', 'adidas'],
      'hijab': ['hijab', 'kerudung', 'jilbab'],
      'kesehatan': ['health', 'herbal', 'supplement', 'vitamin', 'sehat', 'obat', 'kesehatan', 'skincare', 'sunscreen', 'azarine'],
      'trading': ['trading', 'fx', 'forex', 'crypto', 'dashboard', 'bot', 'phantomfx'],
      'home living': ['home', 'living', 'furniture', 'rak', 'dapur', 'kitchen', 'interior', 'vhome'],
      'perabotan': ['appliance', 'alat', 'elektronik', 'rak', 'dapur', 'kitchen'],
      'kecantikan': ['beauty', 'kecantikan', 'makeup', 'kosmetik', 'kiehl', 'lancome', 'skincare'],
    };

    const suggestions = [];
    for (const offer of offers) {
      const nameLower = (offer.name || '').toLowerCase();
      const vertLower = (offer.vertical || '').toLowerCase();
      const combined = nameLower + ' ' + vertLower;

      for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
        const matched = keywords.filter(kw => combined.includes(kw));
        if (matched.length > 0 && !mappedOfferIds.has(offer.id)) {
          suggestions.push({
            offer_id: offer.id,
            offer_name: offer.name,
            vertical: offer.vertical,
            geo: offer.geo,
            suggested_category: category,
            match_score: matched.length,
            keywords_matched: matched,
          });
        }
      }
    }
    suggestions.sort((a, b) => b.match_score - a.match_score);

    res.json({
      data: {
        unmapped_offers: offers.filter(o => !mappedOfferIds.has(o.id)).length,
        total_offers: offers.length,
        existing_mappings: existing.length,
        suggestions,
      }
    });
  } catch (err) {
    console.error('auto-map error:', err);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/smartlink/auto-map/apply — apply a mapping suggestion
router.post('/auto-map/apply', authenticate, async (req, res) => {
  try {
    const { offer_id, category, geo, priority } = req.body;
    if (!offer_id || !category) return res.status(400).json({ error: 'offer_id and category required' });
    await pool.query(
      'INSERT INTO 1ai_category_offer_map (category, offer_id, geo, priority) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE geo=VALUES(geo), priority=VALUES(priority)',
      [String(category).toLowerCase(), offer_id, geo || 'ID', priority || 1]
    );
    res.json({ success: true, category: String(category).toLowerCase(), offer_id });
  } catch (err) {
    console.error('auto-map apply error:', err);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/smartlink/category-mapping — add a new category→offer mapping
router.post('/category-mapping', authenticate, async (req, res) => {
  try {
    const { category, offer_id, geo, priority } = req.body;
    if (!category || !offer_id) return res.status(400).json({ error: 'category and offer_id are required' });
    await pool.query(
      'INSERT INTO 1ai_category_offer_map (category, offer_id, geo, priority) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE geo=VALUES(geo), priority=VALUES(priority), is_active=1',
      [String(category).toLowerCase(), offer_id, geo || 'ID', priority || 1]
    );
    res.json({ success: true, category: String(category).toLowerCase(), offer_id, geo: geo || 'ID', priority: priority || 1 });
  } catch (err) {
    console.error('category-mapping POST error:', err);
    res.status(500).json({ error: err.message });
  }
});
// PUT /api/smartlink/category-mapping/:id — update an existing category mapping
router.put('/category-mapping/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { category, geo, priority } = req.body;
    if (!category) return res.status(400).json({ error: 'category is required' });
    const [result] = await pool.query(
      'UPDATE 1ai_category_offer_map SET category = ?, geo = ?, priority = ? WHERE id = ? AND is_active = 1',
      [String(category).toLowerCase(), geo || 'ID', priority || 1, id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Mapping not found' });
    }
    res.json({ success: true, id: Number(id), category: String(category).toLowerCase(), geo: geo || 'ID', priority: priority || 1 });
  } catch (err) {
    console.error('category-mapping PUT error:', err);
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/smartlink/category-mapping/:id — soft-delete a category mapping
router.delete('/category-mapping/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await pool.query(
      'UPDATE 1ai_category_offer_map SET is_active = 0 WHERE id = ?',
      [id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Mapping not found' });
    }
    res.json({ success: true });
  } catch (err) {
    console.error('category-mapping DELETE error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Parameterized route LAST
router.get('/:hash', routeTrafficByHash);

module.exports = router;
