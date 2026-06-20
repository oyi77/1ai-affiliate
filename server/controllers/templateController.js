'use strict';

const pool = require('../db/mysql');

/**
 * Landing page template controller — CRUD for user-created and built-in templates.
 * Table: landing_page_templates
 *   id, user_id, name, slug, category, description, thumbnail_url,
 *   html_template, fields (JSON), tags, ctr_score, is_public, status,
 *   created_at, updated_at
 */

// ── Helpers ──────────────────────────────────────────────────────────────────

function slugify(str) {
  return String(str)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 120);
}

// ── GET /api/templates/landing ───────────────────────────────────────────────
async function listPublic(req, res) {
  const { category, search } = req.query;
  let sql = 'SELECT id, user_id, name, slug, category, description, thumbnail_url, tags, ctr_score, is_public, status, created_at, updated_at FROM landing_page_templates WHERE is_public = 1 AND status = ?';
  const params = ['active'];

  if (category) {
    sql += ' AND category = ?';
    params.push(category);
  }
  if (search) {
    sql += ' AND (name LIKE ? OR description LIKE ? OR tags LIKE ?)';
    const like = `%${search}%`;
    params.push(like, like, like);
  }

  sql += ' ORDER BY ctr_score DESC, created_at DESC';
  const [rows] = await pool.query(sql, params);
  res.json({ data: rows });
}

// ── GET /api/templates/landing/mine ──────────────────────────────────────────
async function listMine(req, res) {
  const [rows] = await pool.query(
    `SELECT id, user_id, name, slug, category, description, thumbnail_url, tags, ctr_score, is_public, status, created_at, updated_at
     FROM landing_page_templates
     WHERE (user_id = ? OR is_public = 1) AND status = 'active'
     ORDER BY user_id = ? DESC, ctr_score DESC, created_at DESC`,
    [req.user.id, req.user.id]
  );
  res.json({ data: rows });
}

// ── GET /api/templates/landing/:id ───────────────────────────────────────────
async function getOne(req, res) {
  const [rows] = await pool.query(
    'SELECT * FROM landing_page_templates WHERE id = ? AND status != ?',
    [req.params.id, 'archived']
  );
  if (!rows[0]) return res.status(404).json({ error: 'Template not found' });
  res.json({ data: rows[0] });
}

// ── POST /api/templates/landing ──────────────────────────────────────────────
async function create(req, res) {
  const { name, category, description, html_template, fields, tags, is_public } = req.body;
  if (!name || !html_template) {
    return res.status(400).json({ error: 'name and html_template are required' });
  }

  const slug = slugify(name) + '-' + Date.now().toString(36);
  const isAdmin = req.user.role === 'admin';
  const publicFlag = isAdmin && is_public ? 1 : 0;
  const fieldsJson = fields ? JSON.stringify(fields) : null;
  const tagsJson = Array.isArray(tags) ? JSON.stringify(tags) : (tags || null);

  const [result] = await pool.query(
    `INSERT INTO landing_page_templates
       (user_id, name, slug, category, description, html_template, fields, tags, is_public, status, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'active', NOW(), NOW())`,
    [req.user.id, name, slug, category || null, description || null, html_template, fieldsJson, tagsJson, publicFlag]
  );

  res.status(201).json({ data: { id: result.insertId, slug } });
}

// ── PUT /api/templates/landing/:id ───────────────────────────────────────────
async function update(req, res) {
  const [rows] = await pool.query(
    'SELECT id, user_id, is_public FROM landing_page_templates WHERE id = ? AND status != ?',
    [req.params.id, 'archived']
  );
  const tpl = rows[0];
  if (!tpl) return res.status(404).json({ error: 'Template not found' });

  const isAdmin = req.user.role === 'admin';
  if (tpl.user_id !== req.user.id && !isAdmin) {
    return res.status(403).json({ error: 'Not authorized to update this template' });
  }

  const { name, category, description, html_template, fields, tags, is_public } = req.body;
  const updates = [];
  const params = [];

  if (name !== undefined)        { updates.push('name = ?');        params.push(name); }
  if (category !== undefined)    { updates.push('category = ?');    params.push(category); }
  if (description !== undefined) { updates.push('description = ?'); params.push(description); }
  if (html_template !== undefined) { updates.push('html_template = ?'); params.push(html_template); }
  if (fields !== undefined)      { updates.push('fields = ?');      params.push(JSON.stringify(fields)); }
  if (tags !== undefined)        { updates.push('tags = ?');        params.push(Array.isArray(tags) ? JSON.stringify(tags) : tags); }
  if (is_public !== undefined && isAdmin) { updates.push('is_public = ?'); params.push(is_public ? 1 : 0); }

  if (updates.length === 0) {
    return res.status(400).json({ error: 'No fields to update' });
  }

  updates.push('updated_at = NOW()');
  params.push(req.params.id);

  await pool.query(
    `UPDATE landing_page_templates SET ${updates.join(', ')} WHERE id = ?`,
    params
  );

  res.json({ data: { id: Number(req.params.id), updated: true } });
}

// ── DELETE /api/templates/landing/:id ────────────────────────────────────────
async function remove(req, res) {
  const [rows] = await pool.query(
    'SELECT id, user_id FROM landing_page_templates WHERE id = ? AND status != ?',
    [req.params.id, 'archived']
  );
  const tpl = rows[0];
  if (!tpl) return res.status(404).json({ error: 'Template not found' });

  const isAdmin = req.user.role === 'admin';
  if (tpl.user_id !== req.user.id && !isAdmin) {
    return res.status(403).json({ error: 'Not authorized to delete this template' });
  }

  await pool.query(
    "UPDATE landing_page_templates SET status = 'archived', updated_at = NOW() WHERE id = ?",
    [req.params.id]
  );

  res.json({ data: { id: Number(req.params.id), archived: true } });
}

// ── POST /api/templates/landing/:id/duplicate ────────────────────────────────
async function duplicate(req, res) {
  const [rows] = await pool.query(
    "SELECT * FROM landing_page_templates WHERE id = ? AND status != 'archived'",
    [req.params.id]
  );
  const tpl = rows[0];
  if (!tpl) return res.status(404).json({ error: 'Template not found' });

  const newName = (tpl.name || 'Copy') + ' (Copy)';
  const slug = slugify(newName) + '-' + Date.now().toString(36);

  const [result] = await pool.query(
    `INSERT INTO landing_page_templates
       (user_id, name, slug, category, description, thumbnail_url, html_template, fields, tags, ctr_score, is_public, status, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 0, 'active', NOW(), NOW())`,
    [req.user.id, newName, slug, tpl.category, tpl.description, tpl.thumbnail_url, tpl.html_template, tpl.fields, tpl.tags]
  );

  res.status(201).json({ data: { id: result.insertId, slug } });
}

// ── POST /api/templates/landing/import ───────────────────────────────────────
async function importHtml(req, res) {
  const { name, html_template, category, fields } = req.body;
  if (!name || !html_template) {
    return res.status(400).json({ error: 'name and html_template are required' });
  }

  const slug = slugify(name) + '-' + Date.now().toString(36);
  const fieldsJson = fields ? JSON.stringify(fields) : null;

  const [result] = await pool.query(
    `INSERT INTO landing_page_templates
       (user_id, name, slug, category, description, html_template, fields, is_public, status, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, 0, 'active', NOW(), NOW())`,
    [req.user.id, name, slug, category || null, null, html_template, fieldsJson]
  );

  res.status(201).json({ data: { id: result.insertId, slug } });
}

module.exports = {
  listPublic,
  listMine,
  getOne,
  create,
  update,
  remove,
  duplicate,
  importHtml,
};
