# 1AI Affiliate Platform — Comprehensive Codebase Audit

> **Audited:** 2026-06-24  
> **Codebase:** `~/.paseo/worktrees/3q6b2aw8/smooth-cobra/`  
> **Auditor:** CodebaseAudit agent

---

## 1. Stack Overview

| Layer | Technology | Version |
|---|---|---|
| **Backend (Legacy)** | PHP 8.3 (procedural + OOP) | Slim 3.12 (API v2/v3) |
| **Backend (Modern)** | Node.js / Express 4.21 | 25 deps, helmet, pino |
| **Frontend (SPA)** | React 19 + Vite + TailwindCSS 4 | ~40 pages, Radix UI, Recharts |
| **Frontend (Legacy)** | Vanilla JS + jQuery | Bootstrap 3, custom CSS |
| **Database** | MySQL 8.0 | Primary OLTP store |
| **Analytics** | ClickHouse | Edge redirect analytics |
| **Cache** | Redis 7 | Sessions, caching, queues |
| **Messaging** | Kafka (via IBM Sarama) | Click event stream |
| **Edge** | Go (chi router, zerolog) | Redirect server, fraud detection |
| **CLI** | Go (cobra) | `p1ai` admin CLI |
| **AI/ML** | OpenAI, Anthropic, Google, VoltAgent | Agent framework, fraud scoring |
| **CI/CD** | GitHub Actions | PHPUnit, PHP lint, Claude review |

### Dependency Summary

| Component | Production Deps | Dev Deps |
|---|---|---|
| PHP (composer.json) | 5 | 5 |
| Node server | 25 | 5 |
| React frontend | 25 | 10 |
| Go edge | 55 | — |
| Go CLI | 5 | — |

---

## 2. Directory Structure (Annotated)

```
smooth-cobra/
├── account/              # PHP account management UI (17 files)
│   ├── account.php       # Main account page (1,058 LOC)
│   ├── administration.php# Admin panel (565 LOC)
│   ├── api-integrations.php # Third-party integrations (866 LOC)
│   ├── user-management.php  # User CRUD (492 LOC)
│   ├── attribution.php   # Attribution UI (696 LOC)
│   └── ajax/             # AJAX endpoints (12 files)
│
├── api/                  # REST API layer
│   ├── v1/               # Legacy v1 (functions.php, 686 LOC)
│   ├── v2/               # Slim-based v2 (360 LOC app.php)
│   ├── v3/               # Modern v3 (index.php, 512 LOC)
│   ├── V3/               # V3 namespace classes (PHP)
│   │   ├── Controller.php    # Base controller (753 LOC)
│   │   ├── Controllers/      # 18 resource controllers
│   │   ├── Auth.php          # API key auth (230 LOC)
│   │   ├── Router.php        # Route dispatch (138 LOC)
│   │   └── Support/          # SyncEngine (1,302 LOC), ServerStateStore (713 LOC)
│   └── Attribution/      # Attribution API controller (399 LOC)
│
├── config/               # PHP business logic core (236 files, ~30K LOC)
│   ├── connect2.php      # Main DB/bootstrap (3,868 LOC) ⚠️
│   ├── functions-tracking1ai.php  # Tracking core (3,879 LOC) ⚠️
│   ├── class-dataengine.php       # Data engine (3,893 LOC) ⚠️
│   ├── functions-upgrade.php      # Upgrade logic (3,202 LOC) ⚠️
│   ├── ReportSummaryForm.class.php # Reports (5,581 LOC) ⚠️
│   ├── ReportBasicForm.class.php  # Reports (3,020 LOC)
│   ├── Attribution/      # Attribution domain (30+ files)
│   ├── AI/               # AI agent framework (15 files)
│   ├── Database/         # Schema management, connections
│   ├── Repository/       # Repository pattern + caching
│   ├── RBAC/             # Role-based access control
│   ├── Fraud/            # Fraud detection service
│   ├── Commission/       # Commission calculations
│   └── ...               # 20+ domain modules
│
├── server/               # Node.js Express companion (21,529 LOC)
│   ├── app.js            # Entry point (179 LOC)
│   ├── controllers/      # 28 controllers (~5,700 LOC)
│   ├── services/         # 33 services (~5,500 LOC)
│   ├── routes/           # 40+ route files (~4,300 LOC)
│   ├── middleware/        # auth, rateLimit, idempotency, auditLog
│   ├── agents/           # AI provider integrations
│   ├── integrations/     # Platform connectors (TikTok, Meta, Google)
│   ├── db/               # MySQL pool
│   └── public/           # SPA build output + vanilla JS pages
│
├── frontend/             # React SPA (Vite)
│   └── src/
│       ├── App.jsx       # Router, ~40 page routes
│       ├── pages/        # 40+ page components
│       ├── components/   # Shared UI (GlassCard, DataTable, etc.)
│       ├── hooks/        # React Query hooks (5 files)
│       ├── lib/          # API client, currency utils
│       └── layout/       # Shell layout
│
├── edge/                 # Go redirect server (5,223 LOC)
│   ├── cmd/
│   │   ├── edgeredirect/ # Main redirect binary (431 LOC)
│   │   ├── cli/          # Edge CLI tool (446 LOC)
│   │   └── clickconsumer/ # Kafka click consumer (193 LOC)
│   └── internal/
│       ├── router/       # URL routing (168 LOC)
│       ├── clickhouse/   # CH analytics (336 LOC)
│       ├── detect/       # Fraud detection (115 LOC)
│       ├── redis/        # Cache layer (123 LOC)
│       ├── kafka/        # Event producer/consumer (159 LOC)
│       ├── webhook/      # Webhook dispatch (166 LOC)
│       └── graphql/      # GraphQL schema (246 LOC)
│
├── go-cli/               # Go admin CLI (11,921 LOC)
│   ├── cmd/              # 25+ cobra commands
│   └── internal/         # API client, config, sync state, output
│
├── tracking_support/     # PHP tracking UI (142 files, ~15K LOC)
│   ├── setup/            # Campaign/offer/rotator setup
│   ├── ajax/             # AJAX data endpoints
│   ├── static/           # Pixel/postback/deeplink handlers
│   ├── redirect/         # Redirect logic (rtr, dl, off, lp)
│   ├── analyze/          # Reporting breakdown pages
│   └── visitors/         # Visitor log + export
│
├── cronjobs/             # PHP scheduled tasks (12 files, ~1,500 LOC)
├── tests/                # PHP + JS tests (110+ test files)
├── scripts/              # Migration/import scripts (SQL + PHP)
├── mcp/                  # MCP server (Node + Python hub)
├── docker/               # Nginx, PHP-FPM, supervisord configs
├── js/                   # Legacy frontend JS (18 files)
├── css/                  # Legacy CSS + design system
└── documentation/        # User-facing docs
```

### Lines of Code by Language

| Language | Files | LOC |
|---|---|---|
| PHP | 633 | ~121,500 |
| JavaScript (server) | ~120 | ~21,500 |
| JavaScript (legacy/frontend) | ~155 | ~15,100 |
| Go (edge + CLI) | 57 | ~17,400 |
| SQL | 42 | ~3,500 |
| Python (MCP hub) | 1 | 578 |
| **Total** | **~1,008** | **~179,600** |

---

## 3. Static Analysis Findings

### 3.1 God Files (Critical Tech Debt)

The following files exceed 3,000 LOC and are the single biggest maintainability risk:

| File | LOC | Risk |
|---|---|---|
| `config/ReportSummaryForm.class.php` | 5,581 | Monolithic report rendering |
| `config/functions-tracking1ai.php` | 3,879 | Core tracking logic, procedural |
| `config/class-dataengine.php` | 3,893 | Data engine, no separation of concerns |
| `config/connect2.php` | 3,868 | Bootstrap + DB + session + cookie logic |
| `config/functions-upgrade.php` | 3,202 | Upgrade/migration logic |
| `config/ReportBasicForm.class.php` | 3,020 | Report rendering |
| `server/routes/gapfill.js` | 1,488 | Node route file, should be split |
| `api/V3/Support/SyncEngine.php` | 1,302 | Sync engine, complex state machine |
| `server/controllers/adminController.js` | 1,192 | Admin controller, too many concerns |

**Recommendation:** Extract domain modules from `connect2.php`, split god files into focused classes, and decompose `gapfill.js` into separate route modules.

### 3.2 Prepared Statements vs Raw Queries

| Pattern | Count |
|---|---|
| Prepared statements (`prepare`/`bind_param`/`PDO`) | **473** |
| Raw queries (`mysqli_query`/`->query()`) | **1,129** |

**Ratio:** Only 29.5% of database queries use prepared statements. The remaining 70.5% are raw queries — a significant SQL injection surface in the legacy PHP code.

### 3.3 Dead Code & Empty Files

| File | Issue |
|---|---|
| `config/functions-utils.php` | 0 bytes |
| `config/functions-api.php` | 0 bytes |
| `config/functions-empty.php` | 0 bytes |
| `config/functions-icons.php` | 0 bytes |
| `config/class-cache.php` | 6 bytes (effectively empty) |
| `health/index.php` | 0 bytes |
| `favicon.gif` | 0 bytes |
| `Mobile/security-code.php` | 0 bytes |
| `css/index.html` | 0 bytes |
| `charts/index.html` | 0 bytes |
| `server/public/assets/js/dom.js` | 4 bytes |
| `server/public/dist/assets/*.js` | Many 0-byte dist chunks (empty builds) |

### 3.4 Legacy / Procedural Code

The `tracking_support/` directory (142 PHP files, ~15K LOC) is entirely procedural — no classes, no autoloading, direct `mysqli_query` calls with string interpolation. This is the oldest part of the codebase and represents the highest density of security and maintainability issues.

The `config/` directory mixes modern repository pattern classes (e.g., `Attribution/`, `Repository/`, `Click/`) with massive procedural files (`connect2.php`, `functions-tracking1ai.php`). The codebase is mid-migration from legacy to modern patterns.

### 3.5 Duplicate/Conflicting Implementations

| Pattern | Instances |
|---|---|
| `api/v3/` (entry) vs `api/V3/` (namespace) | Two directories for same API version |
| `tracking_support/redirect/` vs `edge/` | PHP redirects vs Go redirect server |
| `config/connect.php` vs `config/connect2.php` | Two bootstrap/connection files |
| `tracking_support/Redirect/RedirectHelper.php` vs `config/...` | Duplicate redirect helpers |
| `js/custom.php` (50.6K) vs `server/public/` | Two frontend JS generations |
| `Mobile/` vs `frontend/` | Mobile-specific pages vs responsive SPA |

### 3.6 TODO / Tech Debt Markers

| Marker | Count |
|---|---|
| TODO | 4 |
| FIXME | 0 |
| HACK | 0 |

The low count (4 total) suggests either disciplined cleanup or — more likely — that debt is tracked externally or not tracked at all. Given the volume of legacy code, the actual tech debt is orders of magnitude higher than these markers suggest.

---

## 4. Test Coverage Analysis

### 4.1 Test Inventory

| Category | Files | Framework | Coverage |
|---|---|---|---|
| **PHP Unit Tests** | 73 test files | PHPUnit 9.5 | Good for modern modules |
| **PHP E2E** | 1 file (`AdTechWorkflowTest.php`) | PHPUnit | Minimal |
| **Node Unit Tests** | 8 test files | Jest | Partial |
| **Node E2E** | 4 test files | Jest/supertest | Auth, RBAC, API, phase-a |
| **JS E2E (roles)** | 4 files | Unknown runner | Admin, advertiser, publisher, integration |
| **JS E2E (fraud)** | 3 files | Unknown runner | Advanced fraud, bot detection, IP fraud |
| **Go Unit Tests** | 10 test files | Go testing | Edge (router, detect), CLI |
| **Go Benchmarks** | 2 files | Go testing | Router, detection perf |
| **Playwright** | 1 spec | Playwright | Attribution dashboard |
| **Load Tests** | 2 files | k6-like | API + redirect |

### 4.2 Coverage Gaps (Critical)

| Area | Status | Risk |
|---|---|---|
| `tracking_support/` (142 files) | **0 tests** | 🔴 Critical — core tracking logic untested |
| `config/connect2.php` (3,868 LOC) | **0 tests** | 🔴 Critical — bootstrap/session logic |
| `config/functions-tracking1ai.php` (3,879 LOC) | **0 tests** | 🔴 Critical — tracking core |
| `config/class-dataengine.php` (3,893 LOC) | **0 tests** | 🔴 Critical — data processing |
| `config/ReportSummaryForm.class.php` (5,581 LOC) | **0 tests** | 🔴 Critical — report generation |
| `config/functions-upgrade.php` (3,202 LOC) | **0 tests** | 🔴 Critical — upgrade paths |
| `account/` (17 files, ~5K LOC) | **0 tests** | 🟡 High — account management UI |
| `cronjobs/` (12 files) | **0 tests** | 🟡 High — scheduled task logic |
| `server/controllers/` (28 files) | **~3 unit tests** | 🟡 High — most controllers untested |
| `server/services/` (33 files) | **~3 unit tests** | 🟡 High — most services untested |
| `frontend/src/` (40+ pages) | **0 tests** | 🟡 High — no React component tests |

### 4.3 Well-Tested Areas

The `tests/` directory shows solid coverage for:
- Attribution strategies (all 6 models tested)
- API V3 controllers and routing
- Click/fraud scoring services
- Repository pattern implementations (cached decorators, key collisions)
- Auth class and password handling
- CLI commands
- Redirect logic (dl.php variants)
- Static endpoint handlers (postback, pixel, conversion)

**Estimated overall coverage: ~15-20%** (modern PHP modules are well-covered; ~80% of the codebase by LOC has zero tests).

---

## 5. Performance Bottlenecks

### 5.1 Database

| Issue | Severity | Detail |
|---|---|---|
| **No connection pooling in PHP** | 🔴 | `new mysqli()` per request in `config.php`; PHP-FPM process-per-request model means no persistent connections by default |
| **Raw queries with string concat** | 🔴 | 1,129 raw queries — not just injection risk but also prevent query plan caching |
| **Memcache fallback to MySQL** | 🟡 | `connect.php` tries Memcache, falls back silently; cache misses hit DB hard |
| **Global singleton DB** | 🟡 | `DB::getInstance()` creates read-write AND read-only connections eagerly on every request |
| **No query pagination in tracking_support** | 🟡 | Many `sort_*.php` files load full result sets |

### 5.2 Application Layer

| Issue | Severity | Detail |
|---|---|---|
| **`connect2.php` is 3,868 LOC** | 🔴 | Loaded on every PHP request — parses/evaluates massive file each time |
| **`ReportSummaryForm.class.php` at 5,581 LOC** | 🔴 | Report generation likely causes memory pressure and slow responses |
| **No OPcache tuning** | 🟡 | `php.ini` sets `display_errors=Off` but no OPcache configuration visible |
| **`custom.php` serves JS dynamically** | 🟡 | PHP generates JavaScript on-the-fly instead of serving static files |

### 5.3 Edge / Go

| Issue | Severity | Detail |
|---|---|---|
| **In-memory rate limiter** | 🟡 | `SlidingWindow` in Node uses `Map()` — lost on restart, doesn't scale horizontally |
| **Kafka consumer single-instance** | 🟡 | `clickconsumer` is a single binary; no consumer group scaling documented |
| **ClickHouse queries** | 🟢 | Dedicated analytics store — proper separation of OLTP/OLAP |

### 5.4 Frontend

| Issue | Severity | Detail |
|---|---|---|
| **40+ page routes, no code splitting evidence** | 🟡 | `App.jsx` imports all pages eagerly (bundle size) |
| **Legacy + modern JS coexist** | 🟡 | `js/` directory (jQuery) loads alongside `server/public/dist/` (React) |

---

## 6. Security Findings

### 6.1 Critical

| Finding | Evidence | Impact |
|---|---|---|
| **SQL injection surface** | 1,129 raw `mysqli_query`/`->query()` calls across `tracking_support/`, `config/`, `cronjobs/` — many with string interpolation | 🔴 Full DB compromise possible in legacy tracking code |
| **Hardcoded secrets in `.env` files** | Root `.env` contains `JWT_SECRET=1ai-affiliate-jwt-secret-2026-berkahkarya`, `ECOSYSTEM_API_KEY`, `DB_PASS=testpass`. Server `.env` has different `JWT_SECRET` | 🔴 Secrets committed to repo; two different JWT secrets suggest auth bypass risk |
| **`display_errors=On` in production code** | `config/connect.php:75` and `:123` set `display_errors=On` | 🔴 Error messages leak stack traces, DB credentials, file paths to users |
| **`httponly=false` on tracking cookies** | `config/connect2.php:696`: `$httponly = FALSE; // JS createCookie()/readCookie() must access these cookies` | 🔴 Cookies accessible to XSS — intentional for legacy JS but creates attack surface |
| **`md5()` for cache keys** | Used throughout `Repository/Cached/` and `account/account.php` | 🟡 MD5 is not cryptographically broken for cache keys, but signals weak crypto hygiene |
| **`sha1()` for ETags and digests** | `api/V3/Controller.php:594`, `SyncEngine.php`, `ServerStateStore.php` | 🟡 SHA-1 collision-prone for integrity checks |

### 6.2 High

| Finding | Evidence | Detail |
|---|---|---|
| **No CSRF protection found** | Searched for `csrf`/`_token` patterns — only found API key token references, no form CSRF tokens | State-changing forms in `account/`, `tracking_support/setup/` lack CSRF protection |
| **Rate limiting only on Node routes** | `server/middleware/rateLimit.js` — in-memory, per-process. PHP tracking endpoints have **no rate limiting** | Brute-force and DDoS on tracking pixel/postback endpoints |
| **JWT token in query string** | `server/middleware/auth.js`: `req.query.token` accepted for SSE | Tokens in URLs are logged, cached, and leaked via Referer headers |
| **CORS overly permissive** | `app.js`: `app.use(cors())` with no origin restrictions | Any origin can make authenticated API requests |
| **`'unsafe-inline'` and `'unsafe-eval'` in CSP** | `app.js` CSP config allows both | XSS mitigation severely weakened |
| **API key validation via health endpoint** | `auth.js` validates API keys by calling `/system/health` with the key — side-effect validation | Fragile; should validate keys directly against DB |
| **`exec()` found in PHP files** | 26 files use `exec`/`system`/`passthru`/`shell_exec` in non-test code | Command injection risk if user input reaches these calls |

### 6.3 Medium

| Finding | Evidence | Detail |
|---|---|---|
| **Session fixation risk** | Multiple `session_start()` calls without `session_regenerate_id()` after login | Session fixation possible |
| **Mixed password hashing** | `password_hash` is used (good), but `md5` and `sha1` also present in non-password contexts | Confusing crypto hygiene; `ForbidDirectPasswordHashRule` PHPStan rule is a good mitigation |
| **No Content-Security-Policy on PHP responses** | PHP files set `X-Content-Type-Options` and `X-Frame-Options` on V3 API only | Main application pages lack CSP headers |
| **phpMyAdmin exposed in docker-compose** | `phpmyadmin` service on port 8080 | Should be behind VPN/auth, not in tools profile |
| **Two different JWT secrets** | Root `.env` vs `server/.env` have different `JWT_SECRET` values | PHP and Node cannot verify each other's tokens — auth fragmentation |

### 6.4 Positive Security Patterns

- **PHPStan custom rules** forbid direct `password_hash()`, `mysqli_stmt` calls, and silent `json_decode` — enforcing security patterns at static analysis level
- **RBAC service** (`config/RBAC/RBACService.php`) with role-based access control
- **Rate limiting** on Node auth endpoints (5/min login, 3/min register)
- **Idempotency middleware** on Node for mutation safety
- **Audit logging middleware** on Node
- **Helmet** on Express (CSP, HSTS, etc.)
- **JWT verification** with expiry and role claims
- **Fraud detection** pipeline (IPQS integration, ML service, rule engine)
- **Conversion cap enforcement** prevents overspend

---

## 7. Architecture Score

| Dimension | Score | Rationale |
|---|---|---|
| **Scalability** | 🟡 | Go edge + ClickHouse analytics + Kafka event stream = strong horizontal scaling for tracking. But PHP is monolithic (no connection pooling, global singletons), Node rate limiter is in-memory. Dual-stack PHP+Node adds operational complexity. |
| **Maintainability** | 🔴 | 6 PHP files exceed 3,000 LOC each. `tracking_support/` (142 files) is entirely procedural. 70%+ of DB queries are raw. Dual frontend stacks (jQuery + React). Two API version directories (`v3/` + `V3/`). Mid-migration state creates cognitive overhead. |
| **Extensibility** | 🟡 | Modern modules use repository pattern, interfaces, and dependency injection (Attribution, Click, Repository). AI agent framework with tool registry is well-designed. But legacy tracking code resists extension — adding a new tracking feature means editing 3,879 LOC procedural files. |
| **Observability** | 🟡 | Node has structured logging (pino), Prometheus metrics, request IDs, audit logs. Go has zerolog. PHP has no structured logging — `error_log()` and `display_errors=On`. No unified tracing across PHP→Node→Go→MySQL. |
| **Security** | 🔴 | SQL injection surface (1,129 raw queries), hardcoded secrets in repo, `display_errors=On` in production, no CSRF, permissive CORS, weak CSP. Positive: PHPStan security rules, RBAC, rate limiting on Node, fraud detection pipeline. |
| **Test Coverage** | 🔴 | ~15-20% estimated. Core tracking logic (20K+ LOC) has zero tests. No frontend tests. Modern PHP modules are well-tested. Node has minimal coverage. Go has good unit + benchmark tests. |

### Overall Architecture Score: 🟡 (2.5 / 5)

The platform has a **strong modern foundation** (Go edge, repository pattern, AI framework, React SPA) layered on top of a **massive legacy PHP core** that was never designed for the current scale. The codebase is mid-modernization and would benefit from:

1. **Continuing the migration** — the repository pattern, AI agents, and V3 API show the right direction
2. **Eliminating god files** — extract modules from `connect2.php`, split `ReportSummaryForm.class.php`
3. **Securing legacy code** — parameterized queries for `tracking_support/`, CSRF tokens, proper error handling
4. **Unifying the stack** — consolidate Node and PHP auth (single JWT secret), remove dead files
5. **Testing the core** — `tracking_support/`, `cronjobs/`, and `account/` need integration tests urgently

---

## 8. Appendix: File Counts by Directory

| Directory | PHP | JS | Go | Other | Total |
|---|---|---|---|---|---|
| `config/` | 236 | — | — | — | 236 |
| `tracking_support/` | 142 | — | — | — | 142 |
| `server/` | — | 120 | — | — | 120 |
| `tests/` | 73 | 20 | 10 | — | 103 |
| `account/` | 17 | — | — | — | 17 |
| `api/` | 43 | — | — | — | 43 |
| `cli/` | 55 | — | — | — | 55 |
| `cronjobs/` | 12 | — | — | — | 12 |
| `edge/` | — | — | 14 | — | 14 |
| `go-cli/` | — | — | 28 | — | 28 |
| `frontend/` | — | 35 | — | — | 35 |
| `js/` | 3 | 18 | — | — | 21 |
| `scripts/` | 3 | — | — | 15 | 18 |
| `docker/` | — | — | — | 7 | 7 |
| `mcp/` | — | 1 | — | 1 | 2 |
| Other root files | 15 | 2 | — | 20 | 37 |
