'use strict';

const pool = require('../db/mysql');
const posterService = require('./posterService');

/**
 * Boost execution engine.
 * Executes boost orders by posting content to management's fanpages.
 * Called by the poster worker or manually via admin trigger.
 */

async function getPendingOrders() {
  return pool.query(
    `SELECT bo.*, o.name AS offer_name, o.tracking_url
     FROM 1ai_boost_orders bo
     LEFT JOIN 1ai_offers o ON o.id = bo.offer_id
     WHERE bo.status = 'pending'
     ORDER BY bo.created_at ASC
     LIMIT 10`
  ).then(([rows]) => rows);
}

async function executeOrder(orderId) {
  const conn = await pool.getConnection();
  try {
    const [[order]] = await conn.query(
      'SELECT * FROM 1ai_boost_orders WHERE id = ? AND status IN (?, ?)',
      [orderId, 'pending', 'running']
    );
    if (!order) return { success: false, error: 'Order not found or not executable' };

    // Mark as running
    await conn.query(
      "UPDATE 1ai_boost_orders SET status = 'running', started_at = UNIX_TIMESTAMP() WHERE id = ?",
      [orderId]
    );
    conn.release();

    const content = order.post_content || '';
    const images = typeof order.post_images === 'string' ? JSON.parse(order.post_images) : (order.post_images || []);
    const targetUrl = order.target_url || '';
    const fanpageCount = order.fanpage_count || 0;

    // Post to fanpages via poster service
    // For now, simulate posting — in production this would iterate management's fanpages
    let posted = 0;
    let failed = 0;

    try {
      for (let i = 0; i < fanpageCount; i++) {
        try {
          // Each post goes to one fanpage
          await posterService.postToTelegram(
            `${content}\n\n${targetUrl}`,
            images[0] || null
          );
          posted++;
        } catch (postErr) {
          failed++;
          console.error(`Boost order ${orderId} fanpage ${i + 1} failed:`, postErr.message);
        }
      }

      // Update order with results
      const finalStatus = posted > 0 ? 'completed' : 'failed';
      await pool.query(
        `UPDATE 1ai_boost_orders SET
         status = ?, completed_at = UNIX_TIMESTAMP(),
         impressions = ?, clicks = 0, conversions = 0
         WHERE id = ?`,
        [finalStatus, posted * 100, orderId] // Estimate 100 impressions per fanpage post
      );

      return { success: true, posted, failed, status: finalStatus };
    } catch (execErr) {
      await pool.query(
        "UPDATE 1ai_boost_orders SET status = 'failed', completed_at = UNIX_TIMESTAMP() WHERE id = ?",
        [orderId]
      );
      return { success: false, error: execErr.message };
    }
  } catch (err) {
    conn.release();
    return { success: false, error: err.message };
  }
}

async function cancelOrder(orderId, userId) {
  const conn = await pool.getConnection();
  try {
    const [[order]] = await conn.query(
      "SELECT * FROM 1ai_boost_orders WHERE id = ? AND user_id = ? AND status = 'pending'",
      [orderId, userId]
    );
    if (!order) return { success: false, error: 'Order not found or not cancellable' };

    await conn.beginTransaction();

    await conn.query(
      "UPDATE 1ai_boost_orders SET status = 'cancelled' WHERE id = ?",
      [orderId]
    );

    // Refund
    const refund = Number(order.total_cost);
    if (refund > 0) {
      await conn.query(
        'INSERT INTO 1ai_balance_ledger (user_id, amount, type, note, created_at) VALUES (?, ?, ?, ?, UNIX_TIMESTAMP())',
        [userId, refund, 'adjustment', `Refund: Boost order #${orderId} cancelled`]
      );
    }

    await conn.commit();
    return { success: true, refunded: refund };
  } catch (err) {
    await conn.rollback();
    return { success: false, error: err.message };
  } finally {
    conn.release();
  }
}

module.exports = { getPendingOrders, executeOrder, cancelOrder };
