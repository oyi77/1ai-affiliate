window.PageRenderers = window.PageRenderers || {};

/**
 * All-in-One Settings Page with Tabbed UI
 * Consolidates: Profile, Integrations, Notifications, Domains, Automation, Security
 */
PageRenderers['settings'] = async function(el) {
  const tab = window._settingsTab || 'profile';

  el.innerHTML = `
    ${DOM.pageHeader('Settings', 'Manage your account, integrations, and platform configuration')}
    <div style="display:flex;gap:8px;margin-bottom:24px;flex-wrap:wrap;border-bottom:1px solid var(--border);padding-bottom:16px;">
      ${[
        ['profile', '👤 Profile'],
        ['integrations', '🔗 Integrations'],
        ['notifications', '🔔 Notifications'],
        ['domains', '🌐 Domains'],
        ['automation', '⚙️ Automation'],
        ['security', '🛡️ Security'],
        ['advanced', '🔧 Advanced'],
      ].map(([key, label]) =>
        `<button class="btn btn-sm ${tab === key ? 'btn-primary' : 'btn-outline'}" onclick="window._settingsTab='${key}';Router.navigate('settings')">${label}</button>`
      ).join('')}
    </div>
    <div id="settings-content"><div class="skeleton" style="height:200px;"></div></div>
  `;

  const container = document.getElementById('settings-content');
  const renderer = SettingsTabs[tab];
  if (renderer) await renderer(container);
};

const SettingsTabs = {};

// ═══════════════════════════════════════════════
// TAB 1: Profile
// ═══════════════════════════════════════════════
SettingsTabs['profile'] = async function(container) {
  try {
    const p = await API.get('/api/settings/profile');
    container.innerHTML = `
      <div class="card">
        <h3>Account Information</h3>
        <div class="form-row" style="margin-top:16px;">
          <div class="form-group"><label>Username</label><input type="text" id="set-username" value="${p.user_name || ''}" readonly style="opacity:0.6;"></div>
          <div class="form-group"><label>Email</label><input type="email" id="set-email" value="${p.user_email || ''}"></div>
        </div>
        <div class="form-row">
          <div class="form-group"><label>Role</label><input type="text" value="${p.user_role || 'admin'}" readonly style="opacity:0.6;"></div>
          <div class="form-group"><label>Affiliate Code</label><input type="text" value="${p.affiliate_code || 'N/A'}" readonly style="opacity:0.6;"></div>
        </div>
        <button class="btn btn-primary" onclick="Settings.saveProfile()">Save Profile</button>
      </div>
      <div class="card">
        <h3>Change Password</h3>
        <div class="form-row" style="margin-top:16px;">
          <div class="form-group"><label>Current Password</label><input type="password" id="set-pass-current" placeholder="Current password"></div>
          <div class="form-group"><label>New Password</label><input type="password" id="set-pass-new" placeholder="New password (min 6 chars)"></div>
        </div>
        <button class="btn btn-outline" onclick="Settings.changePassword()">Update Password</button>
      </div>
      <div class="card">
        <h3>API Key</h3>
        <p style="color:var(--text2);font-size:13px;margin-bottom:12px;">Use this key for V3 API access and postback authentication.</p>
        <div style="display:flex;gap:8px;align-items:center;">
          <input type="text" id="set-apikey" value="${p.api_key || 'No API key generated'}" readonly style="flex:1;padding:8px 12px;background:rgba(0,0,0,0.2);border:1px solid var(--border);border-radius:6px;color:var(--text);font-size:13px;font-family:monospace;">
          <button class="btn btn-outline btn-sm" onclick="navigator.clipboard.writeText(document.getElementById('set-apikey').value);AppUI.toast('Copied!')">Copy</button>
          <button class="btn btn-outline btn-sm" onclick="Settings.regenerateApiKey()">Regenerate</button>
        </div>
      </div>`;
  } catch(e) { container.innerHTML = '<div class="card"><p>Unable to load profile.</p></div>'; }
};

Settings.saveProfile = async function() {
  try {
    await API.put('/api/settings/profile', { email: document.getElementById('set-email').value });
    AppUI.toast('Profile saved');
  } catch(e) { AppUI.toast(e.message, 'err'); }
};

Settings.changePassword = async function() {
  try {
    const current = document.getElementById('set-pass-current').value;
    const newPass = document.getElementById('set-pass-new').value;
    if (!current || !newPass) return AppUI.toast('Fill both fields', 'err');
    if (newPass.length < 6) return AppUI.toast('Min 6 characters', 'err');
    await API.put('/api/auth/password', { current_password: current, new_password: newPass });
    AppUI.toast('Password changed');
    document.getElementById('set-pass-current').value = '';
    document.getElementById('set-pass-new').value = '';
  } catch(e) { AppUI.toast(e.message, 'err'); }
};

Settings.regenerateApiKey = async function() {
  try {
    const r = await API.post('/api/settings/api-key', {});
    document.getElementById('set-apikey').value = r.api_key || r.key || '';
    AppUI.toast('API key regenerated');
  } catch(e) { AppUI.toast(e.message, 'err'); }
};

// ═══════════════════════════════════════════════
// TAB 2: Integrations (DYNAMIC from DB)
// ═══════════════════════════════════════════════
SettingsTabs['integrations'] = async function(container) {
  try {
    const [feat, integrations] = await Promise.all([
      API.get('/api/settings/features').catch(() => ({ data: {} })),
      API.get('/api/settings/integrations').catch(() => ({}))
    ]);
    const featureData = feat.data || {};

    // Dynamic feature list
    const features = [
      { key: 'meta_shopee', label: 'Meta × Shopee Automation', icon: '🔗', desc: 'Auto-pause, auto-scale, campaign mapping, Shopee CSV upload, Meta spend sync.', requirement: 'Requires Meta Ads + Shopee advertiser' },
      { key: 'telegram_alerts', label: 'Telegram Alerts', icon: '📱', desc: 'Performance alerts, profit drops, daily summaries.', requirement: 'Requires Telegram Bot Token + Chat ID' },
      { key: 'auto_rules', label: 'Auto Rules Engine', icon: '⚙️', desc: 'Automated campaign management based on performance rules.', requirement: 'Requires campaign data' },
    ];

    // Dynamic API keys list
    const apiKeys = [
      { key: 'meta_access_token', label: 'Meta Access Token', desc: 'Facebook Marketing API token', icon: '📘', category: 'Meta Ads' },
      { key: 'meta_act_id', label: 'Meta Ad Account ID', desc: 'act_XXXXXXXXX format', icon: '📘', category: 'Meta Ads' },
      { key: 'shopee_affiliate_id', label: 'Shopee Affiliate ID', desc: 'Shopee affiliate program ID', icon: '🛒', category: 'Shopee' },
      { key: 'telegram_bot_token', label: 'Telegram Bot Token', desc: 'From @BotFather for alerts', icon: '📱', category: 'Telegram' },
      { key: 'telegram_chat_id', label: 'Telegram Chat ID', desc: 'Your chat ID for notifications', icon: '📱', category: 'Telegram' },
      { key: 'ipqs_api_key', label: 'IPQualityScore Key', desc: 'Fraud detection and IP reputation', icon: '🛡️', category: 'Security' },
      { key: 'slack_webhook', label: 'Slack Webhook URL', desc: 'Incoming webhook for notifications', icon: '💬', category: 'Notifications' },
    ];

    // Group by category
    const categories = {};
    apiKeys.forEach(k => {
      if (!categories[k.category]) categories[k.category] = [];
      categories[k.category].push(k);
    });

    container.innerHTML = `
      <div class="card" style="margin-bottom:24px;">
        <h3>🎛️ Platform Features</h3>
        <p style="color:var(--text2);font-size:13px;margin-bottom:20px;">Toggle features on/off. Disabled features are hidden from the sidebar.</p>
        <div style="display:grid;gap:16px;">
          ${features.map(f => {
            const isEnabled = featureData['feature_' + f.key]?.enabled || false;
            return `<div style="display:flex;align-items:flex-start;gap:16px;padding:20px;background:var(--panel2);border:1px solid ${isEnabled ? 'var(--green)' : 'var(--border)'};border-radius:12px;transition:border-color 0.3s;">
              <div style="font-size:32px;min-width:40px;text-align:center;">${f.icon}</div>
              <div style="flex:1;">
                <div style="font-weight:600;font-size:15px;margin-bottom:4px;">${f.label}</div>
                <div style="color:var(--text2);font-size:13px;line-height:1.5;">${f.desc}</div>
                <div style="color:var(--text2);font-size:11px;margin-top:6px;opacity:0.7;">${f.requirement}</div>
              </div>
              <label style="position:relative;display:inline-block;width:52px;height:28px;flex-shrink:0;cursor:pointer;margin-top:4px;">
                <input type="checkbox" ${isEnabled ? 'checked' : ''} onchange="Settings.toggleFeature('${f.key}', this.checked)" style="opacity:0;width:0;height:0;">
                <span style="position:absolute;inset:0;background:${isEnabled ? 'var(--green)' : 'rgba(255,255,255,0.1)'};border-radius:14px;transition:0.3s;">
                  <span style="position:absolute;left:${isEnabled ? '26px' : '3px'};top:3px;width:22px;height:22px;background:#fff;border-radius:50%;transition:0.3s;box-shadow:0 2px 4px rgba(0,0,0,0.3);"></span>
                </span>
              </label>
            </div>`;
          }).join('')}
        </div>
      </div>

      <div class="card">
        <h3>🔑 API Keys & Connections</h3>
        <p style="color:var(--text2);font-size:13px;margin-bottom:20px;">Connect your accounts for data sync and automation.</p>
        ${Object.entries(categories).map(([cat, keys]) => `
          <div style="margin-bottom:20px;">
            <div style="font-weight:600;font-size:13px;color:var(--text2);margin-bottom:10px;text-transform:uppercase;letter-spacing:0.5px;">${cat}</div>
            <div style="display:grid;gap:10px;">
              ${keys.map(i => `
                <div style="display:flex;align-items:center;gap:12px;padding:14px 16px;background:var(--panel2);border:1px solid var(--border);border-radius:8px;">
                  <span style="font-size:20px;min-width:28px;text-align:center;">${i.icon}</span>
                  <div style="flex:1;min-width:0;">
                    <div style="font-weight:600;font-size:13px;">${i.label}</div>
                    <div style="color:var(--text2);font-size:11px;">${i.desc}</div>
                  </div>
                  <input type="password" id="int-${i.key}" value="${integrations[i.key] || ''}" placeholder="Enter key" style="width:200px;padding:8px 12px;background:rgba(0,0,0,0.2);border:1px solid var(--border);border-radius:6px;color:var(--text);font-size:13px;">
                  <button class="btn btn-primary btn-sm" onclick="Settings.saveIntegration('${i.key}')">Save</button>
                </div>
              `).join('')}
            </div>
          </div>
        `).join('')}
      </div>`;
  } catch(e) { container.innerHTML = '<div class="card"><p>Unable to load integrations.</p></div>'; }
};

// ═══════════════════════════════════════════════
// TAB 3: Notifications
// ═══════════════════════════════════════════════
SettingsTabs['notifications'] = async function(container) {
  try {
    const n = await API.get('/api/settings/notifications').catch(() => ({}));
    container.innerHTML = `
      <div class="card">
        <h3>🔔 Notification Preferences</h3>
        <div style="display:grid;gap:16px;margin-top:16px;">
          ${[
            { key: 'email', label: 'Email Notifications', desc: 'Receive conversion alerts and daily summaries via email', enabled: n.email !== false },
            { key: 'push', label: 'Push Notifications', desc: 'Browser push notifications for real-time alerts', enabled: n.push === true },
            { key: 'telegram', label: 'Telegram Notifications', desc: 'Send alerts to Telegram bot', enabled: n.telegram === true },
          ].map(f => `
            <div style="display:flex;align-items:center;gap:16px;padding:16px;background:var(--panel2);border:1px solid var(--border);border-radius:8px;">
              <div style="flex:1;">
                <div style="font-weight:600;font-size:14px;">${f.label}</div>
                <div style="color:var(--text2);font-size:12px;">${f.desc}</div>
              </div>
              <label style="position:relative;display:inline-block;width:48px;height:26px;cursor:pointer;">
                <input type="checkbox" ${f.enabled ? 'checked' : ''} onchange="Settings.toggleNotification('${f.key}', this.checked)" style="opacity:0;width:0;height:0;">
                <span style="position:absolute;inset:0;background:${f.enabled ? 'var(--green)' : 'rgba(255,255,255,0.1)'};border-radius:13px;transition:0.3s;">
                  <span style="position:absolute;left:${f.enabled ? '24px' : '2px'};top:2px;width:22px;height:22px;background:#fff;border-radius:50%;transition:0.3s;"></span>
                </span>
              </label>
            </div>
          `).join('')}
        </div>
      </div>`;
  } catch(e) { container.innerHTML = '<div class="card"><p>Unable to load notifications.</p></div>'; }
};

Settings.toggleNotification = async function(key, enabled) {
  try {
    await API.put('/api/settings/notifications', { [key]: enabled });
    AppUI.toast(`${key} notifications ${enabled ? 'enabled' : 'disabled'}`);
  } catch(e) { AppUI.toast(e.message, 'err'); }
};

// ═══════════════════════════════════════════════
// TAB 4: Domains
// ═══════════════════════════════════════════════
SettingsTabs['domains'] = async function(container) {
  try {
    const r = await API.get('/api/admin/domains').catch(() => ({ data: [] }));
    const domains = r.data || [];
    container.innerHTML = `
      <div class="card">
        <h3>🌐 Custom Domains</h3>
        <p style="color:var(--text2);font-size:13px;margin-bottom:16px;">Configure branded tracking domains for your smartlinks.</p>
        <button class="btn btn-primary btn-sm" style="margin-bottom:16px;" onclick="Settings.addDomain()">+ Add Domain</button>
        ${domains.length
          ? DOM.table(['Domain', 'Status', 'SSL', 'Default', 'Created'], domains.map(d => [
              d.domain || '-',
              DOM.pill(d.status || 'active', {active:'green',pending:'yellow'}[d.status] || 'blue'),
              d.ssl_enabled ? '🔒' : '🔓',
              d.is_default ? '✅' : '-',
              d.created_at ? new Date(d.created_at * 1000).toLocaleDateString() : '-'
            ]))
          : DOM.emptyState('No custom domains', 'Add a custom domain to brand your tracking links.')}
      </div>`;
  } catch(e) { container.innerHTML = '<div class="card"><p>Unable to load domains.</p></div>'; }
};

Settings.addDomain = function() {
  const domain = prompt('Enter domain (e.g., go.yourdomain.com):');
  if (!domain) return;
  API.post('/api/admin/domains', { domain }).then(() => {
    AppUI.toast('Domain added');
    Router.navigate('settings');
  }).catch(e => AppUI.toast(e.message, 'err'));
};

// ═══════════════════════════════════════════════
// TAB 5: Automation
// ═══════════════════════════════════════════════
SettingsTabs['automation'] = async function(container) {
  try {
    const [rules, dp, wh] = await Promise.all([
      API.get('/api/admin/automation').catch(() => ({ data: [] })),
      API.get('/api/admin/day-parting').catch(() => ({ data: {} })),
      API.get('/api/admin/webhooks').catch(() => ({ data: [] }))
    ]);
    container.innerHTML = `
      <div class="card" style="margin-bottom:24px;">
        <h3>⚙️ Automation Rules</h3>
        <button class="btn btn-primary btn-sm" style="margin-bottom:16px;" onclick="Settings.addAutomationRule()">+ Add Rule</button>
        ${(rules.data || []).length
          ? DOM.table(['Name', 'Type', 'Status', 'Last Triggered'], (rules.data || []).map(d => [
              d.name || '-',
              d.rule_type || '-',
              DOM.pill(d.enabled ? 'active' : 'paused', d.enabled ? 'green' : 'yellow'),
              d.last_triggered_at ? new Date(d.last_triggered_at * 1000).toLocaleString() : 'Never'
            ]))
          : DOM.emptyState('No automation rules', 'Create rules to automate campaign management.')}
      </div>
      <div class="card" style="margin-bottom:24px;">
        <h3>⏰ Day Parting</h3>
        <p style="color:var(--text2);font-size:13px;margin-bottom:12px;">Schedule campaign delivery by time of day.</p>
        <button class="btn btn-outline btn-sm" onclick="Router.navigate('day-parting')">Open Day Parting →</button>
      </div>
      <div class="card">
        <h3>🔗 Webhooks</h3>
        <button class="btn btn-primary btn-sm" style="margin-bottom:16px;" onclick="Settings.addWebhook()">+ Add Webhook</button>
        ${(wh.data || []).length
          ? DOM.table(['URL', 'Events', 'Status'], (wh.data || []).map(d => [
              d.url || '-',
              Array.isArray(d.events) ? d.events.join(', ') : (d.events || '-'),
              DOM.pill(d.enabled ? 'active' : 'paused', d.enabled ? 'green' : 'yellow')
            ]))
          : DOM.emptyState('No webhooks', 'Configure webhooks for real-time event notifications.')}
      </div>`;
  } catch(e) { container.innerHTML = '<div class="card"><p>Unable to load automation.</p></div>'; }
};

Settings.addAutomationRule = function() { Router.navigate('automation'); };
Settings.addWebhook = function() {
  const url = prompt('Webhook URL:');
  if (!url) return;
  API.post('/api/admin/webhooks', { url, events: 'click,conversion' }).then(() => {
    AppUI.toast('Webhook added');
    Router.navigate('settings');
  }).catch(e => AppUI.toast(e.message, 'err'));
};

// ═══════════════════════════════════════════════
// TAB 6: Security
// ═══════════════════════════════════════════════
SettingsTabs['security'] = async function(container) {
  try {
    const [fraud, caps] = await Promise.all([
      API.get('/api/admin/services/fraud/blacklist').catch(() => ({ data: [] })),
      API.get('/api/admin/caps/offer/0').catch(() => ({ data: [] }))
    ]);
    container.innerHTML = `
      <div class="card" style="margin-bottom:24px;">
        <h3>🛡️ Fraud Detection</h3>
        <p style="color:var(--text2);font-size:13px;margin-bottom:12px;">IP blacklist, bot detection, velocity checks.</p>
        <button class="btn btn-outline btn-sm" style="margin-bottom:16px;" onclick="Router.navigate('fraud')">Open Fraud Detection →</button>
        <div style="color:var(--text2);font-size:13px;">${(fraud.data || []).length} blacklisted entries</div>
      </div>
      <div class="card">
        <h3>🔒 Cap Enforcement</h3>
        <p style="color:var(--text2);font-size:13px;margin-bottom:12px;">Daily/monthly click and conversion limits.</p>
        <button class="btn btn-outline btn-sm" onclick="Router.navigate('caps')">Open Cap Enforcement →</button>
      </div>`;
  } catch(e) { container.innerHTML = '<div class="card"><p>Unable to load security.</p></div>'; }
};

// ═══════════════════════════════════════════════
// TAB 7: Advanced
// ═══════════════════════════════════════════════
SettingsTabs['advanced'] = async function(container) {
  try {
    const sys = await API.get('/api/admin/system').catch(() => ({}));
    container.innerHTML = `
      <div class="card" style="margin-bottom:24px;">
        <h3>🧪 A/B Testing</h3>
        <p style="color:var(--text2);font-size:13px;margin-bottom:12px;">Create and manage A/B test campaigns.</p>
        <button class="btn btn-outline btn-sm" onclick="Router.navigate('ab-tests')">Open A/B Tests →</button>
      </div>
      <div class="card" style="margin-bottom:24px;">
        <h3>💰 Margin Negotiation</h3>
        <p style="color:var(--text2);font-size:13px;margin-bottom:12px;">Manage payout proposals between affiliates and offer managers.</p>
        <button class="btn btn-outline btn-sm" onclick="Router.navigate('margin')">Open Margin →</button>
      </div>
      <div class="card" style="margin-bottom:24px;">
        <h3>📊 Multi-Model Tracking</h3>
        <p style="color:var(--text2);font-size:13px;margin-bottom:12px;">CPC, CPV, and CPM payout model configuration.</p>
        <button class="btn btn-outline btn-sm" onclick="Router.navigate('multimodel')">Open Multi-Model →</button>
      </div>
      <div class="card">
        <h3>🖥️ System Info</h3>
        <div style="margin-top:12px;font-size:13px;color:var(--text2);">
          <div>Platform: 1AI Affiliate Tracker</div>
          <div>Version: 1.0.0</div>
          <div>Node: ${sys.nodeVersion || 'N/A'}</div>
          <div>DB: ${sys.dbVersion || 'MariaDB'}</div>
          <div>Uptime: ${sys.uptime || 'N/A'}</div>
        </div>
      </div>`;
  } catch(e) { container.innerHTML = '<div class="card"><p>Unable to load advanced settings.</p></div>'; }
};

// ═══════════════════════════════════════════════
// SHARED HELPERS
// ═══════════════════════════════════════════════
Settings.toggleFeature = async function(key, enabled) {
  try {
    await API.put('/api/settings/features/' + key, { enabled });
    AppUI.toast(key + ' ' + (enabled ? 'enabled' : 'disabled'));
    setTimeout(() => Router.navigate('settings'), 500);
  } catch(e) { AppUI.toast(e.message, 'err'); }
};

Settings.saveIntegration = async function(key) {
  try {
    await API.put('/api/settings/integrations', { key, value: document.getElementById('int-' + key).value });
    AppUI.toast('Saved');
  } catch(e) { AppUI.toast(e.message, 'err'); }
};
