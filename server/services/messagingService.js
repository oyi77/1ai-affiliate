const { queryOne, queryRows, queryInsert, queryUpdate } = require('../utils/queryHelpers');

/**
 * In-platform messaging — conversations and messages between affiliates, advertisers, and admins.
 */

async function createConversation(subject, participants) {
  const now = Math.floor(Date.now() / 1000);
  return queryInsert(
    `INSERT INTO 1ai_conversations (subject, participants, message_count, status, created_at)
     VALUES (?, ?, 0, 'active', ?)`,
    [subject, JSON.stringify(participants), now]
  );
}

async function getConversations(affiliateId) {
  return queryRows(
    'SELECT * FROM 1ai_conversations WHERE JSON_CONTAINS(participants, ?) ORDER BY last_message_at DESC',
    [String(affiliateId)]
  );
}

async function getConversation(id) {
  return queryOne('SELECT * FROM 1ai_conversations WHERE id = ?', [id]);
}

async function updateLastMessage(conversationId, preview) {
  const now = Math.floor(Date.now() / 1000);
  return queryUpdate(
    'UPDATE 1ai_conversations SET last_message_at = ?, last_message_preview = ?, message_count = message_count + 1 WHERE id = ?',
    [now, preview, conversationId]
  );
}

async function closeConversation(id) {
  const now = Math.floor(Date.now() / 1000);
  return queryUpdate(
    'UPDATE 1ai_conversations SET status = ?, updated_at = ? WHERE id = ?',
    ['closed', now, id]
  );
}

async function sendMessage(conversationId, senderId, body) {
  const now = Math.floor(Date.now() / 1000);
  const messageId = await queryInsert(
    `INSERT INTO 1ai_messages (conversation_id, sender_id, body, created_at)
     VALUES (?, ?, ?, ?)`,
    [conversationId, senderId, body, now]
  );
  const preview = body.length > 100 ? body.substring(0, 100) + '...' : body;
  await updateLastMessage(conversationId, preview);
  return messageId;
}

async function getMessages(conversationId, page, limit) {
  const offset = (page - 1) * limit;
  return queryRows(
    'SELECT * FROM 1ai_messages WHERE conversation_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?',
    [conversationId, limit, offset]
  );
}

async function markRead(messageId, userId) {
  return queryUpdate(
    "UPDATE 1ai_messages SET read_by = JSON_ARRAY_APPEND(COALESCE(read_by, CAST('[]' AS JSON)), '$', CAST(? AS JSON)) WHERE id = ?",
    [userId, messageId]
  );
}

module.exports = {
  createConversation,
  getConversations,
  getConversation,
  closeConversation,
  sendMessage,
  getMessages,
  markRead,
};
