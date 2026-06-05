/**
 * Overview page — dashboard with stats, top affiliates, pending approvals.
 */
window.PageRenderers = window.PageRenderers || {};

PageRenderers.overview = async function(el) {
  try {
    const [stats, affs, earns] = await Promise.all([
      API.get('/api/admin/stats'),
      API.get('/api/admin/affiliates?limit=5'),
      API.get('/api/admin/earnings?limit=5&status=pending'),
    ]);

    const affData = affs.data || [];
    const earnData = earns.data || [];
    const clickTrend = stats.clickChange > 0 ? 'up' : stats.clickChange < 0 ? 'down' : 'flat';

    el.innerHTML = `
      ${DOM.pageHeader('Overview', 'Platform dashboard')}
      <div class="stat-grid">
        ${DOM.statCard({ label:'Total Affiliates', value: (stats.total_affiliates||0).toLocaleString(),
          sub: +(stats.new_affiliates_7d||0) > 0 ? `+${stats.new_affiliates_7d} this week` : '', accent:'indigo' })}
        ${DOM.statCard({ label:'Active Clicks (24h)', value: (stats.active_clicks_24h||0).toLocaleString(),
          sub: clickTrend !== 'flat' ? `${clickTrend === 'up' ? '+' : ''}${Math.round(stats.clickChange * 100)}% vs yesterday` : 'No change', accent:'green' })}
        ${DOM.statCard({ label:'Pending Payout', value: 'Rp '+(stats.pending_payout||0).toLocaleString(),
          sub: `${stats.pending_count||0} earnings pending`, accent:'yellow' })}
        ${DOM.statCard({ label:'Revenue MTD', value: 'Rp '+(stats.revenue_mtd||0).toLocaleString(),
          sub: stats.revenue_growth ? `${(stats.revenue_growth >= 0 ? '+' : '')}${Math.round(stats.revenue_growth * 100)}% vs last month` : '', accent:'green' })}
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px">
        <div class="card"><h3>Top Affiliates</h3>
          ${affData.length
            ? DOM.table(
              ['Name','Code','Earnings'],
              affData.map(a => [a.username||a.user_email, `<code>${a.affiliate_code}</code>`, 'Rp '+(a.total_earnings||0).toLocaleString()])
            )
            : DOM.emptyState('No affiliates yet', 'Affiliates will appear here once they register and start earning.')}
        </div>
        <div class="card"><h3>Pending Approvals</h3>
          ${earnData.length
            ? DOM.table(
              ['Affiliate','Amount','Date','Action'],
              earnData.map(e => [
                e.user_email||e.affiliate_id,
                'Rp '+(e.payout_amount||0).toLocaleString(),
                new Date(e.created_at).toLocaleDateString(),
                e.status==='pending' ? `<button class="btn btn-sm btn-success" onclick="Approve.approveEarning(${e.id})">Approve</button>` : '-'
              ])
            )
            : DOM.emptyState('Nothing pending', 'All earnings have been processed.')}
        </div>
      </div>`;
  } catch(e) { el.innerHTML = '<div class="card"><p>Unable to load dashboard.</p></div>'; }
};