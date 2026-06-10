/**
 * E2E tests for /api/auth routes.
 *
 * Mocks the database pool (db/mysql) and bcryptjs at module level,
 * then loads a fresh app per test via jest.resetModules() so each test
 * gets isolated Express instances with fresh rate-limiter state.
 */

jest.mock('../../db/mysql', () => ({ query: jest.fn(), end: jest.fn() }));
jest.mock('bcryptjs', () => ({
  compare: jest.fn(),
  hash: jest.fn(),
}));

const jwt = require('jsonwebtoken');
const request = require('supertest');

// Mutable references — reassigned by loadApp() after resetModules()
let pool;
let bcrypt;

// ── Env vars ───────────────────────────────────────────────────────
process.env.JWT_SECRET = 'test-secret';
process.env.AI_PROVIDER = 'mock';
process.env.NODE_ENV = 'test';

// ── Helpers ────────────────────────────────────────────────────────

/**
 * Set up pool.query to return [rows] in call order.
 *
 * Each entry in `responses` is either:
 *   - An array of row objects  → returned as [[...rows]]
 *   - A plain object (e.g. { insertId }) → returned as [obj]
 *   - undefined                → returned as [[]]
 */
function mockPoolQuery(responses) {
  pool.query.mockImplementation(() => {
    const next = responses.shift();
    if (next === undefined) {
      return Promise.resolve([[]]);
    }
    if (next instanceof Error) {
      return Promise.reject(next);
    }
    // Already [[rows]] — pass through
    if (Array.isArray(next) && next.length > 0 && Array.isArray(next[0])) {
      return Promise.resolve(next);
    }
    // Array of row objects or empty array → wrap
    return Promise.resolve([next]);
  });
}

/** Load a fresh app with re-mocked modules. */
function loadApp() {
  jest.resetModules();
  jest.doMock('../../db/mysql', () => ({ query: jest.fn(), end: jest.fn() }));
  jest.doMock('bcryptjs', () => ({
    compare: jest.fn(),
    hash: jest.fn(),
  }));
  const app = require('../../app');
  pool = require('../../db/mysql');
  bcrypt = require('bcryptjs');
  return app;
}

// ── Test data ──────────────────────────────────────────────────────
const USER_ROW = {
  user_id: 1,
  user_email: 'test@test.com',
  user_password: '$2b$10$hashed',
  user_role: 'admin',
};

const AFFILIATE_ROW = { id: 5, affiliate_code: 'AFF001' };

// ── Tests ──────────────────────────────────────────────────────────
describe('POST /api/auth/login', () => {
  let app;

  beforeEach(() => {
    jest.clearAllMocks();
    app = loadApp();
  });

  it('returns JWT, apiKey, and user on valid email login', async () => {
    mockPoolQuery([
      [USER_ROW],        // SELECT user by email
      [AFFILIATE_ROW],   // SELECT affiliates (login response)
      [],                // SELECT api_keys → none → new key generated
      { insertId: 1 },   // INSERT api_keys
    ]);
    bcrypt.compare.mockResolvedValue(true);

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@test.com', password: 'password123' });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('token');
    expect(res.body).toHaveProperty('apiKey');
    expect(typeof res.body.apiKey).toBe('string');
    expect(res.body.user).toEqual({
      id: 1,
      email: 'test@test.com',
      role: 'admin',
      affiliate: { id: 5, affiliate_code: 'AFF001' },
    });
    expect(bcrypt.compare).toHaveBeenCalledWith('password123', '$2b$10$hashed');
    // Verify SQL targeted user_email
    expect(pool.query.mock.calls[0][0]).toContain('user_email');
  });

  it('returns JWT when login with username (no @)', async () => {
    const usernameUser = {
      user_id: 1,
      user_email: 'test@test.com',
      user_password: '$2b$10$hashed',
      user_role: 'admin',
    };
    mockPoolQuery([
      [usernameUser],    // SELECT user by user_name
      [],                // SELECT affiliates (login)
      [],                // SELECT api_keys
      { insertId: 1 },   // INSERT api_keys
    ]);
    bcrypt.compare.mockResolvedValue(true);

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin', password: 'pass123' });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('token');
    // Verify SQL used user_name column
    expect(pool.query.mock.calls[0][0]).toContain('user_name');
  });

  it('returns 401 on wrong password', async () => {
    mockPoolQuery([[USER_ROW]]);
    bcrypt.compare.mockResolvedValue(false);

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@test.com', password: 'wrong' });

    expect(res.status).toBe(401);
    expect(res.body.error).toBe('Invalid credentials');
  });

  it('returns 401 on nonexistent user', async () => {
    mockPoolQuery([[]]);

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'nobody@test.com', password: 'pass' });

    expect(res.status).toBe(401);
    expect(res.body.error).toBe('Invalid credentials');
  });

  it('returns 400 when email missing', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ password: 'test' });

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/required/i);
  });

  it('returns 400 when password missing', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@test.com' });

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/required/i);
  });

  it('returns existing apiKey if one exists', async () => {
    mockPoolQuery([
      [USER_ROW],                    // SELECT user
      [AFFILIATE_ROW],               // SELECT affiliates (login)
      [{ api_key: 'existing-key' }], // SELECT api_keys → found
    ]);
    bcrypt.compare.mockResolvedValue(true);

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@test.com', password: 'password123' });

    expect(res.status).toBe(200);
    expect(res.body.apiKey).toBe('existing-key');
    // Should NOT have called INSERT
    const insertCalls = pool.query.mock.calls.filter(
      ([sql]) => typeof sql === 'string' && sql.includes('INSERT')
    );
    expect(insertCalls).toHaveLength(0);
  });

  it('includes affiliate info in response when user is affiliate', async () => {
    const affiliateUser = { ...USER_ROW, user_role: 'affiliate' };
    mockPoolQuery([
      [affiliateUser],   // SELECT user
      [AFFILIATE_ROW],   // SELECT affiliates (login response)
      [AFFILIATE_ROW],   // SELECT affiliates (generateToken — role is affiliate)
      [],                // SELECT api_keys
      { insertId: 1 },   // INSERT api_keys
    ]);
    bcrypt.compare.mockResolvedValue(true);

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@test.com', password: 'password123' });

    expect(res.status).toBe(200);
    expect(res.body.user.affiliate).not.toBeNull();
    expect(res.body.user.affiliate).toEqual(AFFILIATE_ROW);
  });
});

// ────────────────────────────────────────────────────────────────────
describe('GET /api/auth/me', () => {
  let app;

  beforeEach(() => {
    jest.clearAllMocks();
    app = loadApp();
  });

  const ME_USER = {
    user_id: 1,
    user_email: 'a@b.com',
    user_name: 'ab',
    user_role: 'admin',
  };
  const ME_AFFILIATE = {
    id: 10,
    user_id: 1,
    affiliate_code: 'AFF010',
    balance: 125.5,
    pending_conversions: 3,
    paid_conversions: 7,
  };

  it('returns user profile with affiliate data for valid JWT', async () => {
    const token = jwt.sign(
      { id: 1, email: 'a@b.com', role: 'admin' },
      'test-secret'
    );
    mockPoolQuery([
      [ME_USER],        // SELECT user
      [ME_AFFILIATE],   // SELECT affiliates with earnings
    ]);

    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.user.user_id).toBe(1);
    expect(res.body.user.user_email).toBe('a@b.com');
    expect(res.body.affiliate).toEqual(ME_AFFILIATE);
  });

  it('returns 401 without Authorization header', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
  });

  it('returns 401 with invalid JWT', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', 'Bearer invalid-token');

    expect(res.status).toBe(401);
    expect(res.body.error).toMatch(/invalid|expired/i);
  });

  it('returns 401 with expired JWT', async () => {
    const expiredToken = jwt.sign(
      { id: 1, email: 'a@b.com', role: 'admin' },
      'test-secret',
      { expiresIn: '-1s' }
    );

    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${expiredToken}`);

    expect(res.status).toBe(401);
  });
});

// ────────────────────────────────────────────────────────────────────
describe('POST /api/auth/forgot-password', () => {
  let app;

  beforeEach(() => {
    jest.clearAllMocks();
    app = loadApp();
  });

  it('generates reset key for valid user', async () => {
    mockPoolQuery([
      [{ user_id: 1, user_name: 'testuser', user_email: 'test@test.com' }], // SELECT user
      { affectedRows: 1 },                                                   // UPDATE pass_key
    ]);

    const res = await request(app)
      .post('/api/auth/forgot-password')
      .send({ username: 'testuser', email: 'test@test.com' });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('key');
    expect(typeof res.body.key).toBe('string');
    expect(res.body.key.length).toBeGreaterThan(0);
  });

  it('returns same message for nonexistent user (no leak)', async () => {
    mockPoolQuery([[]]);

    const res = await request(app)
      .post('/api/auth/forgot-password')
      .send({ username: 'nobody', email: 'nobody@test.com' });

    expect(res.status).toBe(200);
    expect(res.body.message).toMatch(/if the account exists/i);
    expect(res.body).not.toHaveProperty('key');
  });

  it('returns 400 when username missing', async () => {
    const res = await request(app)
      .post('/api/auth/forgot-password')
      .send({ email: 'test@test.com' });

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/required/i);
  });

  it('returns 400 when email missing', async () => {
    const res = await request(app)
      .post('/api/auth/forgot-password')
      .send({ username: 'testuser' });

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/required/i);
  });
});

// ────────────────────────────────────────────────────────────────────
describe('POST /api/auth/reset-password', () => {
  let app;

  beforeEach(() => {
    jest.clearAllMocks();
    app = loadApp();
  });

  it('resets password with valid unexpired key', async () => {
    const recentTimestamp = Math.floor(Date.now() / 1000) - 60;
    mockPoolQuery([
      [{ user_id: 1, user_pass_key: 'valid-key', user_pass_time: recentTimestamp }],
      { affectedRows: 1 },
    ]);
    bcrypt.hash.mockResolvedValue('$2b$10$newhashed');

    const res = await request(app)
      .post('/api/auth/reset-password')
      .send({ key: 'valid-key', password: 'newpassword123' });

    expect(res.status).toBe(200);
    expect(res.body.message).toMatch(/reset/i);
    expect(bcrypt.hash).toHaveBeenCalledWith('newpassword123', 10);
  });

  it('returns 400 with expired key', async () => {
    const fourDaysAgo = Math.floor(Date.now() / 1000) - 4 * 24 * 60 * 60;
    mockPoolQuery([
      [{ user_id: 1, user_pass_key: 'old-key', user_pass_time: fourDaysAgo }],
      { affectedRows: 1 },
    ]);

    const res = await request(app)
      .post('/api/auth/reset-password')
      .send({ key: 'old-key', password: 'newpassword123' });

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/expired/i);
  });

  it('returns 400 with invalid key', async () => {
    mockPoolQuery([[]]);

    const res = await request(app)
      .post('/api/auth/reset-password')
      .send({ key: 'invalid-key', password: 'newpassword123' });

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/invalid|expired/i);
  });

  it('returns 400 for short password', async () => {
    const res = await request(app)
      .post('/api/auth/reset-password')
      .send({ key: 'abc', password: '12' });

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/at least 6/i);
  });
});

// ────────────────────────────────────────────────────────────────────
describe('POST /api/auth/change-password', () => {
  let app;

  beforeEach(() => {
    jest.clearAllMocks();
    app = loadApp();
  });

  it('changes password when old password correct', async () => {
    const token = jwt.sign(
      { id: 1, email: 'test@test.com', role: 'admin' },
      'test-secret'
    );
    mockPoolQuery([
      [{ user_pass: '$2b$10$oldhashed' }], // SELECT user_pass
      { affectedRows: 1 },                  // UPDATE password
    ]);
    bcrypt.compare.mockResolvedValue(true);
    bcrypt.hash.mockResolvedValue('$2b$10$newhashed');

    const res = await request(app)
      .put('/api/auth/password')
      .set('Authorization', `Bearer ${token}`)
      .send({ currentPassword: 'oldpass', newPassword: 'newpass123' });

    expect(res.status).toBe(200);
    expect(res.body.message).toMatch(/changed/i);
    expect(bcrypt.compare).toHaveBeenCalledWith('oldpass', '$2b$10$oldhashed');
    expect(bcrypt.hash).toHaveBeenCalledWith('newpass123', 10);
  });

  it('returns 401 when old password wrong', async () => {
    const token = jwt.sign(
      { id: 1, email: 'test@test.com', role: 'admin' },
      'test-secret'
    );
    mockPoolQuery([
      [{ user_pass: '$2b$10$oldhashed' }],
    ]);
    bcrypt.compare.mockResolvedValue(false);

    const res = await request(app)
      .put('/api/auth/password')
      .set('Authorization', `Bearer ${token}`)
      .send({ currentPassword: 'wrongpass', newPassword: 'newpass123' });

    expect(res.status).toBe(401);
    expect(res.body.error).toMatch(/incorrect/i);
  });
});

// ────────────────────────────────────────────────────────────────────
describe('Rate limiting', () => {
  let app;

  beforeEach(() => {
    jest.clearAllMocks();
    app = loadApp();
  });

  it('returns 429 after 5 login attempts from same IP', async () => {
    // Each successful login makes 4 pool.query calls:
    //   SELECT user, SELECT affiliates (login), SELECT api_keys, INSERT api_keys
    // (generateToken does NOT query for admin role)
    let callIndex = 0;
    pool.query.mockImplementation(() => {
      callIndex++;
      // Return valid user on 1st call of each login cycle (calls 1, 5, 9, 13, 17)
      if ((callIndex - 1) % 4 === 0) {
        return Promise.resolve([[USER_ROW]]);
      }
      return Promise.resolve([[]]);
    });
    bcrypt.compare.mockResolvedValue(true);

    const loginPayload = { email: 'test@test.com', password: 'password123' };
    const results = [];
    for (let i = 0; i < 6; i++) {
      const res = await request(app).post('/api/auth/login').send(loginPayload);
      results.push(res.status);
    }

    // First 5 should succeed, 6th should be rate-limited
    for (let i = 0; i < 5; i++) {
      expect(results[i]).toBe(200);
    }
    expect(results[5]).toBe(429);
  });
});
