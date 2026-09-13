/* Laporan + earnings renderers.
 * Split from pages/gapfill.js (800-line gate). Shares the global PageRenderers namespace.
 */
window.PageRenderers = window.PageRenderers || {};

PageRenderers['laporan-iklan'] = async function(el) {
  try {
    const [s, r] = await Promise.all([
      API.get('/api/admin/stats'),
      API.get('/api/admin/campaigns?limit=100')
    ]);
    const items = r.data || [];
    const totalKlik = items.reduce((n, d) => n + (d.clicks || 0), 0);
    const totalKonversi = items.reduce((n, d) => n + (d.conversions || 0), 0);
    const totalRevenue = items.reduce((n, d) => n + parseFloat(d.revenue || 0), 0);
    const totalPayout = items.reduce((n, d) => n + parseFloat(d.payout_amount || 0), 0);
    const roi = totalPayout > 0 ? ((totalRevenue - totalPayout) / totalPayout * 100).toFixed(1) : '0.0';
    el.innerHTML = `${DOM.pageHeader('Laporan Iklan', 'Laporan performa iklan per kampanye')}
      <div class="stat-grid">
        ${DOM.statCard({ label:'Total Klik', value: totalKlik.toLocaleString() })}
        ${DOM.statCard({ label:'Total Konversi', value: totalKonversi.toLocaleString(), accent:'green' })}
        ${DOM.statCard({ label:'Total Revenue', value: AppConfig.formatCurrency(totalRevenue) })}
        ${DOM.statCard({ label:'ROI', value: roi + '%', accent: parseFloat(roi) >= 0 ? 'green' : 'red' })}
      </div>
      <div class="card">
        ${items.length
          ? DOM.table(['Kampanye','Klik','Konversi','Revenue','Payout','ROI'], items.map(d => {
              const rv = parseFloat(d.revenue || 0);
              const po = parseFloat(d.payout_amount || 0);
              const r = po > 0 ? ((rv - po) / po * 100).toFixed(1) : '0.0';
              return [
                d.name || '-',
                d.clicks || 0,
                d.conversions || 0,
                AppConfig.formatCurrency(rv),
                AppConfig.formatCurrency(po),
                r + '%'
              ];
            }))
          : DOM.emptyState('No campaign data', 'No campaign performance data available yet.')}
      </div>`;
  } catch(e) { el.innerHTML = '<div class="card"><p>Unable to load laporan iklan.</p></div>'; }
};

/* ── 7. Analytic Harian ──────────────────────────────────────────── */

PageRenderers['analytic-harian'] = async function(el) {
  try {
    const [s, r] = await Promise.all([
      API.get('/api/admin/stats'),
      API.get('/api/admin/reports?range=30d&type=summary')
    ]);
    const days = r.data || [];
    const totalKlik = (s.total_clicks || 0);
    const totalKonversi = (s.attributed_conversions || 0);
    const totalRevenue = parseFloat(s.revenueMtd || 0);
    el.innerHTML = `${DOM.pageHeader('Analytic Harian', 'Statistik harian')}
      <div class="stat-grid">
        ${DOM.statCard({ label:'Total Klik', value: totalKlik.toLocaleString() })}
        ${DOM.statCard({ label:'Total Konversi', value: totalKonversi.toLocaleString(), accent:'green' })}
        ${DOM.statCard({ label:'Total Revenue', value: AppConfig.formatCurrency(totalRevenue) })}
      </div>
      <div class="card">
        ${days.length
          ? DOM.table(['Tanggal','Klik','Konversi','Revenue'], days.map(d => [
              d.date || d.tanggal || '-',
              d.clicks || d.klik || 0,
              d.conversions || d.konversi || 0,
              AppConfig.formatCurrency(d.revenue || 0)
            ]))
          : DOM.emptyState('No daily data', 'No daily statistics available yet. Data will appear here as tracking collects daily aggregates.')}
      </div>`;
  } catch(e) { el.innerHTML = '<div class="card"><p>Unable to load analytic harian.</p></div>'; }
};

/* ── 8. Laporan Taglink ──────────────────────────────────────────── */

PageRenderers['laporan-taglink'] = async function(el) {
  try {
    const r = await API.get('/api/admin/laporan-taglink?limit=100');
    const items = r.data || [];
    el.innerHTML = `${DOM.pageHeader('Laporan Taglink', 'Mapping taglink')}
      <div class="card">
        ${items.length
          ? DOM.table(['Tag','URL','Kampanye','Klik'], items.map(d => [
              d.tag || '-',
              d.url || '-',
              d.campaign_name || d.campaign_id || '-',
              d.clicks || 0
            ]))
          : DOM.emptyState('No taglinks', 'No taglink mappings found. Data will appear here once taglinks are configured.')}
      </div>`;
  } catch(e) { el.innerHTML = '<div class="card"><p>Unable to load laporan taglink.</p></div>'; }
};

/* ── 9. Laporan Order ────────────────────────────────────────────── */

PageRenderers['laporan-order'] = async function(el) {
  try {
    const r = await API.get('/api/admin/laporan-order?limit=100');
    const items = r.data || [];
    el.innerHTML = `${DOM.pageHeader('Laporan Order', 'Detail konversi dan order')}
      <div class="card">
        ${items.length
          ? DOM.table(['Order ID','Kampanye','Payout','Revenue','Status','Waktu'], items.map(d => [
              d.order_id || d.id || '-',
              d.campaign_name || d.campaign_id || '-',
              AppConfig.formatCurrency(d.payout || 0),
              AppConfig.formatCurrency(d.revenue || 0),
              DOM.pill(d.status || 'pending', {approved:'green',pending:'yellow',rejected:'red',paid:'blue'}[d.status] || 'blue'),
              d.created_at ? new Date(d.created_at).toLocaleString() : '-'
            ]))
          : DOM.emptyState('No orders', 'No order data found. Data will appear here as conversions are recorded.')}
      </div>`;
  } catch(e) { el.innerHTML = '<div class="card"><p>Unable to load laporan order.</p></div>'; }
};

/* ── 10. Saldo & Budget ──────────────────────────────────────────── */

PageRenderers['saldo-budget'] = async function(el) {
  try {
    const [s, r] = await Promise.all([
      API.get('/api/admin/stats'),
      API.get('/api/admin/payments?limit=100')
    ]);
    const balance = parseFloat(s.balance || 0);
    const spent = parseFloat(s.cost || 0);
    const budget = parseFloat(s.budget || 0);
    const items = r.data || [];
    el.innerHTML = `${DOM.pageHeader('Saldo & Budget', 'Kelola saldo dan budget')}
      <div class="stat-grid">
        ${DOM.statCard({ label:'Saldo', value: AppConfig.formatCurrency(balance), accent:'green' })}
        ${DOM.statCard({ label:'Terpakai', value: AppConfig.formatCurrency(spent), accent:'red' })}
        ${DOM.statCard({ label:'Budget', value: AppConfig.formatCurrency(budget), accent:'yellow' })}
        ${DOM.statCard({ label:'Sisa Budget', value: AppConfig.formatCurrency(Math.max)(0, budget - spent).toLocaleString() })}
      </div>
      <div class="card">
        <h3>Riwayat Transaksi</h3>
        ${items.length
          ? DOM.table(['Reference','User','Amount','Status','Date'], items.map(d => [
              d.reference || d.id || '-',
              '#'+d.user_id,
              AppConfig.formatCurrency(d.amount || 0),
              DOM.pill(d.status, {pending:'yellow',paid:'green',failed:'red'}[d.status] || 'blue'),
              d.paid_at ? new Date(d.paid_at).toLocaleDateString() : '-'
            ]))
          : DOM.emptyState('No transactions', 'No transaction history found. Data will appear here as payments are processed.')}
      </div>`;
  } catch(e) { el.innerHTML = '<div class="card"><p>Unable to load saldo & budget.</p></div>'; }
};

/* ── 11. A/B Tests ───────────────────────────────────────────────── */

PageRenderers['my-earnings'] = async function(el) {
  try {
    const r = await API.get('/api/admin/earnings/my');
    const items = r.data || [];
    const sum = r.summary || {};
    el.innerHTML = `${DOM.pageHeader('My Earnings', 'View and claim your commission earnings')}
      <div class="stat-grid">
        ${DOM.statCard({ label:'Pending', value: AppConfig.formatCurrency(sum.pending?.amount || 0), accent:'yellow' })}
        ${DOM.statCard({ label:'Approved', value: AppConfig.formatCurrency(sum.approved?.amount || 0), accent:'blue' })}
        ${DOM.statCard({ label:'Paid', value: AppConfig.formatCurrency(sum.paid?.amount || 0), accent:'green' })}
        ${DOM.statCard({ label:'Rejected', value: (sum.rejected?.count || 0), accent:'red' })}
      </div>
      <div class="card">
        <div style="display:flex;gap:8px;margin-bottom:16px;">
          <button class="btn btn-primary btn-sm" onclick="claimAllEarnings()">💰 Claim All Pending</button>
        </div>
        ${items.length
          ? DOM.table(['ID','Amount','Model','Status','Date'], items.map(d => [
              '#' + d.id,
              AppConfig.formatCurrency(d.payout_amount || 0),
              (d.payout_model || 'CPA').toUpperCase(),
              DOM.pill(d.status, {pending:'yellow',approved:'blue',paid:'green',rejected:'red'}[d.status] || 'blue'),
              d.created_at ? new Date(d.created_at * 1000).toLocaleDateString() : '-'
            ]))
          : DOM.emptyState('No earnings yet', 'Your commission earnings will appear here.')}
      </div>`;
  } catch(e) { el.innerHTML = '<div class="card"><p>Unable to load earnings.</p></div>'; }
};

// Claim all earnings helper

window.claimAllEarnings = async function() {
  try {
    const r = await API.post('/api/admin/earnings/claim', {});
    if (r.success) { Router.navigate('my-earnings'); }
  } catch(e) { alert('Claim failed: ' + e.message); }
};

/* ── 26. Advertiser Invoices ─────────────────────────────────────── */
