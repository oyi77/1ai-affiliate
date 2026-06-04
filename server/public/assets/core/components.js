/**
 * UI Components — reusable, pure render functions.
 * Each returns an HTML string. No side effects, no DOM access.
 * Single responsibility: turn data into HTML. Testable as pure functions.
 */
const UI = {
  pageHeader(title, subtitle = '') {
    return `
      <div class="mb-6">
        <h1 class="text-2xl lg:text-3xl font-bold">${title}</h1>
        ${subtitle ? `<p class="muted text-sm mt-1">${subtitle}</p>` : ''}
      </div>`;
  },

  skeleton(lines = 3) {
    return `<div class="space-y-3">${
      Array(lines).fill('<div class="skeleton h-24 rounded-xl"></div>').join('')
    }</div>`;
  },

  statCard({ label, value, sub = '', accent = 'indigo' }) {
    const accents = {
      indigo: 'from-indigo-500/20 to-cyan-500/10',
      green: 'from-emerald-500/20 to-teal-500/10',
      yellow: 'from-amber-500/20 to-orange-500/10',
      red: 'from-rose-500/20 to-pink-500/10',
    };
    return `
      <div class="stat-card panel rounded-2xl p-5 relative overflow-hidden">
        <div class="absolute inset-0 bg-gradient-to-br ${accents[accent] || accents.indigo} opacity-50"></div>
        <div class="relative">
          <div class="muted text-xs uppercase tracking-wider font-medium">${label}</div>
          <div class="num text-3xl font-bold mt-2">${value}</div>
          ${sub ? `<div class="muted text-xs mt-1">${sub}</div>` : ''}
        </div>
      </div>`;
  },

  pill(text, type = 'info') {
    return `<span class="pill p-${type}">${text}</span>`;
  },

  panel(title, body, classes = '') {
    return `
      <div class="panel rounded-2xl p-5 ${classes}">
        ${title ? `<h2 class="font-semibold mb-4">${title}</h2>` : ''}
        ${body}
      </div>`;
  },

  keyValueRow(label, value, monospace = false) {
    return `
      <div class="flex justify-between panel-2 rounded-lg px-3 py-2">
        <span class="muted">${label}</span>
        <span class="${monospace ? 'font-mono' : ''}">${value}</span>
      </div>`;
  },

  formField(label, id, type = 'text', opts = {}) {
    const { required = false, value = '', placeholder = '', extraClass = '' } = opts;
    const input = type === 'select'
      ? `<select id="${id}" class="w-full panel-2 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 ${extraClass}">${(opts.options || []).map(o => `<option value="${o}" ${value === o ? 'selected' : ''}>${o}</option>`).join('')}</select>`
      : `<input id="${id}" type="${type}" value="${value}" ${required ? 'required' : ''} class="w-full panel-2 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 ${extraClass}" />`;
    return `
      <div>
        <label class="text-xs muted uppercase tracking-wider block mb-1">${label}</label>
        ${input}
      </div>`;
  },

  card(inner, clickHandler = '') {
    return `<div class="panel-2 rounded-xl p-4 hover:border-indigo-500 transition-colors block${clickHandler ? ' cursor-pointer' : ''}"${clickHandler ? ` onclick="${clickHandler}"` : ''}>${inner}</div>`;
  },

  toast(message, type = 'success') {
    const colors = { success: 'text-green-400', error: 'text-red-400', info: 'text-indigo-400' };
    return `<span class="text-xs ml-2 ${colors[type] || colors.info}">${message}</span>`;
  },

  emptyState(icon, title, description) {
    return `
      <div class="panel rounded-2xl p-6 text-center">
        ${icon ? `<div class="text-5xl mb-3">${icon}</div>` : ''}
        <h2 class="text-xl font-bold mb-2">${title}</h2>
        <p class="muted text-sm max-w-lg mx-auto">${description}</p>
      </div>`;
  },
};