'use strict';

const express = require('express');
const router = express.Router();

const { asyncHandler } = require('../utils/asyncHandler');
const { success, error } = require('../utils/apiResponse');
const { authenticate, requireAdmin } = require('../middleware/auth');
const wsService = require('../services/webSocketService');

// All routes require authentication
router.use(authenticate);

/**
 * GET /api/notifications
 * Fetch notifications for current user from the queue.
 */
router.get('/', asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const notifs = await wsService.getOfflineNotifications(userId);
  return success(res, { data: notifs, count: notifs.length });
}));

/**
 * PUT /api/notifications/:id/read
 * Mark a single notification as read.
 */
router.put('/:id/read', asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const notifId = parseInt(req.params.id, 10);
  if (!notifId) return error(res, 'Invalid notification id', 400);

  await wsService.markRead(notifId, userId);
  return success(res, { success: true });
}));

/**
 * PUT /api/notifications/read-all
 * Mark all notifications for current user as read.
 */
router.put('/read-all', asyncHandler(async (req, res) => {
  const userId = req.user.id;
  await wsService.markAllRead(userId);
  return success(res, { success: true });
}));

/**
 * POST /api/notifications/send
 * Admin-only: push a notification to one user or all subscribers of a topic.
 * Body: { userId?, topic?, title, body?, payload? }
 *   - If userId given → send to that user
 *   - If topic given → broadcast to all topic subscribers
 *   - One of userId or topic is required
 */
router.post('/send', requireAdmin, asyncHandler(async (req, res) => {
  const { userId, topic, title, body, payload } = req.body;

  if (!title) return error(res, 'title is required', 400);
  if (!userId && !topic) return error(res, 'userId or topic is required', 400);

  const io = req.app.get('io');

  if (userId) {
    await wsService.sendToUser(userId, topic || 'admin', title, body, payload, io);
  } else {
    await wsService.sendToTopic(topic, title, body, payload, io);
  }

  return success(res, { success: true });
}));

module.exports = router;
