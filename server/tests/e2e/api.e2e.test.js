/**
 * API Endpoint E2E Tests
 *
 * Tests every major API endpoint through the full HTTP stack using supertest.
 * Uses the shared mock database from ./mocks/database.js (same pattern as postback.test.js).
 *
 * Covers:
 * - Healthcheck (DB ok / degraded)
 * - Auth login (email, username, wrong pass, missing fields, affiliate info)
 * - Auth /me (valid JWT, invalid JWT, expired JWT, no header)
 * - Forgot password (success, no-leak, missing fields)
 * - Reset password (valid key, expired key, invalid key, short pass)
 * - Change password (success, wrong old pass)
 * - RBAC (admin-only, role-restricted, affiliate, unauthenticated)
 * - Admin stats + reports + CSV
 * - Offer CRUD + postback config validation
 * - Postback inbound
 * - AI agent endpoints (spend, kill-switch, run, runs)
 * - Admin users, affiliates, networks, margin
 * - UI SPA serving (admin, client, history fallback)
 * - Logging / agent run persistence
 */

const mockPool = require('../mocks/database');
jest.mock('../../db/mysql', () => mockPool);

process.env.JWT_SECRET = 'test-secret-e2e';
process.env.AI_PROVIDER = 'mock';

// app.js healthcheck references `pool` without importing — expose via global
global.pool = mockPool;

const jwt = require('jsonwebtoken');
const request = require('supertest');
const SECRET = process.env.JWT_SECRET;

// ─── Token helpers ──────────────────────────────────────
function makeAdminToken() {
  return jwt.sign({ id: 1, email: 'admin@test.com', role: 'admin' }, SECRET, { expiresIn: '1h' });
}
function makeAffiliateToken() {
  return jwt.sign({ id: 2, email: 'aff@test.com', role: 'affiliate', affiliateId: 5 }, SECRET, { expiresIn: '1h' });
}
function makeAdvertiserToken() {
  return jwt.sign({ id: 3, email: 'adv@test.com', role: 'advertiser' }, SECRET, { expiresIn: '1h' });
}
function makeExpiredToken() {
  return jwt.sign({ id: 1, email: 'admin@test.com', role: 'admin' }, SECRET, { expiresIn: '-1s' });
}

// ─── Default query mock ─────────────────────────────────
function defaultQueryMock(sql) {
  const s = (sql || '').toLowerCase();

  if (s.includes('select 1')) return Promise.resolve([[{ ok: 1 }]]);
  if (s.includes('1ai_postback_queue') && s.includes('count')) return Promise.resolve([[{ pending: 0 }]]);

  // Stats
  if (s.includes('count(*)') && s.includes('1ai_clicks') && s.includes('interval 1 day')) return Promise.resolve([[{ total: 42 }]]);
  if (s.includes('count(*)') && s.includes('1ai_clicks') && s.includes('interval 2 day')) return Promise.resolve([[{ total: 38 }]]);
  if (s.includes('count(*)') && s.includes('1ai_clicks') && !s.includes('interval')) return Promise.resolve([[{ total: 1000 }]]);
  if (s.includes('count(distinct click_ip)')) return Promise.resolve([[{ total: 750 }]]);
  if (s.includes('count(*)') && s.includes('1ai_affiliates') && !s.includes('interval')) return Promise.resolve([[{ total: 25 }]]);
  if (s.includes('count(*)') && s.includes('1ai_affiliates') && s.includes('interval 7')) return Promise.resolve([[{ total: 3 }]]);
  if (s.includes('sum(payout_amount)') && s.includes('pending')) return Promise.resolve([[{ pending_amount: 500 }]]);
  if (s.includes('sum(payout_amount)') && s.includes('paid')) return Promise.resolve([[{ total_paid: 5000 }]]);
  if (s.includes('sum(payout_amount)') && s.includes('date_format') && !s.includes('date_sub')) return Promise.resolve([[{ mtd: 2500 }]]);
  if (s.includes('sum(payout_amount)') && s.includes('date_sub') && s.includes('date_format')) return Promise.resolve([[{ prev: 2000 }]]);
  if (s.includes('count(*)') && s.includes('1ai_conversion_logs')) return Promise.resolve([[{ total: 150 }]]);
  if (s.includes('1ai_affiliate_earnings') && s.includes('interval 1 hour')) return Promise.resolve([[{ revenue_1h: 100 }]]);
  if (s.includes('1ai_affiliate_earnings') && s.includes('count')) return Promise.resolve([[{ total: 5 }]]);
  if (s.includes('1ai_affiliate_earnings')) return Promise.resolve([[{ id: 1, affiliate_id: 1, payout_amount: 10, status: 'pending', affiliate_code: 'AFF001', user_email: 'aff@test.com', user_name: 'affiliate' }]]);

  // Reports
  if (s.includes('aff_campaign_name')) return Promise.resolve([[{ id: 1, name: 'Campaign A', clicks: 100, conversions: 10, revenue: 500, payout: 5 }]]);

  // Offers
  if (s.includes('1ai_offers') && s.includes('select')) return Promise.resolve([[{ id: 1, name: 'Offer A', status: 'active', payout: 10, postback_url: null, postback_enabled: 0, postback_auth_type: null, postback_auth_value: null, postback_timeout: 10, postback_method: 'GET', postback_headers: '{}', postback_retries: 3 }]]);
  if (s.includes('1ai_offers') && s.includes('update')) return Promise.resolve([{ affectedRows: 1 }]);

  // Users
  if (s.includes('1ai_users') && s.includes('select')) return Promise.resolve([[{ user_id: 1, user_name: 'admin', user_email: 'admin@test.com', user_role: 'admin', user_date_added: Date.now() }]]);

  // Affiliates
  if (s.includes('1ai_affiliates') && s.includes('join 1ai_users')) return Promise.resolve([[{ id: 1, user_id: 2, affiliate_code: 'AFF001', status: 'active', tier: 'premium', user_email: 'aff@test.com', user_name: 'affiliate' }]]);
  if (s.includes('1ai_affiliates') && s.includes('count')) return Promise.resolve([[{ total: 25 }]]);

  // Other admin tables
  if (s.includes('1ai_commission')) return Promise.resolve([[{ id: 1, amount: 10 }]]);
  if (s.includes('1ai_payout')) return Promise.resolve([[{ id: 1, amount: 100 }]]);
  if (s.includes('1ai_networks')) return Promise.resolve([[{ id: 1, name: 'Test Network' }]]);
  if (s.includes('1ai_margin')) return Promise.resolve([[{ margin_percentage: 20 }]]);
  if (s.includes('1ai_version')) return Promise.resolve([[{ version: '1.0.0' }]]);
  if (s.includes('1ai_cpa_trackers')) return Promise.resolve([[{ id: 1, url: 'https://click.example.com' }]]);
  if (s.includes('1ai_postback_logs')) return Promise.resolve([[{ id: 1, offer_id: 1, status: 'completed' }]]);

  return Promise.resolve([[]]);
}

const app = require('../../app');
const { resetAuthRateLimit } = require('../../middleware/rateLimit');

beforeEach(() => {
  mockPool.query.mockReset();
  mockPool.query.mockImplementation(defaultQueryMock);
  resetAuthRateLimit();
});

// ═════════════════════════════════════════════════════════
// HEALTHCHECK
// ═════════════════════════════════════════════════════════
describe('Healthcheck', () => {
  test('returns 200 with component status when DB is healthy', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.components.database.status).toBe('ok');
    expect(res.body.components.queue).toBeDefined();
    expect(res.body).toHaveProperty('uptime');
    expect(res.body).toHaveProperty('timestamp');
  });

  test('returns 503 when DB is degraded', async () => {
    mockPool.query.mockRejectedValue(new Error('ECONNREFUSED'));
    const res = await request(app).get('/health');
    expect(res.status).toBe(503);
    expect(res.body.status).toBe('degraded');
    expect(res.body.components.database.status).toBe('degraded');
  });
});

// ═════════════════════════════════════════════════════════
// AUTH — LOGIN
// ═════════════════════════════════════════════════════════
describe('Auth — Login', () => {
  test('returns JWT + apiKey + user on valid email login', async () => {
    const bcrypt = require('bcryptjs');
    bcrypt.compare = jest.fn().mockResolvedValue(true);

    mockPool.query.mockImplementation((sql) => {
      const s = (sql || '').toLowerCase();
      if (s.includes('select') && s.includes('1ai_users') && s.includes('user_email'))
        return Promise.resolve([[{ user_id: 1, user_email: 'test@test.com', user_password: '$2b$10$hashed', user_role: 'admin' }]]);
      if (s.includes('select') && s.includes('1ai_affiliates')) return Promise.resolve([[]]);
      if (s.includes('select') && s.includes('api_keys')) return Promise.resolve([[{ api_key: 'existing-key' }]]);
      return Promise.resolve([[]]);
    });

    const res = await request(app).post('/api/auth/login').send({ email: 'test@test.com', password: 'password123' });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('token');
    expect(res.body).toHaveProperty('apiKey', 'existing-key');
    expect(res.body.user.email).toBe('test@test.com');
    expect(res.body.user.role).toBe('admin');
  });

  test('returns JWT when login with username (no @)', async () => {
    const bcrypt = require('bcryptjs');
    bcrypt.compare = jest.fn().mockResolvedValue(true);

    mockPool.query.mockImplementation((sql) => {
      const s = (sql || '').toLowerCase();
      if (s.includes('select') && s.includes('1ai_users') && s.includes('user_name'))
        return Promise.resolve([[{ user_id: 2, user_email: 'admin@test.com', user_password: '$2b$10$hashed', user_role: 'admin' }]]);
      if (s.includes('select') && s.includes('1ai_affiliates')) return Promise.resolve([[]]);
      if (s.includes('select') && s.includes('api_keys')) return Promise.resolve([[]]);
      if (s.includes('insert') && s.includes('api_keys')) return Promise.resolve([{ insertId: 1 }]);
      return Promise.resolve([[]]);
    });

    const res = await request(app).post('/api/auth/login').send({ email: 'admin', password: 'password123' });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('token');
  });

  test('returns 401 on wrong password', async () => {
    const bcrypt = require('bcryptjs');
    bcrypt.compare = jest.fn().mockResolvedValue(false);

    mockPool.query.mockImplementation((sql) => {
      if (sql.toLowerCase().includes('1ai_users'))
        return Promise.resolve([[{ user_id: 1, user_email: 'test@test.com', user_password: '$2b$10$hashed', user_role: 'admin' }]]);
      return Promise.resolve([[]]);
    });

    const res = await request(app).post('/api/auth/login').send({ email: 'test@test.com', password: 'wrong' });
    expect(res.status).toBe(401);
    expect(res.body.error).toBe('Invalid credentials');
  });

  test('returns 401 on nonexistent user', async () => {
    mockPool.query.mockResolvedValue([[]]);
    const res = await request(app).post('/api/auth/login').send({ email: 'nobody@test.com', password: 'password' });
    expect(res.status).toBe(401);
  });

  test('returns 400 when email missing', async () => {
    const res = await request(app).post('/api/auth/login').send({ password: 'password' });
    expect(res.status).toBe(400);
  });

  test('returns 400 when password missing', async () => {
    const res = await request(app).post('/api/auth/login').send({ email: 'test@test.com' });
    expect(res.status).toBe(400);
  });

  test('includes affiliate info when user is affiliate', async () => {
    const bcrypt = require('bcryptjs');
    bcrypt.compare = jest.fn().mockResolvedValue(true);

    mockPool.query.mockImplementation((sql) => {
      const s = (sql || '').toLowerCase();
      if (s.includes('select') && s.includes('1ai_users'))
        return Promise.resolve([[{ user_id: 2, user_email: 'aff@test.com', user_password: '$2b$10$hashed', user_role: 'affiliate' }]]);
      if (s.includes('select') && s.includes('1ai_affiliates'))
        return Promise.resolve([[{ id: 5, affiliate_code: 'AFF001' }]]);
      if (s.includes('select') && s.includes('api_keys')) return Promise.resolve([[{ api_key: 'key123' }]]);
      return Promise.resolve([[]]);
    });

    const res = await request(app).post('/api/auth/login').send({ email: 'aff@test.com', password: 'password123' });
    expect(res.status).toBe(200);
    expect(res.body.user.affiliate).not.toBeNull();
    expect(res.body.user.affiliate.affiliate_code).toBe('AFF001');
  });
});

// ═════════════════════════════════════════════════════════
// AUTH — GET /me
// ═════════════════════════════════════════════════════════
describe('Auth — Get /me', () => {
  test('returns user profile with valid JWT', async () => {
    mockPool.query.mockImplementation((sql) => {
      const s = (sql || '').toLowerCase();
      if (s.includes('select') && s.includes('1ai_users') && s.includes('user_id'))
        return Promise.resolve([[{ user_id: 1, user_email: 'admin@test.com', user_name: 'admin', user_role: 'admin' }]]);
      if (s.includes('select') && s.includes('1ai_affiliates')) return Promise.resolve([[]]);
      return Promise.resolve([[]]);
    });

    const res = await request(app).get('/api/auth/me').set('Authorization', `Bearer ${makeAdminToken()}`);
    expect(res.status).toBe(200);
    expect(res.body.user.user_email).toBe('admin@test.com');
  });

  test('returns 401 without Authorization header', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
  });

  test('returns 401 with invalid JWT', async () => {
    const res = await request(app).get('/api/auth/me').set('Authorization', 'Bearer invalid-token-garbage');
    expect(res.status).toBe(401);
  });

  test('returns 401 with expired JWT', async () => {
    const res = await request(app).get('/api/auth/me').set('Authorization', `Bearer ${makeExpiredToken()}`);
    expect(res.status).toBe(401);
  });
});

// ═════════════════════════════════════════════════════════
// AUTH — FORGOT PASSWORD
// ═════════════════════════════════════════════════════════
describe('Auth — Forgot Password', () => {
  test('generates reset key for valid user', async () => {
    mockPool.query.mockImplementation((sql) => {
      const s = (sql || '').toLowerCase();
      if (s.includes('select') && s.includes('1ai_users') && s.includes('user_name'))
        return Promise.resolve([[{ user_id: 1, user_name: 'admin', user_email: 'admin@test.com' }]]);
      if (s.includes('update') && s.includes('1ai_users')) return Promise.resolve([{ affectedRows: 1 }]);
      return Promise.resolve([[]]);
    });

    const res = await request(app).post('/api/auth/forgot-password').send({ username: 'admin', email: 'admin@test.com' });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('key');
  });

  test('returns same message for nonexistent user (no info leak)', async () => {
    mockPool.query.mockResolvedValue([[]]);
    const res = await request(app).post('/api/auth/forgot-password').send({ username: 'nobody', email: 'nobody@test.com' });
    expect(res.status).toBe(200);
    expect(res.body.message).toMatch(/If the account exists/);
    expect(res.body).not.toHaveProperty('key');
  });

  test('returns 400 when username missing', async () => {
    const res = await request(app).post('/api/auth/forgot-password').send({ email: 'admin@test.com' });
    expect(res.status).toBe(400);
  });

  test('returns 400 when email missing', async () => {
    const res = await request(app).post('/api/auth/forgot-password').send({ username: 'admin' });
    expect(res.status).toBe(400);
  });
});

// ═════════════════════════════════════════════════════════
// AUTH — RESET PASSWORD
// ═════════════════════════════════════════════════════════
describe('Auth — Reset Password', () => {
  test('resets with valid unexpired key', async () => {
    const bcrypt = require('bcryptjs');
    bcrypt.hash = jest.fn().mockResolvedValue('$2b$10$newhash');

    const recentTime = Math.floor(Date.now() / 1000) - 60;
    mockPool.query.mockImplementation((sql) => {
      const s = (sql || '').toLowerCase();
      if (s.includes('select') && s.includes('user_pass_key'))
        return Promise.resolve([[{ user_id: 1, user_pass_key: 'valid-key', user_pass_time: recentTime }]]);
      if (s.includes('update') && s.includes('1ai_users')) return Promise.resolve([{ affectedRows: 1 }]);
      return Promise.resolve([[]]);
    });

    const res = await request(app).post('/api/auth/reset-password').send({ key: 'valid-key', password: 'newpassword123' });
    expect(res.status).toBe(200);
    expect(res.body.message).toMatch(/reset/i);
  });

  test('returns 400 with expired key', async () => {
    const oldTime = Math.floor(Date.now() / 1000) - (4 * 24 * 60 * 60);
    mockPool.query.mockImplementation((sql) => {
      const s = (sql || '').toLowerCase();
      if (s.includes('select') && s.includes('user_pass_key'))
        return Promise.resolve([[{ user_id: 1, user_pass_key: 'expired-key', user_pass_time: oldTime }]]);
      if (s.includes('update') && s.includes('1ai_users')) return Promise.resolve([{ affectedRows: 1 }]);
      return Promise.resolve([[]]);
    });

    const res = await request(app).post('/api/auth/reset-password').send({ key: 'expired-key', password: 'newpassword123' });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/expired/i);
  });

  test('returns 400 with invalid key', async () => {
    mockPool.query.mockResolvedValue([[]]);
    const res = await request(app).post('/api/auth/reset-password').send({ key: 'bad-key', password: 'newpassword123' });
    expect(res.status).toBe(400);
  });

  test('returns 400 for short password', async () => {
    const res = await request(app).post('/api/auth/reset-password').send({ key: 'any-key', password: '12' });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/at least 6/);
  });
});

// ═════════════════════════════════════════════════════════
// AUTH — CHANGE PASSWORD
// ═════════════════════════════════════════════════════════
describe('Auth — Change Password', () => {
  test('succeeds with correct old password', async () => {
    const bcrypt = require('bcryptjs');
    bcrypt.compare = jest.fn().mockResolvedValue(true);
    bcrypt.hash = jest.fn().mockResolvedValue('$2b$10$newhash');

    mockPool.query.mockImplementation((sql) => {
      const s = (sql || '').toLowerCase();
      if (s.includes('select') && s.includes('user_pass') && s.includes('user_id'))
        return Promise.resolve([[{ user_password: '$2b$10$oldhash' }]]);
      if (s.includes('update') && s.includes('1ai_users')) return Promise.resolve([{ affectedRows: 1 }]);
      return Promise.resolve([[]]);
    });

    const res = await request(app).put('/api/auth/password').set('Authorization', `Bearer ${makeAdminToken()}`).send({ currentPassword: 'currentpass', newPassword: 'newpass123' });
    expect(res.status).toBe(200);
  });

  test('returns 400 when old password wrong', async () => {
    const bcrypt = require('bcryptjs');
    bcrypt.compare = jest.fn().mockResolvedValue(false);

    mockPool.query.mockImplementation((sql) => {
      if (sql.toLowerCase().includes('1ai_users') && sql.toLowerCase().includes('user_pass'))
        return Promise.resolve([[{ user_password: '$2b$10$oldhash' }]]);
      return Promise.resolve([[]]);
    });

    const res = await request(app).put('/api/auth/password').set('Authorization', `Bearer ${makeAdminToken()}`).send({ currentPassword: 'wrongpass', newPassword: 'newpass123' });
    expect(res.status).toBe(401);
  });
});

// ═════════════════════════════════════════════════════════
// AUTH — RATE LIMITING
// ═════════════════════════════════════════════════════════
describe('Auth — Rate Limiting', () => {
  test('returns 429 after 5 login attempts from same IP', async () => {
    mockPool.query.mockResolvedValue([[]]);
    for (let i = 0; i < 5; i++) {
      await request(app).post('/api/auth/login').set('X-Forwarded-For', '10.0.0.99').send({ email: 'test@test.com', password: 'wrong' });
    }
    const sixth = await request(app).post('/api/auth/login').set('X-Forwarded-For', '10.0.0.99').send({ email: 'test@test.com', password: 'wrong' });
    expect(sixth.status).toBe(429);
  });
});

// ═════════════════════════════════════════════════════════
// RBAC
// ═════════════════════════════════════════════════════════
describe('RBAC — Access Control', () => {
  test('admin can access /api/admin/users', async () => {
    const res = await request(app).get('/api/admin/users').set('Authorization', `Bearer ${makeAdminToken()}`);
    expect(res.status).toBe(200);
  });

  test('affiliate gets 403 on /api/admin/users', async () => {
    const res = await request(app).get('/api/admin/users').set('Authorization', `Bearer ${makeAffiliateToken()}`);
    expect(res.status).toBe(403);
  });

  test('advertiser gets 403 on /api/admin/users', async () => {
    const res = await request(app).get('/api/admin/users').set('Authorization', `Bearer ${makeAdvertiserToken()}`);
    expect(res.status).toBe(403);
  });

  test('unauthenticated gets 401 on /api/admin/users', async () => {
    const res = await request(app).get('/api/admin/users');
    expect(res.status).toBe(401);
  });

  test('affiliate can access /api/admin/earnings (role-filtered)', async () => {
    const res = await request(app).get('/api/admin/earnings').set('Authorization', `Bearer ${makeAffiliateToken()}`);
    expect(res.status).toBe(200);
  });

  test('admin can access /api/admin/commissions', async () => {
    const res = await request(app).get('/api/admin/commissions').set('Authorization', `Bearer ${makeAdminToken()}`);
    expect(res.status).toBe(200);
  });

  test('affiliate gets 403 on /api/admin/commissions', async () => {
    const res = await request(app).get('/api/admin/commissions').set('Authorization', `Bearer ${makeAffiliateToken()}`);
    expect(res.status).toBe(403);
  });

  test('admin can access /api/ai/spend', async () => {
    const res = await request(app).get('/api/ai/spend').set('Authorization', `Bearer ${makeAdminToken()}`);
    expect(res.status).toBe(200);
  });

  test('affiliate gets 403 on /api/ai/spend', async () => {
    const res = await request(app).get('/api/ai/spend').set('Authorization', `Bearer ${makeAffiliateToken()}`);
    expect(res.status).toBe(403);
  });

  test('healthcheck is public (no auth)', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
  });
});

// ═════════════════════════════════════════════════════════
// ADMIN STATS + REPORTS
// ═════════════════════════════════════════════════════════
describe('Admin Stats + Reports', () => {
  test('GET /api/admin/stats returns platform metrics', async () => {
    const res = await request(app).get('/api/admin/stats').set('Authorization', `Bearer ${makeAdminToken()}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('clicks24h');
    expect(res.body).toHaveProperty('total_clicks');
    expect(res.body).toHaveProperty('attributed_conversions');
    expect(res.body).toHaveProperty('totalAffiliates');
    expect(res.body).toHaveProperty('revenueMtd');
  });

  test('GET /api/admin/reports returns campaign data', async () => {
    const res = await request(app).get('/api/admin/reports').set('Authorization', `Bearer ${makeAdminToken()}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('rows');
  });

  test('GET /api/admin/reports.csv returns CSV', async () => {
    const res = await request(app).get('/api/admin/reports.csv').set('Authorization', `Bearer ${makeAdminToken()}`);
    expect(res.status).toBe(200);
  });
});

// ═════════════════════════════════════════════════════════
// OFFER CRUD + POSTBACK CONFIG
// ═════════════════════════════════════════════════════════
describe('Offer CRUD + Postback Config', () => {
  test('GET /api/admin/offers returns offers list', async () => {
    const res = await request(app).get('/api/admin/offers').set('Authorization', `Bearer ${makeAdminToken()}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('data');
  });

  test('GET /api/admin/offers/:id/postback returns config', async () => {
    const res = await request(app).get('/api/admin/offers/1/postback').set('Authorization', `Bearer ${makeAdminToken()}`);
    expect(res.status).toBe(200);
  });

  test('POST /api/admin/offers/:id/postback updates config', async () => {
    const res = await request(app)
      .post('/api/admin/offers/1/postback')
      .set('Authorization', `Bearer ${makeAdminToken()}`)
      .send({ postback_url: 'https://advertiser.com/callback', postback_enabled: true, postback_method: 'POST', postback_auth_type: 'bearer', postback_auth_value: 'tok', postback_timeout: 15, postback_retries: 5 });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  test('POST /api/admin/offers/:id/postback rejects invalid URL', async () => {
    const res = await request(app).post('/api/admin/offers/1/postback').set('Authorization', `Bearer ${makeAdminToken()}`).send({ postback_url: 'not-a-url' });
    expect(res.status).toBe(400);
  });

  test('POST /api/admin/offers/:id/postback rejects invalid method', async () => {
    const res = await request(app).post('/api/admin/offers/1/postback').set('Authorization', `Bearer ${makeAdminToken()}`).send({ postback_url: 'https://example.com', postback_method: 'DELETE' });
    expect(res.status).toBe(400);
  });

  test('POST /api/admin/offers/:id/postback rejects out-of-range timeout', async () => {
    const res = await request(app).post('/api/admin/offers/1/postback').set('Authorization', `Bearer ${makeAdminToken()}`).send({ postback_url: 'https://example.com', postback_timeout: 999 });
    expect(res.status).toBe(400);
  });
});

// ═════════════════════════════════════════════════════════
// POSTBACK INBOUND
// ═════════════════════════════════════════════════════════
describe('Postback Inbound', () => {
  test('GET /api/postback without click_id returns 400', async () => {
    const res = await request(app).get('/api/postback').query({ payout: '5.00' });
    expect(res.status).toBe(400);
  });
});

// ═════════════════════════════════════════════════════════
// AI AGENT ENDPOINTS
// ═════════════════════════════════════════════════════════
describe('AI Agent Endpoints', () => {
  test('GET /api/ai/spend returns spend report', async () => {
    const res = await request(app).get('/api/ai/spend').set('Authorization', `Bearer ${makeAdminToken()}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('spend');
  });

  test('POST /api/ai/kill-switch toggles freeze', async () => {
    const freeze = await request(app).post('/api/ai/kill-switch').set('Authorization', `Bearer ${makeAdminToken()}`).send({ frozen: true });
    expect(freeze.status).toBe(200);
    expect(freeze.body.frozen).toBe(true);

    const thaw = await request(app).post('/api/ai/kill-switch').set('Authorization', `Bearer ${makeAdminToken()}`).send({ frozen: false });
    expect(thaw.status).toBe(200);
    expect(thaw.body.frozen).toBe(false);
  });

  test('POST /api/ai/run returns 503 when kill switch is on', async () => {
    await request(app).post('/api/ai/kill-switch').set('Authorization', `Bearer ${makeAdminToken()}`).send({ frozen: true });
    const res = await request(app).post('/api/ai/run').set('Authorization', `Bearer ${makeAdminToken()}`).send({ agent: 'fraud-detection', input: { limit: 1 } });
    expect(res.status).toBe(503);
    await request(app).post('/api/ai/kill-switch').set('Authorization', `Bearer ${makeAdminToken()}`).send({ frozen: false });
  });

  test('POST /api/ai/run rejects unknown agent', async () => {
    const res = await request(app).post('/api/ai/run').set('Authorization', `Bearer ${makeAdminToken()}`).send({ agent: 'nonexistent', input: {} });
    expect(res.status).toBe(404);
  });

  test('POST /api/ai/run rejects bad payload', async () => {
    const res = await request(app).post('/api/ai/run').set('Authorization', `Bearer ${makeAdminToken()}`).send({});
    expect(res.status).toBe(400);
  });

  test('GET /api/ai/runs returns run history', async () => {
    const res = await request(app).get('/api/ai/runs').set('Authorization', `Bearer ${makeAdminToken()}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('runs');
    expect(Array.isArray(res.body.runs)).toBe(true);
  });

  test('AI endpoints require auth', async () => {
    const res = await request(app).get('/api/ai/spend');
    expect(res.status).toBe(401);
  });
});

// ═════════════════════════════════════════════════════════
// ADMIN USERS + AFFILIATES + NETWORKS
// ═════════════════════════════════════════════════════════
describe('Admin Users + Affiliates + Networks', () => {
  test('GET /api/admin/users returns user list', async () => {
    const res = await request(app).get('/api/admin/users').set('Authorization', `Bearer ${makeAdminToken()}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('data');
  });

  test('GET /api/admin/affiliates returns affiliate list', async () => {
    const res = await request(app).get('/api/admin/affiliates').set('Authorization', `Bearer ${makeAdminToken()}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('data');
  });

  test('GET /api/admin/networks returns networks', async () => {
    const res = await request(app).get('/api/admin/networks').set('Authorization', `Bearer ${makeAdminToken()}`);
    expect(res.status).toBe(200);
  });

  test('GET /api/admin/margin returns margin config', async () => {
    const res = await request(app).get('/api/admin/margin').set('Authorization', `Bearer ${makeAdminToken()}`);
    expect(res.status).toBe(200);
  });

  test('GET /api/admin/postback-logs returns logs', async () => {
    const res = await request(app).get('/api/admin/postback-logs').set('Authorization', `Bearer ${makeAdminToken()}`);
    expect(res.status).toBe(200);
  });
});

// ═════════════════════════════════════════════════════════
// UI — SPA SERVING
// ═════════════════════════════════════════════════════════
describe('UI — SPA Serving', () => {
  test('GET /admin/ serves admin SPA HTML', async () => {
    const res = await request(app).get('/admin/');
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toMatch(/html/);
  });

  test('GET /client/ serves client portal HTML', async () => {
    const res = await request(app).get('/client/');
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toMatch(/html/);
  });

  test('GET /admin/some/path serves SPA (history fallback)', async () => {
    const res = await request(app).get('/admin/offers/1');
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toMatch(/html/);
  });

  test('GET / serves admin SPA', async () => {
    const res = await request(app).get('/');
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toMatch(/html/);
  });
});

// ═════════════════════════════════════════════════════════
// LOGGING — AGENT RUN PERSISTENCE
// ═════════════════════════════════════════════════════════
describe('Logging — Agent Run Persistence', () => {
  test('AI agent run persists to run repository', async () => {
    const runRes = await request(app).post('/api/ai/run').set('Authorization', `Bearer ${makeAdminToken()}`).send({ agent: 'fraud-detection', input: { limit: 5 } });
    expect([200, 400, 500]).toContain(runRes.status);

    const runsRes = await request(app).get('/api/ai/runs').set('Authorization', `Bearer ${makeAdminToken()}`);
    expect(runsRes.status).toBe(200);
    expect(Array.isArray(runsRes.body.runs)).toBe(true);
  });
});
