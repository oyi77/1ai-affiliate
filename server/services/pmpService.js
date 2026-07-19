'use strict';

const { queryOne, queryRows, queryInsert, queryUpdate } = require('../utils/queryHelpers');

/**
 * Create a new PMP deal.
 * @param {number} advertiserId
 * @param {string} name
 * @param {string} dealType - preferred|private|programmatic_guaranteed
 * @param {string} dealId - unique deal identifier
 * @param {number} price
 * @param {string} priceModel - cpm|cpc|cpa|flat
 * @param {string} inventorySource - direct|programmatic|network
 * @param {object} targeting - JSON targeting rules
 * @param {number} budget
 * @param {number} startDate - unix timestamp
 * @param {number} endDate - unix timestamp
 * @returns {Promise<number>} insertId
 */
async function createDeal(advertiserId, name, dealType, dealId, price, priceModel, inventorySource, targeting, budget, startDate, endDate) {
  const now = Math.floor(Date.now() / 1000);
  return queryInsert(
    `INSERT INTO 1ai_pmp_deals
     (advertiser_id, name, deal_type, deal_id, price, price_model, inventory_source, targeting, budget, budget_spent, status, start_date, end_date, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 'draft', ?, ?, ?, ?)`,
    [advertiserId, name, dealType, dealId, price, priceModel, inventorySource, JSON.stringify(targeting), budget, startDate, endDate, now, now]
  );
}

/**
 * List PMP deals. If advertiserId is null/undefined, show all.
 * @param {number|null} advertiserId
 * @returns {Promise<Array>}
 */
async function getDeals(advertiserId) {
  if (advertiserId == null) {
    return queryRows('SELECT * FROM 1ai_pmp_deals ORDER BY created_at DESC');
  }
  return queryRows(
    'SELECT * FROM 1ai_pmp_deals WHERE advertiser_id = ? ORDER BY created_at DESC',
    [advertiserId]
  );
}

/**
 * Get a single PMP deal by id.
 * @param {number} id
 * @returns {Promise<object|null>}
 */
async function getDeal(id) {
  return queryOne('SELECT * FROM 1ai_pmp_deals WHERE id = ?', [id]);
}

/**
 * Update fields on a PMP deal.
 * @param {number} id
 * @param {object} data - fields to update
 * @returns {Promise<number>} affectedRows
 */
async function updateDeal(id, data) {
  const now = Math.floor(Date.now() / 1000);
  const allowed = ['name', 'deal_type', 'deal_id', 'price', 'price_model', 'inventory_source', 'targeting', 'budget', 'budget_spent', 'status', 'start_date', 'end_date'];
  const sets = [];
  const params = [];
  for (const key of allowed) {
    if (data[key] !== undefined) {
      sets.push(`\`${key}\` = ?`);
      params.push(key === 'targeting' ? JSON.stringify(data[key]) : data[key]);
    }
  }
  if (sets.length === 0) return 0;
  sets.push('updated_at = ?');
  params.push(now);
  params.push(id);
  return queryUpdate(`UPDATE 1ai_pmp_deals SET ${sets.join(', ')} WHERE id = ?`, params);
}

/**
 * Get all active PMP deals.
 * @returns {Promise<Array>}
 */
async function getActiveDeals() {
  return queryRows(
    "SELECT * FROM 1ai_pmp_deals WHERE status = 'active' ORDER BY created_at DESC"
  );
}

/**
 * Add inventory to a PMP deal.
 * @param {number} dealId
 * @param {number} offerId
 * @param {number} floorPrice
 * @param {number} cap - impression cap
 * @returns {Promise<number>} insertId
 */
async function addInventory(dealId, offerId, floorPrice, cap) {
  const now = Math.floor(Date.now() / 1000);
  return queryInsert(
    `INSERT INTO 1ai_pmp_inventory (pmp_deal_id, offer_id, floor_price, cap, status, created_at)
     VALUES (?, ?, ?, ?, 'active', ?)`,
    [dealId, offerId, floorPrice, cap, now]
  );
}

/**
 * List inventory for a PMP deal.
 * @param {number} dealId
 * @returns {Promise<Array>}
 */
async function getInventory(dealId) {
  return queryRows(
    'SELECT * FROM 1ai_pmp_inventory WHERE pmp_deal_id = ? ORDER BY created_at DESC',
    [dealId]
  );
}

/**
 * Remove (pause) inventory item.
 * @param {number} id
 * @returns {Promise<number>} affectedRows
 */
async function removeInventory(id) {
  const now = Math.floor(Date.now() / 1000);
  return queryUpdate(
    "UPDATE 1ai_pmp_inventory SET status = 'paused' WHERE id = ?",
    [id]
  );
}

module.exports = {
  createDeal,
  getDeals,
  getDeal,
  updateDeal,
  getActiveDeals,
  addInventory,
  getInventory,
  removeInventory,
};
