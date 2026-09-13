/**
 * Gapfill Routes - Creatives
 * CRUD routes for offer creatives.
 */

const express = require('express');
const router = express.Router();
const pool = require('../../db/mysql');

// ── GET /creatives ──────────────────────────────────────────────────
router.get('/creatives', async (req, res) => {
  try {
    const { offer_id } = req.query;
    if (!offer_id) return res.status(400).json({ error: 'offer_id is required' });
    const [rows] = await pool.query(
      'SELECT * FROM 1ai_offer_creatives WHERE offer_id = ? ORDER BY id DESC', [offer_id]
    );
    res.json({ data: rows });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch creatives', detail: err.message });
  }
});

// ── POST /creatives ─────────────────────────────────────────────────
router.post('/creatives', async (req, res) => {
  try {
    const { offer_id, name, type, asset_url, html_body, dimensions } = req.body;
    if (!offer_id || !name || !type) return res.status(400).json({ error: 'offer_id, name, and type are required' });
    const [result] = await pool.query(
      'INSERT INTO 1ai_offer_creatives (offer_id, name, type, asset_url, html_body, dimensions, is_active, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, 1, UNIX_TIMESTAMP(), UNIX_TIMESTAMP())',
      [offer_id, name, type, asset_url || null, html_body || null, dimensions || null]
    );
    res.status(201).json({ data: { id: result.insertId, offer_id, name, type, asset_url, html_body, dimensions, is_active: 1 } });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create creative', detail: err.message });
  }
});

// ── PUT /creatives/:id ──────────────────────────────────────────────
router.put('/creatives/:id', async (req, res) => {
  try {
    const fields = ['offer_id', 'name', 'type', 'asset_url', 'html_body', 'dimensions'];
    const updates = [];
    const values = [];
    for (const f of fields) {
      if (req.body[f] !== undefined) {
        updates.push(`${f} = ?`);
        values.push(req.body[f]);
      }
    }
    if (updates.length === 0) return res.status(400).json({ error: 'No fields to update' });
    updates.push('updated_at = UNIX_TIMESTAMP()');
    values.push(req.params.id);
    const [result] = await pool.query(
      `UPDATE 1ai_offer_creatives SET ${updates.join(', ')} WHERE id = ?`, values
    );
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Creative not found' });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update creative', detail: err.message });
  }
});

// ── DELETE /creatives/:id ───────────────────────────────────────────
router.delete('/creatives/:id', async (req, res) => {
  try {
    const [result] = await pool.query(
      'UPDATE 1ai_offer_creatives SET is_active = 0, updated_at = UNIX_TIMESTAMP() WHERE id = ?', [req.params.id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Creative not found' });
    res.json({ data: { deleted: true } });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete creative', detail: err.message });
  }
});

module.exports = router;