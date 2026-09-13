/**
 * Gapfill Routes - Affiliate Payout Requests
 * Routes for affiliate payout request flow.
 */

const express = require('express');
const router = express.Router();
const pool = require('../../db/mysql');

// ── POST /affiliate/payout-request ───────────────────────────────
// Affiliate requests a payout of their balance
router.post('/affiliate/payout-request', async (req, res) => {
  try {
    const userId = req.user.id;
    const [[aff]] = await pool.query('SELECT id, balance FROM 1ai_affiliates WHERE user_id = ?', [userId]);
    if (!aff) return res.status(404).json({ error: 'Affiliate not found' });
    if (aff.balance <= 0) return res.status(400).json({ error: 'No balance to withdraw' });

    const { method, details } = req.body;
    if (!method) return res.status(400).json({ error: 'Payout method required (bank_transfer, paypal, crypto)' });

    // Create payout request
    const [result] = await pool.query(
      `INSERT INTO 1ai_payout_requests (affiliate_id, amount, method, details, status, created_at)
       VALUES (?, ?, ?, ?, 'pending', UNIX_TIMESTAMP())`,
      [aff.id, aff.balance, method, JSON.stringify(details || {})]
    ).catch(async () => {
      // Table may not exist, create it
      await pool.query(`CREATE TABLE IF NOT EXISTS 1ai_payout_requests (
        id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        affiliate_id INT UNSIGNED NOT NULL,
        amount DECIMAL(10,2) NOT NULL,
        method VARCHAR(50) NOT NULL,
        details TEXT,
        status ENUM('pending','approved','rejected','paid') DEFAULT 'pending',
        processed_by INT UNSIGNED,
        processed_at INT UNSIGNED,
        created_at INT UNSIGNED NOT NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`);
      return pool.query(
        `INSERT INTO 1ai_payout_requests (affiliate_id, amount, method, details, status, created_at)
         VALUES (?, ?, ?, ?, 'pending', UNIX_TIMESTAMP())`,
        [aff.id, aff.balance, method, JSON.stringify(details || {})]
      );
    });

    res.json({ data: { id: result.insertId, amount: aff.balance, method, status: 'pending' } });
  } catch (err) {
    console.error('Payout request error:', err.message);
    res.status(500).json({ error: 'Failed to create payout request' });
  }
});

// ── GET /admin/payout-requests ─────────────────────────────────────
// Admin views all payout requests
router.get('/payout-requests', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT pr.*, a.affiliate_code, u.user_email
       FROM 1ai_payout_requests pr
       JOIN 1ai_affiliates a ON a.id = pr.affiliate_id
       JOIN 1ai_users u ON u.user_id = a.user_id
       ORDER BY pr.created_at DESC LIMIT 100`
    ).catch(() => [[]]);
    res.json({ data: rows });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch payout requests' });
  }
});

// ── POST /admin/payout-requests/:id/process ───────────────────────
// Admin processes a payout request (approve/reject)
router.post('/payout-requests/:id/process', async (req, res) => {
  try {
    const { action, note } = req.body;
    if (!['approve', 'reject'].includes(action)) return res.status(400).json({ error: 'action must be approve or reject' });

    const [[payout]] = await pool.query('SELECT * FROM 1ai_payout_requests WHERE id = ? AND status = ?', [req.params.id, 'pending']);
    if (!payout) return res.status(404).json({ error: 'Payout request not found or already processed' });

    const newStatus = action === 'approve' ? 'approved' : 'rejected';
    await pool.query(
      'UPDATE 1ai_payout_requests SET status = ?, processed_by = ?, processed_at = UNIX_TIMESTAMP() WHERE id = ?',
      [newStatus, req.user.id, req.params.id]
    );

    if (action === 'approve') {
      // Deduct from affiliate balance
      await pool.query(
        'UPDATE 1ai_affiliates SET balance = balance - ?, updated_at = UNIX_TIMESTAMP() WHERE id = ?',
        [payout.amount, payout.affiliate_id]
      );
      // Record in ledger
      const [[aff]] = await pool.query('SELECT user_id FROM 1ai_affiliates WHERE id = ?', [payout.affiliate_id]);
      if (aff) {
        await pool.query(
          'INSERT INTO 1ai_balance_ledger (user_id, amount, type, note, created_at) VALUES (?, ?, ?, ?, UNIX_TIMESTAMP())',
          [aff.user_id, -payout.amount, 'withdrawal', `Payout #${payout.id} approved`]
        );
      }
    }

    res.json({ success: true, status: newStatus });
  } catch (err) {
    console.error('Process payout error:', err.message);
    res.status(500).json({ error: 'Failed to process payout' });
  }
});

module.exports = router;