window.PageRenderers = window.PageRenderers || {};

PageRenderers['adv-integrations'] = async function(el) {
  el.innerHTML = `
    ${DOM.pageHeader('Advertiser API & Webhooks', 'Connect your tracking systems automatically')}
    
    <div class="card" style="max-width:800px; margin-bottom:24px;">
      <h3 style="margin-bottom:16px; display:flex; align-items:center; gap:8px;">
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
        Postback URL (S2S Tracking)
      </h3>
      <p style="font-size:13px; color:var(--text2); margin-bottom:16px;">
        Fire this postback URL from your network or custom platform to record conversions in our system.
      </p>
      <div style="display:flex; gap:12px;">
        <input type="text" readonly style="flex:1; background:rgba(0,0,0,0.3); border:1px solid var(--border); color:#fff; padding:10px; border-radius:6px; font-family:monospace; font-size:12px;" value="https://track.1ai-affiliate.com/postback?click_id={click_id}&payout={payout}">
        <button class="btn btn-outline" onclick="AppUI.toast('Postback Copied!', 'success')">Copy</button>
      </div>
    </div>

    <div class="card" style="max-width:800px">
      <h3 style="margin-bottom:16px">3rd Party Network Sync</h3>
      <p style="font-size:13px; color:var(--text2); margin-bottom:24px;">
        Automatically pull your approved offers from external networks (e.g. ClickDealer, Advidi) directly into our system.
      </p>
      
      <form onsubmit="event.preventDefault(); AppUI.toast('API Key saved successfully', 'success')">
        <div class="form-group">
          <label>Network</label>
          <select required>
            <option value="clickdealer">ClickDealer</option>
            <option value="advidi">Advidi</option>
            <option value="custom">Custom REST API</option>
          </select>
        </div>
        <div class="form-group">
          <label>API Key / Bearer Token</label>
          <input type="password" required placeholder="Enter your API key">
        </div>
        <button type="submit" class="btn btn-primary">Connect Network</button>
      </form>
    </div>
  `;
};
