/**
 * ClickServers Page — domain management
 * Depends on: API, UI, Router
 */
Router.register('clickservers', async (target) => {
  target.innerHTML = `
    ${UI.pageHeader('ClickServers', 'Domain management & health')}
    <div class="space-y-4">
      ${UI.panel('ClickServer Domains', `
        <p class="muted text-sm mb-4">ClickServer domain management requires a valid ClickServer API key. Configure it in <a href="#" onclick="Router.navigateTo('settings')" class="text-indigo-400 hover:text-indigo-300">Settings</a>.</p>
        <div class="text-sm muted">Domains are loaded from the ClickServer API. Once configured, they will appear here with activation status.</div>
      `)}
      ${UI.panel('How ClickServers Work', `
        <div class="text-sm muted space-y-2">
          <p>ClickServers handle redirect and tracking URLs. Each domain that points to this tracker records clicks, conversions, and attribution data.</p>
          <p>Add domains through the ClickServer dashboard, then they appear in tracking links automatically.</p>
        </div>
      `)}
    </div>
  `;
});