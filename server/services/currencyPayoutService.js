const { queryOne, queryInsert, queryUpdate } = require('../utils/queryHelpers');

/**
 * Hardcoded exchange rates — base USD.
 * Pull from config/DB when rates module lands.
 */
const EXCHANGE_RATES = {
  USD: 1,
  IDR: 16250,
  PHP: 56,
  THB: 36,
  VND: 25400,
  MYR: 4.70,
  SGD: 1.35,
  KRW: 1350,
  JPY: 155,
  CNY: 7.25,
  INR: 83.50,
  EUR: 0.92,
  GBP: 0.79,
  AUD: 1.55,
  CAD: 1.37,
};

const SUPPORTED_CURRENCIES = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'IDR', symbol: 'Rp', name: 'Indonesian Rupiah' },
  { code: 'PHP', symbol: '₱', name: 'Philippine Peso' },
  { code: 'THB', symbol: '฿', name: 'Thai Baht' },
  { code: 'VND', symbol: '₫', name: 'Vietnamese Dong' },
  { code: 'MYR', symbol: 'RM', name: 'Malaysian Ringgit' },
  { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar' },
  { code: 'KRW', symbol: '₩', name: 'South Korean Won' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
  { code: 'CNY', symbol: '¥', name: 'Chinese Yuan' },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
];

/**
 * Apply rounding based on mode.
 */
function applyRounding(value, mode) {
  switch (mode) {
    case 'ceil':  return Math.ceil(value);
    case 'floor': return Math.floor(value);
    case 'round': return Math.round(value);
    default:      return Math.round(value);
  }
}

/**
 * Get payout currency preferences for an affiliate.
 * @param {number} affiliateId
 * @returns {Promise<object|null>}
 */
async function getPreferences(affiliateId) {
  return queryOne(
    'SELECT * FROM 1ai_payout_currency_prefs WHERE affiliate_id = ?',
    [affiliateId]
  );
}

/**
 * Create or update payout currency preferences.
 * @param {number} affiliateId
 * @param {string} preferredCurrency - ISO 4217 code
 * @param {number} autoConvert - 0|1
 * @param {string} roundingMode - round|ceil|floor
 * @returns {Promise<number>} insertId
 */
async function upsertPreferences(affiliateId, preferredCurrency, autoConvert, roundingMode) {
  const now = Math.floor(Date.now() / 1000);
  return queryInsert(
    `INSERT INTO 1ai_payout_currency_prefs
     (affiliate_id, preferred_currency, auto_convert, rounding_mode, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE
       preferred_currency = VALUES(preferred_currency),
       auto_convert = VALUES(auto_convert),
       rounding_mode = VALUES(rounding_mode),
       updated_at = VALUES(updated_at)`,
    [affiliateId, preferredCurrency, autoConvert, roundingMode, now, now]
  );
}

/**
 * Convert an amount between currencies using hardcoded rates.
 * @param {number} amount
 * @param {string} fromCurrency - ISO 4217
 * @param {string} toCurrency - ISO 4217
 * @param {string} [roundingMode=round] - round|ceil|floor
 * @returns {{ amount: number, rate: number, from: string, to: string }}
 */
function convertAmount(amount, fromCurrency, toCurrency, roundingMode = 'round') {
  const fromRate = EXCHANGE_RATES[fromCurrency];
  const toRate = EXCHANGE_RATES[toCurrency];

  if (fromRate === undefined) {
    throw new Error(`Unsupported currency: ${fromCurrency}`);
  }
  if (toRate === undefined) {
    throw new Error(`Unsupported currency: ${toCurrency}`);
  }

  // Convert amount to USD first, then to target
  const usdAmount = amount / fromRate;
  const rawConverted = usdAmount * toRate;
  const converted = applyRounding(rawConverted, roundingMode);

  return {
    amount: converted,
    rate: toRate / fromRate,
    from: fromCurrency,
    to: toCurrency,
  };
}

/**
 * Get list of supported currencies with symbols.
 * @returns {Array<{code:string, symbol:string, name:string}>}
 */
function getSupportedCurrencies() {
  return SUPPORTED_CURRENCIES;
}

/**
 * Get current exchange rates map.
 * @returns {object}
 */
function getExchangeRates() {
  return { ...EXCHANGE_RATES };
}

module.exports = {
  getPreferences,
  upsertPreferences,
  convertAmount,
  getSupportedCurrencies,
  getExchangeRates,
};
