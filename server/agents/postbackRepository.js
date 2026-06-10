/**
 * PostbackRepository — read access to the postback system tables.
 * Production implementation: MysqlPostbackRepository; here we ship an
 * in-memory version for tests + the agent framework to use out of the box.
 *
 * The shape matches the SQL columns added in scripts/008_postback_system.sql.
 */
class InMemoryPostbackRepository {
  /**
   * @param {{failed?: any[], details?: Record<number, any>}} [opts]
   */
  constructor({ failed = [], details = {} } = {}) {
    this.failed = failed;
    this.details = details;
  }

  /**
   * @param {number} limit
   * @param {number} sinceHours
   */
  failedPostbacks(limit = 50, sinceHours = 24) {
    const cutoff = Math.floor(Date.now() / 1000) - sinceHours * 3600;
    return this.failed
      .filter((p) => (p.last_attempt_at ?? 0) >= cutoff)
      .slice(0, limit);
  }

  /**
   * @param {number} postbackLogId
   */
  postbackDetail(postbackLogId) {
    return this.details[postbackLogId] || null;
  }
}

module.exports = { InMemoryPostbackRepository };
