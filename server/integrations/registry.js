'use strict';

/**
 * Integration Registry
 * Single entry point for all ad platform integrations.
 * Each integration is a module in ./platforms/ that exports:
 *   { meta, testConnection, fetchStats }
 *
 * Adding a new integration = drop a file in ./platforms/, done.
 */

const fs = require('fs');
const path = require('path');

const integrations = new Map();

// Auto-load all .js files from ./platforms/
const platformsDir = path.join(__dirname, 'platforms');
if (fs.existsSync(platformsDir)) {
  for (const file of fs.readdirSync(platformsDir).filter(f => f.endsWith('.js') && !f.startsWith('_'))) {
    const mod = require(path.join(platformsDir, file));
    if (mod.meta?.id) integrations.set(mod.meta.id, mod);
  }
}

/**
 * Get all registered integrations (for marketplace UI).
 */
function listAll() {
  return [...integrations.values()].map(m => ({
    id: m.meta.id,
    name: m.meta.name,
    icon: m.meta.icon,
    description: m.meta.description,
    auth_fields: m.meta.auth_fields,
    cost_models: m.meta.cost_models,
  }));
}

/**
 * Get a specific integration by platform_type id.
 */
function get(platformType) {
  return integrations.get(platformType) || null;
}

/**
 * Test connection for a platform.
 */
async function testConnection(platformType, config) {
  const mod = integrations.get(platformType);
  if (!mod) throw new Error(`Unknown integration: ${platformType}`);
  return mod.testConnection(config);
}

/**
 * Sync stats for a platform into 1ai_meta_daily_stats.
 * Returns { synced, errors }.
 */
async function sync(platformType, pool, trafficSourceId, config, dateFrom, dateTo) {
  const mod = integrations.get(platformType);
  if (!mod) throw new Error(`Unknown integration: ${platformType}`);
  return mod.fetchStats(pool, trafficSourceId, config, dateFrom, dateTo);
}

module.exports = { listAll, get, testConnection, sync };
