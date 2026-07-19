'use strict';

/**
 * Landing Page Block routes
 * - GET    /api/landing-page-blocks/pages/:pageId/blocks       — list blocks
 * - POST   /api/landing-page-blocks/pages/:pageId/blocks       — add block
 * - PUT    /api/landing-page-blocks/blocks/:id                 — update block
 * - DELETE /api/landing-page-blocks/blocks/:id                 — delete block
 * - PUT    /api/landing-page-blocks/pages/:pageId/blocks/reorder — reorder blocks
 * - PUT    /api/landing-page-blocks/pages/:pageId/builder-data — update builder/draft data
 * - POST   /api/landing-page-blocks/pages/:pageId/publish      — publish page
 * - GET    /api/landing-page-blocks/pages/:pageId/builder-data — get builder data
 *
 * Mount: app.use('/api', router)
 */

const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { asyncHandler } = require('../utils/asyncHandler');
const svc = require('../services/landingPageBlockService');

// ─── List blocks ────────────────────────────────────────────────────
router.get('/pages/:pageId/blocks', authenticate, asyncHandler(async (req, res) => {
  const pageId = parseInt(req.params.pageId, 10);
  if (!pageId) return res.status(400).json({ error: 'Invalid pageId' });

  const blocks = await svc.getBlocks(pageId);
  res.json({ data: blocks });
}));

// ─── Add block ──────────────────────────────────────────────────────
router.post('/pages/:pageId/blocks', authenticate, asyncHandler(async (req, res) => {
  const pageId = parseInt(req.params.pageId, 10);
  if (!pageId) return res.status(400).json({ error: 'Invalid pageId' });

  const { block_type, block_order, block_config, visibility } = req.body;
  if (!block_type || block_order === undefined) {
    return res.status(400).json({ error: 'block_type and block_order are required' });
  }

  const id = await svc.addBlock(pageId, block_type, block_order, block_config || {}, visibility || {});
  res.status(201).json({ data: { id } });
}));

// ─── Update block ───────────────────────────────────────────────────
router.put('/blocks/:id', authenticate, asyncHandler(async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (!id) return res.status(400).json({ error: 'Invalid block id' });

  const { block_type, block_order, block_config, visibility } = req.body;
  const data = {};
  if (block_type !== undefined) data.block_type = block_type;
  if (block_order !== undefined) data.block_order = block_order;
  if (block_config !== undefined) data.block_config = block_config;
  if (visibility !== undefined) data.visibility = visibility;

  const affected = await svc.updateBlock(id, data);
  if (affected === 0) return res.status(404).json({ error: 'Block not found' });
  res.json({ data: { id } });
}));

// ─── Delete block ───────────────────────────────────────────────────
router.delete('/blocks/:id', authenticate, asyncHandler(async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (!id) return res.status(400).json({ error: 'Invalid block id' });

  const affected = await svc.deleteBlock(id);
  if (affected === 0) return res.status(404).json({ error: 'Block not found' });
  res.json({ data: { id } });
}));

// ─── Reorder blocks ─────────────────────────────────────────────────
router.put('/pages/:pageId/blocks/reorder', authenticate, asyncHandler(async (req, res) => {
  const pageId = parseInt(req.params.pageId, 10);
  if (!pageId) return res.status(400).json({ error: 'Invalid pageId' });

  const { order } = req.body;
  if (!Array.isArray(order) || order.length === 0) {
    return res.status(400).json({ error: 'order array is required' });
  }

  await svc.reorderBlocks(pageId, order);
  res.json({ data: { success: true } });
}));

// ─── Update builder/draft data ──────────────────────────────────────
router.put('/pages/:pageId/builder-data', authenticate, asyncHandler(async (req, res) => {
  const pageId = parseInt(req.params.pageId, 10);
  if (!pageId) return res.status(400).json({ error: 'Invalid pageId' });

  const { builderData, draftData } = req.body;
  if (builderData === undefined || draftData === undefined) {
    return res.status(400).json({ error: 'builderData and draftData are required' });
  }

  const affected = await svc.updatePageBuilderData(pageId, builderData, draftData);
  if (affected === 0) return res.status(404).json({ error: 'Page not found' });
  res.json({ data: { success: true } });
}));

// ─── Publish page ───────────────────────────────────────────────────
router.post('/pages/:pageId/publish', authenticate, asyncHandler(async (req, res) => {
  const pageId = parseInt(req.params.pageId, 10);
  if (!pageId) return res.status(400).json({ error: 'Invalid pageId' });

  const affected = await svc.publishPage(pageId);
  if (affected === 0) return res.status(404).json({ error: 'Page not found' });
  res.json({ data: { success: true } });
}));

// ─── Get builder data ───────────────────────────────────────────────
router.get('/pages/:pageId/builder-data', authenticate, asyncHandler(async (req, res) => {
  const pageId = parseInt(req.params.pageId, 10);
  if (!pageId) return res.status(400).json({ error: 'Invalid pageId' });

  const data = await svc.getPageBuilderData(pageId);
  if (!data) return res.status(404).json({ error: 'Page not found' });
  res.json({ data });
}));

module.exports = router;
