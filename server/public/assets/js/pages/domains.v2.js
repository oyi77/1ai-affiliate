/** Domain Management - Custom domains for smartlink redirects */
window.PageRenderers = window.PageRenderers || {};

PageRenderers.domains = async function(el) {
  try {
    const domains = await API.get('/api/admin/domains');
    
    el.innerHTML = `
      ${DOM.pageHeader('Domain Management', 'Configure custom domains for smartlink redirects')}
      
      <div class="card">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px">
          <h3 style="margin:0">Smartlink Domains</h3>
          <button class="btn btn-primary btn-sm" onclick="DomainsUI.showAddModal()">+ Add Domain</button>
        </div>
        
        <p style="font-size:13px;color:var(--text2);margin-bottom:16px">
          Custom domains allow you to use your own branded URLs for smartlink redirects. 
          Each smartlink can use one of these domains instead of the default go.berkahkarya.org.
        </p>
        
        ${domains.length === 0 ? '<p style="color:var(--text2)">No domains configured yet.</p>' : `
          <table style="width:100%;border-collapse:collapse">
            <thead>
              <tr style="text-align:left;border-bottom:1px solid var(--border)">
                <th style="padding:12px 8px;font-weight:600;color:var(--text2)">Domain</th>
                <th style="padding:12px 8px;font-weight:600;color:var(--text2)">Status</th>
                <th style="padding:12px 8px;font-weight:600;color:var(--text2)">SSL</th>
                <th style="padding:12px 8px;font-weight:600;color:var(--text2)">Default</th>
                <th style="padding:12px 8px;font-weight:600;color:var(--text2)">Created</th>
                <th style="padding:12px 8px;font-weight:600;color:var(--text2)">Actions</th>
              </tr>
            </thead>
            <tbody>
              ${domains.map(d => `
                <tr style="border-bottom:1px solid var(--border)">
                  <td style="padding:12px 8px">
                    <code style="background:var(--bg);padding:4px 8px;border-radius:4px;font-size:13px">${d.domain}</code>
                  </td>
                  <td style="padding:12px 8px">
                    ${d.is_active 
                      ? DOM.badge('Active', 'green') 
                      : DOM.badge('Inactive', 'red')}
                  </td>
                  <td style="padding:12px 8px">
                    ${d.ssl_enabled 
                      ? '<span style="color:var(--green)">✓ HTTPS</span>' 
                      : '<span style="color:var(--yellow)">⚠ HTTP</span>'}
                  </td>
                  <td style="padding:12px 8px">
                    ${d.is_default 
                      ? DOM.badge('Default', 'indigo') 
                      : '<span style="color:var(--text2)">—</span>'}
                  </td>
                  <td style="padding:12px 8px;color:var(--text2);font-size:13px">
                    ${new Date(d.created_at).toLocaleDateString()}
                  </td>
                  <td style="padding:12px 8px">
                    <button class="btn btn-outline btn-sm" onclick="DomainsUI.edit(${d.id})">Edit</button>
                    ${!d.is_default ? `<button class="btn btn-danger btn-sm" onclick="DomainsUI.delete(${d.id})" style="margin-left:8px">Delete</button>` : ''}
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        `}
      </div>
      
      <div class="card">
        <h3>Setup Instructions</h3>
        <ol style="color:var(--text2);font-size:13px;line-height:1.8">
          <li><strong>Add your domain</strong> — Enter the domain you want to use (e.g., go.yourdomain.com)</li>
          <li><strong>Configure DNS</strong> — Point the domain to the cf-router server (CNAME or A record)</li>
          <li><strong>Enable SSL</strong> — Cloudflare will automatically provision SSL certificates</li>
          <li><strong>Set as Default</strong> — Mark one domain as the default for new smartlinks</li>
        </ol>
        <div style="margin-top:16px;padding:12px;background:rgba(99,102,241,0.1);border:1px solid var(--indigo);border-radius:8px">
          <strong style="color:var(--indigo)">Note:</strong> 
          <span style="color:var(--text2)">Domains must be routed through cf-router nginx (port 6969) to reach the edge server on port 8085.</span>
        </div>
      </div>
    `;
  } catch(e) {
    el.innerHTML = '<div class="card"><p>Unable to load domains.</p><pre style="color:var(--red)">' + e.message + '</pre></div>';
  }
};

window.DomainsUI = {
  showAddModal() {
    AppUI.modal({
      title: 'Add New Domain',
      content: `
        <div class="form-group">
          <label>Domain</label>
          <input type="text" id="domain-name" placeholder="go.yourdomain.com" style="width:100%;padding:8px 12px;background:var(--bg);border:1px solid var(--border);border-radius:6px;color:var(--text)">
        </div>
        <div class="form-group" style="margin-top:12px">
          <label style="display:flex;align-items:center;gap:8px;cursor:pointer">
            <input type="checkbox" id="domain-ssl" checked> Enable HTTPS (SSL)
          </label>
        </div>
        <div class="form-group" style="margin-top:12px">
          <label style="display:flex;align-items:center;gap:8px;cursor:pointer">
            <input type="checkbox" id="domain-default"> Set as default domain
          </label>
        </div>
        <div class="form-group" style="margin-top:12px">
          <label>Cloudflare Zone ID (optional)</label>
          <input type="text" id="domain-zone" placeholder="Leave empty if not using Cloudflare" style="width:100%;padding:8px 12px;background:var(--bg);border:1px solid var(--border);border-radius:6px;color:var(--text)">
        </div>
        <div class="form-group" style="margin-top:12px">
          <label>Notes (optional)</label>
          <textarea id="domain-notes" placeholder="Internal notes about this domain" style="width:100%;padding:8px 12px;background:var(--bg);border:1px solid var(--border);border-radius:6px;color:var(--text);min-height:60px"></textarea>
        </div>
      `,
      actions: [
        { label: 'Cancel', class: 'btn-outline', onClick: () => AppUI.closeModal() },
        { label: 'Add Domain', class: 'btn-primary', onClick: () => DomainsUI.create() }
      ]
    });
  },
  
  async create() {
    const domain = document.getElementById('domain-name').value.trim();
    const ssl_enabled = document.getElementById('domain-ssl').checked;
    const is_default = document.getElementById('domain-default').checked;
    const cloudflare_zone_id = document.getElementById('domain-zone').value.trim() || null;
    const notes = document.getElementById('domain-notes').value.trim() || null;
    
    if (!domain) {
      AppUI.toast('Domain is required', 'error');
      return;
    }
    
    try {
      await API.post('/api/admin/domains', { domain, ssl_enabled, is_default, cloudflare_zone_id, notes });
      AppUI.closeModal();
      AppUI.toast('Domain added successfully', 'success');
      Router.navigate('domains');
    } catch(e) {
      AppUI.toast(e.message || 'Failed to add domain', 'error');
    }
  },
  
  async edit(id) {
    try {
      const domains = await API.get('/api/admin/domains');
      const domain = domains.find(d => d.id === id);
      if (!domain) throw new Error('Domain not found');
      
      AppUI.modal({
        title: 'Edit Domain',
        content: `
          <div class="form-group">
            <label>Domain</label>
            <input type="text" id="domain-name" value="${domain.domain}" style="width:100%;padding:8px 12px;background:var(--bg);border:1px solid var(--border);border-radius:6px;color:var(--text)">
          </div>
          <div class="form-group" style="margin-top:12px">
            <label style="display:flex;align-items:center;gap:8px;cursor:pointer">
              <input type="checkbox" id="domain-active" ${domain.is_active ? 'checked' : ''}> Active
            </label>
          </div>
          <div class="form-group" style="margin-top:12px">
            <label style="display:flex;align-items:center;gap:8px;cursor:pointer">
              <input type="checkbox" id="domain-ssl" ${domain.ssl_enabled ? 'checked' : ''}> Enable HTTPS (SSL)
            </label>
          </div>
          <div class="form-group" style="margin-top:12px">
            <label style="display:flex;align-items:center;gap:8px;cursor:pointer">
              <input type="checkbox" id="domain-default" ${domain.is_default ? 'checked' : ''}> Set as default domain
            </label>
          </div>
          <div class="form-group" style="margin-top:12px">
            <label>Cloudflare Zone ID</label>
            <input type="text" id="domain-zone" value="${domain.cloudflare_zone_id || ''}" placeholder="Leave empty if not using Cloudflare" style="width:100%;padding:8px 12px;background:var(--bg);border:1px solid var(--border);border-radius:6px;color:var(--text)">
          </div>
          <div class="form-group" style="margin-top:12px">
            <label>Notes</label>
            <textarea id="domain-notes" placeholder="Internal notes" style="width:100%;padding:8px 12px;background:var(--bg);border:1px solid var(--border);border-radius:6px;color:var(--text);min-height:60px">${domain.notes || ''}</textarea>
          </div>
        `,
        actions: [
          { label: 'Cancel', class: 'btn-outline', onClick: () => AppUI.closeModal() },
          { label: 'Save Changes', class: 'btn-primary', onClick: () => DomainsUI.update(id) }
        ]
      });
    } catch(e) {
      AppUI.toast(e.message, 'error');
    }
  },
  
  async update(id) {
    const domain = document.getElementById('domain-name').value.trim();
    const is_active = document.getElementById('domain-active').checked;
    const ssl_enabled = document.getElementById('domain-ssl').checked;
    const is_default = document.getElementById('domain-default').checked;
    const cloudflare_zone_id = document.getElementById('domain-zone').value.trim() || null;
    const notes = document.getElementById('domain-notes').value.trim() || null;
    
    try {
      await API.put(`/api/admin/domains/${id}`, { domain, is_active, ssl_enabled, is_default, cloudflare_zone_id, notes });
      AppUI.closeModal();
      AppUI.toast('Domain updated successfully', 'success');
      Router.navigate('domains');
    } catch(e) {
      AppUI.toast(e.message || 'Failed to update domain', 'error');
    }
  },
  
  async delete(id) {
    const ok = await AppUI.confirm({
      title: 'Delete Domain',
      message: 'Are you sure you want to delete this domain? This action cannot be undone.',
      confirmText: 'Delete',
      danger: true
    });
    if (!ok) return;
    
    try {
      await API.del(`/api/admin/domains/${id}`);
      AppUI.toast('Domain deleted successfully', 'success');
      Router.navigate('domains');
    } catch(e) {
      AppUI.toast(e.message || 'Failed to delete domain', 'error');
    }
  }
};