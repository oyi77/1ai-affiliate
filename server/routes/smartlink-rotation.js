const express = require('express');
const router = express.Router();
const pool = require('../db/mysql');
const { authenticate, requireAdmin } = require('../middleware/auth');
const { asyncHandler } = require('../utils/asyncHandler');

router.use('/admin', authenticate);

// POST /api/admin/smartlinks/:id/offers — assign an offer to a smartlink
router.post('/admin/smartlinks/:id/offers', requireAdmin, asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { offer_id, weight, priority } = req.body;
  if (!offer_id) {
    return res.status(400).json({ error: 'offer_id is required' });
  }
  // Verify smartlink exists
  const [sl] = await pool.query('SELECT id FROM 1ai_smartlinks WHERE id = ?', [id]);
  if (!sl.length) return res.status(404).json({ error: 'Smartlink not found' });
  // Verify offer exists
  const [off] = await pool.query('SELECT id FROM 1ai_offers WHERE id = ?', [offer_id]);
  if (!off.length) return res.status(404).json({ error: 'Offer not found' });
  // Upsert assignment
  const now = Math.floor(Date.now() / 1000);
  await pool.query(
    `INSERT INTO 1ai_smartlink_offers (smartlink_id, offer_id, weight, priority, created_at)
     VALUES (?, ?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE weight = VALUES(weight), priority = VALUES(priority)`,
    [id, offer_id, weight || 1, priority || 0, now]
  );
  res.json({ success: true });
}));

// DELETE /api/admin/smartlinks/:id/offers/:offerId — remove offer from smartlink
router.delete('/admin/smartlinks/:id/offers/:offerId', requireAdmin, asyncHandler(async (req, res) => {
  const { id, offerId } = req.params;
  const [delResult] = await pool.query(
    'DELETE FROM 1ai_smartlink_offers WHERE smartlink_id = ? AND offer_id = ?',
    [id, offerId]
  );
  if (!delResult.affectedRows) {
    return res.status(404).json({ error: 'Assignment not found' });
  }
  res.json({ success: true });
}));

// GET /api/admin/smartlinks/:id/offers — list assigned offers
router.get('/admin/smartlinks/:id/offers', requireAdmin, asyncHandler(async (req, res) => {
  const { id } = req.params;
  const [rows] = await pool.query(
    `SELECT slo.id, slo.offer_id, slo.weight, slo.priority, slo.created_at,
            o.name AS offer_name, o.type, o.payout, o.payout_currency, o.status AS offer_status
     FROM 1ai_smartlink_offers slo
     JOIN 1ai_offers o ON o.id = slo.offer_id
     WHERE slo.smartlink_id = ?
     ORDER BY slo.priority ASC, slo.weight DESC`,
    [id]
  );
  // Also fetch rotation config from smartlink
  const [sl] = await pool.query(
    'SELECT rotation_strategy, fallback_offer_id, visitor_rules FROM 1ai_smartlinks WHERE id = ?',
    [id]
  );
  res.json({
    data: rows,
    config: sl.length ? sl[0] : null
  });
}));

// PUT /api/admin/smartlinks/:id/rotation — update rotation strategy
router.put('/admin/smartlinks/:id/rotation', requireAdmin, asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { rotation_strategy, fallback_offer_id, visitor_rules } = req.body;
  const valid = ['weighted', 'round_robin', 'random', 'priority'];
  if (rotation_strategy && !valid.includes(rotation_strategy)) {
    return res.status(400).json({ error: `Invalid strategy. Must be one of: ${valid.join(', ')}` });
  }
  // If fallback_offer_id is provided, verify it exists
  if (fallback_offer_id) {
    const [off] = await pool.query('SELECT id FROM 1ai_offers WHERE id = ?', [fallback_offer_id]);
    if (!off.length) return res.status(404).json({ error: 'Fallback offer not found' });
  }
  const sets = [];
  const params = [];
  if (rotation_strategy !== undefined) {
    sets.push('rotation_strategy = ?');
    params.push(rotation_strategy);
  }
  if (fallback_offer_id !== undefined) {
    sets.push('fallback_offer_id = ?');
    params.push(fallback_offer_id);
  }
  if (visitor_rules !== undefined) {
    sets.push('visitor_rules = ?');
    // Ensure string values are valid JSON for the CHECK (json_valid) constraint
    if (visitor_rules === null) {
      params.push(null);
    } else if (typeof visitor_rules === 'object') {
      params.push(JSON.stringify(visitor_rules));
    } else if (typeof visitor_rules === 'string') {
      // Try to use as-is (caller may have sent a valid JSON string)
      // If it fails JSON_VALID, try double-stringifying
      try { JSON.parse(visitor_rules); params.push(visitor_rules); }
      catch { params.push(JSON.stringify(visitor_rules)); }
    } else {
      params.push(JSON.stringify(visitor_rules));
    }
  }
  if (!sets.length) {
    return res.status(400).json({ error: 'No fields to update' });
  }
  params.push(id);
  await pool.query(`UPDATE 1ai_smartlinks SET ${sets.join(', ')} WHERE id = ?`, params);
  res.json({ success: true });
}));

module.exports = router;
