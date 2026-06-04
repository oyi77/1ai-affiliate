/**
 * Admin Panel Page — system status, GeoIP, version
 * Depends on: API, UI, Fmt, Router
 */
Router.register('admin', async (target) => {
  const status = await API.get('/api/admin/system').catch(() => ({}));
  const geoipItems = [
    { name: 'Country.mmdb', size: status.geoip_country || 'Missing', ok: !!status.geoip_country },
    { name: 'GeoLite2-ASN.mmdb', size: status.geoip_asn || 'Missing', ok: !!status.geoip_asn },
  ];

  target.innerHTML = `
    ${UI.pageHeader('Admin Panel', 'System status & maintenance')}
    <div class="space-y-4">
      ${UI.panel('System Status', `
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          ${UI.statCard({ label: 'DB Version', value: status.version || '—', accent: 'indigo' })}
          ${UI.statCard({ label: 'Cron Last Run', value: status.cron?.last_execution ? Fmt.date(status.cron.last_execution) : 'Never', accent: 'green' })}
          ${UI.statCard({ label: 'DE Queue', value: `${status.dataengine_done || 0}/${status.dataengine_total || 0}`, sub: `${status.dataengine_progress || 0}% complete`, accent: 'yellow' })}
          ${UI.statCard({ label: 'Server Time', value: new Date().toLocaleString('id-ID'), accent: 'indigo' })}
        </div>
      `)}

      ${UI.panel('GeoIP Databases <span class="text-xs muted font-normal">(Loyalsoldier/geoip)</span>', `
        <div class="space-y-2">
          ${geoipItems.map(f => `
            <div class="flex items-center justify-between panel-2 rounded-lg px-3 py-2">
              <div>
                <div class="text-sm font-medium">${f.name}</div>
                <div class="text-xs muted">${status.isp_enabled ? 'Enabled' : 'Disabled'}</div>
              </div>
              <div>${f.ok ? UI.pill(f.size, 'ok') : UI.pill('Missing', 'err')}</div>
            </div>
          `).join('')}
        </div>
      `)}

      ${UI.panel('Version Info', `
        <div class="text-sm muted">Server: Node ${status.node_version || '—'} | PHP ${status.php_version || '—'}</div>
        <div class="text-xs muted mt-1">Updates via git. No self-upgrade available.</div>
      `)}
    </div>
  `;
});