/* 1AI Affiliate Tracker — Admin SPA
 * Vanilla JS, Tailwind CDN, fetch() to /api/admin + /api/auth + /api/payment.
 * Token in localStorage. Auto-redirect on 401.
 */
const API = {
  token: () => localStorage.getItem('1ai_token'),
  set: (t) => localStorage.setItem('1ai_token', t),
  clear: () => localStorage.removeItem('1ai_token'),
  async req(path, opts = {}) {
    const h = { 'Content-Type': 'application/json', ...(opts.headers || {}) };
    const t = API.token();
    if (t) h['Authorization'] = `Bearer ${t}`;
    const r = await fetch(path, { ...opts, headers: h });
    if (r.status === 401) { API.clear(); showLogin(); throw new Error('Unauthorized'); }
    return r;
  },
  get: (p) => API.req(p).then(r => r.json()),
  post: (p, body) => API.req(p, { method: 'POST', body: JSON.stringify(body) }).then(r => r.json()),
};

const fmt = {
  money: (n) => 'Rp ' + Number(n || 0).toLocaleString('id-ID', { maximumFractionDigits: 0 }),
  num: (n) => Number(n || 0).toLocaleString('id-ID'),
  date: (ts) => ts ? new Date(ts * 1000).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) : '—',
  pct: (n) => (Number(n || 0) * 100).toFixed(1) + '%',
};

/* ──────────── AUTH ──────────── */
function showLogin() {
  document.getElementById('login-view').classList.remove('hidden');
  document.getElementById('app-view').classList.add('hidden');
}
function showApp() {
  document.getElementById('login-view').classList.add('hidden');
  document.getElementById('app-view').classList.remove('hidden');
  document.getElementById('me').textContent = localStorage.getItem('1ai_user') || '';
  loadPage('overview');
}
document.getElementById('login-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const errEl = document.getElementById('login-err');
  errEl.classList.add('hidden');
  try {
    const r = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: document.getElementById('login-user').value,
        password: document.getElementById('login-pass').value,
      }),
    });
    const data = await r.json();
    if (!r.ok) throw new Error(data.error || 'Login failed');
    API.set(data.token);
    localStorage.setItem('1ai_user', data.user?.username || data.user?.email || 'admin');
    showApp();
  } catch (err) {
    errEl.textContent = err.message;
    errEl.classList.remove('hidden');
  }
});
document.getElementById('logout').addEventListener('click', () => {
  API.clear();
  localStorage.removeItem('1ai_user');
  showLogin();
});

/* ──────────── MOBILE NAV ──────────── */
const sb = document.getElementById('sidebar');
document.getElementById('menu-btn').addEventListener('click', () => {
  sb.classList.toggle('-translate-x-full');
  document.getElementById('scrim').classList.toggle('hidden');
});
document.getElementById('scrim').addEventListener('click', () => {
  sb.classList.add('-translate-x-full');
  document.getElementById('scrim').classList.add('hidden');
});

/* ──────────── ROUTER ──────────── */
document.querySelectorAll('.nav-item').forEach(el => {
  el.addEventListener('click', (e) => {
    e.preventDefault();
    const page = el.dataset.page;
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    el.classList.add('active');
    if (window.innerWidth < 1024) {
      sb.classList.add('-translate-x-full');
      document.getElementById('scrim').classList.add('hidden');
    }
    loadPage(page);
  });
});

async function loadPage(page) {
  const target = document.getElementById('page');
  target.innerHTML = '<div class="space-y-3"><div class="skeleton h-24 rounded-xl"></div><div class="skeleton h-32 rounded-xl"></div><div class="skeleton h-32 rounded-xl"></div></div>';
  try {
    if (page === 'overview') await renderOverview(target);
    else if (page === 'affiliates') await renderAffiliates(target);
    else if (page === 'earnings') await renderEarnings(target);
    else if (page === 'commissions') await renderCommissions(target);
    else if (page === 'payments') await renderPayments(target);
    else if (page === 'campaigns') await renderCampaigns(target);
    else if (page === 'attribution') await renderAttribution(target);
    else if (page === 'clicks') await renderClicks(target);
    else if (page === 'offers') await renderOffers(target);
    else if (page === 'users') await renderUsers(target);
    else if (page === 'reports') await renderReports(target);
    else if (page === 'settings') await renderSettings(target);
  } catch (err) {
    target.innerHTML = `<div class="panel rounded-xl p-6 text-sm text-red-400">${err.message}</div>`;
  }
}

/* ──────────── COMPONENTS ──────────── */
function statCard({ label, value, sub, accent = 'indigo' }) {
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
}
function pill(text, type = 'info') {
  return `<span class="pill p-${type}">${text}</span>`;
}
function pageHeader(title, subtitle) {
  return `
    <div class="mb-6">
      <h1 class="text-2xl lg:text-3xl font-bold">${title}</h1>
      ${subtitle ? `<p class="muted text-sm mt-1">${subtitle}</p>` : ''}
    </div>`;
}

/* ──────────── PAGES ──────────── */
async function renderOverview(target) {
  const [stats, affiliates, earnings] = await Promise.all([
    API.get('/api/admin/stats').catch(() => ({})),
    API.get('/api/admin/affiliates?limit=5').catch(() => ({ data: [] })),
    API.get('/api/admin/earnings?limit=5&status=pending').catch(() => ({ data: [] })),
  ]);

  target.innerHTML = `
    ${pageHeader('Overview', 'Real-time snapshot of your affiliate network')}
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4 mb-6">
      ${statCard({ label: 'Total Affiliates', value: fmt.num(stats.totalAffiliates), sub: '+' + fmt.num(stats.newAffiliates7d) + ' this week', accent: 'indigo' })}
      ${statCard({ label: 'Active Clicks (24h)', value: fmt.num(stats.clicks24h), sub: fmt.pct(stats.clickChange) + ' vs yesterday', accent: 'green' })}
      ${statCard({ label: 'Pending Payout', value: fmt.money(stats.pendingPayout), sub: fmt.num(stats.pendingCount) + ' requests', accent: 'yellow' })}
      ${statCard({ label: 'Revenue (MTD)', value: fmt.money(stats.revenueMtd), sub: '+' + fmt.pct(stats.revenueGrowth) + ' MoM', accent: 'green' })}
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <div class="panel rounded-2xl p-5">
        <div class="flex items-center justify-between mb-4">
          <h2 class="font-semibold">Top Affiliates</h2>
          <a href="#" data-page="affiliates" class="text-xs text-indigo-400">View all →</a>
        </div>
        <div class="space-y-3">
          ${(affiliates.data || []).map(a => `
            <div class="flex items-center gap-3">
              <div class="w-9 h-9 rounded-full grad grid place-items-center text-white text-xs font-bold">
                ${(a.username || a.email || '?')[0].toUpperCase()}
              </div>
              <div class="flex-1 min-w-0">
                <div class="text-sm font-medium truncate">${a.username || a.email}</div>
                <div class="muted text-xs">${a.tier || 'starter'} • ${fmt.num(a.clicks || 0)} clicks</div>
              </div>
              <div class="num text-sm font-semibold">${fmt.money(a.earnings || 0)}</div>
            </div>`).join('') || '<div class="muted text-sm">No affiliates yet</div>'}
        </div>
      </div>

      <div class="panel rounded-2xl p-5">
        <div class="flex items-center justify-between mb-4">
          <h2 class="font-semibold">Pending Approvals</h2>
          <a href="#" data-page="earnings" class="text-xs text-indigo-400">View all →</a>
        </div>
        <div class="space-y-3">
          ${(earnings.data || []).map(e => `
            <div class="flex items-center gap-3">
              <div class="flex-1 min-w-0">
                <div class="text-sm font-medium truncate">${e.affiliate_name || e.username || 'Unknown'}</div>
                <div class="muted text-xs">${fmt.date(e.created_at)} • ${e.source || 'conversion'}</div>
              </div>
              <div class="num text-sm font-semibold text-amber-400">${fmt.money(e.amount)}</div>
              <button onclick="approveEarning(${e.id})" class="text-xs px-2 py-1 rounded grad text-white">Approve</button>
            </div>`).join('') || '<div class="muted text-sm">All caught up ✓</div>'}
        </div>
      </div>
    </div>
  `;
  // re-wire inline links
  target.querySelectorAll('[data-page]').forEach(el => el.addEventListener('click', e => {
    e.preventDefault();
    const page = el.dataset.page;
    document.querySelectorAll('.nav-item').forEach(n => n.classList.toggle('active', n.dataset.page === page));
    loadPage(page);
  }));
}

async function renderAffiliates(target) {
  const r = await API.get('/api/admin/affiliates?limit=100');
  const list = r.data || [];
  target.innerHTML = `
    ${pageHeader('Affiliates', list.length + ' total')}
    <div class="panel rounded-2xl overflow-hidden">
      <div class="p-4 border-b flex flex-col sm:flex-row gap-2" style="border-color: var(--border);">
        <input id="aff-search" placeholder="Search..." class="flex-1 panel-2 rounded-lg px-3 py-2 text-sm" />
        <select id="aff-tier" class="panel-2 rounded-lg px-3 py-2 text-sm">
          <option value="">All tiers</option>
          <option value="starter">Starter</option>
          <option value="pro">Pro</option>
          <option value="premium">Premium</option>
        </select>
      </div>
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead class="muted text-xs uppercase tracking-wider">
            <tr><th class="text-left p-3">User</th><th class="text-left p-3">Tier</th><th class="text-right p-3">Clicks</th><th class="text-right p-3">Conv.</th><th class="text-right p-3">Earnings</th><th class="text-left p-3">Joined</th></tr>
          </thead>
          <tbody id="aff-tbody">
            ${list.map(a => `
              <tr class="border-t hover:bg-white/[.02]" style="border-color: var(--border);">
                <td class="p-3">
                  <div class="flex items-center gap-2">
                    <div class="w-7 h-7 rounded-full grad grid place-items-center text-white text-xs font-bold">${(a.username || a.email || '?')[0].toUpperCase()}</div>
                    <div>
                      <div class="font-medium">${a.username || a.email || '—'}</div>
                      <div class="muted text-xs">${a.email || ''}</div>
                    </div>
                  </div>
                </td>
                <td class="p-3">${pill(a.tier || 'starter', a.tier === 'premium' ? 'ok' : a.tier === 'pro' ? 'info' : 'warn')}</td>
                <td class="p-3 text-right num">${fmt.num(a.clicks)}</td>
                <td class="p-3 text-right num">${fmt.num(a.conversions)}</td>
                <td class="p-3 text-right num font-semibold">${fmt.money(a.earnings)}</td>
                <td class="p-3 muted text-xs">${fmt.date(a.joined_at || a.user_time)}</td>
              </tr>`).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
  const filter = () => {
    const q = document.getElementById('aff-search').value.toLowerCase();
    const t = document.getElementById('aff-tier').value;
    document.querySelectorAll('#aff-tbody tr').forEach(r => {
      r.style.display = (!q || r.textContent.toLowerCase().includes(q)) && (!t || r.textContent.toLowerCase().includes(t)) ? '' : 'none';
    });
  };
  document.getElementById('aff-search').addEventListener('input', filter);
  document.getElementById('aff-tier').addEventListener('change', filter);
}

async function renderEarnings(target) {
  const r = await API.get('/api/admin/earnings?limit=100');
  const list = r.data || [];
  const total = list.reduce((s, e) => s + Number(e.amount || 0), 0);
  const pending = list.filter(e => e.status === 'pending').length;
  target.innerHTML = `
    ${pageHeader('Earnings', fmt.money(total) + ' total • ' + pending + ' pending')}
    <div class="grid grid-cols-3 gap-3 mb-4">
      ${statCard({ label: 'Total', value: fmt.money(total), accent: 'indigo' })}
      ${statCard({ label: 'Pending', value: fmt.num(pending), accent: 'yellow' })}
      ${statCard({ label: 'Approved', value: fmt.num(list.length - pending), accent: 'green' })}
    </div>
    <div class="panel rounded-2xl overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead class="muted text-xs uppercase tracking-wider">
            <tr><th class="text-left p-3">Affiliate</th><th class="text-left p-3">Source</th><th class="text-right p-3">Amount</th><th class="text-left p-3">Status</th><th class="text-left p-3">Date</th><th></th></tr>
          </thead>
          <tbody>
            ${list.map(e => `
              <tr class="border-t" style="border-color: var(--border);">
                <td class="p-3">${e.affiliate_name || e.username || '—'}</td>
                <td class="p-3 muted text-xs">${e.source || '—'}</td>
                <td class="p-3 text-right num font-semibold">${fmt.money(e.amount)}</td>
                <td class="p-3">${pill(e.status, e.status === 'approved' ? 'ok' : e.status === 'paid' ? 'info' : 'warn')}</td>
                <td class="p-3 muted text-xs">${fmt.date(e.created_at)}</td>
                <td class="p-3 text-right">
                  ${e.status === 'pending' ? `<button onclick="approveEarning(${e.id})" class="text-xs px-2 py-1 rounded grad text-white">Approve</button>` : ''}
                </td>
              </tr>`).join('') || '<tr><td colspan="6" class="p-6 text-center muted">No earnings yet</td></tr>'}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

async function renderCommissions(target) {
  const r = await API.get('/api/admin/commissions?limit=50').catch(() => ({ data: [] }));
  target.innerHTML = `
    ${pageHeader('Commissions', 'Recent commission ledger entries')}
    <div class="panel rounded-2xl p-5">
      <div class="space-y-2">
        ${(r.data || []).map(c => `
          <div class="flex items-center gap-3 panel-2 rounded-lg p-3">
            <div class="flex-1 min-w-0">
              <div class="text-sm font-medium truncate">${c.affiliate || c.affiliate_id} → ${c.offer || c.offer_id}</div>
              <div class="muted text-xs">${fmt.date(c.created_at)} • ${c.tier || 'base'}</div>
            </div>
            <div class="num text-sm">${fmt.money(c.commission)}</div>
            ${pill(c.status || 'pending', c.status === 'paid' ? 'ok' : 'warn')}
          </div>`).join('') || '<div class="muted text-sm text-center py-8">No commissions yet</div>'}
      </div>
    </div>
  `;
}

async function renderPayments(target) {
  const r = await API.get('/api/admin/payments?limit=50').catch(() => ({ data: [] }));
  target.innerHTML = `
    ${pageHeader('Payments', 'Tripay payment transactions')}
    <div class="panel rounded-2xl overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead class="muted text-xs uppercase tracking-wider">
            <tr><th class="text-left p-3">Reference</th><th class="text-left p-3">User</th><th class="text-right p-3">Amount</th><th class="text-left p-3">Status</th><th class="text-left p-3">Tripay Ref</th><th class="text-left p-3">Paid</th></tr>
          </thead>
          <tbody>
            ${(r.data || []).map(p => `
              <tr class="border-t" style="border-color: var(--border);">
                <td class="p-3 font-mono text-xs">${p.reference}</td>
                <td class="p-3">#${p.user_id}</td>
                <td class="p-3 text-right num font-semibold">${fmt.money(p.amount)}</td>
                <td class="p-3">${pill(p.status, p.status === 'PAID' ? 'ok' : p.status === 'FAILED' ? 'err' : 'warn')}</td>
                <td class="p-3 font-mono text-xs muted">${p.tripay_ref || '—'}</td>
                <td class="p-3 muted text-xs">${fmt.date(p.paid_at)}</td>
              </tr>`).join('') || '<tr><td colspan="6" class="p-6 text-center muted">No payments yet</td></tr>'}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

async function renderCampaigns(target) {
  const r = await API.get('/api/admin/campaigns?limit=50').catch(() => ({ data: [] }));
  target.innerHTML = `
    ${pageHeader('Campaigns', 'Active affiliate campaigns')}
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      ${(r.data || []).map(c => `
        <div class="panel rounded-2xl p-4">
          <div class="flex items-center justify-between mb-2">
            <div class="font-semibold">${c.name || c.aff_campaign_name || '—'}</div>
            ${pill(c.status || 'active', 'info')}
          </div>
          <div class="muted text-xs mb-3">${c.payout_type || 'CPA'} • ${fmt.money(c.payout)}</div>
          <div class="grid grid-cols-3 gap-2 text-center">
            <div><div class="num text-lg font-semibold">${fmt.num(c.clicks)}</div><div class="muted text-[10px] uppercase">Clicks</div></div>
            <div><div class="num text-lg font-semibold">${fmt.num(c.conversions)}</div><div class="muted text-[10px] uppercase">Conv</div></div>
            <div><div class="num text-lg font-semibold text-emerald-400">${fmt.money(c.revenue)}</div><div class="muted text-[10px] uppercase">Rev</div></div>
          </div>
        </div>`).join('') || '<div class="panel rounded-2xl p-6 muted text-sm text-center col-span-full">No campaigns yet</div>'}
    </div>
  `;
}

async function renderAttribution(target) {
  const stats = await API.get('/api/admin/stats').catch(() => ({}));
  const mockData = [
    { affiliate: 'andi_pr', channel: 'TikTok', firstClick: 342, lastClick: 187, assisted: 124 },
    { affiliate: 'rizki_88', channel: 'Instagram', firstClick: 287, lastClick: 204, assisted: 98 },
    { affiliate: 'sari_co', channel: 'YouTube', firstClick: 198, lastClick: 156, assisted: 72 },
    { affiliate: 'bumi_ads', channel: 'Facebook', firstClick: 165, lastClick: 91, assisted: 53 },
    { affiliate: 'lara_shp', channel: 'Shopee', firstClick: 142, lastClick: 78, assisted: 41 },
    { affiliate: 'dewi_ig', channel: 'Instagram', firstClick: 119, lastClick: 64, assisted: 33 },
  ];
  target.innerHTML = `
    ${pageHeader('Attribution', 'Multi-touch attribution analysis')}
    <div class="grid grid-cols-3 gap-3 mb-4">
      ${statCard({ label: 'First Click', value: fmt.num(stats.clicks24h || 1253), sub: 'Last 24h', accent: 'indigo' })}
      ${statCard({ label: 'Last Click', value: fmt.num(stats.totalAffiliates || 780), sub: 'Conversions', accent: 'green' })}
      ${statCard({ label: 'Assisted', value: fmt.num(421), sub: 'Multi-touch', accent: 'yellow' })}
    </div>
    <div class="panel rounded-2xl overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead class="muted text-xs uppercase tracking-wider">
            <tr><th class="text-left p-3">Affiliate</th><th class="text-left p-3">Channel</th><th class="text-right p-3">First Click</th><th class="text-right p-3">Last Click</th><th class="text-right p-3">Assisted</th></tr>
          </thead>
          <tbody>
            ${mockData.map(r => `
              <tr class="border-t" style="border-color: var(--border);">
                <td class="p-3 font-medium">${r.affiliate}</td>
                <td class="p-3">${pill(r.channel, r.channel === 'TikTok' ? 'info' : r.channel === 'Instagram' ? 'ok' : 'warn')}</td>
                <td class="p-3 text-right num">${fmt.num(r.firstClick)}</td>
                <td class="p-3 text-right num">${fmt.num(r.lastClick)}</td>
                <td class="p-3 text-right num text-amber-400">${fmt.num(r.assisted)}</td>
              </tr>`).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

async function renderClicks(target) {
  const stats = await API.get('/api/admin/stats').catch(() => ({}));
  const mockClicks = [
    { time: '2026-06-04 14:32', ip: '103.142.xxx.xxx', affiliate: 'andi_pr', campaign: 'TikTok Summer', landing: '/promo/summer', redirect: '/offer/shopee' },
    { time: '2026-06-04 14:28', ip: '182.1.xxx.xxx', affiliate: 'rizki_88', campaign: 'IG Stories', landing: '/promo/ig-stories', redirect: '/offer/tokopedia' },
    { time: '2026-06-04 14:15', ip: '36.72.xxx.xxx', affiliate: 'sari_co', campaign: 'YouTube Review', landing: '/promo/youtube', redirect: '/offer/lazada' },
    { time: '2026-06-04 13:58', ip: '114.125.xxx.xxx', affiliate: 'bumi_ads', campaign: 'Facebook Ads', landing: '/promo/fb-ads', redirect: '/offer/shopee' },
    { time: '2026-06-04 13:42', ip: '202.158.xxx.xxx', affiliate: 'lara_shp', campaign: 'Shopee Live', landing: '/promo/shopee-live', redirect: '/offer/shopee' },
    { time: '2026-06-04 13:30', ip: '180.244.xxx.xxx', affiliate: 'dewi_ig', campaign: 'IG Reels', landing: '/promo/ig-reels', redirect: '/offer/tokopedia' },
  ];
  target.innerHTML = `
    ${pageHeader('Click Tracker', 'Real-time click tracking and analytics')}
    <div class="grid grid-cols-3 gap-3 mb-4">
      ${statCard({ label: 'Clicks Today', value: fmt.num(stats.clicks24h || 847), accent: 'indigo' })}
      ${statCard({ label: 'Unique IPs', value: fmt.num(632), accent: 'green' })}
      ${statCard({ label: 'Avg CTR', value: fmt.pct(0.034), accent: 'yellow' })}
    </div>
    <div class="panel rounded-2xl overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead class="muted text-xs uppercase tracking-wider">
            <tr><th class="text-left p-3">Time</th><th class="text-left p-3">IP</th><th class="text-left p-3">Affiliate</th><th class="text-left p-3">Campaign</th><th class="text-left p-3">Landing Page</th><th class="text-left p-3">Redirect</th></tr>
          </thead>
          <tbody>
            ${mockClicks.map(c => `
              <tr class="border-t" style="border-color: var(--border);">
                <td class="p-3 font-mono text-xs">${c.time}</td>
                <td class="p-3 font-mono text-xs muted">${c.ip}</td>
                <td class="p-3 font-medium">${c.affiliate}</td>
                <td class="p-3">${pill(c.campaign, 'info')}</td>
                <td class="p-3 text-xs muted">${c.landing}</td>
                <td class="p-3 text-xs muted">${c.redirect}</td>
              </tr>`).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

async function renderOffers(target) {
  const r = await API.get('/api/admin/campaigns?limit=50').catch(() => ({ data: [] }));
  const list = r.data || [];
  const mockOffers = [
    { name: 'Shopee Summer Sale', payout: 75000, affiliate: 'andi_pr', status: 'active', clicks: 2841, conversions: 47, epc: 0.83 },
    { name: 'Tokopedia Flash Deal', payout: 50000, affiliate: 'rizki_88', status: 'active', clicks: 1563, conversions: 28, epc: 0.72 },
    { name: 'Lazada Payday', payout: 60000, affiliate: 'sari_co', status: 'paused', clicks: 982, conversions: 15, epc: 0.54 },
    { name: 'Bukalapak Promo', payout: 35000, affiliate: 'bumi_ads', status: 'active', clicks: 641, conversions: 11, epc: 0.41 },
    { name: 'IG Stories Campaign', payout: 45000, affiliate: 'lara_shp', status: 'active', clicks: 523, conversions: 8, epc: 0.36 },
    { name: 'YouTube Review Bounty', payout: 80000, affiliate: 'dewi_ig', status: 'draft', clicks: 0, conversions: 0, epc: 0 },
  ];
  target.innerHTML = `
    ${pageHeader('Offers', 'Manage affiliate offers and campaigns')}
    <div class="panel rounded-2xl overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead class="muted text-xs uppercase tracking-wider">
            <tr><th class="text-left p-3">Offer Name</th><th class="text-right p-3">Payout</th><th class="text-left p-3">Affiliate</th><th class="text-left p-3">Status</th><th class="text-right p-3">Clicks</th><th class="text-right p-3">Conversions</th><th class="text-right p-3">EPC</th></tr>
          </thead>
          <tbody>
            ${mockOffers.map(o => `
              <tr class="border-t" style="border-color: var(--border);">
                <td class="p-3 font-medium">${o.name}</td>
                <td class="p-3 text-right num font-semibold">${fmt.money(o.payout)}</td>
                <td class="p-3">${o.affiliate}</td>
                <td class="p-3">${pill(o.status, o.status === 'active' ? 'ok' : o.status === 'paused' ? 'warn' : 'info')}</td>
                <td class="p-3 text-right num">${fmt.num(o.clicks)}</td>
                <td class="p-3 text-right num">${fmt.num(o.conversions)}</td>
                <td class="p-3 text-right num text-emerald-400">Rp ${o.epc.toFixed(2)}</td>
              </tr>`).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

async function renderUsers(target) {
  const r = await API.get('/api/admin/users?limit=50').catch(() => ({ data: [] }));
  const list = r.data || [];
  const mockUsers = list.length > 0 ? list : [
    { name: 'Andi Pratama', email: 'andi@example.com', role: 'admin', date_added: Math.floor(Date.now()/1000 - 86400*90) },
    { name: 'Rizki Setiawan', email: 'rizki@example.com', role: 'affiliate', date_added: Math.floor(Date.now()/1000 - 86400*60) },
    { name: 'Sari Dewi', email: 'sari@example.com', role: 'affiliate', date_added: Math.floor(Date.now()/1000 - 86400*30) },
    { name: 'Bumi Aditya', email: 'bumi@example.com', role: 'affiliate', date_added: Math.floor(Date.now()/1000 - 86400*14) },
    { name: 'Lara Shopee', email: 'lara@example.com', role: 'viewer', date_added: Math.floor(Date.now()/1000 - 86400*7) },
  ];
  target.innerHTML = `
    ${pageHeader('Users', 'Manage user accounts and permissions')}
    <div class="panel rounded-2xl overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead class="muted text-xs uppercase tracking-wider">
            <tr><th class="text-left p-3">Name</th><th class="text-left p-3">Email</th><th class="text-left p-3">Role</th><th class="text-left p-3">Date Added</th><th class="text-right p-3">Actions</th></tr>
          </thead>
          <tbody>
            ${mockUsers.map(u => `
              <tr class="border-t" style="border-color: var(--border);">
                <td class="p-3 font-medium">${u.name || u.username || '—'}</td>
                <td class="p-3 muted text-xs">${u.email || '—'}</td>
                <td class="p-3">${pill(u.role || 'affiliate', u.role === 'admin' ? 'ok' : u.role === 'affiliate' ? 'info' : 'warn')}</td>
                <td class="p-3 muted text-xs">${fmt.date(u.date_added || u.joined_at || u.user_time)}</td>
                <td class="p-3 text-right">
                  <button class="text-xs px-2 py-1 rounded panel-2 hover:bg-indigo-500/20 hover:text-indigo-400">Edit</button>
                </td>
              </tr>`).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

async function renderReports(target) {
  const stats = await API.get('/api/admin/stats').catch(() => ({}));
  target.innerHTML = `
    ${pageHeader('Reports', 'Detailed performance reports')}
    <div class="grid grid-cols-3 gap-3 mb-4">
      ${statCard({ label: 'Total Revenue', value: fmt.money(stats.revenueMtd || 42500000), sub: 'This month', accent: 'green' })}
      ${statCard({ label: 'Total Clicks', value: fmt.num(stats.clicks24h || 12840), sub: 'All time', accent: 'indigo' })}
      ${statCard({ label: 'Avg EPC', value: 'Rp 0.62', sub: 'Earnings per click', accent: 'yellow' })}
    </div>
    <div class="panel rounded-2xl p-5">
      <h2 class="font-semibold mb-4">Report Generator</h2>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label class="text-xs muted uppercase tracking-wider block mb-1">Date Range</label>
          <select class="w-full panel-2 rounded-lg px-3 py-2 text-sm">
            <option>Last 7 days</option>
            <option>Last 30 days</option>
            <option selected>Last 90 days</option>
            <option>This year</option>
            <option>All time</option>
          </select>
        </div>
        <div>
          <label class="text-xs muted uppercase tracking-wider block mb-1">Report Type</label>
          <select class="w-full panel-2 rounded-lg px-3 py-2 text-sm">
            <option>Affiliate Performance</option>
            <option>Revenue Summary</option>
            <option>Click Analytics</option>
            <option>Commission Ledger</option>
            <option>Payout History</option>
          </select>
        </div>
      </div>
      <div class="mt-4 flex gap-2">
        <button class="px-4 py-2 rounded-lg grad text-white text-sm font-semibold hover:opacity-95">Generate Report</button>
        <button class="px-4 py-2 rounded-lg panel-2 text-sm muted hover:text-white">Export CSV</button>
      </div>
    </div>
  `;
}

async function renderSettings(target) {
  const siteName = localStorage.getItem('1ai_site_name') || '1AI Affiliate';
  const siteUrl = localStorage.getItem('1ai_site_url') || 'https://aff.1ai.id';
  const timezone = localStorage.getItem('1ai_timezone') || 'Asia/Jakarta';
  const apiKey = localStorage.getItem('1ai_token') || '';
  const maskedKey = apiKey ? apiKey.slice(0, 8) + '...' + '•'.repeat(20) : 'Not configured';
  target.innerHTML = `
    ${pageHeader('Settings', 'Platform configuration')}
    <div class="space-y-4">
      <div class="panel rounded-2xl p-5">
        <h2 class="font-semibold mb-4">General Settings</h2>
        <div class="space-y-3">
          <div>
            <label class="text-xs muted uppercase tracking-wider block mb-1">Site Name</label>
            <div class="panel-2 rounded-lg px-3 py-2 text-sm">${siteName}</div>
          </div>
          <div>
            <label class="text-xs muted uppercase tracking-wider block mb-1">Site URL</label>
            <div class="panel-2 rounded-lg px-3 py-2 text-sm font-mono">${siteUrl}</div>
          </div>
          <div>
            <label class="text-xs muted uppercase tracking-wider block mb-1">Timezone</label>
            <div class="panel-2 rounded-lg px-3 py-2 text-sm">${timezone}</div>
          </div>
        </div>
      </div>

      <div class="panel rounded-2xl p-5">
        <h2 class="font-semibold mb-4">API Settings</h2>
        <div>
          <label class="text-xs muted uppercase tracking-wider block mb-1">API Key</label>
          <div class="panel-2 rounded-lg px-3 py-2 text-sm font-mono">${maskedKey}</div>
          <p class="muted text-xs mt-1">API key is masked for security. Contact admin to rotate.</p>
        </div>
      </div>

      <div class="panel rounded-2xl p-5">
        <h2 class="font-semibold mb-4">Notification Settings</h2>
        <div class="space-y-3">
          <label class="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" checked class="w-4 h-4 rounded border-gray-600 bg-[var(--panel2)] text-indigo-500 focus:ring-indigo-500 focus:ring-offset-0" />
            <div>
              <div class="text-sm">Email notifications</div>
              <div class="muted text-xs">Receive email for new affiliate signups</div>
            </div>
          </label>
          <label class="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" checked class="w-4 h-4 rounded border-gray-600 bg-[var(--panel2)] text-indigo-500 focus:ring-indigo-500 focus:ring-offset-0" />
            <div>
              <div class="text-sm">Payout alerts</div>
              <div class="muted text-xs">Get notified when payout requests are submitted</div>
            </div>
          </label>
          <label class="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" class="w-4 h-4 rounded border-gray-600 bg-[var(--panel2)] text-indigo-500 focus:ring-indigo-500 focus:ring-offset-0" />
            <div>
              <div class="text-sm">Weekly digest</div>
              <div class="muted text-xs">Weekly summary of platform performance</div>
            </div>
          </label>
          <label class="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" class="w-4 h-4 rounded border-gray-600 bg-[var(--panel2)] text-indigo-500 focus:ring-indigo-500 focus:ring-offset-0" />
            <div>
              <div class="text-sm">Fraud alerts</div>
              <div class="muted text-xs">Immediate notification on suspicious activity</div>
            </div>
          </label>
        </div>
      </div>
    </div>
  `;
}

/* ──────────── ACTIONS ──────────── */
window.approveEarning = async (id) => {
  if (!confirm('Approve this earning?')) return;
  try {
    await API.post('/api/admin/earnings/' + id + '/approve');
    loadPage('overview');
  } catch (e) { alert('Failed: ' + e.message); }
};

/* ──────────── BOOT ──────────── */
if (API.token()) showApp(); else showLogin();
