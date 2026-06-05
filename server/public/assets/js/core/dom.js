/**
 * DOM utilities — shared UI components.
 */
const DOM = (function() {
  function skeleton() {
    return `
      <div class="skeleton" style="height:200px;margin-bottom:16px"></div>
      <div class="skeleton" style="height:150px"></div>`;
  }

  function statCard({ label, value, sub, accent = 'indigo' }) {
    const colors = {
      indigo: { glow: 'rgba(99,102,241,.15)', line: '#6366f1' },
      green:  { glow: 'rgba(63,185,80,.12)', line: '#3fb950' },
      yellow: { glow: 'rgba(210,153,34,.12)', line: '#d29922' },
      red:    { glow: 'rgba(248,81,73,.12)', line: '#f85149' },
      blue:   { glow: 'rgba(88,166,255,.12)', line: '#58a6ff' },
    };
    const c = colors[accent] || colors.indigo;
    return `
      <div class="stat-card" style="border-left:3px solid ${c.line}">
        <div class="label">${label}</div>
        <div class="value">${value}</div>
        ${sub ? `<div style="font-size:11px;color:var(--text2);margin-top:4px">${sub}</div>` : ''}
      </div>`;
  }

  function pageHeader(title, subtitle) {
    return `<div class="page-header" style="margin-bottom:24px">
      <h1 style="font-size:24px;font-weight:700">${title}</h1>
      ${subtitle ? `<p style="color:var(--text2);font-size:13px;margin-top:4px">${subtitle}</p>` : ''}
    </div>`;
  }

  function pill(text, type = 'info') {
    return `<span class="pill pill-${type}">${text}</span>`;
  }

  function table(headers, rows) {
    return `<div class="table-wrap"><table>
      <tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr>
      ${rows.map(r => `<tr>${r.map(c => `<td>${c}</td>`).join('')}</tr>`).join('')}
    </table></div>`;
  }

  function msg(type, text) {
    return `<span style="font-size:13px;color:${type==='ok'?'var(--green)':'var(--red)'}">${text}</span>`;
  }

  function emptyState(title, message) {
    return `<div class="card" style="text-align:center;padding:48px 20px">
      <div style="font-size:40px;margin-bottom:12px;opacity:.3">—</div>
      <h3 style="margin-bottom:6px">${title}</h3>
      <p style="color:var(--text2);font-size:13px">${message}</p>
    </div>`;
  }

  function badge(text, accent = 'indigo') {
    const colors = {
      indigo:  'var(--indigo)',
      green:   'var(--green)',
      yellow:  'var(--yellow)',
      red:     'var(--red)',
      blue:    'var(--blue)',
    };
    const c = colors[accent] || colors.indigo;
    return `<span style="display:inline-flex;align-items:center;gap:4px;font-size:12px;font-weight:600;color:${c}">
      <span style="width:6px;height:6px;border-radius:50%;background:${c};display:inline-block"></span>${text}</span>`;
  }

  return { skeleton, statCard, pageHeader, pill, table, msg, emptyState, badge };
})();