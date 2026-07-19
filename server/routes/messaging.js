const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { asyncHandler } = require('../utils/asyncHandler');
const svc = require('../services/messagingService');

// GET /api/messaging/conversations — list conversations for current user
router.get('/conversations', authenticate, asyncHandler(async (req, res) => {
  const rows = await svc.getConversations(req.user.id);
  res.json({ data: rows });
}));

// POST /api/messaging/conversations — create a new conversation
router.post('/conversations', authenticate, asyncHandler(async (req, res) => {
  const { subject, participants } = req.body;
  if (!subject || !participants) {
    return res.status(400).json({ error: 'subject and participants required' });
  }
  const id = await svc.createConversation(subject, participants);
  res.status(201).json({ data: { id } });
}));

// GET /api/messaging/conversations/:id — get single conversation
router.get('/conversations/:id', authenticate, asyncHandler(async (req, res) => {
  const row = await svc.getConversation(req.params.id);
  if (!row) return res.status(404).json({ error: 'Conversation not found' });
  res.json({ data: row });
}));

router.post('/conversations/:id/messages', authenticate, asyncHandler(async (req, res) => {
  const { body } = req.body;
  if (!body) return res.status(400).json({ error: 'body required' });
  const id = await svc.sendMessage(req.params.id, req.user.id, body);
  res.status(201).json({ data: { id } });
}));

// GET /api/messaging/conversations/:id/messages — get messages (paginated)
router.get('/conversations/:id/messages', authenticate, asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 50;
  if (page < 1) return res.status(400).json({ error: 'page must be >= 1' });
  if (limit < 1 || limit > 200) return res.status(400).json({ error: 'limit must be 1-200' });
  const rows = await svc.getMessages(req.params.id, page, limit);
  res.json({ data: rows });
}));

router.post('/messages/:id/read', authenticate, asyncHandler(async (req, res) => {
  await svc.markRead(req.params.id, req.user.id);
  res.json({ success: true });
}));

// POST /api/messaging/conversations/:id/close — close a conversation
router.post('/conversations/:id/close', authenticate, asyncHandler(async (req, res) => {
  await svc.closeConversation(req.params.id);
  res.json({ success: true });
}));

module.exports = router;
