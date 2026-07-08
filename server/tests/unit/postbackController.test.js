'use strict';

jest.mock('../../db/mysql', () => ({ query: jest.fn() }));
jest.mock('https');
jest.mock('http');
jest.mock('../../services/postbackQueue', () => ({ enqueue: jest.fn().mockResolvedValue(undefined) }));
jest.mock('../../services/capiService', () => ({ handleConversion: jest.fn().mockResolvedValue(undefined) }));
jest.mock('../../services/zapierService', () => ({ fireWebhooksForEvent: jest.fn().mockResolvedValue(undefined) }));

const pool = require('../../db/mysql');
const https = require('https');
const http = require('http');

const {
  receivePostback,
  firePostback,
  getPostbackLogs,
  setOfferPostback,
  getOfferPostback,
  parsePostbackHeaders,
  normalizeInteger,
} = require('../../controllers/postbackController');

// resetAllMocks flushes queued mockResolvedValueOnce values between tests;
// clearAllMocks only resets call history and causes cross-test bleed.
beforeEach(() => {
  jest.resetAllMocks();
  // Re-arm the fire-and-forget mocks that receivePostback calls without await.
  const postbackQueue = require('../../services/postbackQueue');
  const capiService   = require('../../services/capiService');
  const zapierService = require('../../services/zapierService');
  postbackQueue.enqueue.mockResolvedValue(undefined);
  capiService.handleConversion.mockResolvedValue(undefined);
  zapierService.fireWebhooksForEvent.mockResolvedValue(undefined);
});

// ── helpers ───────────────────────────────────────────────────────────────────

function makeRes() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

function makeReq(overrides = {}) {
  return {
    query: {},
    body: {},
    headers: {},
    ip: '127.0.0.1',
    ...overrides,
  };
}

// Mock an http/https client.request that calls back with given status/body
function mockHttpRequest(client, statusCode = 200, body = 'ok') {
  const fakeRes = {
    statusCode,
    on: jest.fn((event, cb) => {
      if (event === 'data') cb(body);
      if (event === 'end') cb();
    }),
  };
  const fakeReq = {
    on: jest.fn(),
    write: jest.fn(),
    end: jest.fn(),
  };
  client.request.mockImplementation((_url, _opts, callback) => {
    callback(fakeRes);
    return fakeReq;
  });
  return fakeReq;
}

// ── parsePostbackHeaders ──────────────────────────────────────────────────────

describe('parsePostbackHeaders', () => {
  test('returns {} for null/undefined', () => {
    expect(parsePostbackHeaders(null)).toEqual({});
    expect(parsePostbackHeaders(undefined)).toEqual({});
    expect(parsePostbackHeaders('')).toEqual({});
  });

  test('parses valid JSON string', () => {
    expect(parsePostbackHeaders('{"X-Token":"abc"}')).toEqual({ 'X-Token': 'abc' });
  });

  test('returns {} for invalid JSON string — line 130-131', () => {
    expect(parsePostbackHeaders('not-json')).toEqual({});
  });

  test('returns {} for JSON array — line 150-151', () => {
    expect(parsePostbackHeaders('[1,2,3]')).toEqual({});
  });

  test('returns {} for JSON non-object scalar — line 150-151', () => {
    expect(parsePostbackHeaders('"string"')).toEqual({});
  });

  test('accepts plain object directly', () => {
    expect(parsePostbackHeaders({ 'X-Key': 'v' })).toEqual({ 'X-Key': 'v' });
  });

  test('filters entries with empty keys or null values', () => {
    const result = parsePostbackHeaders({ '': 'v', key: null, ok: 'yes' });
    expect(result).toEqual({ ok: 'yes' });
  });
});

// ── normalizeInteger ──────────────────────────────────────────────────────────

describe('normalizeInteger', () => {
  test('returns default for undefined', () => {
    expect(normalizeInteger(undefined, 5, 1, 10)).toBe(5);
  });
  test('returns value when in range', () => {
    expect(normalizeInteger(3, 5, 1, 10)).toBe(3);
  });
  test('returns default for out-of-range', () => {
    expect(normalizeInteger(99, 5, 1, 10)).toBe(5);
  });
  test('returns default for non-integer float', () => {
    expect(normalizeInteger(3.5, 5, 1, 10)).toBe(5);
  });
});

// ── receivePostback ───────────────────────────────────────────────────────────

describe('receivePostback', () => {

  test('400 when click_id missing', async () => {
    const res = makeRes();
    await receivePostback(makeReq(), res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'click_id required' });
  });

  test('404 when click not found', async () => {
    pool.query.mockResolvedValueOnce([[]]); // clickRows empty
    const res = makeRes();
    await receivePostback(makeReq({ query: { click_id: 'C1' } }), res);
    expect(res.status).toHaveBeenCalledWith(404);
  });

  test('409 when dedupe_hash already exists', async () => {
    pool.query
      .mockResolvedValueOnce([[{ click_id: 'C1', affiliate_id: 1, offer_id: 1 }]]) // click
      .mockResolvedValueOnce([[{ id: 99 }]]); // existing dedupe
    const res = makeRes();
    await receivePostback(makeReq({ query: { click_id: 'C1' } }), res);
    expect(res.status).toHaveBeenCalledWith(409);
  });

  test('403 on bad signature', async () => {
    pool.query
      .mockResolvedValueOnce([[{ click_id: 'C1', affiliate_id: 1, offer_id: 1, postback_auth_type: 'signature', postback_auth_value: 'secret' }]])
      .mockResolvedValueOnce([[]]); // no dedupe
    const res = makeRes();
    await receivePostback(makeReq({ query: { click_id: 'C1', sig: 'bad' } }), res);
    expect(res.status).toHaveBeenCalledWith(403);
  });

  test('200 happy path fires postbackQueue.enqueue', async () => {
    pool.query
      .mockResolvedValueOnce([[{ click_id: 'C1', affiliate_id: 1, offer_id: 1, postback_auth_type: null }]]) // click
      .mockResolvedValueOnce([[]])   // dedupe check
      .mockResolvedValueOnce([{ insertId: 42 }]) // logPostback INSERT
      .mockResolvedValueOnce([{}])   // update click converted
      .mockResolvedValueOnce([{}]);  // insert earnings
    const postbackQueue = require('../../services/postbackQueue');
    const res = makeRes();
    await receivePostback(makeReq({ query: { click_id: 'C1', payout: '5.00' } }), res);
    expect(postbackQueue.enqueue).toHaveBeenCalledWith(42);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true, postback_id: 42 }));
  });

  test('409 on ER_DUP_ENTRY DB error — line 113', async () => {
    pool.query
      .mockResolvedValueOnce([[{ click_id: 'C1', affiliate_id: 1, offer_id: 1, postback_auth_type: null }]])
      .mockResolvedValueOnce([[]])
      .mockRejectedValueOnce(Object.assign(new Error('uk_offer_click'), { code: 'ER_DUP_ENTRY' }));
    const res = makeRes();
    await receivePostback(makeReq({ query: { click_id: 'C1' } }), res);
    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith({ error: 'Postback already received for this click' });
  });

  test('500 on unexpected DB error — line 123', async () => {
    pool.query
      .mockResolvedValueOnce([[{ click_id: 'C1', affiliate_id: 1, offer_id: 1, postback_auth_type: null }]])
      .mockResolvedValueOnce([[]])
      .mockRejectedValueOnce(new Error('unexpected db crash'));
    const res = makeRes();
    await receivePostback(makeReq({ query: { click_id: 'C1' } }), res);
    expect(res.status).toHaveBeenCalledWith(500);
  });
});

// ── firePostback ──────────────────────────────────────────────────────────────

describe('firePostback', () => {

  test('throws when postback log not found', async () => {
    pool.query
      .mockResolvedValueOnce([[]])              // logs empty → throws
      .mockResolvedValueOnce([[]])              // catch: SELECT retry_count (no rows)
      .mockResolvedValueOnce([{}]);             // catch: UPDATE (skipped, but guard anyway)
    await expect(firePostback(999)).rejects.toThrow('Postback log not found');
  });

  test('throws when postback not enabled — line 178', async () => {
    pool.query
      .mockResolvedValueOnce([[{ id: 1, offer_id: 10, click_id: 'C1', payout: 5 }]])
      .mockResolvedValueOnce([[{ postback_enabled: false }]])
      .mockResolvedValueOnce([[{ retry_count: 0 }]])  // catch: SELECT retry_count
      .mockResolvedValueOnce([{}]);                   // catch: UPDATE
    await expect(firePostback(1)).rejects.toThrow('Postback not enabled for offer');
  });

  test('throws when offer not found — line 178', async () => {
    pool.query
      .mockResolvedValueOnce([[{ id: 1, offer_id: 10, click_id: 'C1', payout: 5 }]])
      .mockResolvedValueOnce([[]])                    // no offer
      .mockResolvedValueOnce([[{ retry_count: 0 }]])  // catch: SELECT retry_count
      .mockResolvedValueOnce([{}]);                   // catch: UPDATE
    await expect(firePostback(1)).rejects.toThrow('Postback not enabled for offer');
  });

  test('GET happy path resolves { success: true }', async () => {
    pool.query
      .mockResolvedValueOnce([[{ id: 1, offer_id: 10, click_id: 'C1', payout: 5, transaction_id: null, conversion_event: 'conversion' }]])
      .mockResolvedValueOnce([[{ postback_enabled: true, postback_url: 'http://cb.example.com/?cid={click_id}', postback_method: 'GET', postback_auth_type: null, postback_timeout: 5, postback_headers: null, postback_retries: 3 }]])
      .mockResolvedValueOnce([{}]); // UPDATE sent
    mockHttpRequest(http, 200, 'ok');
    const result = await firePostback(1);
    expect(result).toEqual({ success: true, status: 200 });
  });

  test('POST with bearer auth sets Authorization header — line 203', async () => {
    pool.query
      .mockResolvedValueOnce([[{ id: 2, offer_id: 20, click_id: 'C2', payout: 10, transaction_id: 'TX1', conversion_event: 'sale' }]])
      .mockResolvedValueOnce([[{ postback_enabled: true, postback_url: 'http://cb.example.com/hook', postback_method: 'POST', postback_auth_type: 'bearer', postback_auth_value: 'tok123', postback_timeout: 5, postback_headers: null, postback_retries: 3 }]])
      .mockResolvedValueOnce([{}]);
    let capturedHeaders;
    http.request.mockImplementation((_url, opts, cb) => {
      capturedHeaders = opts.headers;
      const fakeRes = { statusCode: 200, on: jest.fn((ev, fn) => { if (ev === 'data') fn(''); if (ev === 'end') fn(); }) };
      cb(fakeRes);
      return { on: jest.fn(), write: jest.fn(), end: jest.fn() };
    });
    await firePostback(2);
    expect(capturedHeaders['Authorization']).toBe('Bearer tok123');
  });

  test('non-2xx response causes retry update', async () => {
    pool.query
      .mockResolvedValueOnce([[{ id: 3, offer_id: 30, click_id: 'C3', payout: 0, transaction_id: null, conversion_event: 'conv' }]])
      .mockResolvedValueOnce([[{ postback_enabled: true, postback_url: 'http://fail.example.com/', postback_method: 'GET', postback_auth_type: null, postback_timeout: 5, postback_headers: null, postback_retries: 3 }]])
      .mockResolvedValueOnce([[{ retry_count: 0 }]]) // for catch block
      .mockResolvedValueOnce([{}]); // UPDATE retry
    mockHttpRequest(http, 503, 'error');
    await expect(firePostback(3)).rejects.toThrow('Postback HTTP 503');
  });

  test('timeout rejection triggers retry path — line 280-281', async () => {
    pool.query
      .mockResolvedValueOnce([[{ id: 4, offer_id: 40, click_id: 'C4', payout: 0, transaction_id: null, conversion_event: 'conv' }]])
      .mockResolvedValueOnce([[{ postback_enabled: true, postback_url: 'http://slow.example.com/', postback_method: 'GET', postback_auth_type: null, postback_timeout: 1, postback_headers: null, postback_retries: 3 }]])
      .mockResolvedValueOnce([[{ retry_count: 1 }]])
      .mockResolvedValueOnce([{}]);
    // Simulate timeout event
    http.request.mockImplementation((_url, _opts, _cb) => {
      const req = {
        on: jest.fn((ev, fn) => { if (ev === 'timeout') setImmediate(fn); }),
        destroy: jest.fn(),
        write: jest.fn(),
        end: jest.fn(),
      };
      return req;
    });
    await expect(firePostback(4)).rejects.toThrow('Postback timeout');
  });
});

// ── getPostbackLogs ───────────────────────────────────────────────────────────

describe('getPostbackLogs — lines 342-363', () => {

  test('returns logs with default pagination', async () => {
    const rows = [{ id: 1, status: 'sent' }];
    pool.query.mockResolvedValueOnce([rows]);
    const req = makeReq({ query: {} });
    const res = makeRes();
    await getPostbackLogs(req, res);
    expect(res.json).toHaveBeenCalledWith(rows);
    const [sql, params] = pool.query.mock.calls[0];
    expect(sql).toMatch(/1ai_postback_logs/);
    expect(params).toEqual([50, 0]); // limit=50, offset=0
  });

  test('filters by offer_id and status', async () => {
    pool.query.mockResolvedValueOnce([[{ id: 2 }]]);
    const req = makeReq({ query: { offer_id: '5', status: 'failed', limit: '10', offset: '20' } });
    const res = makeRes();
    await getPostbackLogs(req, res);
    const [sql, params] = pool.query.mock.calls[0];
    expect(sql).toMatch(/offer_id = \?/);
    expect(sql).toMatch(/status = \?/);
    expect(params).toEqual(['5', 'failed', 10, 20]);
  });

  test('500 on db error', async () => {
    pool.query.mockRejectedValueOnce(new Error('db fail'));
    const req = makeReq({ query: {} });
    const res = makeRes();
    await getPostbackLogs(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
  });
});

// ── setOfferPostback ──────────────────────────────────────────────────────────

describe('setOfferPostback', () => {

  test('400 for invalid postback_url', async () => {
    const req = makeReq({ params: { offerId: '1' }, body: { postback_url: 'ftp://invalid' } });
    const res = makeRes();
    await setOfferPostback(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  test('400 for invalid postback_method', async () => {
    const req = makeReq({ params: { offerId: '1' }, body: { postback_method: 'DELETE' } });
    const res = makeRes();
    await setOfferPostback(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  test('400 for out-of-range postback_timeout', async () => {
    const req = makeReq({ params: { offerId: '1' }, body: { postback_timeout: 999 } });
    const res = makeRes();
    await setOfferPostback(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  test('400 for out-of-range postback_retries', async () => {
    const req = makeReq({ params: { offerId: '1' }, body: { postback_retries: 99 } });
    const res = makeRes();
    await setOfferPostback(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  test('200 happy path saves config', async () => {
    pool.query.mockResolvedValueOnce([{}]);
    const req = makeReq({ params: { offerId: '1' }, body: { postback_url: 'https://ok.example.com/', postback_enabled: true, postback_method: 'GET' } });
    const res = makeRes();
    await setOfferPostback(req, res);
    expect(res.json).toHaveBeenCalledWith({ success: true, offer_id: '1' });
  });

  test('500 on db error — line 404-405', async () => {
    pool.query.mockRejectedValueOnce(new Error('db crash'));
    const req = makeReq({ params: { offerId: '1' }, body: { postback_url: 'https://ok.example.com/' } });
    const res = makeRes();
    await setOfferPostback(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
  });
});

// ── getOfferPostback ──────────────────────────────────────────────────────────

describe('getOfferPostback', () => {

  test('200 returns offer config', async () => {
    const row = { postback_url: 'https://cb.example.com/', postback_enabled: true };
    pool.query.mockResolvedValueOnce([[row]]);
    const req = makeReq({ params: { offerId: '5' } });
    const res = makeRes();
    await getOfferPostback(req, res);
    expect(res.json).toHaveBeenCalledWith(row);
  });

  test('404 when offer not found — line 427', async () => {
    pool.query.mockResolvedValueOnce([[]]); // empty
    const req = makeReq({ params: { offerId: '999' } });
    const res = makeRes();
    await getOfferPostback(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: 'Offer not found' });
  });

  test('500 on db error — line 428', async () => {
    pool.query.mockRejectedValueOnce(new Error('timeout'));
    const req = makeReq({ params: { offerId: '1' } });
    const res = makeRes();
    await getOfferPostback(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
  });
});
