/**
 * Role-Based Access Control E2E Tests
 *
 * Tests the full HTTP request→middleware→response path for every role
 * against admin, AI, and public endpoints. Focuses on status codes (401/403/200).
 */

const mockPool = require('../mocks/database');

// Mock db/mysql before anything else pulls it in
jest.mock('../../db/mysql', () => mockPool);

process.env.JWT_SECRET = 'test-secret';
process.env.AI_PROVIDER = 'mock';

// app.js healthcheck references `pool` without importing it — it resolves
// via the global scope. Expose mockPool so the healthcheck can reach it.
global.pool = mockPool;

const jwt = require('jsonwebtoken');
const request = require('supertest');

// ─── Token helpers ────────────────────────────────────────────────

function makeAdminToken() {
  return jwt.sign(
    { id: 1, email: 'admin@test.com', role: 'admin' },
    'test-secret',
    { expiresIn: '1h' }
  );
}

function makeAffiliateToken() {
  return jwt.sign(
    { id: 2, email: 'aff@test.com', role: 'affiliate', affiliateId: 5 },
    'test-secret',
    { expiresIn: '1h' }
  );
}

function makeAdvertiserToken() {
  return jwt.sign(
    { id: 3, email: 'adv@test.com', role: 'advertiser' },
    'test-secret',
    { expiresIn: '1h' }
  );
}

function makeExpiredToken() {
  return jwt.sign(
    { id: 1, email: 'admin@test.com', role: 'admin' },
    'test-secret',
    { expiresIn: '-1s' }
  );
}

// ─── Load app once ────────────────────────────────────────────────

const app = require('../../app');

// ─── Mock helpers ─────────────────────────────────────────────────

function mockQueryReturning(rows) {
  mockPool.query.mockResolvedValue([rows]);
}

function mockQueryDefault() {
  mockPool.query.mockResolvedValue([[]]);
}

beforeEach(() => {
  mockPool.query.mockReset();
  mockQueryDefault();
});

// ====================================================================
// Authentication middleware
// ====================================================================

describe('Authentication middleware', () => {
  test('returns 401 with no Authorization header', async () => {
    const res = await request(app).get('/api/admin/users');
    expect(res.status).toBe(401);
  });

  test('returns 401 with invalid token', async () => {
    const res = await request(app)
      .get('/api/admin/users')
      .set('Authorization', 'Bearer garbage');
    expect(res.status).toBe(401);
  });

  test('returns 401 with expired token', async () => {
    const res = await request(app)
      .get('/api/admin/users')
      .set('Authorization', `Bearer ${makeExpiredToken()}`);
    expect(res.status).toBe(401);
  });

  test('passes with valid JWT', async () => {
    mockQueryReturning([{ total: 0 }]);
    const res = await request(app)
      .get('/api/admin/stats')
      .set('Authorization', `Bearer ${makeAdminToken()}`);
    expect(res.status).toBe(200);
  });
});

// ====================================================================
// Admin-only endpoints
// ====================================================================

describe('Admin-only endpoints', () => {
  test('admin can access /api/admin/users', async () => {
    mockQueryReturning([
      { user_id: 1, user_name: 'Admin', user_email: 'admin@test.com', user_role: 'admin' },
    ]);
    const res = await request(app)
      .get('/api/admin/users')
      .set('Authorization', `Bearer ${makeAdminToken()}`);
    expect(res.status).toBe(200);
  });

  test('affiliate gets 403 on /api/admin/users', async () => {
    const res = await request(app)
      .get('/api/admin/users')
      .set('Authorization', `Bearer ${makeAffiliateToken()}`);
    expect(res.status).toBe(403);
    expect(res.body.error).toBe('Admin access required');
  });

  test('advertiser gets 403 on /api/admin/users', async () => {
    const res = await request(app)
      .get('/api/admin/users')
      .set('Authorization', `Bearer ${makeAdvertiserToken()}`);
    expect(res.status).toBe(403);
  });
});

// ====================================================================
// Role-restricted endpoints
// ====================================================================

describe('Role-restricted endpoints', () => {
  test('admin can access /api/admin/commissions', async () => {
    mockQueryReturning([{ id: 1, affiliate_id: 5, commission: 10 }]);
    const res = await request(app)
      .get('/api/admin/commissions')
      .set('Authorization', `Bearer ${makeAdminToken()}`);
    expect(res.status).toBe(200);
  });

  test('affiliate gets 403 on /api/admin/commissions', async () => {
    const res = await request(app)
      .get('/api/admin/commissions')
      .set('Authorization', `Bearer ${makeAffiliateToken()}`);
    expect(res.status).toBe(403);
    // Route uses requireAdmin (not requireRole), so the message is 'Admin access required'
    expect(res.body.error).toContain('Admin access required');
  });

  test('affiliate can access /api/admin/earnings (role-filtered)', async () => {
    mockQueryReturning([]);
    const res = await request(app)
      .get('/api/admin/earnings')
      .set('Authorization', `Bearer ${makeAffiliateToken()}`);
    expect(res.status).toBe(200);
  });

  test('admin can access /api/admin/earnings', async () => {
    mockQueryReturning([]);
    const res = await request(app)
      .get('/api/admin/earnings')
      .set('Authorization', `Bearer ${makeAdminToken()}`);
    expect(res.status).toBe(200);
  });
});

// ====================================================================
// AI endpoints require admin
// ====================================================================

describe('AI endpoints require admin', () => {
  test('admin can access /api/ai/spend', async () => {
    const res = await request(app)
      .get('/api/ai/spend')
      .set('Authorization', `Bearer ${makeAdminToken()}`);
    expect(res.status).toBe(200);
  });

  test('affiliate gets 403 on /api/ai/spend', async () => {
    const res = await request(app)
      .get('/api/ai/spend')
      .set('Authorization', `Bearer ${makeAffiliateToken()}`);
    expect(res.status).toBe(403);
  });

  test('unauthenticated gets 401 on /api/ai/spend', async () => {
    const res = await request(app).get('/api/ai/spend');
    expect(res.status).toBe(401);
  });
});

// ====================================================================
// Healthcheck is public
// ====================================================================

describe('Healthcheck is public', () => {
  test('healthcheck works without auth', async () => {
    mockPool.query.mockResolvedValue([[{ ok: 1 }]]);
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
  });
});
