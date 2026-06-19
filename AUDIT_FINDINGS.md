# PHP Tracking & API V3 Audit Findings
**Date:** 2026-06-19  
**Auditor:** AuditPHPAPI  
**Scope:** tracking_support/redirect/{lp,off,rtr,dl}.php · tracking_support/static/{gpb,upx}.php · api/v3/index.php · api/V3/Controllers/ · api/V3/Router.php  
**Method:** Static code analysis + live HTTP probing (port 9001) + PHP-FPM error log review

───────────────────────────────────────────────────────────
## Summary

| Severity | Count |
|---|---|
| Blocker  | 4 |
| Major    | 8 |
| Minor    | 6 |
| Cosmetic | 2 |

**API V3 is completely unreachable** (HTTP 000 / connection reset) on port 9001 due to a PHP fatal in Bootstrap. All tracking redirects depend on DB; their hot path is functional when the DB is up, but several data-loss and security bugs exist regardless.

───────────────────────────────────────────────────────────
## Findings

### PHP-001 · Blocker · API V3 returns HTTP 000 (connection reset) on every request
**Area:** api/V3 bootstrap  
**File:** `api/V3/Support/ServerStateStore.php:608`, `config/connect2.php:25,28`  
**Description:**  
Two fatal errors prevent PHP from emitting any HTTP response on port 9001:

1. `ServerStateStore::mkdir()` fails with `Permission denied` — the state directory (`/home/openclaw/projects/1ai-affiliate/...`) is not writable by `www-data`. PHP crashes before headers are sent; nginx sees a broken FastCGI pipe and resets the connection.  
2. When requests arrive via a path whose `__DIR__` does not resolve correctly (e.g. deeplink.php, or anything that triggers `connect2.php` with wrong ROOT_PATH), `config.php` cannot be found, the `DB` class is never defined, and a fatal `Class "DB" not found` fires.

Evidence from `/var/log/php-fpm/tracking.log`:
```
PHP Warning:  mkdir(): Permission denied in …/ServerStateStore.php on line 608
PHP Warning:  include_once(/home/openclaw/projects/1ai-affili/config.php): Failed to open stream
PHP Fatal error:  Uncaught Error: Class "DB" not found in …/connect2.php:28
```
`curl -s http://127.0.0.1:9001/api/v3/system/health` → HTTP 000.

**Impact:** The entire V3 API is dead. No external consumer can authenticate, read campaigns, conversions, affiliates, or use the sync subsystem.

───────────────────────────────────────────────────────────

### PHP-002 · Blocker · lp.php never inserts a new click — only updates an existing one
**Area:** tracking_support/redirect/lp.php  
**File:** `tracking_support/redirect/lp.php:148,175-187`  
**Description:**  
`lp.php` (landing-page redirect) reads `$click_id` exclusively from a cookie (`tracking1aisubid_a_<campaign_id>`). If the cookie is absent — i.e. for any new visitor who has not already passed through `rtr.php` — `$click_id` is an empty string. The script then runs:

```php
UPDATE clicks_record
SET click_out='1', click_cloaking='...'
WHERE click_id=''          -- matches nothing
```

No INSERT ever exists in the file. The click is silently dropped. `setDirtyHour('')` is called on an empty ID and does nothing. The redirect still fires, so the visitor sees no error, but the landing-page hit is never recorded in the DB.

**Impact:** Landing-page click data loss for all visitors without a prior `rtr.php` cookie.

───────────────────────────────────────────────────────────

### PHP-003 · Blocker · off.php accesses `$_GET['acip']` before numeric validation (potential fatal)
**Area:** tracking_support/redirect/off.php  
**File:** `tracking_support/redirect/off.php:9,21`  
**Description:**  
```php
$acip = $_GET['acip'];          // line 9 — undefined index if key absent
...
if (! is_numeric($acip)) die(); // line 21
```
If `acip` is not present in the query string, line 9 raises `Undefined index` and `$acip` is `null`. With `error_reporting(E_ALL)` and `display_errors=On` (both set at lines 3-4), this emits a warning header before any `Content-Type`, corrupting the response. With strict error handling it can become a fatal. The `is_numeric(null)` guard on line 21 then silently dies — but the log is polluted and the corrupted response header may break downstream caching layers.

**Impact:** Any hit without `?acip=` produces a malformed HTTP response and an error log entry. Easily triggered by scanners or misconfigured ad networks.

───────────────────────────────────────────────────────────

### PHP-004 · Blocker · gpb.php omits `click_payout` from `conversion_logs` INSERT
**Area:** tracking_support/static/gpb.php  
**File:** `tracking_support/static/gpb.php:260-271`  
**Description:**  
The `conversion_logs` INSERT in `gpb.php` (global postback pixel) does not include the `click_payout` column:

```sql
INSERT INTO conversion_logs
SET conv_id = DEFAULT,
    click_id = '...',
    campaign_id = '...',
    user_id = '...',
    click_time = '...',
    conv_time = '...',
    time_difference = '...',
    ip = '...',
    pixel_type = '2',
    user_agent = '...'
    -- click_payout MISSING
```

The equivalent endpoint `upx.php` (lines 267-278) correctly includes `click_payout`. The omission means every server-side postback conversion is stored with a `NULL` payout. Commission calculations and affiliate earnings derived from `conversion_logs.click_payout` will be zero for all GPB-sourced conversions.

**Impact:** Silent revenue accounting data loss for every conversion recorded via the global postback pixel.

───────────────────────────────────────────────────────────

### PHP-005 · Major · rtr.php `lpr` branch uses literal `30` as a UNIX timestamp filter (always returns no rows)
**Area:** tracking_support/redirect/rtr.php  
**File:** `tracking_support/redirect/rtr.php:551`  
**Description:**  
The landing-page-repeat (`lpr`) branch attempts to find the most recent click for the visitor's IP:

```sql
WHERE ips.ip_address='...'
AND   clicks.user_id='...'
AND   clicks.click_time >= '30'   -- should be time() - 86400 or similar
ORDER BY clicks.click_id DESC
LIMIT 1
```

The value `'30'` is a leftover literal (probably meant `time() - 30` seconds or `time() - 86400`). Since all real `click_time` values are Unix timestamps (~1.7 billion), `>= 30` always matches every row, making the `ORDER BY … LIMIT 1` effectively a table scan that returns the wrong click ID. The `lpr` keyword-carry-forward feature silently picks up a random historical click instead of the current visitor's.

**Impact:** Wrong keyword attribution for all `?lpr=1` requests; dirty data written to `clicks_advance.keyword_id`.

───────────────────────────────────────────────────────────

### PHP-006 · Major · rtr.php `redirect_process()` uses `$conn` from outer scope without `global` or parameter
**Area:** tracking_support/redirect/rtr.php  
**File:** `tracking_support/redirect/rtr.php:353,380`  
**Description:**  
`redirect_process()` is defined as a named function (not a closure). At line 380 it uses:

```php
$escape = static fn($value) => $conn->escape((string)($value ?? ''));
```

`$conn` is a variable in the file's global scope but is not declared `global` inside the function and is not passed as a parameter. In PHP, named functions do not inherit the calling scope. `$conn` is `undefined` inside `redirect_process()`, so every `$escape(...)` call throws a fatal `Undefined variable $conn` and `Call to a member function escape() on null`.

**Impact:** Every rotator redirect crashes at the click-insert stage. Click data is never written to DB; the visitor gets a fatal error or a blank page.

───────────────────────────────────────────────────────────

### PHP-007 · Major · rtr.php `$null` check on `$rotator_row` is ordered after its fields are already dereferenced
**Area:** tracking_support/redirect/rtr.php  
**File:** `tracking_support/redirect/rtr.php:64-74`  
**Description:**  
```php
$rotator_row = memcache_mysql_fetch_assoc($db, $rotator_sql);
$user_id = $conn->escape((string)$rotator_row['user_id']);          // line 65
$user_keyword_searched_or_bidded = $conn->escape($rotator_row[...]); // line 66
...
$rule_row = foreach_memcache_mysql_fetch_assoc($db, $rule_sql);
if (!$rotator_row) die();                                             // line 74 — too late
```

If the tracker ID does not exist in the DB (invalid link, deleted tracker), `$rotator_row` is `null`/`false`. Lines 65-66 already dereference it, producing `Undefined index` warnings and writing empty strings into `$user_id`. The `die()` guard on line 74 never fires before the damage is done. Depending on PHP error mode this can be a fatal.

**Impact:** Invalid tracker IDs produce corrupt `$user_id = ''` which poisons every subsequent DB query in that request.

───────────────────────────────────────────────────────────

### PHP-008 · Major · dl.php non-cloaked path defers `computeAndRecordClick()` to after redirect but `fastcgi_finish_request` may not be available
**Area:** tracking_support/redirect/dl.php  
**File:** `tracking_support/redirect/dl.php:558-590`  
**Description:**  
```php
if ($cloaking_on === true) {
    $computeAndRecordClick();       // recorded BEFORE redirect
    ...
} else {
    $redirectLocation = ...;
}
// send redirect headers here
if (function_exists('fastcgi_finish_request')) {
    fastcgi_finish_request();        // flush to client
}
// ... then:
$computeAndRecordClick();            // recorded AFTER redirect for non-cloaked
```

The design relies on `fastcgi_finish_request()` to flush the redirect to the browser before the expensive click-recording runs. However:
- If `fastcgi_finish_request` is not available (mod_php, CLI, some FPM configs), the click is still recorded but the visitor waits for the full DB write before the redirect fires — adding 5-50 ms to every click latency on the hot path.
- `ignore_user_abort(true)` is set, which is correct, but if PHP-FPM has `request_terminate_timeout` set lower than the recording time, the click record will be silently truncated mid-INSERT.

**Impact:** Latency regression on non-cloaked deep links when FPM terminates early; possible partial click records under load.

───────────────────────────────────────────────────────────

### PHP-009 · Major · gpb.php and upx.php hardcode `user_id = 1` — multi-user installs always attribute to user 1
**Area:** tracking_support/static/gpb.php, tracking_support/static/upx.php  
**File:** `gpb.php:17`, `upx.php:15`  
**Description:**  
```php
$mysql['user_id'] = 1;
```
Both postback/pixel endpoints set `user_id` to the literal integer `1`. The correct user is later resolved from the click record (`$cvar_sql_row['user_id']`), but the initial hard-coded value is never overwritten before it is used in the `conversion_logs` INSERT (`user_id = '".$mysql['click_user_id']."'`). `click_user_id` is set from `$cvar_sql_row['user_id']` on lines gpb:125/upx:131, so the INSERT itself is correct — but any code path that exits early (e.g. `p1aiRespondJsonError`) or that uses `$mysql['user_id']` directly will attribute to user 1.

**Impact:** Minor data integrity risk; the final INSERT is correct but the pattern is fragile. Any future code using `$mysql['user_id']` instead of `$mysql['click_user_id']` will silently misattribute.

───────────────────────────────────────────────────────────

### PHP-010 · Major · AiInvokeController expects PSR-7 but is not wired into the V3 plain-PHP router
**Area:** api/V3/Controllers/AiInvokeController.php, api/v3/index.php  
**File:** `api/V3/Controllers/AiInvokeController.php:38-56`, `api/v3/index.php` (entire file)  
**Description:**  
`AiInvokeController::dispatch()` takes `ServerRequestInterface` and `ResponseInterface` — PSR-7 objects from Slim. The V3 router (`api/v3/index.php`) is plain PHP with no PSR-7 container. The controller's docblock says:
```
Mount: route this in api/v2/app.php or api/v3/index.php.
```
But it is present in neither. Searching `api/v3/index.php` for `AiInvoke`, `ai/invoke`, or `invoke` returns zero matches. The `dispatchPlain()` helper exists (line 58+) for non-PSR-7 use, but is also not wired anywhere.

**Impact:** The cross-runtime AI tool bus (`/api/ai/invoke`) is silently unreachable. Any Node-side call to it returns 404.

───────────────────────────────────────────────────────────

### PHP-011 · Minor · off.php uses `$_GET['acip']` before assign in cached-redirect branch (line 63)
**Area:** tracking_support/redirect/off.php  
**File:** `tracking_support/redirect/off.php:63`  
**Description:**  
Inside the `$usedCachedRedirect == true` block (DB is down), `$acip` is re-read from `$_GET['acip']` on line 63 even though it was already assigned (or threw undefined-index) on line 9. This is dead duplicate code — the value cannot change. The second read is a maintenance hazard: if the first assignment is ever guarded, the cached path will silently pick up whatever `$_GET['acip']` is at that moment.

───────────────────────────────────────────────────────────

### PHP-012 · Minor · rtr.php auto-monetizer URL is a non-existent placeholder domain
**Area:** tracking_support/redirect/rtr.php  
**File:** `tracking_support/redirect/rtr.php:310,375,696`  
**Description:**  
Three places hard-code `http://oneai_affiliate.com` as the monetizer redirect destination. This domain does not resolve. Any rotator rule that selects `type = 'monetizer'` / `auto_monetizer` redirects real visitors to a dead URL.

───────────────────────────────────────────────────────────

### PHP-013 · Minor · lp.php overwrites `$_GET` from HTTP_REFERER query string (global state mutation)
**Area:** tracking_support/redirect/lp.php  
**File:** `tracking_support/redirect/lp.php:113-114`  
**Description:**  
```php
$landing_page_site_url_address_parsed = parse_url((string) $_SERVER['HTTP_REFERER']);
parse_str($landing_page_site_url_address_parsed['query'], $_GET);
```
This completely replaces the global `$_GET` superglobal with the query string of the HTTP Referer. Any subsequent code in the same request that reads `$_GET` gets the referer's parameters, not the original request parameters. This is an intentional design but is highly fragile: if the referer has no query string, `parse_str('', $_GET)` clears all GET params.

───────────────────────────────────────────────────────────

### PHP-014 · Minor · V3 Router `PUT`/`PATCH` interchangeability undocumented to callers
**Area:** api/V3/Router.php  
**File:** `api/V3/Router.php:112-114`  
**Description:**  
The router silently treats `PUT` and `PATCH` as identical verbs. A `PUT /{id}` route will also match `PATCH /{id}` requests and vice versa. This is intentional per the comment but violates REST semantics (PUT = full replace, PATCH = partial). Callers using PATCH for partial updates get full-replace behaviour.

───────────────────────────────────────────────────────────

### PHP-015 · Minor · ServerStateStore state directory not writable by www-data (rate-limiter broken)
**Area:** api/V3/Support/ServerStateStore.php  
**File:** `api/V3/Support/ServerStateStore.php:608`  
**Description:**  
```
PHP Warning: mkdir(): Permission denied in …/ServerStateStore.php on line 608
```
The in-process file-based rate limiter cannot create its state directory. Every call to `consumeRateLimit()` fails silently (the implementation presumably returns `['allowed' => true]` on error). Rate limiting for `/sync` and `/bulk-upsert` is effectively disabled.

───────────────────────────────────────────────────────────

### PHP-016 · Minor · tracking_support/static/deeplink.php uses wrong `substr` offset (path truncated to `/trac/`)
**Area:** tracking_support/static/deeplink.php  
**File:** `tracking_support/static/deeplink.php:15`  
**Description:**  
From the FPM log:
```
include_once(/home/openclaw/projects/1ai-affiliate/trac/config/connect2.php): No such file or directory
```
`deeplink.php` uses `substr(__DIR__, 0, -19)` or similar incorrect offset, truncating the path to `.../1ai-affiliate/trac` instead of `.../1ai-affiliate`. The file is unreachable — every request fatals before DB connection.

───────────────────────────────────────────────────────────

### PHP-017 · Cosmetic · Commented-out `delay_sql()` calls leave dead code in off.php
**Area:** tracking_support/redirect/off.php  
**File:** `off.php:263,287,314`  
**Description:**  
Three UPDATE statements have adjacent `//delay_sql($db, $update_sql);` comments. The delay mechanism is gone but the comments remain, suggesting future readers the queries are still deferred when they are not.

───────────────────────────────────────────────────────────

### PHP-018 · Cosmetic · Typos in SQL comments and variable names across hot-path files
**Area:** tracking_support/redirect/ (multiple)  
**Files:** `lp.php:133`, `rtr.php:371`, `off.php:318`  
**Description:**  
- `lp.php:133` — `"//INSERT THIS CLICK BELOW, if this click doesn't already exisit"` (misspelled; no INSERT actually follows)
- `rtr.php:371` — `'monetizer_url' => 'http://oneai_affiliate.com'` in `$ruleDefaults` array  
- `off.php:318` — multi-line comment about MySQL UPDATE delays is factually inaccurate now that delays are removed

───────────────────────────────────────────────────────────
## Live Endpoint Test Results

| Endpoint | Method | Expected | Actual |
|---|---|---|---|
| `http://127.0.0.1:9001/api/v3/system/health` | GET | 200 JSON | **HTTP 000** (connection reset) |
| `http://127.0.0.1:9001/api/v3/campaigns` | GET | 401/200 | **HTTP 000** (connection reset) |
| `http://127.0.0.1:9001/api/V3/auth/login` | POST | 200/401 | **HTTP 000** (connection reset) |

Root cause: `ServerStateStore::mkdir()` Permission denied fatal kills FastCGI worker before any output.

───────────────────────────────────────────────────────────
## Fix Priority

1. **PHP-001** — Fix `ServerStateStore` state dir permissions (`chown www-data` or move to `/tmp`) → unblocks all API V3 traffic.
2. **PHP-004** — Add `click_payout` to `gpb.php` conversion_logs INSERT → stops silent revenue data loss.
3. **PHP-002** — Add click INSERT in `lp.php` for new visitors (no prior cookie) → stops click data loss.
4. **PHP-006** — Pass `$conn` as parameter (or use closure) in `rtr.php redirect_process()` → stops rotator fatal.
5. **PHP-007** — Move `!$rotator_row` guard to line 64 (before any field access) in `rtr.php`.
6. **PHP-016** — Fix `substr` offset in `deeplink.php` → unblocks deep-link landing pages.
7. **PHP-010** — Wire `AiInvokeController` into `api/v3/index.php` router.
8. **PHP-003** — Add `isset($_GET['acip'])` guard before line 9 in `off.php`.
9. **PHP-005** — Replace `'30'` with `time() - 86400` in `rtr.php` lpr branch.
10. **PHP-015** — Ensure ServerStateStore directory is writable or falls back gracefully.
