const BEMOB_BASE = 'https://api.bemob.com/v1';

async function bemobRequest(accessKey, secretKey, endpoint) {
  const resp = await fetch(`${BEMOB_BASE}/${endpoint}?limit=500`, {
    headers: { 'X-ACCESS-KEY': accessKey, 'X-SECRET-KEY': secretKey },
  });
  const data = await resp.json();
  if (!data.success) throw new Error(data.message || `BeMob API error on ${endpoint}`);
  return data.payload || [];
}

const COUNTRY_MAP = { 83: 'ID', 0: 'GLOBAL', 1: 'US', 44: 'GB', 14: 'AU', 39: 'DE', 69: 'MY', 73: 'NG', 78: 'PH', 87: 'TH', 99: 'VN' };
const STATUS_MAP = { active: 'active', archived: 'paused', deleted: 'archived' };

function mapCountry(countryId) {
  if (countryId === undefined || countryId === null) return 'GLOBAL';
  return COUNTRY_MAP[countryId] || 'GLOBAL';
}

function mapStatus(status) {
  return STATUS_MAP[status] || 'active';
}

function now() {
  return Math.floor(Date.now() / 1000);
}

async function importFromBeMob(userId, pool, config) {
  const { access_key, secret_key, dry_run } = config;
  if (!access_key || !secret_key) throw new Error('access_key and secret_key are required');

  const result = { networks: 0, traffic_sources: 0, offers: 0, campaigns: 0, flows: 0, errors: [] };

  // 1. Fetch all data from BeMob
  let bemobNetworks = [], bemobTrafficSources = [], bemobOffers = [], bemobCampaigns = [], bemobFlows = [];
  try {
    [bemobNetworks, bemobTrafficSources, bemobOffers, bemobCampaigns, bemobFlows] = await Promise.all([
      bemobRequest(access_key, secret_key, 'affiliate-networks'),
      bemobRequest(access_key, secret_key, 'traffic-sources'),
      bemobRequest(access_key, secret_key, 'offers'),
      bemobRequest(access_key, secret_key, 'campaigns'),
      bemobRequest(access_key, secret_key, 'flows'),
    ]);
  } catch (err) {
    throw new Error(`Failed to fetch BeMob data: ${err.message}`);
  }

  if (dry_run) {
    return {
      ...result,
      networks: bemobNetworks.length,
      traffic_sources: bemobTrafficSources.length,
      offers: bemobOffers.length,
      campaigns: bemobCampaigns.length,
      flows: bemobFlows.length,
      dry_run: true,
    };
  }

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    // 2. Import Networks — deduplicate by name
    const networkMap = new Map(); // bemobId → ourId
    const seenNetworks = new Set();
    for (const n of bemobNetworks) {
      const name = n.name || n.affiliateNetworkName || `Network ${n.id}`;
      if (seenNetworks.has(name)) {
        // Map duplicate BeMob ID to the already-inserted one
        const existingId = networkMap.get([...networkMap.entries()].find(([, v]) => v.name === name)?.[0]);
        if (existingId) networkMap.set(n.id, existingId);
        continue;
      }
      seenNetworks.add(name);
      try {
        const status = mapStatus(n.status);
        const [existing] = await conn.query('SELECT id FROM 1ai_networks WHERE name = ?', [name]);
        let networkId;
        if (existing.length) {
          await conn.query('UPDATE 1ai_networks SET status = ? WHERE id = ?', [status, existing[0].id]);
          networkId = existing[0].id;
        } else {
          const [r] = await conn.query(
            'INSERT INTO 1ai_networks (name, status, created_at) VALUES (?, ?, ?)',
            [name, status, now()]
          );
          networkId = r.insertId;
        }
        networkMap.set(n.id, { id: networkId, name });
        result.networks++;
      } catch (err) {
        result.errors.push(`Network ${name}: ${err.message}`);
      }
    }

    // 3. Import Traffic Sources
    const tsMap = new Map(); // bemobId → ourId
    for (const ts of bemobTrafficSources) {
      const name = ts.name || ts.trafficSourceName || `Traffic Source ${ts.id}`;
      try {
        // Extract custom params from BeMob
        const customParams = {};
        if (ts.customParams1) customParams.param1 = ts.customParams1;
        if (ts.customParams2) customParams.param2 = ts.customParams2;
        if (ts.customParams3) customParams.param3 = ts.customParams3;
        if (ts.customParams4) customParams.param4 = ts.customParams4;
        if (ts.customParams5) customParams.param5 = ts.customParams5;
        if (ts.customParams6) customParams.param6 = ts.customParams6;
        if (ts.customParams7) customParams.param7 = ts.customParams7;
        if (ts.customParams8) customParams.param8 = ts.customParams8;
        if (ts.customParams9) customParams.param9 = ts.customParams9;
        if (ts.customParams10) customParams.param10 = ts.customParams10;

        const [existing] = await conn.query(
          'SELECT id FROM 1ai_traffic_sources WHERE user_id = ? AND name = ?', [userId, name]
        );
        let tsId;
        if (existing.length) {
          await conn.query(
            'UPDATE 1ai_traffic_sources SET platform_type = ?, cost_model = ?, currency = ?, api_config = ?, updated_at = ? WHERE id = ?',
            [ts.type || 'social', ts.costModel || 'CPC', ts.currency || 'IDR', JSON.stringify({ custom_params: customParams, bemob_id: ts.id }), now(), existing[0].id]
          );
          tsId = existing[0].id;
        } else {
          const [r] = await conn.query(
            'INSERT INTO 1ai_traffic_sources (user_id, name, platform_type, cost_model, currency, api_config, is_active, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, 1, ?, ?)',
            [userId, name, ts.type || 'social', ts.costModel || 'CPC', ts.currency || 'IDR', JSON.stringify({ custom_params: customParams, bemob_id: ts.id }), now(), now()]
          );
          tsId = r.insertId;
        }
        tsMap.set(ts.id, { id: tsId, name });
        result.traffic_sources++;
      } catch (err) {
        result.errors.push(`Traffic Source ${name}: ${err.message}`);
      }
    }

    // 4. Import Offers
    const offerMap = new Map(); // bemobId → ourId
    for (const o of bemobOffers) {
      const name = o.name || o.offerName || `Offer ${o.id}`;
      try {
        const networkEntry = o.affiliateNetworkId ? networkMap.get(o.affiliateNetworkId) : null;
        const networkId = networkEntry ? (typeof networkEntry === 'object' ? networkEntry.id : networkEntry) : null;
        const status = mapStatus(o.status);
        const geo = mapCountry(o.countryId);
        const payoutCurrency = o.payoutCurrency || 'USD';
        const type = o.payoutType === 'auto' ? 'CPA' : (o.payoutType || 'CPA').toUpperCase();
        const affiliateUrl = o.url || '';

        const [existing] = await conn.query(
          'SELECT id FROM 1ai_offers WHERE name = ? AND (network_id <=> ? OR network_id IS NULL)',
          [name, networkId]
        );
        let offerId;
        if (existing.length) {
          await conn.query(
            'UPDATE 1ai_offers SET network_id = ?, affiliate_url = ?, type = ?, payout_currency = ?, geo = ?, status = ?, updated_at = ? WHERE id = ?',
            [networkId, affiliateUrl, type, payoutCurrency, geo, status, now(), existing[0].id]
          );
          offerId = existing[0].id;
        } else {
          const [r] = await conn.query(
            'INSERT INTO 1ai_offers (name, network_id, affiliate_url, type, payout_currency, geo, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [name, networkId, affiliateUrl, type, payoutCurrency, geo, status, now(), now()]
          );
          offerId = r.insertId;
        }
        offerMap.set(o.id, { id: offerId, name });
        result.offers++;
      } catch (err) {
        result.errors.push(`Offer ${name}: ${err.message}`);
      }
    }

    // 5. Import Campaigns
    const campaignMap = new Map(); // bemobId → ourId
    for (const c of bemobCampaigns) {
      const name = c.name || c.campaignName || `Campaign ${c.id}`;
      try {
        const status = mapStatus(c.status);
        const payoutType = c.payoutType === 'auto' ? 'CPA' : 'CPA';

        const [existing] = await conn.query(
          'SELECT aff_campaign_id FROM 1ai_aff_campaigns WHERE aff_campaign_name = ?', [name]
        );
        let campaignId;
        const campaignStatus = status === 'active' ? 'active' : (status === 'archived' ? 'deleted' : 'paused');
        if (existing.length) {
          await conn.query(
            'UPDATE 1ai_aff_campaigns SET aff_campaign_status = ? WHERE aff_campaign_id = ?',
            [campaignStatus, existing[0].aff_campaign_id]
          );
          campaignId = existing[0].aff_campaign_id;
        } else {
          const [r] = await conn.query(
            'INSERT INTO 1ai_aff_campaigns (aff_campaign_name, aff_campaign_status, aff_campaign_payout_type) VALUES (?, ?, ?)',
            [name, campaignStatus, 'CPA']
          );
          campaignId = r.insertId;
        }
        campaignMap.set(c.id, { id: campaignId, name });

        // Link offers to campaign via 1ai_offer_campaigns
        const offerIds = c.offerIds || c.campaignOffers || [];
        for (const bemobOfferId of offerIds) {
          const offerEntry = offerMap.get(bemobOfferId);
          if (!offerEntry) continue;
          try {
            const [existingLink] = await conn.query(
              'SELECT id FROM 1ai_offer_campaigns WHERE offer_id = ? AND aff_campaign_id = ?',
              [offerEntry.id, campaignId]
            );
            if (!existingLink.length) {
              await conn.query(
                'INSERT INTO 1ai_offer_campaigns (offer_id, campaign_id, aff_campaign_id, weight, status, created_at) VALUES (?, ?, ?, 100, "active", ?)',
                [offerEntry.id, campaignId, campaignId, now()]
              );
            }
          } catch (linkErr) {
            // Non-fatal
          }
        }

        result.campaigns++;
      } catch (err) {
        result.errors.push(`Campaign ${name}: ${err.message}`);
      }
    }

    // 6. Import Flows as traffic rules
    for (const f of bemobFlows) {
      const name = f.name || f.flowName || `Flow ${f.id}`;
      try {
        // Map flow paths/rules to our traffic_rules conditions
        const conditions = {
          bemob_flow_id: f.id,
          type: 'flow',
          paths: f.paths || [],
          rules: f.rules || [],
        };

        // Try to find the primary offer from the flow
        const firstPath = (f.paths || [])[0];
        const firstOfferId = firstPath?.offers?.[0]?.offerId;
        const offerEntry = firstOfferId ? offerMap.get(firstOfferId) : null;

        const [existing] = await conn.query(
          'SELECT id FROM 1ai_traffic_rules WHERE user_id = ? AND name = ?', [userId, name]
        );
        if (existing.length) {
          await conn.query(
            'UPDATE 1ai_traffic_rules SET conditions = ?, offer_id = ?, updated_at = ? WHERE id = ?',
            [JSON.stringify(conditions), offerEntry?.id || null, now(), existing[0].id]
          );
        } else {
          await conn.query(
            'INSERT INTO 1ai_traffic_rules (user_id, name, offer_id, conditions, action, enabled, priority, created_at, updated_at) VALUES (?, ?, ?, ?, "redirect", 1, 0, ?, ?)',
            [userId, name, offerEntry?.id || null, JSON.stringify(conditions), now(), now()]
          );
        }
        result.flows++;
      } catch (err) {
        result.errors.push(`Flow ${name}: ${err.message}`);
      }
    }

    await conn.commit();
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }

  return result;
}

module.exports = { importFromBeMob };
