/**
 * Help Page — support resources & links
 * Depends on: UI, Router
 */
Router.register('help', async (target) => {
  const links = [
    { title: 'API Documentation', desc: 'Swagger UI — all REST endpoints', url: '/api-docs', target: '_blank', icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z M14 2v6h6"/></svg>' },
    { title: 'GeoIP Data', desc: 'Loyalsoldier/geoip — free weekly updates', url: 'https://github.com/Loyalsoldier/geoip', target: '_blank', icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/></svg>' },
    { title: 'Tutorials & Guides', desc: 'Attribution, integrations, and more', page: 'docs', icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/></svg>' },
    { title: 'System Status', desc: 'Cron jobs, GeoIP, DB status', page: 'admin', icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>' },
  ];

  target.innerHTML = `
    ${UI.pageHeader('Help & Support', 'Resources & links')}
    ${UI.panel('Quick Links', `
      <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
        ${links.map(l => {
          const inner = `<div class="font-medium text-sm flex items-center gap-2">${l.icon}${l.title}</div><div class="text-xs muted mt-1">${l.desc}</div>`;
          if (l.url) return `<a href="${l.url}" target="${l.target || '_self'}" class="panel-2 rounded-xl p-4 hover:border-indigo-500 transition-colors block">${inner}</a>`;
          return `<div class="panel-2 rounded-xl p-4 hover:border-indigo-500 transition-colors cursor-pointer" onclick="Router.navigateTo('${l.page}')">${inner}</div>`;
        }).join('')}
      </div>
    `)}
  `;
});