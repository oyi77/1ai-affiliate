/**
 * /api/admin/sub-affiliates — 2-tier sub-affiliate relationship management
 */
const express = require('express');
const router = express.Router();
const { authenticate, requireAdmin } = require('../middleware/auth');
const sub = require('../services/subAffiliateService');

/**
 * POST /api/admin/sub-affiliates
 * Create a sub-affiliate relationship. Requires admin.
 */
router.post('/', authenticate, requireAdmin, async (req, res) => {
  try {
    const { parent_affiliate_id, sub_affiliate_id, commission_rate } = req.body;
    if (!parent_affiliate_id || !sub_affiliate_id) {
      return res.status(400).json({ error: 'parent_affiliate_id and sub_affiliate_id are required' });
    }
    const rate = commission_rate != null ? commission_rate : 10.00;
    const id = await sub.createRelationship(parent_affiliate_id, sub_affiliate_id, rate);
    res.status(201).json({ data: { id } });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'Relationship already exists' });
    }
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/admin/sub-affiliates/:parentId/subs
 * List all sub-affiliates of a parent. Requires admin.
 */
router.get('/:parentId/subs', authenticate, requireAdmin, async (req, res) => {
  try {
    const rows = await sub.getSubAffiliates(parseInt(req.params.parentId));
    res.json({ data: rows });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

/**
 * GET /api/admin/sub-affiliates/:id/earnings
 * Paginated earnings for a sub-affiliate relationship. Requires auth.
 */
router.get('/:id/earnings', authenticate, async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(parseInt(req.query.limit) || 20, 100);
    const result = await sub.getEarnings(parseInt(req.params.id), page, limit);
    res.json({
      data: result.rows,
      page,
      limit,
      total: result.total,
      pages: Math.ceil(result.total / limit),
    });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

/**
 * PUT /api/admin/sub-affiliates/:id
 * Update commission rate or status. Requires admin.
 */
router.put('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { commission_rate, status } = req.body;

    if (commission_rate != null) {
      await sub.updateCommissionRate(id, commission_rate);
    }
    if (status) {
      const { queryUpdate } = require('../utils/queryHelpers');
      const now = Math.floor(Date.now() / 1000);
      await queryUpdate(
        'UPDATE 1ai_sub_affiliates SET status = ?, updated_at = ? WHERE id = ?',
        [status, now, id]
      );
    }

    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
