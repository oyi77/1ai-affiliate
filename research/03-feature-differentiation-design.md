# 03 — Feature Differentiation Design

## F-01: Probabilistic Real-User Scoring
**Decision:** BUILD
**Justification:** ALL competitors use binary pass/fail rules. This is the single biggest gap in the market. Probabilistic scoring (0-100) with configurable thresholds per offer eliminates false positives for push/mobile traffic while maintaining strong bot detection.
**Complexity:** M
**Edge cases addressed:** EC-001, EC-003, EC-005, EC-009, EC-011, EC-017
**Launch phase:** MVP
**Details:** Already implemented in `smartRedirectEngine.js` as `classifyVisitor()` returning `risk_score` (0-1). Need to expose as 0-100 integer with per-link threshold config.

## F-02: Behavioral JS Fingerprint Challenge
**Decision:** BUILD
**Justification:** Voluum has JS redirect but no active fingerprinting. No competitor checks canvas/WebGL/screen before redirect. This catches platform reviewers with residential IPs.
**Complexity:** M
**Edge cases addressed:** EC-001, EC-002, EC-008
**Launch phase:** MVP
**Details:** Already implemented as `generateCanaryScript()` in `smartRedirectEngine.js`. Needs frontend integration and per-link enable/disable.

## F-03: Adaptive Safelink Rotation
**Decision:** BUILD
**Justification:** All competitors use static safelink URLs. Adaptive rotation based on detected traffic type (Facebook bot → Facebook page, Google crawler → Google search, spy tool → decoy LP) is a clear differentiator.
**Complexity:** M
**Edge cases addressed:** EC-001, EC-002, EC-007, EC-008
**Launch phase:** MVP
**Details:** Already implemented in `smartRedirectEngine.js` with `PLATFORM_REFERERS` mapping and `SAFE_URLS` pool.

## F-04: Decoy LP Mode
**Decision:** DEFER (Roadmap)
**Justification:** Dynamic decoy LP generation per request is complex and requires vertical-specific templates. The canary page system (F-02) covers 80% of the value. Defer full decoy LP to V1.1.
**Complexity:** XL
**Edge cases addressed:** EC-002
**Launch phase:** Roadmap

## F-05: HMAC-Signed Click IDs
**Decision:** BUILD
**Justification:** Postback forgery is a real attack vector. Binom does basic token check; others do nothing. HMAC-SHA256 signed click IDs provide cryptographic verification.
**Complexity:** M
**Edge cases addressed:** EC-020, EC-022
**Launch phase:** MVP
**Details:** Need to implement HMAC signing on click ID generation and verification on postback endpoint.

## F-06: CGNAT-Aware Composite Fingerprinting
**Decision:** BUILD
**Justification:** This is a HUGE gap. Mobile traffic from SEA/LATAM (where affiliate marketing is massive) gets false-positive blocked by ALL trackers. CGNAT-aware composite fingerprinting solves this.
**Complexity:** M
**Edge cases addressed:** EC-003, EC-017
**Launch phase:** MVP
**Details:** Already have ASN detection. Need to add CGNAT range detection and composite key logic.

## F-07: Platform-Aware Review Mode
**Decision:** BUILD
**Justification:** No competitor automates this. Affiliates manually maintain IP blacklists. A per-campaign toggle for "Facebook Ads Mode" / "TikTok Ads Mode" with community-updated IP ranges is a clear differentiator.
**Complexity:** L
**Edge cases addressed:** EC-001, EC-002, EC-008
**Launch phase:** MVP
**Details:** Already have platform referer detection. Need to add IP range DB and per-campaign toggle.

## F-08: Traffic Quality Score API
**Decision:** BUILD
**Justification:** Voluum has reporting UI but no quality score API. Programmatic access to quality metrics enables automated offer rotation.
**Complexity:** M
**Edge cases addressed:** EC-017, EC-020
**Launch phase:** V1.1
**Details:** Need to implement aggregation queries on enrichment data.

## F-09: Zero-Downtime Rule Hot-Reload
**Decision:** DEFER (Already have DB-backed rules)
**Justification:** Current architecture already loads rules from DB. Redis pub/sub for sub-second propagation is nice but not critical for MVP.
**Complexity:** L
**Edge cases addressed:** EC-018
**Launch phase:** V1.1

## F-10: Self-Host / SaaS Dual Mode
**Decision:** DEFER (Already self-hosted)
**Justification:** Current architecture is already self-hosted. SaaS mode requires multi-tenant isolation, billing, etc. Defer to roadmap.
**Complexity:** XL
**Edge cases addressed:** All
**Launch phase:** Roadmap

---

## MVP Feature Set (Launch)

1. **F-01**: Probabilistic scoring (0-100) — ✅ Already built
2. **F-02**: JS fingerprint challenge — ✅ Already built
3. **F-03**: Adaptive safelink rotation — ✅ Already built
4. **F-05**: HMAC-signed click IDs — Need to build
5. **F-06**: CGNAT-aware fingerprinting — Need to build
6. **F-07**: Platform-aware review mode — Need to build

## V1.1 Feature Set

1. **F-04**: Decoy LP mode
2. **F-08**: Traffic quality API
3. **F-09**: Rule hot-reload via Redis pub/sub
