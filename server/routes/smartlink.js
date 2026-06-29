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
      'SELECT category, offer_id, geo, priority FROM 1ai_category_offer_map WHERE is_active = 1 ORDER BY category, priority'
    );
    res.json({ data: rows });
  } catch (err) {
    console.error('category-mapping error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Parameterized route LAST
router.get('/:hash', routeTrafficByHash);

module.exports = router;
