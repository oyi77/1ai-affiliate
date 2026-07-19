'use strict';

const express = require('express');
const router = express.Router();
const { success, error } = require('../utils/apiResponse');
const { asyncHandler } = require('../utils/asyncHandler');
const { authenticate, requireAdmin } = require('../middleware/auth');
const sdkService = require('../services/mobileSdkService');

// POST /api/sdk/apps — register a new SDK app
router.post('/apps', authenticate, asyncHandler(async (req, res) => {
  const { app_name, app_package, platform } = req.body;
  if (!app_name || !app_package || !platform) {
    return error(res, 'app_name, app_package, and platform are required', 400);
  }
  const result = await sdkService.registerApp(req.user.id, app_name, app_package, platform);
  success(res, { data: result }, 201);
}));

// GET /api/sdk/apps — list SDK apps for the authenticated affiliate
router.get('/apps', authenticate, asyncHandler(async (req, res) => {
  const apps = await sdkService.listApps(req.user.id);
  success(res, { data: apps });
}));

// GET /api/sdk/apps/:id — get a specific SDK app
router.get('/apps/:id', authenticate, asyncHandler(async (req, res) => {
  const app = await sdkService.getAppById(parseInt(req.params.id, 10));
  if (!app) return error(res, 'App not found', 404);
  success(res, { data: app });
}));

// POST /api/sdk/apps/:id/revoke — revoke an SDK app (admin only)
router.post('/apps/:id/revoke', authenticate, requireAdmin, asyncHandler(async (req, res) => {
  const affected = await sdkService.revokeApp(parseInt(req.params.id, 10));
  if (!affected) return error(res, 'App not found', 404);
  success(res, { success: true });
}));

// POST /api/sdk/events — create an SDK event
// Validates the app identity via X-API-Key header
router.post('/events', authenticate, asyncHandler(async (req, res) => {
  const apiKey = req.headers['x-api-key'];
  if (!apiKey) {
    return error(res, 'X-API-Key header is required', 400);
  }

  const app = await sdkService.getAppByApiKey(apiKey);
  if (!app) return error(res, 'Invalid API key', 400);
  if (app.status !== 'active') return error(res, 'App is not active', 400);

  const { event_type, event_data, device_id, advertising_id } = req.body;
  if (!event_type) return error(res, 'event_type is required', 400);

  const ipAddress = req.ip || (req.connection && req.connection.remoteAddress) || null;
  const userAgent = req.headers['user-agent'] || null;

  const eventId = await sdkService.createEvent(
    app.id, event_type, event_data || null,
    device_id || null, advertising_id || null,
    ipAddress, userAgent
  );

  success(res, { data: { id: eventId } }, 201);
}));

module.exports = router;
