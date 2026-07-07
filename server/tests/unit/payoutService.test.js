'use strict';

/**
 * Unit tests for payoutService + treasuryClient integration.
 * Tests: processAutoPayouts records treasury entry on successful payout.
 */

jest.mock('../../db/mysql', () => ({ query: jest.fn() }));
jest.mock('../../services/treasuryClient', () => ({
  recordToTreasury: jest.fn().mockResolvedValue(true),
}));
jest.mock('../../logger', () => ({
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
}));

const pool = require('../../db/mysql');
const { recordToTreasury } = require('../../services/treasuryClient');
const { processAutoPayouts } = require('../../services/payoutService');

describe('processAutoPayouts', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should_do_nothing_when_no_auto_approve_rules', async () => {
    pool.query.mockResolvedValueOnce([[]]); // no rules

    const results = await processAutoPayouts(pool);

    expect(results).toEqual([]);
    expect(recordToTreasury).not.toHaveBeenCalled();
  });

  test('should_skip_user_with_no_eligible_earnings', async () => {
    pool.query
      .mockResolvedValueOnce([[{ user_id: 1, min_amount: 50000, auto_approve: 1, payment_method: 'bank_transfer' }]])
      .mockResolvedValueOnce([[]]); // no eligible earnings

    const results = await processAutoPayouts(pool);

    expect(results).toEqual([{ user_id: 1, processed: 0 }]);
    expect(recordToTreasury).not.toHaveBeenCalled();
  });

  test('should_process_eligible_earnings_and_record_treasury', async () => {
    const rule = { user_id: 7, min_amount: 10000, auto_approve: 1, payment_method: 'bank_transfer' };
    const earnings = [
      { earning_id: 101, payout_amount: 75000, user_id: 7, affiliate_id: 3 },
      { earning_id: 102, payout_amount: 25000, user_id: 7, affiliate_id: 3 },
    ];

    pool.query
      .mockResolvedValueOnce([[rule]])        // SELECT rules
      .mockResolvedValueOnce([earnings])      // SELECT eligible
      .mockResolvedValueOnce([{}])            // UPDATE earnings status
      .mockResolvedValueOnce([{}]);           // UPDATE affiliates balance

    const results = await processAutoPayouts(pool);

    expect(results).toHaveLength(1);
    expect(results[0]).toMatchObject({
      user_id: 7,
      processed: 2,
      total: 100000,
      payment_method: 'bank_transfer',
    });

    expect(recordToTreasury).toHaveBeenCalledTimes(1);
    expect(recordToTreasury).toHaveBeenCalledWith(expect.objectContaining({
      source: '1ai-affiliate',
      amount_usd: 100000,
      direction: 'in',
      workflow: 'wf6_affiliate_payout',
      metadata: expect.objectContaining({
        user_id: 7,
        earning_ids: [101, 102],
        payment_method: 'bank_transfer',
      }),
    }));
  });

  test('should_not_fail_payout_when_treasury_client_rejects', async () => {
    // Treasury failure must not propagate — payout already processed
    recordToTreasury.mockRejectedValueOnce(new Error('hub down'));

    const rule = { user_id: 9, min_amount: 5000, auto_approve: 1, payment_method: 'tripay' };
    const earnings = [{ earning_id: 200, payout_amount: 60000, user_id: 9, affiliate_id: 5 }];

    pool.query
      .mockResolvedValueOnce([[rule]])
      .mockResolvedValueOnce([earnings])
      .mockResolvedValueOnce([{}])
      .mockResolvedValueOnce([{}]);

    const results = await processAutoPayouts(pool);

    // Payout still recorded correctly
    expect(results[0].processed).toBe(1);
    expect(results[0].total).toBe(60000);
    // No throw
  });

  test('should_process_multiple_users_independently', async () => {
    const rules = [
      { user_id: 1, min_amount: 10000, auto_approve: 1, payment_method: 'bank_transfer' },
      { user_id: 2, min_amount: 10000, auto_approve: 1, payment_method: 'gopay' },
    ];

    pool.query
      .mockResolvedValueOnce([rules])
      // user 1: has earnings
      .mockResolvedValueOnce([[{ earning_id: 1, payout_amount: 50000, user_id: 1, affiliate_id: 1 }]])
      .mockResolvedValueOnce([{}])
      .mockResolvedValueOnce([{}])
      // user 2: no earnings
      .mockResolvedValueOnce([[]])

    const results = await processAutoPayouts(pool);

    expect(results).toHaveLength(2);
    expect(results[0].processed).toBe(1);
    expect(results[1].processed).toBe(0);
    expect(recordToTreasury).toHaveBeenCalledTimes(1);
  });
});
