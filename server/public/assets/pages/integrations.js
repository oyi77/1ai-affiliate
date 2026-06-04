/**
 * Integrations Page — API keys for third-party services
 * Depends on: API, UI, Fmt, Router
 */
Router.register('integrations', async (target) => {
  const data = await API.get('/api/settings/integrations').catch(() => ({}));
  const keys = [
    { key: 'slack_webhook', label: 'Slack Webhook' },
    { key: 'clickserver_api_key', label: 'ClickServer API Key' },
    { key: 'customer_api_key', label: 'Customer/License Key' },
    { key: 'clickbank_key', label: 'ClickBank Key' },
    { key: 'jvzoo_secret', label: 'JVZoo Secret' },
    { key: 'zaxaa_signature', label: 'Zaxaa Signature' },
    { key: 'ipqs_api_key', label: 'IPQualityScore Key' },
  ];

  target.innerHTML = `
    ${UI.pageHeader('Integrations', 'API keys & third-party connections')}
    ${UI.panel('Integration Keys', `
      <div class="space-y-3">${keys.map(k => `
        <div class="flex items-center justify-between panel-2 rounded-lg px-4 py-3">
          <div>
            <div class="text-sm font-medium">${k.label}</div>
            <div class="text-xs font-mono muted">${Fmt.maskKey(data[k.key], 6)}</div>
          </div>
          <button class="px-3 py-1.5 rounded-lg text-xs font-semibold panel hover:bg-gray-700" onclick="PageActions.editIntegration('${k.key}','${k.label}')">Edit</button>
        </div>
      `).join('')}</div>
    `)}
  `;
  PageActions._integrationsData = data;
});

const PageActions = {
  async editIntegration(key, label) {
    const data = PageActions._integrationsData || await API.get('/api/settings/integrations');
    const val = prompt(`Enter ${label}:`, data[key] || '');
    if (val === null) return;
    try { await API.put('/api/settings/integrations', { key, value: val }); Router.navigateTo('integrations'); }
    catch (err) { alert('Failed: ' + err.message); }
  },
  _integrationsData: null,
};