const express = require('express');
const router = express.Router();
const settings = require('../services/settingsService');
const { authenticate } = require('../middleware/auth');

// GET /api/settings/public — returns all settings (safe for frontend)
router.get('/public', async (req, res) => {
  try {
    const all = await settings.getAll();
    // Only expose safe keys to the frontend
    const safe = {
      brand_name: all.brand_name,
      support_email: all.support_email,
      smartlink_domain: all.smartlink_domain,
      deeplink_domain: all.deeplink_domain,
      click_domain: all.click_domain,
      landing_domain: all.landing_domain,
      app_domain: all.app_domain,
      status_page_url: all.status_page_url,
      changelog_url: all.changelog_url,
      community_url: all.community_url,
      default_currency: all.default_currency,
    };
    res.json({ success: true, data: safe });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/settings/admin — returns all settings (admin only)
router.get('/admin', authenticate, async (req, res) => {
  try {
    const all = await settings.getAll();
    const schema = settings.getSchema();
    const data = Object.entries(schema).map(([key, spec]) => ({
      key,
      value: all[key] || '',
      env_fallback: spec.env,
      default: spec.default,
    }));
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PUT /api/settings/admin — update settings (admin only)
router.put('/admin', authenticate, async (req, res) => {
  try {
    const entries = req.body;
    if (!entries || typeof entries !== 'object') {
      return res.status(400).json({ success: false, error: 'Request body must be an object' });
    }
    await settings.setMany(entries);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
