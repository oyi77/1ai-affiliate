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
              'Rp ' + parseFloat(d.payout || 0).toLocaleString(),
              'Rp ' + parseFloat(d.revenue || 0).toLocaleString(),
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
        ${DOM.statCard({ label:'Total Revenue', value: 'Rp ' + totalRevenue.toLocaleString() })}
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
                'Rp ' + rv.toLocaleString(),
                'Rp ' + po.toLocaleString(),
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
        ${DOM.statCard({ label:'Total Revenue', value: 'Rp ' + totalRevenue.toLocaleString() })}
      </div>
      <div class="card">
        ${days.length
          ? DOM.table(['Tanggal','Klik','Konversi','Revenue'], days.map(d => [
              d.date || d.tanggal || '-',
              d.clicks || d.klik || 0,
              d.conversions || d.konversi || 0,
              'Rp ' + parseFloat(d.revenue || 0).toLocaleString()
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
              'Rp ' + parseFloat(d.payout || 0).toLocaleString(),
              'Rp ' + parseFloat(d.revenue || 0).toLocaleString(),
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
        ${DOM.statCard({ label:'Saldo', value: 'Rp ' + balance.toLocaleString(), accent:'green' })}
        ${DOM.statCard({ label:'Terpakai', value: 'Rp ' + spent.toLocaleString(), accent:'red' })}
        ${DOM.statCard({ label:'Budget', value: 'Rp ' + budget.toLocaleString(), accent:'yellow' })}
        ${DOM.statCard({ label:'Sisa Budget', value: 'Rp ' + Math.max(0, budget - spent).toLocaleString() })}
      </div>
      <div class="card">
        <h3>Riwayat Transaksi</h3>
        ${items.length
          ? DOM.table(['Reference','User','Amount','Status','Date'], items.map(d => [
              d.reference || d.id || '-',
              '#'+d.user_id,
              'Rp ' + parseFloat(d.amount || 0).toLocaleString(),
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
              'Rp ' + parseFloat(d.payout || 0).toLocaleString(),
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
              'Rp ' + parseFloat(d.current_payout || 0).toLocaleString(),
              'Rp ' + parseFloat(d.proposed_payout || 0).toLocaleString(),
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
        ${DOM.statCard({ label:'Revenue MTD', value: '$' + (s.revenueMtd||0).toLocaleString(), accent:'yellow' })}
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