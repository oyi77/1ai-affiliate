/**
 * Settings Page — profile, password, API keys, ClickServer
 * Depends on: API, UI, Auth, Router
 */
Router.register('settings', async (target) => {
  let profile = {};
  try { profile = await API.get('/api/settings/profile'); } catch {}
  const TZ_LIST = ['UTC','US/Eastern','US/Central','US/Pacific','Europe/London','Europe/Berlin','Asia/Jakarta','Asia/Tokyo','Asia/Singapore','Australia/Sydney'];

  target.innerHTML = `
    ${UI.pageHeader('Settings', 'Profile & configuration')}
    <div class="space-y-4">
      ${UI.panel('Profile', `
        <form id="profile-form" class="space-y-3">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
            ${UI.formField('Username', '', 'text', { value: profile.username || '—', extraClass: 'cursor-not-allowed opacity-60' })}
            ${UI.formField('Email', 'sett-email', 'email', { value: profile.email || '', required: true })}
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
            ${UI.formField('Timezone', 'sett-tz', 'select', { value: profile.timezone || 'UTC', options: TZ_LIST })}
            ${UI.formField('Role', '', 'text', { value: (profile.role === 2 || profile.role === 'admin') ? 'Admin' : 'User', extraClass: 'cursor-not-allowed opacity-60' })}
          </div>
          <button type="submit" class="px-4 py-2 grad rounded-lg text-sm font-semibold text-white">Save Profile</button>
          <span id="profile-msg" class="hidden"></span>
        </form>
      `)}
      ${UI.panel('Change Password', `
        <form id="password-form" class="space-y-3">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
            ${UI.formField('Current', 'pw-current', 'password', { required: true })}
            ${UI.formField('New', 'pw-new', 'password', { required: true })}
            ${UI.formField('Confirm', 'pw-confirm', 'password', { required: true })}
          </div>
          <button type="submit" class="px-4 py-2 panel-2 rounded-lg text-sm font-semibold text-white hover:bg-gray-700">Update</button>
          <span id="pw-msg" class="hidden"></span>
        </form>
      `)}
      ${UI.panel('REST API Key', `
        <div class="flex items-center gap-3">
          <div class="panel-2 rounded-lg px-3 py-2 text-sm font-mono flex-1">${profile.api_key ? Fmt.maskKey(profile.api_key) : 'No API key generated'}</div>
          ${profile.api_key
            ? '<button id="btn-rm-key" class="px-3 py-2 rounded-lg text-sm font-semibold bg-red-500/20 text-red-400 hover:bg-red-500/30">Remove</button>'
            : '<button id="btn-gen-key" class="px-3 py-2 grad rounded-lg text-sm font-semibold text-white">Generate</button>'}
        </div>
        <div id="key-msg" class="hidden mt-2"></div>
      `)}
      ${UI.panel('ClickServer API Key', `
        <div class="flex items-center gap-3">
          <div class="panel-2 rounded-lg px-3 py-2 text-sm font-mono flex-1">${profile.clickserver_api_key ? Fmt.maskKey(profile.clickserver_api_key) : 'Not configured'}</div>
          <button id="btn-cs-key" class="px-3 py-2 panel-2 rounded-lg text-sm font-semibold hover:bg-gray-700">Edit</button>
        </div>
        <span id="cs-msg" class="hidden"></span>
      `)}
    </div>
  `;

  // Profile save
  document.getElementById('profile-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const msg = document.getElementById('profile-msg');
    try {
      await API.put('/api/settings/profile', {
        email: document.getElementById('sett-email').value,
        timezone: document.getElementById('sett-tz').value,
      });
      msg.innerHTML = UI.toast('Saved!');
    } catch (err) { msg.innerHTML = UI.toast(err.message, 'error'); }
    msg.classList.remove('hidden');
  });

  // Password change
  document.getElementById('password-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const msg = document.getElementById('pw-msg');
    const [cur, n1, n2] = ['pw-current','pw-new','pw-confirm'].map(id => document.getElementById(id).value);
    if (n1 !== n2) { msg.innerHTML = UI.toast('Passwords do not match', 'error'); msg.classList.remove('hidden'); return; }
    try {
      await Auth.changePassword(cur, n1);
      msg.innerHTML = UI.toast('Password changed!');
    } catch (err) { msg.innerHTML = UI.toast(err.message, 'error'); }
    msg.classList.remove('hidden');
  });

  // API key gen/remove
  document.getElementById('btn-gen-key')?.addEventListener('click', async () => {
    try { const d = await API.post('/api/settings/api-key'); document.getElementById('key-msg').innerHTML = UI.toast('Key: ' + d.api_key); } catch (err) { document.getElementById('key-msg').innerHTML = UI.toast(err.message, 'error'); }
    document.getElementById('key-msg').classList.remove('hidden');
  });
  document.getElementById('btn-rm-key')?.addEventListener('click', async () => {
    if (!confirm('Remove your API key?')) return;
    try { await API.del('/api/settings/api-key'); Router.reload(); } catch (err) { alert(err.message); }
  });

  // ClickServer key
  document.getElementById('btn-cs-key')?.addEventListener('click', async () => {
    const val = prompt('Enter ClickServer API Key:', profile.clickserver_api_key || '');
    if (val === null) return;
    try { await API.put('/api/settings/integrations', { key: 'clickserver_api_key', value: val }); Router.reload(); } catch (err) { alert(err.message); }
  });
});