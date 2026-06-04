/**
 * Module fallbacks — pages still in transition from monolithic app.js.
 * These are thin wrappers that delegate to the monolithic render functions.
 * Once fully migrated, delete this file and move each page to pages/.
 *
 * Depends on: Router, API, Fmt, UI, Auth (from core/)
 *           + monolithic functions from app.js (loaded separately)
 */
Router.register('affiliates', async (target) => {
  const d = await API.get('/api/admin/affiliates?limit=100');
  target.innerHTML = UI.pageHeader('Affiliates', 'All registered affiliates') + `
    <div class="panel-2 rounded-xl overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead><tr class="border-b border-[var(--border)] text-left"><th class="px-4 py-3 text-xs muted uppercase tracking-wider">Name</th><th class="px-4 py-3 text-xs muted uppercase tracking-wider">Code</th><th class="px-4 py-3 text-xs muted uppercase tracking-wider">Tier</th><th class="px-4 py-3 text-xs muted uppercase tracking-wider">Clicks</th><th class="px-4 py-3 text-xs muted uppercase tracking-wider">Conversions</th><th class="px-4 py-3 text-xs muted uppercase tracking-wider">Earnings</th><th class="px-4 py-3 text-xs muted uppercase tracking-wider">Joined</th></tr></thead>
          <tbody>${(d.data||[]).map(a => `<tr class="border-b border-[var(--border)]"><td class="px-4 py-3">${a.username||a.user_email}</td><td class="px-4 py-3"><code class="text-indigo-300">${a.affiliate_code}</code></td><td class="px-4 py-3">${UI.pill({1:'Starter',2:'Pro',3:'Premium'}[a.tier]||'Starter')}</td><td class="px-4 py-3">${Fmt.num(a.clicks)}</td><td class="px-4 py-3">${Fmt.num(a.conversions)}</td><td class="px-4 py-3">${Fmt.money(a.total_earnings)}</td><td class="px-4 py-3">${Fmt.date(a.joined_at)}</td></tr>`).join('')}</tbody>
        </table>
      </div>
    </div>`;
});

Router.register('earnings', async (target) => {
  const d = await API.get('/api/admin/earnings');
  target.innerHTML = UI.pageHeader('Earnings', 'Affiliate commissions & payouts') + `
    <div class="panel-2 rounded-xl overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead><tr class="border-b border-[var(--border)] text-left"><th class="px-4 py-3 text-xs muted uppercase tracking-wider">Affiliate</th><th class="px-4 py-3 text-xs muted uppercase tracking-wider">Amount</th><th class="px-4 py-3 text-xs muted uppercase tracking-wider">Status</th><th class="px-4 py-3 text-xs muted uppercase tracking-wider">Date</th><th class="px-4 py-3 text-xs muted uppercase tracking-wider">Action</th></tr></thead>
          <tbody>${(d.data||[]).map(e => `<tr class="border-b border-[var(--border)]"><td class="px-4 py-3">${e.user_email||e.affiliate_id}</td><td class="px-4 py-3 font-medium">${Fmt.money(e.payout_amount)}</td><td class="px-4 py-3">${UI.pill(e.status, e.status==='approved'?'green':e.status==='pending'?'yellow':'ok')}</td><td class="px-4 py-3">${Fmt.date(e.created_at)}</td><td class="px-4 py-3">${e.status==='pending' ? `<button class="px-3 py-1 rounded-lg text-xs font-semibold bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30" onclick="window.approveEarning(${e.id})">Approve</button>` : '—'}</td></tr>`).join('')}</tbody>
        </table>
      </div>
    </div>`;
});

Router.register('commissions', async (target) => {
  const d = await API.get('/api/admin/commissions');
  target.innerHTML = UI.pageHeader('Commissions', 'Commission structure & rates') + `
    <div class="panel-2 rounded-xl overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead><tr class="border-b border-[var(--border)] text-left"><th class="px-4 py-3 text-xs muted uppercase tracking-wider">Affiliate</th><th class="px-4 py-3 text-xs muted uppercase tracking-wider">Tier</th><th class="px-4 py-3 text-xs muted uppercase tracking-wider">Rate</th><th class="px-4 py-3 text-xs muted uppercase tracking-wider">Total Earned</th></tr></thead>
          <tbody>${(d.data||[]).map(c => `<tr class="border-b border-[var(--border)]"><td class="px-4 py-3">${c.user_email||c.affiliate_id}</td><td class="px-4 py-3">${UI.pill({1:'Starter',2:'Pro',3:'Premium'}[c.tier]||'Starter')}</td><td class="px-4 py-3 font-mono">${Fmt.pct(c.rate||0)}</td><td class="px-4 py-3 font-medium">${Fmt.money(c.total_earned)}</td></tr>`).join('')}</tbody>
        </table>
      </div>
    </div>`;
});

Router.register('payments', async (target) => {
  const d = await API.get('/api/admin/payments');
  target.innerHTML = UI.pageHeader('Payments', 'Payout requests & history') + `
    <div class="panel-2 rounded-xl overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead><tr class="border-b border-[var(--border)] text-left"><th class="px-4 py-3 text-xs muted uppercase tracking-wider">Affiliate</th><th class="px-4 py-3 text-xs muted uppercase tracking-wider">Amount</th><th class="px-4 py-3 text-xs muted uppercase tracking-wider">Status</th><th class="px-4 py-3 text-xs muted uppercase tracking-wider">Method</th><th class="px-4 py-3 text-xs muted uppercase tracking-wider">Date</th></tr></thead>
          <tbody>${(d.data||[]).map(p => `<tr class="border-b border-[var(--border)]"><td class="px-4 py-3">${p.user_email||p.affiliate_id}</td><td class="px-4 py-3 font-medium">${Fmt.money(p.amount)}</td><td class="px-4 py-3">${UI.pill(p.status, p.status==='paid'?'green':'yellow')}</td><td class="px-4 py-3">${p.method||'—'}</td><td class="px-4 py-3">${Fmt.date(p.requested_at)}</td></tr>`).join('')}</tbody>
        </table>
      </div>
    </div>`;
});

Router.register('campaigns', async (target) => {
  const d = await API.get('/api/admin/campaigns');
  target.innerHTML = UI.pageHeader('Campaigns', 'Active & inactive campaigns') + `
    <div class="panel-2 rounded-xl overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead><tr class="border-b border-[var(--border)] text-left"><th class="px-4 py-3 text-xs muted uppercase tracking-wider">Name</th><th class="px-4 py-3 text-xs muted uppercase tracking-wider">Status</th><th class="px-4 py-3 text-xs muted uppercase tracking-wider">Clicks</th><th class="px-4 py-3 text-xs muted uppercase tracking-wider">Conversions</th></tr></thead>
          <tbody>${(d.data||[]).map(c => `<tr class="border-b border-[var(--border)]"><td class="px-4 py-3 font-medium">${c.name||`Campaign #${c.id}`}</td><td class="px-4 py-3">${UI.pill(c.status||'active', c.status==='active'?'green':'yellow')}</td><td class="px-4 py-3">${Fmt.num(c.clicks)}</td><td class="px-4 py-3">${Fmt.num(c.conversions)}</td></tr>`).join('')}</tbody>
        </table>
      </div>
    </div>`;
});

Router.register('attribution', async (target) => {
  target.innerHTML = UI.pageHeader('Attribution', 'Multi-touch attribution analytics') + `
    ${UI.panel('Attribution Analysis', `<p class="muted text-sm">Attribution data visualizations will appear here. The original PHP page had export functionality. This is a simplified view.</p>`)}
  `;
});

Router.register('clicks', async (target) => {
  const d = await API.get('/api/admin/earnings?status=click');
  target.innerHTML = UI.pageHeader('Clicks', 'Click tracker & analytics') + `
    ${UI.panel('Recent Clicks', `
      <div class="panel-2 rounded-xl overflow-hidden"><div class="overflow-x-auto">
      <table class="w-full text-sm">
        <thead><tr class="border-b border-[var(--border)] text-left"><th class="px-4 py-3 text-xs muted uppercase tracking-wider">Affiliate</th><th class="px-4 py-3 text-xs muted uppercase tracking-wider">Offer</th><th class="px-4 py-3 text-xs muted uppercase tracking-wider">Country</th><th class="px-4 py-3 text-xs muted uppercase tracking-wider">ISP</th><th class="px-4 py-3 text-xs muted uppercase tracking-wider">Device</th><th class="px-4 py-3 text-xs muted uppercase tracking-wider">Date</th></tr></thead>
        <tbody>${(d.data||[]).slice(0,50).map(c => `<tr class="border-b border-[var(--border)]"><td class="px-4 py-3">${c.user_email||c.affiliate_id}</td><td class="px-4 py-3">—</td><td class="px-4 py-3">—</td><td class="px-4 py-3">—</td><td class="px-4 py-3">—</td><td class="px-4 py-3">${Fmt.date(c.created_at)}</td></tr>`).join('')}</tbody>
      </table></div></div>
    `)}
  `;
});

Router.register('offers', async (target) => {
  target.innerHTML = UI.pageHeader('Offers', 'Manage tracking offers') + `
    ${UI.panel('Offers', `<p class="muted text-sm">Offer management interface will appear here. Use the <a href="/api-docs" target="_blank" class="text-indigo-400 hover:text-indigo-300">API</a> to manage offers programmatically.</p>`)}
  `;
});

Router.register('users', async (target) => {
  const d = await API.get('/api/admin/users');
  target.innerHTML = UI.pageHeader('Users', 'Manage user accounts') + `
    <div class="panel-2 rounded-xl overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead><tr class="border-b border-[var(--border)] text-left"><th class="px-4 py-3 text-xs muted uppercase tracking-wider">Username</th><th class="px-4 py-3 text-xs muted uppercase tracking-wider">Email</th><th class="px-4 py-3 text-xs muted uppercase tracking-wider">Role</th><th class="px-4 py-3 text-xs muted uppercase tracking-wider">Joined</th></tr></thead>
          <tbody>${(d.data||[]).map(u => `<tr class="border-b border-[var(--border)]"><td class="px-4 py-3 font-medium">${u.user_name}</td><td class="px-4 py-3">${u.user_email}</td><td class="px-4 py-3">${UI.pill(u.user_role, u.user_role==='admin'?'indigo':'ok')}</td><td class="px-4 py-3">${Fmt.date(u.user_date_added)}</td></tr>`).join('')}</tbody>
        </table>
      </div>
    </div>`;
});

Router.register('reports', async (target) => {
  target.innerHTML = UI.pageHeader('Reports', 'Export & analytics') + `
    ${UI.panel('Reports', `
      <div class="space-y-2 text-sm">
        <p class="muted">Generate and export reports for your affiliate network.</p>
        <div class="flex gap-3 mt-4">
          <button class="px-4 py-2 panel-2 rounded-lg text-sm hover:bg-gray-700" onclick="window.exportCSV()">Export CSV</button>
          <button class="px-4 py-2 panel-2 rounded-lg text-sm hover:bg-gray-700" disabled>PDF (coming soon)</button>
        </div>
      </div>
    `)}
  `;
});

// Legacy action stubs
window.approveEarning = async (id) => {
  if (!confirm('Approve this earning?')) return;
  try { await API.post('/api/admin/earnings/' + id + '/approve'); Router.navigateTo('earnings'); }
  catch (e) { alert('Failed: ' + e.message); }
};
window.exportCSV = () => alert('CSV export coming soon.');