/**
 * SSL Certificate Manager
 * Handles ACME/Let's Encrypt certificate provisioning, storage, and renewal
 * Uses HTTP-01 challenge for domain validation
 */

const acme = require('acme-client');
const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');

const CERT_DIR = process.env.SSL_CERT_DIR || '/etc/nginx/ssl';
const ACME_DIRECTORY = process.env.ACME_DIRECTORY || acme.directory.letsencrypt.production;
const ACME_EMAIL = process.env.ACME_EMAIL || 'admin@berkahkarya.org';
const CHALLENGE_DIR = process.env.ACME_CHALLENGE_DIR || '/var/www/acme-challenge';
const RENEWAL_DAYS_BEFORE = parseInt(process.env.SSL_RENEWAL_DAYS_BEFORE || '30', 10);

/**
 * Initialize ACME client with account key
 * @returns {Promise<acme.Client>}
 */
async function getAcmeClient() {
  const accountKeyPath = path.join(CERT_DIR, 'account.key');
  
  let accountKey;
  try {
    const keyPem = await fs.readFile(accountKeyPath, 'utf8');
    accountKey = keyPem;
  } catch (err) {
    if (err.code === 'ENOENT') {
      // Generate new account key
      accountKey = await acme.crypto.createPrivateKey();
      await fs.mkdir(CERT_DIR, { recursive: true });
      await fs.writeFile(accountKeyPath, accountKey, { mode: 0o600 });
      console.log('[SSL] Generated new ACME account key');
    } else {
      throw err;
    }
  }

  const client = new acme.Client({
    directoryUrl: ACME_DIRECTORY,
    accountKey
  });

  return client;
}

/**
 * HTTP-01 challenge handler
 * Writes challenge response to filesystem for Nginx to serve
 */
const challengeCreateFn = async (authz, challenge, keyAuthorization) => {
  if (challenge.type !== 'http-01') {
    throw new Error(`Unsupported challenge type: ${challenge.type}`);
  }

  const token = challenge.token;
  const challengePath = path.join(CHALLENGE_DIR, token);

  await fs.mkdir(CHALLENGE_DIR, { recursive: true });
  await fs.writeFile(challengePath, keyAuthorization, { mode: 0o644 });

  console.log(`[SSL] HTTP-01 challenge created: ${token}`);
};

const challengeRemoveFn = async (authz, challenge, keyAuthorization) => {
  if (challenge.type !== 'http-01') {
    return;
  }

  const token = challenge.token;
  const challengePath = path.join(CHALLENGE_DIR, token);

  try {
    await fs.unlink(challengePath);
    console.log(`[SSL] HTTP-01 challenge removed: ${token}`);
  } catch (err) {
    if (err.code !== 'ENOENT') {
      console.error(`[SSL] Failed to remove challenge ${token}:`, err.message);
    }
  }
};

/**
 * Generate certificate for domain
 * @param {string} domain - Domain name (e.g., 'example.com')
 * @returns {Promise<{cert: string, key: string, fullchain: string}>}
 */
async function generateCertificate(domain) {
  console.log(`[SSL] Starting certificate generation for ${domain}`);

  const client = await getAcmeClient();

  // Generate domain private key
  const [domainKey, csr] = await acme.crypto.createCsr({
    commonName: domain
  });

  // Create certificate order
  const cert = await client.auto({
    csr,
    email: ACME_EMAIL,
    termsOfServiceAgreed: true,
    challengePriority: ['http-01'],
    challengeCreateFn,
    challengeRemoveFn
  });

  console.log(`[SSL] Certificate generated successfully for ${domain}`);

  return {
    key: domainKey.toString(),
    cert: cert.toString(),
    fullchain: cert.toString() // acme-client auto includes chain
  };
}

/**
 * Store certificate to filesystem
 * @param {string} domain
 * @param {{key: string, cert: string, fullchain: string}} certificates
 */
async function storeCertificate(domain, certificates) {
  const domainDir = path.join(CERT_DIR, domain);
  await fs.mkdir(domainDir, { recursive: true });

  const keyPath = path.join(domainDir, 'privkey.pem');
  const certPath = path.join(domainDir, 'cert.pem');
  const fullchainPath = path.join(domainDir, 'fullchain.pem');

  await fs.writeFile(keyPath, certificates.key, { mode: 0o600 });
  await fs.writeFile(certPath, certificates.cert, { mode: 0o644 });
  await fs.writeFile(fullchainPath, certificates.fullchain, { mode: 0o644 });

  console.log(`[SSL] Certificate stored for ${domain} at ${domainDir}`);

  return {
    keyPath,
    certPath,
    fullchainPath
  };
}

/**
 * Load certificate from filesystem
 * @param {string} domain
 * @returns {Promise<{key: string, cert: string, fullchain: string, paths: object}|null>}
 */
async function loadCertificate(domain) {
  const domainDir = path.join(CERT_DIR, domain);
  const keyPath = path.join(domainDir, 'privkey.pem');
  const certPath = path.join(domainDir, 'cert.pem');
  const fullchainPath = path.join(domainDir, 'fullchain.pem');

  try {
    const [key, cert, fullchain] = await Promise.all([
      fs.readFile(keyPath, 'utf8'),
      fs.readFile(certPath, 'utf8'),
      fs.readFile(fullchainPath, 'utf8')
    ]);

    return {
      key,
      cert,
      fullchain,
      paths: { keyPath, certPath, fullchainPath }
    };
  } catch (err) {
    if (err.code === 'ENOENT') {
      return null;
    }
    throw err;
  }
}

/**
 * Parse certificate expiry date
 * @param {string} certPem - PEM encoded certificate
 * @returns {Date}
 */
function getCertificateExpiry(certPem) {
  const forge = require('node-forge');
  const cert = forge.pki.certificateFromPem(certPem);
  return cert.validity.notAfter;
}

/**
 * Check if certificate needs renewal
 * @param {string} domain
 * @returns {Promise<boolean>}
 */
async function needsRenewal(domain) {
  const certData = await loadCertificate(domain);
  if (!certData) {
    return true; // No cert = needs provisioning
  }

  try {
    const expiry = getCertificateExpiry(certData.cert);
    const daysUntilExpiry = (expiry - new Date()) / (1000 * 60 * 60 * 24);
    
    console.log(`[SSL] ${domain} expires in ${Math.floor(daysUntilExpiry)} days`);
    return daysUntilExpiry <= RENEWAL_DAYS_BEFORE;
  } catch (err) {
    console.error(`[SSL] Failed to parse certificate for ${domain}:`, err.message);
    return true; // Parse error = renew to be safe
  }
}

/**
 * Provision or renew certificate for domain
 * @param {string} domain
 * @returns {Promise<{keyPath: string, certPath: string, fullchainPath: string}>}
 */
async function provisionCertificate(domain) {
  console.log(`[SSL] Provisioning certificate for ${domain}`);

  const certificates = await generateCertificate(domain);
  const paths = await storeCertificate(domain, certificates);

  return paths;
}

/**
 * Renew certificate if needed
 * @param {string} domain
 * @returns {Promise<{renewed: boolean, paths?: object}>}
 */
async function renewIfNeeded(domain) {
  const shouldRenew = await needsRenewal(domain);
  
  if (!shouldRenew) {
    console.log(`[SSL] Certificate for ${domain} does not need renewal`);
    return { renewed: false };
  }

  console.log(`[SSL] Renewing certificate for ${domain}`);
  const paths = await provisionCertificate(domain);
  
  return { renewed: true, paths };
}

/**
 * Delete certificate for domain
 * @param {string} domain
 */
async function deleteCertificate(domain) {
  const domainDir = path.join(CERT_DIR, domain);
  
  try {
    await fs.rm(domainDir, { recursive: true, force: true });
    console.log(`[SSL] Deleted certificate for ${domain}`);
  } catch (err) {
    console.error(`[SSL] Failed to delete certificate for ${domain}:`, err.message);
    throw err;
  }
}

module.exports = {
  provisionCertificate,
  renewIfNeeded,
  needsRenewal,
  loadCertificate,
  deleteCertificate,
  CERT_DIR,
  CHALLENGE_DIR
};
