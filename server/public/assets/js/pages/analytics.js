/** Static content pages: Attribution, Clicks, Reports */
window.PageRenderers = window.PageRenderers || {};

PageRenderers.attribution = async function(el) {
  try {
    const s = await API.get('/api/admin/stats');
    el.innerHTML = `${DOM.pageHeader('Multi-Touch Attribution', 'First-touch, last-touch, and assisted conversions')}
      <div class="stat-grid">
        ${DOM.statCard({ label:'Total Clicks', value: (s.total_clicks||0).toLocaleString() })}
        ${DOM.statCard({ label:'Attributed Conversions', value: (s.attributed_conversions||0).toLocaleString(), accent:'green' })}
        ${DOM.statCard({ label:'Assisted Conversions', value: (s.assisted_conversions||0).toLocaleString(), accent:'yellow' })}
      </div>
      <div class="card"><p style="color:var(--text2);font-size:13px">Multi-touch attribution data populates as clicks and conversions are tracked through the system.</p></div>`;
  } catch(e) { el.innerHTML = '<div class="card"><p>Unable to load attribution data.</p></div>'; }
};

PageRenderers.clicks = async function(el) {
  try {
    const s = await API.get('/api/admin/stats');
    el.innerHTML = `${DOM.pageHeader('Live Click Tracker', 'Real-time monitoring via SSE stream')}
      <div class="stat-grid">
        ${DOM.statCard({ label:'Clicks 1H', value: '—', accent:'blue', id:'rt-clicks-1h' })}
        ${DOM.statCard({ label:'Conversions 1H', value: '—', accent:'green', id:'rt-conv-1h' })}
        ${DOM.statCard({ label:'Revenue 1H', value: '—', accent:'yellow', id:'rt-rev-1h' })}
        ${DOM.statCard({ label:'Active Affiliates', value: '—', accent:'indigo', id:'rt-active-aff' })}
        ${DOM.statCard({ label:'Pending Postbacks', value: '—', accent:'red', id:'rt-pending-pb' })}
        ${DOM.statCard({ label:'Clicks Today', value: (s.clicks_today||s.active_clicks_24h||0).toLocaleString(), accent:'blue' })}
      </div>
      <div class="card">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px">
          <h3 style="margin:0">Live Feed</h3>
          <div id="sse-status" style="display:flex;align-items:center;gap:6px;font-size:12px;color:var(--text2)">
            <span id="sse-dot" style="width:8px;height:8px;border-radius:50%;background:var(--red)"></span>
            <span id="sse-label">Connecting...</span>
          </div>
        </div>
        <div id="rt-feed" style="max-height:400px;overflow-y:auto;font-size:13px;color:var(--text2)">
          <div class="skeleton" style="height:60px"></div>
        </div>
      </div>`;

    // Connect to SSE stream
    const token = Auth.token();
    const feed = document.getElementById('rt-feed');
    const dot = document.getElementById('sse-dot');
    const label = document.getElementById('sse-label');
    let eventCount = 0;

    // Use fetch SSE polyfill to send auth header
    const response = await fetch('/api/admin/stats/stream', {
      headers: { 'Authorization': 'Bearer ' + token }
    });
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    dot.style.background = 'var(--green)';
    label.textContent = 'Live';

    function processChunk(chunk) {
      buffer += chunk;
      const lines = buffer.split('\n\n');
      buffer = lines.pop(); // keep incomplete chunk
      for (const line of lines) {
        if (!line.startsWith('data: ')) continue;
        try {
          const d = JSON.parse(line.substring(6));
          if (d.error) continue;
          eventCount++;

          // Update stat cards
          const el1 = document.getElementById('rt-clicks-1h');
          const el2 = document.getElementById('rt-conv-1h');
          const el3 = document.getElementById('rt-rev-1h');
          const el4 = document.getElementById('rt-active-aff');
          const el5 = document.getElementById('rt-pending-pb');
          if (el1) el1.textContent = (d.clicks_1h||0).toLocaleString();
          if (el2) el2.textContent = (d.conversions_1h||0).toLocaleString();
          if (el3) el3.textContent = AppConfig.formatCurrency(d.revenue_1h||0);
          if (el4) el4.textContent = (d.active_affiliates||0).toLocaleString();
          if (el5) el5.textContent = (d.pending_postbacks||0).toLocaleString();

          // Add to feed
          if (feed && eventCount <= 50) {
            const time = new Date(d.timestamp).toLocaleTimeString();
            const entry = document.createElement('div');
            entry.style.cssText = 'padding:8px 0;border-bottom:1px solid var(--border);display:flex;justify-content:space-between;';
            entry.innerHTML = `<span>🟢 Update #${eventCount}</span><span>Clicks:${d.clicks_1h} Conv:${d.conversions_1h} Rev:$${parseFloat(d.revenue_1h||0).toFixed(2)}</span><span style="color:var(--text2)">${time}</span>`;
            feed.prepend(entry);
          }
        } catch(e) { /* ignore parse errors */ }
      }
    }

    // Read stream
    (async () => {
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          processChunk(decoder.decode(value, { stream: true }));
        }
      } catch(e) {
        dot.style.background = 'var(--red)';
        label.textContent = 'Disconnected';
      }
    })();

    // Cleanup on page change
    window._sseCleanup = () => { reader.cancel(); };

  } catch(e) { el.innerHTML = '<div class="card"><p>Unable to load click data.</p></div>'; }
};

PageRenderers.reports = async function(el) {
  try {
    const s = await API.get('/api/admin/stats');
    el.innerHTML = `${DOM.pageHeader('Reports', 'Generate and export performance reports')}
      <div class="stat-grid">
        ${DOM.statCard({ label:'Revenue MTD', value:AppConfig.formatCurrency(s.revenue_mtd||0) })}
        ${DOM.statCard({ label:'Total Clicks', value: (s.total_clicks||0).toLocaleString(), accent:'green' })}
        ${DOM.statCard({ label:'Avg EPC', value:AppConfig.formatCurrency((s.avg_epc||0)), accent:'yellow' })}
      </div>
      <div class="card"><h3>Report Generator</h3>
        <div class="form-row">
          <div class="form-group"><label>Date Range</label>
            <select id="report-range">
              <option value="7d">Last 7 Days</option><option value="30d">Last 30 Days</option>
              <option value="90d">Last 90 Days</option><option value="mtd">Month to Date</option><option value="ytd">Year to Date</option>
            </select>
          </div>
          <div class="form-group"><label>Report Type</label>
            <select id="report-type">
              <option value="summary">Summary</option><option value="clicks">Click Details</option>
              <option value="conversions">Conversions</option><option value="payouts">Payouts</option>
            </select>
          </div>
        </div>
        <button class="btn btn-primary btn-sm" onclick="PageRenderers.loadReport()">Generate</button>
        <button class="btn btn-outline btn-sm" style="margin-left:8px" onclick="PageRenderers.exportCsv()">Export CSV</button>
      </div>
      <div id="report-results" style="margin-top:16px"></div>`;
  } catch(e) { el.innerHTML = '<div class="card"><p>Unable to load report data.</p></div>'; }
};

PageRenderers.loadReport = async () => {
  const el = document.getElementById('report-results');
  const range = document.getElementById('report-range').value;
  const type = document.getElementById('report-type').value;
  el.innerHTML = '<div class="skeleton" style="height:100px"></div>';
  try {
    const d = await API.get('/api/admin/reports?range=' + range + '&type=' + type);
    if (type === 'summary') {
      el.innerHTML = '<div class="card" style="margin-top:0"><h3>' + d.range + ' Summary</h3>' +
        DOM.table(['Metric','Value'], d.rows.map(r => [r.metric, r.value.toLocaleString()])) +
        '</div>';
    } else {
      el.innerHTML = '<div class="card" style="margin-top:0"><h3>' + d.type + ' (' + d.range + ')</h3>' +
        '<div style="font-size:13px;color:var(--text2);margin-bottom:8px">' + d.rows.length + ' rows &middot; ' + Object.entries(d.totals).map(([k,v]) => k+': '+(typeof v==='number'?v.toLocaleString():v)).join(' &middot; ') + '</div>' +
        DOM.table(d.headers, d.rows.map(r => d.headers.map(h => {
          const v = r[h];
          if (h === 'timestamp') return new Date(v * 1000).toLocaleString();
          if (h === 'payout' || h === 'amount') return AppConfig.formatCurrency(Number(v)||0);
          return v;
        }))) +
        '</div>';
    }
    AppUI.toast('Report loaded');
  } catch(e) { el.innerHTML = '<p style="color:var(--red);font-size:13px">' + e.message + '</p>'; }
};

PageRenderers.exportCsv = async () => {
  const range = document.getElementById('report-range').value;
  const type = document.getElementById('report-type').value;
  try {
    const token = Auth.token();
    const r = await fetch('/api/admin/reports.csv?range=' + range + '&type=' + type, {
      headers: { 'Authorization': 'Bearer ' + token }
    });
    if (!r.ok) throw new Error('Export failed');
    const blob = await r.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = '1ai-' + type + '-' + range + '.csv';
    a.click();
    URL.revokeObjectURL(url);
    AppUI.toast('CSV exported');
  } catch(e) { AppUI.toast(e.message, 'err'); }
};