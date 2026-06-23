/**
 * Pipeline & Poster pages — TikTok→Meta distribution + Telegram Shopee poster
 */
window.PageRenderers = window.PageRenderers || {};

// ── Pipeline ────────────────────────────────────────────────────────────────
PageRenderers['pipeline'] = async function(el) {
  el.innerHTML = `
    ${DOM.pageHeader('TikTok Pipeline', 'Download TikTok videos, distribute to Facebook Pages & Instagram accounts via Meta Graph API.')}
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:24px">
      <div>
        <div class="card">
          <h3><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><polygon points="5 3 19 12 5 21 5 3"/></svg> Run Pipeline</h3>
          <form onsubmit="event.preventDefault(); PipelineUI.submit();">
            <div class="form-group">
              <label>TikTok Video URL</label>
              <input type="url" id="p-url" placeholder="https://vt.tiktok.com/..." required>
            </div>
            <div class="form-group">
              <label>Niche (optional)</label>
              <select id="p-niche">
                <option value="auto">Auto-detect</option>
                <option value="hijab">Hijab</option>
                <option value="sepatu">Sepatu</option>
                <option value="tas">Tas</option>
                <option value="atasan_pria">Atasan Pria</option>
                <option value="general">General</option>
              </select>
            </div>
            <button type="submit" class="btn btn-primary" id="p-submit-btn" style="width:100%">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><polygon points="5 3 19 12 5 21 5 3"/></svg> Start Pipeline
            </button>
          </form>
        </div>
        <div id="p-status" style="margin-top:16px"></div>
      </div>
      <div class="card">
        <h3><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg> Recent Jobs</h3>
        <div id="p-jobs"><div class="skeleton" style="height:40px;margin-bottom:8px"></div><div class="skeleton" style="height:40px;margin-bottom:8px"></div><div class="skeleton" style="height:40px"></div></div>
      </div>
    </div>
  `;

  // Load recent jobs
  try {
    const jobs = await API.get('/api/pipeline/jobs?limit=10');
    renderPipelineJobs(jobs);
    // Auto-refresh every 5s if there's an active job
    if (jobs.some(j => ['queued','downloading','processing','posting_fb','posting_ig'].includes(j.status))) {
      const timer = setInterval(async () => {
        const fresh = await API.get('/api/pipeline/jobs?limit=10');
        renderPipelineJobs(fresh);
        if (!fresh.some(j => ['queued','downloading','processing','posting_fb','posting_ig'].includes(j.status))) {
          clearInterval(timer);
        }
      }, 5000);
    }
  } catch { document.getElementById('p-jobs').innerHTML = '<div class="card"><p style="color:var(--text2)">Could not load jobs</p></div>'; }
};

function renderPipelineJobs(jobs) {
  const el = document.getElementById('p-jobs');
  if (!el) return;
  if (!jobs.length) { el.innerHTML = '<p style="color:var(--text2);font-size:13px">No pipeline jobs yet — submit a TikTok URL above.</p>'; return; }
  el.innerHTML = '<div class="table-wrap"><table><thead><tr><th>ID</th><th>Niche</th><th>Status</th><th>Created</th></tr></thead><tbody>' +
    jobs.map(j => {
      let pClass = 'pill-blue';
      if (j.status === 'completed') pClass = 'pill-green';
      if (j.status === 'failed') pClass = 'pill-red';
      const date = new Date(j.created_at * 1000).toLocaleString();
      return `<tr><td><code>#${j.id}</code></td><td>${j.niche || '—'}</td><td><span class="pill ${pClass}">${j.status}</span></td><td style="font-size:12px;color:var(--text2)">${date}</td></tr>`;
    }).join('') +
    '</tbody></table></div>';
}

// Pipeline submit handler
window.PipelineUI = window.PipelineUI || {
  async submit() {
    const url = document.getElementById('p-url').value.trim();
    const niche = document.getElementById('p-niche').value;
    if (!url) { AppUI.toast('Enter a TikTok URL', 'err'); return; }
    const btn = document.getElementById('p-submit-btn');
    btn.disabled = true;
    btn.style.opacity = '0.6';
    try {
      const res = await API.post('/api/pipeline/run', { url, niche: niche || 'auto' });
      AppUI.toast('Pipeline job #' + res.jobId + ' started!', 'ok');
      document.getElementById('p-url').value = '';
      // Refresh jobs after delay
      setTimeout(async () => {
        const jobs = await API.get('/api/pipeline/jobs?limit=10');
        renderPipelineJobs(jobs);
      }, 2000);
    } catch (e) {
      AppUI.toast(e.message || 'Failed to start pipeline', 'err');
    }
    btn.disabled = false;
    btn.style.opacity = '1';
  }
};

// ── Poster ──────────────────────────────────────────────────────────────────
PageRenderers['poster'] = async function(el) {
  el.innerHTML = `
    ${DOM.pageHeader('Shopee Poster', 'Manage Telegram Shopee product queue. Posts are sent automatically by the cron worker.')}
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:24px">
      <div>
        <div class="card">
          <h3><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg> Add Product</h3>
          <form onsubmit="event.preventDefault(); PosterUI.addToQueue();" id="poster-add-form">
            <div class="form-group"><label>Product Name</label><input type="text" id="po-name" placeholder="e.g. Sepatu Nike Air Max" required></div>
            <div class="form-group"><label>Product URL</label><input type="url" id="po-url" placeholder="https://shopee.co.id/..." required></div>
            <div class="form-group"><label>Image URL (optional)</label><input type="url" id="po-img" placeholder="https://..."></div>
            <div class="form-row">
              <div class="form-group"><label>Normal Price</label><input type="number" id="po-normal" placeholder="299000" required></div>
              <div class="form-group"><label>Promo Price</label><input type="number" id="po-promo" placeholder="199000" required></div>
            </div>
            <div class="form-group"><label>Affiliate Link</label><input type="url" id="po-aff" placeholder="https://shp.ee/..."></div>
            <button type="submit" class="btn btn-primary" style="width:100%">Add to Queue</button>
          </form>
        </div>
        <div style="display:flex;gap:8px;margin-top:12px">
          <button class="btn btn-outline btn-sm" onclick="PosterUI.triggerNow()">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><polygon points="5 3 19 12 5 21 5 3"/></svg> Trigger Now
          </button>
          <button class="btn btn-outline btn-sm" onclick="PosterUI.testMessage()">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 2L11 13"/><path d="M22 2l-7 20-4-9-9-4 20-7z"/></svg> Send Test
          </button>
        </div>
      </div>
      <div class="card">
        <h3><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></svg> Queue</h3>
        <div id="po-queue"><div class="skeleton" style="height:60px;margin-bottom:8px"></div><div class="skeleton" style="height:60px"></div></div>
      </div>
    </div>
  `;

  try {
    const rows = await API.get('/api/poster/queue?limit=50');
    renderPosterQueue(rows);
  } catch { document.getElementById('po-queue').innerHTML = '<p style="color:var(--text2)">Could not load queue</p>'; }
};

function renderPosterQueue(rows) {
  const el = document.getElementById('po-queue');
  if (!el) return;
  if (!rows.length) { el.innerHTML = '<p style="color:var(--text2);font-size:13px">Queue is empty — add a product above.</p>'; return; }
  el.innerHTML = '<div class="table-wrap"><table><thead><tr><th>Product</th><th>Prices</th><th>Status</th><th>Actions</th></tr></thead><tbody>' +
    rows.map(r => {
      let pClass = 'pill-yellow';
      if (r.status === 'posted') pClass = 'pill-green';
      if (r.status === 'failed') pClass = 'pill-red';
      const prices = `<s style="color:var(--text2);font-size:11px">Rp${parseInt(r.normal_price).toLocaleString('id-ID')}</s> <b>Rp${parseInt(r.promo_price).toLocaleString('id-ID')}</b>`;
      return `<tr>
        <td><div style="font-weight:600">${r.product_name}</div><div style="font-size:11px;color:var(--text2)">${r.product_url}</div></td>
        <td>${prices}</td>
        <td><span class="pill ${pClass}">${r.status}</span>${r.error_message ? `<div style="font-size:11px;color:var(--red);margin-top:4px">${r.error_message.slice(0,80)}</div>` : ''}</td>
        <td><button class="btn btn-danger btn-sm" onclick="PosterUI.removeFromQueue(${r.id})">Delete</button></td>
      </tr>`;
    }).join('') +
    '</tbody></table></div>';
}

window.PosterUI = window.PosterUI || {
  async addToQueue() {
    const data = {
      product_name: document.getElementById('po-name').value.trim(),
      product_url: document.getElementById('po-url').value.trim(),
      image_url: document.getElementById('po-img').value.trim(),
      normal_price: parseInt(document.getElementById('po-normal').value),
      promo_price: parseInt(document.getElementById('po-promo').value),
      affiliate_link: document.getElementById('po-aff').value.trim(),
    };
    if (!data.product_name || !data.product_url || !data.normal_price || !data.promo_price) {
      AppUI.toast('Fill all required fields', 'err');
      return;
    }
    try {
      const res = await API.post('/api/poster/queue', data);
      AppUI.toast('Product #' + res.id + ' added to queue', 'ok');
      document.getElementById('poster-add-form').reset();
      const rows = await API.get('/api/poster/queue?limit=50');
      renderPosterQueue(rows);
    } catch (e) {
      AppUI.toast(e.message || 'Failed to add product', 'err');
    }
  },

  async triggerNow() {
    try {
      const res = await API.post('/api/poster/trigger');
      AppUI.toast(res.posted ? 'Posted: ' + res.posted.product_name : 'No pending products', 'ok');
      const rows = await API.get('/api/poster/queue?limit=50');
      renderPosterQueue(rows);
    } catch (e) {
      AppUI.toast(e.message || 'Trigger failed', 'err');
    }
  },

  async testMessage() {
    try {
      await API.post('/api/poster/test');
      AppUI.toast('Test message sent to channel', 'ok');
    } catch (e) {
      AppUI.toast(e.message || 'Test failed — check TG_BOT_TOKEN', 'err');
    }
  },

  async removeFromQueue(id) {
    const ok = await AppUI.confirm({ title: 'Delete from queue?', message: 'Remove product #' + id + ' from the poster queue?', danger: true });
    if (!ok) return;
    try {
      await API.del('/api/poster/queue/' + id);
      AppUI.toast('Deleted #' + id, 'ok');
      const rows = await API.get('/api/poster/queue?limit=50');
      renderPosterQueue(rows);
    } catch (e) {
      AppUI.toast(e.message || 'Delete failed', 'err');
    }
  }
};
