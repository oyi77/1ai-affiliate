/**
 * Frontend App Configuration — single source of truth.
 * Change here → changes everywhere. Zero hardcoded values in page renderers.
 */
const AppConfig = (function() {
  // ── Currency ───────────────────────────────────────────────────
  const CURRENCY_SYMBOLS = {
    IDR: 'Rp', USD: '$', EUR: '€', GBP: '£', THB: '฿', MYR: 'RM',
    SGD: 'S$', PHP: '₱', VND: '₫', JPY: '¥', KRW: '₩',
  };

  const currency = {
    code: 'IDR',
    symbol: 'Rp',
    locale: 'id-ID',
    noDecimalCurrencies: ['IDR', 'JPY', 'KRW', 'VND'],
  };

  // ── Date ───────────────────────────────────────────────────────
  const date = {
    locale: 'id-ID',
    format: { day: '2-digit', month: 'short', year: 'numeric' },
    timeFormat: { hour: '2-digit', minute: '2-digit' },
  };

  // ── UI ─────────────────────────────────────────────────────────
  const ui = {
    pageSize: 50,
    pageSizeMax: 200,
    skeletonDelay: 300,
    toastDuration: 3000,
    colors: ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#3b82f6', '#8b5cf6', '#ec4899'],
  };

  // ── Formatting Functions ───────────────────────────────────────
  function formatCurrency(amount, code) {
    const c = code || currency.code;
    const sym = CURRENCY_SYMBOLS[c] || c;
    const n = Number(amount) || 0;
    const noDecimal = currency.noDecimalCurrencies.includes(c);
    const opts = noDecimal
      ? { maximumFractionDigits: 0 }
      : { minimumFractionDigits: 2, maximumFractionDigits: 2 };
    return sym + ' ' + n.toLocaleString(currency.locale, opts);
  }

  function formatDate(ts) {
    if (!ts) return '-';
    return new Date(ts * 1000).toLocaleDateString(date.locale, date.format);
  }

  function formatDateTime(ts) {
    if (!ts) return '-';
    return new Date(ts * 1000).toLocaleString(date.locale, { ...date.format, ...date.timeFormat });
  }

  function formatNumber(num, decimals) {
    return (Number(num) || 0).toLocaleString(currency.locale, {
      minimumFractionDigits: decimals || 0,
      maximumFractionDigits: decimals || 0,
    });
  }

  function formatPercent(value, decimals) {
    return (Number(value) || 0).toFixed(decimals !== undefined ? decimals : 1) + '%';
  }

  // ── Public API ─────────────────────────────────────────────────
  return {
    currency, date, ui,
    CURRENCY_SYMBOLS,
    formatCurrency,
    formatDate,
    formatDateTime,
    formatNumber,
    formatPercent,
    // Short aliases
    fc: formatCurrency,
    fd: formatDate,
    fdt: formatDateTime,
    fn: formatNumber,
    fp: formatPercent,
  };
})();
