# Repository Guidelines

## Mandatory Process (8 Steps — No Skipping)

Every task follows this sequence. No exceptions.

1. **AUDIT** — Read existing code. Understand current state.
2. **THINK** — Understand WHY. Intent vs literal.
3. **BRAINSTORM** — ≥3 approaches. Score options.
4. **PLAN** — Decompose. Risks. Rollback plan.
5. **EXECUTE** — Build. TDD when possible.
6. **TEST** — Run all tests. Break it first.
7. **VERIFY** — Prove with literal output.
8. **REVIEW** — Read your own diff before committing.

Full details: `~/.1ai/core/PROCESS.md` (auto-injected by hooks)

## Hard Rules

1. Read code before writing code.
2. No completion claim without literal receipt.
3. Compile/test/use like a real user before claiming work is ready.
4. Task must match this repo domain.
5. Run GATE.md before commit/PR.

## Rules — thin loader, no submodule

Rules are NOT vendored into this repo. This repo does NOT need a rules submodule.
`AGENTS.md` is only the repo-local loader: domain, commands, conventions, and pointers to `~/.1ai`.

Engineering rules are enforced by machine-level loaders when `setup-dev.sh` has been run:
- Claude Code: SessionStart hook injects `~/.1ai/core/RULES.md`
- OpenCode: plugin injects `~/.1ai/core/RULES.md`
- OMP: wrapper appends `~/.1ai/core/RULES.md` to launch sessions

Primary rules file:
```bash
cat ~/.1ai/core/RULES.md
```

Pre-ship gate:
```bash
cat ~/.1ai/core/GATE.md
```

If `~/.1ai` or auto-load is missing, run:
```bash
bash ~/.1ai/scripts/setup-dev.sh
```

Do NOT add the rules repo as a git submodule. Update rules centrally, then run/sync the thin `AGENTS.md` template.

## Project Overview

Affiliate marketing platform (offer management, smartlink click routing, conversion postbacks, payouts/wallet, real-time analytics). Polyglot stack:

- **PHP 8.3 legacy core** at repo ROOT (Prosper202-derived ClickServer): `index.php`, `account/`, `api/v1..v3/`, `cronjobs/`, `config/connect*.php`, tracker UI under `tracking_support/`. Served by php-fpm (:9002) behind nginx (:6969, cf-router-managed, see `docker/nginx-affiliate.conf`).
- **Node.js/Express companion** in `server/` (:3001) — the primary development surface: REST API, SPA hosting, Socket.IO notifications, background workers/crons.
- **frontend/** — React 19 + Vite 8 + Tailwind v4 SPA; builds directly into `server/public/dist`.
- **edge/** — standalone Go high-throughput click redirector (chi + Kafka + ClickHouse); K8s-only deploy (`edge/deploy/k8s.yaml`), outside the normal dev loop.

Surfaces: API base `/api`; public click entries `/r/:slug` and `/go/:hash`; tracking pixel `/pixel.gif`; health `/health`; metrics `/metrics` (Prometheus text); Socket.IO at default `/socket.io`.

## Architecture & Data Flow

**Request flow**: React SPA (axios `frontend/src/lib/api.js`, `baseURL:'/'`, Bearer from `localStorage.token`) → Express chain in `server/app.js`: helmet(CSP) → cors → json → pino-http(request-id from `X-Request-ID`) → `rateLimitGlobal` (Redis, per-IP) → sanitizer → idempotency → auditLog → route match → **per-route `authenticate`** → optional `requireRole/requireAdmin` → handler (`asyncHandler` → service) → `pool.query` → JSON `{ data, meta }` or `{ error }`.

**Auth** (`server/middleware/auth.js`): applied per-route, NOT globally — a new route without it is silently public. Accepts, in order: `X-API-Key` header (delegates to legacy PHP V3 via `V3_API_URL`), `Authorization: Bearer <jwt>` or `?token=` (for SSE), then falls back to plaintext key lookup in `1ai_api_keys` table. Missing `JWT_SECRET` env = hard `process.exit(1)` at module load.

**Click flow**: visitor hits `/r/:slug` (or `/go/:hash`) → `smartlinkRoutingService.resolveBySlug` / `smartlinkController.routeTrafficByHash` → geo/device enrich → offer pick → clickId appended to redirect URL → async click logging → 302. Conversions arrive via postback routes (`/api` mounted postback router) or legacy PHP `tracking_support/static/gpb.php`.

**Realtime**: Socket.IO on the same HTTP server; client emits `register {userId, topics}` → row upserted in `1ai_notification_channels`, joins room `` user:<id> ``. Services call `webSocketService.sendToUser(userId, ..., io)` which persists to `1ai_notification_queue` then emits `notification`. REST handlers get `io` via `req.app.get('io')`.

**Background workers** — started inside `if (require.main === module)` in `app.js`: `autoPayoutCron`, `scheduledExportCron` (default `'0 7 * * *'`, env `SCHEDULED_EXPORT_CRON_SCHEDULE`), `postbackQueue`, `posterWorker`, `pipelineWorker`. Exception: the auto-optimizer `setInterval` (every `AUTO_OPTIMIZE_INTERVAL`, default 15 min) sits OUTSIDE the guard — it fires on mere `require('./app')` (including in tests).

**Migrations** (two trees): authoritative Node runner `node server/migrations/run_migrations.js` applies `server/migrations/*.sql` in `manifest.json` array order (checksum-tracked in `1ai_migrations`; `FORCE=1` overrides drift abort; file resolution tries root `scripts/<name>` FIRST, then `server/migrations/<name>`). Legacy tree: `scripts/NNN_*.sql` + hardcoded `scripts/run_migrations.php` (001–010 subset), rollbacks `scripts/rollback/<stem>_down.sql` applied descending via `php scripts/run_rollback.php --from=N --to=M [--dry-run]`. **No `_down.sql` exists for the Node-managed tree.**

**WF02 ops flow** (`server/wf02/`): dated content packs export `{ SMARTLINK (/go/<slug>), tiktokScript, fbPosts[] }`; publisher posts to Facebook Graph v19.0 using tokens from sibling repo `~/projects/1ai-social/data/fb_valid_pages.json`.

## Key Directories

| Path | Purpose |
|---|---|
| `server/app.js` | Express entry: middleware chain, 60+ router mounts, Socket.IO attach, static/SPA serving |
| `server/routes/` | 56 router files; modern style delegates to services |
| `server/services/` | Business logic (~30 modules: analyticsService, payoutService, smartlinkRoutingService, …) |
| `server/controllers/` | Thin controllers (only smartlink/auth/webhook/admin/content exist) |
| `server/middleware/` | auth, globalRateLimit (app-wide Redis), rateLimit (per-route read/write), errorHandler, idempotency, auditLog, sanitizer |
| `server/db/mysql.js` | mysql2/promise pool behind a Proxy adding transient-error retry |
| `server/socket/`, `server/services/webSocketService.js` | Socket.IO handlers + notification channels/offline queue |
| `server/cron/`, `server/services/postbackQueue.js` etc. | Background crons/workers |
| `server/migrations/` | Node migration tree + `manifest.json` + `run_migrations.js` |
| `server/tests/` | Jest suites (see Testing & QA); Playwright specs live here too |
| `server/agents/providers/` | AI provider integrations (@voltagent, Gemini/Anthropic SDKs) |
| `frontend/src/` | SPA: `pages/` (60 files), `layout/Shell.jsx`, `lib/api.js` axios instance |
| `scripts/` + `scripts/rollback/` | Legacy PHP-era SQL + `_down.sql` pairs + `run_rollback.php` |
| `tracking_support/`, `api/v3/`, `config/`, `cronjobs/` | Legacy PHP core shared between root app and tracker subtree |
| `edge/` | Go edgeredirect/clickconsumer + k8s deploy |
| `tests/` (repo root) | Standalone real-DB E2E scripts (roles/fraud/smoke/load) — outside Jest roots |
| `docs/` (gitignored), `GAP_ANALYSIS_FINAL.md` | Docs; status analyses |

## Development Commands

```bash
# Install (two separate trees — no workspaces)
npm install                      # repo root: provides socket.io/mysql2/dotenv (socket.io is required by server/app.js but declared ONLY here)
cd server && npm install         # Express deps; .npmrc include=dev keeps jest/playwright installed
cd frontend && npm install       # SPA deps

# Run
cd server && npm run dev         # node --watch app.js (port 3001)
cd frontend && npm run dev       # Vite dev server, proxies /api -> localhost:3001
./start.sh --docker|--stop|--status   # full stack: MySQL, Redis, php-fpm, pm2, nginx, crons

# Test (details in Testing & QA)
npm test                         # root alias: cd server && npm test (jest, coverage always on)
cd server && npx jest tests/unit # unit only
cd server && npx jest tests/e2e  # supertest e2e (mocked DB, no live server needed)
cd server && npm run test:e2e    # real-DB wrapper (needs live MariaDB prosper1ai_test) — NOT part of default run
npm run test:playwright          # requires app ALREADY running; baseURL $PLAYWRIGHT_BASE_URL || http://localhost:3001

# Build SPA
cd frontend && npm run build     # emits into ../server/public/dist (emptyOutDir)

# Database
node server/migrations/run_migrations.js          # manifest.json order, checksum ledger, FORCE=1 re-run
php scripts/run_rollback.php --from=NNN --to=NNN [--dry-run]   # legacy-tree rollbacks only
```

No `lint`/`build` npm scripts exist for the Node server. Lint surfaces: `frontend` has `eslint .`; CI (`.github/workflows/pr-checks.yml`) gates **PHP only** (`php -l`, `bash -n`) — nothing gates JS changes except local Jest. `scripts/check-code-patterns.sh` runs as a Claude Code Stop hook (anti-pattern grep + PHPStan on diff).

Required env (loaded from **repo-root `.env`** — `server/.env` is IGNORED even though `.env.example` lives there): `JWT_SECRET` (hard fail without), `DB_HOST/DB_USER/DB_PASS/DB_NAME` (defaults localhost/root//1ai_affiliate; note code reads `DB_PASS`, example documents `DB_PASSWORD`). Common optionals: `PORT` (3001), `CORS_ORIGIN`, `REDIS_URL/REDIS_PASSWORD`, `GEMINI_API_KEY/GEMINI_MODEL`, `PAYOUT_CRON_SCHEDULE`, `V3_API_URL`.

## Code Conventions & Common Patterns

- **Route style (modern)**: `express.Router()` + `authenticate` attached **per-route** + `asyncHandler(async ...)` delegating to a service module. See `server/routes/analytics.js`. Legacy files use inline try/catch + `console.error` — follow the modern pattern in new code.
- **Response shape**: success `res.json({ data, meta })`; errors `res.status(400).json({ error: ... })`. Final error middleware returns `{ error: 'Internal server error', request_id }`.
- **Async errors**: `utils/asyncHandler.js` maps `ER_DUP_ENTRY` → 409, else `err.status || 500`.
- **DB access**: `const pool = require('../db/mysql'); pool.query(sql, params)` — raw SQL strings inline, no ORM. The Proxy in `db/mysql.js` retries transient connection codes automatically.
- **Two rate-limit systems** — don't confuse them: `middleware/globalRateLimit.js` (Redis-backed, mounted app-wide) vs `middleware/rateLimit.js` (`rateLimitRead/rateLimitWrite`, used inside individual routers like `routes/admin.js`).
- **Logging**: pino/pino-http with request IDs; legacy modules still use `console.error` — prefer pino in new code.
- **Mount quirks**: `/api` is mounted three times (smartlink-rotation, ad-block, postback) and `/api/admin` three times (admin, gapfill, stats SSE) — first-mounted wins on conflicts.
- **New migration**: create `.sql` in `server/migrations/`, then add its filename to `manifest.json` — array position IS the execution order (mixed `NNN_*` / `2026_MM_DD_*` names accepted; filename sort irrelevant). Never assume a rollback pair exists for this tree.
- **Frontend patterns**: single axios instance (`lib/api.js`) with Bearer-from-localStorage interceptor; 401 clears token and redirects to `/login`. TanStack Query for data; lazy `<Route>`s in `App.jsx`; pages in `src/pages/`.
- **Commits**: conventional commits (`feat:`, `fix:`, `chore:`, `refactor:`); update relevant docs in the same change.

## Important Files

- `server/app.js` — entry point; all mounts and boot wiring (read this first for routing questions)
- `server/middleware/auth.js` — auth modes + JWT_SECRET gate
- `server/middleware/globalRateLimit.js` / `rateLimit.js` — the two limiter systems
- `server/db/mysql.js` — pooled, retrying DB access
- `server/utils/asyncHandler.js` — error mapping convention
- `server/migrations/manifest.json` — migration ordering source of truth
- `server/services/webSocketService.js` + `server/socket/handlers.js` — realtime contract
- `frontend/vite.config.js` — build outputs into `../server/public/dist`; dev proxy
- `docker/nginx-affiliate.conf` — prod routing (php-fpm vs Node :3001); NOTE: document_root points at a paseo worktree, not this checkout — deployed PHP ≠ working tree unless synced
- `GAP_ANALYSIS_FINAL.md` — authoritative, verified status doc. `route-coverage.md` numbers are stale; `GAP_ANALYSIS.md` is superseded; `plans/gap-analysis-p0-implementation.md` is DRAFT/partially delivered.

## Runtime/Tooling Preferences

- Package manager: **npm** everywhere (no workspaces, no lockfiles tracked — `server/package-lock.json` and `composer.lock` are gitignored).
- No Node version is pinned anywhere (no `engines`, no `.nvmrc`, no CI setup-node). Use a current LTS that satisfies jest@30 / vite@8.
- `socket.io` resolution relies on Node walking up to root `node_modules` — both installs are required.
- dotenv loads `../.env` relative to `server/app.js` → **always edit the repo-root `.env`**, never `server/.env`.
- Playwright config has **no `webServer` block** — start `node app.js` yourself before `test:playwright` (port mismatch trap: config defaults :3001; some specs fall back to :8080).
- `edge/` deploys only via Kubernetes (in-cluster redis/kafka/clickhouse); `edge/Dockerfile` pins golang:1.22 while `go.mod` wants 1.24 — known mismatch.
- `docker-compose.yml` gotchas: the `node` service references a missing `server/Dockerfile`; MySQL container init applies `server/migrations/*.sql` **alphabetically** on first boot (≠ manifest order).
- One-off ops scripts live in `server/` root (`mint_wf02_*.js`, `fix_wf02_*.js`, `get_affiliate_stats.js`, `run_manual_wf02.js`): treat as history — they mutate production-shaped rows (hardcoded `affiliate_id=13`) and `fix_wf02_*` rewrite `services/pipelineService.js` non-idempotently. Never rerun them casually.

## Testing & QA

Framework: **Jest 30** (node env) + supertest + Playwright. Config: `server/jest.config.js`.

- **Coverage is ALWAYS collected** (no flag needed) and thresholds are hard gates: lines 70 / functions 60 / branches 55 / statements 70 — measured only over the narrow scope `collectCoverageFrom`: `controllers/postbackController.js`, `services/postbackQueue.js`, `middleware/rateLimit.js`, `agents/**`. Touching those files below threshold fails unrelated-looking runs; new services aren't counted unless added to that scope.
- `setupFilesAfterEnv: tests/setup.js` silences console output, sets `NODE_ENV=test` and dummy creds (`DB_USER=test_user` → the migration suite auto-skips its real-DB tests via `HAS_REAL_DB` guard), and resets rate-limit state `beforeEach`.
- Default run executes 20 of 21 `*.test.js` files (`e2e.wrapper.test.js` double-excluded). ~311 tests claimed in GAP_ANALYSIS_FINAL.md; ~85% coverage is over the scoped slice, not repo-wide.
- **Mocking conventions** (follow existing style):
  - MySQL pool: shared singleton `tests/mocks/database.js` wired with `jest.mock('../db/mysql', () => mockPool)` (`postback.test.js`, `e2e/api.e2e.test.js` — which also sets `global.pool` because the healthcheck reads a bare global).
  - Fresh app per test: `loadApp()` using `jest.resetModules()` + `jest.doMock(...)` + `require('../../app')` — canonical for module-state isolation (`e2e/auth.e2e.test.js`).
  - Redis: virtual `jest.mock('../../lib/redisClient', ...)` with mutable `mockBackend.consume` (`unit/globalRateLimit.test.js`).
  - Outbound HTTP: fake Node core `http`/`https` modules (NOT `global.fetch`) — `postback.test.js`.
  - bcryptjs / AI `generateText`: direct `jest.mock` factories (`e2e/auth.e2e.test.js`, `unit/voltAgentProvider.test.js`).
- **Supertest e2e needs no live server/DB**: suites import the app in-process with mocked pool and mint local JWTs (`JWT_SECRET` set in-file).
- **Real-infrastructure paths are opt-in**: `npm run test:e2e` shells `tests/e2e/roles/*.test.js` against live MariaDB `prosper1ai_test`; `tests/migrations/run_migrations.test.js` uses a throwaway DB and skips otherwise.
- **Playwright** (2 specs): `ui.spec.js` drives the live SPA, injecting a signed JWT into `localStorage` (secret read from `server/.env`, fallback `dev-secret-change-me`); `attribution-dashboard.spec.js` is self-contained (fixture HTML + `page.route` API interception). Both need a running target app.

## Key URLs (dev)

- Admin/API SPA: served by Node at `/` (build output `server/public/dist`)
- API base: `/api` · Click entries: `/r/:slug`, `/go/:hash`
- Socket.IO: `/socket.io` · Health: `/health` · Metrics: `/metrics`
