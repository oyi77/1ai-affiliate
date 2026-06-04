// 1AI Affiliate Tracker — SPA
const API = '';  // same origin

// ── Auth helpers ──
function getToken() { return localStorage.getItem('1ai_token'); }
function authHeaders() { return { 'Authorization': 'Bearer ' + getToken(), 'Content-Type': 'application/json' }; }

// ── Navigation ──
let currentPage = 'overview';
function navigate(page) {
  currentPage = page;
  document.querySelectorAll('.nav-item').forEach(n => n.classList.toggle('active', n.dataset.page === page));
  const titles = {
    overview:'Overview', attribution:'Attribution', clicks:'Click Tracker', campaigns:'Campaigns',
    offers:'Offers', reports:'Reports', affiliates:'Affiliates', earnings:'Earnings',
    commissions:'Commissions', payments:'Payments', profile:'Profile & Settings',
    integrations:'API Integrations', admin:'System Admin', clickservers:'Click Servers',
    docs:'Documentation', help:'Help & Support', vipperks:'VIP Perks', users:'Users',
    forgotpassword:'Forgot Password', resetpassword:'Reset Password'
  };
  document.getElementById('page-title').textContent = titles[page] || page;
  const el = document.getElementById('page-content');
  const renderers = {
    overview: renderOverview, attribution: renderAttribution, clicks: renderClicks,
    campaigns: renderCampaigns, offers: renderOffers, reports: renderReports,
    affiliates: renderAffiliates, earnings: renderEarnings, commissions: renderCommissions,
    payments: renderPayments, profile: renderProfile, integrations: renderIntegrations,
    admin: renderAdmin, clickservers: renderClickServers, docs: renderDocs,
    help: renderHelp, vipperks: renderVipPerks, users: renderUsers
  };
  if (renderers[page]) { el.innerHTML = '<div class="skeleton" style="height:200px;margin-bottom:16px"></div><div class="skeleton" style="height:150px"></div>'; renderers[page](el); }
  // Close mobile sidebar
  document.getElementById('sidebar').classList.remove('open');
  document.getElementById('scrim').classList.remove('open');
}

function toggleSidebar() {
  document.getElementById('sidebar').classList.toggle('open');
  document.getElementById('scrim').classList.toggle('open');
}

// ── Login / Auth flows ──
async function doLogin() {
  const user = document.getElementById('login-user').value;
  const pass = document.getElementById('login-pass').value;
  const err = document.getElementById('login-err');
  err.style.display = 'none';
  try {
    const r = await fetch(API + '/api/auth/login', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({email:user,password:pass}) });
    const d = await r.json();
    if (!r.ok) { err.textContent = d.error || 'Login failed'; err.style.display = 'block'; return; }
    localStorage.setItem('1ai_token', d.token);
    localStorage.setItem('1ai_user', d.user.email || d.user.id);
    document.getElementById('login-view').style.display = 'none';
    document.getElementById('app').style.display = 'flex';
    document.getElementById('me').textContent = d.user.email || d.user.id;
    navigate('overview');
  } catch(e) { err.textContent = 'Network error'; err.style.display = 'block'; }
}
function doLogout() { localStorage.clear(); location.reload(); }

function showForgotPassword() {
  document.getElementById('login-form').style.display = 'none';
  document.getElementById('forgot-form').style.display = 'block';
  document.getElementById('reset-form').style.display = 'none';
}
function showLoginForm() {
  document.getElementById('login-form').style.display = 'block';
  document.getElementById('forgot-form').style.display = 'none';
  document.getElementById('reset-form').style.display = 'none';
}
function showResetForm(key) {
  document.getElementById('login-form').style.display = 'none';
  document.getElementById('forgot-form').style.display = 'none';
  document.getElementById('reset-form').style.display = 'block';
  if (key) document.getElementById('reset-key').value = key;
}

async function doForgotPassword() {
  const user = document.getElementById('forgot-user').value;
  const email = document.getElementById('forgot-email').value;
  const msg = document.getElementById('forgot-msg');
  msg.style.display = 'none';
  try {
    const r = await fetch(API + '/api/auth/forgot-password', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({username:user,email}) });
    const d = await r.json();
    if (d.key) {
      // Dev: auto-show reset form with key
      showResetForm(d.key);
    } else {
      msg.textContent = d.message || d.error || 'Check your email for reset instructions.';
      msg.style.display = 'block';
      msg.style.color = d.error ? 'var(--red)' : 'var(--green)';
    }
  } catch(e) { msg.textContent = 'Network error'; msg.style.display = 'block'; }
}

async function doResetPassword() {
  const key = document.getElementById('reset-key').value;
  const pass = document.getElementById('reset-pass').value;
  const msg = document.getElementById('reset-msg');
  const success = document.getElementById('reset-success');
  msg.style.display = 'none'; success.style.display = 'none';
  try {
    const r = await fetch(API + '/api/auth/reset-password', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({key,password:pass}) });
    const d = await r.json();
    if (!r.ok) { msg.textContent = d.error; msg.style.display = 'block'; return; }
    success.textContent = d.message;
    success.style.display = 'block';
    setTimeout(() => showLoginForm(), 2000);
  } catch(e) { msg.textContent = 'Network error'; msg.style.display = 'block'; }
}

// ── Auto-check token ──
(function() {
  const t = getToken();
  if (t) {
    document.getElementById('login-view').style.display = 'none';
    document.getElementById('app').style.display = 'flex';
    document.getElementById('me').textContent = localStorage.getItem('1ai_user') || '';
    navigate('overview');
  }
})();

// ── Page renderers ──

async function renderOverview(el) {
  try {
    const [stats, affs, earns] = await Promise.all([
      fetch(API+'/api/admin/stats', {headers:authHeaders()}).then(r=>r.json()),
      fetch(API+'/api/admin/affiliates?limit=5', {headers:authHeaders()}).then(r=>r.json()),
      fetch(API+'/api/admin/earnings?limit=5&status=pending', {headers:authHeaders()}).then(r=>r.json()),
    ]);
    el.innerHTML = `
      <div class="stat-grid">
        <div class="stat-card"><div class="label">Total Affiliates</div><div class="value">${stats.total_affiliates||0}</div></div>
        <div class="stat-card"><div class="label">Active Clicks (24h)</div><div class="value">${stats.active_clicks_24h||0}</div></div>
        <div class="stat-card"><div class="label">Pending Payout</div><div class="value">Rp ${(stats.pending_payout||0).toLocaleString()}</div></div>
        <div class="stat-card"><div class="label">Revenue MTD</div><div class="value">Rp ${(stats.revenue_mtd||0).toLocaleString()}</div></div>
      </div>
      <div class="card"><h3>Top Affiliates</h3><div class="table-wrap"><table>
        <tr><th>Name</th><th>Code</th><th>Earnings</th></tr>
        ${(affs.data||[]).map(a=>`<tr><td>${a.username||a.user_email}</td><td>${a.affiliate_code}</td><td>Rp ${(a.total_earnings||0).toLocaleString()}</td></tr>`).join('')}
      </table></div></div>
      <div class="card"><h3>Pending Approvals</h3><div class="table-wrap"><table>
        <tr><th>Affiliate</th><th>Amount</th><th>Date</th><th>Action</th></tr>
        ${(earns.data||[]).map(e=>`<tr><td>${e.user_email||e.affiliate_id}</td><td>Rp ${(e.payout_amount||0).toLocaleString()}</td><td>${new Date(e.created_at).toLocaleDateString()}</td><td><button class="btn btn-sm btn-success" onclick="approveEarning(${e.id})">Approve</button></td></tr>`).join('')}
      </table></div></div>`;
  } catch(e) { el.innerHTML = '<div class="card"><p>Failed to load overview data.</p></div>'; }
}

async function renderAffiliates(el) {
  try {
    const r = await fetch(API+'/api/admin/affiliates?limit=100', {headers:authHeaders()});
    const d = await r.json();
    el.innerHTML = `<div class="card"><div class="table-wrap"><table>
      <tr><th>Name</th><th>Code</th><th>Tier</th><th>Clicks</th><th>Conversions</th><th>Earnings</th><th>Joined</th></tr>
      ${(d.data||[]).map(a=>`<tr>
        <td>${a.username||a.user_email}</td><td><code>${a.affiliate_code}</code></td>
        <td><span class="pill pill-${{1:'indigo',2:'green',3:'yellow'}[a.tier]||'blue'}">${{1:'Starter',2:'Pro',3:'Premium'}[a.tier]||'Starter'}</span></td>
        <td>${a.clicks||0}</td><td>${a.conversions||0}</td>
        <td>Rp ${(a.total_earnings||0).toLocaleString()}</td>
        <td>${a.joined_at?new Date(a.joined_at).toLocaleDateString():'-'}</td>
      </tr>`).join('')}
    </table></div></div>`;
  } catch(e) { el.innerHTML = '<div class="card"><p>Failed to load affiliates.</p></div>'; }
}

async function renderEarnings(el) {
  try {
    const r = await fetch(API+'/api/admin/earnings?limit=100', {headers:authHeaders()});
    const d = await r.json();
    const total = (d.data||[]).reduce((s,e)=>s+(e.payout_amount||0),0);
    const pending = (d.data||[]).filter(e=>e.status==='pending').reduce((s,e)=>s+(e.payout_amount||0),0);
    el.innerHTML = `<div class="stat-grid">
      <div class="stat-card"><div class="label">Total Earnings</div><div class="value">Rp ${total.toLocaleString()}</div></div>
      <div class="stat-card"><div class="label">Pending</div><div class="value">Rp ${pending.toLocaleString()}</div></div>
      <div class="stat-card"><div class="label">Approved</div><div class="value">Rp ${(total-pending).toLocaleString()}</div></div>
    </div>
    <div class="card"><div class="table-wrap"><table>
      <tr><th>Affiliate</th><th>Payout</th><th>Status</th><th>Date</th><th>Action</th></tr>
      ${(d.data||[]).map(e=>`<tr>
        <td>${e.user_email||e.affiliate_id}</td><td>Rp ${(e.payout_amount||0).toLocaleString()}</td>
        <td><span class="pill pill-${{pending:'yellow',approved:'green',paid:'blue'}[e.status]||'blue'}">${e.status}</span></td>
        <td>${new Date(e.created_at).toLocaleDateString()}</td>
        <td>${e.status==='pending'?`<button class="btn btn-sm btn-success" onclick="approveEarning(${e.id})">Approve</button>`:'-'}</td>
      </tr>`).join('')}
    </table></div></div>`;
  } catch(e) { el.innerHTML = '<div class="card"><p>Failed to load earnings.</p></div>'; }
}

async function renderCommissions(el) {
  try {
    const r = await fetch(API+'/api/admin/commissions?limit=50', {headers:authHeaders()});
    const d = await r.json();
    el.innerHTML = `<div class="card"><div class="table-wrap"><table>
      <tr><th>Affiliate</th><th>Source</th><th>Amount</th><th>Date</th></tr>
      ${(d.data||[]).map(c=>`<tr><td>${c.affiliate_id}</td><td>${c.source||'-'}</td><td>Rp ${(c.amount||0).toLocaleString()}</td><td>${new Date(c.created_at).toLocaleDateString()}</td></tr>`).join('')}
    </table></div></div>`;
  } catch(e) { el.innerHTML = '<div class="card"><p>Failed to load commissions.</p></div>'; }
}

async function renderPayments(el) {
  try {
    const r = await fetch(API+'/api/admin/payments?limit=50', {headers:authHeaders()});
    const d = await r.json();
    el.innerHTML = `<div class="card"><div class="table-wrap"><table>
      <tr><th>Reference</th><th>User</th><th>Amount</th><th>Status</th><th>Paid</th></tr>
      ${(d.data||[]).map(p=>`<tr><td>${p.reference||p.id}</td><td>${p.user_email||p.user_id}</td><td>Rp ${(p.amount||0).toLocaleString()}</td><td><span class="pill pill-${{pending:'yellow',paid:'green',failed:'red'}[p.status]||'blue'}">${p.status}</span></td><td>${p.paid_at?new Date(p.paid_at).toLocaleDateString():'-'}</td></tr>`).join('')}
    </table></div></div>`;
  } catch(e) { el.innerHTML = '<div class="card"><p>Failed to load payments.</p></div>'; }
}

async function renderCampaigns(el) {
  try {
    const r = await fetch(API+'/api/admin/campaigns?limit=50', {headers:authHeaders()});
    const d = await r.json();
    el.innerHTML = `<div class="card"><div class="table-wrap"><table>
      <tr><th>Name</th><th>Status</th><th>Payout</th><th>Clicks</th><th>Conversions</th></tr>
      ${(d.data||[]).map(c=>`<tr><td>${c.name}</td><td><span class="pill pill-${c.active?'green':'yellow'}">${c.active?'Active':'Paused'}</span></td><td>Rp ${(c.payout_amount||0).toLocaleString()}</td><td>${c.clicks||0}</td><td>${c.conversions||0}</td></tr>`).join('')}
    </table></div></div>`;
  } catch(e) { el.innerHTML = '<div class="card"><p>Failed to load campaigns.</p></div>'; }
}

async function renderAttribution(el) {
  try {
    const r = await fetch(API+'/api/admin/stats', {headers:authHeaders()});
    const s = await r.json();
    el.innerHTML = `<div class="stat-grid">
      <div class="stat-card"><div class="label">Total Clicks</div><div class="value">${s.total_clicks||0}</div></div>
      <div class="stat-card"><div class="label">Attributed Conversions</div><div class="value">${s.attributed_conversions||0}</div></div>
      <div class="stat-card"><div class="label">Assisted Conversions</div><div class="value">${s.assisted_conversions||0}</div></div>
    </div>
    <div class="card"><p style="color:var(--text2)">Multi-touch attribution data will populate as clicks and conversions are tracked.</p></div>`;
  } catch(e) { el.innerHTML = '<div class="card"><p>Failed to load attribution data.</p></div>'; }
}

async function renderClicks(el) {
  try {
    const r = await fetch(API+'/api/admin/stats', {headers:authHeaders()});
    const s = await r.json();
    el.innerHTML = `<div class="stat-grid">
      <div class="stat-card"><div class="label">Clicks Today</div><div class="value">${s.clicks_today||s.active_clicks_24h||0}</div></div>
      <div class="stat-card"><div class="label">Unique IPs</div><div class="value">${s.unique_ips||0}</div></div>
      <div class="stat-card"><div class="label">Avg CTR</div><div class="value">${s.avg_ctr||0}%</div></div>
    </div>
    <div class="card"><p style="color:var(--text2)">Click tracking data will populate as traffic is received.</p></div>`;
  } catch(e) { el.innerHTML = '<div class="card"><p>Failed to load click data.</p></div>'; }
}

async function renderOffers(el) {
  try {
    const r = await fetch(API+'/api/admin/campaigns?limit=50', {headers:authHeaders()});
    const d = await r.json();
    el.innerHTML = `<div class="card"><div class="table-wrap"><table>
      <tr><th>Offer Name</th><th>Payout</th><th>Status</th><th>Clicks</th><th>Conversions</th></tr>
      ${(d.data||[]).map(c=>`<tr><td>${c.name}</td><td>Rp ${(c.payout_amount||0).toLocaleString()}</td><td><span class="pill pill-${c.active?'green':'yellow'}">${c.active?'Active':'Paused'}</span></td><td>${c.clicks||0}</td><td>${c.conversions||0}</td></tr>`).join('')}
    </table></div></div>`;
  } catch(e) { el.innerHTML = '<div class="card"><p>Failed to load offers.</p></div>'; }
}

async function renderReports(el) {
  try {
    const r = await fetch(API+'/api/admin/stats', {headers:authHeaders()});
    const s = await r.json();
    el.innerHTML = `<div class="stat-grid">
      <div class="stat-card"><div class="label">Total Revenue</div><div class="value">Rp ${(s.revenue_mtd||0).toLocaleString()}</div></div>
      <div class="stat-card"><div class="label">Total Clicks</div><div class="value">${s.total_clicks||0}</div></div>
      <div class="stat-card"><div class="label">Avg EPC</div><div class="value">Rp ${(s.avg_epc||0).toFixed(2)}</div></div>
    </div>
    <div class="card"><h3>Report Generator</h3>
      <div class="form-row"><div class="form-group"><label>Date Range</label><select id="report-range"><option value="7d">Last 7 Days</option><option value="30d">Last 30 Days</option><option value="90d">Last 90 Days</option><option value="mtd">Month to Date</option><option value="ytd">Year to Date</option></select></div>
      <div class="form-group"><label>Report Type</label><select id="report-type"><option value="summary">Summary</option><option value="clicks">Click Details</option><option value="conversions">Conversions</option><option value="payouts">Payouts</option></select></div></div>
      <button class="btn btn-primary btn-sm" onclick="generateReport()">Generate Report</button>
      <button class="btn btn-outline btn-sm" style="margin-left:8px" onclick="exportCSV()">Export CSV</button>
    </div>`;
  } catch(e) { el.innerHTML = '<div class="card"><p>Failed to load report data.</p></div>'; }
}

async function generateReport() { alert('Report generation coming soon'); }
async function exportCSV() { alert('CSV export coming soon'); }

async function renderUsers(el) {
  try {
    const r = await fetch(API+'/api/admin/users?limit=50', {headers:authHeaders()});
    const d = await r.json();
    el.innerHTML = `<div class="card"><div class="table-wrap"><table>
      <tr><th>Name</th><th>Email</th><th>Role</th><th>Added</th></tr>
      ${(d.data||[]).map(u=>`<tr>
        <td>${u.user_name||'-'}</td><td>${u.user_email}</td>
        <td><span class="pill pill-${u.user_role===2||u.user_role==='admin'?'indigo':'blue'}">${u.user_role===2||u.user_role==='admin'?'Admin':'User'}</span></td>
        <td>${u.user_date_added?new Date(u.user_date_added).toLocaleDateString():'-'}</td>
      </tr>`).join('')}
    </table></div></div>`;
  } catch(e) { el.innerHTML = '<div class="card"><p>Failed to load users.</p></div>'; }
}

// ── NEW: Profile & Settings ──
async function renderProfile(el) {
  try {
    const r = await fetch(API+'/api/settings/profile', {headers:authHeaders()});
    const p = await r.json();
    if (!r.ok) { el.innerHTML = '<div class="card"><p>Failed to load profile.</p></div>'; return; }
    el.innerHTML = `
      <div class="card"><h3>Account Information</h3>
        <div class="form-row"><div class="form-group"><label>Username</label><input type="text" value="${p.username||''}" disabled style="opacity:.6"></div>
        <div class="form-group"><label>Email</label><input type="email" id="prof-email" value="${p.email||''}"></div></div>
        <div class="form-row"><div class="form-group"><label>Timezone</label><select id="prof-timezone">
          ${['UTC','America/New_York','America/Chicago','America/Denver','America/Los_Angeles','Asia/Jakarta','Asia/Singapore','Asia/Tokyo','Europe/London','Europe/Berlin','Australia/Sydney'].map(tz=>`<option value="${tz}" ${p.timezone===tz?'selected':''}>${tz}</option>`).join('')}
        </select></div>
        <div class="form-group"><label>Role</label><input type="text" value="${p.role===2||p.role==='admin'?'Admin':'User'}" disabled style="opacity:.6"></div></div>
        <button class="btn btn-primary btn-sm" onclick="saveProfile()">Save Profile</button>
        <span id="profile-msg" style="margin-left:12px;font-size:13px;display:none"></span>
      </div>

      <div class="card"><h3>Change Password</h3>
        <div class="form-row"><div class="form-group"><label>Current Password</label><input type="password" id="prof-current-pass" placeholder="Enter current password"></div></div>
        <div class="form-row"><div class="form-group"><label>New Password</label><input type="password" id="prof-new-pass" placeholder="Min 6 characters"></div>
        <div class="form-group"><label>Confirm New Password</label><input type="password" id="prof-confirm-pass" placeholder="Re-enter new password"></div></div>
        <button class="btn btn-primary btn-sm" onclick="changePassword()">Change Password</button>
        <span id="password-msg" style="margin-left:12px;font-size:13px;display:none"></span>
      </div>

      <div class="card"><h3>API Key</h3>
        <p style="font-size:13px;color:var(--text2);margin-bottom:12px">Use this key to authenticate API requests.</p>
        <div style="display:flex;align-items:center;gap:12px">
          <code style="background:var(--bg);padding:8px 12px;border-radius:6px;font-size:13px;flex:1;word-break:break-all">${p.api_key || '<em style="color:var(--text2)">No API key generated</em>'}</code>
          ${p.api_key ? '<button class="btn btn-danger btn-sm" onclick="removeApiKey()">Remove</button>' : '<button class="btn btn-primary btn-sm" onclick="generateApiKey()">Generate</button>'}
        </div>
      </div>`;
  } catch(e) { el.innerHTML = '<div class="card"><p>Failed to load profile.</p></div>'; }
}

async function saveProfile() {
  const email = document.getElementById('prof-email').value;
  const timezone = document.getElementById('prof-timezone').value;
  const msg = document.getElementById('profile-msg');
  try {
    const r = await fetch(API+'/api/settings/profile', {method:'PUT', headers:authHeaders(), body:JSON.stringify({email,timezone})});
    const d = await r.json();
    msg.textContent = d.message || d.error; msg.style.display = 'inline'; msg.style.color = r.ok ? 'var(--green)' : 'var(--red)';
  } catch(e) { msg.textContent = 'Network error'; msg.style.display = 'inline'; msg.style.color = 'var(--red)'; }
}

async function changePassword() {
  const current = document.getElementById('prof-current-pass').value;
  const newPass = document.getElementById('prof-new-pass').value;
  const confirm = document.getElementById('prof-confirm-pass').value;
  const msg = document.getElementById('password-msg');
  if (newPass !== confirm) { msg.textContent = 'Passwords do not match'; msg.style.display = 'inline'; msg.style.color = 'var(--red)'; return; }
  try {
    const r = await fetch(API+'/api/auth/password', {method:'PUT', headers:authHeaders(), body:JSON.stringify({currentPassword:current,newPassword:newPass})});
    const d = await r.json();
    msg.textContent = d.message || d.error; msg.style.display = 'inline'; msg.style.color = r.ok ? 'var(--green)' : 'var(--red)';
    if (r.ok) { document.getElementById('prof-current-pass').value = ''; document.getElementById('prof-new-pass').value = ''; document.getElementById('prof-confirm-pass').value = ''; }
  } catch(e) { msg.textContent = 'Network error'; msg.style.display = 'inline'; msg.style.color = 'var(--red)'; }
}

async function generateApiKey() {
  try {
    const r = await fetch(API+'/api/settings/api-key', {method:'POST', headers:authHeaders()});
    const d = await r.json();
    if (r.ok) navigate('profile');
    else alert(d.error);
  } catch(e) { alert('Failed to generate API key'); }
}

async function removeApiKey() {
  if (!confirm('Remove your API key? Any integrations using it will stop working.')) return;
  try {
    const r = await fetch(API+'/api/settings/api-key', {method:'DELETE', headers:authHeaders()});
    if (r.ok) navigate('profile');
    else alert((await r.json()).error);
  } catch(e) { alert('Failed to remove API key'); }
}

// ── NEW: API Integrations ──
async function renderIntegrations(el) {
  try {
    const r = await fetch(API+'/api/settings/integrations', {headers:authHeaders()});
    const d = await r.json();
    if (!r.ok) { el.innerHTML = '<div class="card"><p>Failed to load integrations.</p></div>'; return; }
    const integrations = [
      { key:'cb_key', label:'ClickBank Secret Key', desc:'Used for ClickBank order verification and notifications.', value:d.cb_key },
      { key:'jvzoo_secret_key', label:'JVZoo IPN Secret', desc:'Used to verify JVZoo instant payment notifications.', value:d.jvzoo_secret_key },
      { key:'zaxaa_api_signature', label:'Zaxaa API Signature', desc:'Used to verify Zaxaa order notifications.', value:d.zaxaa_api_signature },
      { key:'ipqs_api_key', label:'IPQualityScore API Key', desc:'Used for fraud detection and IP reputation checks.', value:d.ipqs_api_key },
      { key:'slack_webhook', label:'Slack Incoming Webhook', desc:'Receive notifications for conversions, approvals, and alerts.', value:d.slack_webhook },
      { key:'clickserver_api_key', label:'ClickServer API Key', desc:'Used for click server domain management and tracking.', value:d.clickserver_api_key },
      { key:'customer_api_key', label:'License / Customer API Key', desc:'Used for premium features and license verification.', value:d.customer_api_key },
    ];
    el.innerHTML = integrations.map(i => `
      <div class="integration-card">
        <h4>${i.label}</h4>
        <div class="desc">${i.desc}</div>
        <div style="display:flex;gap:8px;align-items:center">
          <input type="password" id="int-${i.key}" value="${i.value||''}" placeholder="Enter ${i.label}" style="flex:1;padding:8px 12px;background:var(--bg);border:1px solid var(--border);border-radius:6px;color:var(--text);font-size:13px">
          <button class="btn btn-primary btn-sm" onclick="saveIntegration('${i.key}')">Save</button>
          <button class="btn btn-outline btn-sm" onclick="toggleVis('int-${i.key}')">👁</button>
        </div>
      </div>`).join('');
  } catch(e) { el.innerHTML = '<div class="card"><p>Failed to load integrations.</p></div>'; }
}

function toggleVis(id) { const el = document.getElementById(id); el.type = el.type === 'password' ? 'text' : 'password'; }

async function saveIntegration(key) {
  const value = document.getElementById('int-'+key).value;
  try {
    const r = await fetch(API+'/api/settings/integrations', {method:'PUT', headers:authHeaders(), body:JSON.stringify({key,value})});
    const d = await r.json();
    alert(r.ok ? 'Saved!' : (d.error || 'Failed'));
  } catch(e) { alert('Network error'); }
}

// ── NEW: System Admin ──
async function renderAdmin(el) {
  try {
    const [sys] = await Promise.all([fetch(API+'/api/admin/system', {headers:authHeaders()}).then(r=>r.json())]);
    const s = sys.data || sys;
    el.innerHTML = `
      <div class="card"><h3>System Information</h3>
        <table><tr><td style="color:var(--text2);width:200px">Application</td><td>1AI Affiliate Tracker</td></tr>
        <tr><td style="color:var(--text2)">Version</td><td>${s.version||'1.9.59'}</td></tr>
        <tr><td style="color:var(--text2)">PHP Version</td><td>${s.php_version||'—'}</td></tr>
        <tr><td style="color:var(--text2)">MySQL Version</td><td>${s.mysql_version||'—'}</td></tr>
        <tr><td style="color:var(--text2)">Node.js Version</td><td>${s.node_version||'—'}</td></tr>
        <tr><td style="color:var(--text2)">Total Clicks</td><td>${s.total_clicks||0}</td></tr></table>
      </div>

      <div class="card"><h3>Data Engine Queue</h3>
        <table><tr><td style="color:var(--text2);width:200px">Total Jobs</td><td>${s.dataengine_total||0}</td></tr>
        <tr><td style="color:var(--text2)">Completed</td><td>${s.dataengine_done||0}</td></tr>
        <tr><td style="color:var(--text2)">Pending</td><td>${(s.dataengine_total||0)-(s.dataengine_done||0)}</td></tr></table>
      </div>

      <div class="card"><h3>GeoIP Database</h3>
        <table>
        <tr><td style="color:var(--text2);width:200px">Country Database</td><td>${s.geoip_country||'Not found'}</td></tr>
        <tr><td style="color:var(--text2)">ASN Database</td><td>${s.geoip_asn||'Not found'}</td></tr>
        <tr><td style="color:var(--text2)">ISP Lookup</td><td><span class="pill pill-${s.isp_enabled?'green':'yellow'}">${s.isp_enabled?'Enabled':'Disabled'}</span></td></tr></table>
      </div>

      <div class="card"><h3>Login Attempts (Last 50)</h3>
        <p style="color:var(--text2);font-size:13px">Recent login activity will be displayed here.</p>
      </div>

      <div class="card"><h3>Database Optimization</h3>
        <p style="color:var(--text2);font-size:13px">Automatic database optimization can be scheduled from this panel.</p>
      </div>`;
  } catch(e) { el.innerHTML = '<div class="card"><p>Failed to load system information.</p></div>'; }
}

// ── NEW: Click Servers ──
async function renderClickServers(el) {
  try {
    const r = await fetch(API+'/api/admin/clickservers', {headers:authHeaders()});
    if (!r.ok) { el.innerHTML = '<div class="card"><p>Failed to load click servers. Ensure ClickServer API key is configured in Integrations.</p></div>'; return; }
    const d = await r.json();
    el.innerHTML = `<div class="card"><h3>Click Server Domains</h3>
      <p style="color:var(--text2);font-size:13px;margin-bottom:16px">Manage your tracking domains and click server configuration.</p>
      <div class="table-wrap"><table>
        <tr><th>Domain</th><th>Status</th><th>Actions</th></tr>
        ${(d.domains||[]).map(dm=>`<tr><td>${dm.domain||dm.name}</td><td><span class="pill pill-${dm.active?'green':'red'}">${dm.active?'Active':'Inactive'}</span></td><td><button class="btn btn-outline btn-sm" onclick="toggleDomain('${dm.domain||dm.name}',${!dm.active})">${dm.active?'Deactivate':'Activate'}</button></td></tr>`).join('')}
        ${(!d.domains||d.domains.length===0)?'<tr><td colspan="3" style="color:var(--text2)">No domains configured</td></tr>':''}
      </table></div>
      <div style="margin-top:16px;font-size:13px;color:var(--text2)">
        <p>Licenses: ${d.domains_used||0} / ${d.domains_available||0} used</p>
        <div style="background:var(--bg);border-radius:4px;height:8px;margin-top:8px;overflow:hidden"><div style="background:var(--indigo);height:100%;width:${d.domains_available?((d.domains_used/d.domains_available)*100):0}%;border-radius:4px"></div></div>
      </div>
    </div>`;
  } catch(e) { el.innerHTML = '<div class="card"><p>Failed to load click servers.</p></div>'; }
}

async function toggleDomain(domain, activate) {
  try {
    const r = await fetch(API+'/api/admin/clickservers/toggle', {method:'POST', headers:authHeaders(), body:JSON.stringify({domain,activate})});
    if (r.ok) navigate('clickservers'); else alert((await r.json()).error||'Failed');
  } catch(e) { alert('Network error'); }
}

// ── NEW: Documentation ──
async function renderDocs(el) {
  try {
    const r = await fetch(API+'/api/docs', {headers:authHeaders()});
    const d = await r.json();
    const docs = d.docs || [];
    el.innerHTML = `<div class="card"><h3>Documentation</h3>
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:12px;margin-top:12px">
        ${docs.map(doc=>`<div style="background:var(--panel2);border:1px solid var(--border);border-radius:8px;padding:16px;cursor:pointer" onclick="showDoc('${doc.slug}')">
          <div style="font-size:13px;font-weight:600">${doc.title}</div>
          <div style="font-size:11px;color:var(--text2);margin-top:4px">${doc.category}</div>
        </div>`).join('')}
      </div>
    </div>
    <div id="doc-content"></div>`;
  } catch(e) { el.innerHTML = '<div class="card"><p>Failed to load documentation.</p></div>'; }
}

async function showDoc(slug) {
  try {
    const r = await fetch(API+'/api/docs/'+slug, {headers:authHeaders()});
    const d = await r.json();
    if (!r.ok) { alert(d.error); return; }
    const el = document.getElementById('doc-content');
    // Simple markdown → HTML conversion
    let html = d.content
      .replace(/^### (.+)$/gm, '<h3>$1</h3>')
      .replace(/^## (.+)$/gm, '<h2>$1</h2>')
      .replace(/^# (.+)$/gm, '<h1>$1</h1>')
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      .replace(/`(.+?)`/g, '<code>$1</code>')
      .replace(/\n\n/g, '</p><p>')
      .replace(/\n/g, '<br>');
    el.innerHTML = `<div class="card"><h3>${d.title}</h3><div class="doc-content"><p>${html}</p></div>
      <button class="btn btn-outline btn-sm" style="margin-top:16px" onclick="document.getElementById('doc-content').innerHTML=''">← Back to docs</button></div>`;
  } catch(e) { alert('Failed to load document'); }
}

// ── NEW: Help & Support ──
async function renderHelp(el) {
  el.innerHTML = `<div class="card"><h3>Help & Support</h3>
    <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(250px,1fr));gap:16px;margin-top:16px">
      <a class="link" onclick="navigate('docs')" style="background:var(--panel2);border:1px solid var(--border);border-radius:8px;padding:20px;display:block;text-decoration:none;color:var(--text)">
        <h4 style="margin-bottom:8px">📖 Documentation</h4>
        <p style="font-size:13px;color:var(--text2)">Guides, tutorials, and API reference</p>
      </a>
      <a href="https://github.com/tracking202/prosper202" target="_blank" style="background:var(--panel2);border:1px solid var(--border);border-radius:8px;padding:20px;display:block;text-decoration:none;color:var(--text)">
        <h4 style="margin-bottom:8px">🐙 GitHub</h4>
        <p style="font-size:13px;color:var(--text2)">Source code and issue tracker</p>
      </a>
      <a onclick="navigate('docs')" class="link" style="background:var(--panel2);border:1px solid var(--border);border-radius:8px;padding:20px;display:block;cursor:pointer;text-decoration:none;color:var(--text)">
        <h4 style="margin-bottom:8px">📊 Attribution Guide</h4>
        <p style="font-size:13px;color:var(--text2)">Multi-touch attribution engine guide</p>
      </a>
      <a onclick="navigate('docs')" class="link" style="background:var(--panel2);border:1px solid var(--border);border-radius:8px;padding:20px;display:block;cursor:pointer;text-decoration:none;color:var(--text)">
        <h4 style="margin-bottom:8px">🔗 API Integrations</h4>
        <p style="font-size:13px;color:var(--text2)">Third-party integration setup guides</p>
      </a>
    </div>
  </div>

  <div class="card"><h3>API Reference</h3>
    <p style="font-size:13px;color:var(--text2)">Full API documentation with interactive testing available at:</p>
    <a href="/api-docs" target="_blank" class="link" style="font-size:14px;margin-top:8px;display:block">/api-docs — Swagger UI</a>
  </div>

  <div class="card"><h3>GeoIP Lookup</h3>
    <p style="font-size:13px;color:var(--text2)">Test IP geolocation:</p>
    <div style="display:flex;gap:8px;margin-top:8px">
      <input type="text" id="geoip-input" placeholder="8.8.8.8" style="flex:1;padding:8px 12px;background:var(--bg);border:1px solid var(--border);border-radius:6px;color:var(--text)">
      <button class="btn btn-primary btn-sm" onclick="lookupGeoIP()">Lookup</button>
    </div>
    <div id="geoip-result" style="margin-top:12px"></div>
  </div>`;
}

async function lookupGeoIP() {
  const ip = document.getElementById('geoip-input').value.trim();
  if (!ip) return;
  try {
    const r = await fetch(API+'/api/geo/'+ip, {headers:authHeaders()});
    const d = await r.json();
    document.getElementById('geoip-result').innerHTML = r.ok
      ? `<div style="background:var(--panel2);border-radius:8px;padding:12px;font-size:13px">
          <div><strong>IP:</strong> ${d.ip}</div>
          <div><strong>Country:</strong> ${d.country||'—'} (${d.country_code||'—'})</div>
          <div><strong>Continent:</strong> ${d.continent||'—'}</div>
          <div><strong>ISP:</strong> ${d.isp||'—'} ${d.asn_number?'(AS'+d.asn_number+')':''}</div>
        </div>`
      : `<div style="color:var(--red)">${d.error}</div>`;
  } catch(e) { document.getElementById('geoip-result').innerHTML = '<div style="color:var(--red)">Network error</div>'; }
}

// ── NEW: VIP Perks ──
async function renderVipPerks(el) {
  try {
    const r = await fetch(API+'/api/settings/profile', {headers:authHeaders()});
    const p = await r.json();
    el.innerHTML = `<div class="card"><h3>VIP Perks Profile</h3>
      <p style="font-size:13px;color:var(--text2);margin-bottom:16px">Complete your profile to unlock exclusive offers, enhanced payouts, and premium support.</p>
      <div style="background:var(--panel2);border-radius:8px;padding:16px;margin-bottom:16px">
        <div style="font-size:14px;font-weight:600;margin-bottom:8px">Current Status</div>
        <span class="pill pill-${p.vip_perks_status?'green':'yellow'}">${p.vip_perks_status?'Completed':'Pending'}</span>
      </div>
      <div class="form-group"><label>Monthly Traffic Volume</label>
        <select id="vip-traffic"><option value="">Select your range</option><option value="0-10k">0 - 10,000 clicks/month</option><option value="10k-50k">10,000 - 50,000 clicks/month</option><option value="50k-250k">50,000 - 250,000 clicks/month</option><option value="250k+">250,000+ clicks/month</option></select>
      </div>
      <div class="form-group"><label>Primary Verticals</label>
        <select id="vip-vertical"><option value="">Select primary vertical</option><option value="ecommerce">E-Commerce</option><option value="finance">Finance / Crypto</option><option value="health">Health / Fitness</option><option value="gaming">Gaming</option><option value="education">Education</option><option value="other">Other</option></select>
      </div>
      <div class="form-group"><label>Preferred Payout Method</label>
        <select id="vip-payout"><option value="">Select payout method</option><option value="wire">Wire Transfer</option><option value="crypto">Cryptocurrency</option><option value="paypal">PayPal</option><option value="wise">Wise</option></select>
      </div>
      <button class="btn btn-primary btn-sm" onclick="submitVipPerks()">Submit VIP Profile</button>
    </div>`;
  } catch(e) { el.innerHTML = '<div class="card"><p>Failed to load VIP Perks.</p></div>'; }
}

async function submitVipPerks() {
  alert('VIP Perks profile saved! Our team will review and upgrade your account.');
}

// ── Approve earning (shared) ──
async function approveEarning(id) {
  if (!confirm('Approve this earning?')) return;
  try {
    const r = await fetch(API+'/api/admin/earnings/'+id+'/approve', {method:'POST', headers:authHeaders()});
    if (r.ok) navigate(currentPage); else alert((await r.json()).error);
  } catch(e) { alert('Failed to approve'); }
}