'use strict';

describe('redisClient', () => {
  beforeEach(() => {
    jest.resetModules();
    delete process.env.REDIS_URL;
    delete process.env.REDIS_PASSWORD;
  });

  test('redisClient uses REDIS_URL fallback', () => {
    const redisClient = require('../../lib/redisClient');
    expect(redisClient.getConfig()).toEqual(expect.objectContaining({
      url: 'redis://localhost:6379',
    }));
  });

  test('redisClient surfaces connection refused', async () => {
    const redisClient = require('../../lib/redisClient');
    await expect(redisClient.connect({
      createClient: () => ({
        connect: jest.fn().mockRejectedValue(Object.assign(new Error('ECONNREFUSED'), { code: 'ECONNREFUSED' })),
      }),
    })).rejects.toMatchObject({ code: 'ECONNREFUSED' });
  });

  test('redisClient surfaces authentication failure', async () => {
    const redisClient = require('../../lib/redisClient');
    await expect(redisClient.connect({
      createClient: () => ({
        connect: jest.fn().mockRejectedValue(new Error('WRONGPASS invalid username-password pair')),
      }),
    })).rejects.toThrow('WRONGPASS');
  });

  test('redisClient surfaces timeout', async () => {
    const redisClient = require('../../lib/redisClient');
    await expect(redisClient.connect({
      createClient: () => ({
        connect: jest.fn().mockRejectedValue(new Error('Connection timeout')),
      }),
    })).rejects.toThrow('timeout');
  });
});
