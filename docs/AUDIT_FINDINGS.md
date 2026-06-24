# 1ai-Affiliate Audit Findings
**Date**: 2026-06-19  
**Auditor**: Autonomous QA Pass (Kiro)  
**Status**: Phase 2 — Active Remediation  

---

## Severity Key
- **Blocker** — data loss, security hole, broken install, feature completely non-functional
- **Major** — advertised feature broken end-to-end, wrong numbers in production
- **Minor** — edge case, inconsistent validation, missing error message
- **Cosmetic** — UI polish, copy, non-blocking console warnings

---

## BLOCKER Findings

| ID | Area | Description | File(s) | Lines | Status |
|----|------|-------------|---------|-------|--------|
| B-001 | Auth — Login | `1ai_api_keys.created_at` has no DEFAULT, INSERT in login path crashes with 500 for new users without existing API key | `server/controllers/authController.js` | 56-59 | **FIXED** |
| B-002 | Security — JWT | `JWT_SECRET` defaults to hardcoded `'dev-secret-change-me'` when no `.env` present. Token forgery trivial. | `server/middleware/auth.js` | 5 | In Progress |
| B-003 | Auth — Password Reset | `forgotPassword` returns plaintext `resetKey` + `userId` in HTTP response body. Zero email verification. | `server/controllers/authController.js` | ~148 | In Progress |
| B-004 | Schema — Password Reset | `1ai_users` missing `user_pass_key`, `user_pass_time` columns. `forgotPassword` and `resetPassword` crash 500. | `server/controllers/authController.js` | 142,174 | In Progress |
| B-005 | Schema — Settings | `1ai_users_pref` table does not exist. `GET /api/settings/profile` and `/integrations` crash 500. | `server/controllers/settingsController.js` | 26,131,224 | In Progress |
| B-006 | Schema — AM module | `1ai_am_assignments` table + `assignment_type`, `assigned_by` columns missing. All AM endpoints crash 500. | `server/controllers/amController.js` | 89-90 | In Progress |
| B-007 | Schema — Pipeline | `1ai_pipeline_jobs` table does not exist. All pipeline endpoints crash 500. | `server/routes/pipeline.js` | — | In Progress |
| B-008 | Schema — Poster | `1ai_promo_queue` table does not exist. All poster endpoints crash 500. | `server/routes/poster.js` | — | In Progress |
| B-009 | Click Tracking — DB Schema | PHP click tracking (`lp.php`, `rtr.php`, `gpb.php`) writes to `clicks`, `clicks_record`, `clicks_advance`, `clicks_tracking`, `google`, `clicks_spy`, `clicks_counter`, `clicks_variable`, `clicks_site` — **none of these tables exist**. Only `1ai_clicks` exists with a different schema. Every click is silently dropped. | `tracking_support/redirect/lp.php`, `tracking_support/static/gpb.php`, `config/Click/MysqlClickRepository.php` | lp:179-186, gpb:75-100 | Pending |
| B-010 | Attribution — Missing Models | `ModelType` enum has no `FIRST_TOUCH` or `LINEAR` case. No `FirstTouchStrategy.php` or `LinearStrategy.php` exist. Two of five advertised models cannot be created or run. | `config/Attribution/ModelType.php`, `config/Attribution/AttributionJobRunner.php` | ModelType:10-43 | Pending |
| B-011 | Attribution — Algorithmic Fallback | `ALGORITHMIC` model silently falls back to `LastTouchStrategy` via `default` arm. Wrong data produced silently — no error, no log. | `config/Attribution/AttributionJobRunner.php` | 122-131 | Pending |
| B-012 | Attribution — Missing DB Tables | `conversion_journeys`, `attribution_snapshots`, `attribution_touchpoints`, `attribution_models`, `attribution_settings`, `attribution_audit_log`, `attribution_export_jobs` do not exist. All attribution cron jobs fail at runtime. | `cronjobs/attribution-rebuild.php`, `cronjobs/backfill-conversion-journeys.php`, `cronjobs/attribution-export.php` | — | Pending |
| B-013 | PHP API v3 — Unreachable | PHP-FPM pool on port 9002 listens only on `127.0.0.1`, nginx config on port 9001 resets all connections (SSL/protocol mismatch). API V3 is completely unreachable via HTTP. | `/etc/nginx/sites-enabled/1ai-tracking` | — | Pending |
| B-014 | PHP — ServerStateStore Fatal | `ServerStateStore` calls `mkdir()` on a path without permission check — fatal error kills every API V3 request before headers sent. | `config/Database/ServerStateStore.php` | — | Pending |
| B-015 | Click Tracking — lp.php Only Updates | `lp.php` does `UPDATE clicks_record SET ...` but never INSERTs. First-visit clicks (no cookie) are dropped entirely. | `tracking_support/redirect/lp.php` | 179-186 | Pending |
| B-016 | Postback — Semantic Mismatch | `POST /api/postback` looks up `click_id` in `1ai_smartlinks` slug column, not in `1ai_clicks`. Every real S2S postback returns 404. | `server/routes/postback.js` | — | In Progress |

---

## MAJOR Findings

| ID | Area | Description | File(s) | Lines | Status |
|----|------|-------------|---------|-------|--------|
| M-001 | Schema — Offers | `POST /api/admin/offers` crashes 500 — `updated_at` has no DEFAULT value on `1ai_offers`. | `server/controllers/adminController.js` | — | In Progress |
| M-002 | Schema — Offers | `POST /api/om/offers/:id/approve` crashes 500 — `margin_floor_pct` column missing from `1ai_offers`. | `server/controllers/omController.js` | — | In Progress |
| M-003 | PHP — rtr.php Fatal | `redirect_process()` in `rtr.php` uses `$conn->escape()` from outer scope without `global` or param — fatal on every rotator click insert. | `tracking_support/redirect/rtr.php` | 353,380 | Pending |
| M-004 | PHP — gpb.php Revenue Loss | `gpb.php` SELECT fetches `click_payout` but INSERT into `conversion_logs` omits it — revenue is always recorded as 0. | `tracking_support/static/gpb.php` | 75-130 | Pending |
| M-005 | PHP — deeplink.php Fatal | `deeplink.php` uses wrong `substr()` offset — fatal on every deep-link request. | `tracking_support/redirect/dl.php` | — | Pending |
| M-006 | Cron — Hardcoded user_id=1 | `process_dataengine_job.php` hardcodes `user_id = 1`. Multi-user installs only aggregate data for user 1. | `cronjobs/process_dataengine_job.php` | 25 | Pending |
| M-007 | Cron — SQL Injection | `dni.php` UPDATE concatenates `$row['apiKey']` from DB directly into SQL string. Second-order SQL injection. | `cronjobs/dni.php` | 41-42 | Pending |
| M-008 | AI — Mock Fallback Silent | `AIProviderFactory` silently falls back to `MockAIProvider` when `OPENAI_API_KEY` absent. All agent calls return canned fake responses in production with no warning. | `config/AI/AIProviderFactory.php` | 30-44 | Pending |
| M-009 | AI — Unsupported Tool Type | All 6 AI content endpoints return 503 — `GEMINI_API_KEY` not configured. | `server/controllers/contentController.js` | — | Pending |
| M-010 | AI — Agent Tool Type Error | All Node AI agents fail with 'Unsupported tool type: user-defined' — MockAIProvider fallback broken. | `server/routes/ai.js` | — | Pending |
| M-011 | Payment — Tripay 500 | `POST /api/payment/create` crashes 500 — `TRIPAY_PRIVATE_KEY` undefined, crypto throws TypeError. | `server/controllers/paymentController.js` | — | Pending |
| M-012 | Frontend — Pipeline/Poster Mocked | Pipeline (`/pipeline`) and Poster (`/poster`) pages return fully hardcoded mock data — zero real API calls. | `frontend/src/pages/Pipeline.jsx`, `frontend/src/pages/Poster.jsx` | — | Pending |
| M-013 | Frontend — Smartlink/DeepLink/LP No API | SmartlinkGenerator, DeepLinkGenerator, LandingPageBuilder pages make zero API calls — forms have no submission handlers. | `frontend/src/pages/SmartlinkGenerator.jsx`, etc. | — | Pending |
| M-014 | Frontend — Dashboard Hardcoded | All sparklines are hardcoded arrays. "Recent Activity" and "Top Performers" widgets are static placeholder text. | `frontend/src/pages/Dashboard.jsx` | — | Pending |
| M-015 | Frontend — Endpoint 404s | 5 pages call endpoints that don't exist: `/api/admin/system/status` (should be `/api/admin/system`), `/api/admin/vip-profile` (should be `/api/admin/vip`), `/api/admin/click-servers` (should be `/api/admin/clickservers`). | `frontend/src/pages/Admin.jsx`, `Settings.jsx`, `VIPPerks.jsx`, `ClickServers.jsx` | — | Pending |
| M-016 | Click Recording — Raw UA Lost | `ClickRecord` stores only resolved integer IDs. Raw UA, raw referrer, sub-IDs (s1-s5) not stored. If lookup table entry missing, raw signal permanently lost. | `config/Click/ClickRecord.php`, `config/Click/ClickRecordBuilder.php` | — | Pending |
| M-017 | API Routes Missing | `GET /api/admin/traffic-sources` and `GET /api/admin/clicks` return 404 — routes not registered in Express. | `server/routes/admin.js` | — | Pending |
| M-018 | Frontend — Campaigns PATCH Missing | `PATCH /api/admin/campaigns/:id` not registered — inline campaign editing silently fails. | `server/routes/admin.js` | — | Pending |

---

## MINOR Findings

| ID | Area | Description | File(s) | Lines | Status |
|----|------|-------------|---------|-------|--------|
| N-001 | Cron — Attribution | `backfill-conversion-journeys.php` queries bare `conversion_logs` (should be `1ai_conversion_logs`). | `cronjobs/backfill-conversion-journeys.php` | 84-91 | Pending |
| N-002 | Attribution — Default Arm | `resolveStrategy()` match uses `default` arm — any future `ModelType` addition silently falls back to LastTouch. | `config/Attribution/AttributionJobRunner.php` | 122-131 | Pending |
| N-003 | Frontend — Analytics Dead Query | Analytics page first `useQuery` result never assigned — silently discarded. | `frontend/src/pages/Analytics.jsx` | — | Pending |
| N-004 | Frontend — ClickTracker Reuse | ClickTracker and DayParting pages both query `GET /api/admin/stats` — reads `.dayparting_heatmap` field absent from that endpoint response. | `frontend/src/pages/ClickTracker.jsx`, `DayParting.jsx` | — | Pending |
| N-005 | Frontend — PostbackBuilder Alert | PostbackBuilder uses `alert()` for test postback feedback instead of inline UI. | `frontend/src/pages/PostbackBuilder.jsx` | 43,46 | Pending |
| N-006 | Frontend — VIP Nav Dead Link | Shell nav links to `/vip-perks` but route is `/vip`. | `frontend/src/layout/Shell.jsx` | — | Pending |
| N-007 | Frontend — Settings 2FA Stub | 2FA button has no `onClick`. Notifications tab has no API calls. | `frontend/src/pages/Settings.jsx` | — | Pending |
| N-008 | Frontend — Auth Not Reactive | `isAuthenticated` check not reactive to `localStorage` changes — stale auth state on token expiry. | `frontend/src/lib/api.js` | — | Pending |
| N-009 | API — No Axios Timeout | No axios request timeout configured — network hangs freeze the UI. | `frontend/src/lib/api.js` | — | Pending |
| N-010 | Attribution — No DB-backed Targeting | Only `InMemoryTargetingRepository` exists. No `targeting_rules` table. All offer targeting passes unconditionally. | `config/` | — | Pending |
| N-011 | Cron — DataEngine Only User 1 | `process_dataengine_job.php` hardcodes user_id filter. | `cronjobs/process_dataengine_job.php` | 25 | Pending |

---

## COSMETIC Findings

| ID | Area | Description | File(s) | Lines | Status |
|----|------|-------------|---------|-------|--------|
| C-001 | Frontend — SmartlinkGenerator | 3 hardcoded offer name strings in step 1 dropdown. | `frontend/src/pages/SmartlinkGenerator.jsx` | — | Pending |
| C-002 | Frontend — Auth Reactivity | `isAuthenticated` computed from `localStorage` synchronously on mount only. | `frontend/src/lib/api.js` | — | Pending |

---

## Summary

| Severity | Count | Fixed | In Progress | Pending |
|----------|-------|-------|-------------|---------|
| Blocker  | 16    | 1     | 5           | 10      |
| Major    | 18    | 0     | 3           | 15      |
| Minor    | 11    | 0     | 0           | 11      |
| Cosmetic | 2     | 0     | 0           | 2       |
| **Total**| **47**| **1** | **8**       | **38**  |

---

## Root Cause Analysis

Two parallel DB schemas exist simultaneously:
1. **Old PHP schema** (unprefixed): `clicks`, `clicks_record`, `campaigns`, `users`, etc. — referenced by all PHP tracking files but **none exist** in the current DB.
2. **New Node.js schema** (1ai_ prefixed): `1ai_clicks`, `1ai_users`, `1ai_aff_campaigns` — exists but PHP code doesn't use it.

This means the PHP hot-path click tracking engine is **completely non-functional** in production. All click data is silently dropped. The Node.js API layer is partially functional but has ~15 missing tables/columns causing widespread 500 errors.

**Priority order for fixes:**
1. Create missing DB tables/columns (unblocks 12+ findings)
2. Fix JWT_SECRET security hole
3. Fix postback endpoint semantic mismatch
4. Fix PHP tracking to use 1ai_ prefixed tables OR create the legacy tables
5. Implement missing attribution models (FIRST_TOUCH, LINEAR)
6. Fix frontend endpoint mismatches
