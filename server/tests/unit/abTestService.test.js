'use strict';

/**
 * Unit tests for abTestService
 * Tests the hash function and variant assignment logic.
 */

const { assignVariant, getResults } = require('../../services/abTestService');

// Mock pool for testing without DB
jest.mock('../../db/mysql', () => ({
  query: jest.fn(),
}));

const pool = require('../../db/mysql');

describe('abTestService', () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('assignVariant', () => {
    test('returns existing assignment if found', async () => {
      pool.query.mockResolvedValueOnce([[{ variant_name: 'B' }]]);
      const result = await assignVariant(1, 'click_123');
      expect(result).toBe('B');
      expect(pool.query).toHaveBeenCalledTimes(1);
    });

    test('returns null for inactive test', async () => {
      pool.query.mockResolvedValueOnce([[]]); // no existing
      pool.query.mockResolvedValueOnce([[]]); // no active test
      const result = await assignVariant(999, 'click_123');
      expect(result).toBeNull();
    });

    test('assigns variant for active test', async () => {
      pool.query.mockResolvedValueOnce([[]]); // no existing
      pool.query.mockResolvedValueOnce([[{
        variants: JSON.stringify([
          { name: 'A', weight: 50, landing_page_id: 1 },
          { name: 'B', weight: 50, landing_page_id: 2 },
        ])
      }]]); // active test
      pool.query.mockResolvedValueOnce([{ insertId: 1 }]); // insert

      const result = await assignVariant(1, 'click_456');
      expect(['A', 'B']).toContain(result);
    });

    test('same click_id always gets same variant (consistent)', async () => {
      // Run assignment 10 times with same click_id
      const variants = [];
      for (let i = 0; i < 10; i++) {
        jest.clearAllMocks();
        pool.query.mockResolvedValueOnce([[]]); // no existing
        pool.query.mockResolvedValueOnce([[{
          variants: JSON.stringify([
            { name: 'A', weight: 50 },
            { name: 'B', weight: 50 },
          ])
        }]]);
        pool.query.mockResolvedValueOnce([{ insertId: i }]);
        variants.push(await assignVariant(1, 'consistent_click'));
      }
      // All should be the same
      expect(new Set(variants).size).toBe(1);
    });
  });

  describe('getResults', () => {
    test('returns results from DB', async () => {
      const mockResults = [
        { variant_name: 'A', clicks: 100, conversions: 10, revenue: 500, conversion_rate: 10 },
        { variant_name: 'B', clicks: 100, conversions: 15, revenue: 750, conversion_rate: 15 },
      ];
      pool.query.mockResolvedValueOnce([mockResults]);

      const results = await getResults(1);
      expect(results).toHaveLength(2);
      expect(results[0].variant_name).toBe('A');
      expect(results[1].conversion_rate).toBe(15);
    });
  });
});
