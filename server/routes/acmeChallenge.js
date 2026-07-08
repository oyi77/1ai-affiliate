'use strict';

/**
 * ACME HTTP-01 challenge responder.
 * Mount BEFORE auth middleware at the express root:
 *   app.use(require('./routes/acmeChallenge'));
 */

const express = require('express');
const router = express.Router();
const { challenges } = require('../services/certProvisioner');

// Let's Encrypt calls GET /.well-known/acme-challenge/<token>
router.get('/.well-known/acme-challenge/:token', (req, res) => {
  const keyAuth = challenges.get(req.params.token);
  if (!keyAuth) return res.status(404).send('Not found');
  res.type('text/plain').send(keyAuth);
});

module.exports = router;
