'use strict';

const mockBackend = {
  consume: jest.fn(async () => ({ allowed: true, remaining: 99, retryAfter: 0 })),
};
const mockLogger = { error: jest.fn() };

jest.mock('../../lib/redisClient', () => mockBackend, { virtual: true });
jest.mock('../../logger', () => mockLogger);

beforeEach(() => {
  process.env.RATE_LIMIT_STRICT = 'true';
  delete process.env.RATE_LIMIT_DISABLED;
});
afterEach(() => {
  delete process.env.RATE_LIMIT_STRICT;
  delete process.env.RATE_LIMIT_DISABLED;
});

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

/**
 * Set up backend mock and load a fresh module instance.
 * Module-level mocks are installed via jest.mock at the file top;
 * this mutates mockBackend.consume for per-test control.
 */
function setupBackend(consumeImpl) {
  mockBackend.consume = consumeImpl || jest.fn(async () => ({ allowed: true, remaining: 99, retryAfter: 0 }));
}

function loadLimiter() {
  jest.resetModules();
  return require('../../middleware/globalRateLimit');
}

describe('globalRateLimit middleware', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('rateLimitGlobal shares counters across requests', async () => {
    const consume = jest.fn()
      .mockResolvedValueOnce({ allowed: true, remaining: 0, retryAfter: 0 })
      .mockResolvedValueOnce({ allowed: false, remaining: 0, retryAfter: 60 });

    setupBackend(consume);
    const limiter = loadLimiter();

    const nextA = jest.fn();
    await limiter.rateLimitGlobal(makeReq(), makeRes(), nextA);
    expect(nextA).toHaveBeenCalledTimes(1);

    const resB = makeRes();
    const nextB = jest.fn();
    await limiter.rateLimitGlobal(makeReq(), resB, nextB);

    expect(resB.status).toHaveBeenCalledWith(429);
    expect(resB.json).toHaveBeenCalledWith({ error: 'Too many requests', retryAfter: 60 });
    expect(nextB).not.toHaveBeenCalled();
  });

  test('rateLimitWrite shares counters across requests', async () => {
    const consume = jest.fn()
      .mockResolvedValueOnce({ allowed: true, remaining: 0, retryAfter: 0 })
      .mockResolvedValueOnce({ allowed: false, remaining: 0, retryAfter: 60 });

    setupBackend(consume);
    const limiter = loadLimiter();

    const nextA = jest.fn();
    await limiter.rateLimitWrite(makeReq(), makeRes(), nextA);
    expect(nextA).toHaveBeenCalledTimes(1);

    const resB = makeRes();
    const nextB = jest.fn();
    await limiter.rateLimitWrite(makeReq(), resB, nextB);

    expect(resB.status).toHaveBeenCalledWith(429);
    expect(resB.json).toHaveBeenCalledWith({ error: 'Too many write requests', retryAfter: 60 });
    expect(nextB).not.toHaveBeenCalled();
  });

  test('rateLimitGlobal isolates independent keys', async () => {
    const consume = jest.fn()
      .mockResolvedValueOnce({ allowed: true, remaining: 0, retryAfter: 0 })
      .mockResolvedValueOnce({ allowed: true, remaining: 99, retryAfter: 0 });

    setupBackend(consume);
    const limiter = loadLimiter();

    await limiter.rateLimitGlobal(makeReq({ ip: '203.0.113.10' }), makeRes(), jest.fn());

    const resB = makeRes();
    const nextB = jest.fn();
    await limiter.rateLimitGlobal(makeReq({ ip: '203.0.113.11', connection: { remoteAddress: '203.0.113.11' } }), resB, nextB);

    expect(nextB).toHaveBeenCalledTimes(1);
    expect(resB.status).not.toHaveBeenCalled();
  });

  test('rateLimitGlobal logs and fails open on backend connection error', async () => {
    setupBackend(jest.fn().mockRejectedValue(new Error('redis down')));
    const limiter = loadLimiter();

    const next = jest.fn();
    await limiter.rateLimitGlobal(makeReq(), makeRes(), next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(mockLogger.error).toHaveBeenCalledTimes(1);
    expect(mockLogger.error).toHaveBeenCalledWith(expect.objectContaining({
      event: 'rate_limit_backend_error',
      err: expect.any(Error),
      limiter: 'global',
    }), 'distributed rate limit backend failed');
  });

  test('rateLimitWrite logs and fails open on backend connection error', async () => {
    setupBackend(jest.fn().mockRejectedValue(new Error('redis down')));
    const limiter = loadLimiter();

    const next = jest.fn();
    await limiter.rateLimitWrite(makeReq(), makeRes(), next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(mockLogger.error).toHaveBeenCalledTimes(1);
    expect(mockLogger.error).toHaveBeenCalledWith(expect.objectContaining({
      event: 'rate_limit_backend_error',
      err: expect.any(Error),
      limiter: 'write',
    }), 'distributed rate limit backend failed');
  });

  test('rate limiter surfaces retryAfter when exhausted', async () => {
    setupBackend(jest.fn().mockResolvedValue({ allowed: false, remaining: 0, retryAfter: 17 }));
    const limiter = loadLimiter();

    const res = makeRes();
    await limiter.rateLimitGlobal(makeReq(), res, jest.fn());

    expect(res.status).toHaveBeenCalledWith(429);
    expect(res.json).toHaveBeenCalledWith({ error: 'Too many requests', retryAfter: 17 });
  });

  test('rate limiter fails open on Redis INCR/script error after partial counts exist', async () => {
    const consume = jest.fn()
      .mockResolvedValueOnce({ allowed: true, remaining: 2, retryAfter: 0 })
      .mockRejectedValueOnce(new Error('incr failed after partial state'));

    setupBackend(consume);
    let limiter = loadLimiter();
    await limiter.rateLimitGlobal(makeReq(), makeRes(), jest.fn());

    limiter = loadLimiter();
    const next = jest.fn();
    await limiter.rateLimitGlobal(makeReq(), makeRes(), next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(mockLogger.error).toHaveBeenCalledTimes(1);
    expect(mockLogger.error).toHaveBeenCalledWith(expect.objectContaining({
      event: 'rate_limit_backend_error',
      err: expect.any(Error),
      limiter: 'global',
    }), 'distributed rate limit backend failed');
  });
});
