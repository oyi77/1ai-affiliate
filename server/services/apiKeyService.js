'use strict';

/**
 * API Key Service
 * Per-user API keys with scoped permissions.
 */

const crypto = require('crypto');
const pool = require('../db/mysql');

function generateKey() {
  return '1ai_' + crypto.randomBytes(32).toString('hex');
}

function hashKey(key) {
  return crypto.createHash('sha256').update(key).digest('hex');
}

async function createKey(userId, name, scopes = null, expiresAt = null) {
  const key = generateKey();
  const keyHash = hashKey(key);
  const keyPrefix = key.substring(0, 8);
  const now = Math.floor(Date.now() / 1000);

  await pool.query(
    'INSERT INTO 1ai_api_keys (user_id, key_hash, key_prefix, name, scopes, expires_at, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [userId, keyHash, keyPrefix, name, scopes ? JSON.stringify(scopes) : null, expiresAt, now]
  );

  return { key, key_prefix: keyPrefix, name }; // key only returned once
}

async function validateKey(key) {
  const keyHash = hashKey(key);
  const [rows] = await pool.query(
    'SELECT * FROM 1ai_api_keys WHERE key_hash = ? AND (expires_at IS NULL OR expires_at > UNIX_TIMESTAMP())',
    [keyHash]
  );
  if (!rows.length) return null;

  // Update last_used_at
  await pool.query('UPDATE 1ai_api_keys SET last_used_at = UNIX_TIMESTAMP() WHERE id = ?', [rows[0].id]);

  const keyData = rows[0];
  keyData.scopes = keyData.scopes ? JSON.parse(keyData.scopes) : null;
  return keyData;
}

async function listKeys(userId) {
  const [rows] = await pool.query(
    'SELECT id, key_prefix, name, scopes, last_used_at, expires_at, created_at FROM 1ai_api_keys WHERE user_id = ? ORDER BY created_at DESC',
    [userId]
  );
  return rows;
}

async function revokeKey(userId, keyId) {
  await pool.query('DELETE FROM 1ai_api_keys WHERE id = ? AND user_id = ?', [keyId, userId]);
}

module.exports = { createKey, validateKey, listKeys, revokeKey };
