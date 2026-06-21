/**
 * MysqlClicksProvider — reads real click/conversion data from the database.
 */
const pool = require('../db/mysql');

class MysqlClicksProvider {
  async recentClicks(limit = 100, offerId = null) {
    let sql = 'SELECT click_id, user_id, aff_campaign_id, click_time as clicked_at, click_payout FROM clicks ORDER BY click_id DESC LIMIT ?';
    const params = [limit];
    if (offerId !== null) {
      sql = 'SELECT click_id, user_id, aff_campaign_id, click_time as clicked_at, click_payout FROM clicks WHERE aff_campaign_id = ? ORDER BY click_id DESC LIMIT ?';
      params.unshift(offerId);
    }
    try {
      const [rows] = await pool.query(sql, params);
      return rows;
    } catch (err) {
      console.error('[MysqlClicksProvider] recentClicks error:', err.message);
      return [];
    }
  }

  async recentConversions(limit = 100, offerId = null) {
    let sql = 'SELECT * FROM conversion_logs ORDER BY conversion_id DESC LIMIT ?';
    const params = [limit];
    if (offerId !== null) {
      sql = 'SELECT * FROM conversion_logs WHERE aff_campaign_id = ? ORDER BY conversion_id DESC LIMIT ?';
      params.unshift(offerId);
    }
    try {
      const [rows] = await pool.query(sql, params);
      return rows;
    } catch (err) {
      console.error('[MysqlClicksProvider] recentConversions error:', err.message);
      return [];
    }
  }

  async summary(offerId = null, windowHours = 24) {
    const cutoff = Math.floor(Date.now() / 1000) - windowHours * 3600;
    try {
      let clickSql = 'SELECT COUNT(*) as cnt FROM clicks WHERE click_time >= ?';
      let convSql = 'SELECT COUNT(*) as cnt FROM conversion_logs WHERE conversion_time >= ?';
      const clickParams = [cutoff];
      const convParams = [cutoff];
      if (offerId !== null) {
        clickSql += ' AND aff_campaign_id = ?';
        convSql += ' AND aff_campaign_id = ?';
        clickParams.push(offerId);
        convParams.push(offerId);
      }
      const [[clickRow]] = await pool.query(clickSql, clickParams);
      const [[convRow]] = await pool.query(convSql, convParams);
      const clicks = clickRow?.cnt || 0;
      const conversions = convRow?.cnt || 0;
      const cvr = clicks > 0 ? (conversions / clicks) * 100 : 0;
      return {
        [`clicks_${windowHours}h`]: clicks,
        [`conversions_${windowHours}h`]: conversions,
        cvr_pct: Math.round(cvr * 100) / 100,
      };
    } catch (err) {
      console.error('[MysqlClicksProvider] summary error:', err.message);
      return { [`clicks_${windowHours}h`]: 0, [`conversions_${windowHours}h`]: 0, cvr_pct: 0 };
    }
  }
}

module.exports = { MysqlClicksProvider };
