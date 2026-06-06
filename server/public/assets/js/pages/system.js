/** Profile, Integrations, Admin, ClickServers, Docs, Help, VIP Perks */
window.PageRenderers = window.PageRenderers || {};

PageRenderers.profile = async function(el) {
  try {
    const p = await API.get('/api/settings/profile');
    el.innerHTML = `${DOM.pageHeader('Profile & Settings', 'Account management')}
      <div class="card"><h3>Account Information</h3>
        <div class="form-row">
          <div class="form-group"><label>Username</label><input value="${p.username||''}" disabled style="opacity:.6"></div>
          <div class="form-group"><label>Email</label><input id="prof-email" value="${p.email||''}"></div>
        </div>
        <div class="form-row">
          <div class="form-group"><label>Timezone</label><select id="prof-tz">
            ${['UTC','America/New_York','Asia/Jakarta','Asia/Singapore','Asia/Tokyo','Europe/London'].map(tz => `<option ${p.timezone===tz?'selected':''}>${tz}</option>`).join('')}
          </select></div>
          <div class="form-group"><label>Role</label><input value="${p.role===2||p.role==='admin'?'Admin':'User'}" disabled style="opacity:.6"></div>
        </div>
        <button class="btn btn-primary btn-sm" onclick="Settings.saveProfile()">Save Profile</button>
        <span id="prof-msg"></span>
      </div>
      <div class="card"><h3>Change Password</h3>
        <div class="form-row">
          <div class="form-group"><label>Current</label><input type="password" id="prof-current-pass"></div>
        </div>
        <div class="form-row">
          <div class="form-group"><label>New</label><input type="password" id="prof-new-pass" placeholder="6+ chars"></div>
          <div class="form-group"><label>Confirm</label><input type="password" id="prof-confirm-pass"></div>
        </div>
        <button class="btn btn-primary btn-sm" onclick="Settings.changePassword()">Change Password</button>
        <span id="pw-msg"></span>
      </div>
      <div class="card"><h3>REST API Key</h3>
        ${p.api_key
          ? `<div style="display:flex;gap:12px;align-items:center"><code style="flex:1;background:var(--bg);padding:8px 12px;border-radius:6px;word-break:break-all;font-size:13px">${p.api_key.slice(0,8)}${'•'.repeat(24)}</code><button class="btn btn-danger btn-sm" onclick="Settings.removeApiKey()">Remove</button></div>`
          : `<div style="display:flex;gap:12px;align-items:center"><code style="flex:1;background:var(--bg);padding:8px 12px;border-radius:6px;color:var(--text2);font-size:13px">Not configured</code><button class="btn btn-primary btn-sm" onclick="Settings.generateApiKey()">Generate</button></div>`}
      </div>`;
  } catch(e) { el.innerHTML = '<div class="card"><p>Unable to load profile.</p></div>'; }
};

window.Settings = {
  saveProfile: async () => {
    const el = document.getElementById('prof-msg');
    try {
      await API.put('/api/settings/profile', { email: document.getElementById('prof-email').value, timezone: document.getElementById('prof-tz').value });
      el.innerHTML = DOM.msg('ok', 'Saved');
    } catch(e) { el.innerHTML = DOM.msg('err', e.message); }
  },
  changePassword: async () => {
    const el = document.getElementById('pw-msg');
    const np = document.getElementById('prof-new-pass').value;
    if (np !== document.getElementById('prof-confirm-pass').value) { el.innerHTML = DOM.msg('err','Passwords do not match'); return; }
    try {
      await API.put('/api/auth/password', { currentPassword: document.getElementById('prof-current-pass').value, newPassword: np });
      document.getElementById('prof-current-pass').value = document.getElementById('prof-new-pass').value = document.getElementById('prof-confirm-pass').value = '';
      el.innerHTML = DOM.msg('ok','Password changed');
    } catch(e) { el.innerHTML = DOM.msg('err', e.message); }
  },
  generateApiKey: async () => { try { await API.post('/api/settings/api-key'); Router.navigate('profile'); AppUI.toast('API key generated'); } catch(e) { AppUI.toast(e.message, 'err'); } },
  removeApiKey: async () => {
    const ok = await AppUI.confirm({ title: 'Remove API key', message: 'This will invalidate the current key. Any integrations using it will stop working.', confirmText: 'Remove', danger: true });
    if (!ok) return;
    try { await API.del('/api/settings/api-key'); Router.navigate('profile'); AppUI.toast('API key removed'); } catch(e) { AppUI.toast(e.message, 'err'); }
  },
};

PageRenderers.integrations = async function(el) {
  try {
    const d = await API.get('/api/settings/integrations');
    const items = [
      { key:'cb_key', label:'ClickBank Secret Key', desc:'Order verification and IPN validation' },
      { key:'jvzoo_secret_key', label:'JVZoo IPN Secret', desc:'Instant payment notification verification' },
      { key:'zaxaa_api_signature', label:'Zaxaa API Signature', desc:'Order notification signature verification' },
      { key:'ipqs_api_key', label:'IPQualityScore API Key', desc:'Fraud detection and IP reputation' },
      { key:'slack_webhook', label:'Slack Incoming Webhook', desc:'Notification alerts for conversions and approvals' },
      { key:'clickserver_api_key', label:'ClickServer API Key', desc:'Domain management and click tracking' },
      { key:'customer_api_key', label:'License / Customer API Key', desc:'Premium features and license verification' },
    ];
    el.innerHTML = `${DOM.pageHeader('API Integrations', 'Third-party connections and keys')}
      ${items.map(i => `
        <div class="integration-card">
          <h4>${i.label}</h4><div class="desc">${i.desc}</div>
          <div style="display:flex;gap:8px;align-items:center">
            <input type="password" id="int-${i.key}" value="${d[i.key]||''}" placeholder="Enter key" style="flex:1;padding:8px 12px;background:var(--bg);border:1px solid var(--border);border-radius:6px;color:var(--text);font-size:13px">
            <button class="btn btn-primary btn-sm" onclick="Settings.saveIntegration('${i.key}')">Save</button>
            <button class="btn btn-outline btn-sm" onclick="Settings.toggleVis('int-${i.key}')">Show</button>
          </div>
        </div>`).join('')}`;
  } catch(e) { el.innerHTML = '<div class="card"><p>Unable to load integrations.</p></div>'; }
};
Settings.saveIntegration = async (key) => { try { await API.put('/api/settings/integrations',{key,value:document.getElementById('int-'+key).value}); AppUI.toast('Saved'); } catch(e) { AppUI.toast(e.message, 'err'); } };
Settings.toggleVis = (id) => { const e = document.getElementById(id); e.type = e.type==='password'?'text':'password'; const btn = e.nextElementSibling.nextElementSibling; btn.textContent = e.type==='password'?'Show':'Hide'; };

PageRenderers.admin = async function(el) {
  try {
    const s = await API.get('/api/admin/system');
    const items = s.data || s;
    const cronTs = items.cron && items.cron.last_execution;
    el.innerHTML = `${DOM.pageHeader('System Admin', 'Server status and maintenance')}
      <div class="card"><h3>System Info</h3>
        <table><tr><td style="color:var(--text2);width:180px">Application</td><td><strong>1AI Affiliate Tracker</strong></td></tr>
        <tr><td style="color:var(--text2)">DB Version</td><td>${items.version||'Unavailable'}</td></tr>
        <tr><td style="color:var(--text2)">PHP</td><td>${items.php_version||'Unavailable'}</td></tr>
        <tr><td style="color:var(--text2)">MySQL</td><td>${items.mysql_version||'Unavailable'}</td></tr>
        <tr><td style="color:var(--text2)">Node.js</td><td>${items.node_version||'Unavailable'}</td></tr>
        <tr><td style="color:var(--text2)">Total Clicks</td><td>${(items.total_clicks||0).toLocaleString()}</td></tr>
        <tr><td style="color:var(--text2)">Cron Last Run</td><td>${cronTs ? new Date(cronTs * 1000).toLocaleString() : 'Never'}</td></tr></table>
      </div>
      <div class="card"><h3>Data Engine Queue</h3>
        <div style="display:flex;align-items:center;gap:12px;margin-bottom:12px">
          <div style="flex:1;background:var(--bg);border-radius:4px;height:8px;overflow:hidden">
            <div style="height:100%;background:var(--indigo);width:${items.dataengine_progress||0}%;transition:width .3s"></div>
          </div>
          <span style="font-size:13px;font-weight:600">${items.dataengine_progress||0}%</span>
        </div>
        <table><tr><td style="color:var(--text2);width:180px">Total Jobs</td><td>${items.dataengine_total||0}</td></tr>
        <tr><td style="color:var(--text2)">Completed</td><td>${items.dataengine_done||0}</td></tr></table>
      </div>
      <div class="card"><h3>GeoIP Database <span style="color:var(--text2);font-size:12px;font-weight:normal">(Loyalsoldier/geoip)</span></h3>
        <table>
          <tr><td style="color:var(--text2);width:180px">Country Database</td><td>${DOM.pill(items.geoip_country||'Not found', items.geoip_country?'green':'red')}</td></tr>
          <tr><td style="color:var(--text2)">ASN Database</td><td>${DOM.pill(items.geoip_asn||'Not found', items.geoip_asn?'green':'red')}</td></tr>
          <tr><td style="color:var(--text2)">ISP Lookup</td><td>${DOM.pill(items.isp_enabled?'Enabled':'Disabled', items.isp_enabled?'green':'yellow')}</td></tr>
        </table>
      </div>`;
  } catch(e) { el.innerHTML = '<div class="card"><p>Unable to load system information.</p></div>'; }
};

PageRenderers.clickservers = async function(el) {
  try {
    const d = await API.get('/api/admin/clickservers');
    el.innerHTML = `${DOM.pageHeader('Click Servers', 'Domain management & license')}
      ${d.configured
        ? `<div class="card">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
              <h3>Registered Domains (${d.domains_used})</h3>
            </div>
            <div style="display:flex;gap:8px;margin-bottom:16px">
              <input id="new-domain" placeholder="track.yourdomain.com" style="flex:1;padding:8px 12px;background:var(--bg);border:1px solid var(--border);border-radius:6px;color:var(--text)">
              <button class="btn btn-primary btn-sm" onclick="Settings.addClickServer()">Add Domain</button>
            </div>
          ${d.domains.length
            ? DOM.table(['Domain','Status','Created'], d.domains.map(dm => [dm.domain, DOM.pill(dm.status||'active', dm.status==='active'?'green':'yellow'), new Date(dm.created_at*1000).toLocaleDateString()]))
            : '<p style="color:var(--text2);font-size:13px">No domains registered yet. Domains managed via ClickServer API will appear here.</p>'}
          <p style="color:var(--text2);font-size:12px;margin-top:12px">${d.message}</p></div>`
        : `<div class="card"><p style="color:var(--text2);font-size:13px">ClickServer domain management requires a valid ClickServer API key. Configure it in the <a class="link" onclick="Router.navigate('integrations')">Integrations</a> page, then domains will appear here.</p></div>`}
      <div class="card"><h3>How ClickServers Work</h3>
        <div style="color:var(--text2);font-size:13px;line-height:1.7">
          <p>ClickServers handle redirect and tracking URLs. Each domain points to your tracker and records clicks, conversions, and attribution data.</p>
          <p>Register domains via the ClickServer API and manage them from this dashboard.</p>
        </div>
      </div>`;
  } catch(e) { el.innerHTML = '<div class="card"><p>Unable to load ClickServer data.</p></div>'; }
};

Settings.addClickServer = async () => {
  const domain = document.getElementById('new-domain').value.trim();
  if (!domain) return;
  try {
    await API.post('/api/admin/clickservers', { domain });
    AppUI.toast('Domain added successfully');
    Router.navigate('clickservers');
  } catch (err) {
    AppUI.toast(err.message, 'err');
  }
};

PageRenderers.docs = async function(el) {
  try {
    const d = await API.get('/api/docs');
    el.innerHTML = `${DOM.pageHeader('Documentation', 'Guides, tutorials, and API reference')}
      <div class="card"><h3>All Documents (${(d.docs||[]).length})</h3>
        <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:12px;margin-top:12px">
          ${(d.docs||[]).map(doc => `<div style="background:var(--panel2);border:1px solid var(--border);border-radius:8px;padding:16px;cursor:pointer" onclick="Settings.showDoc('${doc.slug}')">
            <div style="font-size:13px;font-weight:600">${doc.title}</div>
            <div style="font-size:11px;color:var(--text2);margin-top:4px">${doc.category}</div>
          </div>`).join('')}
        </div>
      </div>
      <div id="doc-viewer"></div>`;
  } catch(e) { el.innerHTML = '<div class="card"><p>Unable to load documentation.</p></div>'; }
};
Settings.showDoc = async (slug) => {
  const data = await API.get('/api/docs/'+slug);
  let html = data.content
    .replace(/^### (.+)$/gm,'<h3>$1</h3>').replace(/^## (.+)$/gm,'<h2>$1</h2>').replace(/^# (.+)$/gm,'<h1>$1</h1>')
    .replace(/\*\*(.+?)\*\*/g,'<strong>$1</strong>').replace(/\*(.+?)\*/g,'<em>$1</em>').replace(/`([^`]+)`/g,'<code>$1</code>')
    .replace(/((?:<h[1-3]>[^<]+<\/h[1-3]>)+)/g, '\n$1\n')
    .replace(/\n{2,}/g,'</p><p>').replace(/\n/g,'<br>');
  document.getElementById('doc-viewer').innerHTML = `<div class="card" style="margin-top:16px"><h3>${data.title}</h3><div class="doc-content"><p>${html}</p></div>
    <button class="btn btn-outline btn-sm" style="margin-top:16px" onclick="document.getElementById('doc-viewer').innerHTML=''">← Back</button></div>`;
};

PageRenderers.help = async function(el) {
  el.innerHTML = `${DOM.pageHeader('Help & Support', 'Resources and tools')}
    <div class="card"><h3>Quick Links</h3>
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(250px,1fr));gap:16px;margin-top:12px">
        ${[
          ['/api-docs','API Documentation','Interactive Swagger UI for all endpoints',true],
          ['docs','Tutorials & Guides','Attribution, integrations, setup',false],
          ['admin','System Status','Cron jobs, GeoIP, DB status',false],
          ['https://github.com/Loyalsoldier/geoip','GeoIP Data','Free weekly database updates',true],
        ].map(([href,title,desc,ext]) =>
          ext
            ? `<a href="${href}" target="_blank" style="background:var(--panel2);border:1px solid var(--border);border-radius:8px;padding:20px;display:block;text-decoration:none;color:var(--text);cursor:pointer">
                <h4 style="margin-bottom:8px">${title}</h4>
                <p style="font-size:13px;color:var(--text2)">${desc}</p>
              </a>`
            : `<div onclick="Router.navigate('${href}')" style="background:var(--panel2);border:1px solid var(--border);border-radius:8px;padding:20px;display:block;cursor:pointer">
                <h4 style="margin-bottom:8px">${title}</h4>
                <p style="font-size:13px;color:var(--text2)">${desc}</p>
              </div>`
        ).join('')}
      </div>
    </div>
    <div class="card"><h3>GeoIP Lookup</h3>
      <p style="color:var(--text2);font-size:13px;margin-bottom:8px">Test IP geolocation using Loyalsoldier/geoip</p>
      <div style="display:flex;gap:8px">
        <input id="geo-lookup-ip" placeholder="8.8.8.8" style="flex:1;padding:8px 12px;background:var(--bg);border:1px solid var(--border);border-radius:6px;color:var(--text)">
        <button class="btn btn-primary btn-sm" onclick="Settings.lookupGeoIP()">Lookup</button>
      </div>
      <div id="geo-result" style="margin-top:12px"></div>
    </div>`;
};
Settings.lookupGeoIP = async () => {
  const ip = document.getElementById('geo-lookup-ip').value.trim();
  if (!ip) return;
  try {
    const d = await API.get('/api/geo/'+ip);
    document.getElementById('geo-result').innerHTML = `<div style="background:var(--panel2);border-radius:8px;padding:12px;font-size:13px">
      <div><strong>IP:</strong> ${d.ip}</div><div><strong>Country:</strong> ${d.country||'—'} (${d.country_code||'—'})</div>
      <div><strong>Continent:</strong> ${d.continent||'—'}</div><div><strong>ISP:</strong> ${d.isp||'—'} ${d.asn_number?'(AS'+d.asn_number+')':''}</div>
    </div>`;
  } catch(e) { document.getElementById('geo-result').innerHTML = `<div style="color:var(--red);font-size:13px">${e.message}</div>`; }
};

PageRenderers.vipperks = async function(el) {
  try {
    const p = await API.get('/api/admin/vip');
    el.innerHTML = `${DOM.pageHeader('VIP Perks', 'Exclusive offers and enhanced payouts')}
      <div class="card"><h3>VIP Perks Profile</h3>
        <p style="color:var(--text2);font-size:13px;margin-bottom:16px">Complete your profile to unlock exclusive offers, enhanced payouts, and premium support from top affiliate networks.</p>
        <div class="form-row">
          <div class="form-group"><label>Monthly Traffic</label>
            <select id="vip-traffic">${['0 - 10,000','10,000 - 50,000','50,000 - 250,000','250,000+'].map(o => `<option ${p.monthly_traffic===o?'selected':''}>${o}</option>`).join('')}</select>
          </div>
          <div class="form-group"><label>Primary Vertical</label>
            <select id="vip-vertical">${['E-Commerce','Finance / Crypto','Health / Fitness','Gaming','Education','Other'].map(o => `<option ${p.primary_vertical===o?'selected':''}>${o}</option>`).join('')}</select>
          </div>
        </div>
        <div class="form-group"><label>Preferred Payout</label>
          <select id="vip-payout">${['Wire Transfer','Cryptocurrency','PayPal','Wise'].map(o => `<option ${p.preferred_payout===o?'selected':''}>${o}</option>`).join('')}</select>
        </div>
        <button class="btn btn-primary btn-sm" onclick="Settings.saveVipProfile()">${p.status==='submitted'?'Update VIP Profile':'Submit VIP Profile'}</button>
        ${p.updated_at ? `<span style="font-size:11px;color:var(--text2);margin-left:8px">Last updated: ${new Date(p.updated_at*1000).toLocaleDateString()}</span>` : ''}
        <span id="vip-msg" style="display:inline-block;margin-left:8px"></span>
      </div>`;
  } catch(e) { el.innerHTML = '<div class="card"><p>Unable to load VIP Perks.</p></div>'; }
};

Settings.saveVipProfile = async () => {
  const el = document.getElementById('vip-msg');
  try {
    await API.put('/api/admin/vip', {
      monthly_traffic: document.getElementById('vip-traffic').value,
      primary_vertical: document.getElementById('vip-vertical').value,
      preferred_payout: document.getElementById('vip-payout').value,
    });
    AppUI.toast('VIP profile submitted');
    Router.navigate('vipperks');
  } catch(e) { AppUI.toast(e.message, 'err'); }
};