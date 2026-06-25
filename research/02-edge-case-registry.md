# 02 — Edge Case Registry: Smart Link Generator

## Traffic Origin

### EC-001: Platform Review Bot with Residential IP
**Category:** Traffic Origin
**Description:** Facebook/Meta now uses real residential IPs for ad review. The reviewer visits the offer URL with a clean residential IP, standard Chrome UA, and no obvious bot signals. If they see the actual offer (adult, crypto, gambling), the ad account gets banned.
**Current industry handling:** Affiliates manually maintain IP blacklists updated from community-shared lists. Voluum/BeMob have no automated solution.
**Proposed superior handling:** Platform-aware review mode with community-updated IP range DB + behavioral JS fingerprint challenge. Residential IP alone is not enough to pass — must also pass canvas/WebGL/screen checks.
**Implementation complexity:** L
**Priority:** P0

### EC-002: Cloaker-Aware Review Systems
**Category:** Traffic Origin
**Description:** Meta/Google/TikTok review systems now randomize their UA, headers, and even execute JavaScript to detect cloaking. They check if the page renders differently on subsequent visits from different profiles.
**Current industry handling:** Static cloaking rules fail. Affiliates use third-party cloaking services (custom PHP/JS) that are expensive and fragile.
**Proposed superior handling:** Multi-layer classification that doesn't rely on static UA/header matching. Use probabilistic scoring combining IP, UA, referer, JS fingerprint, and behavioral signals. If confidence < threshold, serve canary page.
**Implementation complexity:** L
**Priority:** P0

### EC-003: CGNAT / Carrier-Grade NAT
**Category:** Traffic Origin
**Description:** Mobile carriers in SEA, LATAM, Africa route thousands of users through a single public IP. IP-based bot detection flags the entire IP as suspicious when one bad actor shares it. Real users get false-positive blocked.
**Current industry handling:** None. All trackers use IP-based rules that fail on CGNAT.
**Proposed superior handling:** Detect CGNAT ranges (major ISPs). For CGNAT IPs, switch from IP-only to composite key: `hash(ip + ua + accept-language + screen-res)`. Don't block CGNAT IPs on IP reputation alone.
**Implementation complexity:** M
**Priority:** P0

### EC-004: IPv6 with Incomplete ASN Coverage
**Category:** Traffic Origin
**Description:** IPv6 traffic where ASN databases have incomplete coverage. Datacenter/VPN detection fails because the ASN isn't in the database.
**Current industry handling:** Most trackers ignore IPv6 or treat it as unknown.
**Proposed superior handling:** Fall back to other signals (UA, referer, JS fingerprint) when ASN lookup fails. Don't rely solely on IP intelligence.
**Implementation complexity:** S
**Priority:** P1

### EC-005: Premium VPN with Residential IPs
**Category:** Traffic Origin
**Description:** VPNs like NordVPN, ExpressVPN now offer residential IP pools. These IPs look like real residential users. Traditional VPN detection fails.
**Current industry handling:** None. These IPs pass all current filters.
**Proposed superior handling:** Combine IP check with other signals. A residential IP with no referer + empty JS fingerprint + instant page load = suspicious. Probabilistic scoring handles this naturally.
**Implementation complexity:** M
**Priority:** P1

### EC-006: In-App Browser Traffic
**Category:** Traffic Origin
**Description:** Facebook IAB, TikTok IAB, Instagram IAB have non-standard or missing UA strings. Some don't send referer. Some execute JS differently. Tracking breaks silently.
**Current industry handling:** Trackers treat IAB as regular mobile traffic. Some misclassify IAB as bot.
**Proposed superior handling:** Detect IAB patterns in UA (e.g., "FBAN", "FBAV", "TikTok"). Route IAB traffic with relaxed referer requirements. Don't penalize missing referer for IAB.
**Implementation complexity:** S
**Priority:** P1

### EC-007: Googlebot with JS Rendering
**Category:** Traffic Origin
**Description:** Google's crawler now executes JavaScript. A canary page that redirects via JS will be followed by Googlebot. The crawler sees the actual offer URL.
**Current industry handling:** None. JS-based cloaking fails against modern Googlebot.
**Proposed superior handling:** Detect Googlebot by IP range (verified Google IPs) + UA. Don't rely on JS-only detection. Serve safe page at server level before any JS executes.
**Implementation complexity:** M
**Priority:** P0

### EC-008: Manual Platform Policy Reviewer
**Category:** Traffic Origin
**Description:** A human reviewer at Meta/Google uses a clean residential IP + standard Chrome + VPN. They manually visit the offer URL to check compliance.
**Current industry handling:** Manual IP blacklists. Unreliable.
**Proposed superior handling:** Platform-aware review mode. When active, apply stricter fingerprinting. A real human will pass JS fingerprint + behavioral checks. A reviewer tool may not.
**Implementation complexity:** L
**Priority:** P0

---

## Referer

### EC-009: Referer Stripped by HTTPS→HTTP Redirect
**Category:** Referer
**Description:** When traffic flows from HTTPS to HTTP, the referer is stripped by browsers. This is normal for push notification and email traffic.
**Current industry handling:** Most trackers flag empty referer as suspicious. This breaks push/email campaigns.
**Proposed superior handling:** Empty referer is a signal to evaluate IN CONTEXT, not a standalone block reason. Combine with UA, IP, and other signals. Push traffic with mobile UA + residential IP + empty referer = normal.
**Implementation complexity:** S
**Priority:** P1

### EC-010: Meta's Link Shim Referer
**Category:** Referer
**Description:** Meta wraps all external URLs in `l.facebook.com` redirect. The referer becomes `l.facebook.com` instead of the actual ad/post URL. This is normal Meta behavior, not cloaking.
**Current industry handling:** Trackers recognize `l.facebook.com` as Meta traffic.
**Proposed superior handling:** Map known platform referer patterns to expected behavior. `l.facebook.com` = Meta traffic, not suspicious.
**Implementation complexity:** S
**Priority:** P2

### EC-011: Spoofed Referer
**Category:** Referer
**Description:** Bots fake a valid ad network referer header to appear legitimate. They set referer to `https://www.facebook.com/` or `https://google.com/`.
**Current industry handling:** Basic referer checks pass these bots.
**Proposed superior handling:** Cross-validate referer with other signals. A bot with Facebook referer + datacenter IP + headless UA = suspicious. The referer alone is not trustworthy.
**Implementation complexity:** M
**Priority:** P1

### EC-012: Push Notification Traffic (No Referer)
**Category:** Referer
**Description:** Push notification traffic inherently has no referer. This is normal and expected.
**Current industry handling:** Some trackers block empty referer, breaking push campaigns.
**Proposed superior handling:** If traffic source is configured as "push", relax referer requirements. Context-aware rules.
**Implementation complexity:** S
**Priority:** P1

---

## Geo & Device

### EC-013: Satellite Internet (Starlink) Geo Mismatch
**Category:** Geo/Device
**Description:** Starlink users' IP geo doesn't match physical location. A user in Indonesia might get a Singapore IP.
**Current industry handling:** None. Geo-targeting fails silently.
**Proposed superior handling:** Accept-Language header + browser timezone as secondary geo signals. If IP says SG but Accept-Language says `id-ID` and timezone is `Asia/Jakarta`, the user is likely in Indonesia.
**Implementation complexity:** M
**Priority:** P2

### EC-014: Corporate VPN Exit Node
**Category:** Geo/Device
**Description:** Employee in US accesses through EU VPN exit node. IP says Netherlands, user is in California.
**Current industry handling:** Geo-targeting routes to EU offer, which is wrong.
**Proposed superior handling:** Composite geo signal: IP + Accept-Language + timezone + JS-detected timezone. Weight JS timezone highest when available.
**Implementation complexity:** M
**Priority:** P2

### EC-015: Mobile Roaming
**Category:** Geo/Device
**Description:** User roaming abroad. SIM country ≠ IP country. Carrier proxy routes through home country.
**Current industry handling:** None specific.
**Proposed superior handling:** Accept carrier proxy as normal. Use IP geo as primary, Accept-Language as secondary.
**Implementation complexity:** S
**Priority:** P2

### EC-016: WebView with Missing UA
**Category:** Geo/Device
**Description:** iOS/Android WebView apps sometimes send incomplete or non-standard UA strings. Device detection fails.
**Current industry handling:** Classified as "unknown" device.
**Proposed superior handling:** Detect WebView patterns. Treat WebView as mobile with relaxed UA requirements.
**Implementation complexity:** S
**Priority:** P2

---

## Timing & Behavioral

### EC-017: Legitimate Traffic Burst
**Category:** Timing
**Description:** Viral content or flash sale creates a sudden spike in clicks from the same geo/device. Looks like a bot attack but is real.
**Current industry handling:** Velocity rules fire false positives. Traffic gets blocked.
**Proposed superior handling:** Velocity rules should consider device diversity. 1000 clicks from same IP but 500 different UAs = likely CGNAT real users, not bot.
**Implementation complexity:** M
**Priority:** P1

### EC-018: Delayed Platform Review (48h+)
**Category:** Timing
**Description:** Ad is approved, but platform review crawl happens 48+ hours later. The cloaking rules may have changed, or the safe page may be down.
**Current industry handling:** Static cloaking rules don't account for delayed reviews.
**Proposed superior handling:** Keep safe pages persistent and always available. Don't time-gate cloaking rules.
**Implementation complexity:** S
**Priority:** P1

### EC-019: Postback Delay (Nutra Rebill)
**Category:** Timing
**Description:** Conversion fires 7-30 days after click (nutra rebill). Click ID must remain valid for weeks.
**Current industry handling:** Click ID TTL varies. Some trackers expire after 30 days.
**Proposed superior handling:** Configurable click ID TTL per offer. Default 90 days.
**Implementation complexity:** S
**Priority:** P1

### EC-020: Duplicate Postback
**Category:** Timing
**Description:** Affiliate network retries postback on timeout. Double conversion recorded.
**Current industry handling:** Some trackers dedup on click_id + offer_id. Others don't.
**Proposed superior handling:** HMAC-signed click IDs. Idempotency key on click_id + offer_id + conversion_time window.
**Implementation complexity:** M
**Priority:** P0

---

## Security

### EC-021: Slug Enumeration
**Category:** Security
**Description:** Attacker brute-forces all 6-char slugs to map offers. Reveals offer URLs and campaign structure.
**Current industry handling:** Rate limiting at infrastructure level (nginx/Cloudflare).
**Proposed superior handling:** Rate limit + slug entropy increase (8+ chars) + random delay on invalid slugs to slow enumeration.
**Implementation complexity:** M
**Priority:** P1

### EC-022: Postback Forgery
**Category:** Security
**Description:** Third party fires fake conversions to inflate payout. Simple POST to postback URL with guessed click_id.
**Current industry handling:** Basic token check (Binom). Others do nothing.
**Proposed superior handling:** HMAC-SHA256 signed click IDs. Verify signature on every postback. Reject forged postbacks cryptographically.
**Implementation complexity:** M
**Priority:** P0

### EC-023: X-Forwarded-For Spoofing
**Category:** Security
**Description:** Attacker spoofs X-Forwarded-For header to bypass IP-based rules. Can impersonate any IP.
**Current industry handling:** Some trackers use first XFF value. Others use req.ip (Express).
**Proposed superior handling:** Trust only the leftmost XFF value added by YOUR infrastructure (nginx/Cloudflare). Ignore client-supplied XFF.
**Implementation complexity:** S
**Priority:** P1

### EC-024: Redis Failure During Redirect
**Category:** Security
**Description:** Redis goes down during redirect processing. Decision engine can't load cached rules.
**Current industry handling:** Varies. Some fail open, some fail closed, some crash.
**Proposed superior handling:** **Fail open** for redirects — never break user experience. Fall back to basic rules from in-memory cache. Log the failure.
**Implementation complexity:** M
**Priority:** P0

### EC-025: Open Redirect Abuse
**Category:** Security
**Description:** If safelink_url is user-controlled input, attacker can use it for phishing/redirect attacks.
**Current industry handling:** Basic URL validation.
**Proposed superior handling:** Safelink URLs must be pre-validated and stored in DB. Never accept arbitrary URLs from request params.
**Implementation complexity:** S
**Priority:** P1
