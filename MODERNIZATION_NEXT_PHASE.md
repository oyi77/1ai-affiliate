# SQL Modernization — Next Phase Plan

**Date:** 2026-06-19
**Status:** Proposed
**Scope:** Remaining 1,122 legacy call sites across 626 PHP files

---

## Current State (verified by grep, 2026-06-19)

| Pattern | Files | Calls | Risk |
|---|---|---|---|
| `real_escape_string` | ~107 | 1,122 | SQL injection if type widens |
| `_mysqli_query` | 58 | ~400 | Silent failures via `or record_mysql_error()` |
| `memcache_mysql_fetch_assoc` | 23 | ~180 | Silent cache poisoning, stale reads |
| `record_mysql_error` | 54 | ~200 | `never` return type — process dies on error |
| `global $db` | 14 | ~58 | Invisible dependency, untestable |

### What already uses Gen 3 (Connection + repositories)

- `record_simple.php`, `record_adv.php` — click recording hot path ✅
- `dl.php` — deep-link recording (partial: lookup repos + ClickRepository) 
- `config/Affiliate/`, `config/Commission/`, `config/Offer/`, `config/Margin/` — clean
- `config/Attribution/` — clean
- `config/Click/`, `config/Repository/`, `config/Report/`, `config/DataEngine/` — clean
- `api/V3/Controllers/` — all controllers clean

### What still uses legacy patterns

```
tracking_support/redirect/   — dl.php(67), rtr.php(60), lp.php(13), off.php(15), offrtr.php(13)
tracking_support/static/     — upx.php(37), gpb.php(35), gpx.php(18), px.php(6), pb.php(4)
tracking_support/setup/      — 10 files, 156 calls (admin CRUD, not hot path)
tracking_support/ajax/       — 42 files, 195 calls (admin UI, not hot path)
config/connect2.php          — 151 calls (bootstrap + global functions)
config/functions-tracking1ai.php — 62 calls
config/class-dataengine.php  — 59 calls (excluded from PHPStan)
api/v1/functions.php         — 23 calls (legacy reporting API)
api/v2/functions.php         — 16 calls (attribution API)
account/                     — 12 files, 93 calls (admin panels)
```

### PHPStan baseline (162 errors in 18 files)

16 `class.notFound` — excluded classes referenced from non-excluded files
10 `constant.notFound` — legacy constants (WordPress compat, l10n)
15 `method.private`/`notFound` — `AffiliateLinkService`, `MysqlAffiliateRepository`,
   `MysqlCommissionRepository`, `MysqlOfferRepository`, `MarginConfig`,
   `ConversionCommissionHandler`, `CommissionService` all calling
   `$this->conn->prepare()` (private) and `$this->conn->executeChecked()` (non-existent)
8 `arguments.count` — same files passing wrong arg count to `Connection::prepare()`
7 `argument.type` — same pattern

---

## Root Causes

### 1. Zero transaction protection on multi-table writes
`rtr.php`, `lp.php`, `off.php`, `offrtr.php`, `upx.php`, `gpb.php`, `gpx.php` each write
to 3-8 tables with no transaction boundary. A PHP crash mid-write leaves orphaned clicks,
dangling impression rows, and mismatched attribution state. `dl.php` has `Connection::transaction()`
on the ClickRepository path but the surrounding legacy SQL is still unprotected.

### 2. `_mysqli_query` suppresses failures silently
```php
$result = $db->query($sql) or record_mysql_error($db, $sql); // record_mysql_error is `never`
```
Errors call `record_mysql_error()` which is declared `never` — it logs and calls `die()`.
So failures kill the process rather than throwing, meaning callers can't catch and retry.
Replacing with Connection::execute() gives typed exceptions that propagate cleanly.

### 3. 162 PHPStan baseline errors in 7 repository files
`AffiliateLinkService`, `MysqlAffiliateRepository`, `MysqlCommissionRepository`,
`MysqlOfferRepository`, `MarginConfig`, `ConversionCommissionHandler`, `CommissionService`
all call `$this->conn->prepare($sql)` (private) and `$this->conn->executeChecked()` (deleted).
These are the same broken pattern — they were written against an old Connection API.
Fixing them clears 15 of the 18 baseline files (83 errors).

### 4. `class-dataengine.php` (59 calls) excluded from PHPStan
It's excluded because it's too broken to analyse. It should be replaced by
`MysqlDataEngineRepository` which already exists.

### 5. `config/connect2.php` (151 calls) is the global bootstrap
It defines `$db`, all legacy helpers, `rotateTrackerUrl`, `replaceTrackerPlaceholders`.
It cannot be deleted but can be progressively hollowed out.

---

## Proposed Phases

### Phase A — Fix broken repository files (PHPStan baseline -83 errors)
**Effort:** ~2h | **Risk:** Low | **Reward:** PHPStan baseline from 162→79

The 7 files all have the same broken pattern:
```php
// BROKEN — prepare() is private, executeChecked() doesn't exist
$stmt = $this->conn->prepare($sql);
$this->conn->bind($stmt, 's', [$val]);
$this->conn->executeChecked($stmt);
```
Fix to use the public API:
```php
$stmt = $this->conn->prepareWrite($sql);
$this->conn->bind($stmt, 's', [$val]);
$this->conn->execute($stmt);
```

**Files:**
- `config/Affiliate/AffiliateLinkService.php` (4 errors)
- `config/Affiliate/MysqlAffiliateRepository.php` (5 errors)
- `config/Commission/CommissionService.php` (4 errors)
- `config/Commission/MysqlCommissionRepository.php` (5 errors)
- `config/Offer/MysqlOfferRepository.php` (5 errors)
- `config/Margin/MarginConfig.php` (4 errors)
- `config/Margin/ConversionCommissionHandler.php` (4 errors)

Also fix `api/v2/app.php` (1 direct `$stmt->execute()` call).

**Acceptance:** PHPStan reports ≤79 baseline errors after this phase.

---

### Phase B — Migrate redirect hot path (dl.php, rtr.php, lp.php, off.php, offrtr.php)
**Effort:** ~1 day | **Risk:** Medium-high (production redirect path) | **Reward:** 168 legacy calls gone, transaction protection on all redirect writes

These 5 files are the sub-ms redirect path. They each:
1. Look up campaign/tracker/user (SELECT)
2. Write click + related tables (INSERT)
3. Redirect HTTP 302

**Strategy per file:**

`dl.php` (67 calls) — already has `LookupRepositoryFactory` + `ClickRepository`. Remaining work:
- Create `$conn` at top (same as record_simple.php pattern)
- Replace `$db->real_escape_string()` → `$conn->escape()`
- Replace `$db->query()` → `$conn->query()`
- Wrap all writes in `$conn->transaction()`

`rtr.php` (60 calls) — no repo usage yet. Needs:
- Add `LookupRepositoryFactory` at top
- Same `$conn->escape()` / `$conn->query()` replacement
- `$conn->transaction()` around the write block

`lp.php` (13), `off.php` (15), `offrtr.php` (13) — same pattern, lower call count.

**Transaction boundary:** All INSERT/UPDATE calls within each file wrapped in a single
`$conn->transaction(fn() => { ... })` block. Any exception rolls back all 3-8 table writes.

**Acceptance:** Zero `$db->real_escape_string()` in `tracking_support/redirect/`. All writes transactional. Tests pass.

---

### Phase C — Migrate impression/postback static files (upx.php, gpb.php, gpx.php, px.php, pb.php)
**Effort:** ~4h | **Risk:** Low-medium | **Reward:** 100 legacy calls gone

`upx.php` (37) — pixel fire on conversion. Writes to `conversions`, `clicks`.
`gpb.php` (35) — global postback. Writes to `conversions`.
`gpx.php` (18) — global pixel. Writes to `conversions`.
`px.php` (6), `pb.php` (4) — simple pixel/postback.

Same `$conn->escape()` + `$conn->query()` + `$conn->transaction()` pattern.
These files are simpler than the redirect files — fewer tables, clearer write boundaries.

**Acceptance:** Zero `$db->real_escape_string()` in `tracking_support/static/`. Tests pass.

---

### Phase D — Hollow out connect2.php (151 calls)
**Effort:** ~1 day | **Risk:** High (145KB bootstrap) | **Reward:** Removes the biggest concentration of legacy SQL

`connect2.php` is the global bootstrap. It cannot be deleted but can be hollowed:

1. **`rotateTrackerUrl($db, $tracker_row)`** — already called from dl.php, rtr.php. Extract to `RotatorService` using `MysqlRotatorRepository`. 14 `real_escape_string` calls gone.
2. **`replaceTrackerPlaceholders($db, $url, $click_id)`** — pure string manipulation + 2 SELECT queries. Extract to `TrackerPlaceholderService`. ~8 calls gone.
3. **`PLATFORMS::get_device_info($db, ...)`** — already has `DeviceRepository`. Refactor to use it. ~20 calls gone.
4. **`FILTER::startFilter($db, ...)`** — fraud detection. Has no repository yet. Needs `FraudRepository` or inline with `Connection`. ~15 calls gone.
5. Remaining ~94 calls are in bootstrap logic that runs once per request — lower priority.

**Acceptance:** `connect2.php` `real_escape_string` count ≤ 60. `rotateTrackerUrl` + `replaceTrackerPlaceholders` + `PLATFORMS::get_device_info` use repositories.

---

### Phase E — Fix class-dataengine.php, remove from excludePaths
**Effort:** ~4h | **Risk:** Low (analytics path, not click recording) | **Reward:** PHPStan covers 59 more calls

`config/class-dataengine.php` is excluded from PHPStan because it calls `real_escape_string`
directly on `$this->db` (raw mysqli). `MysqlDataEngineRepository` already exists and wraps it.

Strategy:
1. Identify all callers of `class-dataengine.php`
2. Route them through `MysqlDataEngineRepository`
3. Remove `class-dataengine.php` from `excludePaths` in phpstan.neon
4. Fix any PHPStan errors that surface

**Acceptance:** `config/class-dataengine.php` removed from `excludePaths`. PHPStan still clean.

---

### Phase F — setup/, ajax/, account/ (non-hot-path admin UI)
**Effort:** ~2 days | **Risk:** Low (admin-only, not public-facing) | **Reward:** 444 legacy calls gone

These are the admin CRUD panels. They use `real_escape_string` heavily but are:
- Not in the public redirect/click path
- Behind authentication
- Touched infrequently

**Strategy:** Batch mechanical replacement file-by-file using the same `$conn->escape()` +
`$conn->query()` pattern. No repository abstractions needed — these are one-off CRUD forms.
Add a `Connection` at the top of each file, replace all `$db->real_escape_string()` and
`_mysqli_query()` calls, and move on.

**Priority order (by call count):**
1. `tracking_support/setup/text_ads.php` (32)
2. `tracking_support/setup/aff_campaigns.php` (31)
3. `tracking_support/setup/ppc_accounts.php` (29)
4. `tracking_support/ajax/` (195 calls across 42 files — do file-by-file)
5. `account/` (93 calls across 12 files)

**Acceptance:** Zero `real_escape_string` in `tracking_support/setup/`, `tracking_support/ajax/`, `account/`. Tests pass.

---

### Phase G — api/v1 and api/v2 legacy functions
**Effort:** ~4h | **Risk:** Medium (external API callers may exist) | **Reward:** 39 calls gone, baseline -2 files

`api/v1/functions.php` (23 calls) — legacy reporting API used by affiliates for CSV exports.
`api/v2/functions.php` (16 calls) — attribution API (Slim framework).
`api/v2/app.php` (1 direct `$stmt->execute()`) — fix as part of Phase A.

Both files build SQL via `real_escape_string`. They have no repositories. Since they are
external APIs, add a `Connection` and use `$conn->escape()` + `$conn->query()` rather
than a full repository rewrite (YAGNI — these are read-only reporting endpoints).

**Acceptance:** Zero `real_escape_string` in `api/v1/`, `api/v2/`. PHPStan baseline -2 files.

---

### Phase H — Clear PHPStan baseline to zero
**Effort:** ~2h | **Risk:** Low | **Reward:** PHPStan fully strict on all tracked files

After Phases A-G, the remaining baseline entries will be:
- `class.notFound` — 16 entries for excluded classes referenced from non-excluded files
  (e.g., `FilterEngine`, `ReportBasicForm` in `functions-tracking1ai.php`)
  Fix: either exclude those files or add stub class declarations for PHPStan
- `constant.notFound` — 10 entries in `l10n.php` (WordPress compat constants)
  Fix: add constant stubs to `phpstan-bootstrap.php`
- `function.notFound`, `identical.alwaysFalse` etc — fix each at source

**Acceptance:** `phpstan-baseline.neon` deleted. PHPStan reports 0 errors with no baseline.

---

## Prioritization

```
Priority  Phase  Effort   Risk     Reward
────────────────────────────────────────────────────
1         A      2h       Low      83 baseline errors fixed, 7 repo files clean
2         B      1d       Med-Hi   168 legacy calls + transaction protection
3         C      4h       Low-Med  100 legacy calls + transaction protection
4         E      4h       Low      class-dataengine.php under PHPStan
5         D      1d       High     151-call connect2.php hollowed
6         F      2d       Low      444 legacy calls (admin UI)
7         G      4h       Med      39 legacy calls in legacy APIs
8         H      2h       Low      PHPStan baseline → 0
────────────────────────────────────────────────────
Total     ~6d    Mixed    ~1,100 legacy call sites eliminated
```

---

## Risk Register

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| `$conn->escape()` behavioral difference from `real_escape_string` | Very Low | High | They call the same underlying function — zero difference |
| Losing memcache cache on SELECT migration | Low | Medium | Cache is per-request TTL=3min; most queries are one-off per request anyway |
| Transaction rollback revealing previously-silent partial writes | Medium | Medium | This surfaces existing bugs — it's correct behavior, not a regression |
| connect2.php extraction breaking global function callers | Medium | High | Extract one function at a time, test after each extraction |
| class-dataengine.php PHPStan errors when un-excluded | Medium | Low | 59 calls → fix before removing from excludePaths |

---

## Success Criteria

| Metric | Current | Target |
|---|---|---|
| `real_escape_string` calls | ~1,122 | 0 |
| `_mysqli_query` calls | ~400 | 0 |
| `global $db` usages | ~58 | 0 |
| PHPStan baseline | 162 errors | 0 errors |
| Files with zero transaction on multi-table write | 7 | 0 |
| Test count | 805 pass | ≥805 pass |
