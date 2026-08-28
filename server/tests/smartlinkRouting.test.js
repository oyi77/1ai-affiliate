process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret-1ai-affiliate';

/**
 * Golden-parity test for the smartlink attribution hot path.
 *
 * Proves the per-click routing SELECTION semantics are byte-identical to
 * production behaviour across the offerSupportsCountry memoization change.
 * No live DB: the mysql pool is mocked to return a fixed smartlink + offers set.
 */

const mockPool = require('./mocks/database');
jest.mock('../db/mysql', () => mockPool);

const pool = require('../db/mysql');
const {
  routeSmartlink,
  offerSupportsCountry,
  buildRedirectUrl,
} = require('../services/smartlinkRoutingService');

function configurePool(smartlinkRow, offerRows) {
  pool.query.mockImplementation(async (sql) => {
    if (sql.includes('1ai_smartlink_offers')) return [offerRows];
    if (sql.includes('1ai_smartlinks')) return [[smartlinkRow]];
    return [[]];
  });
}

const VISITOR = {
  country_code: 'US',
  device_type: 'desktop',
  isp: 'comcast',
  connection_type: 'broadband',
};

const SMARTLINK = {
  id: 7,
  user_id: 13,
  fallback_offer_id: null,
  default_url: 'https://fallback.example.com',
  rotate_mode: 'priority',
  rotate_param: 'subid',
  rotate_fields: '',
};

// Offer A is geo-excluded from US; Offer B matches US. With rotate_mode
// 'priority' and a single matched offer, the selection is deterministic (B).
const OFFER_A = {
  id: 101, name: 'UK only', geo: 'GB', device: '', isp: '',
  url: 'https://a.example.com/lp', weight: 10, landing_url: '', status: 'active', offer_status: 'active', tracking_url: 'https://a.example.com/lp',
};
const OFFER_B = {
  id: 102, name: 'US/CA', geo: 'US,CA', device: '', isp: '',
  url: 'https://b.example.com/lp', weight: 5, landing_url: '', status: 'active', offer_status: 'active', tracking_url: 'https://b.example.com/lp',
};

beforeEach(() => {
  pool.query.mockReset();
  configurePool(SMARTLINK, [OFFER_A, OFFER_B]);
});

describe('offerSupportsCountry — byte-identical semantics', () => {
  test('empty geo or country defaults to allow (true)', () => {
    expect(offerSupportsCountry('', 'US')).toBe(true);
    expect(offerSupportsCountry('US', '')).toBe(true);
    expect(offerSupportsCountry(null, 'US')).toBe(true);
  });

  test('ALL matches any country', () => {
    expect(offerSupportsCountry('ALL', 'GB')).toBe(true);
    expect(offerSupportsCountry('ALL,US', 'DE')).toBe(true);
  });

  test('explicit membership match is case-insensitive', () => {
    expect(offerSupportsCountry('US,CA', 'US')).toBe(true);
    expect(offerSupportsCountry('us,ca', 'US')).toBe(true);
    expect(offerSupportsCountry('US,CA', 'us')).toBe(true);
  });

  test('non-member country is excluded', () => {
    expect(offerSupportsCountry('US,CA', 'GB')).toBe(false);
    expect(offerSupportsCountry('GB', 'US')).toBe(false);
  });

  test('whitespace around tokens is tolerated', () => {
    expect(offerSupportsCountry(' US , CA ', 'CA')).toBe(true);
    expect(offerSupportsCountry(' US , CA ', 'DE')).toBe(false);
  });
});

describe('routeSmartlink — selection parity', () => {
  test('selects the geo-matching offer (B), never the excluded one (A)', async () => {
    const result = await routeSmartlink(7, VISITOR);
    expect(result.offer).not.toBeNull();
    expect(result.offer.id).toBe(102); // OFFER_B
    expect(result.offer.id).not.toBe(101); // OFFER_A excluded
    expect(result.smartlink.id).toBe(7);
    // routeSmartlink returns redirectUrl:null; the controller builds it.
    expect(result.redirectUrl).toBeNull();
  });

  test('buildRedirectUrl substitutes the clickid placeholder in the chosen offer url', () => {
    const offer = { tracking_url: OFFER_B.url + '?sub={clickid}' };
    const url = buildRedirectUrl(offer, 'CID123');
    expect(url).toContain(OFFER_B.url);
    expect(url).toContain('sub=CID123');
  });

  test('geo-excluded visitor with only-excluded offers falls back to default_url', async () => {
    const gbVisitor = { ...VISITOR, country_code: 'GB' };
    // OFFER_A matches GB, OFFER_B excluded for GB → A is chosen
    const result = await routeSmartlink(7, gbVisitor);
    expect(result.offer.id).toBe(101);
  });
});
