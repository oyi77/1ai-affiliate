'use strict';

/**
 * Socket.IO event handlers.
 *
 * Events:
 *   'register'  — userId + topics → join private room + persist channel
 *   disconnect  — remove channel record
 *
 * Attached from app.js via:
 *   io.on('connection', socket => { … });
 */

const wsService = require('../services/webSocketService');

/**
 * Wire all socket event handlers for a single socket connection.
 * @param {import('socket.io').Socket} socket
 */
function registerHandlers(socket) {
  // ---- register: associate socket with a user and topics ----
  socket.on('register', async ({ userId, topics, channelType } = {}) => {
    if (!userId) return;

    const ct = channelType || 'socket';
    const tpc = Array.isArray(topics) ? topics : [];

    // persist in DB
    try {
      await wsService.registerChannel(userId, socket.id, ct, tpc);
    } catch (err) {
      socket.emit('error', { message: 'Failed to register channel' });
      return;
    }

    // join private room for direct messaging
    socket.join(`user:${userId}`);

    // store userId on socket for disconnect cleanup
    socket.data.userId = userId;

    // acknowledge
    socket.emit('registered', { channel: socket.id });
  });

  // ---- disconnect: clean up channel ----
  socket.on('disconnect', async () => {
    try {
      await wsService.removeChannel(socket.id);
    } catch {
      // best-effort cleanup
    }
  });
}

module.exports = { registerHandlers };
