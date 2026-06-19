#!/usr/bin/env node
/**
 * 1ai-Affiliate Node migration runner.
 *
 * Reads SQL scripts from `server/migrations/manifest.json` in declared order,
 * or scans `scripts/*.sql` in numeric order if no manifest exists. Tracks
 * execution in 1ai_migrations with checksums and runs only scripts that have
 * not yet been applied. All scripts should be idempotent so re-running is safe.
 *
 * Usage:
 *   node server/migrations/run_migrations.js
 *   FORCE=1 node server/migrations/run_migrations.js   # re-run even if applied
 */

require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const mysql = require('mysql2/promise');
const pool = require('../db/mysql');
const logger = require('../logger');

const SCRIPTS_DIR = path.resolve(__dirname, '../../scripts');
const MIGRATIONS_DIR = __dirname;
const MANIFEST_PATH = path.resolve(__dirname, 'manifest.json');
const FORCE = process.env.FORCE === '1';

function sha256(content) {
  return crypto.createHash('sha256').update(content).digest('hex');
}

async function ensureMigrationTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS 1ai_migrations (
      id INT AUTO_INCREMENT PRIMARY KEY,
      filename VARCHAR(255) NOT NULL UNIQUE,
      checksum CHAR(64) NOT NULL,
      applied_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);
}

async function getAppliedMigrations() {
  try {
    const [rows] = await pool.query('SELECT filename, checksum FROM 1ai_migrations');
    return new Map(rows.map(r => [r.filename, r.checksum]));
  } catch (err) {
    if (/ER_NO_SUCH_TABLE/.test(err.sqlMessage || err.message)) {
      return new Map();
    }
    throw err;
  }
}

function getMigrationFiles() {
  if (fs.existsSync(MANIFEST_PATH)) {
    const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'));
    return manifest.migrations.filter(f => f.endsWith('.sql'));
  }
  return fs.readdirSync(SCRIPTS_DIR)
    .filter(f => f.endsWith('.sql'))
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }));
}
async function runScript(sql) {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASS || '',
    database: process.env.DB_NAME || '1ai_affiliate',
    multipleStatements: true,
  });
  try {
    await connection.query(sql);
  } finally {
    await connection.end();
  }
}

async function recordMigration(filename, checksum) {
  await pool.query(
    `INSERT INTO 1ai_migrations (filename, checksum) VALUES (?, ?)
     ON DUPLICATE KEY UPDATE checksum = VALUES(checksum), applied_at = NOW()`,
    [filename, checksum]
  );
}

async function main() {
  await ensureMigrationTable();
  const applied = await getAppliedMigrations();
  const files = getMigrationFiles();

  if (files.length === 0) {
    logger.info('No migration scripts found.');
    return;
  }

  let ran = 0;
  for (const file of files) {
    let filePath = path.join(SCRIPTS_DIR, file);
    if (!fs.existsSync(filePath)) {
      filePath = path.join(MIGRATIONS_DIR, file);
    }
    if (!fs.existsSync(filePath)) {
      logger.error({ file }, 'Migration file not found');
      process.exit(1);
    }
    const sql = fs.readFileSync(filePath, 'utf8');
    const checksum = sha256(sql);

    const previous = applied.get(file);
    if (previous) {
      if (previous !== checksum) {
        logger.warn({ file, previous, current: checksum }, 'Migration checksum mismatch');
        if (!FORCE) {
          logger.error({ file }, 'Migration changed but FORCE is not set; aborting');
          process.exit(1);
        }
      } else if (!FORCE) {
        logger.debug({ file }, 'Migration already applied, skipping');
        continue;
      }
    }

    logger.info({ file }, 'Running migration');
    await runScript(sql);
    await recordMigration(file, checksum);
    ran += 1;
    logger.info({ file }, 'Migration applied');
  }

  logger.info({ ran }, 'Migration run complete');
}

main()
  .then(() => process.exit(0))
  .catch(err => {
    logger.error({ err }, 'Migration run failed');
    process.exit(1);
  });
