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
    const accents = {
      indigo: 'from-indigo-500/20 to-cyan-500/10',
      green: 'from-emerald-500/20 to-teal-500/10',
      yellow: 'from-amber-500/20 to-orange-500/10',
      red: 'from-rose-500/20 to-pink-500/10',
    };
    return `
      <div class="stat-card relative" style="overflow:hidden">
        <div class="absolute inset-0 bg-gradient-to-br ${accents[accent] || accents.indigo} opacity-50"></div>
        <div style="position:relative">
          <div class="label">${label}</div>
          <div class="value">${value}</div>
          ${sub ? `<div style="font-size:11px;color:var(--text2);margin-top:4px">${sub}</div>` : ''}
        </div>
      </div>`;
  }

  function pageHeader(title, subtitle) {
    return `<div style="margin-bottom:24px">
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

  return { skeleton, statCard, pageHeader, pill, table, msg };
})();