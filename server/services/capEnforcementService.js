'use strict';

/**
 * Cap Enforcement Service
 * Daily and monthly cap checking for offers and affiliates
 */

const db = require('../db/mysql');

/**
 * Check if an offer has reached its daily cap
 * @param {number} offer_id
 * @returns {Promise<{allowed: boolean, current: number, cap: number|null, reason?: string}>}
 */
async function checkOfferCap(offer_id) {
    try {
        // Get offer cap settings
        const [offers] = await db.query(
            `SELECT id, name, cap_daily, cap_monthly, cap_enabled
             FROM 1ai_offers WHERE id = ?`,
            [offer_id]
        );

        if (offers.length === 0) {
            return { allowed: false, current: 0, cap: null, reason: 'Offer not found' };
        }

        const offer = offers[0];

        // If cap is disabled, allow
        if (!offer.cap_enabled) {
            return { allowed: true, current: 0, cap: null };
        }

        // Count conversions today for this offer
        const [dailyCount] = await db.query(
            `SELECT COUNT(*) AS cnt FROM 1ai_conversions
             WHERE offer_id = ?
               AND DATE(conversion_date) = CURDATE()
               AND status = 'approved'`,
            [offer_id]
        );

        const currentDaily = dailyCount[0]?.cnt || 0;

        // Check daily cap
        if (offer.cap_daily && currentDaily >= offer.cap_daily) {
            return {
                allowed: false,
                current: currentDaily,
                cap: offer.cap_daily,
                reason: `Offer "${offer.name}" daily cap reached: ${currentDaily}/${offer.cap_daily} conversions`
            };
        }

        // Check monthly cap if set
        if (offer.cap_monthly) {
            const [monthlyCount] = await db.query(
                `SELECT COUNT(*) AS cnt FROM 1ai_conversions
                 WHERE offer_id = ?
                   AND YEAR(conversion_date) = YEAR(CURDATE())
                   AND MONTH(conversion_date) = MONTH(CURDATE())
                   AND status = 'approved'`,
                [offer_id]
            );

            const currentMonthly = monthlyCount[0]?.cnt || 0;
            if (currentMonthly >= offer.cap_monthly) {
                return {
                    allowed: false,
                    current: currentMonthly,
                    cap: offer.cap_monthly,
                    reason: `Offer "${offer.name}" monthly cap reached: ${currentMonthly}/${offer.cap_monthly} conversions`
                };
            }
        }

        return { allowed: true, current: currentDaily, cap: offer.cap_daily };
    } catch (err) {
        console.error('[CapEnforcement] checkOfferCap error:', err);
        return { allowed: true, current: 0, cap: null };
    }
}

/**
 * Atomically increment the daily cap counter for an offer
 * Uses INSERT ... ON DUPLICATE KEY UPDATE pattern
 * @param {number} offer_id
 * @returns {Promise<{success: boolean, current_count: number}>}
 */
async function incrementCapCounter(offer_id) {
    const today = new Date().toISOString().slice(0, 10);

    const conn = await db.getConnection();
    try {
        await conn.beginTransaction();

        // Insert or update daily cap counter
        const [result] = await conn.query(
            `INSERT INTO 1ai_offer_daily_caps (offer_id, cap_date, click_count, conversion_count)
             VALUES (?, ?, 0, 1)
             ON DUPLICATE KEY UPDATE conversion_count = conversion_count + 1`,
            [offer_id, today]
        );

        // Get current count
        const [current] = await conn.query(
            `SELECT conversion_count, click_count FROM 1ai_offer_daily_caps
             WHERE offer_id = ? AND cap_date = ?`,
            [offer_id, today]
        );

        await conn.commit();

        const counts = current[0] || { conversion_count: 1, click_count: 0 };
        return { success: true, current_count: counts.conversion_count };
    } catch (err) {
        await conn.rollback();
        console.error('[CapEnforcement] incrementCapCounter error:', err);
        return { success: false, current_count: 0 };
    } finally {
        conn.release();
    }
}

/**
 * Check per-affiliate cap for an offer
 * @param {number} affiliate_id
 * @param {number} offer_id
 * @returns {Promise<{allowed: boolean, current: number, cap: number|null, reason?: string}>}
 */
async function checkAffiliateCap(affiliate_id, offer_id) {
    try {
        // Get per-affiliate cap from offer_affiliate_access
        const [accessRows] = await db.query(
            `SELECT a.id, a.affiliate_cap_daily, a.affiliate_cap_monthly,
                    o.name AS offer_name, o.cap_enabled
             FROM 1ai_offer_affiliate_access a
             JOIN 1ai_offers o ON o.id = a.offer_id
             WHERE a.offer_id = ? AND a.affiliate_id = ?`,
            [offer_id, affiliate_id]
        );

        if (accessRows.length === 0) {
            // No explicit cap set for this affiliate — use offer default cap
            const offerCheck = await checkOfferCap(offer_id);
            return offerCheck;
        }

        const access = accessRows[0];

        // Check daily cap
        if (access.affiliate_cap_daily) {
            const [dailyCount] = await db.query(
                `SELECT COUNT(*) AS cnt FROM 1ai_conversions
                 WHERE offer_id = ? AND affiliate_id = ?
                   AND DATE(conversion_date) = CURDATE()
                   AND status = 'approved'`,
                [offer_id, affiliate_id]
            );

            const currentDaily = dailyCount[0]?.cnt || 0;
            if (currentDaily >= access.affiliate_cap_daily) {
                return {
                    allowed: false,
                    current: currentDaily,
                    cap: access.affiliate_cap_daily,
                    reason: `Affiliate #${affiliate_id} daily cap reached on "${access.offer_name}": ${currentDaily}/${access.affiliate_cap_daily}`
                };
            }
        }

        // Check monthly cap
        if (access.affiliate_cap_monthly) {
            const [monthlyCount] = await db.query(
                `SELECT COUNT(*) AS cnt FROM 1ai_conversions
                 WHERE offer_id = ? AND affiliate_id = ?
                   AND YEAR(conversion_date) = YEAR(CURDATE())
                   AND MONTH(conversion_date) = MONTH(CURDATE())
                   AND status = 'approved'`,
                [offer_id, affiliate_id]
            );

            const currentMonthly = monthlyCount[0]?.cnt || 0;
            if (currentMonthly >= access.affiliate_cap_monthly) {
                return {
                    allowed: false,
                    current: currentMonthly,
                    cap: access.affiliate_cap_monthly,
                    reason: `Affiliate #${affiliate_id} monthly cap reached on "${access.offer_name}": ${currentMonthly}/${access.affiliate_cap_monthly}`
                };
            }
        }

        // Also check global offer cap
        const offerCheck = await checkOfferCap(offer_id);
        if (!offerCheck.allowed) {
            return offerCheck;
        }

        return { allowed: true, current: 0, cap: null };
    } catch (err) {
        console.error('[CapEnforcement] checkAffiliateCap error:', err);
        return { allowed: true, current: 0, cap: null };
    }
}

/**
 * Set or update cap values for an offer
 * @param {number} offer_id
 * @param {Object} caps
 * @param {number} [caps.cap_daily]
 * @param {number} [caps.cap_monthly]
 * @param {boolean} [caps.cap_enabled]
 * @returns {Promise<Object>}
 */
async function setOfferCap(offer_id, caps) {
    const updates = [];
    const params = [];

    if (caps.cap_daily !== undefined) {
        updates.push('cap_daily = ?');
        params.push(parseInt(caps.cap_daily, 10));
    }
    if (caps.cap_monthly !== undefined) {
        updates.push('cap_monthly = ?');
        params.push(parseInt(caps.cap_monthly, 10));
    }
    if (caps.cap_enabled !== undefined) {
        updates.push('cap_enabled = ?');
        params.push(caps.cap_enabled ? 1 : 0);
    }

    if (updates.length === 0) {
        throw new Error('No cap values provided to update');
    }

    params.push(offer_id);

    await db.query(
        `UPDATE 1ai_offers SET ${updates.join(', ')} WHERE id = ?`,
        params
    );

    return { offer_id, ...caps };
}

/**
 * Set per-affiliate cap on an offer
 * @param {number} offer_id
 * @param {number} affiliate_id
 * @param {Object} caps
 * @param {number} [caps.affiliate_cap_daily]
 * @param {number} [caps.affiliate_cap_monthly]
 * @returns {Promise<Object>}
 */
async function setAffiliateCap(offer_id, affiliate_id, caps) {
    const updates = [];
    const params = [];

    if (caps.affiliate_cap_daily !== undefined) {
        updates.push('affiliate_cap_daily = ?');
        params.push(parseInt(caps.affiliate_cap_daily, 10));
    }
    if (caps.affiliate_cap_monthly !== undefined) {
        updates.push('affiliate_cap_monthly = ?');
        params.push(parseInt(caps.affiliate_cap_monthly, 10));
    }

    if (updates.length === 0) {
        throw new Error('No affiliate cap values provided to update');
    }

    params.push(offer_id, affiliate_id);

    await db.query(
        `UPDATE 1ai_offer_affiliate_access
         SET ${updates.join(', ')}
         WHERE offer_id = ? AND affiliate_id = ?`,
        params
    );

    return { offer_id, affiliate_id, ...caps };
}

/**
 * Get current cap usage for an offer
 * @param {number} offer_id
 * @returns {Promise<Object>}
 */
async function getOfferCapUsage(offer_id) {
    const [offers] = await db.query(
        `SELECT id, name, cap_daily, cap_monthly, cap_enabled FROM 1ai_offers WHERE id = ?`,
        [offer_id]
    );

    if (offers.length === 0) {
        return null;
    }

    const offer = offers[0];

    const [dailyCount] = await db.query(
        `SELECT COUNT(*) AS cnt FROM 1ai_conversions
         WHERE offer_id = ? AND DATE(conversion_date) = CURDATE() AND status = 'approved'`,
        [offer_id]
    );

    const [monthlyCount] = await db.query(
        `SELECT COUNT(*) AS cnt FROM 1ai_conversions
         WHERE offer_id = ?
           AND YEAR(conversion_date) = YEAR(CURDATE())
           AND MONTH(conversion_date) = MONTH(CURDATE())
           AND status = 'approved'`,
        [offer_id]
    );

    return {
        offer_id: offer.id,
        name: offer.name,
        cap_enabled: !!offer.cap_enabled,
        daily: {
            cap: offer.cap_daily,
            current: dailyCount[0]?.cnt || 0,
            remaining: offer.cap_daily ? Math.max(0, offer.cap_daily - (dailyCount[0]?.cnt || 0)) : null,
            exhausted: offer.cap_daily ? (dailyCount[0]?.cnt || 0) >= offer.cap_daily : false
        },
        monthly: {
            cap: offer.cap_monthly,
            current: monthlyCount[0]?.cnt || 0,
            remaining: offer.cap_monthly ? Math.max(0, offer.cap_monthly - (monthlyCount[0]?.cnt || 0)) : null,
            exhausted: offer.cap_monthly ? (monthlyCount[0]?.cnt || 0) >= offer.cap_monthly : false
        }
    };
}

/**
 * Check if an offer has reached its monthly cap using 1ai_conversion_logs
 * @param {number} offerId
 * @returns {Promise<{capped: boolean, reason?: string}>}
 */
async function checkMonthlyCap(offerId) {
  const [rows] = await db.query(
    'SELECT COUNT(*) AS cnt FROM 1ai_conversion_logs WHERE aff_campaign_id IN (SELECT aff_campaign_id FROM 1ai_offer_campaigns WHERE offer_id = ?) AND conversion_time >= UNIX_TIMESTAMP(DATE_FORMAT(NOW(), "%Y-%m-01"))',
    [offerId]
  );
  const [offer] = await db.query('SELECT monthly_cap FROM 1ai_offers WHERE id = ?', [offerId]);
  if (offer.length && offer[0].monthly_cap && rows[0].cnt >= offer[0].monthly_cap) {
    return { capped: true, reason: 'Monthly cap reached' };
  }
  return { capped: false };
}

module.exports = {
    checkOfferCap,
    incrementCapCounter,
    checkAffiliateCap,
    setOfferCap,
    setAffiliateCap,
    getOfferCapUsage,
    checkMonthlyCap
};
