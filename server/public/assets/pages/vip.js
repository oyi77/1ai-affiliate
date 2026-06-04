/**
 * VIP Perks Page — exclusive offers & enhanced payouts
 * Depends on: API, UI, Fmt, Router
 */
Router.register('vip', async (target) => {
  let profile = {};
  try { profile = await API.get('/api/settings/profile'); } catch {}

  target.innerHTML = `
    ${UI.pageHeader('VIP Perks', 'Exclusive offers & enhanced payouts')}
    <div class="space-y-4">
      ${UI.emptyState('\u2B50', 'VIP Perks Program', 'Complete your profile survey to get matched with exclusive offers, enhanced payouts, and priority support from top networks.')}
      ${UI.panel('Your Profile', `
        <div class="space-y-2 text-sm">
          ${UI.keyValueRow('Username', profile.username || '—')}
          ${UI.keyValueRow('Email', profile.email || '—')}
          ${UI.keyValueRow('Status', UI.pill('Active', 'ok'))}
        </div>
        <p class="muted text-xs mt-3">VIP Perks survey functionality coming soon. Contact support for early access.</p>
      `)}
    </div>
  `;
});