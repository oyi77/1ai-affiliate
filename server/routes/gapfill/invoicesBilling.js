'use strict';
/**
 * Gapfill Routes - Advertiser Invoices & Billing
 * Split from server/routes/gapfill.js (800-line gate).
 */

const express = require('express');
const router = express.Router();
const pool = require('../../db/mysql');


// ═══════════════════════════════════════════════════════════════════
// ADVERTISER BILLING FLOW
// ═══════════════════════════════════════════════════════════════════

// ── GET /invoices — list invoices (filtered by role) ────────────────
router.get('/invoices', async (req, res) => {
  try {
    let sql = `SELECT i.*, a.company_name, u.user_name, u.user_email
               FROM 1ai_affiliate_invoices i
               LEFT JOIN 1ai_advertisers a ON a.id = i.affiliate_id
               LEFT JOIN 1ai_affiliates af ON af.id = i.affiliate_id
               LEFT JOIN 1ai_users u ON u.user_id = af.user_id`;
    const params = [];
    if (req.user.role === 'advertiser') {
      const [advRows] = await pool.query('SELECT id FROM 1ai_advertisers WHERE user_id = ?', [req.user.id]);
      if (advRows.length) {
        sql += ' WHERE i.affiliate_id = ?';
        params.push(advRows[0].id);
      }
    }
    if (req.query.status) {
      sql += params.length ? ' AND' : ' WHERE';
      sql += ' i.status = ?';
      params.push(req.query.status);
    }
    sql += ' ORDER BY i.id DESC LIMIT 200';
    const [rows] = await pool.query(sql, params);
    res.json({ data: rows });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch invoices', detail: err.message });
  }
});


// ── POST /invoices — admin creates invoice ──────────────────────────
router.post('/invoices', async (req, res) => {
  try {
    const { affiliate_id, period_start, period_end, conversions_count, revenue_amount, payout_amount, margin_amount, currency, notes } = req.body;
    if (!affiliate_id || !period_start || !period_end) return res.status(400).json({ error: 'affiliate_id, period_start, period_end required' });
    const [result] = await pool.query(
      `INSERT INTO 1ai_affiliate_invoices (affiliate_id, period_start, period_end, conversions_count, revenue_amount, payout_amount, margin_amount, currency, notes, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, UNIX_TIMESTAMP(), UNIX_TIMESTAMP())`,
      [affiliate_id, period_start, period_end, conversions_count || 0, revenue_amount || 0, payout_amount || 0, margin_amount || 0, currency || 'USD', notes || null]
    );
    res.json({ success: true, invoice_id: result.insertId });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create invoice', detail: err.message });
  }
});


// ── POST /invoices/:id/pay — mark invoice as paid ───────────────────
router.post('/invoices/:id/pay', async (req, res) => {
  try {
    const [result] = await pool.query(
      `UPDATE 1ai_affiliate_invoices SET status = 'paid', paid_at = UNIX_TIMESTAMP(), paid_by = ?, updated_at = UNIX_TIMESTAMP() WHERE id = ? AND status IN ('draft','sent')`,
      [req.user.id, req.params.id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Invoice not found or already paid' });
    // Update related earnings to 'paid'
    const [[invoice]] = await pool.query('SELECT affiliate_id, period_start, period_end FROM 1ai_affiliate_invoices WHERE id = ?', [req.params.id]);
    if (invoice) {
      await pool.query(
        `UPDATE 1ai_affiliate_earnings SET status = 'paid', paid_at = UNIX_TIMESTAMP() WHERE affiliate_id = ? AND status = 'approved' AND created_at >= UNIX_TIMESTAMP(?) AND created_at <= UNIX_TIMESTAMP(?)`,
        [invoice.affiliate_id, invoice.period_start, invoice.period_end]
      );
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to mark invoice as paid', detail: err.message });
  }
});


// ── POST /invoices/:id/send — mark invoice as sent ──────────────────
router.post('/invoices/:id/send', async (req, res) => {
  try {
    const [result] = await pool.query(
      `UPDATE 1ai_affiliate_invoices SET status = 'sent', updated_at = UNIX_TIMESTAMP() WHERE id = ? AND status = 'draft'`,
      [req.params.id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Invoice not found or not in draft' });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to send invoice', detail: err.message });
  }
});


// ── GET /billing/summary — billing overview ─────────────────────────
router.get('/billing/summary', async (req, res) => {
  try {
    const [totalEarned] = await pool.query(`SELECT COALESCE(SUM(payout_amount),0) AS total FROM 1ai_affiliate_earnings`);
    const [totalPaid] = await pool.query(`SELECT COALESCE(SUM(payout_amount),0) AS total FROM 1ai_affiliate_earnings WHERE status = 'paid'`);
    const [totalPending] = await pool.query(`SELECT COALESCE(SUM(payout_amount),0) AS total FROM 1ai_affiliate_earnings WHERE status IN ('pending','approved')`);
    const [invoiceStats] = await pool.query(`SELECT status, COUNT(*) AS cnt, COALESCE(SUM(payout_amount),0) AS total FROM 1ai_affiliate_invoices GROUP BY status`);
    const [depositTotal] = await pool.query(`SELECT COALESCE(SUM(amount),0) AS total FROM 1ai_balance_ledger WHERE type = 'deposit'`);
    const [withdrawTotal] = await pool.query(`SELECT COALESCE(SUM(amount),0) AS total FROM 1ai_balance_ledger WHERE type IN ('withdrawal','spend')`);
    const invoices = {};
    invoiceStats.forEach(r => { invoices[r.status] = { count: r.cnt, amount: Number(r.total) }; });
    res.json({
      earnings: {
        total: Number(totalEarned[0].total),
        paid: Number(totalPaid[0].total),
        pending: Number(totalPending[0].total),
      },
      invoices,
      balance: {
        deposits: Number(depositTotal[0].total),
        withdrawals: Number(withdrawTotal[0].total),
        available: Number(depositTotal[0].total) - Number(withdrawTotal[0].total),
      }
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch billing summary', detail: err.message });
  }
});


router.get('/balance', async (req, res) => {
  try {
    const [[earnings]] = await pool.query('SELECT COALESCE(SUM(payout_amount), 0) as total FROM 1ai_affiliate_earnings WHERE status = "approved"');
    const [[pending]] = await pool.query('SELECT COALESCE(SUM(payout_amount), 0) as total FROM 1ai_affiliate_earnings WHERE status = "pending"');
    const [[paid]] = await pool.query('SELECT COALESCE(SUM(amount), 0) as total FROM 1ai_affiliate_payments WHERE status = "paid"');
    const [transactions] = await pool.query('SELECT * FROM 1ai_balance_ledger ORDER BY id DESC LIMIT 50');
    res.json({ data: { earnings: earnings.total, pending: pending.total, paid: paid.total, transactions } });
  } catch (err) { res.status(500).json({ error: err.message }); }
});


router.get('/balance/summary', async (req, res) => {
  try {
    const [[earnings]] = await pool.query('SELECT COALESCE(SUM(payout_amount), 0) as total FROM 1ai_affiliate_earnings WHERE status = "approved"');
    const [[pending]] = await pool.query('SELECT COALESCE(SUM(payout_amount), 0) as total FROM 1ai_affiliate_earnings WHERE status = "pending"');
    const [[paid]] = await pool.query('SELECT COALESCE(SUM(amount), 0) as total FROM 1ai_affiliate_payments WHERE status = "paid"');
    res.json({ data: { total_earnings: earnings.total, total_pending: pending.total, total_paid: paid.total, available_balance: earnings.total - paid.total } });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
