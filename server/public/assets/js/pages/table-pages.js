/** Table-based listing pages (shared pattern for Affiliates, Earnings, Commissions, Payments) */
window.PageRenderers = window.PageRenderers || {};

PageRenderers.affiliates = makeTablePage('/api/admin/affiliates?limit=100', 'Affiliates', 'Manage your affiliates', d => [
  [d.username||d.user_email, `<code>${d.affiliate_code}</code>`, DOM.pill({Starter:'indigo',Pro:'green',Premium:'yellow'}[d.tier]||'Starter','blue'), d.clicks||0, d.conversions||0, 'Rp '+(d.total_earnings||0).toLocaleString(), d.joined_at ? new Date(d.joined_at).toLocaleDateString() : '-'],
], ['Name','Code','Tier','Clicks','Conversions','Earnings','Joined']);

PageRenderers.earnings = async function(el) {
  try {
    const d = await API.get('/api/admin/earnings?limit=100');
    const items = d.data || [];
    const total = items.reduce((s,e) => s+(e.payout_amount||0), 0);
    const pending = items.filter(e => e.status==='pending').reduce((s,e) => s+(e.payout_amount||0), 0);
    el.innerHTML = `
      ${DOM.pageHeader('Earnings', 'Commission earnings and payouts')}
      <div class="stat-grid">
        ${DOM.statCard({ label:'Total', value: 'Rp '+total.toLocaleString() })}
        ${DOM.statCard({ label:'Pending', value: 'Rp '+pending.toLocaleString(), accent:'yellow' })}
        ${DOM.statCard({ label:'Approved', value: 'Rp '+(total-pending).toLocaleString(), accent:'green' })}
      </div>
      <div class="card">
        ${DOM.table(
          ['Affiliate','Payout','Status','Date','Action'],
          items.map(e => [
            e.user_email||e.affiliate_id,
            'Rp '+(e.payout_amount||0).toLocaleString(),
            DOM.pill(e.status, {pending:'yellow',approved:'green',paid:'blue'}[e.status]||'blue'),
            new Date(e.created_at).toLocaleDateString(),
            e.status==='pending' ? `<button class="btn btn-sm btn-success" onclick="Approve.approveEarning(${e.id})">Approve</button>` : '-'
          ])
        )}
      </div>`;
  } catch(e) { el.innerHTML = '<div class="card"><p>Unable to load earnings.</p></div>'; }
};

PageRenderers.commissions = makeTablePage('/api/admin/commissions?limit=50', 'Commissions', 'Commission tracking', d => [
  [d.affiliate_id||'-', d.source||'-', 'Rp '+(d.amount||0).toLocaleString(), new Date(d.created_at).toLocaleDateString()],
], ['Affiliate','Source','Amount','Date']);

PageRenderers.payments = makeTablePage('/api/admin/payments?limit=50', 'Payments', 'Payment history', d => [
  [d.reference||d.id, d.user_email||d.user_id, 'Rp '+(d.amount||0).toLocaleString(), DOM.pill(d.status,{pending:'yellow',paid:'green',failed:'red'}[d.status]||'blue'), d.paid_at?new Date(d.paid_at).toLocaleDateString():'-'],
], ['Reference','User','Amount','Status','Paid']);

PageRenderers.campaigns = makeTablePage('/api/admin/campaigns?limit=50', 'Campaigns', 'Active campaigns', d => [
  [d.name, DOM.pill(d.active?'Active':'Paused', d.active?'green':'yellow'), 'Rp '+(d.payout_amount||0).toLocaleString(), d.clicks||0, d.conversions||0],
], ['Name','Status','Payout','Clicks','Conversions']);

PageRenderers.offers = makeTablePage('/api/admin/campaigns?limit=50', 'Offers', 'Offer management', d => [
  [d.name, 'Rp '+(d.payout_amount||0).toLocaleString(), DOM.pill(d.active?'Active':'Paused', d.active?'green':'yellow'), d.clicks||0, d.conversions||0],
], ['Offer','Payout','Status','Clicks','Conversions']);

PageRenderers.users = makeTablePage('/api/admin/users?limit=50', 'Users', 'Registered users', d => [
  [d.user_name||'-', d.user_email, DOM.pill(d.user_role===2||d.user_role==='admin'?'Admin':'User', d.user_role===2||d.user_role==='admin'?'indigo':'blue'), d.user_date_added?new Date(d.user_date_added).toLocaleDateString():'-'],
], ['Name','Email','Role','Added']);

function makeTablePage(url, title, subtitle, mapFn, headers) {
  const slug = title.toLowerCase();
  return async function(el) {
    try {
      const r = await API.get(url);
      const items = r.data || [];
      el.innerHTML = `${DOM.pageHeader(title, subtitle)}
        <div class="card">${items.length ? DOM.table(headers, items.map(mapFn)) : DOM.emptyState('No data', `No ${slug} found. Data will appear here as it is collected.`)}</div>`;
    } catch(e) { el.innerHTML = `<div class="card"><p>Unable to load ${slug}.</p></div>`; }
  };
}