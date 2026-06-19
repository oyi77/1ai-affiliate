'use strict';

/**
 * Auto-sync all connected traffic sources.
 * Uses the integration registry — no platform-specific logic here.
 *
 * ponytail: one function, registry dispatches. Zero platform knowledge in this file.
 */

const pool = require('../db/mysql');

async function syncAllTrafficSources() {
  const registry = require('../integrations/registry');
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
  const today = new Date().toISOString().split('T')[0];

  const [sources] = await pool.query(
    `SELECT id, platform_type, api_config FROM 1ai_traffic_sources
     WHERE api_config IS NOT NULL`
  ).catch(() => [[]]);

  let totalSynced = 0;
  const allErrors = [];

  for (const ts of sources) {
    const integration = registry.get(ts.platform_type);
    if (!integration) continue;

    let config;
    try { config = typeof ts.api_config === 'string' ? JSON.parse(ts.api_config) : ts.api_config; } catch { continue; }
    if (!config) continue;

    try {
      const result = await registry.sync(ts.platform_type, pool, ts.id, config, yesterday, today);
      totalSynced += result.synced;
      if (result.errors.length) allErrors.push(...result.errors.map(e => `TS#${ts.id}: ${e}`));
    } catch (err) {
      allErrors.push(`TS#${ts.id} (${ts.platform_type}): ${err.message}`);
    }
  }

  console.log(`[AutoSync] ${totalSynced} rows across ${sources.length} sources. Errors: ${allErrors.length}`);
  return { synced: totalSynced, errors: allErrors };
}

module.exports = { syncAllTrafficSources };
