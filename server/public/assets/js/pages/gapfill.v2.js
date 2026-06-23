/**
 * Gap-fill page renderers — pages without dedicated backend endpoints yet.
 * Uses /api/admin/stats where possible; placeholder API paths elsewhere.
 * All renderers follow the existing try/catch + DOM helper conventions.
 */
window.PageRenderers = window.PageRenderers || {};

/* ── Aliases ─────────────────────────────────────────────────────── */
PageRenderers['realtime']       = function(el) { Router.navigate('clicks'); };
PageRenderers['click-tracker']  = function(el) { Router.navigate('clicks'); };
PageRenderers['api-docs']       = function(el) { Router.navigate('docs'); };
PageRenderers['settings']       = function(el) { Router.navigate('profile'); };

/* ── 1. Traffic Sources ──────────────────────────────────────────── */
PageRenderers['traffic-sources'] = async function(el) {
  try {
    const r = await API.get('/api/admin/traffic-sources?limit=100');
    const items = r.data || [];
    el.innerHTML = `${DOM.pageHeader('Traffic Sources', 'Manage traffic source configurations')}
      <div class="card">
        ${items.length
          ? DOM.table(['Name','Type','Status','Created'], items.map(d => [
              d.name || '-',
              d.type || '-',
              DOM.pill(d.status || 'active', (d.status||'active')==='active' ? 'green' : 'yellow'),
              d.created_at ? new Date(d.created_at).toLocaleDateString() : '-'
            ]))
          : DOM.emptyState('No traffic sources', 'No traffic source configurations found. Data will appear here once sources are added.')}
      </div>`;
  } catch(e) { el.innerHTML = '<div class="card"><p>Unable to load traffic sources.</p></div>'; }
};

/* ── 2. Deep Links ───────────────────────────────────────────────── */
PageRenderers['deep-links'] = async function(el) {
  try {
    const r = await API.get('/api/admin/deep-links?limit=100');
    const items = r.data || [];
    el.innerHTML = `${DOM.pageHeader('Deep Links', 'Manage deep link pages')}
      <div class="card">
        ${items.length
          ? DOM.table(['URL','Campaign','Status','Created'], items.map(d => [
              d.url || '-',
              d.campaign_name || d.campaign_id || '-',
              DOM.pill(d.status || 'active', (d.status||'active')==='active' ? 'green' : 'yellow'),
              d.created_at ? new Date(d.created_at).toLocaleDateString() : '-'
            ]))
          : DOM.emptyState('No deep links', 'No deep link pages found. Data will appear here once deep links are created.')}
      </div>`;
  } catch(e) { el.innerHTML = '<div class="card"><p>Unable to load deep links.</p></div>'; }
};

/* ── 3. Landing Pages ────────────────────────────────────────────── */
PageRenderers['landing-pages'] = async function(el) {
  try {
    const r = await API.get('/api/admin/landing-pages?limit=100');
    const items = r.data || [];
    el.innerHTML = `${DOM.pageHeader('Landing Pages', 'Manage landing pages')}
      <div class="card">
        ${items.length
          ? DOM.table(['Name','URL','Campaign','Status'], items.map(d => [
              d.name || '-',
              d.url || '-',
              d.campaign_name || d.campaign_id || '-',
              DOM.pill(d.status || 'active', (d.status||'active')==='active' ? 'green' : 'yellow')
            ]))
          : DOM.emptyState('No landing pages', 'No landing pages found. Data will appear here once pages are added.')}
      </div>`;
  } catch(e) { el.innerHTML = '<div class="card"><p>Unable to load landing pages.</p></div>'; }
};

/* ── 4. Conversion Log ───────────────────────────────────────────── */
PageRenderers['conversion-log'] = async function(el) {
  try {
    const r = await API.get('/api/admin/conversion-log?limit=100');
    const items = r.data || [];
    el.innerHTML = `${DOM.pageHeader('Conversion Log', 'All conversion events')}
      <div class="card">
        ${items.length
          ? DOM.table(['ID','Click ID','Campaign','Payout','Revenue','Status','Time'], items.map(d => [
              d.id || '-',
              d.click_id || '-',
              d.campaign_name || d.campaign_id || '-',
              AppConfig.formatCurrency(d.payout || 0),
              AppConfig.formatCurrency(d.revenue || 0),
              DOM.pill(d.status || 'pending', {approved:'green',pending:'yellow',rejected:'red'}[d.status] || 'blue'),
              d.created_at ? new Date(d.created_at).toLocaleString() : '-'
            ]))
          : DOM.emptyState('No conversions', 'No conversion events found. Data will appear here as conversions are tracked.')}
      </div>`;
  } catch(e) { el.innerHTML = '<div class="card"><p>Unable to load conversion log.</p></div>'; }
};

/* ── 5. Postback Builder ─────────────────────────────────────────── */
PageRenderers['postback-builder'] = async function(el) {
  try {
    const r = await API.get('/api/admin/postback-templates?limit=100');
    const items = r.data || [];
    el.innerHTML = `${DOM.pageHeader('Postback Builder', 'Configure postback URL templates')}
      <div class="card">
        <button class="btn btn-primary btn-sm" style="margin-bottom:16px" disabled title="Coming soon">+ Add Postback</button>
        ${items.length
          ? DOM.table(['Name','URL','Method','Status'], items.map(d => [
              d.name || '-',
              d.url || '-',
              (d.method || 'GET').toUpperCase(),
              DOM.pill(d.status || 'active', (d.status||'active')==='active' ? 'green' : 'yellow')
            ]))
          : DOM.emptyState('No postback templates', 'No postback URL templates configured. Data will appear here once templates are created.')}
      </div>`;
  } catch(e) { el.innerHTML = '<div class="card"><p>Unable to load postback builder.</p></div>'; }
};

/* ── 6. Laporan Iklan ────────────────────────────────────────────── */
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
PageRenderers['ab-tests'] = async function(el) {
  try {
    const r = await API.get('/api/admin/ab-tests?limit=100');
    const items = r.data || [];
    el.innerHTML = `${DOM.pageHeader('A/B Tests', 'Manage A/B testing campaigns')}
      <div class="card">
        ${items.length
          ? DOM.table(['Name','Variant A','Variant B','Status','Winner'], items.map(d => [
              d.name || '-',
              d.variant_a || '-',
              d.variant_b || '-',
              DOM.pill(d.status || 'running', {running:'blue',completed:'green',paused:'yellow'}[d.status] || 'blue'),
              d.winner ? DOM.pill(d.winner, 'green') : '-'
            ]))
          : DOM.emptyState('No A/B tests', 'No A/B tests configured. Data will appear here once tests are created.')}
      </div>`;
  } catch(e) { el.innerHTML = '<div class="card"><p>Unable to load A/B tests.</p></div>'; }
};

/* ── 12. Automation Rules ────────────────────────────────────────── */
PageRenderers['automation'] = async function(el) {
  try {
    const r = await API.get('/api/admin/automation?limit=100');
    const items = r.data || [];
    el.innerHTML = `${DOM.pageHeader('Automation Rules', 'Automated campaign management')}
      <div class="card">
        ${items.length
          ? DOM.table(['Name','Trigger','Action','Status'], items.map(d => [
              d.name || '-',
              d.trigger || '-',
              d.action || '-',
              DOM.pill(d.status || 'active', (d.status||'active')==='active' ? 'green' : 'yellow')
            ]))
          : DOM.emptyState('No automation rules', 'No automation rules configured. Data will appear here once rules are created.')}
      </div>`;
  } catch(e) { el.innerHTML = '<div class="card"><p>Unable to load automation rules.</p></div>'; }
};

/* ── 13. Day Parting ─────────────────────────────────────────────── */
PageRenderers['day-parting'] = async function(el) {
  try {
    const r = await API.get('/api/admin/day-parting').catch(() => ({ data: {} }));
    const schedule = r.data || {};
    const days = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
    const hours = Array.from({length: 24}, (_, i) => i);
    const cellStyle = 'display:inline-block;width:22px;height:22px;margin:1px;border-radius:4px;cursor:pointer;text-align:center;line-height:22px;font-size:9px;color:#fff;user-select:none;';
    let grid = '<div class="card"><h3>Schedule Grid</h3><div style="overflow-x:auto">';
    grid += '<div style="display:grid;grid-template-columns:40px repeat(24,24px);gap:1px;font-size:10px">';
    grid += '<div></div>';
    for (const h of hours) {
      grid += `<div style="text-align:center;color:var(--text2)">${h}</div>`;
    }
    for (let di = 0; di < days.length; di++) {
      grid += `<div style="font-weight:600;font-size:12px;line-height:22px">${days[di]}</div>`;
      for (let hi = 0; hi < 24; hi++) {
        const key = di + '_' + hi;
        const on = schedule[key] !== false;
        const bg = on ? 'var(--indigo)' : 'rgba(255,255,255,0.08)';
        grid += `<div class="dp-cell" data-day="${di}" data-hour="${hi}" style="${cellStyle}background:${bg}">${on ? '·' : ''}</div>`;
      }
    }
    grid += '</div>';
    grid += '<p style="margin-top:12px;color:var(--text2);font-size:12px">Click cells to toggle delivery on/off. Dark cells = delivery enabled.</p>';
    grid += '</div></div>';
    el.innerHTML = DOM.pageHeader('Day Parting', 'Schedule campaign delivery by time') + grid;
    el.querySelectorAll('.dp-cell').forEach(cell => {
      cell.addEventListener('click', () => {
        const bg = cell.style.background;
        const isOn = bg.includes('var(--indigo)') || bg === 'rgb(99, 102, 241)';
        cell.style.background = isOn ? 'rgba(255,255,255,0.08)' : 'var(--indigo)';
        cell.textContent = isOn ? '' : '·';
      });
    });
  } catch(e) { el.innerHTML = '<div class="card"><p>Unable to load day parting.</p></div>'; }
};

/* ── 14. Webhooks ────────────────────────────────────────────────── */
PageRenderers['webhooks'] = async function(el) {
  try {
    const r = await API.get('/api/admin/webhooks?limit=100');
    const items = r.data || [];
    el.innerHTML = `${DOM.pageHeader('Webhooks', 'Manage webhook endpoints')}
      <div class="card">
        <button class="btn btn-primary btn-sm" style="margin-bottom:16px" disabled title="Coming soon">+ Add Webhook</button>
        ${items.length
          ? DOM.table(['URL','Events','Status','Last Sent'], items.map(d => [
              d.url || '-',
              Array.isArray(d.events) ? d.events.join(', ') : (d.events || '-'),
              DOM.pill(d.status || 'active', (d.status||'active')==='active' ? 'green' : 'yellow'),
              d.last_sent_at ? new Date(d.last_sent_at).toLocaleString() : '-'
            ]))
          : DOM.emptyState('No webhooks', 'No webhook endpoints configured. Data will appear here once webhooks are added.')}
      </div>`;
  } catch(e) { el.innerHTML = '<div class="card"><p>Unable to load webhooks.</p></div>'; }
};

/* ── 15. Laporan Pembayaran (alias → existing payments renderer) ── */
PageRenderers['laporan-pembayaran'] = PageRenderers.payments;


/* ── 16. Cap Enforcement ────────────────────────────────────────── */
PageRenderers['caps'] = async function(el) {
  try {
    const [offers, fraud] = await Promise.all([
      API.get('/api/admin/offers?limit=50'),
      API.get('/api/admin/services/fraud/blacklist')
    ]);
    const offerItems = offers.data || [];
    const blacklistItems = fraud.data || [];
    el.innerHTML = `${DOM.pageHeader('Cap Enforcement', 'Daily/monthly cap checking for offers and affiliates')}
      <div class="stat-grid">
        ${DOM.statCard({ label:'Active Offers', value: offerItems.filter(o => o.status === 'active').length, accent:'blue' })}
        ${DOM.statCard({ label:'Blacklisted IPs', value: blacklistItems.length, accent:'red' })}
        ${DOM.statCard({ label:'Total Offers', value: offerItems.length, accent:'indigo' })}
      </div>
      <div class="card"><h3>Offer Caps</h3>
        ${offerItems.length
          ? DOM.table(['Offer', 'Payout', 'Daily Cap', 'Monthly Cap', 'Status'], offerItems.slice(0, 20).map(d => [
              d.name || '-',
              AppConfig.formatCurrency(d.payout || 0),
              d.daily_cap || '∞',
              d.monthly_cap || '∞',
              DOM.pill(d.status || 'active', (d.status||'active')==='active' ? 'green' : 'yellow')
            ]))
          : DOM.emptyState('No offers', 'Create offers to configure caps.')}
      </div>
      <div class="card"><h3>Fraud Blacklist</h3>
        ${blacklistItems.length
          ? DOM.table(['Type', 'Value', 'Reason', 'Severity', 'Added'], blacklistItems.map(d => [
              d.type || '-', d.value || '-', d.reason || '-',
              DOM.pill(d.severity || 'medium', {high:'red',medium:'yellow',low:'blue'}[d.severity] || 'blue'),
              d.created_at ? new Date(d.created_at * 1000).toLocaleDateString() : '-'
            ]))
          : DOM.emptyState('No blacklisted entries', 'Fraud blacklist is empty.')}
      </div>`;
  } catch(e) { el.innerHTML = '<div class="card"><p>Unable to load cap enforcement data.</p></div>'; }
};

/* ── 17. Fraud Detection ────────────────────────────────────────── */
PageRenderers['fraud'] = async function(el) {
  try {
    const r = await API.get('/api/admin/services/fraud/blacklist');
    const items = r.data || [];
    el.innerHTML = `${DOM.pageHeader('Fraud Detection', 'IP blacklist, bot detection, velocity checks')}
      <div class="card"><h3>Blacklist (${items.length} entries)</h3>
        ${items.length
          ? DOM.table(['Type', 'Value', 'Reason', 'Severity', 'Auto-detected', 'Added'], items.map(d => [
              d.type || '-', d.value || '-', d.reason || '-',
              DOM.pill(d.severity || 'medium', {high:'red',medium:'yellow',low:'blue'}[d.severity] || 'blue'),
              d.auto_detected ? 'Yes' : 'No',
              d.created_at ? new Date(d.created_at * 1000).toLocaleDateString() : '-'
            ]))
          : DOM.emptyState('No blacklisted entries', 'The fraud blacklist is clean.')}
      </div>`;
  } catch(e) { el.innerHTML = '<div class="card"><p>Unable to load fraud detection data.</p></div>'; }
};

/* ── 18. Margin Negotiation ─────────────────────────────────────── */
PageRenderers['margin'] = async function(el) {
  try {
    const r = await API.get('/api/admin/services/margin/negotiations');
    const items = r.data || [];
    el.innerHTML = `${DOM.pageHeader('Margin Negotiation', 'Payout proposals between affiliates and offer managers')}
      <div class="card"><h3>Negotiations (${items.length})</h3>
        ${items.length
          ? DOM.table(['Offer', 'Affiliate', 'Current', 'Proposed', 'Margin', 'Status', 'Proposed By', 'Date'], items.map(d => [
              d.offer_id || '-',
              d.affiliate_id || '-',
              AppConfig.formatCurrency(d.current_payout || 0),
              AppConfig.formatCurrency(d.proposed_payout || 0),
              (d.margin_pct || 0) + '%',
              DOM.pill(d.status || 'pending', {pending:'yellow',approved:'green',rejected:'red',expired:'blue'}[d.status] || 'blue'),
              d.proposed_by || '-',
              d.created_at ? new Date(d.created_at).toLocaleDateString() : '-'
            ]))
          : DOM.emptyState('No negotiations', 'No payout negotiations have been proposed yet.')}
      </div>`;
  } catch(e) { el.innerHTML = '<div class="card"><p>Unable to load margin negotiation data.</p></div>'; }
};

/* ── 19. Multi-Model Tracking ───────────────────────────────────── */
PageRenderers['multimodel'] = async function(el) {
  try {
    const s = await API.get('/api/admin/stats');
    el.innerHTML = `${DOM.pageHeader('Multi-Model Tracking', 'CPC, CPV, and CPM payout models')}
      <div class="stat-grid">
        ${DOM.statCard({ label:'Total Clicks', value: (s.total_clicks||0).toLocaleString(), accent:'blue' })}
        ${DOM.statCard({ label:'Conversions', value: (s.attributed_conversions||0).toLocaleString(), accent:'green' })}
        ${DOM.statCard({ label:'Revenue MTD', value: AppConfig.formatCurrency(s.revenueMtd||0), accent:'yellow' })}
      </div>
      <div class="card"><h3>Payout Models</h3>
        <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:16px;">
          <div style="padding:20px;background:var(--panel2);border:1px solid var(--border);border-radius:8px;text-align:center;">
            <div style="font-size:24px;font-weight:700;color:var(--blue);">CPC</div>
            <div style="color:var(--text2);font-size:13px;margin-top:4px;">Cost Per Click</div>
            <p style="color:var(--text2);font-size:12px;margin-top:8px;">Earn per valid click on your tracking link.</p>
          </div>
          <div style="padding:20px;background:var(--panel2);border:1px solid var(--border);border-radius:8px;text-align:center;">
            <div style="font-size:24px;font-weight:700;color:var(--green);">CPV</div>
            <div style="color:var(--text2);font-size:13px;margin-top:4px;">Cost Per View</div>
            <p style="color:var(--text2);font-size:12px;margin-top:8px;">Earn per qualified video view (3s+ duration).</p>
          </div>
          <div style="padding:20px;background:var(--panel2);border:1px solid var(--border);border-radius:8px;text-align:center;">
            <div style="font-size:24px;font-weight:700;color:var(--yellow);">CPM</div>
            <div style="color:var(--text2);font-size:13px;margin-top:4px;">Cost Per Mille</div>
            <p style="color:var(--text2);font-size:12px;margin-top:8px;">Earn per 1,000 impressions with batch fulfillment.</p>
          </div>
        </div>
      </div>`;
  } catch(e) { el.innerHTML = '<div class="card"><p>Unable to load multi-model tracking data.</p></div>'; }
};

/* ── 20. Conversion Approval ────────────────────────────────────── */
PageRenderers['conversion-approval'] = async function(el) {
  try {
    const _capStatus = (PageRenderers._capStatus || 'pending');
    const url = '/api/admin/conversion-approval' + (_capStatus !== 'all' ? '?status=' + _capStatus : '');
    const r = await API.get(url);
    const items = r.data || [];
    const counts = { pending:0, approved:0, rejected:0, paid:0 };
    items.forEach(d => { if (counts[d.status] !== undefined) counts[d.status]++; });
    const totalRev = items.reduce((s,d) => s + parseFloat(d.payout || 0), 0);
    el.innerHTML = `${DOM.pageHeader('Conversion Approval', 'Review and approve pending conversions')}
      <div class="stat-grid">
        ${DOM.statCard({ label:'Pending', value: counts.pending, accent:'yellow' })}
        ${DOM.statCard({ label:'Approved', value: counts.approved, accent:'green' })}
        ${DOM.statCard({ label:'Total Revenue', value: AppConfig.formatCurrency(totalRev), accent:'blue' })}
      </div>
      <div class="card">
        <div style="display:flex;gap:8px;margin-bottom:16px;flex-wrap:wrap;">
          ${['all','pending','approved','rejected','paid'].map(s =>
            '<button class="btn btn-sm ' + (s===_capStatus?'btn-primary':'btn-outline') + '" onclick="PageRenderers._capStatus=\'' + s + '\';Router.navigate(\'conversion-approval\')">' + s.charAt(0).toUpperCase()+s.slice(1) + '</button>'
          ).join('')}
        </div>
        ${items.length
          ? DOM.table(['ID','Click ID','Campaign','Payout','Status','Date','Actions'], items.map(d => [
              d.id || '-',
              d.click_id || '-',
              d.campaign_name || d.campaign_id || '-',
              AppConfig.formatCurrency(d.payout || 0),
              DOM.pill(d.status || 'pending', {pending:'yellow',approved:'green',rejected:'red',paid:'blue'}[d.status] || 'yellow'),
              d.created_at ? new Date(d.created_at).toLocaleDateString() : '-',
              d.status === 'pending'
                ? '<button class="btn btn-sm btn-success" onclick="convApprove(' + d.id + ')">Approve</button> <button class="btn btn-sm btn-danger" onclick="convReject(' + d.id + ')">Reject</button>'
                : '-'
            ]))
          : DOM.emptyState('No conversions found', 'No conversions match the current filter.')}
      </div>`;
    window.convApprove = async function(id) {
      try { await API.post('/api/admin/conversion-approval/' + id + '/approve'); Router.navigate('conversion-approval'); }
      catch(e) { alert('Approve failed'); }
    };
    window.convReject = async function(id) {
      try { await API.post('/api/admin/conversion-approval/' + id + '/reject'); Router.navigate('conversion-approval'); }
      catch(e) { alert('Reject failed'); }
    };
  } catch(e) { el.innerHTML = '<div class="card"><p>Unable to load conversion approval data.</p></div>'; }
};

/* ── 21. Creative Assets ─────────────────────────────────────────── */
PageRenderers['creatives'] = async function(el) {
  try {
    const offers = await API.get('/api/admin/offers');
    const offerList = offers.data || [];
    const selected = PageRenderers._creativeOffer || '';
    const r = selected ? await API.get('/api/admin/creatives?offer_id=' + selected).catch(() => ({data: []})) : {data: []};
    const items = r.data || [];
    el.innerHTML = `${DOM.pageHeader('Creative Assets', 'Manage banners, HTML creatives, and media')}
      <div class="card">
        <div style="display:flex;gap:12px;align-items:center;margin-bottom:16px;">
          <label style="font-size:13px;font-weight:600;color:var(--text2);">Offer:</label>
          <select style="padding:8px 12px;background:rgba(0,0,0,0.2);border:1px solid var(--border);border-radius:8px;color:var(--text);font-size:13px;" onchange="PageRenderers._creativeOffer=this.value;Router.navigate('creatives')">
            <option value="">All Offers</option>
            ${offerList.map(o => '<option value="' + o.id + '"' + (String(o.id)===String(selected)?' selected':'') + '>' + (o.name || 'Offer #' + o.id) + '</option>').join('')}
          </select>
        </div>
        ${items.length
          ? DOM.table(['Name','Type','Dimensions','Status','Created','Preview'], items.map(d => [
              d.name || '-',
              d.type || '-',
              d.width && d.height ? d.width + '×' + d.height : '-',
              DOM.pill(d.status || 'active', {active:'green',pending:'yellow',paused:'red',archived:'blue'}[d.status] || 'blue'),
              d.created_at ? new Date(d.created_at).toLocaleDateString() : '-',
              d.type === 'image' || d.type === 'banner'
                ? '<img src="' + (d.url || d.preview_url || '') + '" style="max-width:80px;max-height:40px;border-radius:4px;" onerror="this.style.display=\'none\'" />'
                : d.type === 'html'
                ? '<span class="pill pill-indigo">HTML</span>'
                : '-'
            ]))
          : DOM.emptyState('No creatives found', 'No creative assets available for the selected offer.')}
      </div>`;
  } catch(e) { el.innerHTML = '<div class="card"><p>Unable to load creative assets.</p></div>'; }
};

/* ── 22. Payout Processing ───────────────────────────────────────── */
PageRenderers['payout-processing'] = async function(el) {
  try {
    const r = await API.get('/api/admin/payouts/batches');
    const batches = r.data || [];
    const counts = { pending:0, processing:0, paid:0 };
    batches.forEach(d => { if (counts[d.status] !== undefined) counts[d.status]++; });
    el.innerHTML = `${DOM.pageHeader('Payout Processing', 'Manage payout batches and disbursements')}
      <div class="stat-grid">
        ${DOM.statCard({ label:'Pending', value: counts.pending, accent:'yellow' })}
        ${DOM.statCard({ label:'Processing', value: counts.processing, accent:'blue' })}
        ${DOM.statCard({ label:'Paid', value: counts.paid, accent:'green' })}
      </div>
      <div class="card">
        <div style="display:flex;justify-content:flex-end;margin-bottom:16px;">
          <button class="btn btn-primary btn-sm" onclick="createPayoutBatch()">+ Create New Batch</button>
        </div>
        ${batches.length
          ? DOM.table(['Batch ID','Total','Status','Created','Actions'], batches.map(d => [
              d.id || d.batch_id || '-',
              AppConfig.formatCurrency(d.total || d.amount || 0),
              DOM.pill(d.status || 'pending', {pending:'yellow',processing:'blue',paid:'green',failed:'red'}[d.status] || 'yellow'),
              d.created_at ? new Date(d.created_at).toLocaleDateString() : '-',
              d.status === 'processing'
                ? '<button class="btn btn-sm btn-success" onclick="markBatchPaid(' + (d.id || d.batch_id) + ')">Mark Paid</button>'
                : '-'
            ]))
          : DOM.emptyState('No payout batches', 'No payout batches have been created yet.')}
      </div>`;
    window.createPayoutBatch = async function() {
      try { await API.post('/api/admin/payouts/batches'); Router.navigate('payout-processing'); }
      catch(e) { alert('Create batch failed'); }
    };
    window.markBatchPaid = async function(id) {
      try { await API.post('/api/admin/payouts/batches/' + id + '/mark-paid'); Router.navigate('payout-processing'); }
      catch(e) { alert('Mark paid failed'); }
    };
  } catch(e) { el.innerHTML = '<div class="card"><p>Unable to load payout processing data.</p></div>'; }
};

/* ── 23. Offer Applications ──────────────────────────────────────── */
PageRenderers['offer-applications'] = async function(el) {
  try {
    const r = await API.get('/api/admin/services/margin/negotiations');
    const items = r.data || [];
    el.innerHTML = `${DOM.pageHeader('Offer Applications', 'Review affiliate applications to offers')}
      <div class="card"><h3>Applications (${items.length})</h3>
        ${items.length
          ? DOM.table(['Offer','Affiliate','Current Payout','Proposed','Status','Date','Actions'], items.map(d => [
              d.offer_id || d.offer_name || '-',
              d.affiliate_id || d.affiliate_name || '-',
              AppConfig.formatCurrency(d.current_payout || 0),
              AppConfig.formatCurrency(d.proposed_payout || 0),
              DOM.pill(d.status || 'pending', {pending:'yellow',approved:'green',rejected:'red'}[d.status] || 'yellow'),
              d.created_at ? new Date(d.created_at).toLocaleDateString() : '-',
              d.status === 'pending'
                ? '<button class="btn btn-sm btn-success" onclick="offerApprove(' + d.id + ')">Approve</button> <button class="btn btn-sm btn-danger" onclick="offerReject(' + d.id + ')">Reject</button>'
                : '-'
            ]))
          : DOM.emptyState('No applications', 'No offer applications pending review.')}
      </div>`;
    window.offerApprove = async function(id) {
      try { await API.post('/api/admin/services/margin/negotiations/' + id + '/approve'); Router.navigate('offer-applications'); }
      catch(e) { alert('Approve failed'); }
    };
    window.offerReject = async function(id) {
      try { await API.post('/api/admin/services/margin/negotiations/' + id + '/reject'); Router.navigate('offer-applications'); }
      catch(e) { alert('Reject failed'); }
    };
  } catch(e) { el.innerHTML = '<div class="card"><p>Unable to load offer applications.</p></div>'; }
};

/* ── 24. API Documentation ───────────────────────────────────────── */
PageRenderers['api-docs-page'] = async function(el) {
  el.innerHTML = `${DOM.pageHeader('API Documentation', 'RESTful API reference for the 1AI Affiliate platform')}
    <div class="card">
      <h3>📖 API Reference</h3>
      <p style="color:var(--text2);font-size:14px;line-height:1.6;margin-bottom:16px;">
        Access the full interactive API documentation with endpoint details, request/response schemas, and live examples.
      </p>
      <a href="/api-docs" target="_blank" class="btn btn-primary" style="display:inline-flex;">
        Open API Docs ↗
      </a>
    </div>
    <div class="card">
      <h3>Available Endpoints</h3>
      <div style="display:grid;gap:12px;margin-top:12px;">
        ${[
          ['GET','/api/admin/stats','Platform statistics and metrics'],
          ['GET','/api/admin/offers','List all offers'],
          ['GET','/api/admin/campaigns','List campaigns'],
          ['GET','/api/admin/affiliates','List affiliates'],
          ['GET','/api/admin/conversions','Conversion data'],
          ['GET','/api/admin/clicks','Click tracking data'],
          ['POST','/api/admin/conversion-approval/:id/approve','Approve conversion'],
          ['GET','/api/admin/payouts/batches','Payout batches'],
          ['GET','/api/admin/creatives','Creative assets'],
        ].map(([m,path,desc]) =>
          '<div style="display:flex;align-items:center;gap:12px;padding:12px;background:var(--panel2);border:1px solid var(--border);border-radius:8px;">' +
            '<span class="pill pill-' + (m==='GET'?'blue':'green') + '">' + m + '</span>' +
            '<code style="font-size:13px;">' + path + '</code>' +
            '<span style="color:var(--text2);font-size:12px;margin-left:auto;">' + desc + '</span>' +
          '</div>'
        ).join('')}
      </div>
    </div>`;
};

/* ── 25. Affiliate Earnings & Claim ────────────────────────────────── */
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
PageRenderers['invoices'] = async function(el) {
  try {
    const r = await API.get('/api/admin/invoices');
    const items = r.data || [];
    el.innerHTML = `${DOM.pageHeader('Invoices', 'Manage advertiser invoices')}
      <div class="card">
        ${items.length
          ? DOM.table(['ID','Period','Conversions','Revenue','Payout','Status','Actions'], items.map(d => [
              '#' + d.id,
              (d.period_start || '') + ' → ' + (d.period_end || ''),
              d.conversions_count || 0,
              AppConfig.formatCurrency(d.revenue_amount || 0),
              AppConfig.formatCurrency(d.payout_amount || 0),
              DOM.pill(d.status, {draft:'yellow',sent:'blue',paid:'green',void:'red'}[d.status] || 'blue'),
              d.status === 'draft' ? '<button class="btn btn-sm btn-outline" onclick="sendInvoice(' + d.id + ')">Send</button>' :
              d.status === 'sent' ? '<button class="btn btn-sm btn-primary" onclick="payInvoice(' + d.id + ')">Mark Paid</button>' : '-'
            ]))
          : DOM.emptyState('No invoices', 'Invoices will appear here when created.')}
      </div>`;
  } catch(e) { el.innerHTML = '<div class="card"><p>Unable to load invoices.</p></div>'; }
};
window.sendInvoice = async (id) => { try { await API.post('/api/admin/invoices/' + id + '/send', {}); Router.navigate('invoices'); } catch(e) { alert('Failed: ' + e.message); } };
window.payInvoice = async (id) => { try { await API.post('/api/admin/invoices/' + id + '/pay', {}); Router.navigate('invoices'); } catch(e) { alert('Failed: ' + e.message); } };

/* ── 27. Billing Summary ────────────────────────────────────────── */
PageRenderers['billing'] = async function(el) {
  try {
    const r = await API.get('/api/admin/billing/summary');
    const earn = r.earnings || {};
    const inv = r.invoices || {};
    const bal = r.balance || {};
    el.innerHTML = `${DOM.pageHeader('Billing & Payments', 'Financial overview for the platform')}
      <div class="stat-grid">
        ${DOM.statCard({ label:'Total Earned', value: AppConfig.formatCurrency(earn.total || 0), accent:'blue' })}
        ${DOM.statCard({ label:'Total Paid', value: AppConfig.formatCurrency(earn.paid || 0), accent:'green' })}
        ${DOM.statCard({ label:'Pending Payout', value: AppConfig.formatCurrency(earn.pending || 0), accent:'yellow' })}
        ${DOM.statCard({ label:'Available Balance', value: AppConfig.formatCurrency(bal.available || 0), accent:'indigo' })}
      </div>
      <div class="card"><h3>Invoice Status</h3>
        <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:12px;">
          ${['draft','sent','paid','void'].map(s => {
            const d = inv[s] || {};
            return '<div style="padding:16px;background:var(--panel2);border:1px solid var(--border);border-radius:8px;text-align:center;">' +
              '<div style="font-size:20px;font-weight:700;">' + (d.count || 0) + '</div>' +
              '<div style="color:var(--text2);font-size:12px;">' + s.charAt(0).toUpperCase() + s.slice(1) + '</div>' +
              '<div style="font-size:11px;color:var(--text2);">Rp ' + (d.amount || 0).toLocaleString() + '</div></div>';
          }).join('')}
        </div>
      </div>
      <div class="card"><h3>Balance Ledger</h3>
        <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px;">
          <div style="padding:16px;background:var(--panel2);border:1px solid var(--border);border-radius:8px;text-align:center;">
            <div style="font-size:18px;font-weight:700;color:var(--green);">Rp ${(bal.deposits||0).toLocaleString()}</div>
            <div style="color:var(--text2);font-size:12px;">Deposits</div>
          </div>
          <div style="padding:16px;background:var(--panel2);border:1px solid var(--border);border-radius:8px;text-align:center;">
            <div style="font-size:18px;font-weight:700;color:var(--red);">Rp ${(bal.withdrawals||0).toLocaleString()}</div>
            <div style="color:var(--text2);font-size:12px;">Withdrawals</div>
          </div>
          <div style="padding:16px;background:var(--panel2);border:1px solid var(--border);border-radius:8px;text-align:center;">
            <div style="font-size:18px;font-weight:700;color:var(--indigo2);">Rp ${(bal.available||0).toLocaleString()}</div>
            <div style="color:var(--text2);font-size:12px;">Available</div>
          </div>
        </div>
      </div>`;
  } catch(e) { el.innerHTML = '<div class="card"><p>Unable to load billing summary.</p></div>'; }
};

/* ── 28. Management Overview ─────────────────────────────────────── */
PageRenderers['management'] = async function(el) {
  try {
    const r = await API.get('/api/admin/management/overview');
    const earn = r.earnings || {};
    const inv = r.invoices || {};
    const pay = r.payments || {};
    const bal = r.balance || {};
    el.innerHTML = `${DOM.pageHeader('Management Overview', 'Full financial oversight for platform operators')}
      <div class="stat-grid">
        ${DOM.statCard({ label:'Net Balance', value: AppConfig.formatCurrency(bal.net || 0), accent: (bal.net||0) >= 0 ? 'green' : 'red' })}
        ${DOM.statCard({ label:'Deposits', value: AppConfig.formatCurrency(bal.deposits || 0), accent:'blue' })}
        ${DOM.statCard({ label:'Withdrawals', value: AppConfig.formatCurrency(bal.withdrawals || 0), accent:'red' })}
      </div>
      <div class="card"><h3>Earnings by Status</h3>
        <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:12px;">
          ${['pending','approved','paid','rejected'].map(s => {
            const d = earn[s] || {};
            return '<div style="padding:16px;background:var(--panel2);border:1px solid var(--border);border-radius:8px;text-align:center;">' +
              '<div style="font-size:20px;font-weight:700;">' + (d.count || 0) + '</div>' +
              '<div style="color:var(--text2);font-size:12px;">' + s.charAt(0).toUpperCase() + s.slice(1) + '</div>' +
              '<div style="font-size:11px;color:var(--text2);">Rp ' + (d.amount || 0).toLocaleString() + '</div></div>';
          }).join('')}
        </div>
      </div>
      <div class="card"><h3>Invoices</h3>
        <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:12px;">
          ${['draft','sent','paid','void'].map(s => {
            const d = inv[s] || {};
            return '<div style="padding:16px;background:var(--panel2);border:1px solid var(--border);border-radius:8px;text-align:center;">' +
              '<div style="font-size:20px;font-weight:700;">' + (d.count || 0) + '</div>' +
              '<div style="color:var(--text2);font-size:12px;">' + s.charAt(0).toUpperCase() + s.slice(1) + '</div>' +
              '<div style="font-size:11px;color:var(--text2);">Rp ' + (d.amount || 0).toLocaleString() + '</div></div>';
          }).join('')}
        </div>
      </div>
      <div class="card"><h3>Payments</h3>
        <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:12px;">
          ${['pending','processing','paid','failed'].map(s => {
            const d = pay[s] || {};
            return '<div style="padding:16px;background:var(--panel2);border:1px solid var(--border);border-radius:8px;text-align:center;">' +
              '<div style="font-size:20px;font-weight:700;">' + (d.count || 0) + '</div>' +
              '<div style="color:var(--text2);font-size:12px;">' + s.charAt(0).toUpperCase() + s.slice(1) + '</div>' +
              '<div style="font-size:11px;color:var(--text2);">Rp ' + (d.amount || 0).toLocaleString() + '</div></div>';
          }).join('')}
        </div>
      </div>`;
  } catch(e) { el.innerHTML = '<div class="card"><p>Unable to load management overview.</p></div>'; }
};
/* ── META × SHOPEE PAGES ──────────────────────────────────────── */

// Meta × Shopee: Performance Dashboard
PageRenderers['meta-performance'] = async function(el) {
  try {
    const [stats, spend] = await Promise.all([
      API.get('/api/admin/stats'),
      API.get('/api/admin/stats/daily').catch(() => ({ data: [] }))
    ]);
    const dailyData = spend.data || [];
    const totalSpend = dailyData.reduce((s, d) => s + (d.spend || 0), 0);
    const totalComm = dailyData.reduce((s, d) => s + (d.commission || 0), 0);
    const roi = totalSpend > 0 ? ((totalComm - totalSpend) / totalSpend * 100).toFixed(1) : '0.0';
    const roas = totalSpend > 0 ? (totalComm / totalSpend).toFixed(2) : '0.00';

    el.innerHTML = `${DOM.pageHeader('Meta × Shopee Performance', 'Track ad spend vs Shopee commission — ROAS, ROI, profit')}
      <div class="stat-grid">
        ${DOM.statCard({ label:'Ad Spend', value: AppConfig.formatCurrency(totalSpend), accent:'red' })}
        ${DOM.statCard({ label:'Commission', value: AppConfig.formatCurrency(totalComm), accent:'green' })}
        ${DOM.statCard({ label:'Net Profit', value: AppConfig.formatCurrency(totalComm - totalSpend), accent: totalComm > totalSpend ? 'green' : 'red' })}
        ${DOM.statCard({ label:'ROAS', value: roas + 'x', accent: parseFloat(roas) >= 1 ? 'green' : 'red' })}
        ${DOM.statCard({ label:'ROI', value: roi + '%', accent: parseFloat(roi) >= 0 ? 'green' : 'red' })}
      </div>
      <div class="card">
        <h3>Daily Breakdown</h3>
        ${dailyData.length
          ? DOM.table(['Date','Spend','Commission','Profit','ROAS','Orders'], dailyData.map(d => {
              const sp = d.spend || 0;
              const cm = d.commission || 0;
              const r = sp > 0 ? (cm / sp).toFixed(2) : '-';
              return [d.date || '-', AppConfig.formatCurrency(sp), AppConfig.formatCurrency(cm), AppConfig.formatCurrency(cm - sp), r + 'x', d.orders || 0];
            }))
          : DOM.emptyState('No daily data', 'Upload Shopee reports and sync Meta to see daily breakdown.')}
      </div>`;
  } catch(e) { el.innerHTML = '<div class="card"><p>Unable to load Meta × Shopee performance.</p></div>'; }
};

// Meta × Shopee: Data Manager (upload Shopee CSV, sync Meta)
PageRenderers['meta-data'] = async function(el) {
  try {
    const [meta, shopee] = await Promise.all([
      API.get('/api/settings/features').catch(() => ({ data: {} })),
      API.get('/api/admin/creatives?offer_id=0').catch(() => ({ data: [] }))
    ]);
    el.innerHTML = `${DOM.pageHeader('Data Manager', 'Upload Shopee reports and sync Meta Ads data')}
      <div class="card">
        <h3>📊 Shopee Affiliate Reports</h3>
        <p style="color:var(--text2);font-size:13px;margin-bottom:16px;">Upload CSV exports from Shopee Affiliate dashboard. Commission + click data will be merged into reports.</p>
        <div style="display:flex;gap:12px;align-items:center;margin-bottom:16px;">
          <select style="padding:8px 12px;background:rgba(0,0,0,0.2);border:1px solid var(--border);border-radius:8px;color:var(--text);font-size:13px;">
            <option>Shopee Commission CSV</option>
            <option>Shopee Click CSV</option>
          </select>
          <button class="btn btn-primary btn-sm" disabled title="Coming soon">Upload CSV</button>
        </div>
        ${DOM.emptyState('No reports uploaded', 'Upload Shopee commission CSVs to track affiliate earnings.')}
      </div>
      <div class="card">
        <h3>🔗 Meta Ads Accounts</h3>
        <p style="color:var(--text2);font-size:13px;margin-bottom:16px;">Connect Meta Ads accounts to auto-sync spend data.</p>
        <button class="btn btn-outline btn-sm" disabled title="Coming soon">+ Add Meta Account</button>
        ${DOM.emptyState('No Meta accounts', 'Connect a Facebook account to sync ad spend.')}
      </div>`;
  } catch(e) { el.innerHTML = '<div class="card"><p>Unable to load data manager.</p></div>'; }
};

// Meta × Shopee: Tag Mapping
PageRenderers['meta-mapping'] = async function(el) {
  try {
    el.innerHTML = `${DOM.pageHeader('Tag Mapping', 'Map Meta campaign names to Shopee taglinks')}
      <div class="card">
        <div style="display:flex;gap:12px;margin-bottom:16px;">
          <input type="text" placeholder="Campaign name" style="flex:1;padding:8px 12px;background:rgba(0,0,0,0.2);border:1px solid var(--border);border-radius:8px;color:var(--text);font-size:13px;">
          <input type="text" placeholder="Taglink" style="flex:1;padding:8px 12px;background:rgba(0,0,0,0.2);border:1px solid var(--border);border-radius:8px;color:var(--text);font-size:13px;">
          <button class="btn btn-primary btn-sm" disabled title="Coming soon">Add Mapping</button>
        </div>
        ${DOM.emptyState('No mappings', 'Create campaign-to-taglink mappings for automatic attribution.')}
      </div>`;
  } catch(e) { el.innerHTML = '<div class="card"><p>Unable to load tag mapping.</p></div>'; }
};

// Meta × Shopee: Auto Rules
PageRenderers['meta-rules'] = async function(el) {
  try {
    el.innerHTML = `${DOM.pageHeader('Auto Rules', 'Automated campaign management for Meta × Shopee')}
      <div class="stat-grid">
        ${DOM.statCard({ label:'Auto Pause', value: 'OFF', accent:'yellow' })}
        ${DOM.statCard({ label:'Auto Scale', value: 'OFF', accent:'yellow' })}
        ${DOM.statCard({ label:'Sleep Schedule', value: 'OFF', accent:'yellow' })}
        ${DOM.statCard({ label:'Budget Guard', value: 'OFF', accent:'yellow' })}
      </div>
      <div class="card">
        <h3>⚙️ Rule Configuration</h3>
        <div style="display:grid;gap:16px;margin-top:16px;">
          <div style="padding:16px;background:var(--panel2);border:1px solid var(--border);border-radius:8px;">
            <div style="font-weight:600;margin-bottom:8px;">Auto Pause</div>
            <div style="color:var(--text2);font-size:13px;">Pause campaigns automatically if loss for N consecutive days.</div>
            <div style="display:flex;gap:8px;align-items:center;margin-top:12px;">
              <label style="font-size:13px;color:var(--text2);">Loss days:</label>
              <input type="number" value="3" style="width:60px;padding:6px 10px;background:rgba(0,0,0,0.2);border:1px solid var(--border);border-radius:6px;color:var(--text);font-size:13px;">
              <button class="btn btn-outline btn-sm" disabled title="Coming soon">Enable</button>
            </div>
          </div>
          <div style="padding:16px;background:var(--panel2);border:1px solid var(--border);border-radius:8px;">
            <div style="font-weight:600;margin-bottom:8px;">Auto Scale Budget</div>
            <div style="color:var(--text2);font-size:13px;">Increase budget by 20% if ROAS ≥ 1.5x for 3 consecutive days.</div>
            <div style="display:flex;gap:8px;align-items:center;margin-top:12px;">
              <label style="font-size:13px;color:var(--text2);">Max budget:</label>
              <input type="number" value="50000" style="width:100px;padding:6px 10px;background:rgba(0,0,0,0.2);border:1px solid var(--border);border-radius:6px;color:var(--text);font-size:13px;">
              <button class="btn btn-outline btn-sm" disabled title="Coming soon">Enable</button>
            </div>
          </div>
          <div style="padding:16px;background:var(--panel2);border:1px solid var(--border);border-radius:8px;">
            <div style="font-weight:600;margin-bottom:8px;">Sleep Schedule</div>
            <div style="color:var(--text2);font-size:13px;">Pause ads during specific hours (e.g., midnight–6am).</div>
            <div style="display:flex;gap:8px;align-items:center;margin-top:12px;">
              <label style="font-size:13px;color:var(--text2);">From:</label>
              <input type="time" value="00:00" style="padding:6px 10px;background:rgba(0,0,0,0.2);border:1px solid var(--border);border-radius:6px;color:var(--text);font-size:13px;">
              <label style="font-size:13px;color:var(--text2);">To:</label>
              <input type="time" value="06:00" style="padding:6px 10px;background:rgba(0,0,0,0.2);border:1px solid var(--border);border-radius:6px;color:var(--text);font-size:13px;">
              <button class="btn btn-outline btn-sm" disabled title="Coming soon">Enable</button>
            </div>
          </div>
        </div>
      </div>`;
  } catch(e) { el.innerHTML = '<div class="card"><p>Unable to load auto rules.</p></div>'; }
};

// Meta × Shopee: Payouts
PageRenderers['meta-payouts'] = async function(el) {
  try {
    el.innerHTML = `${DOM.pageHeader('Shopee Payouts', 'Track Shopee affiliate payout history')}
      <div class="card">
        <button class="btn btn-primary btn-sm" style="margin-bottom:16px;" disabled title="Coming soon">+ Record Payout</button>
        ${DOM.emptyState('No payouts recorded', 'Record Shopee payouts to track commission payments.')}
      </div>`;
  } catch(e) { el.innerHTML = '<div class="card"><p>Unable to load payouts.</p></div>'; }
};
