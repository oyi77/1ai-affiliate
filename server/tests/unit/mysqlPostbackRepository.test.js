'use strict';

jest.mock('../../db/mysql', () => ({ query: jest.fn() }));

const pool = require('../../db/mysql');
const { MysqlPostbackRepository } = require('../../agents/mysqlPostbackRepository');

describe('MysqlPostbackRepository', () => {
  let repo;
  beforeEach(() => {
    repo = new MysqlPostbackRepository();
    jest.clearAllMocks();
  });

  // ── failedPostbacks ───────────────────────────────────────────────────────
  test('failedPostbacks returns rows', async () => {
    const rows = [{ id: 1, status: 'failed' }];
    pool.query.mockResolvedValueOnce([rows]);
    const result = await repo.failedPostbacks(50, 24);
    expect(result).toEqual(rows);
    expect(pool.query).toHaveBeenCalledTimes(1);
    const [sql, params] = pool.query.mock.calls[0];
    expect(sql).toMatch(/1ai_postback_logs/);
    expect(sql).toMatch(/status IN/);
    expect(params).toHaveLength(2); // [cutoff, limit]
    expect(params[1]).toBe(50);
  });

  test('failedPostbacks accepts custom limit and sinceHours', async () => {
    pool.query.mockResolvedValueOnce([[{ id: 2, status: 'retry' }]]);
    await repo.failedPostbacks(10, 48);
    const [, params] = pool.query.mock.calls[0];
    expect(params[1]).toBe(10);
    // cutoff should be approximately now - 48h (within 5s tolerance)
    const expectedCutoff = Math.floor(Date.now() / 1000) - 48 * 3600;
    expect(params[0]).toBeGreaterThanOrEqual(expectedCutoff - 5);
    expect(params[0]).toBeLessThanOrEqual(expectedCutoff + 5);
  });

  test('failedPostbacks returns [] on db error', async () => {
    pool.query.mockRejectedValueOnce(new Error('db down'));
    const result = await repo.failedPostbacks();
    expect(result).toEqual([]);
  });

  // ── postbackDetail ────────────────────────────────────────────────────────
  test('postbackDetail returns row when found', async () => {
    const row = { id: 42, status: 'failed', url: 'https://example.com' };
    pool.query.mockResolvedValueOnce([[row]]);
    const result = await repo.postbackDetail(42);
    expect(result).toEqual(row);
    const [sql, params] = pool.query.mock.calls[0];
    expect(sql).toMatch(/WHERE id = \?/);
    expect(params).toEqual([42]);
  });

  test('postbackDetail returns null when not found', async () => {
    pool.query.mockResolvedValueOnce([[undefined]]);
    const result = await repo.postbackDetail(999);
    expect(result).toBeNull();
  });

  test('postbackDetail returns null on db error', async () => {
    pool.query.mockRejectedValueOnce(new Error('timeout'));
    const result = await repo.postbackDetail(1);
    expect(result).toBeNull();
  });
});
