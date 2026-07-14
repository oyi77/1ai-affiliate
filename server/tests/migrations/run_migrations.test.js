/**
 * Phase B migration runner smoke test.
 *
 * Requires a live MariaDB/MySQL instance. Set DB_HOST/DB_USER/DB_PASS
 * or use root/no-password defaults on a throwaway database.
 */

const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
const { execSync } = require('child_process');

const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_USER = process.env.DB_USER || 'root';
const DB_PASS = process.env.DB_PASS || '';
const TEST_DB = process.env.DB_NAME ? `${process.env.DB_NAME}_mig_test` : 'prosper1ai_test_phase_b';

const BASE_DIR = path.resolve(__dirname, '../..');
const SCRIPTS_DIR = path.resolve(__dirname, '../../migrations');

// Jest test setup mocks DB_USER to 'test_user' for unit tests. When that is
// the case we cannot reach a real database, so this suite skips gracefully.
const HAS_REAL_DB = DB_USER !== 'test_user' && DB_USER !== '';

function execMigration(env) {
  const envStr = Object.entries(env).map(([k, v]) => `${k}="${v}"`).join(' ');
  return execSync(`${envStr} node ${path.join(BASE_DIR, 'migrations/run_migrations.js')}`, {
    cwd: BASE_DIR,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  });
}

describe('Migration runner (Phase B)', () => {
  let connection;

  beforeAll(async () => {
    if (!HAS_REAL_DB) return;
    connection = await mysql.createConnection({ host: DB_HOST, user: DB_USER, password: DB_PASS });
    await connection.query(`DROP DATABASE IF EXISTS \`${TEST_DB}\``);
    await connection.query(`CREATE DATABASE \`${TEST_DB}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
  });

  afterAll(async () => {
    if (!connection) return;
    await connection.query(`DROP DATABASE IF EXISTS \`${TEST_DB}\``);
    await connection.end();
  });

  beforeEach(async () => {
    if (!connection) return;
    await connection.query(`USE \`${TEST_DB}\``);
  });

  const t = HAS_REAL_DB ? test : test.skip;

  t('runs Phase B migration and records checksum', async () => {
    const output = execMigration({
      DB_HOST,
      DB_USER,
      DB_PASS,
      DB_NAME: TEST_DB,
      LOG_LEVEL: 'silent',
    });
    expect(output).toContain('Migration run complete');

    const [rows] = await connection.query(
      'SELECT filename, checksum FROM 1ai_migrations WHERE filename = ?',
      ['015_adtech_worldclass.sql']
    );
    expect(rows.length).toBe(1);
    expect(rows[0].checksum).toHaveLength(64);
  });

  t('skips already applied migration on second run', async () => {
    const output = execMigration({
      DB_HOST,
      DB_USER,
      DB_PASS,
      DB_NAME: TEST_DB,
      LOG_LEVEL: 'silent',
    });
    expect(output).toContain('Migration run complete');
  });

  t('detects checksum mismatch when file changes', async () => {
    const filePath = path.join(SCRIPTS_DIR, '015_adtech_worldclass.sql');
    const original = fs.readFileSync(filePath, 'utf8');
    fs.writeFileSync(filePath, `${original}\n-- test-noop`);

    try {
      execMigration({
        DB_HOST,
        DB_USER,
        DB_PASS,
        DB_NAME: TEST_DB,
        LOG_LEVEL: 'silent',
      });
      throw new Error('Should have failed on checksum mismatch');
    } catch (err) {
      expect(err.stderr || err.stdout).toContain('checksum mismatch');
    } finally {
      fs.writeFileSync(filePath, original);
    }
  });
});
