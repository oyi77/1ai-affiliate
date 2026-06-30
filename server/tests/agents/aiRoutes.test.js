/**
 * Tests for /api/ai routes.
 *
 * Exercises the run/spend/kill-switch endpoints and the supervisor
 * registry. Authentication is bypassed by stubbing the middleware —
 * we test the AI flow, not the auth flow.
 */
process.env.AI_PROVIDER = 'mock';

const request = require('supertest');
const path = require('path');

// Force the AI route to load a fresh module per test by clearing cache
function loadApp() {
  jest.resetModules();
  // Stub auth so we don't need a real JWT
  jest.doMock(path.join(__dirname, '../../middleware/auth.js'), () => ({
    authenticate: (_req, _res, next) => next(),
    requireAdmin: (_req, _res, next) => next(),
    requireRole: () => (_req, _res, next) => next(),
  }));
  return require('../../app');
}

describe('/api/ai routes', () => {
  test('GET /api/ai/spend returns per-agent totals', async () => {
    const app = loadApp();
    const res = await request(app).get('/api/ai/spend');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('spend');
    expect(typeof res.body.spend).toBe('object');
  });

  test('POST /api/ai/kill-switch toggles the freeze', async () => {
    const app = loadApp();
    const freeze = await request(app).post('/api/ai/kill-switch').send({ frozen: true });
    expect(freeze.status).toBe(200);
    expect(freeze.body.frozen).toBe(true);

    const thaw = await request(app).post('/api/ai/kill-switch').send({ frozen: false });
    expect(thaw.status).toBe(200);
    expect(thaw.body.frozen).toBe(false);
  });

  test('POST /api/ai/run rejects unknown agent', async () => {
    const app = loadApp();
    const res = await request(app).post('/api/ai/run').send({ agent: 'nonexistent', input: {} });
    expect(res.status).toBe(404);
    expect(res.body.error).toContain('unknown agent');
  });

  test('POST /api/ai/run rejects bad payload', async () => {
    const app = loadApp();
    const res = await request(app).post('/api/ai/run').send({});
    expect(res.status).toBe(400);
  });

  test('POST /api/ai/run returns 503 when kill switch is engaged', async () => {
    const app = loadApp();
    await request(app).post('/api/ai/kill-switch').send({ frozen: true });
    const res = await request(app).post('/api/ai/run').send({ agent: 'fraud-detection', input: { limit: 1 } });
    expect(res.status).toBe(503);
    expect(res.body.error).toContain('frozen');
    // Thaw for subsequent tests
    await request(app).post('/api/ai/kill-switch').send({ frozen: false });
  });

  test('GET /api/ai/runs returns recent history', async () => {
    const app = loadApp();
    const res = await request(app).get('/api/ai/runs?limit=10');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('runs');
    expect(Array.isArray(res.body.runs)).toBe(true);
  });
});
