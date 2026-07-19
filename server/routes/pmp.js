'use strict';

const express = require('express');
const router = express.Router();
const { authenticate, requireAdmin } = require('../middleware/auth');
const { asyncHandler } = require('../utils/asyncHandler');
const svc = require('../services/pmpService');

// ── Static routes before parameterized ──────────────────────────────────────

/**
 * GET /api/pmp/deals
 * List PMP deals. Admin sees all; advertisers see their own.
 */
router.get('/deals', authenticate, asyncHandler(async (req, res) => {
  const advertiserId = req.user.role === 'admin' ? null : req.user.id;
  const rows = await svc.getDeals(advertiserId);
  res.json({ data: rows });
}));

/**
 * POST /api/pmp/deals
 * Create a new PMP deal.
 */
router.post('/deals', authenticate, asyncHandler(async (req, res) => {
  const { name, deal_type, deal_id, price, price_model, inventory_source, targeting, budget, start_date, end_date } = req.body;
  if (!name || !deal_type || !deal_id) {
    return res.status(400).json({ error: 'name, deal_type, and deal_id are required' });
  }
  const id = await svc.createDeal(
    req.user.id,
    name,
    deal_type,
    deal_id,
    price || 0,
    price_model || 'cpm',
    inventory_source || 'direct',
    targeting || {},
    budget || 0,
    start_date || 0,
    end_date || 0
  );
  res.status(201).json({ data: { id } });
}));

/**
 * GET /api/pmp/deals/active/list
 * List all active PMP deals.
 */
router.get('/deals/active/list', authenticate, asyncHandler(async (req, res) => {
  const rows = await svc.getActiveDeals();
  res.json({ data: rows });
}));

// ── Parameterized routes ────────────────────────────────────────────────────

/**
 * GET /api/pmp/deals/:id
 * Get a single PMP deal.
 */
router.get('/deals/:id', authenticate, asyncHandler(async (req, res) => {
  const id = parseInt(req.params.id, 10);
  const deal = await svc.getDeal(id);
  if (!deal) return res.status(404).json({ error: 'Not found' });
  res.json({ data: deal });
}));

/**
 * PUT /api/pmp/deals/:id
 * Update a PMP deal. Admin only.
 */
router.put('/deals/:id', authenticate, requireAdmin, asyncHandler(async (req, res) => {
  const id = parseInt(req.params.id, 10);
  const affected = await svc.updateDeal(id, req.body);
  if (affected === 0) return res.status(404).json({ error: 'Not found' });
  res.json({ success: true });
}));

/**
 * POST /api/pmp/deals/:id/inventory
 * Add inventory to a PMP deal.
 */
router.post('/deals/:id/inventory', authenticate, asyncHandler(async (req, res) => {
  const dealId = parseInt(req.params.id, 10);
  const { offer_id, floor_price, cap } = req.body;
  if (!offer_id) {
    return res.status(400).json({ error: 'offer_id is required' });
  }
  const id = await svc.addInventory(dealId, offer_id, floor_price || 0, cap || 0);
  res.status(201).json({ data: { id } });
}));

/**
 * GET /api/pmp/deals/:id/inventory
 * List inventory for a PMP deal.
 */
router.get('/deals/:id/inventory', authenticate, asyncHandler(async (req, res) => {
  const dealId = parseInt(req.params.id, 10);
  const rows = await svc.getInventory(dealId);
  res.json({ data: rows });
}));

/**
 * DELETE /api/pmp/inventory/:id
 * Remove (pause) an inventory item.
 */
router.delete('/inventory/:id', authenticate, asyncHandler(async (req, res) => {
  const id = parseInt(req.params.id, 10);
  const affected = await svc.removeInventory(id);
  if (affected === 0) return res.status(404).json({ error: 'Not found' });
  res.json({ success: true });
}));

module.exports = router;
