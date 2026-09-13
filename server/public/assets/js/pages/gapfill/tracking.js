/* Core tracking renderers (aliases, traffic sources, deep links, landing pages, conversion log).
 * Split from pages/gapfill.js (800-line gate). Shares the global PageRenderers namespace.
 */
window.PageRenderers = window.PageRenderers || {};

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
