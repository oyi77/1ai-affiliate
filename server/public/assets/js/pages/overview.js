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

    el.innerHTML = `
      ${DOM.pageHeader('Overview', 'Platform dashboard')}
      <div class="stat-grid">
        ${DOM.statCard({ label:'Total Affiliates', value: stats.total_affiliates || 0 })}
        ${DOM.statCard({ label:'Active Clicks (24h)', value: stats.active_clicks_24h || 0, accent:'green' })}
        ${DOM.statCard({ label:'Pending Payout', value: 'Rp '+(stats.pending_payout||0).toLocaleString(), accent:'yellow' })}
        ${DOM.statCard({ label:'Revenue MTD', value: 'Rp '+(stats.revenue_mtd||0).toLocaleString(), accent:'green' })}
      </div>
      <div class="card"><h3>Top Affiliates</h3>
        ${DOM.table(
          ['Name','Code','Earnings'],
          (affs.data||[]).map(a => [a.username||a.user_email, `<code>${a.affiliate_code}</code>`, 'Rp '+(a.total_earnings||0).toLocaleString()])
        )}
      </div>
      <div class="card"><h3>Pending Approvals</h3>
        ${DOM.table(
          ['Affiliate','Amount','Date','Action'],
          (earns.data||[]).map(e => [
            e.user_email||e.affiliate_id,
            'Rp '+(e.payout_amount||0).toLocaleString(),
            new Date(e.created_at).toLocaleDateString(),
            e.status==='pending' ? `<button class="btn btn-sm btn-success" onclick="Approve.approveEarning(${e.id})">Approve</button>` : '-'
          ])
        )}
      </div>`;
  } catch(e) { el.innerHTML = '<div class="card"><p>Unable to load dashboard.</p></div>'; }
};