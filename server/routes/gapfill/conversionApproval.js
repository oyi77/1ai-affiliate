/**
 * Gapfill Routes - Conversion Approval
 * Routes for conversion approval workflow.
 */

const express = require('express');
const router = express.Router();
const pool = require('../../db/mysql');

// ── GET /conversion-approval ──────────────────────────────────────
router.get('/conversion-approval', async (req, res) => {
  try {
    const { status } = req.query;
    let sql = 'SELECT cl.conversion_id, cl.click_id, cl.aff_campaign_id, cl.conversion_time, cl.network_payout_snapshot, cl.affiliate_payout_snapshot, cl.margin_amount, cl.affiliate_id, cl.affiliate_status, cl.status, cl.approved_by, cl.approved_at, cl.reject_reason FROM 1ai_conversion_logs cl';
    const params = [];
    if (status) {
      sql += ' WHERE cl.status = ?';
      params.push(status);
    }
    sql += ' ORDER BY cl.conversion_time DESC';
    const [rows] = await pool.query(sql, params);
    res.json({ data: rows });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch conversions', detail: err.message });
  }
});

// ── POST /conversion-approval/:id/approve ─────────────────────────
router.post('/conversion-approval/:id/approve', async (req, res) => {
  try {
    // Get conversion details before approving
    const [[conv]] = await pool.query(
      'SELECT conversion_id, affiliate_id, affiliate_payout_snapshot FROM 1ai_conversion_logs WHERE conversion_id = ?',
      [req.params.id]
    );
    if (!conv) return res.status(404).json({ error: 'Conversion not found' });

    // Approve the conversion
    const [result] = await pool.query(
      "UPDATE 1ai_conversion_logs SET status = 'approved', approved_by = ?, approved_at = UNIX_TIMESTAMP() WHERE conversion_id = ?",
      [req.user.id, req.params.id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Conversion not found' });

    // Update affiliate balance
    const payoutAmount = parseFloat(conv.affiliate_payout_snapshot || 0);
    if (payoutAmount > 0 && conv.affiliate_id) {
      await pool.query(
        'UPDATE 1ai_affiliates SET balance = balance + ?, updated_at = UNIX_TIMESTAMP() WHERE id = ?',
        [payoutAmount, conv.affiliate_id]
      );
      // Record in balance ledger
      const [[aff]] = await pool.query('SELECT user_id FROM 1ai_affiliates WHERE id = ?', [conv.affiliate_id]);
      if (aff) {
        await pool.query(
          'INSERT INTO 1ai_balance_ledger (user_id, amount, type, note, created_at) VALUES (?, ?, ?, ?, UNIX_TIMESTAMP())',
          [aff.user_id, payoutAmount, 'deposit', `Conversion #${conv.conversion_id} approved`]
        );
      }
    }

    res.json({ success: true, balance_updated: payoutAmount });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── POST /conversion-approval/:id/reject ──────────────────────────
router.post('/conversion-approval/:id/reject', async (req, res) => {
  try {
    const { reason } = req.body;
    if (!reason) return res.status(400).json({ error: 'reason is required' });
    const [result] = await pool.query(
      "UPDATE 1ai_conversion_logs SET status = 'rejected', reject_reason = ?, approved_by = ?, approved_at = UNIX_TIMESTAMP() WHERE conversion_id = ?",
      [reason, req.user.id, req.params.id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Conversion not found' });
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── POST /conversion-approval/batch-approve ───────────────────────
router.post('/conversion-approval/batch-approve', async (req, res) => {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) return res.status(400).json({ error: 'ids array is required' });

    // Get all conversions to approve
    const [convs] = await pool.query(
      'SELECT conversion_id, affiliate_id, affiliate_payout_snapshot FROM 1ai_conversion_logs WHERE conversion_id IN (?) AND status = ?',
      [ids, 'pending']
    );

    // Approve all
    await pool.query(
      "UPDATE 1ai_conversion_logs SET status = 'approved', approved_by = ?, approved_at = UNIX_TIMESTAMP() WHERE conversion_id IN (?) AND status = 'pending'",
      [req.user.id, ids]
    );

    // Update affiliate balances
    const balanceUpdates = {};
    for (const conv of convs) {
      const payout = parseFloat(conv.affiliate_payout_snapshot || 0);
      if (payout > 0 && conv.affiliate_id) {
        balanceUpdates[conv.affiliate_id] = (balanceUpdates[conv.affiliate_id] || 0) + payout;
      }
    }

    for (const [affId, total] of Object.entries(balanceUpdates)) {
      await pool.query(
        'UPDATE 1ai_affiliates SET balance = balance + ?, updated_at = UNIX_TIMESTAMP() WHERE id = ?',
        [total, affId]
      );
      const [[aff]] = await pool.query('SELECT user_id FROM 1ai_affiliates WHERE id = ?', [affId]);
      if (aff) {
        await pool.query(
          'INSERT INTO 1ai_balance_ledger (user_id, amount, type, note, created_at) VALUES (?, ?, ?, ?, UNIX_TIMESTAMP())',
          [aff.user_id, total, 'deposit', `Batch approve: ${convs.length} conversions`]
        );
      }
    }

    res.json({ success: true, affected: convs.length, balance_updates: Object.keys(balanceUpdates).length });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── GET /conversion-approval/stats ────────────────────────────────
router.get('/conversion-approval/stats', async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT status, COUNT(*) AS count FROM 1ai_conversion_logs GROUP BY status"
    );
    res.json({ data: rows });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;