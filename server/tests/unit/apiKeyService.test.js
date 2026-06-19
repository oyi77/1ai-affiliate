'use strict';

/**
 * Unit tests for apiKeyService
 * Tests key generation, hashing, validation.
 */

const { createKey, validateKey, listKeys, revokeKey } = require('../../services/apiKeyService');

jest.mock('../../db/mysql', () => ({
  query: jest.fn(),
}));

const pool = require('../../db/mysql');
const crypto = require('crypto');

describe('apiKeyService', () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createKey', () => {
    test('returns key with prefix', async () => {
      pool.query.mockResolvedValueOnce([{ insertId: 1 }]);

      const result = await createKey(1, 'Test Key', ['read']);
      expect(result.key).toMatch(/^1ai_[a-f0-9]{64}$/);
      expect(result.key_prefix).toBe(result.key.substring(0, 8));
      expect(result.name).toBe('Test Key');
    });

    test('key is unique each call', async () => {
      pool.query.mockResolvedValue([{ insertId: 1 }]);
      const k1 = await createKey(1, 'Key 1');
      const k2 = await createKey(1, 'Key 2');
      expect(k1.key).not.toBe(k2.key);
    });
  });

  describe('validateKey', () => {
    test('returns null for invalid key', async () => {
      pool.query.mockResolvedValueOnce([[]]);
      const result = await validateKey('invalid_key');
      expect(result).toBeNull();
    });

    test('returns key data for valid key', async () => {
      const key = '1ai_' + crypto.randomBytes(32).toString('hex');
      const hash = crypto.createHash('sha256').update(key).digest('hex');

      pool.query.mockResolvedValueOnce([[{
        id: 1,
        user_id: 10,
        key_hash: hash,
        key_prefix: key.substring(0, 8),
        name: 'Test',
        scopes: '["read","write"]',
        last_used_at: null,
        expires_at: null,
      }]]);
      pool.query.mockResolvedValueOnce([{ affectedRows: 1 }]); // update last_used

      const result = await validateKey(key);
      expect(result).not.toBeNull();
      expect(result.user_id).toBe(10);
      expect(result.scopes).toEqual(['read', 'write']);
    });

    test('returns null for expired key', async () => {
      pool.query.mockResolvedValueOnce([[]]); // query filters expired
      const result = await validateKey('expired_key');
      expect(result).toBeNull();
    });
  });

  describe('listKeys', () => {
    test('returns keys without full key', async () => {
      pool.query.mockResolvedValueOnce([[
        { id: 1, key_prefix: '1ai_abcd', name: 'My Key', scopes: null, last_used_at: null, expires_at: null, created_at: 1000 },
      ]]);

      const keys = await listKeys(1);
      expect(keys).toHaveLength(1);
      expect(keys[0].key_prefix).toBe('1ai_abcd');
      expect(keys[0]).not.toHaveProperty('key_hash');
    });
  });

  describe('revokeKey', () => {
    test('deletes key for correct user', async () => {
      pool.query.mockResolvedValueOnce([{ affectedRows: 1 }]);
      await revokeKey(1, 5);
      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining('DELETE FROM 1ai_api_keys'),
        [5, 1]
      );
    });
  });
});
