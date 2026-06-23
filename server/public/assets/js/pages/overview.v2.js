window.PageRenderers = window.PageRenderers || {};

/**
 * Overview Dashboard — TrackPro-style performance view
 * Features: date range filter, performance chart, ROAS/ROI, Iklan vs Organik, export
 */
PageRenderers.overview = async function(el) {
  try {
    const role = Auth.role();
    const isAffiliate = Auth.isAffiliate();
    const isAdvertiser = Auth.isAdvertiser();

    const endpoint = isAffiliate ? '/api/admin/stats?role=affiliate' : (isAdvertiser ? '/api/admin/stats?role=advertiser' : '/api/admin/stats');
    const stats = await API.get(endpoint).catch(() => ({}));

    // Calculate derived metrics
    const revenue = stats.revenueMtd || 0;
    const cost = stats.cost || 0;
    const profit = revenue - cost;
    const roas = cost > 0 ? (revenue / cost).toFixed(2) : '0.00';
    const roi = cost > 0 ? ((profit / cost) * 100).toFixed(1) : '0.0';
    const ctr = stats.avg_ctr || 0;
    const epc = stats.avg_epc || 0;

    // Date range state
    const defaultRange = '7d';
    window._overviewRange = window._overviewRange || defaultRange;

    el.innerHTML = `
      ${DOM.pageHeader(isAffiliate ? 'Affiliate Dashboard' : (isAdvertiser ? 'Advertiser Dashboard' : 'Network Overview'), 'Real-time performance tracking')}

      <!-- Date Range Filter -->
      <div style="display:flex;gap:8px;margin-bottom:24px;flex-wrap:wrap;">
        ${['today','yesterday','7d','30d','month','year'].map(r => 
          `<button class="btn btn-sm ${window._overviewRange === r ? 'btn-primary' : 'btn-outline'}" onclick="PageRenderers._setOverviewRange('${r}')">${{today:'Today',yesterday:'Yesterday','7d':'7 Hari Terakhir','30d':'30 Hari Terakhir',month:'Bulan Ini',year:'Tahun Ini'}[r]}</button>`
        ).join('')}
        <button class="btn btn-sm btn-outline" onclick="PageRenderers._exportOverview('pdf')" title="Export PDF">📄 Export PDF</button>
        <button class="btn btn-sm btn-outline" onclick="PageRenderers._exportOverview('wa')" title="Export WhatsApp">📱 Export WA</button>
      </div>

      <!-- KPI Cards -->
      <div class="stat-grid" style="grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));">
        ${DOM.statCard({ label:'Revenue', value: AppConfig.formatCurrency(revenue), accent:'green' })}
        ${DOM.statCard({ label:'Cost', value: AppConfig.formatCurrency(cost), accent:'red' })}
        ${DOM.statCard({ label:'Profit', value: AppConfig.formatCurrency(profit), accent: profit >= 0 ? 'green' : 'red' })}
        ${DOM.statCard({ label:'ROAS', value: roas + 'x', accent: parseFloat(roas) >= 1 ? 'green' : 'red' })}
        ${DOM.statCard({ label:'ROI', value: roi + '%', accent: parseFloat(roi) >= 0 ? 'green' : 'red' })}
        ${DOM.statCard({ label:'Clicks', value: AppConfig.formatNumber(stats.total_clicks || 0), accent:'blue' })}
        ${DOM.statCard({ label:'Conversions', value: AppConfig.formatNumber(stats.attributed_conversions || 0), accent:'indigo' })}
        ${DOM.statCard({ label:'CTR', value: AppConfig.formatPercent(ctr), accent:'yellow' })}
      </div>

      <!-- Performance Chart -->
      <div class="card" style="margin-bottom:24px;padding:24px;">
        <h3 style="display:flex;justify-content:space-between;align-items:center;">
          📊 Grafik Performa
          <span style="color:var(--text2);font-size:12px;">Klik titik grafik untuk detail</span>
        </h3>
        <div style="height:300px;width:100%;margin-top:16px;">
          <canvas id="overview-chart"></canvas>
        </div>
      </div>

      <!-- Iklan vs Organik Split -->
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:24px;">
        <div class="card">
          <h3>📢 Iklan (Paid)</h3>
          <div style="font-size:28px;font-weight:700;color:var(--blue);margin:12px 0;">${AppConfig.formatCurrency(stats.ad_revenue || 0)}</div>
          <div style="color:var(--text2);font-size:13px;">Komisi dari traffic berbayar</div>
        </div>
        <div class="card">
          <h3>🌱 Organik (Free)</h3>
          <div style="font-size:28px;font-weight:700;color:var(--green);margin:12px 0;">${AppConfig.formatCurrency(stats.organic_revenue || 0)}</div>
          <div style="color:var(--text2);font-size:13px;">Komisi dari traffic organik</div>
        </div>
      </div>

      <!-- Performance Insights -->
      <div class="card" style="margin-bottom:24px;">
        <h3>💡 Performance Insights</h3>
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:12px;margin-top:16px;">
          <div style="padding:16px;background:var(--panel2);border:1px solid var(--border);border-radius:8px;">
            <div style="font-weight:600;margin-bottom:4px;">Best Taglink</div>
            <div style="color:var(--text2);font-size:13px;">${stats.best_taglink || 'No data yet'}</div>
          </div>
          <div style="padding:16px;background:var(--panel2);border:1px solid var(--border);border-radius:8px;">
            <div style="font-weight:600;margin-bottom:4px;">Top Campaign</div>
            <div style="color:var(--text2);font-size:13px;">${stats.top_campaign || 'No data yet'}</div>
          </div>
          <div style="padding:16px;background:var(--panel2);border:1px solid var(--border);border-radius:8px;">
            <div style="font-weight:600;margin-bottom:4px;">Avg EPC</div>
            <div style="color:var(--text2);font-size:13px;">${AppConfig.formatCurrency(epc)}</div>
          </div>
        </div>
      </div>

      <!-- Campaign Table -->
      <div class="card">
        <h3>📋 Campaign Performance</h3>
        <div id="overview-campaign-table">
          <div class="skeleton" style="height:200px;"></div>
        </div>
      </div>
    `;

    // Initialize chart
    setTimeout(() => PageRenderers._initOverviewChart(stats), 100);

    // Load campaign table
    PageRenderers._loadOverviewCampaigns();

  } catch(e) {
    el.innerHTML = '<div class="card"><p>Unable to load dashboard.</p></div>';
    console.error(e);
  }
};

// Date range setter
PageRenderers._setOverviewRange = function(range) {
  window._overviewRange = range;
  Router.navigate('overview');
};

// Chart initialization
PageRenderers._initOverviewChart = function(stats) {
  const ctx = document.getElementById('overview-chart');
  if (!ctx || !window.Chart) return;

  // Generate sample data from stats (replace with real API data when available)
  const days = 7;
  const labels = [];
  const revenueData = [];
  const costData = [];
  const profitData = [];
  const now = new Date();

  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    labels.push(d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short' }));
    // Distribute total stats across days (placeholder — replace with real daily data)
    const dayRevenue = (stats.revenueMtd || 0) / days * (0.5 + Math.random());
    const dayCost = (stats.cost || 0) / days * (0.5 + Math.random());
    revenueData.push(Math.round(dayRevenue));
    costData.push(Math.round(dayCost));
    profitData.push(Math.round(dayRevenue - dayCost));
  }

  new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [
        { label: 'Revenue', data: revenueData, borderColor: '#10b981', backgroundColor: 'rgba(16,185,129,0.1)', fill: true, tension: 0.4 },
        { label: 'Cost', data: costData, borderColor: '#ef4444', backgroundColor: 'rgba(239,68,68,0.1)', fill: true, tension: 0.4 },
        { label: 'Profit', data: profitData, borderColor: '#6366f1', backgroundColor: 'rgba(99,102,241,0.1)', fill: true, tension: 0.4 },
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: { labels: { color: '#94a3b8', usePointStyle: true } },
        tooltip: {
          backgroundColor: 'rgba(22,27,34,0.95)',
          titleColor: '#f8fafc',
          bodyColor: '#94a3b8',
          borderColor: 'rgba(255,255,255,0.1)',
          borderWidth: 1,
          callbacks: {
            label: ctx => `${ctx.dataset.label}: ${AppConfig.formatCurrency(ctx.parsed.y)}`
          }
        }
      },
      scales: {
        y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#94a3b8', callback: v => AppConfig.formatCurrency(v) } },
        x: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#94a3b8' } }
      }
    }
  });
};

// Campaign table loader
PageRenderers._loadOverviewCampaigns = async function() {
  try {
    const container = document.getElementById('overview-campaign-table');
    if (!container) return;
    const r = await API.get('/api/admin/campaigns?limit=10');
    const items = r.data || [];
    if (items.length) {
      container.innerHTML = DOM.table(
        ['Campaign', 'Clicks', 'Conversions', 'Revenue', 'Status'],
        items.map(d => [
          d.name || d.aff_campaign_name || '-',
          d.clicks || 0,
          d.conversions || 0,
          AppConfig.formatCurrency(d.revenue || d.payout_amount || 0),
          DOM.pill(d.status || 'active', (d.status || 'active') === 'active' ? 'green' : 'yellow')
        ])
      );
    } else {
      container.innerHTML = DOM.emptyState('No campaign data', 'Campaign performance will appear here once tracking begins.');
    }
  } catch(e) {
    const container = document.getElementById('overview-campaign-table');
    if (container) container.innerHTML = DOM.emptyState('No data', 'Unable to load campaigns.');
  }
};

// Export functions
PageRenderers._exportOverview = function(format) {
  if (format === 'pdf') {
    // Trigger print dialog (Ctrl+P) as PDF export
    window.print();
  } else if (format === 'wa') {
    // Generate WhatsApp-friendly text summary
    const text = document.querySelector('.stat-grid')?.innerText || 'No data';
    const waUrl = `https://wa.me/?text=${encodeURIComponent('📊 1AI Affiliate Report\n\n' + text)}`;
    window.open(waUrl, '_blank');
  }
};
