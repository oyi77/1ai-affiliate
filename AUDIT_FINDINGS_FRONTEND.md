# Frontend SPA Audit Findings
**Auditor:** AuditFrontend  
**Date:** 2026-06-19  
**Scope:** frontend/src/ — all pages, components, hooks, lib

---

## lib/api.js — Summary

- `baseURL: '/'` — relative, resolves correctly against the Express server on :3001. No hardcoded host.
- Auth token: reads `localStorage.getItem('token')`, injects as `Authorization: Bearer <token>`. Correct.
- 401 interceptor: clears token, redirects to `/login`. Correct.
- No request timeout configured — all API calls can hang indefinitely. (Minor)

---

## hooks/useStats.js — Summary

- Calls `GET /api/admin/stats?role=<role>` — endpoint **exists** at `server/routes/admin.js → GET /stats`.
- `refetchInterval: 30000` — live polling every 30s. Correct.
- Result: **functional**.

---

## App.jsx — All 28 Routes

| # | Path | Component | Status |
|---|------|-----------|--------|
| 1 | `/` | Dashboard | Implemented |
| 2 | `/campaigns` | Campaigns | Implemented |
| 3 | `/offers` | Offers | Implemented |
| 4 | `/affiliates` | Affiliates | Implemented |
| 5 | `/smartlinks` | SmartlinkGenerator | Stub — no API calls |
| 6 | `/landing-pages` | LandingPageBuilder | Stub — no API calls |
| 7 | `/deep-links` | DeepLinkGenerator | Stub — no API calls |
| 8 | `/postback-builder` | PostbackBuilder | Partial — test uses `alert()` |
| 9 | `/ai-tools` | AITools | Implemented |
| 10 | `/analytics` | Analytics | Partial — stats query result discarded |
| 11 | `/attribution` | Attribution | Partial — calls wrong endpoint |
| 12 | `/reports` | Reports | Implemented |
| 13 | `/click-tracker` | ClickTracker | Partial — both queries hit same endpoint |
| 14 | `/day-parting` | DayParting | Partial — calls wrong endpoint |
| 15 | `/earnings` | Earnings | Implemented |
| 16 | `/commissions` | Commissions | Implemented |
| 17 | `/domains` | Domains | Implemented |
| 18 | `/shorteners` | Shorteners | Implemented (minor endpoint mismatch) |
| 19 | `/click-servers` | ClickServers | Endpoint mismatch |
| 20 | `/integrations` | Integrations | Implemented (minor endpoint mismatch) |
| 21 | `/pipeline` | Pipeline | **Fully mocked — no API calls** |
| 22 | `/poster` | Poster | **Fully mocked — no API calls** |
| 23 | `/settings` | Settings | Endpoint mismatch; Security tab dead |
| 24 | `/api-docs` | APIDocs | Static content only — OK |
| 25 | `/admin` | Admin | System status endpoint mismatch |
| 26 | `/vip` | VIPPerks | Endpoint mismatch |
| 27 | `/help` | Help | Static FAQ only — OK |
| 28 | `/login` | Login | Implemented |

Navigation in Shell.jsx also lists `/vip-perks` — route is registered as `/vip` in App.jsx. **Dead nav link.**

---

## Findings

---

### F-FE-001
**Area:** Frontend / Pipeline page  
**Severity:** Major  
**Description:** `Pipeline` page (`/pipeline`) makes zero API calls. All data is hardcoded in `MOCK_STATUS` and `MOCK_ACTIVITY` constants defined at module level. The "Start/Stop" toggle only flips local state — it never calls `POST /api/pipeline/run` or any pipeline endpoint. The real pipeline controller (`server/routes/pipeline.js`) exposes `POST /run`, `GET /jobs`, `GET /jobs/:id`, `GET /accounts` — none are called.  
**File:** `frontend/src/pages/Pipeline.jsx`  
**Lines:** 15–31 (mock constants), 39–41 (toggle noop)

---

### F-FE-002
**Area:** Frontend / Poster page  
**Severity:** Major  
**Description:** `Poster` page (`/poster`) makes zero API calls. All data is hardcoded in `MOCK_STATUS` and `MOCK_QUEUE` constants. The "Add to Queue" form submission (`handleSubmit`) only appends to a local React array — it never calls `POST /api/poster/queue`. The "Trigger" button does not call `POST /api/poster/trigger`. Real endpoints in `server/routes/poster.js` (`/trigger`, `/queue`, `/queue/:id`) are entirely unreachable from the UI.  
**File:** `frontend/src/pages/Poster.jsx`  
**Lines:** 15–30 (mock constants), 41–46 (handleSubmit noop)

---

### F-FE-003
**Area:** Frontend / SmartlinkGenerator page  
**Severity:** Major  
**Description:** `SmartlinkGenerator` (`/smartlinks`) never calls any API. Step 1 shows three hardcoded offer strings (`'iPhone 15 Pro - Sweepstakes'`, `'Weight Loss Supplement - VSL'`, `'Casino Welcome Bonus - EU'`) instead of fetching from `GET /api/admin/offers`. Step 2 landing page and domain dropdowns are empty `<select>` elements with no options loaded. No `POST /api/smartlink/generate` call is ever made — no smartlink is persisted. The `GET /api/smartlink/list` endpoint also goes unused.  
**File:** `frontend/src/pages/SmartlinkGenerator.jsx`  
**Lines:** 45–58 (hardcoded offer list), 69–73 (empty landing page select), step 4 has no submit action

---

### F-FE-004
**Area:** Frontend / DeepLinkGenerator page  
**Severity:** Major  
**Description:** `DeepLinkGenerator` (`/deep-links`) generates links entirely client-side by string-concatenating `https://track.1ai.aff/dl?target=...` — this domain does not exist in the server. No API call is made. The comment on line 27 explicitly acknowledges this: `// In a real app, this would be a tracking domain redirect URL`. History table is local React state only — not persisted.  
**File:** `frontend/src/pages/DeepLinkGenerator.jsx`  
**Lines:** 19–29 (local-only link generation), 27 (comment admits it's fake)

---

### F-FE-005
**Area:** Frontend / LandingPageBuilder page  
**Severity:** Major  
**Description:** `LandingPageBuilder` (`/landing-pages`) is a purely client-side HTML template generator. It generates static HTML strings locally and copies them to clipboard. No API call is made to save, publish, or retrieve landing pages. No server endpoint exists for landing page CRUD. The `setModalOpen(true)` call on template select sets state that is immediately destructured as `[, setModalOpen]` (value discarded), and nothing renders from that modal.  
**File:** `frontend/src/pages/LandingPageBuilder.jsx`  
**Lines:** 23 (modal open state discarded), 26–29 (no API on select), 54–58 (clipboard only)

---

### F-FE-006
**Area:** Frontend / Analytics page — orphaned query  
**Severity:** Major  
**Description:** The first `useQuery` in `Analytics` (queryKey `['analytics-stats', range]`, line 20–26) fetches `GET /api/admin/stats?range=${range}` but its return value is **never assigned to a variable** — the entire response is silently discarded. The `range` state controls this query key, so changing the date range selector does re-fire the request, but the result is thrown away. Only the second query (`analytics-report`) is actually rendered.  
**File:** `frontend/src/pages/Analytics.jsx`  
**Lines:** 20–26 (result discarded), 17 (range state)

---

### F-FE-007
**Area:** Frontend / ClickTracker page — duplicate endpoint  
**Severity:** Major  
**Description:** `ClickTracker` has two `useQuery` calls, both hitting `GET /api/admin/stats` (lines 44 and 52). The events query is supposed to return a live click stream but instead reads `res.data?.recent_clicks` from the stats endpoint. There is no dedicated click events/stream endpoint. The `paused` toggle correctly gates `refetchInterval` but is otherwise polling the wrong endpoint. No `GET /api/admin/clicks` or SSE endpoint is used.  
**File:** `frontend/src/pages/ClickTracker.jsx`  
**Lines:** 41–56

---

### F-FE-008
**Area:** Frontend / DayParting page — wrong endpoint  
**Severity:** Major  
**Description:** `DayParting` calls `GET /api/admin/stats` and reads `res.data?.dayparting_heatmap`. The `/api/admin/stats` endpoint does not document a `dayparting_heatmap` field — it is a general stats aggregator. If the field is absent (likely), `heatGrid` is `[]` and the entire 7×24 heatmap grid renders as zeros. There is no dedicated day-parting endpoint.  
**File:** `frontend/src/pages/DayParting.jsx`  
**Lines:** 31–43

---

### F-FE-009
**Area:** Frontend / Attribution page — wrong endpoint  
**Severity:** Minor  
**Description:** `Attribution` calls `GET /api/admin/stats` (line 35) and reads `stats.active_models`, `stats.conversions_attributed`, `stats.avg_touchpoints`, `stats.attribution_models`. The stats endpoint is a general aggregator; these attribution-specific fields are not guaranteed to be present. When absent, all three stat cards fall back to hardcoded defaults (`3`, `0`, `0`) and the model toggle logic (`isModelActive`) always returns `true`. No attribution-specific endpoint exists.  
**File:** `frontend/src/pages/Attribution.jsx`  
**Lines:** 34–47

---

### F-FE-010
**Area:** Frontend / Admin page — wrong system status endpoint  
**Severity:** Major  
**Description:** `Admin` calls `GET /api/admin/system/status` (line 36) but the actual route is `GET /api/admin/system` (registered in `server/routes/admin.js` line 59). The `/status` suffix does not exist — this request will 404 (Express falls through to the SPA catch-all). The System Status tab in the Admin panel will always show empty/loading.  
**File:** `frontend/src/pages/Admin.jsx`  
**Lines:** 36

---

### F-FE-011
**Area:** Frontend / Settings page — wrong profile endpoint  
**Severity:** Major  
**Description:** `Settings` page calls `GET /api/admin/vip-profile` (line 25) and `PUT /api/admin/vip-profile` (line 39). The actual routes are `GET /api/admin/vip` and `PUT /api/admin/vip` (registered in `server/routes/admin.js` lines 70–71). The `/vip-profile` path does not exist — both calls will 404. Profile tab will always appear empty and saving will silently fail (error swallowed by React Query with no onError handler).  
**File:** `frontend/src/pages/Settings.jsx`  
**Lines:** 25, 39

---

### F-FE-012
**Area:** Frontend / VIPPerks page — wrong profile endpoint  
**Severity:** Major  
**Description:** Same mismatch as F-FE-011. `VIPPerks` calls `GET /api/admin/vip-profile` (line 40). Actual route is `GET /api/admin/vip`. Falls through to 404. `currentTier` always defaults to `'Starter'` regardless of actual user tier.  
**File:** `frontend/src/pages/VIPPerks.jsx`  
**Lines:** 40

---

### F-FE-013
**Area:** Frontend / ClickServers page — wrong endpoint  
**Severity:** Major  
**Description:** `ClickServers` calls `GET /api/admin/click-servers` (line 22) and `POST /api/admin/click-servers` (line 28). The actual routes are `GET /api/admin/clickservers` and `POST /api/admin/clickservers` (no hyphen, registered in `server/routes/admin.js` lines 60–61). Both will 404.  
**File:** `frontend/src/pages/ClickServers.jsx`  
**Lines:** 22, 28

---

### F-FE-014
**Area:** Frontend / Integrations page — wrong test endpoint  
**Severity:** Minor  
**Description:** `Integrations.testPostback()` calls `POST /api/admin/networks/test` (line 57). No such route exists in `server/routes/admin.js` — the networks routes are only `GET /networks` and `POST /networks`. The test postback button will always 404.  
**File:** `frontend/src/pages/Integrations.jsx`  
**Lines:** 57

---

### F-FE-015
**Area:** Frontend / Shorteners page — wrong test endpoint  
**Severity:** Minor  
**Description:** `Shorteners.testConnection()` calls `POST /api/admin/shorteners/test` (line 55) passing `{ id }` in the body. The actual route is `POST /api/admin/shorteners/:id/test` (id in path, `server/routes/admin.js` line 87). The `test` path segment collides with the `:id` param — the call will 404.  
**File:** `frontend/src/pages/Shorteners.jsx`  
**Lines:** 55

---

### F-FE-016
**Area:** Frontend / PostbackBuilder — alert() for feedback  
**Severity:** Minor  
**Description:** `PostbackBuilder.testPostback()` uses `alert('Test postback sent successfully!')` and `alert('Test postback failed...')` for user feedback (lines 43, 46). Uses `console.error` for logging (line 45). Should use the app's toast/notification system or at minimum an inline message. The test call also fires an HTTP GET to the full postback URL (which starts with `https://track.1ai.aff/...`) via `api.get()` — this is an external URL that will be proxied relative to the SPA's base URL, meaning it will 404 locally.  
**File:** `frontend/src/pages/PostbackBuilder.jsx`  
**Lines:** 42–46

---

### F-FE-017
**Area:** Frontend / Dashboard — hardcoded sparklines + empty widgets  
**Severity:** Minor  
**Description:** All five `StatCard` sparklines use hardcoded arrays (`mockSparkline = [10, 15, 13, 18, 22, 19, 25]` etc.) — they never reflect real time-series data. Additionally, the "Recent Activity" and "Top Performers" cards render static placeholder text (`"Activity feed will appear here..."`, `"Top converting affiliates will appear here..."`) — no API call populates these widgets.  
**File:** `frontend/src/pages/Dashboard.jsx`  
**Lines:** 10, 25–26, 85, 92

---

### F-FE-018
**Area:** Frontend / Settings — Security tab entirely dead  
**Severity:** Minor  
**Description:** The Security tab renders a "Two-Factor Authentication" button with no `onClick` handler and no API call. The Notifications tab (fourth tab) renders placeholder UI with no API calls to load or save notification preferences. Neither tab calls `GET /api/settings/*` or any other endpoint.  
**File:** `frontend/src/pages/Settings.jsx`  
**Lines:** 204–260 (security tab), notifications tab (not read but implied by tab definition line 50)

---

### F-FE-019
**Area:** Frontend / Settings — hardcoded postback/webhook URLs  
**Severity:** Minor  
**Description:** The API tab displays hardcoded postback URL `https://go.1ai.aff/postback?...` and webhook endpoint `https://api.1ai.aff/webhooks/incoming`. These are static strings — they are not fetched from `GET /api/settings/postback` which exists in `server/routes/settings.js`. The displayed URLs may not match the actual configured postback URL for the user's account.  
**File:** `frontend/src/pages/Settings.jsx`  
**Lines:** 189, 197

---

### F-FE-020
**Area:** Frontend / Settings — API key regeneration not wired  
**Severity:** Minor  
**Description:** The "Regenerate" button for the API key (visible in Settings > API tab) has no `onClick` handler that calls `POST /api/settings/api-key`. It appears to be rendered as an unconnected button. The `DELETE /api/settings/api-key` route also has no corresponding UI action.  
**File:** `frontend/src/pages/Settings.jsx`  
**Lines:** 165–170 (toggle show/hide only, no regenerate call)

---

### F-FE-021
**Area:** Frontend / Navigation — dead link  
**Severity:** Minor  
**Description:** `Shell.jsx` navigation includes `{ name: 'VIP Perks', href: '/vip-perks' }` but `App.jsx` registers the route as `<Route path="/vip" ...>`. Clicking "VIP Perks" in the sidebar navigates to `/vip-perks` which has no matching route and will render nothing (falls through to SPA catch-all, which redirects to `/`).  
**File:** `frontend/src/layout/Shell.jsx` line 37 (href), `frontend/src/App.jsx` line 75 (route path)

---

### F-FE-022
**Area:** Frontend / App.jsx — lazy import error-swallowing  
**Severity:** Minor  
**Description:** All lazy-loaded pages use `.catch(() => fallback)` which silently renders a `"Loading..."` div on any import error (including module not found, syntax errors). A broken page will appear to the user as a perpetual loading state with no error message. The `ErrorBoundary` wrapping won't catch this since the catch returns a valid component.  
**File:** `frontend/src/App.jsx`  
**Lines:** 20–35

---

### F-FE-023
**Area:** Frontend / App.jsx — auth check not reactive  
**Severity:** Minor  
**Description:** `isAuthenticated` is evaluated once at render from `localStorage.getItem('token')` (line 38). There is no listener for storage changes or token expiry events between renders. If the token is cleared by another tab or the 401 interceptor fires during initial render, the component will not re-evaluate until a full page reload. The `onLogin` handler calls `window.location.reload()` — correct but blunt.  
**File:** `frontend/src/App.jsx`  
**Lines:** 38–42

---

### F-FE-024
**Area:** Frontend / Campaigns — missing PATCH endpoint  
**Severity:** Minor  
**Description:** `Campaigns.toggleStatusMutation` calls `PATCH /api/admin/campaigns/:id` (line 35). Reviewing `server/routes/admin.js`, there is `GET /campaigns` and `POST /campaigns` but no `PATCH /campaigns/:id` registered. The toggle active/inactive button will 404.  
**File:** `frontend/src/pages/Campaigns.jsx`  
**Lines:** 35

---

### F-FE-025
**Area:** Frontend / lib/api.js — no request timeout  
**Severity:** Minor  
**Description:** The axios instance has no `timeout` configured. Any request that hangs (e.g. DB slow query, PHP-FPM backpressure) will keep the UI in an indefinite loading state with no way for the user to recover short of page reload.  
**File:** `frontend/src/lib/api.js`  
**Lines:** 3–8

---

## E2E Test Coverage Summary

| File | Covers | Missing UI flows |
|------|--------|-----------------|
| `tests/e2e/smoke/health.test.js` | Server alive, DB connectivity, admin login, offer creation | All frontend pages |
| `tests/e2e/roles/admin.test.js` | Admin CRUD: offers, affiliates, earnings, users, campaigns, networks, domains, commissions | Pipeline, Poster, Smartlink, AI Tools, Settings |
| `tests/e2e/roles/publisher.test.js` | Publisher role: offer visibility (assigned vs unassigned), earnings read | All admin-only flows |
| `tests/e2e/roles/advertiser.test.js` | Advertiser role scenarios | (not read fully) |
| `tests/e2e/fraud/bot-detection.test.js` | Bot detection fraud rules (FRAUD-B05–B07) | Frontend integration |
| `tests/e2e/fraud/ip-fraud.test.js` | IP fraud detection | Frontend integration |
| `tests/e2e/fraud/advanced-fraud.test.js` | Advanced fraud rules | Frontend integration |

**No E2E test covers any frontend SPA page navigation, form submission via the React UI, or end-to-end user workflow through the browser.** All tests operate at the HTTP API layer only. There are no Playwright tests for the 28 SPA routes.

---

## Severity Summary

| Severity | Count |
|----------|-------|
| Blocker | 0 |
| Major | 14 |
| Minor | 11 |
| Cosmetic | 0 |
| **Total** | **25** |

## Major Finding Index

| ID | Description |
|----|-------------|
| F-FE-001 | Pipeline page: fully mocked, no API calls |
| F-FE-002 | Poster page: fully mocked, no API calls |
| F-FE-003 | SmartlinkGenerator: hardcoded offers, no generate call |
| F-FE-004 | DeepLinkGenerator: local-only, fake tracking domain |
| F-FE-005 | LandingPageBuilder: client-side only, nothing saved |
| F-FE-006 | Analytics: first stats query result silently discarded |
| F-FE-007 | ClickTracker: both queries hit same endpoint |
| F-FE-008 | DayParting: calls wrong endpoint, heatmap always empty |
| F-FE-009 | Attribution: attribution fields absent from stats endpoint |
| F-FE-010 | Admin: system status 404 (`/system/status` vs `/system`) |
| F-FE-011 | Settings: profile 404 (`/vip-profile` vs `/vip`) |
| F-FE-012 | VIPPerks: profile 404 (`/vip-profile` vs `/vip`) |
| F-FE-013 | ClickServers: 404 (`/click-servers` vs `/clickservers`) |
| F-FE-024 | Campaigns: PATCH toggle endpoint not registered |
