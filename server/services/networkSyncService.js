'use strict';

/**
 * Network Offer Sync Service
 * Pulls offers from affiliate network APIs and stores them in 1ai_offers.
 * 
 * Supports: Passio.eco, Involve Asia, AccessTrade, Indoleads, Travelpayouts
 * Each network has different API formats — adapters normalize to a common schema.
 */

const pool = require('../db/mysql');

// ── Network Adapters ──────────────────────────────────────────

async function fetchPassioOffers(credentials) {
  const { api_token, private_token } = credentials;
  const url = `https://affiliate.passio.eco/pub-api/offers?api_token=${api_token}&private_token=${private_token}&limit=100`;
  
  try {
    const resp = await fetch(url, { redirect: 'follow', signal: AbortSignal.timeout(15000) });
    const text = await resp.text();
    
    // Check if response is HTML (redirect) instead of JSON
    if (text.startsWith('<!DOCTYPE') || text.startsWith('<html')) {
      return { offers: [], error: 'API redirected to login — token may be expired' };
    }
    
    const data = JSON.parse(text);
    const offers = (data.data || data.offers || data || []).map(o => ({
      network_offer_id: String(o.id || o.offer_id),
      name: o.name || o.title || 'Unknown',
      description: o.description || '',
      type: o.type || 'CPA',
      payout: parseFloat(o.payout || o.commission || 0),
      payout_currency: o.currency || 'IDR',
      geo: o.geo || o.country || 'Global',
      vertical: o.category || o.vertical || '',
      status: o.status === 'active' ? 'active' : 'paused',
      tracking_url: o.tracking_url || o.url || '',
      product_image_url: o.image || o.creative || '',
    }));
    
    return { offers, error: null };
  } catch (err) {
    return { offers: [], error: err.message };
  }
}

async function fetchIndoleadsOffers(credentials) {
  const { jwt_token } = credentials;
  if (!jwt_token) return { offers: [], error: 'No JWT token' };

  const allOffers = [];
  let page = 1;

  try {
    while (page <= 50) {
      const url = `https://app.indoleads.com/api/offers?limit=10&page=${page}`;
      const resp = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${jwt_token}`,
          'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36',
          'Accept': 'application/json',
        },
        signal: AbortSignal.timeout(15000),
      });

      if (resp.status === 403) return { offers: allOffers, error: 'Forbidden — token may need refresh' };

      const data = await resp.json();
      const offers = data.data || [];
      if (!offers.length) break;

      allOffers.push(...offers);
      if (page >= (data.last_page || 1)) break;
      page++;
    }

    const normalized = allOffers.map(o => ({
      network_offer_id: `IL-${o.id}`,
      name: o.title || 'Unknown',
      description: o.description || '',
      type: (o.type || 'CPS').toUpperCase(),
      payout: parseFloat(o.payout || 0),
      payout_currency: 'USD',
      geo: o.geo || 'Global',
      vertical: o.category || '',
      status: 'active',
      tracking_url: '',
      product_image_url: o.id_thumbnail ? `https://app.indoleads.com/uploads/thumbnails/${o.id_thumbnail}` : '',
    }));

    return { offers: normalized, error: null };
  } catch (err) {
    return { offers: allOffers.length ? allOffers : [], error: err.message };
  }
}

// ── Main Sync Function ───────────────────────────────────────

async function syncNetworkOffers(networkId) {
  const [[network]] = await pool.query('SELECT * FROM 1ai_networks WHERE id = ?', [networkId]);
  if (!network) return { success: false, error: 'Network not found' };
  
  const credentials = typeof network.credentials === 'string' 
    ? JSON.parse(network.credentials) 
    : (network.credentials || {});
  
  let result = { offers: [], error: 'No adapter for this network' };
  
  switch (network.name) {
    case 'Passio.eco':
      result = await fetchPassioOffers(credentials);
      break;
    case 'Indoleads':
      result = await fetchIndoleadsOffers(credentials);
      break;
    case 'Involve Asia':
    case 'AccessTrade':
    case 'Trip.com Partners':
    case 'Travelpayouts':
      result = { offers: [], error: 'Adapter not yet implemented — requires API key setup' };
      break;
  }
  
  if (result.error) {
    return { success: false, error: result.error, network: network.name };
  }
  
  // Upsert offers
  let inserted = 0;
  let updated = 0;
  
  for (const offer of result.offers) {
    try {
      const [[existing]] = await pool.query(
        'SELECT id FROM 1ai_offers WHERE network_id = ? AND network_offer_id = ?',
        [networkId, offer.network_offer_id]
      );
      
      if (existing) {
        await pool.query(
          `UPDATE 1ai_offers SET name = ?, description = ?, type = ?, payout = ?, 
           payout_currency = ?, geo = ?, vertical = ?, status = ?, tracking_url = ?,
           product_image_url = ?, updated_at = UNIX_TIMESTAMP()
           WHERE id = ?`,
          [offer.name, offer.description, offer.type, offer.payout,
           offer.payout_currency, offer.geo, offer.vertical, offer.status,
           offer.tracking_url, offer.product_image_url, existing.id]
        );
        updated++;
      } else {
        await pool.query(
          `INSERT INTO 1ai_offers (name, network_id, network_offer_id, description, type, 
           payout, payout_currency, geo, vertical, status, tracking_url, product_image_url,
           approval_status, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'approved', UNIX_TIMESTAMP(), UNIX_TIMESTAMP())`,
          [offer.name, networkId, offer.network_offer_id, offer.description, offer.type,
           offer.payout, offer.payout_currency, offer.geo, offer.vertical, offer.status,
           offer.tracking_url, offer.product_image_url]
        );
        inserted++;
      }
    } catch (err) {
      console.error(`Sync offer error (${offer.network_offer_id}):`, err.message);
    }
  }
  
  // Update last synced timestamp
  await pool.query('UPDATE 1ai_networks SET last_synced_at = UNIX_TIMESTAMP() WHERE id = ?', [networkId]);
  
  return { 
    success: true, 
    network: network.name, 
    inserted, 
    updated, 
    total: result.offers.length 
  };
}

async function syncAllNetworks() {
  const [networks] = await pool.query('SELECT id, name FROM 1ai_networks WHERE status = ? ORDER BY id', ['active']);
  
  const results = [];
  for (const network of networks) {
    try {
      const result = await syncNetworkOffers(network.id);
      results.push(result);
    } catch (err) {
      results.push({ success: false, network: network.name, error: err.message });
    }
  }
  
  return results;
}

module.exports = { syncNetworkOffers, syncAllNetworks, fetchPassioOffers, fetchIndoleadsOffers };
