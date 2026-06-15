/** URL Shortener Services - Configure Bitly, TinyURL, Rebrandly, etc. */
window.PageRenderers = window.PageRenderers || {};

PageRenderers.shorteners = async function(el) {
  try {
    const services = await API.get('/api/admin/shorteners');
    
    const serviceIcons = {
      bitly: '🔗',
      tinyurl: '📎',
      rebrandly: '🏷️',
      cuttly: '✂️',
      shortio: '⚡',
      custom: '⚙️'
    };
    
    el.innerHTML = `
      ${DOM.pageHeader('URL Shortener Services', 'Configure URL shortening integrations for smartlinks')}
      
      <div class="card">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px">
          <h3 style="margin:0">Configured Services</h3>
          <button class="btn btn-primary btn-sm" onclick="ShortenersUI.showAddModal()">+ Add Service</button>
        </div>
        
        <p style="font-size:13px;color:var(--text2);margin-bottom:16px">
          URL shortener services allow you to automatically shorten smartlinks. 
          Each service requires an API key to function. Enable one service as the default.
        </p>
        
        ${services.length === 0 ? '<p style="color:var(--text2)">No services configured yet.</p>' : `
          <div style="display:grid;gap:16px">
            ${services.map(s => `
              <div style="background:var(--panel);border:1px solid var(--border);border-radius:12px;padding:16px;display:flex;align-items:center;gap:16px">
                <div style="width:48px;height:48px;border-radius:12px;background:linear-gradient(135deg,var(--indigo),var(--purple));display:flex;align-items:center;justify-content:center;font-size:24px">
                  ${serviceIcons[s.service_type] || '🔗'}
                </div>
                <div style="flex:1">
                  <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px">
                    <h4 style="margin:0">${s.name}</h4>
                    ${s.is_default ? DOM.badge('Default', 'indigo') : ''}
                    ${s.is_active ? DOM.badge('Active', 'green') : DOM.badge('Inactive', 'red')}
                  </div>
                  <div style="font-size:13px;color:var(--text2)">
                    Type: <code style="background:var(--bg);padding:2px 6px;border-radius:4px">${s.service_type}</code>
                    ${s.default_domain ? ` • Domain: <code style="background:var(--bg);padding:2px 6px;border-radius:4px">${s.default_domain}</code>` : ''}
                    ${s.linked_domain ? ` • Linked: <code style="background:var(--bg);padding:2px 6px;border-radius:4px">${s.linked_domain}</code>` : ''}
                  </div>
                  ${s.api_key ? '<div style="font-size:12px;color:var(--green);margin-top:4px">✓ API key configured</div>' : '<div style="font-size:12px;color:var(--red);margin-top:4px">⚠ API key required</div>'}
                </div>
                <div style="display:flex;gap:8px">
                  <button class="btn btn-outline btn-sm" onclick="ShortenersUI.edit(${s.id})">Configure</button>
                  ${s.api_key ? `<button class="btn btn-outline btn-sm" onclick="ShortenersUI.test(${s.id})">Test</button>` : ''}
                  ${!s.is_default ? `<button class="btn btn-danger btn-sm" onclick="ShortenersUI.delete(${s.id})">Delete</button>` : ''}
                </div>
              </div>
            `).join('')}
          </div>
        `}
      </div>
      
      <div class="card">
        <h3>Supported Services</h3>
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:16px;margin-top:12px">
          ${[
            { type: 'bitly', name: 'Bitly', desc: 'Popular URL shortener with analytics', domain: 'bit.ly' },
            { type: 'tinyurl', name: 'TinyURL', desc: 'Free URL shortening service', domain: 'tinyurl.com' },
            { type: 'rebrandly', name: 'Rebrandly', desc: 'Branded short links', domain: 'rebrand.ly' },
            { type: 'cuttly', name: 'Cutt.ly', desc: 'Free link shortener', domain: 'cutt.ly' },
            { type: 'shortio', name: 'Short.io', desc: 'Custom domain short links', domain: 'short.io' },
            { type: 'custom', name: 'Custom API', desc: 'Your own shortener endpoint', domain: '—' }
          ].map(s => `
            <div style="background:var(--bg);padding:12px;border-radius:8px;border:1px solid var(--border)">
              <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px">
                <span style="font-size:20px">${serviceIcons[s.type]}</span>
                <strong>${s.name}</strong>
              </div>
              <div style="font-size:12px;color:var(--text2)">${s.desc}</div>
              <div style="font-size:11px;color:var(--text2);margin-top:4px">Default domain: ${s.domain}</div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  } catch(e) {
    el.innerHTML = '<div class="card"><p>Unable to load services.</p><pre style="color:var(--red)">' + e.message + '</pre></div>';
  }
};

window.ShortenersUI = {
  showAddModal() {
    AppUI.modal({
      title: 'Add URL Shortener Service',
      content: `
        <div class="form-group">
          <label>Service Name</label>
          <input type="text" id="shortener-name" placeholder="My Bitly Account" style="width:100%;padding:8px 12px;background:var(--bg);border:1px solid var(--border);border-radius:6px;color:var(--text)">
        </div>
        <div class="form-group" style="margin-top:12px">
          <label>Service Type</label>
          <select id="shortener-type" onchange="ShortenersUI.updateTypeUI()" style="width:100%;padding:8px 12px;background:var(--bg);border:1px solid var(--border);border-radius:6px;color:var(--text)">
            <option value="bitly">Bitly</option>
            <option value="tinyurl">TinyURL</option>
            <option value="rebrandly">Rebrandly</option>
            <option value="cuttly">Cutt.ly</option>
            <option value="shortio">Short.io</option>
            <option value="custom">Custom API</option>
          </select>
        </div>
        <div id="shortener-api-fields">
          <div class="form-group" style="margin-top:12px">
            <label>API Key</label>
            <input type="password" id="shortener-key" placeholder="Enter API key" style="width:100%;padding:8px 12px;background:var(--bg);border:1px solid var(--border);border-radius:6px;color:var(--text)">
          </div>
          <div class="form-group" style="margin-top:12px" id="shortener-secret-field">
            <label>API Secret (optional)</label>
            <input type="password" id="shortener-secret" placeholder="Enter API secret if required" style="width:100%;padding:8px 12px;background:var(--bg);border:1px solid var(--border);border-radius:6px;color:var(--text)">
          </div>
          <div class="form-group" style="margin-top:12px" id="shortener-endpoint-field" style="display:none">
            <label>API Endpoint</label>
            <input type="text" id="shortener-endpoint" placeholder="https://api.example.com/shorten" style="width:100%;padding:8px 12px;background:var(--bg);border:1px solid var(--border);border-radius:6px;color:var(--text)">
          </div>
          <div class="form-group" style="margin-top:12px">
            <label>Default Domain</label>
            <input type="text" id="shortener-domain" placeholder="bit.ly" style="width:100%;padding:8px 12px;background:var(--bg);border:1px solid var(--border);border-radius:6px;color:var(--text)">
          </div>
        </div>
        <div class="form-group" style="margin-top:12px">
          <label style="display:flex;align-items:center;gap:8px;cursor:pointer">
            <input type="checkbox" id="shortener-default"> Set as default shortener
          </label>
        </div>
        <div class="form-group" style="margin-top:12px">
          <label>Rate Limit (requests/minute)</label>
          <input type="number" id="shortener-rate" value="60" style="width:100%;padding:8px 12px;background:var(--bg);border:1px solid var(--border);border-radius:6px;color:var(--text)">
        </div>
      `,
      actions: [
        { label: 'Cancel', class: 'btn-outline', onClick: () => AppUI.closeModal() },
        { label: 'Add Service', class: 'btn-primary', onClick: () => ShortenersUI.create() }
      ]
    });
  },
  
  updateTypeUI() {
    const type = document.getElementById('shortener-type').value;
    const secretField = document.getElementById('shortener-secret-field');
    const endpointField = document.getElementById('shortener-endpoint-field');
    const domainInput = document.getElementById('shortener-domain');
    
    // Show/hide fields based on type
    if (type === 'custom') {
      endpointField.style.display = 'block';
    } else {
      endpointField.style.display = 'none';
    }
    
    // Set default domain based on type
    const defaultDomains = {
      bitly: 'bit.ly',
      tinyurl: 'tinyurl.com',
      rebrandly: 'rebrand.ly',
      cuttly: 'cutt.ly',
      shortio: 'short.io',
      custom: ''
    };
    domainInput.value = defaultDomains[type] || '';
  },
  
  async create() {
    const name = document.getElementById('shortener-name').value.trim();
    const service_type = document.getElementById('shortener-type').value;
    const api_key = document.getElementById('shortener-key').value.trim() || null;
    const api_secret = document.getElementById('shortener-secret').value.trim() || null;
    const api_endpoint = document.getElementById('shortener-endpoint').value.trim() || null;
    const default_domain = document.getElementById('shortener-domain').value.trim() || null;
    const is_default = document.getElementById('shortener-default').checked;
    const rate_limit_per_minute = parseInt(document.getElementById('shortener-rate').value) || 60;
    
    if (!name) {
      AppUI.toast('Service name is required', 'error');
      return;
    }
    
    try {
      await API.post('/api/admin/shorteners', {
        name,
        service_type,
        api_key,
        api_secret,
        api_endpoint,
        default_domain,
        is_default,
        is_active: true,
        rate_limit_per_minute
      });
      AppUI.closeModal();
      AppUI.toast('Service added successfully', 'success');
      Router.navigate('shorteners');
    } catch(e) {
      AppUI.toast(e.message || 'Failed to add service', 'error');
    }
  },
  
  async edit(id) {
    try {
      const services = await API.get('/api/admin/shorteners');
      const service = services.find(s => s.id === id);
      if (!service) throw new Error('Service not found');
      
      AppUI.modal({
        title: 'Configure ' + service.name,
        content: `
          <div class="form-group">
            <label>Service Name</label>
            <input type="text" id="shortener-name" value="${service.name}" style="width:100%;padding:8px 12px;background:var(--bg);border:1px solid var(--border);border-radius:6px;color:var(--text)">
          </div>
          <div class="form-group" style="margin-top:12px">
            <label>Service Type</label>
            <input type="text" value="${service.service_type}" disabled style="width:100%;padding:8px 12px;background:var(--bg);border:1px solid var(--border);border-radius:6px;color:var(--text2)">
          </div>
          <div class="form-group" style="margin-top:12px">
            <label>API Key</label>
            <input type="password" id="shortener-key" placeholder="${service.api_key ? '••••••••' : 'Enter API key'}" style="width:100%;padding:8px 12px;background:var(--bg);border:1px solid var(--border);border-radius:6px;color:var(--text)">
            <div style="font-size:11px;color:var(--text2);margin-top:4px">Leave empty to keep existing key</div>
          </div>
          ${service.service_type === 'custom' ? `
            <div class="form-group" style="margin-top:12px">
              <label>API Endpoint</label>
              <input type="text" id="shortener-endpoint" value="${service.api_endpoint || ''}" style="width:100%;padding:8px 12px;background:var(--bg);border:1px solid var(--border);border-radius:6px;color:var(--text)">
            </div>
          ` : ''}
          <div class="form-group" style="margin-top:12px">
            <label>Default Domain</label>
            <input type="text" id="shortener-domain" value="${service.default_domain || ''}" style="width:100%;padding:8px 12px;background:var(--bg);border:1px solid var(--border);border-radius:6px;color:var(--text)">
          </div>
          <div class="form-group" style="margin-top:12px">
            <label style="display:flex;align-items:center;gap:8px;cursor:pointer">
              <input type="checkbox" id="shortener-active" ${service.is_active ? 'checked' : ''}> Active
            </label>
          </div>
          <div class="form-group" style="margin-top:12px">
            <label style="display:flex;align-items:center;gap:8px;cursor:pointer">
              <input type="checkbox" id="shortener-default" ${service.is_default ? 'checked' : ''}> Set as default shortener
            </label>
          </div>
          <div class="form-group" style="margin-top:12px">
            <label>Rate Limit (requests/minute)</label>
            <input type="number" id="shortener-rate" value="${service.rate_limit_per_minute || 60}" style="width:100%;padding:8px 12px;background:var(--bg);border:1px solid var(--border);border-radius:6px;color:var(--text)">
          </div>
        `,
        actions: [
          { label: 'Cancel', class: 'btn-outline', onClick: () => AppUI.closeModal() },
          { label: 'Save Changes', class: 'btn-primary', onClick: () => ShortenersUI.update(id) }
        ]
      });
    } catch(e) {
      AppUI.toast(e.message, 'error');
    }
  },
  
  async update(id) {
    const name = document.getElementById('shortener-name').value.trim();
    const api_key = document.getElementById('shortener-key').value.trim() || undefined;
    const api_endpoint = document.getElementById('shortener-endpoint')?.value.trim() || undefined;
    const default_domain = document.getElementById('shortener-domain').value.trim() || null;
    const is_active = document.getElementById('shortener-active').checked;
    const is_default = document.getElementById('shortener-default').checked;
    const rate_limit_per_minute = parseInt(document.getElementById('shortener-rate').value) || 60;
    
    try {
      await API.put(`/api/admin/shorteners/${id}`, {
        name,
        api_key,
        api_endpoint,
        default_domain,
        is_active,
        is_default,
        rate_limit_per_minute
      });
      AppUI.closeModal();
      AppUI.toast('Service updated successfully', 'success');
      Router.navigate('shorteners');
    } catch(e) {
      AppUI.toast(e.message || 'Failed to update service', 'error');
    }
  },
  
  async test(id) {
    const testUrl = 'https://example.com/go/test123';
    
    try {
      AppUI.toast('Testing shortener...', 'info');
      const result = await API.post(`/api/admin/shorteners/${id}/test`, { url: testUrl });
      AppUI.toast(`Shortened: ${result.short_url}`, 'success');
    } catch(e) {
      AppUI.toast(e.message || 'Test failed', 'error');
    }
  },
  
  async delete(id) {
    const ok = await AppUI.confirm({
      title: 'Delete Service',
      message: 'Are you sure you want to delete this service? This action cannot be undone.',
      confirmText: 'Delete',
      danger: true
    });
    if (!ok) return;
    
    try {
      await API.del(`/api/admin/shorteners/${id}`);
      AppUI.toast('Service deleted successfully', 'success');
      Router.navigate('shorteners');
    } catch(e) {
      AppUI.toast(e.message || 'Failed to delete service', 'error');
    }
  }
};