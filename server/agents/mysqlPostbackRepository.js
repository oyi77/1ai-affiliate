/**
 * MysqlPostbackRepository — reads real postback data from the database.
 */
const pool = require('../db/mysql');

class MysqlPostbackRepository {
  async failedPostbacks(limit = 50, sinceHours = 24) {
    const cutoff = Math.floor(Date.now() / 1000) - sinceHours * 3600;
    try {
      const [rows] = await pool.query(
        `SELECT * FROM 1ai_postback_logs
         WHERE status IN ('failed', 'retry')
         AND created_at >= ?
         ORDER BY created_at DESC LIMIT ?`,
        [cutoff, limit]
      );
      return rows;
    } catch (err) {
      console.error('[MysqlPostbackRepository] failedPostbacks error:', err.message);
      return [];
    }
  }

  async postbackDetail(postbackLogId) {
    try {
      const [[row]] = await pool.query(
        'SELECT * FROM 1ai_postback_logs WHERE id = ?',
        [postbackLogId]
      );
      return row || null;
    } catch (err) {
      console.error('[MysqlPostbackRepository] postbackDetail error:', err.message);
      return null;
    }
  }
}

module.exports = { MysqlPostbackRepository };
