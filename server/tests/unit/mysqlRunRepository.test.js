'use strict';

jest.mock('../../db/mysql');

const pool = require('../../db/mysql');
const { MysqlRunRepository } = require('../../agents/mysqlRunRepository');

function makePool({ queryResults = [], queryErrors = [] } = {}) {
  let call = 0;
  pool.query = jest.fn(async () => {
    const err = queryErrors[call];
    const res = queryResults[call] ?? [[],[]];
    call++;
    if (err) throw err;
    return res;
  });
}

describe('MysqlRunRepository', () => {
  beforeEach(() => jest.clearAllMocks());

  describe('ensureTable', () => {
    it('creates table and returns true on success', async () => {
      makePool({ queryResults: [[[],[]]] });
      const repo = new MysqlRunRepository();
      await expect(repo.ensureTable()).resolves.toBe(true);
      expect(pool.query).toHaveBeenCalledTimes(1);
    });

    it('returns false and uses memory fallback on table creation error', async () => {
      makePool({ queryErrors: [new Error('table error')] });
      const repo = new MysqlRunRepository();
      await expect(repo.ensureTable()).resolves.toBe(false);
    });

    it('caches result and only calls DB once', async () => {
      makePool({ queryResults: [[[],[]]] });
      const repo = new MysqlRunRepository();
      await repo.ensureTable();
      await repo.ensureTable();
      expect(pool.query).toHaveBeenCalledTimes(1);
    });
  });

  describe('start', () => {
    it('inserts into DB when table is ready', async () => {
      makePool({ queryResults: [[[[],[]]], [[[],[]]]]} );
      const repo = new MysqlRunRepository();
      await repo.start('agent1', 'run-1', { x: 1 });
      expect(pool.query).toHaveBeenCalledTimes(2); // ensureTable + INSERT
    });

    it('stores in memory fallback even when DB insert fails', async () => {
      makePool({ queryResults: [[[],[]]], queryErrors: [null, new Error('insert fail')] });
      const repo = new MysqlRunRepository();
      // ensureTable succeeds, insert fails
      await repo.start('agent1', 'run-2', { y: 2 });
      expect(repo.memoryFallback['run-2']).toBeDefined();
      expect(repo.memoryFallback['run-2'].status).toBe('running');
    });

    it('stores in memory when table not ready', async () => {
      makePool({ queryErrors: [new Error('no table')] });
      const repo = new MysqlRunRepository();
      await repo.start('agent1', 'run-3', {});
      expect(repo.memoryFallback['run-3']).toBeDefined();
    });
  });

  describe('finish', () => {
    it('updates in-memory fallback if exists', async () => {
      makePool({ queryErrors: [new Error('no table')] });
      const repo = new MysqlRunRepository();
      await repo.start('agent1', 'run-4', {});
      // Reset pool to succeed for ensureTable call in finish
      pool.query = jest.fn(async () => [[],[]]);
      await repo.finish('run-4', { out: 1 }, null, 10, 20, 500, 'completed');
      expect(repo.memoryFallback['run-4'].status).toBe('completed');
      expect(repo.memoryFallback['run-4'].output).toEqual({ out: 1 });
    });

    it('swallows DB error gracefully', async () => {
      pool.query = jest.fn()
        .mockResolvedValueOnce([[],[]])   // ensureTable
        .mockRejectedValueOnce(new Error('update fail'));
      const repo = new MysqlRunRepository();
      await expect(repo.finish('run-x', null, 'oops', 0, 0, 0, 'failed')).resolves.toBeUndefined();
    });
  });

  describe('recent', () => {
    it('returns DB rows when table ready', async () => {
      const rows = [{ agent_name: 'a', run_id: 'r1', input: '{}', output: '{}', error: null,
        prompt_tokens: 1, completion_tokens: 2, duration_ms: 100, status: 'completed',
        started_at: '2024-01-01', finished_at: '2024-01-01' }];
      pool.query = jest.fn()
        .mockResolvedValueOnce([[],[]])   // ensureTable
        .mockResolvedValueOnce([rows]);   // SELECT
      const repo = new MysqlRunRepository();
      const res = await repo.recent(10);
      expect(res).toHaveLength(1);
      expect(res[0].agentName).toBe('a');
    });

    it('filters by agentName', async () => {
      pool.query = jest.fn()
        .mockResolvedValueOnce([[],[]])
        .mockResolvedValueOnce([[]]);
      const repo = new MysqlRunRepository();
      await repo.recent(10, 'myAgent');
      const sql = pool.query.mock.calls[1][0];
      expect(sql).toContain('WHERE agent_name');
    });

    it('falls back to memory on DB error', async () => {
      pool.query = jest.fn()
        .mockResolvedValueOnce([[],[]])
        .mockRejectedValueOnce(new Error('query fail'));
      const repo = new MysqlRunRepository();
      repo.memoryFallback['r1'] = { agentName: 'a', startedAt: '2024-01-01' };
      const res = await repo.recent(10);
      expect(res).toHaveLength(1);
    });
  });

  describe('findByRunId', () => {
    it('returns row from DB', async () => {
      const row = { agent_name: 'a', run_id: 'r1', input: '{"k":1}', output: null, error: null,
        prompt_tokens: 0, completion_tokens: 0, duration_ms: 0, status: 'running',
        started_at: '2024-01-01', finished_at: null };
      pool.query = jest.fn()
        .mockResolvedValueOnce([[],[]])
        .mockResolvedValueOnce([[row]]);
      const repo = new MysqlRunRepository();
      const res = await repo.findByRunId('r1');
      expect(res.runId).toBe('r1');
      expect(res.input).toEqual({ k: 1 });
    });

    it('returns null when not found', async () => {
      pool.query = jest.fn()
        .mockResolvedValueOnce([[],[]])
        .mockResolvedValueOnce([[undefined]]);
      const repo = new MysqlRunRepository();
      const res = await repo.findByRunId('missing');
      expect(res).toBeNull();
    });

    it('falls back to memory on DB error', async () => {
      pool.query = jest.fn()
        .mockResolvedValueOnce([[],[]])
        .mockRejectedValueOnce(new Error('fail'));
      const repo = new MysqlRunRepository();
      repo.memoryFallback['r5'] = { agentName: 'b' };
      const res = await repo.findByRunId('r5');
      expect(res).toEqual({ agentName: 'b' });
    });
  });
});
