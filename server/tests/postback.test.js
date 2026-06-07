/**
 * Postback System Test Suite — 21 Tests (TDD: RED state initially)
 * Covers: receivePostback, firePostback, deduplication, admin endpoints, rate limiting, circuit breaker
 */

const mockPool = require('./mocks/database');

// Mock the db/mysql module before any controller imports
jest.mock('../db/mysql', () => mockPool);

// Mock http/https to prevent actual network calls
// Provide a basic implementation that returns event-emitter-like object
const mockHttpRequest = jest.fn().mockImplementation((url, opts, cb) => {
  const mockRes = {
    statusCode: 200,
    on: (evt, handler) => { if (evt === 'data') handler('ok'); if (evt === 'end') handler(); },
  };
  if (cb) cb(mockRes);
  return { on: jest.fn(), destroy: jest.fn(), end: jest.fn() };
});
jest.mock('http', () => ({ request: mockHttpRequest }));
jest.mock('https', () => ({ request: mockHttpRequest }));

const { receivePostback, firePostback, setOfferPostback, getOfferPostback, getPostbackLogs, validatePostbackUrl, parsePostbackHeaders } = require('../controllers/postbackController');

beforeEach(() => {
  jest.restoreAllMocks();
  mockPool.query.mockReset();
  mockPool.query.mockImplementation(() => Promise.resolve([]));
  mockHttpRequest.mockImplementation((url, opts, cb) => {
    const mockRes = {
      statusCode: 200,
      on: (evt, handler) => { if (evt === 'data') handler('ok'); if (evt === 'end') handler(); },
    };
    if (cb) cb(mockRes);
    return { on: jest.fn(), destroy: jest.fn(), end: jest.fn(), write: jest.fn() };
  });
});

// ============================================================
// BLOCK 1: receivePostback — Happy Path & Validation (6 tests)
// ============================================================
describe('receivePostback', () => {
  test('1A: should accept valid postback with click_id and payout', async () => {
    const linkRow = { id: 1, affiliate_id: 10, offer_id: 5, postback_url: 'https://advertiser.com/cb', postback_auth_type: null, postback_auth_value: null };

    mockPool.query
      .mockResolvedValueOnce([[linkRow]])       // link lookup
      .mockResolvedValueOnce([[]])              // dedup check — no existing
      .mockResolvedValueOnce([{ insertId: 42 }]) // log insert
      .mockResolvedValueOnce([])                // conversions update
      .mockResolvedValueOnce([{ insertId: 100 }]) // earnings insert
      .mockResolvedValueOnce([]);               // queue enqueue query (existing check)

    const req = {
      query: { click_id: 'abc123', payout: '50', transaction_id: 'tx1', event: 'sale' }
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    await receivePostback(req, res);

    expect(res.json).toHaveBeenCalledWith({
      success: true,
      postback_id: 42,
      payout: '50',
      click_id: 'abc123'
    });
  });

  test('1B: should reject postback without click_id (400)', async () => {
    const req = { query: { payout: '10' } };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    await receivePostback(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'click_id required' });
  });

  test('1C: should reject postback with nonexistent click_id (404)', async () => {
    mockPool.query.mockResolvedValueOnce([[]]); // link lookup — empty

    const req = { query: { click_id: 'nonexistent', payout: '10' } };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    await receivePostback(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: 'Click not found' });
  });

  test('1D: should verify HMAC signature when configured (accept valid)', async () => {
    const linkRow = { id: 1, affiliate_id: 10, offer_id: 5, postback_url: 'https://advertiser.com/cb', postback_auth_type: 'signature', postback_auth_value: 'secret123' };

    // Generate expected sig: the controller uses crypto.createHmac('sha256', secret).update(click_id + payout + transaction_id).digest('hex')
    const crypto = require('crypto');
    const expectedSig = crypto.createHmac('sha256', 'secret123').update('abc123' + '50' + 'tx1').digest('hex');

    mockPool.query
      .mockResolvedValueOnce([[linkRow]])       // link lookup
      .mockResolvedValueOnce([[]])              // dedup check
      .mockResolvedValueOnce([{ insertId: 42 }]) // log insert
      .mockResolvedValueOnce([])                // conversions update
      .mockResolvedValueOnce([{ insertId: 100 }]) // earnings insert
      .mockResolvedValueOnce([]);               // queue enqueue

    const req = {
      query: { click_id: 'abc123', payout: '50', transaction_id: 'tx1', event: 'sale', sig: expectedSig }
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    await receivePostback(req, res);

    expect(res.json).toHaveBeenCalledWith({
      success: true,
      postback_id: 42,
      payout: '50',
      click_id: 'abc123'
    });
  });

  test('1E: should reject postback with invalid HMAC signature (403)', async () => {
    const linkRow = { id: 1, affiliate_id: 10, offer_id: 5, postback_url: 'https://advertiser.com/cb', postback_auth_type: 'signature', postback_auth_value: 'secret123' };

    mockPool.query
      .mockResolvedValueOnce([[linkRow]])       // link lookup
      .mockResolvedValueOnce([[]]);             // dedup check — stops before further calls

    const req = {
      query: { click_id: 'abc123', payout: '50', transaction_id: 'tx1', event: 'sale', sig: 'badsignature' }
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    await receivePostback(req, res);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ error: 'Invalid signature' });
  });

  test('1F: should return 409 when concurrent insert hits unique constraint', async () => {
    const linkRow = { id: 1, affiliate_id: 10, offer_id: 5, postback_url: 'https://advertiser.com/cb', postback_auth_type: null, postback_auth_value: null };
    const duplicateError = Object.assign(new Error('Duplicate entry for key uk_offer_click'), { code: 'ER_DUP_ENTRY' });

    mockPool.query
      .mockResolvedValueOnce([[linkRow]])
      .mockResolvedValueOnce([[]])
      .mockRejectedValueOnce(duplicateError);

    const req = { query: { click_id: 'race123', payout: '10' } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    await receivePostback(req, res);

    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith({ error: 'Postback already received for this click' });
  });

  test('1G: should create conversion log, earnings entry, and enqueue postback', async () => {
    const linkRow = { id: 1, affiliate_id: 10, offer_id: 5, postback_url: 'https://advertiser.com/cb', postback_auth_type: null, postback_auth_value: null };

    mockPool.query
      .mockResolvedValueOnce([[linkRow]])       // link lookup
      .mockResolvedValueOnce([[]])              // dedup check
      .mockResolvedValueOnce([{ insertId: 42 }]) // log insert
      .mockResolvedValueOnce([])                // conversions UPDATE
      .mockResolvedValueOnce([{ insertId: 100 }]) // earnings INSERT
      .mockResolvedValueOnce([]);               // queue enqueue check

    const req = {
      query: { click_id: 'xyz789', payout: '25.50', transaction_id: 'tx2', event: 'lead' }
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    await receivePostback(req, res);

    // Verify the DB calls happened: after link lookup, there should be a INSERT log call
    const insertLogCall = mockPool.query.mock.calls.find(call =>
      call[0].includes('INSERT INTO 1ai_postback_logs')
    );
    expect(insertLogCall).toBeDefined();
    // Verify the postback_url in the INSERT has the actual URL, not empty
    expect(insertLogCall[1][7]).toBe('https://advertiser.com/cb');

    // Verify earnings were inserted
    const earningsCall = mockPool.query.mock.calls.find(call =>
      call[0].includes('INSERT INTO 1ai_affiliate_earnings')
    );
    expect(earningsCall).toBeDefined();
    expect(earningsCall[1][0]).toBe(10); // affiliate_id
  });
});

// ============================================================
// BLOCK 2: firePostback & Macro Substitution (5 tests)
// ============================================================
describe('firePostback', () => {
  beforeEach(() => {
    // http/https are already mocked at module level — reset implementation to default success
    mockHttpRequest.mockImplementation((url, opts, cb) => {
      const mockRes = {
        statusCode: 200,
        on: (evt, handler) => { if (evt === 'data') handler('ok'); if (evt === 'end') handler(); },
      };
      if (cb) cb(mockRes);
      return { on: jest.fn(), destroy: jest.fn(), end: jest.fn() };
    });
  });

  test('2A: should fire GET request to postback_url with all macros substituted', async () => {
    const logRow = { id: 1, offer_id: 5, click_id: 'abc123', payout: 50, transaction_id: 'tx1', conversion_event: 'sale', status: 'pending', retry_count: 0, created_at: Date.now() };
    const offerRow = { postback_url: 'https://advertiser.com/cb?cid={click_id}&payout={payout}&tx={transaction_id}&ev={event}', postback_enabled: true, postback_timeout: 10, postback_auth_type: null, postback_auth_value: null, postback_method: 'GET', postback_headers: '{}' };

    mockPool.query
      .mockResolvedValueOnce([[logRow]])        // get log
      .mockResolvedValueOnce([[offerRow]])      // get offer
      .mockResolvedValueOnce([]); // UPDATE query

    await firePostback(1);

    // Verify the log UPDATE was called with 'sent' status
    const updateCall = mockPool.query.mock.calls.find(call =>
      call[0].includes('UPDATE 1ai_postback_logs SET status')
    );
    expect(updateCall).toBeDefined();
    expect(updateCall[0]).toContain("status = 'sent'");
    expect(updateCall[1][0]).toBe(200);
  });

  test('2B: should substitute all 5 macro tokens correctly', async () => {
    const logRow = { id: 1, offer_id: 5, click_id: 'abc123', payout: 50, transaction_id: 'tx1', conversion_event: 'purchase', status: 'pending', retry_count: 0, created_at: Date.now() };
    const offerRow = { postback_url: 'https://advertiser.com/cb?cid={click_id}&p={payout}&tx={transaction_id}&ev={event}&st={status}', postback_enabled: true, postback_timeout: 10, postback_auth_type: null, postback_auth_value: null, postback_method: 'GET', postback_headers: '{}' };

    mockHttpRequest.mockImplementation((url, opts, cb) => {
      // capture the URL to verify macro substitution
      expect(url).toContain('cid=abc123');
      expect(url).toContain('p=50');
      expect(url).toContain('tx=tx1');
      expect(url).toContain('ev=purchase');
      expect(url).toContain('st=approved');

      const mockRes = {
        statusCode: 200,
        on: (evt, handler) => { if (evt === 'data') handler('ok'); if (evt === 'end') handler(); },
      };
      if (cb) cb(mockRes);
      return { on: jest.fn(), destroy: jest.fn(), end: jest.fn() };
    });

    mockPool.query
      .mockResolvedValueOnce([[logRow]])
      .mockResolvedValueOnce([[offerRow]])
      .mockResolvedValueOnce([]); // UPDATE query

    await firePostback(1);

    const updateCall = mockPool.query.mock.calls.find(call =>
      call[0].includes('UPDATE 1ai_postback_logs SET status')
    );
    expect(updateCall).toBeDefined();
  });

  test('2C: should retry with exponential backoff on HTTP error', async () => {
    const logRow = { id: 1, offer_id: 5, click_id: 'abc123', payout: 50, transaction_id: 'tx1', conversion_event: 'sale', status: 'pending', retry_count: 0, created_at: Date.now() };
    const offerRow = { postback_url: 'https://advertiser.com/cb', postback_enabled: true, postback_timeout: 10, postback_auth_type: null, postback_auth_value: null, postback_method: 'GET', postback_headers: '{}' };

    // Simulate network error
    mockHttpRequest.mockImplementation((url, opts, cb) => {
      return {
        on: (evt, handler) => { if (evt === 'error') handler(new Error('ECONNREFUSED')); },
        destroy: jest.fn(),
        end: jest.fn()
      };
    });

    mockPool.query
      .mockResolvedValueOnce([[logRow]])        // get log
      .mockResolvedValueOnce([[offerRow]])      // get offer
      .mockResolvedValueOnce([[{ retry_count: 0 }]])  // get retry count for update
      .mockResolvedValueOnce([]); // UPDATE query

    await expect(firePostback(1)).rejects.toThrow();

    // Verify retry was scheduled (status should be 'retry')
    const updateCall = mockPool.query.mock.calls.find(call =>
      call[0].includes('UPDATE 1ai_postback_logs SET status')
    );
    expect(updateCall).toBeDefined();
    expect(updateCall[1][0]).toBe('retry');
    expect(updateCall[1][1]).toBe(1); // retry_count incremented to 1
  });

  test('2D: should treat non-2xx HTTP response as retryable failure', async () => {
    const logRow = { id: 1, offer_id: 5, click_id: 'abc123', payout: 50, transaction_id: 'tx1', conversion_event: 'sale', status: 'pending', retry_count: 0, created_at: Date.now() };
    const offerRow = { postback_url: 'https://advertiser.com/cb', postback_enabled: true, postback_timeout: 10, postback_auth_type: null, postback_auth_value: null, postback_method: 'GET', postback_headers: '{}' };

    mockHttpRequest.mockImplementation((url, opts, cb) => {
      const mockRes = {
        statusCode: 500,
        on: (evt, handler) => { if (evt === 'data') handler('server error'); if (evt === 'end') handler(); },
      };
      if (cb) cb(mockRes);
      return { on: jest.fn(), destroy: jest.fn(), end: jest.fn() };
    });

    mockPool.query
      .mockResolvedValueOnce([[logRow]])
      .mockResolvedValueOnce([[offerRow]])
      .mockResolvedValueOnce([[{ retry_count: 0 }]])
      .mockResolvedValueOnce([]);

    await expect(firePostback(1)).rejects.toThrow('Postback HTTP 500');

    const updateCall = mockPool.query.mock.calls.find(call =>
      call[0].includes('UPDATE 1ai_postback_logs SET status')
    );
    expect(updateCall[1][0]).toBe('retry');
    expect(updateCall[1][3]).toContain('Postback HTTP 500');
  });

  test('2E: should honor offer-level postback_retries limit', async () => {
    const logRow = { id: 1, offer_id: 5, click_id: 'abc123', payout: 50, transaction_id: 'tx1', conversion_event: 'sale', status: 'pending', retry_count: 0, created_at: Date.now() };
    const offerRow = { postback_url: 'https://advertiser.com/cb', postback_enabled: true, postback_timeout: 10, postback_auth_type: null, postback_auth_value: null, postback_method: 'GET', postback_headers: '{}', postback_retries: 1 };

    mockHttpRequest.mockImplementation(() => ({
      on: (evt, handler) => { if (evt === 'error') handler(new Error('Timeout')); },
      destroy: jest.fn(),
      end: jest.fn()
    }));

    mockPool.query
      .mockResolvedValueOnce([[logRow]])
      .mockResolvedValueOnce([[offerRow]])
      .mockResolvedValueOnce([[{ retry_count: 0 }]])
      .mockResolvedValueOnce([]);

    await expect(firePostback(1)).rejects.toThrow('Timeout');

    const updateCall = mockPool.query.mock.calls.find(call =>
      call[0].includes('UPDATE 1ai_postback_logs SET status')
    );
    expect(updateCall[1][0]).toBe('failed');
  });

  test('2F: should stop retrying after 3 failed attempts', async () => {
    const logRow = { id: 1, offer_id: 5, click_id: 'abc123', payout: 50, transaction_id: 'tx1', conversion_event: 'sale', status: 'retry', retry_count: 3, created_at: Date.now() };
    const offerRow = { postback_url: 'https://advertiser.com/cb', postback_enabled: true, postback_timeout: 10, postback_auth_type: null, postback_auth_value: null, postback_method: 'GET', postback_headers: '{}' };

    mockHttpRequest.mockImplementation((url, opts, cb) => {
      return {
        on: (evt, handler) => { if (evt === 'error') handler(new Error('Timeout')); },
        destroy: jest.fn(),
        end: jest.fn()
      };
    });

    mockPool.query
      .mockResolvedValueOnce([[logRow]])
      .mockResolvedValueOnce([[offerRow]])
      .mockResolvedValueOnce([[{ retry_count: 3 }]])
      .mockResolvedValueOnce([]); // UPDATE query

    await expect(firePostback(1)).rejects.toThrow();

    const updateCall = mockPool.query.mock.calls.find(call =>
      call[0].includes('UPDATE 1ai_postback_logs SET status')
    );
    expect(updateCall).toBeDefined();
    // With retry_count already at 3, newRetryCount = 4, which is >= 3, so status becomes 'failed'
    expect(updateCall[1][0]).toBe('failed');
  });
});

// ============================================================
// BLOCK 3: Click ID Deduplication (2 tests)
// ============================================================
describe('Click ID Deduplication', () => {
  test('3A: should reject duplicate postback for same (offer_id, click_id) with 409', async () => {
    const linkRow = { id: 1, affiliate_id: 10, offer_id: 5, postback_url: 'https://advertiser.com/cb', postback_auth_type: null, postback_auth_value: null };

    mockPool.query
      .mockResolvedValueOnce([[linkRow]])       // link lookup
      .mockResolvedValueOnce([[{ id: 99 }]]);   // dedup check — already exists!

    const req = { query: { click_id: 'dup123', payout: '10' } };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    await receivePostback(req, res);

    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith({ error: 'Postback already received for this click' });
  });

  test('3B: should allow same click_id for DIFFERENT offers', async () => {
    // First offer
    const linkRow1 = { id: 1, affiliate_id: 10, offer_id: 5, postback_url: 'https://a.com/cb', postback_auth_type: null, postback_auth_value: null };
    mockPool.query
      .mockResolvedValueOnce([[linkRow1]])       // link lookup
      .mockResolvedValueOnce([[]])              // dedup — no existing for THIS offer
      .mockResolvedValueOnce([{ insertId: 42 }]) // log insert
      .mockResolvedValueOnce([])                // conversions
      .mockResolvedValueOnce([{ insertId: 100 }]) // earnings
      .mockResolvedValueOnce([]);               // queue

    const req1 = { query: { click_id: 'shared123', payout: '10' } };
    const res1 = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    await receivePostback(req1, res1);
    expect(res1.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: true })
    );

    // Second offer — same click_id, different offer
    jest.clearAllMocks();
    const linkRow2 = { id: 2, affiliate_id: 20, offer_id: 7, postback_url: 'https://b.com/cb', postback_auth_type: null, postback_auth_value: null };
    mockPool.query
      .mockResolvedValueOnce([[linkRow2]])       // link lookup
      .mockResolvedValueOnce([[]])              // dedup — no existing for offer 7
      .mockResolvedValueOnce([{ insertId: 43 }]) // log insert
      .mockResolvedValueOnce([])                // conversions
      .mockResolvedValueOnce([{ insertId: 101 }]) // earnings
      .mockResolvedValueOnce([]);               // queue

    const req2 = { query: { click_id: 'shared123', payout: '20' } };
    const res2 = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    await receivePostback(req2, res2);
    expect(res2.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: true })
    );
  });
});

// ============================================================
// BLOCK 4: Admin Endpoints — RBAC & Completeness (4 tests)
// ============================================================
describe('Admin Endpoints', () => {
  test('4A: setOfferPostback should validate URL format and reject invalid URLs (400)', async () => {
    // Test the validation function directly
    expect(validatePostbackUrl('https://valid.com/cb')).toBe(true);
    expect(validatePostbackUrl('http://valid.com/cb')).toBe(true);
    expect(validatePostbackUrl('')).toBe(true);   // null/empty OK (disabled)
    expect(validatePostbackUrl(null)).toBe(true);

    expect(validatePostbackUrl('javascript:alert(1)')).toBe(false);
    expect(validatePostbackUrl('ftp://invalid.com')).toBe(false);
    expect(validatePostbackUrl('not-a-url')).toBe(false);

    // Test end-to-end: setOfferPostback with invalid URL
    const req = {
      params: { offerId: '5' },
      body: { postback_url: 'javascript:alert(1)' }
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    await setOfferPostback(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: expect.stringMatching(/invalid.*url/i) })
    );
  });

  test('4B: getOfferPostback should return 404 for nonexistent offer', async () => {
    mockPool.query.mockResolvedValueOnce([[]]); // no offer found

    const req = { params: { offerId: '9999' } };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    await getOfferPostback(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: 'Offer not found' });
  });

  test('4C: getOfferPostback should return complete postback config (all 8 fields)', async () => {
    const offerRow = {
      postback_url: 'https://advertiser.com/cb',
      postback_enabled: 1,
      postback_auth_type: 'api_key',
      postback_auth_value: 'key123',
      postback_timeout: 15,
      postback_method: 'GET',
      postback_headers: '{}',
      postback_retries: 3,
    };

    mockPool.query.mockResolvedValueOnce([[offerRow]]);

    const req = { params: { offerId: '5' } };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    await getOfferPostback(req, res);

    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        postback_url: expect.any(String),
        postback_enabled: expect.any(Number),
        postback_auth_type: expect.any(String),
        postback_auth_value: expect.any(String),
        postback_timeout: expect.any(Number),
        postback_method: expect.any(String),
        postback_headers: expect.any(String),
        postback_retries: expect.any(Number),
      })
    );
  });

  test('4D: setOfferPostback should accept valid URLs and update DB', async () => {
    mockPool.query.mockResolvedValueOnce([]); // UPDATE query

    const req = {
      params: { offerId: '5' },
      body: {
        postback_url: 'https://valid-advertiser.com/postback',
        postback_enabled: true,
        postback_auth_type: 'bearer',
        postback_auth_value: 'tok_abc123'
      }
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    await setOfferPostback(req, res);

    // Verify the UPDATE was called
    const updateCall = mockPool.query.mock.calls.find(call =>
      call[0].includes('UPDATE 1ai_offers')
    );
    expect(updateCall).toBeDefined();
    expect(updateCall[1][0]).toBe('https://valid-advertiser.com/postback');
    expect(updateCall[1][1]).toBe(true);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
  });
  test('4E: adminController setOfferPostback should reject invalid URL format', async () => {
    const { setOfferPostback: adminSetOfferPostback } = require('../controllers/adminController');
    const req = {
      params: { offerId: '5' },
      body: { postback_url: 'javascript:alert(1)' }
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    await adminSetOfferPostback(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: expect.stringMatching(/invalid.*url/i) })
    );
    expect(mockPool.query).not.toHaveBeenCalled();
  });

  test('4F: adminController setOfferPostback should reject invalid method', async () => {
    const { setOfferPostback: adminSetOfferPostback } = require('../controllers/adminController');
    const req = {
      params: { offerId: '5' },
      body: { postback_url: 'https://advertiser.example/postback', postback_method: 'DELETE' }
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    await adminSetOfferPostback(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'postback_method must be GET or POST' });
    expect(mockPool.query).not.toHaveBeenCalled();
  });
});

// ============================================================
// BLOCK 5: Rate Limiting — Public Endpoint (2 tests)
// ============================================================
describe('Rate Limiting', () => {
  test('5A: should return 429 after 10 requests from same IP in one second', async () => {
    const { rateLimitPostback, resetRateLimit } = require('../middleware/rateLimit');
    resetRateLimit();
    jest.spyOn(Date, 'now').mockReturnValue(100000);

    const req = { ip: '203.0.113.10', connection: {} };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    const next = jest.fn();

    for (let i = 0; i < 10; i += 1) {
      rateLimitPostback(req, res, next);
    }
    rateLimitPostback(req, res, next);

    expect(next).toHaveBeenCalledTimes(10);
    expect(res.status).toHaveBeenCalledWith(429);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ error: 'Too many requests' }));
  });

  test('5B: should reset rate limit after window expires', async () => {
    const { rateLimitPostback, resetRateLimit } = require('../middleware/rateLimit');
    resetRateLimit();
    const nowSpy = jest.spyOn(Date, 'now');

    const req = { ip: '203.0.113.11', connection: {} };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    const next = jest.fn();

    nowSpy.mockReturnValue(200000);
    for (let i = 0; i < 10; i += 1) {
      rateLimitPostback(req, res, next);
    }

    nowSpy.mockReturnValue(201001);
    rateLimitPostback(req, res, next);

    expect(next).toHaveBeenCalledTimes(11);
    expect(res.status).not.toHaveBeenCalledWith(429);
  });
});

// ============================================================
// BLOCK 6: Circuit Breaker — Queue Protection (2 tests)
// ============================================================
describe('Circuit Breaker', () => {
  test('6A: queue should not retry postbacks for disabled offers', async () => {
    // This should FAIL until circuit breaker is implemented in the queue
    // Verify the queue checks offer.postback_enabled before retrying

    const PostbackQueue = require('../services/postbackQueue');

    // Setup: postback_log exists, but offer has postback_enabled=0
    mockPool.query
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([[{ id: 42, offer_id: 5, postback_enabled: false }]])
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([]);

    await PostbackQueue.processItem(42);

    const targetLookup = mockPool.query.mock.calls.find(call =>
      call[0].includes('LEFT JOIN 1ai_offers')
    );
    expect(targetLookup).toBeDefined();

    const logFailure = mockPool.query.mock.calls.find(call =>
      call[0].includes('UPDATE 1ai_postback_logs SET status')
    );
    expect(logFailure[1]).toEqual(['failed', 'Postback not enabled for offer', 42]);

    const queueUpdates = mockPool.query.mock.calls.filter(call =>
      call[0].includes('UPDATE 1ai_postback_queue')
    );
    expect(queueUpdates[queueUpdates.length - 1][1][0]).toBe('failed');
  });

  test('6B: queue should not waste retries on disabled offers in processItem', async () => {
    // When circuit breaker is active, retries on disabled offers should short-circuit
    const PostbackQueue = require('../services/postbackQueue');

    // Queue item exists but offer disabled
    mockPool.query
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([[{ id: 99, offer_id: 5, postback_enabled: false }]])
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([]);

    await PostbackQueue.processItem(99);

    const retrySchedule = mockPool.query.mock.calls.find(call =>
      call[0].includes('scheduled_at')
    );
    expect(retrySchedule).toBeUndefined();

    const queueUpdates = mockPool.query.mock.calls.filter(call =>
      call[0].includes('UPDATE 1ai_postback_queue')
    );
    expect(queueUpdates[queueUpdates.length - 1][1][0]).toBe('failed');
  });
});

describe('App lifecycle', () => {
  test('8A: app should start listener and queue only when run as main module', async () => {
    const appSource = require('fs').readFileSync(
      require('path').join(__dirname, '../app.js'),
      'utf8'
    );

    expect(appSource).toContain('if (require.main === module)');
    expect(appSource).toContain('postbackQueue.start();');
    expect(appSource).toContain('app.listen(PORT');
  });
});

describe('PostbackQueue operations', () => {
  test('6C: process should process due queue items', async () => {
    const PostbackQueue = require('../services/postbackQueue');
    const processItemSpy = jest.spyOn(PostbackQueue, 'processItem').mockResolvedValue(undefined);

    mockPool.query.mockResolvedValueOnce([[
      { id: 1, postback_log_id: 42 },
      { id: 2, postback_log_id: 43 }
    ]]);

    await PostbackQueue.process();

    expect(processItemSpy).toHaveBeenCalledWith(42);
    expect(processItemSpy).toHaveBeenCalledWith(43);
  });

  test('6D: processItem should complete queue item when offer is enabled and postback succeeds', async () => {
    const PostbackQueue = require('../services/postbackQueue');
    const logRow = { id: 42, offer_id: 5, click_id: 'abc123', payout: 20, transaction_id: 'tx1', conversion_event: 'sale', retry_count: 0 };
    const offerRow = {
      postback_url: 'https://advertiser.example/postback?click={click_id}',
      postback_enabled: true,
      postback_timeout: 10,
      postback_auth_type: null,
      postback_auth_value: null,
      postback_method: 'GET',
      postback_headers: '{}'
    };

    mockPool.query
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([[{ id: 42, offer_id: 5, postback_enabled: true }]])
      .mockResolvedValueOnce([[logRow]])
      .mockResolvedValueOnce([[offerRow]])
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([]);

    await PostbackQueue.processItem(42);

    const completion = mockPool.query.mock.calls.find(call =>
      call[0].includes('UPDATE 1ai_postback_queue') && call[1][0] === 'completed'
    );
    expect(completion).toBeDefined();
  });

  test('6E: enqueue should insert queued item when not already queued', async () => {
    const PostbackQueue = require('../services/postbackQueue');

    mockPool.query
      .mockResolvedValueOnce([[]])
      .mockResolvedValueOnce([]);

    await PostbackQueue.enqueue(42);

    const insertCall = mockPool.query.mock.calls.find(call =>
      call[0].includes('INSERT INTO 1ai_postback_queue')
    );
    expect(insertCall[1]).toEqual([42, 'queued']);
  });

  test('6F: enqueue should not insert duplicate queue item', async () => {
    const PostbackQueue = require('../services/postbackQueue');

    mockPool.query.mockResolvedValueOnce([[{ id: 7 }]]);

    await PostbackQueue.enqueue(42);

    const insertCall = mockPool.query.mock.calls.find(call =>
      call[0].includes('INSERT INTO 1ai_postback_queue')
    );
    expect(insertCall).toBeUndefined();
  });

  test('6G: processItem should schedule retry when enabled offer send fails', async () => {
    const PostbackQueue = require('../services/postbackQueue');
    mockHttpRequest.mockImplementation(() => ({
      on: (evt, handler) => { if (evt === 'error') handler(new Error('ECONNRESET')); },
      destroy: jest.fn(),
      end: jest.fn(),
      write: jest.fn()
    }));

    const logRow = { id: 42, offer_id: 5, click_id: 'abc123', payout: 20, transaction_id: 'tx1', conversion_event: 'sale', retry_count: 0 };
    const offerRow = {
      postback_url: 'https://advertiser.example/postback',
      postback_enabled: true,
      postback_timeout: 10,
      postback_auth_type: null,
      postback_auth_value: null,
      postback_method: 'GET',
      postback_headers: '{}'
    };

    mockPool.query
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([[{ id: 42, offer_id: 5, postback_enabled: true }]])
      .mockResolvedValueOnce([[logRow]])
      .mockResolvedValueOnce([[offerRow]])
      .mockResolvedValueOnce([[{ retry_count: 0 }]])
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([[{ retry_count: 1 }]])
      .mockResolvedValueOnce([]);

    await PostbackQueue.processItem(42);

    const retryUpdate = mockPool.query.mock.calls.find(call =>
      call[0].includes('UPDATE 1ai_postback_queue SET status = ?, scheduled_at = ?')
    );
    expect(retryUpdate).toBeDefined();
    expect(retryUpdate[1][0]).toBe('retry');
    expect(retryUpdate[1][2]).toBe(42);
  });
});

// ============================================================
// BLOCK 7: Integration & Edge Cases (2 tests)
// ============================================================
describe('Integration', () => {
  test('7A: smartlink recordConversion should enqueue postback when offer has postback enabled', async () => {
    const { recordConversion } = require('../controllers/smartlinkController');
    const linkRow = { id: 1, affiliate_id: 10, offer_id: 5, payout: '50', network_payout: '60' };
    const campaignRow = [{ aff_campaign_id: 100 }];
    const offerRow = [{ postback_enabled: 1 }];

    mockPool.query
      .mockResolvedValueOnce([[linkRow]])             // 1: link lookup
      .mockResolvedValueOnce([campaignRow])            // 2: campaign lookup
      .mockResolvedValueOnce([{ insertId: 200 }])      // 3: conversion log INSERT
      .mockResolvedValueOnce([{ insertId: 201 }])      // 4: earnings INSERT
      .mockResolvedValueOnce([])                       // 5: conversions UPDATE
      .mockResolvedValueOnce([offerRow])               // 6: offer postback_enabled check
      .mockResolvedValueOnce([{ insertId: 42 }])       // 7: postback log INSERT
      .mockResolvedValueOnce([[]])                     // 8: queue existing check (none)
      .mockResolvedValueOnce([]);                      // 9: queue INSERT

    const req = { body: { slug: 'smartlink1' } };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    await recordConversion(req, res);

    // Should have created a postback log entry
    const postbackInsert = mockPool.query.mock.calls.find(call =>
      call[0].includes('INSERT INTO 1ai_postback_logs')
    );
    expect(postbackInsert).toBeDefined();
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
  });

  test('7B: should handle concurrent postbacks without race conditions', async () => {
    // This tests that locking/transaction mechanisms prevent duplicate earnings
    // when two postbacks arrive simultaneously for the same click_id
    const linkRow = { id: 1, affiliate_id: 10, offer_id: 5, postback_url: 'https://advertiser.com/cb', postback_auth_type: null, postback_auth_value: null };

    // Simulate TWO concurrent requests for same click_id
    mockPool.query
      .mockResolvedValueOnce([[linkRow]])       // Req 1: link lookup
      .mockResolvedValueOnce([[]])              // Req 1: dedup — no existing
      .mockResolvedValueOnce([[linkRow]])       // Req 2: link lookup (before Req 1 finished insert)
      .mockResolvedValueOnce([[]]);            // Req 2: dedup — also no existing! (race condition)

    const req1 = { query: { click_id: 'race456', payout: '10' } };
    const res1 = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    const req2 = { query: { click_id: 'race456', payout: '10' } };
    const res2 = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    // Simulate concurrent execution
    await Promise.all([
      receivePostback(req1, res1),
      receivePostback(req2, res2)
    ]);

     // Both should NOT get success (race condition detected)
     // At minimum, the first should succeed and the second should fail
     const results = [res1.json.mock.calls[0], res2.json.mock.calls[0]];
     const successes = results.filter(r => r && r[0] && r[0].success).length;
     expect(successes).toBeLessThanOrEqual(1);
  });

  test('1H: should accept postback parameters from POST body', async () => {
    const linkRow = { id: 1, affiliate_id: 10, offer_id: 5, postback_url: 'https://advertiser.com/cb', postback_auth_type: null, postback_auth_value: null };

    mockPool.query
      .mockResolvedValueOnce([[linkRow]])
      .mockResolvedValueOnce([[]])
      .mockResolvedValueOnce([{ insertId: 42 }])
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([{ insertId: 100 }])
      .mockResolvedValueOnce([[]])
      .mockResolvedValueOnce([]);

    const req = { query: {}, body: { click_id: 'body123', payout: '31', transaction_id: 'tx-body', event: 'sale' } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    await receivePostback(req, res);

    expect(res.json).toHaveBeenCalledWith({
      success: true,
      postback_id: 42,
      payout: '31',
      click_id: 'body123'
    });
  });
});

// ============================================================
// BLOCK 6: POST Method & Custom Headers (4 new tests)
// ============================================================
describe('firePostback with POST method and custom headers', () => {
  beforeEach(() => {
    mockHttpRequest.mockImplementation((url, opts, cb) => {
      const mockRes = {
        statusCode: 200,
        on: (evt, handler) => { if (evt === 'data') handler('ok'); if (evt === 'end') handler(); },
      };
      if (cb) cb(mockRes);
      return { on: jest.fn(), destroy: jest.fn(), end: jest.fn() };
    });
  });

  test('2E: should fire POST request with JSON body when method=POST', async () => {
    const logRow = { id: 1, offer_id: 5, click_id: 'abc123', payout: 50, transaction_id: 'tx1', conversion_event: 'purchase', status: 'pending', retry_count: 0, created_at: Date.now() };
    const offerRow = { 
      postback_url: 'https://advertiser.com/cb', 
      postback_enabled: true, 
      postback_timeout: 10, 
      postback_auth_type: null, 
      postback_auth_value: null,
      postback_method: 'POST',
      postback_headers: '{}',
      postback_retries: 3
    };

    let capturedMethod = null;
    let capturedBody = null;
    let capturedHeaders = null;

    mockHttpRequest.mockImplementation((url, opts, cb) => {
      capturedMethod = opts.method;
      capturedHeaders = opts.headers;
      
      const mockRes = {
        statusCode: 200,
        on: (evt, handler) => { if (evt === 'data') handler('ok'); if (evt === 'end') handler(); },
      };
      if (cb) cb(mockRes);
      
      return { 
        on: jest.fn(), 
        destroy: jest.fn(), 
        end: jest.fn(),
        write: jest.fn((data) => { capturedBody = data; })
      };
    });

    mockPool.query
      .mockResolvedValueOnce([[logRow]])
      .mockResolvedValueOnce([[offerRow]])
      .mockResolvedValueOnce([]); // UPDATE query

    await firePostback(1);

    expect(capturedMethod).toBe('POST');
    expect(capturedBody).toBeDefined();
    const parsedBody = JSON.parse(capturedBody);
    expect(parsedBody.click_id).toBe('abc123');
    expect(parsedBody.payout).toBe(50);
    expect(parsedBody.status).toBe('approved');
    expect(capturedHeaders['Content-Type']).toBe('application/json');
    expect(capturedHeaders['Content-Length']).toBeDefined();
  });

  test('2F: should merge custom headers into default headers for POST', async () => {
    const logRow = { id: 1, offer_id: 5, click_id: 'abc123', payout: 50, transaction_id: 'tx1', conversion_event: 'sale', status: 'pending', retry_count: 0, created_at: Date.now() };
    const offerRow = { 
      postback_url: 'https://advertiser.com/cb', 
      postback_enabled: true, 
      postback_timeout: 10, 
      postback_auth_type: 'api_key',
      postback_auth_value: 'secret-key-123',
      postback_method: 'POST',
      postback_headers: '{"X-Custom-Header":"CustomValue","X-Request-ID":"req-abc"}',
      postback_retries: 3
    };

    let capturedHeaders = null;

    mockHttpRequest.mockImplementation((url, opts, cb) => {
      capturedHeaders = opts.headers;
      
      const mockRes = {
        statusCode: 200,
        on: (evt, handler) => { if (evt === 'data') handler('ok'); if (evt === 'end') handler(); },
      };
      if (cb) cb(mockRes);
      
      return { on: jest.fn(), destroy: jest.fn(), end: jest.fn(), write: jest.fn() };
    });

    mockPool.query
      .mockResolvedValueOnce([[logRow]])
      .mockResolvedValueOnce([[offerRow]])
      .mockResolvedValueOnce([]); // UPDATE query

    await firePostback(1);

    expect(capturedHeaders['X-API-Key']).toBe('secret-key-123');
    expect(capturedHeaders['X-Custom-Header']).toBe('CustomValue');
    expect(capturedHeaders['X-Request-ID']).toBe('req-abc');
    expect(capturedHeaders['User-Agent']).toBe('1ai-Affiliate/1.0');
  });

  test('2G: setOfferPostback should accept and validate postback_method', async () => {
    const req = {
      params: { offerId: 5 },
      body: { 
        postback_url: 'https://advertiser.com/cb',
        postback_enabled: true,
        postback_method: 'POST',
        postback_headers: '{"X-Token":"xyz"}'
      }
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    mockPool.query.mockResolvedValueOnce([]);

    await setOfferPostback(req, res);

    const updateCall = mockPool.query.mock.calls[0];
    expect(updateCall[0]).toContain('postback_method');
    expect(updateCall[1]).toContain('POST');
    expect(res.json).toHaveBeenCalledWith({ success: true, offer_id: 5 });
  });

  test('2H: parsePostbackHeaders should drop arrays/primitives and stringify valid object values', async () => {
    expect(parsePostbackHeaders('["bad"]')).toEqual({});
    expect(parsePostbackHeaders('"bad"')).toEqual({});
    expect(parsePostbackHeaders('{"X-Count":3,"X-Enabled":true,"X-Null":null}')).toEqual({
      'X-Count': '3',
      'X-Enabled': 'true'
    });
  });

  test('2I: setOfferPostback should reject invalid timeout and retry bounds', async () => {
    const timeoutReq = {
      params: { offerId: 5 },
      body: { postback_url: 'https://advertiser.com/cb', postback_timeout: 0 }
    };
    const timeoutRes = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    await setOfferPostback(timeoutReq, timeoutRes);

    expect(timeoutRes.status).toHaveBeenCalledWith(400);
    expect(timeoutRes.json).toHaveBeenCalledWith({ error: 'postback_timeout must be an integer between 1 and 60' });

    const retriesReq = {
      params: { offerId: 5 },
      body: { postback_url: 'https://advertiser.com/cb', postback_retries: 11 }
    };
    const retriesRes = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    await setOfferPostback(retriesReq, retriesRes);

    expect(retriesRes.status).toHaveBeenCalledWith(400);
    expect(retriesRes.json).toHaveBeenCalledWith({ error: 'postback_retries must be an integer between 0 and 10' });
  });

  test('2J: setOfferPostback should reject invalid postback_method', async () => {
    const req = {
      params: { offerId: 5 },
      body: { 
        postback_url: 'https://advertiser.com/cb',
        postback_method: 'DELETE'
      }
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    await setOfferPostback(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'postback_method must be GET or POST' });
  });
});

// ============================================================
// BLOCK 7: Postback Queue State Machine — Terminal vs Retry (3 tests)
// ============================================================
describe('PostbackQueue processBatch - Terminal Failed vs Retry Rows', () => {
  test('7A: should select only queued and retry rows, excluding terminal failed', async () => {
    const queuedAndRetryRows = [
      { id: 1, postback_log_id: 10, status: 'queued' },
      { id: 2, postback_log_id: 20, status: 'retry' },
    ];

    mockPool.query
      .mockResolvedValueOnce([queuedAndRetryRows])
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([]);

    const PostbackQueue = require('../services/postbackQueue');
    await PostbackQueue.process();

    const selectCall = mockPool.query.mock.calls[0];
    expect(selectCall[0]).toContain("WHERE pql.status IN ('queued', 'retry')");
    expect(selectCall[0]).not.toContain("'failed'");
  });

  test('7B: should not reprocess terminal failed rows', async () => {
    mockPool.query
      .mockResolvedValueOnce([[]])
      .mockResolvedValueOnce([]);

    const PostbackQueue = require('../services/postbackQueue');
    await PostbackQueue.process();

    const selectCall = mockPool.query.mock.calls[0];
    expect(selectCall[0]).toContain("('queued', 'retry')");

    const processUpdates = mockPool.query.mock.calls.filter(call =>
      call[0].includes('UPDATE 1ai_postback_queue SET status = ?')
    );
    expect(processUpdates.length).toBe(0);
  });

  test('7C: should continue processing retry rows after initial failure', async () => {
    const retryRow = [
      { id: 5, postback_log_id: 50, status: 'retry' },
    ];

    mockPool.query
      .mockResolvedValueOnce([retryRow])
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([[{
        id: 50,
        offer_id: 3,
        postback_enabled: 1,
      }]])
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([]);

    const PostbackQueue = require('../services/postbackQueue');
    await PostbackQueue.process();

    expect(mockPool.query.mock.calls.length).toBeGreaterThan(0);

    const selectCall = mockPool.query.mock.calls[0];
    expect(selectCall[0]).toContain("('queued', 'retry')");
  });
});
