/**
 * Shared currency formatting for the frontend.
 * ponytail: one function, locale-aware, uses Intl.NumberFormat.
 */

const SYMBOLS = {
  IDR: 'Rp', USD: '$', EUR: '€', GBP: '£', THB: '฿', MYR: 'RM',
  SGD: 'S$', PHP: '₱', VND: '₫', JPY: '¥', KRW: '₩',
};

/**
 * Format amount with currency symbol.
 * @param {number} amount
 * @param {string} [currency='IDR']
 * @returns {string}
 */
export function formatCurrency(amount, currency = 'IDR') {
  const sym = SYMBOLS[currency] || currency;
  const n = Number(amount) || 0;
  const opts = ['IDR', 'JPY', 'KRW', 'VND'].includes(currency)
    ? { maximumFractionDigits: 0 }
    : { minimumFractionDigits: 2, maximumFractionDigits: 2 };
  return `${sym}${n.toLocaleString(undefined, opts)}`;
}

/**
 * Format as IDR shorthand (legacy compatibility).
 */
export function formatIDR(amount) {
  return `Rp ${Number(amount || 0).toLocaleString('id-ID')}`;
}
