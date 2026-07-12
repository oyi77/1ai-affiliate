'use strict';

beforeEach(() => { process.env.RATE_LIMIT_STRICT = 'true'; });
afterEach(() => { delete process.env.RATE_LIMIT_STRICT; });

function makeReq(overrides = {}) {
  return {
    ip: '203.0.113.10',
    connection: { remoteAddress: '203.0.113.10' },
    user: { id: 42 },
    ...overrides,
  };
}

function makeRes() {
  return {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
    set: jest.fn().mockReturnThis(),
  };
}

function loadLimiterWithMocks({ backend, logger } = {}) {
  const sharedBackend = backend || {
    consume: jest.fn(async () => ({ allowed: true, remaining: 99, retryAfter: 0 })),
  };
  const sharedLogger = logger || { error: jest.fn() };

  let limiter;
  jest.isolateModules(() => {
    jest.doMock('../../lib/redisClient', () => sharedBackend, { virtual: true });
    jest.doMock('../../logger', () => sharedLogger);
    limiter = require('../../middleware/globalRateLimit');
  });

  return { limiter, backend: sharedBackend, logger: sharedLogger };
}

describe('globalRateLimit middleware', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('rateLimitGlobal shares counters across requests', async () => {
    const backend = {
      consume: jest.fn()
        .mockResolvedValueOnce({ allowed: true, remaining: 0, retryAfter: 0 })
        .mockResolvedValueOnce({ allowed: false, remaining: 0, retryAfter: 60 }),
    };

    const { limiter: instanceA } = loadLimiterWithMocks({ backend });
    const { limiter: instanceB } = loadLimiterWithMocks({ backend });

    const nextA = jest.fn();
    await instanceA.rateLimitGlobal(makeReq(), makeRes(), nextA);
    expect(nextA).toHaveBeenCalledTimes(1);

    const resB = makeRes();
    const nextB = jest.fn();
    await instanceB.rateLimitGlobal(makeReq(), resB, nextB);

    expect(resB.status).toHaveBeenCalledWith(429);
    expect(resB.json).toHaveBeenCalledWith({ error: 'Too many requests', retryAfter: 60 });
    expect(nextB).not.toHaveBeenCalled();
  });

  test('rateLimitWrite shares counters across requests', async () => {
    const backend = {
      consume: jest.fn()
        .mockResolvedValueOnce({ allowed: true, remaining: 0, retryAfter: 0 })
        .mockResolvedValueOnce({ allowed: false, remaining: 0, retryAfter: 60 }),
    };

    const { limiter: instanceA } = loadLimiterWithMocks({ backend });
    const { limiter: instanceB } = loadLimiterWithMocks({ backend });

    const nextA = jest.fn();
    await instanceA.rateLimitWrite(makeReq(), makeRes(), nextA);
    expect(nextA).toHaveBeenCalledTimes(1);

    const resB = makeRes();
    const nextB = jest.fn();
    await instanceB.rateLimitWrite(makeReq(), resB, nextB);

    expect(resB.status).toHaveBeenCalledWith(429);
    expect(resB.json).toHaveBeenCalledWith({ error: 'Too many write requests', retryAfter: 60 });
    expect(nextB).not.toHaveBeenCalled();
  });

  test('rateLimitGlobal isolates independent keys', async () => {
    const backend = {
      consume: jest.fn()
        .mockResolvedValueOnce({ allowed: true, remaining: 0, retryAfter: 0 })
        .mockResolvedValueOnce({ allowed: true, remaining: 99, retryAfter: 0 }),
    };

    const { limiter: instanceA } = loadLimiterWithMocks({ backend });
    const { limiter: instanceB } = loadLimiterWithMocks({ backend });

    await instanceA.rateLimitGlobal(makeReq({ ip: '203.0.113.10' }), makeRes(), jest.fn());

    const resB = makeRes();
    const nextB = jest.fn();
    await instanceB.rateLimitGlobal(makeReq({ ip: '203.0.113.11', connection: { remoteAddress: '203.0.113.11' } }), resB, nextB);

    expect(nextB).toHaveBeenCalledTimes(1);
    expect(resB.status).not.toHaveBeenCalled();
  });

  test('rateLimitGlobal logs and fails open on backend connection error', async () => {
    const backend = {
      consume: jest.fn().mockRejectedValue(new Error('redis down')),
    };
    const logger = { error: jest.fn() };
    const { limiter } = loadLimiterWithMocks({ backend, logger });

    const next = jest.fn();
    await limiter.rateLimitGlobal(makeReq(), makeRes(), next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(logger.error).toHaveBeenCalledTimes(1);
    expect(logger.error).toHaveBeenCalledWith(expect.objectContaining({
      event: 'rate_limit_backend_error',
      err: expect.any(Error),
      limiter: 'global',
    }), 'distributed rate limit backend failed');
  });

  test('rateLimitWrite logs and fails open on backend connection error', async () => {
    const backend = {
      consume: jest.fn().mockRejectedValue(new Error('redis down')),
    };
    const logger = { error: jest.fn() };
    const { limiter } = loadLimiterWithMocks({ backend, logger });

    const next = jest.fn();
    await limiter.rateLimitWrite(makeReq(), makeRes(), next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(logger.error).toHaveBeenCalledTimes(1);
    expect(logger.error).toHaveBeenCalledWith(expect.objectContaining({
      event: 'rate_limit_backend_error',
      err: expect.any(Error),
      limiter: 'write',
    }), 'distributed rate limit backend failed');
  });

  test('rate limiter surfaces retryAfter when exhausted', async () => {
    const backend = {
      consume: jest.fn().mockResolvedValue({ allowed: false, remaining: 0, retryAfter: 17 }),
    };

    const { limiter } = loadLimiterWithMocks({ backend });
    const res = makeRes();

    await limiter.rateLimitGlobal(makeReq(), res, jest.fn());

    expect(res.status).toHaveBeenCalledWith(429);
    expect(res.json).toHaveBeenCalledWith({ error: 'Too many requests', retryAfter: 17 });
  });

  test('rate limiter fails open on Redis INCR/script error after partial counts exist', async () => {
    const backend = {
      consume: jest.fn()
        .mockResolvedValueOnce({ allowed: true, remaining: 2, retryAfter: 0 })
        .mockRejectedValueOnce(new Error('incr failed after partial state')),
    };
    const logger = { error: jest.fn() };
    const { limiter: instanceA } = loadLimiterWithMocks({ backend, logger });
    const { limiter: instanceB } = loadLimiterWithMocks({ backend, logger });

    await instanceA.rateLimitGlobal(makeReq(), makeRes(), jest.fn());

    const next = jest.fn();
    await instanceB.rateLimitGlobal(makeReq(), makeRes(), next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(logger.error).toHaveBeenCalledTimes(1);
    expect(logger.error).toHaveBeenCalledWith(expect.objectContaining({
      event: 'rate_limit_backend_error',
      err: expect.any(Error),
      limiter: 'global',
    }), 'distributed rate limit backend failed');
  });
});
