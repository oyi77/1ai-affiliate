/**
 * Format utilities — pure functions, no side effects.
 * Single responsibility: data formatting for display.
 */
const Fmt = {
  money: (n) => 'Rp ' + Number(n || 0).toLocaleString('id-ID', { maximumFractionDigits: 0 }),
  num: (n) => Number(n || 0).toLocaleString('id-ID'),
  date: (ts) => ts ? new Date(ts * 1000).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) : '—',
  pct: (n) => (Number(n || 0) * 100).toFixed(1) + '%',
  fileSize: (bytes) => {
    if (bytes > 1024 * 1024) return (bytes / 1024 / 1024).toFixed(1) + ' MB';
    if (bytes > 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return bytes + ' B';
  },
  maskKey: (key, show = 8) => key ? key.slice(0, show) + '...' + '\u2022'.repeat(16) : 'Not configured',
  slugToTitle: (slug) => slug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
};