/**
 * Overview (Dashboard) Page
 * Depends on: API, UI, Fmt, Router
 */
Router.register('overview', async (target) => {
  const stats = await API.get('/api/admin/stats').catch(() => ({}));
  target.innerHTML = `
    ${UI.pageHeader('Overview', `${new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}`)}
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      ${UI.statCard({ label: 'Affiliates', value: Fmt.num(stats.affiliates || 0), accent: 'indigo' })}
      ${UI.statCard({ label: 'Clicks Today', value: Fmt.num(stats.clicks_today || 0), accent: 'green' })}
      ${UI.statCard({ label: 'Conversions', value: Fmt.num(stats.conversions || 0), accent: 'yellow' })}
      ${UI.statCard({ label: 'Revenue', value: Fmt.money(stats.revenue || 0), accent: 'indigo' })}
    </div>
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
      ${UI.panel('Recent Affiliates', (stats.recent_affiliates || []).slice(0, 5).map(a => `
        <div class="flex items-center justify-between py-2 border-b border-[var(--border)]">
          <div>
            <div class="text-sm font-medium">${a.user_name || a.user_email}</div>
            <div class="text-xs muted">${a.affiliate_code || ''}</div>
          </div>
          <div class="text-sm font-medium">${Fmt.money(a.clicks || 0)} clicks</div>
        </div>
      `).join('') || '<div class="muted text-sm text-center py-4">No affiliates yet</div>')}
      ${UI.panel('Recent Conversions', (stats.recent_conversions || []).slice(0, 5).map(c => `
        <div class="flex items-center justify-between py-2 border-b border-[var(--border)]">
          <div>
            <div class="text-sm">${c.affiliate_code || '#' + c.id}</div>
            <div class="text-xs muted">${Fmt.date(c.created_at)}</div>
          </div>
          <div class="text-sm font-medium text-green-400">${Fmt.money(c.payout_amount)}</div>
        </div>
      `).join('') || '<div class="muted text-sm text-center py-4">No conversions yet</div>')}
    </div>
  `;
});