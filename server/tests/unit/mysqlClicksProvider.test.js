'use strict';

jest.mock('../../db/mysql', () => ({ query: jest.fn() }));

const pool = require('../../db/mysql');
const { MysqlClicksProvider } = require('../../agents/mysqlClicksProvider');

describe('MysqlClicksProvider', () => {
  let provider;
  beforeEach(() => {
    provider = new MysqlClicksProvider();
    jest.clearAllMocks();
  });

  // ── recentClicks ──────────────────────────────────────────────────────────
  test('recentClicks returns rows', async () => {
    const rows = [{ click_id: 1, user_id: 2, aff_campaign_id: 3, clicked_at: '2024-01-01', click_payout: 0.5 }];
    pool.query.mockResolvedValueOnce([rows]);
    const result = await provider.recentClicks(10);
    expect(result).toEqual(rows);
    expect(pool.query).toHaveBeenCalledTimes(1);
    expect(pool.query.mock.calls[0][1]).toEqual([10]); // no offerId
  });

  test('recentClicks filters by offerId', async () => {
    pool.query.mockResolvedValueOnce([[{ click_id: 2 }]]);
    await provider.recentClicks(5, 99);
    const [sql, params] = pool.query.mock.calls[0];
    expect(sql).toMatch(/aff_campaign_id = \?/);
    expect(params).toEqual([99, 5]); // offerId prepended
  });

  test('recentClicks returns [] on error', async () => {
    pool.query.mockRejectedValueOnce(new Error('db down'));
    const result = await provider.recentClicks();
    expect(result).toEqual([]);
  });

  // ── recentConversions ─────────────────────────────────────────────────────
  test('recentConversions returns rows', async () => {
    const rows = [{ conversion_id: 7 }];
    pool.query.mockResolvedValueOnce([rows]);
    const result = await provider.recentConversions(20);
    expect(result).toEqual(rows);
  });

  test('recentConversions filters by offerId', async () => {
    pool.query.mockResolvedValueOnce([[]]);
    await provider.recentConversions(10, 42);
    const [sql, params] = pool.query.mock.calls[0];
    expect(sql).toMatch(/aff_campaign_id = \?/);
    expect(params).toEqual([42, 10]);
  });

  test('recentConversions returns [] on error', async () => {
    pool.query.mockRejectedValueOnce(new Error('timeout'));
    const result = await provider.recentConversions();
    expect(result).toEqual([]);
  });

  // ── summary ───────────────────────────────────────────────────────────────
  test('summary returns computed CVR', async () => {
    pool.query
      .mockResolvedValueOnce([[{ cnt: 200 }]]) // clicks
      .mockResolvedValueOnce([[{ cnt: 10 }]]);  // conversions
    const result = await provider.summary();
    expect(result.clicks_24h).toBe(200);
    expect(result.conversions_24h).toBe(10);
    expect(result.cvr_pct).toBeCloseTo(5.0, 2);
  });

  test('summary with offerId appends AND clause', async () => {
    pool.query
      .mockResolvedValueOnce([[{ cnt: 0 }]])
      .mockResolvedValueOnce([[{ cnt: 0 }]]);
    await provider.summary(7, 48);
    for (const call of pool.query.mock.calls) {
      const [sql, params] = call;
      expect(sql).toMatch(/aff_campaign_id = \?/);
      expect(params).toContain(7);
    }
  });

  test('summary returns zero object on db error', async () => {
    pool.query.mockRejectedValue(new Error('connection lost'));
    const result = await provider.summary();
    expect(result.clicks_24h).toBe(0);
    expect(result.conversions_24h).toBe(0);
    expect(result.cvr_pct).toBe(0);
  });

  test('summary CVR is 0 when clicks is 0', async () => {
    pool.query
      .mockResolvedValueOnce([[{ cnt: 0 }]])
      .mockResolvedValueOnce([[{ cnt: 5 }]]);
    const result = await provider.summary();
    expect(result.cvr_pct).toBe(0);
  });
});
