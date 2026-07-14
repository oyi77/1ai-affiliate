'use strict';

/**
 * WebSocket Notification Service
 *
 * Manages Socket.IO channels, online/offline delivery, and notification queue.
 * Used by socket handlers and REST route handlers.
 *
 * Tables:
 *   - 1ai_notification_channels — maps userId → socket(s) + subscribed topics
 *   - 1ai_notification_queue   — persisted notifications for offline delivery
 */

const pool = require('../db/mysql');

// ---------- helpers ----------

function unix() {
  return Math.floor(Date.now() / 1000);
}

// ---------- channel registration ----------

/**
 * Associate a socket/device with a user and set of topics.
 * Upserts on duplicate channel (e.g. reconnected socket).
 */
async function registerChannel(userId, socketId, channelType, topics) {
  const now = unix();
  const topicsJson = JSON.stringify(topics || []);
  await pool.query(
    `INSERT INTO 1ai_notification_channels
       (user_id, channel, channel_type, subscribed_topics, created_at, last_heartbeat_at)
     VALUES (?, ?, ?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE
       user_id = VALUES(user_id),
       channel_type = VALUES(channel_type),
       subscribed_topics = VALUES(subscribed_topics),
       last_heartbeat_at = VALUES(last_heartbeat_at)`,
    [userId, socketId, channelType, topicsJson, now, now]
  );
}

// ---------- sending ----------

/**
 * Push notification to all online sockets for a user AND enqueue
 * for offline delivery (already-queued dedup is caller's concern).
 *
 * @param {number} userId
 * @param {string} topic   — event category
 * @param {string} title
 * @param {string} [body]
 * @param {object} [payload]
 * @param {import('socket.io').Server} [io] — if omitted only enqueues
 */
async function sendToUser(userId, topic, title, body, payload, io) {
  // persist to queue (used as offline fallback + history)
  const nid = await enqueueNotification(userId, topic, title, body, payload);

  // deliver immediately if io is available
  if (io) {
    const rooms = io.sockets.adapter.rooms;
    // Socket.IO convention: each userId gets a private room "user:<id>"
    const room = `user:${userId}`;
    if (rooms.has(room)) {
      io.to(room).emit('notification', {
        id: nid,
        topic,
        title,
        body,
        payload,
        created_at: unix(),
      });
    }
  }

  return nid;
}

/**
 * Broadcast notification to every user whose channels subscribe to `topic`.
 *
 * @param {string} topic
 * @param {string} title
 * @param {string} [body]
 * @param {object} [payload]
 * @param {import('socket.io').Server} [io]
 */
async function sendToTopic(topic, title, body, payload, io) {
  // find all users who have a channel subscribed to this topic
  const [rows] = await pool.query(
    "SELECT DISTINCT user_id FROM 1ai_notification_channels WHERE JSON_CONTAINS(subscribed_topics, ?)",
    [JSON.stringify(topic)]
  );

  for (const { user_id } of rows) {
    await sendToUser(user_id, topic, title, body, payload, io);
  }
}

// ---------- queue / offline ----------

/**
 * Insert notification into the queue.
 * @returns {number} insert id
 */
async function enqueueNotification(userId, topic, title, body, payload) {
  const now = unix();
  const payloadJson = payload ? JSON.stringify(payload) : null;
  const [result] = await pool.query(
    `INSERT INTO 1ai_notification_queue
       (user_id, topic, title, body, payload, priority, status, created_at)
     VALUES (?, ?, ?, ?, ?, 'normal', 'queued', ?)`,
    [userId, topic, title, body || null, payloadJson, now]
  );
  return result.insertId;
}

/**
 * Fetch undelivered (queued) notifications for a user.
 * Marks them as 'sent' on read.
 */
async function getOfflineNotifications(userId) {
  const [rows] = await pool.query(
    `SELECT id, topic, title, body, payload, created_at
     FROM 1ai_notification_queue
     WHERE user_id = ? AND status IN ('queued','sent')
     ORDER BY created_at ASC`,
    [userId]
  );

  if (rows.length) {
    await pool.query(
      "UPDATE 1ai_notification_queue SET status = 'delivered' WHERE user_id = ? AND status IN ('queued','sent')",
      [userId]
    );
  }

  return rows.map(r => ({
    ...r,
    payload: r.payload ? JSON.parse(r.payload) : null,
  }));
}

// ---------- read receipts ----------

async function markRead(notificationId, userId) {
  const now = unix();
  await pool.query(
    'UPDATE 1ai_notification_queue SET read_at = ?, status = ? WHERE id = ? AND user_id = ?',
    [now, 'delivered', notificationId, userId]
  );
}

async function markAllRead(userId) {
  const now = unix();
  await pool.query(
    "UPDATE 1ai_notification_queue SET read_at = ?, status = 'delivered' WHERE user_id = ? AND (read_at IS NULL OR status IN ('queued','sent'))",
    [now, userId]
  );
}

// ---------- channel cleanup ----------

/**
 * Remove a channel record (e.g. on socket disconnect).
 */
async function removeChannel(channel) {
  await pool.query('DELETE FROM 1ai_notification_channels WHERE channel = ?', [channel]);
}

// ---------- export ----------

module.exports = {
  registerChannel,
  sendToUser,
  sendToTopic,
  getOfflineNotifications,
  markRead,
  markAllRead,
  removeChannel,
};
