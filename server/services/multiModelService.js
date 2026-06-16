'use strict';

/**
 * Multi-Model Tracking Service
 * Supports CPM, CPC, CPV payout models with batch fulfillment
 */

const db = require('../db/mysql');

const CPM_BATCH_SIZE = 1000;
const CPV_QUALIFIED_MS = 3000;

/**
 * Record a CPC click earning
 * @param {number} click_id
 * @param {number} offer_id
 * @param {number} affiliate_id
 * @param {number} payout
 * @returns {Promise<Object>} commission entry
 */
async function recordCpcEarning(click_id, offer_id, affiliate_id, payout) {
    const conn = await db.getConnection();
    try {
        await conn.beginTransaction();

        const [result] = await conn.query(
            `INSERT INTO 1ai_commission_entries
             (affiliate_id, offer_id, payout_model, commission, status, metadata, created_at)
             VALUES (?, ?, 'cpc', ?, 'pending', ?, UNIX_TIMESTAMP())`,
            [affiliate_id, offer_id, payout, JSON.stringify({ click_id: String(click_id) })]
        );

        await conn.commit();

        return {
            ok: true,
            id: result.insertId,
            click_id,
            offer_id,
            affiliate_id,
            payout_model: 'cpc',
            amount: payout,
            status: 'pending'
        };
    } catch (err) {
        await conn.rollback();
        console.error('[MultiModel] recordCpcEarning error:', err);
        throw err;
    } finally {
        conn.release();
    }
}

/**
 * Record a CPV view-through event
 * @param {number} click_id - the associated click
 * @param {number} offer_id
 * @param {number} affiliate_id
 * @param {number} view_duration_ms - actual view duration in ms
 * @param {number} qualified_payout - payout if view is qualified
 * @returns {Promise<Object>} { qualified, entry }
 */
async function recordCpvView(click_id, offer_id, affiliate_id, view_duration_ms, qualified_payout) {
    const qualified = view_duration_ms >= CPV_QUALIFIED_MS;

    const [result] = await db.query(
        `INSERT INTO 1ai_cpv_view_events
         (click_id, offer_id, affiliate_id, view_duration_ms, qualified, created_at)
         VALUES (?, ?, ?, ?, ?, NOW())`,
        [click_id, offer_id, affiliate_id, view_duration_ms, qualified ? 1 : 0]
    );

    let entry = null;

    if (qualified && qualified_payout > 0) {
        const conn = await db.getConnection();
        try {
            await conn.beginTransaction();

            const [commissionResult] = await conn.query(
                `INSERT INTO 1ai_commission_entries
                 (affiliate_id, offer_id, payout_model, commission, status, metadata, created_at)
                 VALUES (?, ?, 'cpv', ?, 'pending', ?, UNIX_TIMESTAMP())`,
                [affiliate_id, offer_id, qualified_payout, JSON.stringify({ click_id: String(click_id), view_duration_ms })]
            );

            await conn.commit();

            entry = {
                id: commissionResult.insertId,
                click_id,
                offer_id,
                affiliate_id,
                payout_model: 'cpv',
                amount: qualified_payout,
                status: 'pending'
            };
        } catch (err) {
            await conn.rollback();
            console.error('[MultiModel] recordCpvView commission error:', err);
            throw err;
        } finally {
            conn.release();
        }
    }

    return {
        qualified,
        viewEventId: result.insertId,
        commission_entry: entry
    };
}

/**
 * Record a click towards CPM batch and check if batch is fulfilled
 * @param {number} click_id
 * @param {number} offer_id
 * @param {number} affiliate_id
 * @param {number} cpm_rate - payout per 1000 clicks (CPM rate)
 * @returns {Promise<Object>} { batch_id, fulfilled, current_count }
 */
async function recordCpmClick(click_id, offer_id, affiliate_id, cpm_rate) {
    const today = new Date().toISOString().slice(0, 10);

    // Find or create today's batch for this offer+affiliate
    let [batches] = await db.query(
        `SELECT id, click_count, fulfilled, cpm_rate
         FROM 1ai_cpm_fulfillments
         WHERE offer_id = ? AND affiliate_id = ? AND DATE(created_at) = ?
         ORDER BY id DESC LIMIT 1`,
        [offer_id, affiliate_id, today]
    );

    let batch;
    const conn = await db.getConnection();
    try {
        await conn.beginTransaction();

        if (batches.length === 0) {
            // Create new batch
            const [newBatch] = await conn.query(
                `INSERT INTO 1ai_cpm_fulfillments
                 (offer_id, affiliate_id, cpm_rate, click_count, fulfilled, created_at)
                 VALUES (?, ?, ?, 0, 0, NOW())`,
                [offer_id, affiliate_id, cpm_rate]
            );
            batch = { id: newBatch.insertId, click_count: 0, fulfilled: 0, cpm_rate };
        } else {
            batch = batches[0];
        }

        // Check for duplicate click in this batch
        const [existing] = await conn.query(
            `SELECT id FROM 1ai_cpm_fulfillment_clicks
             WHERE fulfillment_id = ? AND click_id = ?`,
            [batch.id, click_id]
        );

        if (existing.length === 0) {
            // Record unique click in batch
            await conn.query(
                `INSERT INTO 1ai_cpm_fulfillment_clicks (fulfillment_id, click_id, created_at)
                 VALUES (?, ?, NOW())`,
                [batch.id, click_id]
            );

            // Increment count
            await conn.query(
                `UPDATE 1ai_cpm_fulfillments
                 SET click_count = click_count + 1
                 WHERE id = ?`,
                [batch.id]
            );
        }

        // Get current count
        const [updated] = await conn.query(
            `SELECT click_count, fulfilled FROM 1ai_cpm_fulfillments WHERE id = ?`,
            [batch.id]
        );
        const current = updated[0];

        await conn.commit();

        // Check if batch just became fulfilled (>= 1000 clicks)
        let fulfillmentResult = null;
        if (!batch.fulfilled && current.click_count >= CPM_BATCH_SIZE && !current.fulfilled) {
            fulfillmentResult = await fulfillCpmBatch(batch.id, offer_id, affiliate_id, cpm_rate);
        }

        return {
            batch_id: batch.id,
            click_count: current.click_count,
            fulfilled: current.fulfilled || (current.click_count >= CPM_BATCH_SIZE),
            fulfillment: fulfillmentResult
        };
    } catch (err) {
        await conn.rollback();
        console.error('[MultiModel] recordCpmClick error:', err);
        throw err;
    } finally {
        conn.release();
    }
}

/**
 * Fulfill a CPM batch — mark batch fulfilled and create single earning entry
 * @param {number} batch_id
 * @param {number} offer_id
 * @param {number} affiliate_id
 * @param {number} cpm_rate
 * @returns {Promise<Object>} fulfillment details
 */
async function fulfillCpmBatch(batch_id, offer_id, affiliate_id, cpm_rate) {
    const conn = await db.getConnection();
    try {
        await conn.beginTransaction();

        // Mark batch as fulfilled
        await conn.query(
            `UPDATE 1ai_cpm_fulfillments
             SET fulfilled = 1, fulfilled_at = NOW()
             WHERE id = ? AND fulfilled = 0`,
            [batch_id]
        );

        // Create single earning entry for the batch
        const [commissionResult] = await conn.query(
            `INSERT INTO 1ai_commission_entries
             (affiliate_id, offer_id, payout_model, commission, status, metadata, created_at)
             VALUES (?, ?, 'cpm', ?, 'pending', ?, UNIX_TIMESTAMP())`,
            [affiliate_id, offer_id, cpm_rate, JSON.stringify({ cpm_batch_id: batch_id })]
        );

        await conn.commit();

        return {
            batch_id,
            cpm_rate,
            payout: cpm_rate,
            commission_entry_id: commissionResult.insertId,
            fulfilled_at: new Date().toISOString()
        };
    } catch (err) {
        await conn.rollback();
        console.error('[MultiModel] fulfillCpmBatch error:', err);
        throw err;
    } finally {
        conn.release();
    }
}

/**
 * Get CPM batch status for an offer+affiliate
 * @param {number} offer_id
 * @param {number} affiliate_id
 * @returns {Promise<Object>} batch info
 */
async function getCpmBatchStatus(offer_id, affiliate_id) {
    const today = new Date().toISOString().slice(0, 10);

    const [batches] = await db.query(
        `SELECT id, click_count, cpm_rate, fulfilled, fulfilled_at, created_at
         FROM 1ai_cpm_fulfillments
         WHERE offer_id = ? AND affiliate_id = ? AND DATE(created_at) = ?
         ORDER BY id DESC LIMIT 1`,
        [offer_id, affiliate_id, today]
    );

    if (batches.length === 0) {
        return {
            batch_id: null,
            click_count: 0,
            cpm_rate: 0,
            fulfilled: false,
            progress_pct: 0,
            remaining: CPM_BATCH_SIZE
        };
    }

    const batch = batches[0];
    return {
        batch_id: batch.id,
        click_count: batch.click_count,
        cpm_rate: batch.cpm_rate,
        fulfilled: !!batch.fulfilled,
        fulfilled_at: batch.fulfilled_at,
        created_at: batch.created_at,
        progress_pct: Math.min(100, Math.round((batch.click_count / CPM_BATCH_SIZE) * 100)),
        remaining: Math.max(0, CPM_BATCH_SIZE - batch.click_count)
    };
}

/**
 * Get earnings by payout model for an affiliate
 * @param {number} affiliate_id
 * @param {string} [payout_model] - optional filter: 'cpc', 'cpv', 'cpm'
 * @param {string} [startDate]
 * @param {string} [endDate]
 * @returns {Promise<Array>} earnings rows
 */
async function getEarningsByModel(affiliate_id, payout_model, startDate, endDate) {
    let sql = `
        SELECT ce.*, o.name AS offer_name,
               ce.commission AS amount
        FROM 1ai_commission_entries ce
        JOIN 1ai_offers o ON o.id = ce.offer_id
        WHERE ce.affiliate_id = ?
    `;
    const params = [affiliate_id];

    if (payout_model) {
        sql += ' AND ce.payout_model = ?';
        params.push(payout_model);
    }

    if (startDate) {
        sql += ' AND ce.created_at >= ?';
        params.push(startDate);
    }

    if (endDate) {
        sql += ' AND ce.created_at <= ?';
        params.push(endDate);
    }

    sql += ' ORDER BY ce.created_at DESC LIMIT 500';

    const [rows] = await db.query(sql, params);
    return rows;
}

module.exports = {
    recordCpcEarning,
    recordCpvView,
    recordCpmClick,
    fulfillCpmBatch,
    getCpmBatchStatus,
    getEarningsByModel,
    CPM_BATCH_SIZE,
    CPV_QUALIFIED_MS
};
