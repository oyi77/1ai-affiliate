/**
 * ClicksProvider contract — same shape as the PHP side.
 *
 * Implementations: InMemoryClicksProvider (tests),
 * MysqlClicksProvider (production, in production code).
 */
class InMemoryClicksProvider {
  /**
   * @param {{clicks?: any[], conversions?: any[]}} [opts]
   */
  constructor({ clicks = [], conversions = [] } = {}) {
    this.clicks = clicks;
    this.conversions = conversions;
  }

  recentClicks(limit = 100, offerId = null) {
    let rows = this.clicks;
    if (offerId !== null) {
      rows = rows.filter((r) => (r.offer_id ?? 0) === offerId);
    }
    return rows.slice(0, limit);
  }

  recentConversions(limit = 100, offerId = null) {
    let rows = this.conversions;
    if (offerId !== null) {
      rows = rows.filter((r) => (r.offer_id ?? 0) === offerId);
    }
    return rows.slice(0, limit);
  }

  summary(offerId = null, windowHours = 24) {
    const cutoff = Math.floor(Date.now() / 1000) - windowHours * 3600;
    const clicksW = this.recentClicks(10000, offerId).filter((r) => (r.clicked_at ?? 0) >= cutoff);
    const convsW = this.recentConversions(10000, offerId).filter((r) => (r.converted_at ?? 0) >= cutoff);
    const cvr = clicksW.length > 0 ? (convsW.length / clicksW.length) * 100 : 0;
    return {
      [`clicks_${windowHours}h`]: clicksW.length,
      [`conversions_${windowHours}h`]: convsW.length,
      cvr_pct: Math.round(cvr * 100) / 100,
    };
  }
}

module.exports = { InMemoryClicksProvider };
