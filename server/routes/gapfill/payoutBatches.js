/**
 * Gapfill Routes - Payout Batches
 * Routes for payout batch management.
 */

const express = require('express');
const router = express.Router();
const pool = require('../../db/mysql');

// ── GET /payouts/batches ────────────────────────────────────────────
router.get('/payouts/batches', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM payout_batches ORDER BY id DESC'
    );
    res.json({ data: rows });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch payout batches', detail: err.message });
  }
});

// ── POST /payouts/batches ───────────────────────────────────────────
router.post('/payouts/batches', async (req, res) => {
  try {
    // Aggregate pending earnings by affiliate
    const [pendingEarnings] = await pool.query(
      "SELECT affiliate_id, SUM(amount) AS total FROM 1ai_affiliate_earnings WHERE status = 'pending' GROUP BY affiliate_id"
    );
    if (pendingEarnings.length === 0) return res.status(400).json({ error: 'No pending earnings to process' });
    const grandTotal = pendingEarnings.reduce((sum, e) => sum + parseFloat(e.total), 0);
    // Create batch
    const [batchResult] = await pool.query(
      "INSERT INTO payout_batches (total, status, created_at) VALUES (?, 'draft', UNIX_TIMESTAMP())",
      [grandTotal]
    );
    const batchId = batchResult.insertId;
    // Create payout items
    for (const earning of pendingEarnings) {
      await pool.query(
        'INSERT INTO payout_items (batch_id, affiliate_id, amount) VALUES (?, ?, ?)',
        [batchId, earning.affiliate_id, earning.total]
      );
    }
    // Update earnings status to processing
    await pool.query(
      "UPDATE 1ai_affiliate_earnings SET status = 'processing' WHERE status = 'pending'"
    );
    res.status(201).json({ data: { id: batchId, total: grandTotal, status: 'draft', items: pendingEarnings.length } });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create payout batch', detail: err.message });
  }
});

// ── POST /payouts/batches/:id/mark-paid ────────────────────────────
router.post('/payouts/batches/:id/mark-paid', async (req, res) => {
  try {
    const [batchCheck] = await pool.query(
      'SELECT id, status FROM payout_batches WHERE id = ?', [req.params.id]
    );
    if (batchCheck.length === 0) return res.status(404).json({ error: 'Batch not found' });
    await pool.query(
      "UPDATE payout_batches SET status = 'paid' WHERE id = ?", [req.params.id]
    );
    // Update affiliate earnings associated with this batch's items to 'paid'
    const [items] = await pool.query(
      'SELECT affiliate_id, amount FROM payout_items WHERE batch_id = ?', [req.params.id]
    );
    for (const item of items) {
      await pool.query(
        "UPDATE 1ai_affiliate_earnings SET status = 'paid' WHERE affiliate_id = ? AND status = 'processing'",
        [item.affiliate_id]
      );
    }
    res.json({ success: true, items_updated: items.length });
  } catch (err) {
    res.status(500).json({ error: 'Failed to mark batch as paid', detail: err.message });
  }
});

// ── GET /payouts/batches/:id/items ─────────────────────────────────
router.get('/payouts/batches/:id/items', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM payout_items WHERE batch_id = ?', [req.params.id]
    );
    res.json({ data: rows });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch payout items', detail: err.message });
  }
});

module.exports = router;