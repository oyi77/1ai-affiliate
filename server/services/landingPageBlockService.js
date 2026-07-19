'use strict';

/**
 * Landing Page Block Service
 * Manages blocks for the landing page builder.
 */

const { queryOne, queryRows, queryInsert, queryUpdate } = require('../utils/queryHelpers');

/**
 * Get all blocks for a landing page, ordered by block_order.
 * @param {number} pageId
 * @returns {Promise<Array>}
 */
async function getBlocks(pageId) {
  return queryRows(
    'SELECT * FROM `1ai_landing_page_blocks` WHERE page_id = ? ORDER BY block_order',
    [pageId]
  );
}

/**
 * Add a new block to a landing page.
 * @param {number} pageId
 * @param {string} blockType
 * @param {number} blockOrder
 * @param {Object} blockConfig
 * @param {Object} [visibility]
 * @returns {Promise<number>} insert id
 */
async function addBlock(pageId, blockType, blockOrder, blockConfig, visibility) {
  const now = Math.floor(Date.now() / 1000);
  return queryInsert(
    `INSERT INTO \`1ai_landing_page_blocks\`
     (page_id, block_type, block_order, block_config, visibility, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [pageId, blockType, blockOrder, JSON.stringify(blockConfig), JSON.stringify(visibility || {}), now, now]
  );
}

/**
 * Update a block's fields.
 * @param {number} id
 * @param {Object} data - keys to update (block_type, block_order, block_config, visibility)
 * @returns {Promise<number>} affected rows
 */
async function updateBlock(id, data) {
  const now = Math.floor(Date.now() / 1000);
  const sets = [];
  const params = [];

  if (data.block_type !== undefined) {
    sets.push('block_type = ?');
    params.push(data.block_type);
  }
  if (data.block_order !== undefined) {
    sets.push('block_order = ?');
    params.push(data.block_order);
  }
  if (data.block_config !== undefined) {
    sets.push('block_config = ?');
    params.push(JSON.stringify(data.block_config));
  }
  if (data.visibility !== undefined) {
    sets.push('visibility = ?');
    params.push(JSON.stringify(data.visibility));
  }

  if (sets.length === 0) return 0;

  sets.push('updated_at = ?');
  params.push(now);
  params.push(id);

  return queryUpdate(
    `UPDATE \`1ai_landing_page_blocks\` SET ${sets.join(', ')} WHERE id = ?`,
    params
  );
}

/**
 * Delete a block.
 * @param {number} id
 * @returns {Promise<number>} affected rows
 */
async function deleteBlock(id) {
  return queryUpdate(
    'DELETE FROM `1ai_landing_page_blocks` WHERE id = ?',
    [id]
  );
}

/**
 * Reorder blocks for a page.
 * @param {number} pageId
 * @param {Array<{id: number, block_order: number}>} orderArray
 */
async function reorderBlocks(pageId, orderArray) {
  const now = Math.floor(Date.now() / 1000);
  for (const item of orderArray) {
    await queryUpdate(
      'UPDATE `1ai_landing_page_blocks` SET block_order = ?, updated_at = ? WHERE id = ? AND page_id = ?',
      [item.block_order, now, item.id, pageId]
    );
  }
}

/**
 * Update builder and draft data on the landing page.
 * @param {number} pageId
 * @param {Object} builderData
 * @param {Object} draftData
 * @returns {Promise<number>} affected rows
 */
async function updatePageBuilderData(pageId, builderData, draftData) {
  const now = Math.floor(Date.now() / 1000);
  return queryUpdate(
    'UPDATE `1ai_landing_pages` SET builder_data = ?, draft_data = ?, updated_at = ? WHERE id = ?',
    [JSON.stringify(builderData), JSON.stringify(draftData), now, pageId]
  );
}

/**
 * Publish the draft — bump published_version and copy draft_data into builder_data.
 * @param {number} pageId
 * @returns {Promise<number>} affected rows
 */
async function publishPage(pageId) {
  const now = Math.floor(Date.now() / 1000);
  return queryUpdate(
    'UPDATE `1ai_landing_pages` SET published_version = published_version + 1, builder_data = draft_data, updated_at = ? WHERE id = ?',
    [now, pageId]
  );
}

/**
 * Get builder data from a landing page.
 * @param {number} pageId
 * @returns {Promise<Object|null>}
 */
async function getPageBuilderData(pageId) {
  return queryOne(
    'SELECT id, builder_data, draft_data, published_version, custom_css, custom_js, meta_title, meta_description FROM `1ai_landing_pages` WHERE id = ?',
    [pageId]
  );
}

module.exports = {
  getBlocks,
  addBlock,
  updateBlock,
  deleteBlock,
  reorderBlocks,
  updatePageBuilderData,
  publishPage,
  getPageBuilderData,
};
