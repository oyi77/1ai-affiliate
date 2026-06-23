/** Table-based listing pages (shared pattern for Affiliates, Earnings, Commissions, Payments) */
window.PageRenderers = window.PageRenderers || {};

PageRenderers.affiliates = makeTablePage('/api/admin/affiliates?limit=100', 'Affiliates', 'Manage your affiliates', d => [
  d.username||d.user_email, `<code>${d.affiliate_code}</code>`, DOM.pill({Starter:'indigo',Pro:'green',Premium:'yellow'}[d.tier]||'Starter','blue'), d.joined_at ? new Date(d.joined_at).toLocaleDateString() : '-'
], ['Name','Code','Tier','Joined']);

PageRenderers.earnings = async function(el) {
  try {
    const d = await API.get('/api/admin/earnings?limit=100');
    const items = d.data || [];
    const total = items.reduce((s,e) => s+parseFloat(e.payout_amount||0), 0);
    const pending = items.filter(e => e.status==='pending').reduce((s,e) => s+parseFloat(e.payout_amount||0), 0);
    el.innerHTML = `
      ${DOM.pageHeader('Earnings', 'Commission earnings and payouts')}
      <div class="stat-grid">
        ${DOM.statCard({ label:'Total', value: AppConfig.formatCurrency(total) })}
        ${DOM.statCard({ label:'Pending', value: AppConfig.formatCurrency(pending), accent:'yellow' })}
        ${DOM.statCard({ label:'Approved', value: AppConfig.formatCurrency(total-pending), accent:'green' })}
      </div>
      <div class="card">
        ${DOM.table(
          ['Affiliate','Payout','Status','Date','Action'],
          items.map(e => [
            e.user_email||e.affiliate_id,
            AppConfig.formatCurrency(e.payout_amount||0),
            DOM.pill(e.status, {pending:'yellow',approved:'green',paid:'blue'}[e.status]||'blue'),
            new Date(e.created_at).toLocaleDateString(),
            e.status==='pending' ? `<button class="btn btn-sm btn-success" onclick="Approve.approveEarning(${e.id})">Approve</button>` : '-'
          ])
        )}
      </div>`;
  } catch(e) { el.innerHTML = '<div class="card"><p>Unable to load earnings.</p></div>'; }
};

PageRenderers.commissions = makeTablePage('/api/admin/commissions?limit=50', 'Commissions', 'Commission tracking', d => [
  d.affiliate_id||'-', d.source||'-', AppConfig.formatCurrency(d.amount||0), new Date(d.created_at).toLocaleDateString()
], ['Affiliate','Source','Amount','Date']);

PageRenderers.payments = makeTablePage('/api/admin/payments?limit=50', 'Payments', 'Payment history', d => [
  d.reference||d.id, '#'+d.user_id, AppConfig.formatCurrency(d.amount||0), DOM.pill(d.status,{pending:'yellow',paid:'green',failed:'red'}[d.status]||'blue'), d.paid_at?new Date(d.paid_at).toLocaleDateString():'-'
], ['Reference','User','Amount','Status','Paid']);

PageRenderers.campaigns = makeTablePage('/api/admin/campaigns?limit=50', 'Campaigns', 'Active campaigns', d => [
  d.name, DOM.pill(d.active?'Active':'Paused', d.active?'green':'yellow'), AppConfig.formatCurrency(d.payout_amount||0), d.clicks||0, d.conversions||0
], ['Name','Status','Payout','Clicks','Conversions']);

PageRenderers.offers = async function(el) {
  try {
    const role = Auth.role();
    const r = await API.get('/api/admin/offers?limit=50');
    const items = r.data || [];
    
    let headers = ['Offer', 'Payout', 'Status', 'Clicks', 'Conv'];
    if (role === 'admin') {
      headers = ['Offer', 'Network', 'Net Payout', 'Aff Payout', 'Margin', 'Status', 'Clicks', 'Conv'];
    }

    const mapFn = d => {
      if (role === 'admin') {
        const margin = (d.network_payout || 0) - (d.payout_amount || 0);
        return [
          d.name,
          d.network_name || '-',
          AppConfig.formatCurrency(d.network_payout||0),
          AppConfig.formatCurrency(d.payout_amount||0),
          '<span style="color:var(--green)">Rp '+margin.toLocaleString()+'</span>',
          DOM.pill(d.active?'Active':'Paused', d.active?'green':'yellow'),
          d.clicks||0,
          d.conversions||0
        ];
      }
      return [
        d.name,
        AppConfig.formatCurrency(d.payout_amount||0),
        DOM.pill(d.active?'Active':'Paused', d.active?'green':'yellow'),
        d.clicks||0,
        d.conversions||0
      ];
    };

    el.innerHTML = `${DOM.pageHeader('Offers', 'Offer management')}
      <div class="card">
        ${(role === 'admin' || role === 'advertiser') ? '<button class="btn btn-primary btn-sm" style="margin-bottom:16px" disabled title="Coming soon">+ Add Offer</button>' : ''}
        ${items.length ? DOM.table(headers, items.map(mapFn)) : DOM.emptyState('No data', 'No offers found.')}
      </div>`;
  } catch(e) { el.innerHTML = '<div class="card"><p>Unable to load offers.</p></div>'; }
};

PageRenderers.networks = async function(el) {
  try {
    const r = await API.get('/api/admin/networks');
    const items = r.data || [];
    el.innerHTML = `${DOM.pageHeader('Ad Networks', 'Manage external CPA networks')}
      <div class="card">
        <button class="btn btn-primary btn-sm" style="margin-bottom:16px" disabled title="Coming soon">+ Add Network</button>
        ${items.length ? DOM.table(['ID', 'Name', 'Status', 'Added'], items.map(d => [
          d.id, d.name, DOM.pill(d.status, d.status==='active'?'green':'yellow'), new Date(d.created_at * 1000).toLocaleDateString()
        ])) : DOM.emptyState('No networks', 'You have not added any CPA networks yet.')}
      </div>`;
  } catch(e) { el.innerHTML = '<div class="card"><p>Unable to load networks.</p></div>'; }
};

PageRenderers.users = makeTablePage('/api/admin/users?limit=50', 'Users', 'Registered users', d => [
  d.user_name||'-', d.user_email, DOM.pill(d.user_role===2||d.user_role==='admin'?'Admin':'User', d.user_role===2||d.user_role==='admin'?'indigo':'blue'), d.user_date_added?new Date(d.user_date_added).toLocaleDateString():'-'
], ['Name','Email','Role','Added']);

function makeTablePage(url, title, subtitle, mapFn, headers) {
  const slug = title.toLowerCase();
  return async function(el) {
    try {
      const r = await API.get(url);
      const items = r.data || [];
      el.innerHTML = `${DOM.pageHeader(title, subtitle)}
        <div class="card">${items.length ? DOM.table(headers, items.map(mapFn)) : DOM.emptyState('No data', `No ${slug} found. Data will appear here as it is collected.`)}</div>`;
    } catch(e) {
      if (e.status === 403) {
        el.innerHTML = `<div class="card"><p style="color:var(--red)">🔒 Access denied. You don't have permission to view ${slug}.</p></div>`;
      } else {
        el.innerHTML = `<div class="card"><p>Unable to load ${slug}.</p></div>`;
      }
    }
  };
}