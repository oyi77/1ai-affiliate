const pool = require('../db/mysql');
const { mintSmartlink } = require('./smartlinkService');

const posterService = {
  /**
   * Fetch the next pending product from the queue with row-level locking.
   * @returns {object|null} row or null if no pending products
   */
  async fetchNextPending() {
    const [rows] = await pool.query(
      `SELECT id, product_name, normal_price, promo_price, product_url, image_url, affiliate_link, smartlink_slug, tracked_url, offer_id
       FROM 1ai_promo_queue
       WHERE status = 'pending'
       ORDER BY id ASC
       LIMIT 1
       FOR UPDATE SKIP LOCKED`
    );
    return rows.length ? rows[0] : null;
  },

  /**
   * Format a product row as an HTML caption for Telegram.
   * Uses tracked_url if available (smartlink), falls back to bare affiliate_link.
   * @param {object} row
   * @returns {string} HTML-formatted caption
   */
  formatCaption(row) {
    const { id, product_name, normal_price, promo_price, product_url, image_url, affiliate_link, tracked_url } = row;
    const normal = parseInt(normal_price) || 0;
    const promo = parseInt(promo_price) || 0;
    const discount = normal > 0 ? Math.round((1 - promo / normal) * 100) : 0;
    const tag = product_name.replace(/[^a-zA-Z0-9]/g, '').slice(0, 15);
    const link = tracked_url || affiliate_link;

    return (
      `<b>⚡ FLASH SALE!</b>\n\n` +
      `<b>${product_name}</b>\n\n` +
      `Harga normal: Rp${normal.toLocaleString('id-ID')}\n` +
      `Harga promo: <b>Rp${promo.toLocaleString('id-ID')}</b> (hemat ${discount}%)\n\n` +
      `👉 <a href="${link}">BELI SEKARANG</a>\n\n` +
      `#${tag} #FlashSale`
    );
  },

  /**
   * Post a message (or photo with caption) to Telegram.
   * @param {string} text HTML-formatted caption
   * @param {string|null} photoUrl optional image URL
   * @returns {object} Telegram API response JSON
   */
  async postToTelegram(text, photoUrl) {
    const botToken = process.env.TG_BOT_TOKEN;
    const channelId = process.env.TG_CHANNEL_ID;

    if (!botToken) throw new Error('TG_BOT_TOKEN not configured');
    if (!channelId) throw new Error('TG_CHANNEL_ID not configured');

    let url, payload;

    if (photoUrl && photoUrl.length > 10) {
      url = `https://api.telegram.org/bot${botToken}/sendPhoto`;
      payload = {
        chat_id: channelId,
        photo: photoUrl,
        parse_mode: 'HTML',
        caption: text,
      };
    } else {
      url = `https://api.telegram.org/bot${botToken}/sendMessage`;
      payload = {
        chat_id: channelId,
        text,
        parse_mode: 'HTML',
        disable_web_page_preview: false,
      };
    }

    const resp = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const result = await resp.json();

    if (!result.ok) {
      throw new Error(`Telegram API: ${result.description || result.error_code || 'unknown error'}`);
    }

    return result;
  },

  /**
   * Mark a queue item as posted.
   * @param {number} id
   */
  async markPosted(id) {
    await pool.query(
      `UPDATE 1ai_promo_queue SET status = 'posted', posted_at = UNIX_TIMESTAMP(), error_message = NULL WHERE id = ?`,
      [id]
    );
  },

  /**
   * Mark a queue item as failed, storing the error message.
   * @param {number} id
   * @param {string} errorMessage
   */
  async markFailed(id, errorMessage) {
    await pool.query(
      `UPDATE 1ai_promo_queue SET status = 'failed', error_message = ? WHERE id = ?`,
      [String(errorMessage).slice(0, 500), id]
    );
  },

  /**
   * Add a product to the poster queue.
   * If offer_id and affiliate_link are provided, mints a tracked smartlink.
   * @param {object} data { product_url, product_name, image_url?, normal_price, promo_price, affiliate_link?, niche?, offer_id? }
   * @returns {object} { id } of the inserted row
   */
  async addToQueue(data) {
    const { product_url, product_name, image_url, normal_price, promo_price, affiliate_link, niche, offer_id } = data;

    if (!product_url || !product_name || !normal_price || !promo_price) {
      throw new Error('product_url, product_name, normal_price, and promo_price are required');
    }

    const nPrice = parseInt(normal_price);
    const pPrice = parseInt(promo_price);
    if (isNaN(nPrice) || nPrice <= 0) throw new Error('normal_price must be a positive integer');
    if (isNaN(pPrice) || pPrice <= 0) throw new Error('promo_price must be a positive integer');
    if (pPrice >= nPrice) throw new Error('promo_price must be less than normal_price');

    // Check for duplicate product_url
    const [existing] = await pool.query(
      'SELECT id FROM 1ai_promo_queue WHERE product_url = ? AND status = "pending" LIMIT 1',
      [product_url]
    );
    if (existing.length) throw new Error('Product with this URL already exists in the queue');

    let smartlinkSlug = null;
    let trackedUrl = null;

    // If offer_id and affiliate_link provided, mint a tracked smartlink
    if (offer_id && affiliate_link) {
      try {
        const result = await mintSmartlink({
          offerId: offer_id,
          affiliateId: 1, // TODO: determine correct affiliate_id from context
          domainId: null,
          shortenerServiceId: null
        });
        smartlinkSlug = result.slug;
        trackedUrl = result.url;
        console.log(`[PosterService] Minted smartlink ${smartlinkSlug} for offer ${offer_id}`);
      } catch (err) {
        console.error('[PosterService] Failed to mint smartlink:', err.message);
        // Continue without smartlink - will fall back to bare affiliate link
      }
    }

    const [result] = await pool.query(
      `INSERT INTO 1ai_promo_queue (product_url, product_name, image_url, normal_price, promo_price, affiliate_link, niche, offer_id, smartlink_slug, tracked_url)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        product_url,
        product_name,
        image_url || null,
        parseInt(normal_price),
        parseInt(promo_price),
        affiliate_link || null,
        niche || null,
        offer_id || null,
        smartlinkSlug,
        trackedUrl
      ]
    );

    return { id: result.insertId };
  },

  /**
   * List queue items with optional status filter.
   * @param {string|null} status pending | posted | failed
   * @param {number} limit max rows to return (default 50)
   * @returns {object[]} rows
   */
  async listQueue(status, limit = 50) {
    let sql = 'SELECT * FROM 1ai_promo_queue';
    const params = [];

    if (status && ['pending', 'posted', 'failed'].includes(status)) {
      sql += ' WHERE status = ?';
      params.push(status);
    }

    sql += ' ORDER BY id DESC LIMIT ?';
    params.push(parseInt(limit));

    const [rows] = await pool.query(sql, params);
    return rows;
  },

  /**
   * Delete a queue item by ID.
   * @param {number} id
   */
  async removeFromQueue(id) {
    await pool.query('DELETE FROM 1ai_promo_queue WHERE id = ?', [id]);
  },
};

module.exports = posterService;