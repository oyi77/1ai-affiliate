window.PageRenderers = window.PageRenderers || {};

PageRenderers.smartlink = async function(el) {
  el.innerHTML = `
    ${DOM.pageHeader('Smartlink Generator', 'Create geo and device-optimized routing links')}
    
    <div class="card" style="max-width:800px">
      <h3 style="margin-bottom:16px">Create New Smartlink</h3>
      <p style="font-size:13px; color:var(--text2); margin-bottom:24px">
        A smartlink automatically redirects your traffic to the best performing offer based on the user's location and device.
      </p>
      
      <form onsubmit="event.preventDefault(); SmartlinkUI.generate()">
        <div class="form-group">
          <label>Campaign / Traffic Source</label>
          <select id="sl-campaign" required>
            <option value="">Select a Campaign...</option>
            <option value="1">Main Sweepstakes Pool</option>
            <option value="2">US/UK Dating Pool</option>
            <option value="3">Global Nutra</option>
          </select>
        </div>
        
        <button type="submit" class="btn btn-primary" id="sl-btn">Generate Smartlink</button>
      </form>
      
      <div id="sl-result" style="margin-top:24px; display:none;">
        <div style="padding:16px; background:rgba(16,185,129,0.1); border:1px solid var(--green); border-radius:8px;">
          <label style="display:block; font-size:11px; color:var(--green); text-transform:uppercase; font-weight:700; margin-bottom:8px">Your Smartlink</label>
          <div style="display:flex; gap:12px;">
            <input type="text" id="sl-url" readonly style="flex:1; background:rgba(0,0,0,0.3); border:1px solid rgba(255,255,255,0.1); color:#fff; padding:10px 14px; border-radius:6px; font-family:monospace; font-size:13px;" value="">
            <button class="btn btn-outline" type="button" onclick="SmartlinkUI.copy()">Copy</button>
          </div>
          <p style="font-size:12px; color:var(--text2); margin-top:12px">Append <code>&subid=YOUR_ID</code> to track specific traffic sources.</p>
        </div>
      </div>
    </div>
    
    <div class="card">
      <h3>Your Active Smartlinks</h3>
      ${DOM.table(
        ['ID', 'Campaign', 'Link Token', 'Status', 'Created'],
        [
          ['1042', 'Main Sweepstakes Pool', '<code>a1b2c3d4e5</code>', DOM.badge('Active', 'green'), '2023-10-12'],
          ['1043', 'US/UK Dating Pool', '<code>f6g7h8i9j0</code>', DOM.badge('Active', 'green'), '2023-10-14']
        ]
      )}
    </div>
  `;
};

window.SmartlinkUI = {
  async generate() {
    const btn = document.getElementById('sl-btn');
    const campId = document.getElementById('sl-campaign').value;
    
    btn.disabled = true;
    btn.innerHTML = 'Generating...';
    
    try {
      const res = await API.post('/api/smartlink/generate', { campaign_id: campId });
      document.getElementById('sl-result').style.display = 'block';
      document.getElementById('sl-url').value = res.url;
      AppUI.toast('Smartlink generated successfully', 'success');
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
  }
};
