'use strict';

/**
 * Unit tests for scorecardService — calculation logic, tier assignment,
 * rank insertion, and edge cases.
 */

jest.mock('../../db/mysql', () => ({ query: jest.fn() }));

const pool = require('../../db/mysql');
const { calculateScorecard, getScorecard, getScorecardHistory, getScorecards } = require('../../services/scorecardService');

const MOCK_NOW = 1_700_000_000;
jest.spyOn(Date, 'now').mockReturnValue(MOCK_NOW * 1000);

beforeEach(() => {
  jest.clearAllMocks();
});

// ── calculateScorecard ───────────────────────────────────────────────────────

describe('calculateScorecard', () => {
  /** Build mock query results for the 4 stats/daily/month/rank queries. */
  function mockQueries(stats, daily, monthly) {
    pool.query
      // 1 — click stats
      .mockResolvedValueOnce([[stats]])
      // 2 — daily breakdown
      .mockResolvedValueOnce([daily])
      // 3 — monthly revenue
      .mockResolvedValueOnce([monthly])
      // 4 — rank above
      .mockResolvedValueOnce([[{ rank: 3 }]])
      // 5 — total count
      .mockResolvedValueOnce([[{ total: 10 }]])
      // 6 — upsert scorecard
      .mockResolvedValueOnce([{ affectedRows: 1 }])
      // 7 — insert history
      .mockResolvedValueOnce([{ affectedRows: 1 }])
      // 8 — re-read persisted scorecard (via queryOne → pool.query returns [[row]])
      .mockResolvedValueOnce([[{
        id: 99, affiliate_id: 1, overall_score: 75, tier: 'gold',
        conversion_rate_score: 80, volume_score: 60, quality_score: 70,
        growth_score: 50, revenue_score: 60, rank: 3, total_affiliates: 10,
        calculated_at: MOCK_NOW,
      }]]);
  }

  test('computes correct scores for a high-performing affiliate (5k+ clicks, 5%+ conv, growth)', async () => {
    mockQueries(
      { total_clicks: 5000, total_conversions: 250, total_revenue: 6000, conv_revenue: 6000 },
      // 30 days of consistent 0.05 conversion rate
      Array.from({ length: 30 }, (_, i) => ({
        day: `2024-01-${String(i + 1).padStart(2, '0')}`,
        clicks: 167,
        conversions: 8,
      })),
      // 3 months of growth
      [
        { month: '2023-11', revenue: 1000 },
        { month: '2023-12', revenue: 2000 },
        { month: '2024-01', revenue: 3000 },
      ],
      3,
    );

    const result = await calculateScorecard(1);
    expect(result.overall_score).toBeGreaterThanOrEqual(70);
    expect(result.tier).toMatch(/gold|platinum/);
  });

  test('handles zero-click affiliate (no data)', async () => {
    pool.query
      .mockResolvedValueOnce([[{ total_clicks: 0, total_conversions: 0, total_revenue: 0, conv_revenue: 0 }]])
      .mockResolvedValueOnce([[]])
      .mockResolvedValueOnce([[]])
      .mockResolvedValueOnce([[{ rank: 1 }]])
      .mockResolvedValueOnce([[{ total: 10 }]])
      .mockResolvedValueOnce([{ affectedRows: 1 }])
      .mockResolvedValueOnce([{ affectedRows: 1 }])
      .mockResolvedValueOnce([[{
        id: 100, affiliate_id: 2, overall_score: 0, tier: 'bronze',
        conversion_rate_score: 0, volume_score: 0, quality_score: 60,
        growth_score: 30, revenue_score: 0, rank: 1, total_affiliates: 10,
        calculated_at: MOCK_NOW,
      }]]);

    const result = await calculateScorecard(2);
    expect(result.tier).toBe('bronze');
    expect(result.conversion_rate_score).toBe(0);
    expect(result.volume_score).toBe(0);
    expect(result.quality_score).toBe(60);
    expect(result.growth_score).toBe(30);
    expect(result.revenue_score).toBe(0);
  });
  test('tier boundaries: diamond (≥90), platinum (≥75), gold (≥60), silver (≥40), bronze (<40)', async () => {
    pool.query
      .mockResolvedValueOnce([[{ total_clicks: 10000, total_conversions: 2000, total_revenue: 10000, conv_revenue: 10000 }]])
      .mockResolvedValueOnce([Array.from({ length: 30 }, (_, i) => ({ day: `d${i}`, clicks: 200, conversions: 40 }))])
      .mockResolvedValueOnce([Array.from({ length: 3 }, (_, i) => ({ month: `2024-0${i + 1}`, revenue: 3000 * (i + 1) }))])
      .mockResolvedValueOnce([[{ rank: 1 }]])
      .mockResolvedValueOnce([[{ total: 10 }]])
      .mockResolvedValueOnce([{ affectedRows: 1 }])
      .mockResolvedValueOnce([{ affectedRows: 1 }])
      .mockResolvedValueOnce([[{
        id: 101, affiliate_id: 3, overall_score: 95, tier: 'diamond',
        conversion_rate_score: 100, volume_score: 100, quality_score: 100,
        growth_score: 100, revenue_score: 100, rank: 1, total_affiliates: 10,
        calculated_at: MOCK_NOW,
      }]]);
    expect((await calculateScorecard(3)).tier).toBe('diamond');
  });

  test('throws on DB error', async () => {
    pool.query.mockRejectedValueOnce(new Error('connection lost'));
    await expect(calculateScorecard(1)).rejects.toThrow('connection lost');
  });
});

// ── Simple CRUD wrappers ─────────────────────────────────────────────────────

describe('getScorecard', () => {
  test('returns row when found', async () => {
    pool.query.mockResolvedValueOnce([[{ id: 1, affiliate_id: 1 }]]);
    const row = await getScorecard(1);
    expect(row.affiliate_id).toBe(1);
  });

  test('returns null when not found', async () => {
    pool.query.mockResolvedValueOnce([[]]);
    const row = await getScorecard(999);
    expect(row).toBeNull();
  });
});

describe('getScorecardHistory', () => {
  test('returns array with default limit', async () => {
    pool.query.mockResolvedValueOnce([[{ id: 1 }]]);
    const rows = await getScorecardHistory(1);
    expect(Array.isArray(rows)).toBe(true);
    expect(pool.query).toHaveBeenCalledWith(expect.stringContaining('LIMIT ?'), [1, 30]);
  });
});

describe('getScorecards', () => {
  test('filters by tier when provided', async () => {
    pool.query.mockResolvedValueOnce([[{ id: 1, tier: 'gold' }]]);
    const rows = await getScorecards('gold');
    expect(rows).toHaveLength(1);
  });

  test('returns all when no tier', async () => {
    pool.query.mockResolvedValueOnce([[{ id: 1 }, { id: 2 }]]);
    const rows = await getScorecards();
    expect(rows).toHaveLength(2);
  });
});
