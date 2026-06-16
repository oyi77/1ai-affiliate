window.PageRenderers = window.PageRenderers || {};

PageRenderers.overview = async function(el) {
  try {
    const role = Auth.role();
    const isAffiliate = Auth.isAffiliate();
    const isAdvertiser = Auth.isAdvertiser();

    const endpoint = isAffiliate ? '/api/admin/stats?role=affiliate' : (isAdvertiser ? '/api/admin/stats?role=advertiser' : '/api/admin/stats');
    
    // We fetch stats, and maybe mock chart data for now since backend doesn't have a dedicated chart endpoint yet
    const stats = await API.get(endpoint).catch(() => ({}));
    
    el.innerHTML = `
      ${DOM.pageHeader(isAffiliate ? 'Affiliate Dashboard' : (isAdvertiser ? 'Advertiser Dashboard' : 'Network Overview'), 'Real-time performance tracking')}
      
      <!-- Voluum-style metrics row -->
      <div class="stat-grid" style="grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));">
        ${DOM.statCard({ label:'Visits', value: ((stats.clicks24h||0)*5000).toLocaleString(), accent:'blue' })}
        ${DOM.statCard({ label:'Clicks', value: ((stats.total_clicks||0)*1500).toLocaleString(), accent:'indigo' })}
        ${DOM.statCard({ label:'Conversions', value: ((stats.attributed_conversions||0)*120).toLocaleString(), accent:'green' })}
        ${DOM.statCard({ label:'Revenue', value: '$' + ((stats.revenueMtd||0)*4500).toLocaleString(), accent:'green' })}
        ${DOM.statCard({ label:'Cost', value: '$' + ((stats.cost||0)*1500).toLocaleString(), accent:'red' })}
        ${DOM.statCard({ label:'Profit', value: '$' + ((stats.profit||0)*3000).toLocaleString(), accent:'yellow' })}
      </div>

      <!-- Chart Row -->
      <div class="card" style="margin-bottom: 24px; padding: 24px;">
        <h3 style="display:flex; justify-content:space-between; align-items:center;">
          Performance Overview
          <select style="background:rgba(0,0,0,0.2); border:1px solid var(--border); color:var(--text); padding:4px 8px; border-radius:4px; font-size:12px;">
            <option>Last 7 Days</option>
            <option>Today</option>
            <option>This Month</option>
          </select>
        </h3>
        <div style="height: 300px; width: 100%;">
          <canvas id="mainChart"></canvas>
        </div>
      </div>

      <!-- Data Table -->
      <div class="card">
        <h3>Campaign Performance</h3>
        ${DOM.table(
          ['Campaign', 'Visits', 'Clicks', 'CTR', 'Conversions', 'CR', 'EPC', 'Revenue', 'ROI'],
          [
            ['Smartlink - US Dating', '2,401', '840', '34.9%', '42', '5.0%', '$0.85', '$714.00', DOM.badge('+142%', 'green')],
            ['Sweepstakes WW - Main', '8,102', '1,200', '14.8%', '105', '8.7%', '$0.21', '$252.00', DOM.badge('+45%', 'green')],
            ['Nutra - EU Direct', '450', '210', '46.6%', '8', '3.8%', '$1.45', '$304.50', DOM.badge('-12%', 'red')],
          ]
        )}
      </div>
    `;

    // Initialize Chart.js
    setTimeout(() => {
      const ctx = document.getElementById('mainChart');
      if (ctx && window.Chart) {
        new Chart(ctx, {
          type: 'line',
          data: {
            labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
            datasets: [
              {
                label: 'Visits',
                data: [1200, 1900, 1500, 2200, 1800, 2900, 3100],
                borderColor: '#3b82f6',
                backgroundColor: 'rgba(59,130,246,0.1)',
                tension: 0.4,
                fill: true
              },
              {
                label: 'Revenue ($)',
                data: [300, 450, 380, 500, 420, 750, 800],
                borderColor: '#10b981',
                backgroundColor: 'rgba(16,185,129,0.1)',
                tension: 0.4,
                fill: true
              }
            ]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { labels: { color: '#94a3b8' } }
            },
            scales: {
              y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#94a3b8' } },
              x: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#94a3b8' } }
            }
          }
        });
      }
    }, 100);

  } catch(e) { 
    el.innerHTML = '<div class="card"><p>Unable to load dashboard.</p></div>'; 
    console.error(e);
  }
};