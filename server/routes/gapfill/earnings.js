'use strict';
/**
 * Gapfill Routes - Affiliate Earnings & Claims
 * Split from server/routes/gapfill.js (800-line gate).
 */

const express = require('express');
const router = express.Router();
const pool = require('../../db/mysql');

// ═══════════════════════════════════════════════════════════════════
// AFFILIATE CLAIM FLOW
// ═══════════════════════════════════════════════════════════════════

// ── GET /earnings/my — affiliate sees own earnings ──────────────────
router.get('/earnings/my', async (req, res) => {
  try {
    const [affRows] = await pool.query('SELECT id FROM 1ai_affiliates WHERE user_id = ?', [req.user.id]);
    if (!affRows.length) return res.json({ data: [], summary: { pending: 0, approved: 0, paid: 0, rejected: 0 } });
    const affiliateId = affRows[0].id;
    const status = req.query.status;
    let sql = 'SELECT * FROM 1ai_affiliate_earnings WHERE affiliate_id = ?';
    const params = [affiliateId];
    if (status) { sql += ' AND status = ?'; params.push(status); }
    sql += ' ORDER BY id DESC LIMIT 200';
    const [rows] = await pool.query(sql, params);
    const [summary] = await pool.query(
      `SELECT status, COUNT(*) AS cnt, COALESCE(SUM(payout_amount),0) AS total
       FROM 1ai_affiliate_earnings WHERE affiliate_id = ? GROUP BY status`, [affiliateId]
    );
    const sum = { pending: 0, approved: 0, paid: 0, rejected: 0 };
    summary.forEach(r => { sum[r.status] = { count: r.cnt, amount: Number(r.total) }; });
    res.json({ data: rows, summary: sum });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch earnings', detail: err.message });
  }
});


// ── POST /earnings/claim — affiliate requests payout ────────────────
router.post('/earnings/claim', async (req, res) => {
  try {
    const [affRows] = await pool.query('SELECT id FROM 1ai_affiliates WHERE user_id = ?', [req.user.id]);
    if (!affRows.length) return res.status(403).json({ error: 'Not an affiliate' });
    const affiliateId = affRows[0].id;
    const { ids } = req.body; // optional: specific earning IDs to claim
    let affected;
    if (ids && ids.length) {
      const placeholders = ids.map(() => '?').join(',');
      const [result] = await pool.query(
        `UPDATE 1ai_affiliate_earnings SET status = 'approved', approved_by = ?, approved_at = UNIX_TIMESTAMP()
         WHERE id IN (${placeholders}) AND affiliate_id = ? AND status = 'pending'`,
        [req.user.id, ...ids, affiliateId]
      );
      affected = result.affectedRows;
    } else {
      const [result] = await pool.query(
        `UPDATE 1ai_affiliate_earnings SET status = 'approved', approved_by = ?, approved_at = UNIX_TIMESTAMP()
         WHERE affiliate_id = ? AND status = 'pending'`,
        [req.user.id, affiliateId]
      );
      affected = result.affectedRows;
    }
    res.json({ success: true, claimed: affected });
  } catch (err) {
    res.status(500).json({ error: 'Failed to claim earnings', detail: err.message });
  }
});


// ── GET /earnings/claims — admin sees all claims ────────────────────
router.get('/earnings/claims', async (req, res) => {
  try {
    const status = req.query.status;
    let sql = `SELECT e.*, a.affiliate_code, u.user_name, u.user_email
               FROM 1ai_affiliate_earnings e
               JOIN 1ai_affiliates a ON a.id = e.affiliate_id
               JOIN 1ai_users u ON u.user_id = a.user_id`;
    const params = [];
    if (status) { sql += ' WHERE e.status = ?'; params.push(status); }
    sql += ' ORDER BY e.id DESC LIMIT 500';
    const [rows] = await pool.query(sql, params);
    res.json({ data: rows });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch claims', detail: err.message });
  }
});


// ── POST /earnings/:id/approve — admin approves earning + credits balance
router.post('/earnings/:id/approve', async (req, res) => {
  try {
    // Get earning before approving
    const [[earning]] = await pool.query(
      'SELECT id, affiliate_id, payout_amount FROM 1ai_affiliate_earnings WHERE id = ? AND status = ?',
      [req.params.id, 'pending']
    );
    if (!earning) return res.status(404).json({ error: 'Earning not found or already processed' });

    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();

      // Approve earning
      await conn.query(
        `UPDATE 1ai_affiliate_earnings SET status = 'approved', approved_by = ?, approved_at = UNIX_TIMESTAMP() WHERE id = ?`,
        [req.user.id, req.params.id]
      );

      // Credit affiliate balance
      const payout = Number(earning.payout_amount);
      if (payout > 0 && earning.affiliate_id) {
        await conn.query(
          'UPDATE 1ai_affiliates SET balance = balance + ?, updated_at = UNIX_TIMESTAMP() WHERE id = ?',
          [payout, earning.affiliate_id]
        );
        // Get user_id for ledger
        const [[aff]] = await conn.query('SELECT user_id FROM 1ai_affiliates WHERE id = ?', [earning.affiliate_id]);
        if (aff) {
          await conn.query(
            'INSERT INTO 1ai_balance_ledger (user_id, amount, type, note, created_at) VALUES (?, ?, ?, ?, UNIX_TIMESTAMP())',
            [aff.user_id, payout, 'deposit', `Earning #${earning.id} approved`]
          );
        }
      }

      await conn.commit();
    } catch (e) {
      await conn.rollback();
      throw e;
    } finally {
      conn.release();
    }

    res.json({ success: true, balance_credited: Number(earning.payout_amount) });
  } catch (err) {
    res.status(500).json({ error: 'Failed to approve earning', detail: err.message });
  }
});


// ── POST /earnings/:id/reject — admin rejects earning ───────────────
router.post('/earnings/:id/reject', async (req, res) => {
  try {
    const [result] = await pool.query(
      `UPDATE 1ai_affiliate_earnings SET status = 'rejected' WHERE id = ? AND status = 'pending'`,
      [req.params.id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Earning not found or already processed' });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to reject earning', detail: err.message });
  }
});



// ── Affiliates Earnings ────────────────────────────────────────────
router.get('/affiliates/earnings', async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 100, 500);
    const [rows] = await pool.query(
      `SELECT e.*, a.user_id as affiliate_user_id, u.user_name
       FROM 1ai_affiliate_earnings e
       LEFT JOIN 1ai_affiliates a ON e.affiliate_id = a.id
       LEFT JOIN 1ai_users u ON a.user_id = u.user_id
       ORDER BY e.id DESC LIMIT ?`,
      [limit]
    );
    res.json({ data: rows });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
