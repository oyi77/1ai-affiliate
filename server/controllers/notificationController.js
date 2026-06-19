const { asyncHandler } = require('../utils/asyncHandler');
const { success } = require('../utils/apiResponse');
const pool = require('../db/mysql');

const getNotifications = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const [rows] = await pool.query(
    'SELECT id, type, title, message, read_at, created_at FROM 1ai_notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 20',
    [userId]
  );
  const [[{ unread_count }]] = await pool.query(
    'SELECT COUNT(*) AS unread_count FROM 1ai_notifications WHERE user_id = ? AND read_at IS NULL',
    [userId]
  );
  return success(res, { data: rows, unread_count });
});

const markAsRead = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const notifId = parseInt(req.params.id);
  if (!notifId) return res.status(400).json({ error: 'Invalid notification id' });
  const now = Math.floor(Date.now() / 1000);
  await pool.query(
    'UPDATE 1ai_notifications SET read_at = ? WHERE id = ? AND user_id = ?',
    [now, notifId, userId]
  );
  return success(res, { success: true });
});

const markAllRead = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const now = Math.floor(Date.now() / 1000);
  await pool.query(
    'UPDATE 1ai_notifications SET read_at = ? WHERE user_id = ? AND read_at IS NULL',
    [now, userId]
  );
  return success(res, { success: true });
});

module.exports = { getNotifications, markAsRead, markAllRead };
