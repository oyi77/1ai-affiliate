window.PageRenderers = window.PageRenderers || {};

PageRenderers.smartlink = async function(el) {
  // Load domains and shortener services
  let domains = [];
  let shorteners = [];
  
  try {
    domains = await API.get('/api/admin/domains');
  } catch(e) {
    // User may not be admin, use empty array
  }
  
  try {
    shorteners = await API.get('/api/admin/shorteners');
  } catch(e) {
    // User may not be admin, use empty array
  }
  
  const activeDomains = domains.filter(d => d.is_active);
  const activeShorteners = shorteners.filter(s => s.is_active);
  const defaultDomain = activeDomains.find(d => d.is_default);
  const defaultShortener = activeShorteners.find(s => s.is_default);
  
  el.innerHTML = `
    ${DOM.pageHeader('Smartlink Generator', 'Create geo and device-optimized routing links')}
    
    <div class="card" style="max-width:800px">
      <h3 style="margin-bottom:16px">Create New Smartlink</h3>
      <p style="font-size:13px; color:var(--text2); margin-bottom:24px">
        A smartlink automatically redirects your traffic to the best performing offer based on the user's location and device.
      </p>
      
      <form onsubmit="event.preventDefault(); SmartlinkUI.generate()">
        <div class="form-group">
          <label>Offer / Campaign</label>
          <select id="sl-offer" required>
            <option value="">Select an offer...</option>
          </select>
          <div style="font-size:12px;color:var(--text2);margin-top:4px">Offers are loaded dynamically based on your permissions</div>
        </div>
        
        ${activeDomains.length > 0 ? `
          <div class="form-group" style="margin-top:16px">
            <label>Custom Domain</label>
            <select id="sl-domain">
              <option value="">Default (${defaultDomain?.domain || 'go.berkahkarya.org'})</option>
              ${activeDomains.map(d => `<option value="${d.id}">${d.domain}${d.is_default ? ' (default)' : ''}</option>`).join('')}
            </select>
            <div style="font-size:12px;color:var(--text2);margin-top:4px">Choose a custom domain for branded links</div>
          </div>
        ` : ''}
        
        ${activeShorteners.length > 0 ? `
          <div class="form-group" style="margin-top:16px">
            <label>URL Shortener (Optional)</label>
            <select id="sl-shortener">
              <option value="">None (use full smartlink URL)</option>
              ${activeShorteners.map(s => `<option value="${s.id}">${s.name}${s.is_default ? ' (default)' : ''}</option>`).join('')}
            </select>
            <div style="font-size:12px;color:var(--text2);margin-top:4px">Shorten the smartlink using ${activeShorteners.length === 1 ? 'a URL shortener' : 'one of the configured services'}</div>
          </div>
        ` : ''}
        
        <button type="submit" class="btn btn-primary" id="sl-btn" style="margin-top:24px">Generate Smartlink</button>
      </form>
      
      <div id="sl-result" style="margin-top:24px; display:none;">
        <div style="padding:16px; background:rgba(16,185,129,0.1); border:1px solid var(--green); border-radius:8px;">
          <label style="display:block; font-size:11px; color:var(--green); text-transform:uppercase; font-weight:700; margin-bottom:8px">Your Smartlink</label>
          <div style="display:flex; gap:12px;">
            <input type="text" id="sl-url" readonly style="flex:1; background:rgba(0,0,0,0.3); border:1px solid rgba(255,255,255,0.1); color:#fff; padding:10px 14px; border-radius:6px; font-family:monospace; font-size:13px;" value="">
            <button class="btn btn-outline" type="button" onclick="SmartlinkUI.copy()">Copy</button>
          </div>
          <div id="sl-short-result" style="margin-top:12px;display:none">
            <label style="display:block; font-size:11px; color:var(--indigo); text-transform:uppercase; font-weight:700; margin-bottom:8px">Shortened URL</label>
            <div style="display:flex; gap:12px;">
              <input type="text" id="sl-short-url" readonly style="flex:1; background:rgba(0,0,0,0.3); border:1px solid rgba(255,255,255,0.1); color:#fff; padding:10px 14px; border-radius:6px; font-family:monospace; font-size:13px;" value="">
              <button class="btn btn-outline" type="button" onclick="SmartlinkUI.copyShort()">Copy</button>
            </div>
          </div>
          <p style="font-size:12px; color:var(--text2); margin-top:12px">Append <code>&subid=YOUR_ID</code> to track specific traffic sources.</p>
        </div>
      </div>
    </div>
    
    <div class="card">
      <h3>Your Active Smartlinks</h3>
      <div id="sl-links-table">
        <div style="color:var(--text2);font-size:14px">Loading...</div>
      </div>
    </div>
    
    ${activeDomains.length === 0 && activeShorteners.length === 0 ? '' : `
      <div class="card">
        <h3>Quick Actions</h3>
        <div style="display:flex;gap:12px;flex-wrap:wrap">
          ${activeDomains.length === 0 ? '<a href="#domains" class="btn btn-outline btn-sm" onclick="Router.navigate(\'domains\')">Add Custom Domain</a>' : ''}
          ${activeShorteners.length === 0 ? '<a href="#shorteners" class="btn btn-outline btn-sm" onclick="Router.navigate(\'shorteners\')">Configure URL Shortener</a>' : ''}
        </div>
      </div>
    `}
  `;
  
  // Load existing smartlinks
  SmartlinkUI.loadLinks();
  
  // Load available offers
  SmartlinkUI.loadOffers();
};

window.SmartlinkUI = {
  async loadOffers() {
    const select = document.getElementById('sl-offer');
    if (!select) return;
    
    try {
      const offers = await API.get('/api/admin/offers');
      select.innerHTML = '<option value="">Select an offer...</option>' + 
        offers.filter(o => o.status === 'active').map(o => 
          `<option value="${o.id}">${o.name} ($${parseFloat(o.payout || 0).toFixed(2)})</option>`
        ).join('');
    } catch(e) {
      // If not admin, use static offers
      select.innerHTML = `
        <option value="">Select an offer...</option>
        <option value="1">Main Sweepstakes Pool</option>
        <option value="2">US/UK Dating Pool</option>
        <option value="3">Global Nutra</option>
      `;
    }
  },
  
  async loadLinks() {
    const container = document.getElementById('sl-links-table');
    if (!container) return;
    
    try {
      const links = await API.get('/api/smartlink/list');
      
      if (links.length === 0) {
        container.innerHTML = '<div style="color:var(--text2);font-size:14px">No smartlinks yet. Generate your first one above!</div>';
        return;
      }
      
      container.innerHTML = DOM.table(
        ['ID', 'Offer', 'URL', 'Domain', 'Clicks', 'Created'],
        links.map(l => [
          l.id,
          l.offer_name || `Offer #${l.offer_id}`,
          `<code style="background:var(--bg);padding:2px 6px;border-radius:4px;font-size:12px">${l.slug}</code>`,
          l.domain_name || 'Default',
          l.clicks || 0,
          new Date(l.created_at * 1000).toLocaleDateString()
        ])
      );
    } catch(e) {
      container.innerHTML = '<div style="color:var(--text2);font-size:14px">Unable to load smartlinks.</div>';
    }
  },
  
  async generate() {
    const btn = document.getElementById('sl-btn');
    const offerId = document.getElementById('sl-offer').value;
    const domainId = document.getElementById('sl-domain')?.value || null;
    const shortenerId = document.getElementById('sl-shortener')?.value || null;
    
    if (!offerId) {
      AppUI.toast('Please select an offer', 'error');
      return;
    }
    
    btn.disabled = true;
    btn.innerHTML = 'Generating...';
    
    try {
      const res = await API.post('/api/smartlink/generate', { 
        offer_id: parseInt(offerId),
        domain_id: domainId ? parseInt(domainId) : null,
        shortener_service_id: shortenerId ? parseInt(shortenerId) : null
      });
      
      document.getElementById('sl-result').style.display = 'block';
      document.getElementById('sl-url').value = res.url;
      
      // Show shortened URL if available
      if (res.short_url) {
        document.getElementById('sl-short-result').style.display = 'block';
        document.getElementById('sl-short-url').value = res.short_url;
      } else {
        document.getElementById('sl-short-result').style.display = 'none';
      }
      
      AppUI.toast('Smartlink generated successfully', 'success');
      
      // Reload the links table
      SmartlinkUI.loadLinks();
    } catch(e) {
      AppUI.toast(e.message || 'Failed to generate smartlink', 'error');
    } finally {
      btn.disabled = false;
      btn.innerHTML = 'Generate Smartlink';
    }
  },
  
  copy() {
    const el = document.getElementById('sl-url');
    el.select();
    document.execCommand('copy');
    AppUI.toast('Copied to clipboard', 'success');
  },
  
  copyShort() {
    const el = document.getElementById('sl-short-url');
    el.select();
    document.execCommand('copy');
    AppUI.toast('Short URL copied to clipboard', 'success');
  }
};