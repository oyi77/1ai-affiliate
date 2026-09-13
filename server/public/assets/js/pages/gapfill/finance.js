/* Finance renderers (conversion approval, creatives, payouts, offer applications, invoices, billing, management).
 * Split from pages/gapfill.js (800-line gate). Shares the global PageRenderers namespace.
 */
window.PageRenderers = window.PageRenderers || {};

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

PageRenderers['laporan-pembayaran'] = PageRenderers.payments;


/* ── 16. Cap Enforcement ────────────────────────────────────────── */
