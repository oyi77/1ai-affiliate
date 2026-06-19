/**
 * Shopee CSV Parser Test Suite
 * Tests: parseShopeeCsv, mapCommissionRow, parseIndonesianNumber, parseDate
 */

const path = require('path');
const fs = require('fs');
const {
  parseShopeeCsv,
  mapCommissionRow,
  parseIndonesianNumber,
  parseDate,
} = require('../services/shopeeService');

const FIXTURE_PATH = path.join(__dirname, 'fixtures', 'shopee_commission_sample.csv');

describe('parseIndonesianNumber', () => {
  test('parses "Rp 12.500" to 12500', () => {
    expect(parseIndonesianNumber('Rp 12.500')).toBe(12500);
  });

  test('parses "Rp 250.000" to 250000', () => {
    expect(parseIndonesianNumber('Rp 250.000')).toBe(250000);
  });

  test('parses plain number string "9450" to 9450', () => {
    expect(parseIndonesianNumber('9450')).toBe(9450);
  });

  test('parses number with decimal comma "12.345,67" to 12345.67', () => {
    expect(parseIndonesianNumber('12.345,67')).toBe(12345.67);
  });

  test('returns 0 for null', () => {
    expect(parseIndonesianNumber(null)).toBe(0);
  });

  test('returns 0 for empty string', () => {
    expect(parseIndonesianNumber('')).toBe(0);
  });

  test('returns 0 for undefined', () => {
    expect(parseIndonesianNumber(undefined)).toBe(0);
  });

  test('returns 0 for non-numeric string', () => {
    expect(parseIndonesianNumber('abc')).toBe(0);
  });
});

describe('parseDate', () => {
  test('parses "01/06/2026" to "2026-06-01"', () => {
    expect(parseDate('01/06/2026')).toBe('2026-06-01');
  });

  test('parses "2026-06-01" ISO format unchanged', () => {
    expect(parseDate('2026-06-01')).toBe('2026-06-01');
  });

  test('parses "15-03-2026" DD-MM-YYYY to "2026-03-15"', () => {
    expect(parseDate('15-03-2026')).toBe('2026-03-15');
  });

  test('returns null for null input', () => {
    expect(parseDate(null)).toBeNull();
  });

  test('returns null for empty string', () => {
    expect(parseDate('')).toBeNull();
  });

  test('returns null for unparseable string', () => {
    expect(parseDate('not-a-date')).toBeNull();
  });
});

describe('parseShopeeCsv', () => {
  let result;

  beforeAll(() => {
    const buffer = fs.readFileSync(FIXTURE_PATH);
    result = parseShopeeCsv(buffer);
  });

  test('detects format as "commission"', () => {
    expect(result.format).toBe('commission');
  });

  test('returns 5 data rows', () => {
    expect(result.rows).toHaveLength(5);
  });

  test('parses headers correctly', () => {
    expect(result.headers).toContain('Order ID');
    expect(result.headers).toContain('Product Name');
    expect(result.headers).toContain('Commission');
    expect(result.headers).toContain('Sub ID');
  });

  test('first row has expected Order ID', () => {
    expect(result.rows[0]['Order ID']).toBe('ORD-20260601-001');
  });

  test('first row has expected Product Name', () => {
    expect(result.rows[0]['Product Name']).toBe('Tas Selempang Wanita Fashion');
  });

  test('row 3 is Dibatalkan status', () => {
    expect(result.rows[2]['Order Status']).toBe('Dibatalkan');
  });

  test('handles BOM-prefixed CSV', () => {
    const bomBuffer = Buffer.from('\uFEFF' + fs.readFileSync(FIXTURE_PATH, 'utf-8'));
    const bomResult = parseShopeeCsv(bomBuffer);
    expect(bomResult.rows).toHaveLength(5);
  });

  test('throws on empty CSV', () => {
    expect(() => parseShopeeCsv(Buffer.from(''))).toThrow('empty');
  });

  test('throws on header-only CSV', () => {
    expect(() => parseShopeeCsv(Buffer.from('Order ID,Product Name\n'))).toThrow('empty');
  });
});

describe('mapCommissionRow', () => {
  const rawRow = {
    'Order ID': 'ORD-20260601-001',
    'Product Name': 'Tas Selempang Wanita Fashion',
    'Product Category': 'Tas',
    'Order Amount': '250000',
    'Commission': '12500',
    'Commission Net': '11250',
    'Order Status': 'Selesai',
    'Order Type': 'Same Shop',
    'Sub ID': 'meta_camp_1',
    'Date': '2026-06-01',
    'Click Time': '1717200000',
    'Order Time': '1717286400',
  };

  test('maps order_id correctly', () => {
    const mapped = mapCommissionRow(rawRow, 10, 1);
    expect(mapped.order_id).toBe('ORD-20260601-001');
  });

  test('maps product_name correctly', () => {
    const mapped = mapCommissionRow(rawRow, 10, 1);
    expect(mapped.product_name).toBe('Tas Selempang Wanita Fashion');
  });

  test('maps commission_gross as number', () => {
    const mapped = mapCommissionRow(rawRow, 10, 1);
    expect(mapped.commission_gross).toBe(12500);
    expect(typeof mapped.commission_gross).toBe('number');
  });

  test('maps commission_net as number', () => {
    const mapped = mapCommissionRow(rawRow, 10, 1);
    expect(mapped.commission_net).toBe(11250);
  });

  test('maps order_amount as number', () => {
    const mapped = mapCommissionRow(rawRow, 10, 1);
    expect(mapped.order_amount).toBe(250000);
  });

  test('sets advertiser_id from parameter', () => {
    const mapped = mapCommissionRow(rawRow, 42, 1);
    expect(mapped.advertiser_id).toBe(42);
  });

  test('sets user_id from parameter', () => {
    const mapped = mapCommissionRow(rawRow, 10, 99);
    expect(mapped.user_id).toBe(99);
  });

  test('maps taglink from Sub ID', () => {
    const mapped = mapCommissionRow(rawRow, 10, 1);
    expect(mapped.taglink).toBe('meta_camp_1');
  });

  test('maps report_date from Date column', () => {
    const mapped = mapCommissionRow(rawRow, 10, 1);
    expect(mapped.report_date).toBe('2026-06-01');
  });

  test('maps order_status correctly', () => {
    const mapped = mapCommissionRow(rawRow, 10, 1);
    expect(mapped.order_status).toBe('Selesai');
  });

  test('sets created_at as unix timestamp', () => {
    const mapped = mapCommissionRow(rawRow, 10, 1);
    expect(mapped.created_at).toBeGreaterThan(1700000000);
    expect(typeof mapped.created_at).toBe('number');
  });

  test('handles missing optional fields gracefully', () => {
    const sparseRow = { 'Order ID': 'X1' };
    const mapped = mapCommissionRow(sparseRow, 1, 1);
    expect(mapped.order_id).toBe('X1');
    expect(mapped.product_name).toBeNull();
    expect(mapped.commission_gross).toBe(0);
    expect(mapped.taglink).toBeNull();
  });
});
