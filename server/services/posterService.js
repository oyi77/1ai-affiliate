const pool = require('../db/mysql');

const posterService = {
  /**
   * Fetch the next pending product from the queue with row-level locking.
   * @returns {object|null} row or null if no pending products
   */
  async fetchNextPending() {
    const [rows] = await pool.query(
      `SELECT id, product_name, normal_price, promo_price, product_url, image_url, affiliate_link
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
   * @param {object} row
   * @returns {string} HTML-formatted caption
   */
  formatCaption(row) {
    const { id, product_name, normal_price, promo_price, product_url, image_url, affiliate_link } = row;
    const normal = parseInt(normal_price);
    const promo = parseInt(promo_price);
    const discount = Math.round((1 - promo / normal) * 100);
    const tag = product_name.replace(/[^a-zA-Z0-9]/g, '').slice(0, 15);

    return (
      `<b>⚡ FLASH SALE!</b>\n\n` +
      `<b>${product_name}</b>\n\n` +
      `Harga normal: <s>Rp${normal.toLocaleString('id-ID')}</s>\n` +
      `Harga promo: <b>Rp${promo.toLocaleString('id-ID')}</b> (hemat ${discount}%)\n\n` +
      `👉 <a href="${affiliate_link}">BELI SEKARANG</a>\n\n` +
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
   * @param {object} data { product_url, product_name, image_url?, normal_price, promo_price, affiliate_link?, niche? }
   * @returns {object} { id } of the inserted row
   */
  async addToQueue(data) {
    const { product_url, product_name, image_url, normal_price, promo_price, affiliate_link, niche } = data;

    if (!product_url || !product_name || !normal_price || !promo_price) {
      throw new Error('product_url, product_name, normal_price, and promo_price are required');
    }

    const [result] = await pool.query(
      `INSERT INTO 1ai_promo_queue (product_url, product_name, image_url, normal_price, promo_price, affiliate_link, niche)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        product_url,
        product_name,
        image_url || null,
        parseInt(normal_price),
        parseInt(promo_price),
        affiliate_link || null,
        niche || null,
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
