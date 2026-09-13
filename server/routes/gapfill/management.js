'use strict';
/**
 * Gapfill Routes - Management Oversight
 * Split from server/routes/gapfill.js (800-line gate).
 */

const express = require('express');
const router = express.Router();
const pool = require('../../db/mysql');


// ═══════════════════════════════════════════════════════════════════
// MANAGEMENT OVERSIGHT
// ═══════════════════════════════════════════════════════════════════

// ── GET /management/overview — full financial overview ──────────────
router.get('/management/overview', async (req, res) => {
  try {
    const [earnings] = await pool.query(`SELECT status, COUNT(*) AS cnt, COALESCE(SUM(payout_amount),0) AS total FROM 1ai_affiliate_earnings GROUP BY status`);
    const [invoices] = await pool.query(`SELECT status, COUNT(*) AS cnt, COALESCE(SUM(payout_amount),0) AS total FROM 1ai_affiliate_invoices GROUP BY status`);
    const [payments] = await pool.query(`SELECT status, COUNT(*) AS cnt, COALESCE(SUM(amount),0) AS total FROM 1ai_affiliate_payments GROUP BY status`);
    const [batches] = await pool.query(`SELECT status, COUNT(*) AS cnt, COALESCE(SUM(total),0) AS total FROM payout_batches GROUP BY status`);
    const [deposits] = await pool.query(`SELECT COALESCE(SUM(amount),0) AS total FROM 1ai_balance_ledger WHERE type='deposit'`);
    const [withdrawals] = await pool.query(`SELECT COALESCE(SUM(amount),0) AS total FROM 1ai_balance_ledger WHERE type IN ('withdrawal','spend')`);
    const format = (rows) => { const o = {}; rows.forEach(r => { o[r.status] = { count: r.cnt, amount: Number(r.total) }; }); return o; };
    res.json({
      earnings: format(earnings),
      invoices: format(invoices),
      payments: format(payments),
      payout_batches: format(batches),
      balance: {
        deposits: Number(deposits[0].total),
        withdrawals: Number(withdrawals[0].total),
        net: Number(deposits[0].total) - Number(withdrawals[0].total),
      }
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch management overview', detail: err.message });
  }
});


// ── GET /management/transactions — all transactions with details ────
router.get('/management/transactions', async (req, res) => {
  try {
    const limit = Math.min(Number(req.query.limit) || 100, 500);
    const [earnings] = await pool.query(
      `SELECT 'earning' AS type, e.id, e.payout_amount AS amount, e.status, e.created_at, u.user_name, u.user_email
       FROM 1ai_affiliate_earnings e
       JOIN 1ai_affiliates a ON a.id = e.affiliate_id
       JOIN 1ai_users u ON u.user_id = a.user_id
       ORDER BY e.id DESC LIMIT ?`, [limit]
    );
    const [payments] = await pool.query(
      `SELECT 'payment' AS type, p.id, p.amount, p.status, p.created_at, u.user_name, u.user_email
       FROM 1ai_affiliate_payments p
       JOIN 1ai_users u ON u.user_id = p.user_id
       ORDER BY p.id DESC LIMIT ?`, [limit]
    );
    const [invoices] = await pool.query(
      `SELECT 'invoice' AS type, i.id, i.payout_amount AS amount, i.status, i.created_at, u.user_name, u.user_email
       FROM 1ai_affiliate_invoices i
       JOIN 1ai_affiliates a ON a.id = i.affiliate_id
       JOIN 1ai_users u ON u.user_id = a.user_id
       ORDER BY i.id DESC LIMIT ?`, [limit]
    );
    const all = [...earnings, ...payments, ...invoices].sort((a, b) => b.created_at - a.created_at).slice(0, limit);
    res.json({ data: all });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch transactions', detail: err.message });
  }
});

module.exports = router;
