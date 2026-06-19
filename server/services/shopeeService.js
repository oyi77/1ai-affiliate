/**
 * Shopee CSV parser and bulk import service.
 * Handles commission and payout CSV formats from Shopee Affiliate.
 */

/**
 * Parse an Indonesian number string (e.g. "Rp 12.345,67") to a float.
 * Strips "Rp", removes dots (thousands separator), replaces comma with period.
 * @param {string|null|undefined} str
 * @returns {number}
 */
function parseIndonesianNumber(str) {
  if (str == null || str === '') return 0;
  let s = String(str).trim();
  // Strip currency prefix
  s = s.replace(/^Rp\s*/i, '');
  // Remove thousands separator dots
  s = s.replace(/\./g, '');
  // Replace decimal comma with period
  s = s.replace(',', '.');
  const num = parseFloat(s);
  return Number.isFinite(num) ? num : 0;
}

/**
 * Parse various date formats to YYYY-MM-DD string.
 * Handles DD/MM/YYYY, YYYY-MM-DD, DD-MM-YYYY.
 * @param {string|null|undefined} str
 * @returns {string|null} — YYYY-MM-DD or null
 */
function parseDate(str) {
  if (str == null || str === '') return null;
  const s = String(str).trim();

  // YYYY-MM-DD already ISO
  if (/^\d{4}-\d{2}-\d{2}/.test(s)) {
    return s.slice(0, 10);
  }

  // DD/MM/YYYY or DD-MM-YYYY
  const match = s.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/);
  if (match) {
    const day = match[1].padStart(2, '0');
    const month = match[2].padStart(2, '0');
    const year = match[3];
    return `${year}-${month}-${day}`;
  }

  return null;
}

/**
 * Parse a single CSV line, respecting quoted fields.
 * @param {string} line
 * @returns {string[]}
 */
function parseCsvLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"') {
        if (i + 1 < line.length && line[i + 1] === '"') {
          current += '"';
          i++; // skip escaped quote
        } else {
          inQuotes = false;
        }
      } else {
        current += ch;
      }
    } else {
      if (ch === '"') {
        inQuotes = true;
      } else if (ch === ',') {
        result.push(current.trim());
        current = '';
      } else {
        current += ch;
      }
    }
  }
  result.push(current.trim());
  return result;
}

/**
 * Parse a Shopee CSV buffer and detect format (commission vs payout).
 * @param {Buffer} buffer — raw CSV file buffer
 * @returns {{ format: 'commission'|'payout', headers: string[], rows: object[] }}
 */
function parseShopeeCsv(buffer) {
  const text = buffer.toString('utf-8').replace(/^\uFEFF/, ''); // strip BOM
  const lines = text.split(/\r?\n/).filter(line => line.trim() !== '');

  if (lines.length < 2) {
    throw new Error('CSV file is empty or has no data rows');
  }

  // Parse headers — handle quoted fields
  const headers = parseCsvLine(lines[0]);
  const rows = [];

  for (let i = 1; i < lines.length; i++) {
    const values = parseCsvLine(lines[i]);
    const row = {};
    for (let j = 0; j < headers.length; j++) {
      row[headers[j]] = values[j] || '';
    }
    rows.push(row);
  }

  // Detect format by header keywords
  const headerSet = new Set(headers.map(h => h.toLowerCase().trim()));
  let format;
  if (headerSet.has('report id')) {
    format = 'payout';
  } else {
    format = 'commission';
  }

  return { format, headers, rows };
}

/**
 * Map a commission-format CSV row to the 1ai_shopee_reports insert shape.
 * @param {object} row — raw CSV row object
 * @param {number} advertiserId
 * @param {number} userId
 * @param {string|null} [shopeeAccountId] — optional Shopee account identifier
 * @param {string|null} [shopeeAccountName] — optional Shopee account display name
 * @returns {object} — ready for INSERT
 */
function mapCommissionRow(row, advertiserId, userId, shopeeAccountId = null, shopeeAccountName = null) {
  return {
    user_id: userId,
    advertiser_id: advertiserId,
    shopee_account_id: shopeeAccountId,
    shopee_account_name: shopeeAccountName,
    taglink: row['Sub ID'] || row['Tag Link'] || row['Affiliate Sub ID'] || null,
    order_id: row['Order ID'] || row['Order No'] || null,
    product_name: row['Product Name'] || row['SKU Name'] || null,
    product_category: row['Category'] || row['Product Category'] || null,
    commission_gross: parseIndonesianNumber(row['Commission'] || row['Commission Gross'] || '0'),
    commission_net: parseIndonesianNumber(row['Commission Net'] || row['Commission'] || '0'),
    order_amount: parseIndonesianNumber(row['Order Amount'] || row['Total Amount'] || '0'),
    order_status: row['Order Status'] || row['Status'] || null,
    order_type: row['Order Type'] || null,
    report_date: parseDate(row['Date'] || row['Order Date'] || row['Transaction Date']),
    created_at: Math.floor(Date.now() / 1000),
  };
}

/**
 * Bulk insert mapped report rows into 1ai_shopee_reports.
 * Uses INSERT IGNORE in batches of 500 to handle duplicates gracefully.
 *
 * @param {import('mysql2/promise').Pool} pool
 * @param {object[]} rows — output of mapCommissionRow
 * @returns {Promise<number>} — total rows inserted
 */
async function bulkInsertReports(pool, rows) {
  if (rows.length === 0) return 0;

  const BATCH_SIZE = 500;
  let inserted = 0;

  const columns = [
    'user_id', 'advertiser_id', 'shopee_account_id', 'shopee_account_name',
    'taglink', 'order_id', 'product_name', 'product_category',
    'commission_gross', 'commission_net', 'order_amount',
    'order_status', 'order_type', 'report_date', 'created_at',
  ];

  for (let i = 0; i < rows.length; i += BATCH_SIZE) {
    const batch = rows.slice(i, i + BATCH_SIZE);
    const placeholders = `(${columns.map(() => '?').join(', ')})`;
    const allPlaceholders = batch.map(() => placeholders).join(', ');
    const values = [];

    for (const row of batch) {
      for (const col of columns) {
        values.push(row[col] ?? null);
      }
    }

    const sql = `INSERT IGNORE INTO 1ai_shopee_reports (${columns.join(', ')}) VALUES ${allPlaceholders}`;
    const [result] = await pool.query(sql, values);
    inserted += result.affectedRows;
  }

  return inserted;
}

module.exports = { parseShopeeCsv, mapCommissionRow, bulkInsertReports, parseIndonesianNumber, parseDate };
