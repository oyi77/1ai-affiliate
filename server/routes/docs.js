const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();

// Allowed doc directories (whitelisted for security)
const DOC_DIRS = [
  'tutorials-and-guides',
  'features',
  'runbooks',
  'setting-up-prosper202-pro',
  'api',
  'tools--resources',
];

// Index route — list all available docs
router.get('/', (_req, res) => {
  const docBase = path.resolve(__dirname, '../../documentation');
  const docs = [];

  for (const dir of DOC_DIRS) {
    const dirPath = path.join(docBase, dir);
    if (!fs.existsSync(dirPath)) continue;

    const files = fs.readdirSync(dirPath).filter(f => f.endsWith('.md'));
    for (const file of files) {
      const slug = `${dir}/${file.replace(/\.md$/, '')}`;
      // Read first line as title
      try {
        const content = fs.readFileSync(path.join(dirPath, file), 'utf8');
        const titleLine = content.split('\n')[0]?.replace(/^#+\s*/, '').trim() || file;
        docs.push({ slug, title: titleLine, category: dir });
      } catch {
        docs.push({ slug, title: file, category: dir });
      }
    }
  }

  // Also include root-level docs
  const rootFiles = fs.readdirSync(docBase).filter(f => f.endsWith('.md'));
  for (const file of rootFiles) {
    const slug = file.replace(/\.md$/, '');
    try {
      const content = fs.readFileSync(path.join(docBase, file), 'utf8');
      const titleLine = content.split('\n')[0]?.replace(/^#+\s*/, '').trim() || file;
      docs.push({ slug, title: titleLine, category: 'general' });
    } catch {
      docs.push({ slug, title: file, category: 'general' });
    }
  }

  res.json({ docs });
});

// Get a specific doc by slug (captures multi-segment paths like "tutorials-and-guides/00-tutorial")
router.get('/:slug(*)', (req, res) => {
  const slug = req.params.slug;

  // Prevent path traversal
  if (slug.includes('..') || slug.includes('\0')) {
    return res.status(400).json({ error: 'Invalid slug' });
  }

  const docBase = path.resolve(__dirname, '../../documentation');
  const filePath = path.join(docBase, slug + '.md');

  // Verify the resolved path is still under docBase
  if (!filePath.startsWith(docBase)) {
    return res.status(400).json({ error: 'Invalid slug' });
  }

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'Document not found' });
  }

  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const title = content.split('\n')[0]?.replace(/^#+\s*/, '').trim() || slug;
    res.json({ slug, title, content, format: 'markdown' });
  } catch (err) {
    console.error('Docs read error:', err);
    res.status(500).json({ error: 'Failed to read document' });
  }
});

module.exports = router;