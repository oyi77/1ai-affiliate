'use strict';

jest.mock('../../db/mysql');
jest.mock('../../controllers/postbackController');

const pool = require('../../db/mysql');
const { firePostback, normalizeInteger } = require('../../controllers/postbackController');

// Load a fresh singleton per test via jest module registry reset
function loadQueue() {
  jest.resetModules();
  jest.mock('../../db/mysql');
  jest.mock('../../controllers/postbackController');
  const p = require('../../db/mysql');
  const ctrl = require('../../controllers/postbackController');
  ctrl.firePostback = jest.fn();
  ctrl.normalizeInteger = jest.fn((v, def) => (v != null ? v : def));
  const PostbackQueueModule = require('../../services/postbackQueue');
  return { queue: PostbackQueueModule, pool: p, firePostback: ctrl.firePostback };
}

describe('PostbackQueue', () => {
  describe('enqueue', () => {
    it('inserts when not already queued', async () => {
      const { queue, pool: p } = loadQueue();
      p.query = jest.fn()
        .mockResolvedValueOnce([[]])          // SELECT existing → empty
        .mockResolvedValueOnce([{ affectedRows: 1 }]); // INSERT
      await queue.enqueue(42);
      expect(p.query).toHaveBeenCalledTimes(2);
      const insertCall = p.query.mock.calls[1][0];
      expect(insertCall).toMatch(/INSERT/i);
    });

    it('is idempotent — skips insert if already queued', async () => {
      const { queue, pool: p } = loadQueue();
      p.query = jest.fn().mockResolvedValueOnce([[{ id: 1 }]]); // existing found
      await queue.enqueue(42);
      expect(p.query).toHaveBeenCalledTimes(1); // only SELECT, no INSERT
    });

    it('swallows DB error without throwing', async () => {
      const { queue, pool: p } = loadQueue();
      p.query = jest.fn().mockRejectedValueOnce(new Error('db error'));
      await expect(queue.enqueue(99)).resolves.toBeUndefined();
    });
  });

  describe('processItem — happy path', () => {
    it('marks completed on success', async () => {
      const { queue, pool: p, firePostback: fire } = loadQueue();
      fire.mockResolvedValueOnce(undefined);
      p.query = jest.fn()
        .mockResolvedValueOnce([undefined])            // UPDATE processing
        .mockResolvedValueOnce([[{ id: 5, offer_id: 1, postback_enabled: 1 }]]) // SELECT target
        .mockResolvedValueOnce([undefined]);            // UPDATE completed
      await queue.processItem(5);
      const lastParams = p.query.mock.calls[2][1];
      expect(lastParams[0]).toBe('completed');
    });
  });

  describe('processItem — disabled/missing postback', () => {
    it('marks failed when postback_enabled=0', async () => {
      const { queue, pool: p } = loadQueue();
      p.query = jest.fn()
        .mockResolvedValueOnce([undefined])
        .mockResolvedValueOnce([[{ id: 5, offer_id: 1, postback_enabled: 0 }]])
        .mockResolvedValueOnce([undefined])  // UPDATE logs
        .mockResolvedValueOnce([undefined]); // UPDATE queue
      await queue.processItem(5);
      const logUpdate = p.query.mock.calls[2][1];
      expect(logUpdate[0]).toBe('failed');
    });

    it('marks failed when log not found', async () => {
      const { queue, pool: p } = loadQueue();
      p.query = jest.fn()
        .mockResolvedValueOnce([undefined])
        .mockResolvedValueOnce([[]])         // empty targets
        .mockResolvedValueOnce([undefined])
        .mockResolvedValueOnce([undefined]);
      await queue.processItem(7);
      const logUpdate = p.query.mock.calls[2][1];
      expect(logUpdate[0]).toBe('failed');
    });
  });

  describe('processItem — retry logic', () => {
    it('schedules retry when retries remain', async () => {
      const { queue, pool: p, firePostback: fire } = loadQueue();
      fire.mockRejectedValueOnce(new Error('network error'));
      p.query = jest.fn()
        .mockResolvedValueOnce([undefined])
        .mockResolvedValueOnce([[{ id: 10, offer_id: 1, postback_enabled: 1 }]])
        // firePostback throws → catch → SELECT retry info
        .mockResolvedValueOnce([[{ retry_count: 1, postback_retries: 3 }]])
        .mockResolvedValueOnce([undefined]); // UPDATE retry
      await queue.processItem(10);
      const retryUpdate = p.query.mock.calls[3][1];
      expect(retryUpdate[0]).toBe('retry');
    });

    it('marks failed after retries exhausted', async () => {
      const { queue, pool: p, firePostback: fire } = loadQueue();
      fire.mockRejectedValueOnce(new Error('still failing'));
      p.query = jest.fn()
        .mockResolvedValueOnce([undefined])
        .mockResolvedValueOnce([[{ id: 11, offer_id: 1, postback_enabled: 1 }]])
        .mockResolvedValueOnce([[{ retry_count: 3, postback_retries: 3 }]])
        .mockResolvedValueOnce([undefined]);
      await queue.processItem(11);
      const failUpdate = p.query.mock.calls[3][1];
      expect(failUpdate[0]).toBe('failed');
    });
  });

  describe('findStuckPostbacks', () => {
    it('returns rows from DB', async () => {
      const { queue, pool: p } = loadQueue();
      const rows = [{ id: 1, postback_log_id: 5, scheduled_at: '2024-01-01', retry_count: 2 }];
      p.query = jest.fn().mockResolvedValueOnce([rows]);
      const result = await queue.findStuckPostbacks(60);
      expect(result).toHaveLength(1);
    });

    it('returns empty array on DB error', async () => {
      const { queue, pool: p } = loadQueue();
      p.query = jest.fn().mockRejectedValueOnce(new Error('db down'));
      const result = await queue.findStuckPostbacks();
      expect(result).toEqual([]);
    });
  });

  describe('process — batch processing', () => {
    it('calls processItem for each queued row', async () => {
      const { queue, pool: p } = loadQueue();
      p.query = jest.fn().mockResolvedValueOnce([[{ id: 1, postback_log_id: 10 }, { id: 2, postback_log_id: 11 }]]);
      const spy = jest.spyOn(queue, 'processItem').mockResolvedValue(undefined);
      await queue.process();
      expect(spy).toHaveBeenCalledTimes(2);
      expect(spy).toHaveBeenCalledWith(10);
      expect(spy).toHaveBeenCalledWith(11);
    });

    it('swallows batch error without throwing', async () => {
      const { queue, pool: p } = loadQueue();
      p.query = jest.fn().mockRejectedValueOnce(new Error('query fail'));
      await expect(queue.process()).resolves.toBeUndefined();
    });
  });
});
