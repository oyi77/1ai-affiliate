'use strict';

const express = require('express');
const router = express.Router();
const pool = require('../db/mysql');
const { authenticate } = require('../middleware/auth');

// ── Public: list built-in (public) templates ──────────────────────
router.get('/', async (req, res) => {
  try {
    const category = req.query.category;
    let sql = `SELECT id, name, category, description, html_template AS html_content,
                      fields, ctr_score, is_public, status, created_at
               FROM landing_page_templates
               WHERE is_public = 1 AND status = 'active'`;
    const params = [];
    if (category && category !== 'all') {
      sql += ' AND category = ?';
      params.push(category);
    }
    sql += ' ORDER BY ctr_score DESC, name';
    const [rows] = await pool.query(sql, params);
    // Parse JSON fields
    for (const r of rows) {
      if (typeof r.fields === 'string') { try { r.fields = JSON.parse(r.fields); } catch {} }
    }
    res.json({ data: rows });
  } catch (err) {
    console.error('GET /api/templates/landing error:', err);
    res.status(500).json({ error: 'Failed to load templates' });
  }
});

// ── Authenticated routes ──────────────────────────────────────────
router.use(authenticate);

// GET /mine — user's own templates
router.get('/mine', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT id, name, category, description, html_template AS html_content,
              fields, ctr_score, is_public, status, created_at
       FROM landing_page_templates
       WHERE user_id = ? AND status != 'archived'
       ORDER BY updated_at DESC`,
      [req.user.id]
    );
    for (const r of rows) {
      if (typeof r.fields === 'string') { try { r.fields = JSON.parse(r.fields); } catch {} }
    }
    res.json({ data: rows });
  } catch (err) {
    console.error('GET /mine error:', err);
    res.status(500).json({ error: 'Failed to load your templates' });
  }
});

// POST / — save customized copy of a template
router.post('/', async (req, res) => {
  try {
    const { name, category, description, html_content, fields, is_public } = req.body;
    if (!name || !html_content) {
      return res.status(400).json({ error: 'name and html_content required' });
    }
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
                     + '-' + Date.now().toString(36);
    const [result] = await pool.query(
      `INSERT INTO landing_page_templates
         (user_id, name, slug, category, description, html_template, fields, is_public, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'active')`,
      [req.user.id, name, slug, category || 'custom', description || '', html_content,
       JSON.stringify(fields || []), is_public ? 1 : 0]
    );
    res.status(201).json({ id: result.insertId, slug });
  } catch (err) {
    console.error('POST / error:', err);
    res.status(500).json({ error: 'Failed to save template' });
  }
});

// POST /import — import raw HTML
router.post('/import', async (req, res) => {
  try {
    const { name, category, html_content } = req.body;
    if (!name || !html_content) {
      return res.status(400).json({ error: 'name and html_content required' });
    }
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
                     + '-import-' + Date.now().toString(36);
    const [result] = await pool.query(
      `INSERT INTO landing_page_templates
         (user_id, name, slug, category, description, html_template, fields, is_public, status)
       VALUES (?, ?, ?, ?, ?, ?, '[]', 0, 'active')`,
      [req.user.id, name, slug, category || 'custom', '', html_content]
    );
    res.status(201).json({ id: result.insertId, slug });
  } catch (err) {
    console.error('POST /import error:', err);
    res.status(500).json({ error: 'Failed to import template' });
  }
});

// DELETE /:id — delete user's own template
router.delete('/:id', async (req, res) => {
  try {
    const [result] = await pool.query(
      `UPDATE landing_page_templates SET status = 'archived'
       WHERE id = ? AND user_id = ?`,
      [req.params.id, req.user.id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Template not found or not yours' });
    }
    res.json({ deleted: true });
  } catch (err) {
    console.error('DELETE /:id error:', err);
    res.status(500).json({ error: 'Failed to delete template' });
  }
});

module.exports = router;
