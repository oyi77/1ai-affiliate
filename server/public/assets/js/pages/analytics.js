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
    const [s, clicks] = await Promise.all([
      API.get('/api/admin/stats'),
      API.get('/api/admin/reports?type=clicks&range=1d'),
    ]);
    el.innerHTML = `${DOM.pageHeader('Click Tracker', 'Real-time click monitoring')}
      <div class="stat-grid">
        ${DOM.statCard({ label:'Clicks Today', value: (s.clicks_today||s.active_clicks_24h||0).toLocaleString() })}
        ${DOM.statCard({ label:'Unique IPs', value: (s.unique_ips||0).toLocaleString(), accent:'green' })}
        ${DOM.statCard({ label:'Avg CTR', value: (s.avg_ctr||0)+'%', accent:'yellow' })}
      </div>
      <div class="card"><h3>Recent Clicks</h3>
        ${(clicks.rows||[]).length
          ? DOM.table(
            ['Campaign','IP','Payout','Time'],
            clicks.rows.map(c => [
              c.campaign_id||'-',
              `<code>${c.ip||'-'}</code>`,
              c.payout ? 'Rp '+(Number(c.payout)||0).toLocaleString() : '-',
              new Date(c.timestamp*1000).toLocaleString()
            ])
          )
          : DOM.emptyState('No clicks yet', 'Click data populates as traffic flows through your tracking links.')}
      </div>`;
  } catch(e) { el.innerHTML = '<div class="card"><p>Unable to load click data.</p></div>'; }
};

PageRenderers.reports = async function(el) {
  try {
    const s = await API.get('/api/admin/stats');
    el.innerHTML = `${DOM.pageHeader('Reports', 'Generate and export performance reports')}
      <div class="stat-grid">
        ${DOM.statCard({ label:'Revenue MTD', value:'Rp '+(s.revenue_mtd||0).toLocaleString() })}
        ${DOM.statCard({ label:'Total Clicks', value: (s.total_clicks||0).toLocaleString(), accent:'green' })}
        ${DOM.statCard({ label:'Avg EPC', value:'Rp '+(s.avg_epc||0).toFixed(2), accent:'yellow' })}
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
          if (h === 'payout' || h === 'amount') return 'Rp ' + (Number(v)||0).toLocaleString();
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