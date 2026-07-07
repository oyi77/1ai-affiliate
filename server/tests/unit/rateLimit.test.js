'use strict';

let rateLimitModule;

function loadRateLimit() {
  jest.resetModules();
  rateLimitModule = require('../../middleware/rateLimit');
  return rateLimitModule;
}

function makeReq(overrides = {}) {
  return { user: null, ip: '1.2.3.4', path: '/test', connection: {}, ...overrides };
}
function makeRes() {
  const res = { status: jest.fn(), json: jest.fn() };
  res.status.mockReturnValue(res);
  return res;
}

describe('rateLimit middleware', () => {
  beforeEach(() => loadRateLimit());

  describe('SlidingWindow (via rateLimitPostback)', () => {
    it('allows first request', () => {
      const { rateLimitPostback, resetRateLimit } = rateLimitModule;
      resetRateLimit('1.2.3.4');
      const next = jest.fn();
      rateLimitPostback(makeReq(), makeRes(), next);
      expect(next).toHaveBeenCalledTimes(1);
    });

    it('blocks after max requests in window', () => {
      const { rateLimitPostback, resetRateLimit, REQUEST_LIMIT } = rateLimitModule;
      resetRateLimit('5.5.5.5');
      const req = makeReq({ ip: '5.5.5.5' });
      const next = jest.fn();
      // Exhaust the limit
      for (let i = 0; i < REQUEST_LIMIT; i++) {
        rateLimitPostback(req, makeRes(), next);
      }
      const blockedRes = makeRes();
      rateLimitPostback(req, blockedRes, jest.fn());
      expect(blockedRes.status).toHaveBeenCalledWith(429);
      expect(blockedRes.json).toHaveBeenCalledWith(expect.objectContaining({ error: 'Too many requests' }));
    });

    it('allows again after reset', () => {
      const { rateLimitPostback, resetRateLimit, REQUEST_LIMIT } = rateLimitModule;
      const id = '6.6.6.6';
      resetRateLimit(id);
      const req = makeReq({ ip: id });
      for (let i = 0; i < REQUEST_LIMIT; i++) {
        rateLimitPostback(req, makeRes(), jest.fn());
      }
      resetRateLimit(id);
      const next = jest.fn();
      rateLimitPostback(req, makeRes(), next);
      expect(next).toHaveBeenCalledTimes(1);
    });

    it('includes retryAfter in 429 response', () => {
      const { rateLimitPostback, resetRateLimit, REQUEST_LIMIT } = rateLimitModule;
      const id = '7.7.7.7';
      resetRateLimit(id);
      const req = makeReq({ ip: id });
      for (let i = 0; i < REQUEST_LIMIT; i++) {
        rateLimitPostback(req, makeRes(), jest.fn());
      }
      const res = makeRes();
      rateLimitPostback(req, res, jest.fn());
      const body = res.json.mock.calls[0][0];
      expect(body.retryAfter).toBeGreaterThan(0);
    });
  });

  describe('getClientIdentifier', () => {
    it('uses user id when authenticated', () => {
      const { rateLimitRead, resetTier } = rateLimitModule;
      resetTier('read', 'user:99');
      const req = makeReq({ user: { id: 99 } });
      const next = jest.fn();
      rateLimitRead(req, makeRes(), next);
      expect(next).toHaveBeenCalledTimes(1);
    });

    it('falls back to ip when no user', () => {
      const { rateLimitRead, resetTier } = rateLimitModule;
      resetTier('read', '10.0.0.1');
      const next = jest.fn();
      rateLimitRead(makeReq({ ip: '10.0.0.1' }), makeRes(), next);
      expect(next).toHaveBeenCalledTimes(1);
    });

    it('uses unknown when no ip or user', () => {
      const { rateLimitRead, resetTier } = rateLimitModule;
      resetTier('read', 'unknown');
      const req = makeReq({ ip: undefined, user: null });
      delete req.connection;
      const next = jest.fn();
      rateLimitRead(req, makeRes(), next);
      expect(next).toHaveBeenCalledTimes(1);
    });
  });

  describe('tier-specific limits', () => {
    it('rateLimitAuth has lower limit than rateLimitAdmin', () => {
      const { AUTH_REQUEST_LIMIT, REQUEST_LIMIT } = rateLimitModule;
      expect(AUTH_REQUEST_LIMIT).toBeLessThan(REQUEST_LIMIT);
    });

    it('resetAuthRateLimit clears auth window for identifier', () => {
      const { rateLimitAuth, resetAuthRateLimit, AUTH_REQUEST_LIMIT } = rateLimitModule;
      const id = '11.11.11.11';
      resetAuthRateLimit(id);
      const req = makeReq({ ip: id });
      for (let i = 0; i < AUTH_REQUEST_LIMIT; i++) {
        rateLimitAuth(req, makeRes(), jest.fn());
      }
      const blockedRes = makeRes();
      rateLimitAuth(req, blockedRes, jest.fn());
      expect(blockedRes.status).toHaveBeenCalledWith(429);
      resetAuthRateLimit(id);
      const next = jest.fn();
      rateLimitAuth(req, makeRes(), next);
      expect(next).toHaveBeenCalledTimes(1);
    });

    it('resetTier with no identifier clears whole window', () => {
      const { rateLimitAi, resetTier } = rateLimitModule;
      resetTier('ai');
      const next = jest.fn();
      rateLimitAi(makeReq({ ip: '9.9.9.9' }), makeRes(), next);
      expect(next).toHaveBeenCalledTimes(1);
    });

    it('resetTier for unknown tier does not throw', () => {
      const { resetTier } = rateLimitModule;
      expect(() => resetTier('nonexistent', '1.2.3.4')).not.toThrow();
    });
  });
});
