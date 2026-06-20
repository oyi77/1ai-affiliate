const pool = require('../db/mysql');
const settings = require('../services/settingsService');

async function listDeepLinks(req, res) {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 50, 200);
    const [rows] = await pool.query(
      'SELECT id, slug, offer_url, title, button_text, accent_color, impressions, clicks, is_active, created_at FROM deep_link_pages WHERE user_id = ? ORDER BY created_at DESC LIMIT ?',
      [req.user.id, limit]
    );
    res.json({ success: true, data: rows });
  } catch (err) {
    console.error('listDeepLinks error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
}

async function createDeepLink(req, res) {
  const { target_url, name, aff_campaign_id } = req.body;
  if (!target_url) return res.status(400).json({ success: false, error: 'target_url required' });

  try {
    const slug = Math.random().toString(36).substring(2, 10) + Math.random().toString(36).substring(2, 6);
    const ts = Math.floor(Date.now() / 1000);
    const [result] = await pool.query(
      'INSERT INTO deep_link_pages (slug, user_id, offer_url, title, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)',
      [slug, req.user.id, target_url, name || 'Deep Link', ts, ts]
    );
    res.json({
      success: true,
      data: {
        id: result.insertId,
        slug,
        url: `https://${await settings.get('deeplink_domain')}/dl/${slug}`,
        target_url,
        name: name || 'Deep Link',
      },
    });
  } catch (err) {
    console.error('createDeepLink error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
}

async function deleteDeepLink(req, res) {
  try {
    const [result] = await pool.query(
      'DELETE FROM deep_link_pages WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ success: false, error: 'Not found' });
    res.json({ success: true });
  } catch (err) {
    console.error('deleteDeepLink error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
}

module.exports = { listDeepLinks, createDeepLink, deleteDeepLink };
