'use strict';

const express = require('express');
const router = express.Router();
const { success, error } = require('../utils/apiResponse');
const { asyncHandler } = require('../utils/asyncHandler');
const { authenticate } = require('../middleware/auth');
const aiTrafficService = require('../services/aiTrafficService');

// GET /api/ai-traffic/rules — list rules for authenticated affiliate
router.get('/rules', authenticate, asyncHandler(async (req, res) => {
  const rules = await aiTrafficService.getRules(req.user.id);
  res.json({ data: rules });
}));

// POST /api/ai-traffic/rules — create a new rule
router.post('/rules', authenticate, asyncHandler(async (req, res) => {
  const { name, rule_type, conditions, actions, priority } = req.body;
  if (!name || !rule_type) {
    return error(res, 'name and rule_type are required', 400);
  }
  const id = await aiTrafficService.createRule(
    req.user.id, name, rule_type, conditions || null, actions || null, priority || 0
  );
  res.status(201).json({ data: { id } });
}));

// GET /api/ai-traffic/rules/:id — get a single rule
router.get('/rules/:id', authenticate, asyncHandler(async (req, res) => {
  const rule = await aiTrafficService.getRule(parseInt(req.params.id, 10));
  if (!rule) return error(res, 'Rule not found', 404);
  res.json({ data: rule });
}));

// PUT /api/ai-traffic/rules/:id — update a rule
router.put('/rules/:id', authenticate, asyncHandler(async (req, res) => {
  const { name, rule_type, conditions, actions, priority, status } = req.body;
  const affected = await aiTrafficService.updateRule(parseInt(req.params.id, 10), {
    name, rule_type, conditions, actions, priority, status,
  });
  if (!affected) return error(res, 'Rule not found', 404);
  res.json({ data: { id: parseInt(req.params.id, 10) } });
}));

// DELETE /api/ai-traffic/rules/:id — soft delete (archive)
router.delete('/rules/:id', authenticate, asyncHandler(async (req, res) => {
  const affected = await aiTrafficService.deleteRule(parseInt(req.params.id, 10));
  if (!affected) return error(res, 'Rule not found', 404);
  res.json({ data: { id: parseInt(req.params.id, 10) } });
}));

// GET /api/ai-traffic/rules/:id/logs — get traffic logs for a rule
router.get('/rules/:id/logs', authenticate, asyncHandler(async (req, res) => {
  const limit = parseInt(req.query.limit, 10) || 50;
  const logs = await aiTrafficService.getLogs(parseInt(req.params.id, 10), limit);
  res.json({ data: logs });
}));

module.exports = router;
