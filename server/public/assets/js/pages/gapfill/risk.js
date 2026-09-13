/* Risk/experiment renderers (caps, fraud, margin, multimodel, API docs).
 * Split from pages/gapfill.js (800-line gate). Shares the global PageRenderers namespace.
 */
window.PageRenderers = window.PageRenderers || {};

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
