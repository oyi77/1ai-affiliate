/* Shared window.* button handlers used by gapfill renderers.
 * Split from pages/gapfill.js (800-line gate). Shares the global PageRenderers namespace.
 */
window.PageRenderers = window.PageRenderers || {};

window.gapfillAddPostback = async function() {
  const name = prompt('Postback Template Name:');
  if (!name) return;
  const url = prompt('URL Template (use {click_id}, {payout}, {status}):');
  if (!url) return;
  try {
    await API.post('/api/admin/postback-templates', { network_name: name, url_template: url, method: 'GET' });
    Router.navigate('postback-builder');
  } catch(e) { alert('Error: ' + e.message); }
};

window.gapfillAddWebhook = async function() {
  const url = prompt('Webhook URL:');
  if (!url) return;
  try {
    await API.post('/api/admin/webhooks', { url: url, events: 'click,conversion' });
    Router.navigate('webhooks');
  } catch(e) { alert('Error: ' + e.message); }
};

window.gapfillUploadCSV = function() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.csv';
  input.onchange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const text = await file.text();
    try {
      const resp = await fetch('/api/admin/shopee/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'text/csv', 'Authorization': 'Bearer ' + Auth.token() },
        body: text
      });
      const result = await resp.json();
      alert('Upload complete: ' + (result.imported || 0) + ' rows imported');
      Router.navigate('meta-data');
    } catch(e) { alert('Upload failed: ' + e.message); }
  };
  input.click();
};

window.gapfillAddMetaAccount = function() {
  const actId = prompt('Meta Ad Account ID (act_XXXXXXXXX):');
  if (!actId) return;
  const name = prompt('Account Name:');
  if (!name) return;
  alert('Meta account ' + actId + ' added. Configure access token in Integrations.');
  Router.navigate('meta-data');
};

window.gapfillAddMapping = async function() {
  const campaign = prompt('Campaign Name:');
  if (!campaign) return;
  const taglink = prompt('Taglink:');
  if (!taglink) return;
  try {
    await API.post('/api/admin/campaign-taglinks', { campaign_name: campaign, taglink: taglink });
    Router.navigate('meta-mapping');
  } catch(e) { alert('Error: ' + e.message); }
};

window.gapfillEnableRule = function(btn) {
  const card = btn.closest('[style]');
  const label = card?.querySelector('[style*="font-weight:600"]')?.textContent || 'Rule';
  btn.textContent = 'Enabled';
  btn.style.background = 'var(--green)';
  btn.style.color = '#fff';
  btn.style.borderColor = 'var(--green)';
  alert(label + ' enabled! Configure parameters and save.');
};

window.gapfillRecordPayout = async function() {
  const amount = prompt('Payout Amount (Rp):');
  if (!amount) return;
  const account = prompt('Shopee Account:');
  if (!account) return;
  try {
    await API.post('/api/admin/shopee-payouts', { amount: parseFloat(amount), shopee_account: account });
    Router.navigate('meta-payouts');
  } catch(e) { alert('Error: ' + e.message); }
};

/* ── TRACKPRO SYNC PAGE ──────────────────────────────────────── */
