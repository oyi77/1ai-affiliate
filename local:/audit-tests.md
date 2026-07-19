# Test Audit: 1ai-affiliate server/tests/

## Summary

server/tests/ total: 27 failed, 4 skipped, 252 passed, 283 tests across 22 suites
- 22 suites: 14 passed, 4 failed, 4 skipped due to environment guards
- 8 distinct root causes identified

Additional tests/ directory: 10 suites covering e2e roles, fraud detection, smoke tests, and Playwright. Many fail due to infrastructure requirements.

## 1. Major: Rate-Limiter State Bleed in E2E Tests (27 failures)

**Impact: 3 test suites entirely blocked, 6 more in aiRoutes, 27 total failing tests**

Root Cause: 4 test files load the full Express app with `require('../../app')`, pulling in live per-route rate limiters (`rateLimit.js` `createMiddleware`):

| Test File | What It Resets | Tiers Needed | Failure Count |
|-----------|---------------|--------------|---------------|
| `server/tests/e2e/api.e2e.test.js` | `resetAuthRateLimit` (imported but NOT called) | auth, admin, write, read | all tests 429 |
| `server/tests/e2e/phase-a-foundation.e2e.test.js` | `resetTier('write')` in beforeEach | admin, write, read | most tests 429 |
| `server/tests/e2e/rbac.e2e.test.js` | nothing | admin, write | all tests 429 |
| `server/tests/agents/aiRoutes.test.js` | nothing | ai (30/min) | 6 tests 429 |

The global rate limiter (`globalRateLimit.js`) correctly bypasses in test mode (unless RATE_LIMIT_STRICT=true). But the per-route limiters (`rateLimit.js` lines 48-56) have no test bypass — auth (5/min), admin (100/min), write (60/min), ai (30/min). Any test file calling its endpoint more times than the limit gets 429 on later tests.

Evidence: every failure shows `Expected: 200 Received: 429` with retryAfter set.

Fix: options are (a) add env bypass to per-route limiters matching globalRateLimit's pattern, (b) register a global `afterEach` that resets ALL tier windows, or (c) use `jest.isolateModules` per describe block so each suite gets a fresh module state.

## 2. Major: Zero Test Coverage for 4 New Wave-1 Services

| File | Tests |
|------|-------|
| `server/routes/smartlink-rotation.js` | 0 |
| `server/routes/smartlink.js` | 0 |
| `server/routes/two-factor.js` | 0 |
| `server/routes/deeplinks.js` | 0 |

These 4 route files were added in the Wave-1 feature push. No test file exists for any of them. Business logic like smartlink rotation rules, 2FA setup, and deep-link resolution is untested.

## 3. Medium: Migration Tests Require Real MySQL (3 skipped)

`server/tests/migrations/run_migrations.test.js` wraps all 3 tests in `test.skip` when `DB_USER !== 'test_user'` (lines 23, 55). The test needs a live MariaDB instance with credentials from env vars. In a CI or fresh-dev environment without `DB_HOST/DB_USER/DB_PASS` set to a real server, these tests silently skip — they neither verify the migration runner works nor regression-test checksum validation. The mock database (`server/tests/mocks/database.js`) returns `jest.fn()` stubs for `query` and `end` but has no transaction support needed by migration scripts.

## 4. Medium: Playwright Test Wired to Jest Runner (suite crash)

`server/tests/ui.spec.js` uses Playwright's `test.describe` API. When Jest picks it up (via default `testMatch` pattern), it crashes with:
```
Playwright Test needs to be invoked via 'npx playwright test' and excluded from Jest test runs.
```

The `test.describe` reference on line 12 is a Playwright function, not Jest's global `describe`. Fix requires either:
- Separate Jest config with `testPathIgnorePatterns: ['ui.spec.js']`
- Dedicated `jest.playwright.config.js` that uses `projects: [{ displayName: 'playwright', testMatch: ['**/ui.spec.js'] }]`

## 5. Medium: External tests/ Directory Failures

10 additional test files in `tests/` directory:

```
tests/e2e/fraud/advanced-fraud.test.js
tests/e2e/fraud/bot-detection.test.js
tests/e2e/fraud/ip-fraud.test.js
tests/e2e/roles/admin.test.js
tests/e2e/roles/advertiser.test.js
tests/e2e/roles/integration.test.js
tests/e2e/roles/publisher.test.js
tests/e2e/smoke/health.test.js
tests/e2e_om_am_multimodel.test.js
tests/playwright/attribution-dashboard.spec.js
```

These require full infrastructure: real database, Redis, Airtable API keys, browser engine, and external services. The `tests/` directory appears to be from a separate test framework (Cypress/Playwright/e2e suite) not integrated with `server/tests/`. Some tests may be from a different project phase and are stale.
They share none of the `server/tests/mocks/database.js` infrastructure, so they attempt real connections and fail.

## 6. Low: Rate Limit Unit Test Fragile

`server/tests/unit/globalRateLimit.test.js` (7 tests, all pass) sets `RATE_LIMIT_STRICT='true'` in beforeEach and deletes it in afterEach. The test uses `jest.isolateModules` to re-require the rate-limit middleware. This works in isolation but depends on module-level singleton state (`LIMITS` object in `globalRateLimit.js`). If another test runs concurrently and shares the same module cache, the `isolateModules` guard could leak.

## 7. Low: No isoleModules Usage for App-Level Tests

Tests that load the app via `require('../../app')` get the same module instance across suites in the same Jest process. Rate-limit state, in-memory caches, and any singleton DI containers are shared. This means test order matters — an early test exhausting rate limits poisons later tests.

## 8. Low: Mock Database Missing Transaction Support

`server/tests/mocks/database.js` provides `query: jest.fn()` and `end: jest.fn()` only. The real `mysql2/promise` pool supports transactions (`getConnection()`, `beginTransaction()`, `commit()`, `rollback()`) which migration scripts and some services use. Any test exercising code paths with transactions will hang or crash because `getConnection` is not mocked.

## Per-File Breakdown

| Suite | Status | Pass | Fail | Skip | Root Cause |
|-------|--------|------|------|------|------------|
| unit/globalRateLimit | PASS | 7 | 0 | 0 | |
| unit/mysqlClicksProvider | PASS | * | 0 | * | |
| unit/mysqlPostbackRepository | PASS | * | 0 | * | |
| unit/voltAgentProvider | PASS | * | 0 | * | |
| unit/payoutService | PASS | * | 0 | * | |
| unit/fraudRuleEngine | PASS | * | 0 | * | |
| unit/redisClient | PASS | * | 0 | * | |
| unit/apiKeyService | PASS | * | 0 | * | |
| unit/abTestService | PASS | * | 0 | * | |
| agents/agent | PASS | * | 0 | * | |
| agents/aiRoutes | FAIL | * | 6 | * | #1 rate-limit bleed |
| agents/fraudDetectionAgent | PASS | * | 0 | * | |
| agents/supervisor | PASS | * | 0 | * | |
| agents/toolBus | PASS | * | 0 | * | |
| e2e/api.e2e | FAIL | * | * | * | #1 rate-limit bleed |
| e2e/auth.e2e | PASS | * | 0 | * | |
| e2e/phase-a-foundation.e2e | FAIL | * | * | * | #1 rate-limit bleed |
| e2e/rbac.e2e | FAIL | * | * | * | #1 rate-limit bleed |
| postback | PASS | * | 0 | * | |
| shopeeParser | PASS | * | 0 | * | |
| migrations/run_migrations | SKIP | 0 | 0 | 3 | #3 no real DB (#8 mock DB no txns) |
| ui.spec | CRASH | 0 | 0 | 0 | #4 Playwright in Jest |

* = contained in the 252 pass / 27 fail totals but per-file data not captured individually

## Recommendations (ranked by impact)

1. **Add test-mode bypass to per-route rate limiters** — match `globalRateLimit.js` pattern: skip all rate limiting when `NODE_ENV === 'test'` unless `RATE_LIMIT_STRICT === 'true'`
2. **Write tests for 4 new route files** — at minimum a smoke test per route file exercising the main endpoints
3. **Re-wire `ui.spec.js`** — add jest config exclusion or Playwright-native runner
4. **Add mock database transaction support** — `getConnection` with stubbed `beginTransaction`/`commit`/`rollback`
5. **Separate `tests/` from `server/tests/`** — ensure they never get picked up by the same runner config
