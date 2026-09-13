/* Meta x Shopee + TrackPro renderers.
 * Split from pages/gapfill.js (800-line gate). Shares the global PageRenderers namespace.
 */
window.PageRenderers = window.PageRenderers || {};

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
          <button class="btn btn-primary btn-sm" onclick="gapfillUploadCSV()">Upload CSV</button>
        </div>
        ${DOM.emptyState('No reports uploaded', 'Upload Shopee commission CSVs to track affiliate earnings.')}
      </div>
      <div class="card">
        <h3>🔗 Meta Ads Accounts</h3>
        <p style="color:var(--text2);font-size:13px;margin-bottom:16px;">Connect Meta Ads accounts to auto-sync spend data.</p>
        <button class="btn btn-outline btn-sm" onclick="gapfillAddMetaAccount()">+ Add Meta Account</button>
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
          <button class="btn btn-primary btn-sm" onclick="gapfillAddMapping()">Add Mapping</button>
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
              <button class="btn btn-outline btn-sm" onclick="gapfillEnableRule(this)">Enable</button>
            </div>
          </div>
          <div style="padding:16px;background:var(--panel2);border:1px solid var(--border);border-radius:8px;">
            <div style="font-weight:600;margin-bottom:8px;">Auto Scale Budget</div>
            <div style="color:var(--text2);font-size:13px;">Increase budget by 20% if ROAS ≥ 1.5x for 3 consecutive days.</div>
            <div style="display:flex;gap:8px;align-items:center;margin-top:12px;">
              <label style="font-size:13px;color:var(--text2);">Max budget:</label>
              <input type="number" value="50000" style="width:100px;padding:6px 10px;background:rgba(0,0,0,0.2);border:1px solid var(--border);border-radius:6px;color:var(--text);font-size:13px;">
              <button class="btn btn-outline btn-sm" onclick="gapfillEnableRule(this)">Enable</button>
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
              <button class="btn btn-outline btn-sm" onclick="gapfillEnableRule(this)">Enable</button>
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
        <button class="btn btn-primary btn-sm" style="margin-bottom:16px;" onclick="gapfillRecordPayout()">+ Record Payout</button>
        ${DOM.emptyState('No payouts recorded', 'Record Shopee payouts to track commission payments.')}
      </div>`;
  } catch(e) { el.innerHTML = '<div class="card"><p>Unable to load payouts.</p></div>'; }
};

// ═══ Button Handlers ═══

PageRenderers['trackpro-sync'] = async function(el) {
  try {
    const [status, data, settings] = await Promise.all([
      API.get('/api/admin/trackpro/status').catch(() => ({ data: {} })),
      API.get('/api/admin/trackpro/data').catch(() => ({ data: {} })),
      API.get('/api/settings/integrations').catch(() => ({}))
    ]);
    const hasCredentials = settings.trackpro_username && settings.trackpro_password;
    const s = status.data || {};
    const d = data.data || {};
    const spendRows = d.spend || [];
    const payoutRows = d.payouts || [];
    const metaRows = d.metaAccounts || [];

      // Show credential status
  const credStatus = document.getElementById('tp-credential-status');
  if (credStatus) {
    if (hasCredentials) {
      credStatus.innerHTML = '<span style="color:var(--green);">✅ Credentials configured</span>';
    } else {
      credStatus.innerHTML = '<span style="color:var(--red);">❌ Not configured — <a class="link" onclick="Router.navigate(\'settings\'); window._settingsTab=\'integrations\'; Router.navigate(\'settings\')">Set up in Settings</a></span>';
    }
  }

    el.innerHTML = `${DOM.pageHeader('TrackPro Sync', 'Import Shopee commissions and Meta Ads spend from TrackPro')}
      <div class="stat-grid">
        ${DOM.statCard({ label:'Daily Spend Records', value: s.dailySpend?.rows || 0, accent:'blue' })}
        ${DOM.statCard({ label:'Total Spend', value: AppConfig.formatCurrency(s.dailySpend?.total || 0), accent:'red' })}
        ${DOM.statCard({ label:'Shopee Payouts', value: s.payouts?.rows || 0, accent:'green' })}
        ${DOM.statCard({ label:'Total Payouts', value: AppConfig.formatCurrency(s.payouts?.total || 0), accent:'green' })}
        ${DOM.statCard({ label:'Meta Accounts', value: s.metaAccounts?.rows || 0, accent:'indigo' })}
      </div>

      <div class="card" style="margin-bottom:24px;">
        <h3>🔄 Sync from TrackPro</h3>
        <p style="color:var(--text2);font-size:13px;margin-bottom:16px;">
          Connect your TrackPro account to automatically import Shopee commission data and Meta Ads spend.
        </p>
        <div style="display:flex;gap:12px;align-items:center;flex-wrap:wrap;">
          <div style="display:flex;align-items:center;gap:8px;padding:8px 16px;background:var(--panel2);border:1px solid var(--border);border-radius:8px;">
            <span style="font-size:16px;">📊</span>
            <div>
              <div style="font-weight:600;font-size:13px;">TrackPro</div>
              <div style="color:var(--text2);font-size:11px;">tracker.getflashsale.xyz</div>
            </div>
          </div>
          <div id="tp-credential-status" style="font-size:13px;"></div>
          <button class="btn btn-primary" onclick="trackproSync()" id="tp-sync-btn">🔄 Sync Now</button>
          <a class="link" style="font-size:12px;" onclick="Router.navigate('settings'); window._settingsTab='integrations'; Router.navigate('settings')">Configure in Settings →</a>
        </div>
        <div id="tp-sync-status" style="margin-top:12px;font-size:13px;color:var(--text2);"></div>
      </div>

      <div class="card" style="margin-bottom:24px;">
        <h3>📊 Daily Spend & Commission</h3>
        ${spendRows.length
          ? DOM.table(['Date','Campaign','Spend','Clicks'], spendRows.map(d => [
              d.date ? new Date(d.date).toLocaleDateString('id-ID') : '-',
              d.campaign_name || '-',
              AppConfig.formatCurrency(d.spend || 0),
              d.clicks || 0
            ]))
          : DOM.emptyState('No spend data', 'Sync from TrackPro to import daily spend and commission data.')}
      </div>

      <div class="card" style="margin-bottom:24px;">
        <h3>💰 Shopee Payouts</h3>
        ${payoutRows.length
          ? DOM.table(['Report ID','Account','Amount','Status','Date'], payoutRows.map(d => [
              d.report_id || '-',
              d.shopee_account || '-',
              AppConfig.formatCurrency(d.amount || 0),
              DOM.pill(d.status || 'pending', {paid:'green',pending:'yellow',cancelled:'red'}[d.status] || 'blue'),
              d.created_at ? new Date(d.created_at * 1000).toLocaleDateString('id-ID') : '-'
            ]))
          : DOM.emptyState('No payouts', 'Shopee payout records will appear here after sync.')}
      </div>

      <div class="card">
        <h3>📘 Meta Ads Accounts</h3>
        ${metaRows.length
          ? DOM.table(['Account ID','Name','Balance','Status'], metaRows.map(d => [
              d.act_id || '-',
              d.account_name || '-',
              AppConfig.formatCurrency(d.balance || 0),
              DOM.pill(d.status || 'active', {active:'green',inactive:'yellow'}[d.status] || 'blue')
            ]))
          : DOM.emptyState('No Meta accounts', 'Meta ad account data will appear here after sync.')}
      </div>`;
  } catch(e) { el.innerHTML = '<div class="card"><p>Unable to load TrackPro sync page.</p></div>'; }
};

window.trackproSync = async function() {
  const status = document.getElementById('tp-sync-status');
  const btn = document.getElementById('tp-sync-btn');
  
  // Read credentials from settings
  let settings;
  try {
    settings = await API.get('/api/settings/integrations');
  } catch(e) { settings = {}; }
  
  const username = settings.trackpro_username;
  const password = settings.trackpro_password;
  
  if (!username || !password) {
    status.innerHTML = '<span style="color:var(--red);">❌ TrackPro credentials not configured. <a class="link" onclick="Router.navigate(\'settings\'); window._settingsTab=\'integrations\'; Router.navigate(\'settings\')">Go to Settings → Integrations</a></span>';
    return;
  }
  
  btn.disabled = true;
  btn.textContent = '⏳ Syncing...';
  status.innerHTML = '<span style="color:var(--text2);">Connecting to TrackPro and scraping data...</span>';
  
  try {
    const r = await API.post('/api/admin/trackpro/sync', { username, password });
    if (r.success) {
      const imp = r.imported || {};
      status.innerHTML = '<span style="color:var(--green);">✅ Sync complete! Imported ' + 
        (imp.dailySpend || 0) + ' daily records, ' + 
        (imp.payouts || 0) + ' payouts, ' + 
        (imp.metaAccounts || 0) + ' Meta accounts.</span>';
      // Refresh page after 1s
      setTimeout(() => Router.navigate('trackpro-sync'), 1000);
    } else {
      status.innerHTML = '<span style="color:var(--red);">❌ ' + (r.error || 'Sync failed') + '</span>';
    }
  } catch(e) {
    status.innerHTML = '<span style="color:var(--red);">❌ ' + (e.message || 'Sync failed') + '</span>';
  } finally {
    btn.disabled = false;
    btn.textContent = '🔄 Sync Now';
  }
};
