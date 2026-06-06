/**
 * DOM utilities — shared UI components with premium glassmorphic aesthetics.
 */
const DOM = (function() {
  function skeleton() {
    return `
      <div class="skeleton" style="height:200px;margin-bottom:24px;border-radius:12px"></div>
      <div class="skeleton" style="height:150px;border-radius:12px"></div>`;
  }

  function statCard({ label, value, sub, accent = 'indigo' }) {
    const colors = {
      indigo: { line: 'var(--indigo)', bg: 'rgba(99,102,241,0.1)' },
      green:  { line: 'var(--green)', bg: 'rgba(16,185,129,0.1)' },
      yellow: { line: 'var(--yellow)', bg: 'rgba(245,158,11,0.1)' },
      red:    { line: 'var(--red)', bg: 'rgba(239,68,68,0.1)' },
      blue:   { line: 'var(--blue)', bg: 'rgba(59,130,246,0.1)' },
      purple: { line: 'var(--purple)', bg: 'rgba(139,92,246,0.1)' },
    };
    const c = colors[accent] || colors.indigo;
    return `
      <div class="stat-card" style="border-left:4px solid ${c.line}">
        <div style="position:absolute;top:0;right:0;width:100px;height:100px;background:radial-gradient(circle at top right, ${c.line}, transparent 70%);opacity:0.15;border-radius:0 12px 0 0"></div>
        <div class="label" style="display:flex;align-items:center;gap:8px">
          <span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${c.line};box-shadow:0 0 6px ${c.line}"></span>
          ${label}
        </div>
        <div class="value">${value}</div>
        ${sub ? `<div style="font-size:12px;color:var(--text2);margin-top:8px;font-weight:500;display:inline-flex;align-items:center;gap:4px;padding:4px 8px;background:${c.bg};border-radius:6px">${sub}</div>` : ''}
      </div>`;
  }

  function pageHeader(title, subtitle) {
    return `<div class="page-header" style="margin-bottom:32px">
      <h1 style="font-size:28px;font-weight:700;letter-spacing:-0.02em;background:linear-gradient(90deg,#fff,var(--text2));-webkit-background-clip:text;-webkit-text-fill-color:transparent">${title}</h1>
      ${subtitle ? `<p style="color:var(--text2);font-size:14px;margin-top:8px;font-weight:500;line-height:1.5">${subtitle}</p>` : ''}
    </div>`;
  }

  function pill(text, type = 'indigo') {
    return `<span class="pill pill-${type}">${text}</span>`;
  }

  function table(headers, rows) {
    return `<div class="table-wrap"><table>
      <tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr>
      ${rows.map(r => `<tr>${r.map(c => `<td>${c}</td>`).join('')}</tr>`).join('')}
    </table></div>`;
  }

  function msg(type, text) {
    const isOk = type === 'ok' || type === 'success';
    return `<div style="padding:10px 14px;background:rgba(${isOk?'16,185,129':'239,68,68'},0.1);border:1px solid rgba(${isOk?'16,185,129':'239,68,68'},0.2);border-radius:8px;font-size:13px;font-weight:500;color:var(--${isOk?'green':'red'});margin:8px 0">${text}</div>`;
  }

  function emptyState(title, message) {
    return `<div class="card" style="text-align:center;padding:64px 20px;border-style:dashed;background:rgba(255,255,255,0.02)">
      <div style="width:64px;height:64px;margin:0 auto 20px;border-radius:16px;background:rgba(255,255,255,0.05);display:flex;align-items:center;justify-content:center">
        <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="var(--text2)" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="9" y1="9" x2="15" y2="15"/><line x1="15" y1="9" x2="9" y2="15"/></svg>
      </div>
      <h3 style="margin-bottom:8px;font-size:18px">${title}</h3>
      <p style="color:var(--text2);font-size:14px;max-width:300px;margin:0 auto;line-height:1.5">${message}</p>
    </div>`;
  }

  function badge(text, accent = 'indigo') {
    return `<span class="pill pill-${accent}">${text}</span>`;
  }

  return { skeleton, statCard, pageHeader, pill, table, msg, emptyState, badge };
})();

// Global UI utilities (e.g. Toast)
window.AppUI = window.AppUI || {};
window.AppUI.toast = function(message, type = 'info') {
  const container = document.getElementById('toast-container');
  if (!container) return console.log('Toast:', message);
  
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  
  let icon = '<svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>';
  if (type === 'success') icon = '<svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>';
  if (type === 'error' || type === 'err') {
    toast.className = 'toast error';
    icon = '<svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>';
  }

  toast.innerHTML = `${icon}<span>${message}</span>`;
  container.appendChild(toast);
  
  // Animate in
  setTimeout(() => toast.classList.add('show'), 10);
  
  // Remove after delay
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, 4000);
};