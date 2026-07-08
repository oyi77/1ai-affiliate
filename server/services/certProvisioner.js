'use strict';

/**
 * certProvisioner — Let's Encrypt SSL cert lifecycle via ACME.
 *
 * Strategy:
 *  - HTTP-01 challenge served via express route (see routes/acmeChallenge.js)
 *  - Certs stored in 1ai_smartlink_domains.cert_pem / cert_key_pem
 *  - Auto-renew when cert_expires_at < 30 days away (call renewExpiring())
 *
 * Fail-safe: if ACME fails, cert_status='error' and prior cert (if any)
 * is left in place so the domain keeps working until cert_expires_at.
 */

const acme = require('acme-client');
const pool = require('../db/mysql');

// Challenge tokens in-memory map keyed by token.
// Shared with acmeChallenge route via module singleton.
const challenges = new Map();

/**
 * Provision (or renew) a certificate for a domain row.
 * @param {number} domainId  - 1ai_smartlink_domains.id
 * @param {string} domain    - FQDN, e.g. "go.example.com"
 * @returns {Promise<{cert: string, key: string, expires: Date}>}
 */
async function provision(domainId, domain) {
  // Mark pending
  await pool.query(
    `UPDATE 1ai_smartlink_domains
        SET cert_status='pending', cert_error=NULL, cert_requested_at=NOW()
      WHERE id=?`,
    [domainId]
  );

  try {
    const accountKey = await acme.crypto.createPrivateKey();

    const client = new acme.Client({
      directoryUrl: process.env.ACME_DIRECTORY_URL || acme.directory.letsencrypt.production,
      accountKey,
    });

    const [certKey, csr] = await acme.crypto.createCsr({ commonName: domain });

    const cert = await client.auto({
      csr,
      termsOfServiceAgreed: true,
      challengeCreateFn: async (_authz, _challenge, keyAuthorization) => {
        // token is embedded in the challenge object passed by acme-client
        const token = _challenge.token;
        challenges.set(token, keyAuthorization);
      },
      challengeRemoveFn: async (_authz, _challenge) => {
        challenges.delete(_challenge.token);
      },
    });

    const expireDate = certExpiryFromPem(cert);

    await pool.query(
      `UPDATE 1ai_smartlink_domains
          SET cert_status='active',
              cert_pem=?,
              cert_key_pem=?,
              cert_expires_at=?,
              cert_error=NULL
        WHERE id=?`,
      [cert, certKey.toString(), expireDate, domainId]
    );

    return { cert, key: certKey.toString(), expires: expireDate };
  } catch (err) {
    await pool.query(
      `UPDATE 1ai_smartlink_domains
          SET cert_status='error', cert_error=?
        WHERE id=?`,
      [String(err.message || err), domainId]
    );
    throw err;
  }
}

/**
 * Renew all certs expiring within 30 days.
 * Safe to call on a cron schedule (e.g. daily).
 */
async function renewExpiring() {
  const [rows] = await pool.query(
    `SELECT id, domain FROM 1ai_smartlink_domains
      WHERE ssl_enabled=1
        AND cert_status='active'
        AND cert_expires_at IS NOT NULL
        AND cert_expires_at < DATE_ADD(NOW(), INTERVAL 30 DAY)`
  );

  const results = [];
  for (const row of rows) {
    try {
      await provision(row.id, row.domain);
      results.push({ domain: row.domain, status: 'renewed' });
    } catch (err) {
      results.push({ domain: row.domain, status: 'error', error: err.message });
    }
  }
  return results;
}

/** Extract expiry date from PEM cert string. */
function certExpiryFromPem(pem) {
  try {
    const forge = require('node-forge');
    const cert = forge.pki.certificateFromPem(pem);
    return cert.validity.notAfter;
  } catch {
    // Fallback: 90 days from now (LE default)
    const d = new Date();
    d.setDate(d.getDate() + 90);
    return d;
  }
}

module.exports = { provision, renewExpiring, challenges };
