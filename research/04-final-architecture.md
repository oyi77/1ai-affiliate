# 04 — Final Architecture: Smart Link Generator

## Component Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                        EDGE LAYER                                    │
│  GET /:slug  →  Smart Redirect Handler                               │
│  ┌──────────┐   ┌──────────────┐   ┌─────────────┐                  │
│  │ IP Intel │   │ UA/Fingerprint│   │ Referer Map │                  │
│  │ (MaxMind)│   │ (DeviceTrack) │   │ (Platform)  │                  │
│  └────┬─────┘   └──────┬───────┘   └──────┬──────┘                  │
│       └────────────────┼──────────────────┘                          │
│                        ▼                                             │
│              ┌─────────────────┐                                     │
│              │ Decision Engine │                                     │
│              │ (Probabilistic  │                                     │
│              │  Scoring 0-100) │                                     │
│              └────────┬────────┘                                     │
│                       ▼                                              │
│  ┌──────────┬──────────┬──────────┬──────────┐                      │
│  │offer_page│safe_page │clean_lp  │ canary   │                      │
│  │(real user)│(crawler) │(suspicious)│(JS check)│                    │
│  └──────────┴──────────┴──────────┴──────────┘                      │
│                        │                                             │
│                        ▼                                             │
│              ┌─────────────────┐                                     │
│              │ Click Logger    │                                     │
│              │ (async, non-    │                                     │
│              │  blocking)      │                                     │
│              └────────┬────────┘                                     │
│                       │                                              │
│       ┌───────────────┼───────────────┐                              │
│       ▼               ▼               ▼                              │
│  ┌─────────┐   ┌──────────────┐  ┌──────────────┐                  │
│  │ MySQL   │   │ 1ai_click_   │  │ 1ai_fraud_   │                  │
│  │ (clicks)│   │ enrichment   │  │ log          │                  │
│  └─────────┘   └──────────────┘  └──────────────┘                  │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                        POSTBACK LAYER                                │
│  GET/POST /postback?click_id=XXX&payout=1.50                        │
│  ┌─────────────────┐                                                │
│  │ HMAC Verifier   │ ← Verify click_id signature                    │
│  │ (SHA256 + salt) │                                                │
│  └────────┬────────┘                                                │
│           ▼                                                         │
│  ┌─────────────────┐   ┌──────────────┐                            │
│  │ Idempotency     │ ← Dedup on       │                            │
│  │ Check           │   click_id+offer  │                            │
│  └────────┬────────┘   └──────────────┘                            │
│           ▼                                                         │
│  ┌─────────────────┐                                                │
│  │ Conversion Log  │ → 1ai_conversion_logs                          │
│  └─────────────────┘                                                │
└─────────────────────────────────────────────────────────────────────┘
```

## Data Flow: Decision Paths

### Path 1: Real User → Offer Page
```
Request → IP lookup (MaxMind, sync) → UA parse (regex, sync)
→ Referer map (in-memory, sync) → Score calculation (in-memory, sync)
→ Score < threshold → Record click (async) → 302 to offer URL
Latency: ~5-8ms
```

### Path 2: Crawler/Bot → Safe Page
```
Request → IP lookup → UA parse → Bot UA detected → Score >= threshold
→ Log as bot (async) → 302 to safe URL (Google/Facebook/news)
Latency: ~3-5ms
```

### Path 3: Suspicious → Canary Page
```
Request → IP lookup → UA parse → Score in middle range
→ Serve canary HTML with JS fingerprint challenge
→ JS executes → collects canvas/WebGL/screen → redirects with fingerprint
→ Second request → re-score with fingerprint data → if passes → offer page
Latency: ~5ms server + 1.5s client JS
```

### Path 4: Platform Reviewer → Safe Page
```
Request → IP lookup → matches platform reviewer IP range
→ Platform-aware mode active → Score >= threshold
→ 302 to platform-specific safe URL (Facebook page for Facebook mode)
Latency: ~3-5ms
```

### Path 5: CGNAT User → Offer Page (with composite key)
```
Request → IP lookup → CGNAT range detected → switch to composite key
→ hash(ip + ua + accept-language) → check against composite cache
→ New composite = real user → Score < threshold
→ Record click (async) → 302 to offer URL
Latency: ~6-10ms
```

## Redis Key Schema

```
# Click dedup (TTL: 24h)
click:dedup:{ip_hash}:{campaign_id} → 1

# IP reputation cache (TTL: 1h)
ip:rep:{ip_hash} → { score, country, asn, last_seen }

# CGNAT composite key (TTL: 24h)
cgnat:fp:{composite_hash} → { clicks, first_seen, last_seen }

# Platform reviewer IP ranges (TTL: 24h, refreshed by cron)
platform:ips:{platform_name} → [ip_ranges]

# Protection preset cache (TTL: 5min)
preset:{link_id} → { config_json }

# HMAC secret per workspace (TTL: never, loaded at startup)
hmac:secret:{workspace_id} → secret_key

# Click ID → metadata (TTL: 90 days)
click:{click_id} → { ip_hash, offer_id, created_at, hmac_valid }
```

## Failure Mode Matrix

| Component | Failure | Behavior |
|-----------|---------|----------|
| Redis | Down | **Fail open** — use in-memory defaults, log warning |
| MySQL | Down | **Fail open** — redirect without logging, return 503 for API |
| MaxMind | DB corrupted | **Fail open** — skip IP intelligence, use UA/referer only |
| HMAC secret | Missing | **Fail closed** — reject postback, log error |
| Safe URL | Unreachable | Fall back to next URL in rotation pool |
| Canary JS | Blocked by CSP | Serve safe page instead (no redirect) |

## Latency Budget

| Step | Target | Notes |
|------|--------|-------|
| IP lookup (MaxMind) | 1-2ms | Synchronous file read |
| UA parse (regex) | <1ms | Pure in-memory |
| Referer map | <1ms | In-memory hash lookup |
| Score calculation | <1ms | In-memory weighted sum |
| Redis lookup (dedup) | 1-2ms | TCP roundtrip |
| Response (302) | <1ms | Header write |
| **Total** | **5-8ms** | **Well under 80ms target** |
