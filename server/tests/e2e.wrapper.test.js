/**
 * Wrapper to run full-stack E2E tests (real DB, real Express) via Jest.
 * Each E2E test script is a standalone Node.js script that starts its own server.
 * We shell out to them sequentially with a generous timeout.
 * Prereq: MariaDB running + prosper1ai_test database exists.
 */
const { execSync } = require('child_process');
const path = require('path');

const E2E_DIR = path.resolve(__dirname, '../../tests/e2e/roles');
const SCRIPTS = [
  { name: 'Admin',        file: 'admin.test.js' },
  { name: 'Publisher',    file: 'publisher.test.js' },
  { name: 'Advertiser',   file: 'advertiser.test.js' },
  { name: 'Integration',  file: 'integration.test.js' },
];

describe('Full-stack E2E Tests (real MariaDB)', () => {
  SCRIPTS.forEach(({ name, file }) => {
    test(`${name} E2E`, () => {
      const scriptPath = path.join(E2E_DIR, file);
      try {
        execSync(`node "${scriptPath}"`, {
          cwd: path.dirname(scriptPath),
          env: { ...process.env, NODE_ENV: 'test' },
          encoding: 'utf-8',
          timeout: 130_000,
          maxBuffer: 1024 * 1024,
        });
      } catch (e) {
        const msg = e.stdout || e.message;
        console.error(msg);
        throw new Error(`E2E ${name} FAILED (exit ${e.status}):\n${(msg || '').slice(0, 2000)}`);
      }
    }, 150_000);
  });
});
