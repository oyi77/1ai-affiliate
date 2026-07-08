'use strict';

/**
 * SSL cert provisioning admin routes.
 * POST /api/admin/domains/:id/provision  — trigger ACME for a domain
 * GET  /api/admin/domains/:id/cert-status — poll cert state
 * POST /api/admin/domains/renew-expiring  — renew all certs < 30d until expiry
 */

const express = require('express');
const router = express.Router();
const pool = require('../db/mysql');
const { provision, renewExpiring } = require('../services/certProvisioner');

// POST /api/admin/domains/:id/provision
router.post('/:id/provision', async (req, res) => {
  const domainId = parseInt(req.params.id, 10);
  if (!domainId) return res.status(400).json({ error: 'Invalid domain id' });

  const [[row]] = await pool.query(
    `SELECT id, domain, ssl_enabled FROM 1ai_smartlink_domains WHERE id=?`,
    [domainId]
  );
  if (!row) return res.status(404).json({ error: 'Domain not found' });
  if (!row.ssl_enabled) return res.status(400).json({ error: 'ssl_enabled is false for this domain' });

  // Fire-and-forget; client polls /cert-status
  provision(domainId, row.domain).catch(() => {});

  res.json({ status: 'pending', domain: row.domain });
});

// GET /api/admin/domains/:id/cert-status
router.get('/:id/cert-status', async (req, res) => {
  const [[row]] = await pool.query(
    `SELECT id, domain, cert_status, cert_expires_at, cert_error, cert_requested_at
       FROM 1ai_smartlink_domains WHERE id=?`,
    [parseInt(req.params.id, 10)]
  );
  if (!row) return res.status(404).json({ error: 'Domain not found' });
  res.json(row);
});

// POST /api/admin/domains/renew-expiring
router.post('/renew-expiring', async (req, res) => {
  try {
    const results = await renewExpiring();
    res.json({ renewed: results.length, results });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
