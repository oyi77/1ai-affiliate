/* Campaign tooling renderers (postback builder, A/B tests, automation, day parting, webhooks).
 * Split from pages/gapfill.js (800-line gate). Shares the global PageRenderers namespace.
 */
window.PageRenderers = window.PageRenderers || {};

PageRenderers['postback-builder'] = async function(el) {
  try {
    const r = await API.get('/api/admin/postback-templates?limit=100');
    const items = r.data || [];
    el.innerHTML = `${DOM.pageHeader('Postback Builder', 'Configure postback URL templates')}
      <div class="card">
        <button class="btn btn-primary btn-sm" style="margin-bottom:16px" onclick="gapfillAddPostback()">+ Add Postback</button>
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
        <button class="btn btn-primary btn-sm" style="margin-bottom:16px" onclick="gapfillAddWebhook()">+ Add Webhook</button>
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
