'use strict';

/**
 * Unit tests for ltvService — LTV calculation logic, confidence tiers,
 * CRUD wrappers.
 */

jest.mock('../../db/mysql', () => ({ query: jest.fn() }));

const pool = require('../../db/mysql');
const {
  calculateLtv, getLtv, getTopLtv,
  getLtvSettings, upsertLtvSettings, updateLtvSettings,
} = require('../../services/ltvService');

const MOCK_NOW = 1_700_000_000;
jest.spyOn(Date, 'now').mockReturnValue(MOCK_NOW * 1000);

beforeEach(() => {
  jest.clearAllMocks();
});

// ── calculateLtv ──────────────────────────────────────────────────────────────

describe('calculateLtv', () => {
  /**
   * Build mock results for the 5 window queries + customer + returning + upsert.
   * Each window query returns { conversions, revenue }.
   * customer query returns { total_customers, total_conversions }.
   * returning query returns { returning }.
   */
  function mockQueries(windows, customer, returning, insertId) {
    windows.forEach(w => {
      pool.query.mockResolvedValueOnce([[w]]);
    });
    pool.query
      // #6 — customer metrics
      .mockResolvedValueOnce([[customer]])
      // #7 — returning customers
      .mockResolvedValueOnce([[returning]])
      // #8 — upsert (queryInsert returns result.insertId)
      .mockResolvedValueOnce([{ insertId: insertId || 99 }]);
  }

  test('calculates LTV windows correctly from conversion data', async () => {
    mockQueries(
      [
        { conversions: 10, revenue: 500 },
        { conversions: 20, revenue: 1200 },
        { conversions: 30, revenue: 2000 },
        { conversions: 50, revenue: 5000 },
        { conversions: 100, revenue: 10000 },
      ],
      { total_customers: 30, total_conversions: 100 },
      { returning: 10 },
    );

    const result = await calculateLtv(1, 1, 42);

    // Returns insertId from queryInsert
    expect(result).toBe(99);

    // Verify upsert params
    const calls = pool.query.mock.calls;
    const upsertCall = calls[calls.length - 1];
    expect(upsertCall[0]).toMatch(/INSERT INTO 1ai_ltv_calculations/);
    const params = upsertCall[1];
    expect(params[0]).toBe(1);   // affiliate_id
    expect(params[1]).toBe(1);   // offer_id
    expect(params[2]).toBe(42);  // campaign_id
    expect(params[3]).toBe(500);    // ltv_30d
    expect(params[4]).toBe(1200);   // ltv_60d
    expect(params[5]).toBe(2000);   // ltv_90d
    expect(params[6]).toBe(5000);   // ltv_180d
    expect(params[7]).toBe(10000);  // ltv_365d
    // totalConversions = 10+20+30+50+100 = 210, totalRevenue = 500+1200+2000+5000+10000 = 18700
    expect(params[8]).toBeCloseTo(89.0476, 3); // avg_order_value = 18700/210
    // repeat_rate = 10 / 30 ≈ 0.3333
    expect(params[9]).toBeCloseTo(0.3333, 3);
    // churn_rate = 1 - 0.3333 ≈ 0.6667
    expect(params[10]).toBeCloseTo(0.6667, 3);
    // confidence = high (≥100 conversions across all windows)
    expect(params[11]).toBe('high');
  });

  test('sets confidence based on total conversion volume', async () => {
    // Low: < 20 total conversions across all windows
    mockQueries(
      [
        { conversions: 1, revenue: 10 },
        { conversions: 2, revenue: 20 },
        { conversions: 3, revenue: 30 },
        { conversions: 4, revenue: 40 },
        { conversions: 5, revenue: 50 },
      ],
      { total_customers: 5, total_conversions: 15 },
      { returning: 1 },
    );
    await calculateLtv(2, 1, 1);
    let lastCall = pool.query.mock.calls.pop();
    expect(lastCall[1][11]).toBe('low');

    // Medium: 20-99 total conversions
    pool.query.mockClear();
    mockQueries(
      [
        { conversions: 4, revenue: 40 },
        { conversions: 4, revenue: 40 },
        { conversions: 4, revenue: 40 },
        { conversions: 4, revenue: 40 },
        { conversions: 4, revenue: 40 },
      ],
      { total_customers: 10, total_conversions: 20 },
      { returning: 2 },
    );
    await calculateLtv(3, 1, 1);
    lastCall = pool.query.mock.calls.pop();
    expect(lastCall[1][11]).toBe('medium');

    // High: ≥100 total conversions
    pool.query.mockClear();
    mockQueries(
      [
        { conversions: 20, revenue: 200 },
        { conversions: 20, revenue: 200 },
        { conversions: 20, revenue: 200 },
        { conversions: 20, revenue: 200 },
        { conversions: 20, revenue: 200 },
      ],
      { total_customers: 50, total_conversions: 100 },
      { returning: 15 },
    );
    await calculateLtv(4, 1, 1);
    lastCall = pool.query.mock.calls.pop();
    expect(lastCall[1][11]).toBe('high');
  });

  test('handles zero-data edge case (no conversions)', async () => {
    mockQueries(
      [
        { conversions: 0, revenue: 0 },
        { conversions: 0, revenue: 0 },
        { conversions: 0, revenue: 0 },
        { conversions: 0, revenue: 0 },
        { conversions: 0, revenue: 0 },
      ],
      { total_customers: 0, total_conversions: 0 },
      { returning: 0 },
    );

    await calculateLtv(5, 1, 1);
    const lastCall = pool.query.mock.calls.pop();
    expect(lastCall[1][3]).toBe(0);
    expect(lastCall[1][4]).toBe(0);
    expect(lastCall[1][5]).toBe(0);
    expect(lastCall[1][6]).toBe(0);
    expect(lastCall[1][7]).toBe(0);
    expect(lastCall[1][8]).toBe(0);  // avg_order_value = 0
    expect(lastCall[1][9]).toBe(0);  // repeat_rate = 0
    expect(lastCall[1][10]).toBe(1); // churn_rate = 1
    expect(lastCall[1][11]).toBe('low');
  });

  test('throws on DB error', async () => {
    pool.query.mockRejectedValueOnce(new Error('connection lost'));
    await expect(calculateLtv(1, 1, 1)).rejects.toThrow('connection lost');
  });
});

// ── CRUD wrappers ─────────────────────────────────────────────────────────────

describe('getLtv', () => {
  test('returns row when found', async () => {
    pool.query.mockResolvedValueOnce([[{ id: 1, ltv_30d: 500 }]]);
    const row = await getLtv(1, 1, 1);
    expect(row).toEqual({ id: 1, ltv_30d: 500 });
  });

  test('returns null when not found', async () => {
    pool.query.mockResolvedValueOnce([[]]);
    const row = await getLtv(999, 1, 1);
    expect(row).toBeNull();
  });
});

describe('getTopLtv', () => {
  test('returns ranked list', async () => {
    pool.query.mockResolvedValueOnce([[{ affiliate_id: 1, ltv_365d: 10000 }]]);
    const rows = await getTopLtv(5);
    expect(rows).toHaveLength(1);
    expect(rows[0].ltv_365d).toBe(10000);
    expect(pool.query.mock.calls[0][1][0]).toBe(5);
  });
});

describe('getLtvSettings', () => {
  test('returns settings when found', async () => {
    pool.query.mockResolvedValueOnce([[{ lookback_days: 90 }]]);
    const s = await getLtvSettings(1);
    expect(s.lookback_days).toBe(90);
  });
});

describe('upsertLtvSettings', () => {
  test('inserts and returns insertId', async () => {
    pool.query.mockResolvedValueOnce([{ insertId: 1 }]);
    const id = await upsertLtvSettings(1, 90, 10, 'active');
    expect(id).toBe(1);
  });
});

describe('updateLtvSettings', () => {
  test('updates and returns affectedRows', async () => {
    pool.query.mockResolvedValueOnce([{ affectedRows: 1 }]);
    const affected = await updateLtvSettings(1, { lookback_days: 180 });
    expect(affected).toBe(1);
    // Verify the SQL includes the lookback_days field
    expect(pool.query.mock.calls[0][0]).toMatch(/lookback_days/);
  });
});
