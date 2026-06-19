'use strict';

const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const registry = require('../services/templateRegistry');

router.use(authenticate);

// GET /api/templates — list all templates grouped by entity type
router.get('/', (req, res) => {
  res.json({ data: registry.getAll() });
});

// GET /api/templates/:entityType — list templates for an entity type
router.get('/:entityType', (req, res) => {
  const templates = registry.list(req.params.entityType);
  res.json({ data: templates });
});

// GET /api/templates/:entityType/:templateId — get one template
router.get('/:entityType/:templateId', (req, res) => {
  const tpl = registry.get(req.params.entityType, req.params.templateId);
  if (!tpl) return res.status(404).json({ error: 'Template not found' });
  res.json({ data: tpl });
});

// POST /api/templates/:entityType/:templateId/apply — apply template defaults to values
router.post('/:entityType/:templateId/apply', (req, res) => {
  const result = registry.apply(req.params.entityType, req.params.templateId, req.body);
  const validation = registry.validate(req.params.entityType, req.params.templateId, result);
  res.json({ data: result, validation });
});

module.exports = router;
