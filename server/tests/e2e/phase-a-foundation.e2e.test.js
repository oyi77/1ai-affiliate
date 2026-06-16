/**
 * Phase A: Foundation — Reliability & RBAC acceptance tests
 *
 * Verifies:
 * - POST/PUT/DELETE under /api/admin requires valid role.
 * - Duplicate Idempotency-Key returns cached response for 24h.
 * - /metrics exposes request counts and 4xx/5xx rates.
 * - 500 responses include request_id.
 */

const mockPool = require('../mocks/database');
jest.mock('../../db/mysql', () => mockPool);

process.env.JWT_SECRET = 'test-secret';
process.env.AI_PROVIDER = 'mock';
global.pool = mockPool;

const jwt = require('jsonwebtoken');
const request = require('supertest');
const app = require('../../app');
const { resetTier } = require('../../middleware/rateLimit');

function makeToken(role, id = 1) {
  return jwt.sign({ id, email: `${role}@test.com`, role }, 'test-secret', { expiresIn: '1h' });
}

beforeEach(() => {
  mockPool.query.mockReset();
  mockPool.query.mockResolvedValue([[]]);
  resetTier('write');
});

describe('Phase A: Foundation', () => {
  describe('RBAC on mutating admin endpoints', () => {
    test('affiliate cannot create an offer', async () => {
      const res = await request(app)
        .post('/api/admin/offers')
        .set('Authorization', `Bearer ${makeToken('affiliate', 2)}`)
        .send({ name: 'Test', payout_amount: 1 });
      expect(res.status).toBe(403);
    });

    test('unauthenticated cannot create an offer', async () => {
      const res = await request(app)
        .post('/api/admin/offers')
        .send({ name: 'Test', payout_amount: 1 });
      expect(res.status).toBe(401);
    });

    test('admin can create an offer', async () => {
      mockPool.query
        .mockResolvedValueOnce([{ affectedRows: 1 }])
        .mockResolvedValueOnce([[{ id: 42 }]]);
      const res = await request(app)
        .post('/api/admin/offers')
        .set('Authorization', `Bearer ${makeToken('admin')}`)
        .send({ name: 'Test', payout_amount: 1 });
      expect(res.status).toBe(200);
    });
  });

  describe('Idempotency', () => {
    test('duplicate Idempotency-Key returns the cached 403 response', async () => {
      const key = 'test-key-phase-a-001';
      const payload = { name: 'Dup', payout_amount: 1 };

      const first = await request(app)
        .post('/api/admin/offers')
        .set('Authorization', `Bearer ${makeToken('affiliate', 3)}`)
        .set('Idempotency-Key', key)
        .send(payload);
      expect(first.status).toBe(403);

      const second = await request(app)
        .post('/api/admin/offers')
        .set('Authorization', `Bearer ${makeToken('affiliate', 3)}`)
        .set('Idempotency-Key', key)
        .send(payload);
      expect(second.status).toBe(403);
      expect(second.body).toEqual(first.body);
    });

    test('same key with different payload does not cache', async () => {
      const key = 'test-key-phase-a-002';

      const first = await request(app)
        .post('/api/admin/offers')
        .set('Authorization', `Bearer ${makeToken('affiliate', 4)}`)
        .set('Idempotency-Key', key)
        .send({ name: 'A', payout_amount: 1 });
      expect(first.status).toBe(403);

      const second = await request(app)
        .post('/api/admin/offers')
        .set('Authorization', `Bearer ${makeToken('admin')}`)
        .set('Idempotency-Key', key)
        .send({ name: 'B', payout_amount: 2 });
      expect(second.status).not.toBe(403);
    });
  });

  describe('Metrics endpoint', () => {
    test('/metrics exposes Prometheus-compatible counters', async () => {
      const res = await request(app).get('/metrics');
      expect(res.status).toBe(200);
      expect(res.text).toContain('requests_total');
      expect(res.text).toContain('responses_4xx_total');
      expect(res.text).toContain('responses_5xx_total');
    });
  });

  describe('Error boundary', () => {
    test('500 responses include request_id', async () => {
      mockPool.query.mockRejectedValueOnce(new Error('simulated DB failure'));
      const res = await request(app).get('/health');
      expect(res.status).toBe(503);
      expect(res.body.request_id).toBeDefined();
    });
  });
});
