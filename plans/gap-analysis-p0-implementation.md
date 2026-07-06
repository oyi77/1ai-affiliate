# P0 GAP ANALYSIS — IMPLEMENTATION PLAN
> **Created:** 2026-07-06T21:23:12.703Z  
> **Status:** DRAFT  
> **Protocol:** 1ai-rules ENGINEERING.md §6 Core Loop  
> **Estimated Effort:** 4 sprints (8 weeks)

---

## §1 — PROBLEM STATEMENT

Berdasarkan analisis codebase 1ai-affiliate, terdapat **4 BLOCKER (P0)** yang mencegah production deployment:

1. **Edge Monitoring** — Tidak ada observability di edge redirect (Go)
2. **Rate Limiting** — Vulnerable terhadap click fraud & DDoS
3. **K8s Production Manifests** — Deployment config tidak production-ready
4. **Migration Rollback Scripts** — Tidak bisa revert jika migration gagal

**Risk tanpa fix:** Production downtime, data loss, financial impact dari fraud.

---

## §2 — ATOMIC PR STRATEGY

Per ENGINEERING.md §4: "COMPLEX → break into smallest safe, independently-mergeable PRs"

**1 GitHub Issue + 4 Atomic PRs:**
- Issue: Tracks overall P0 epic
- PR #1: Edge monitoring only
- PR #2: Rate limiting only
- PR #3: K8s manifests only
- PR #4: Migration rollback only

Each PR:
- ✅ Independently mergeable
- ✅ Independently testable
- ✅ Independently revertible
- ✅ References parent issue

---

## §3 — PHASE 1: Edge Monitoring

**Goal:** Prometheus metrics + structured logging dengan overhead < 0.5ms p99

### Deliverables
```
edge/internal/metrics/
  ├── prometheus.go       # Metrics registration & HTTP handler
  └── prometheus_test.go  # Unit tests

edge/internal/logger/
  ├── structured.go       # Zerolog JSON logger
  └── structured_test.go  # Unit tests

edge/cmd/edgeredirect/main.go
  # Add: /metrics endpoint
  # Add: metrics middleware
  # Add: structured logger
```

### Metrics Exposed
```
http_requests_total{method,path,status}
http_request_duration_seconds{method,path}
redis_operations_total{operation,status}
kafka_messages_total{topic,status}
fraud_detections_total{reason}
```

### Acceptance Criteria (per VERIFICATION.md §3)
```markdown
#### Receipt 1 — /metrics returns valid Prometheus format
```bash
$ curl http://localhost:8080/metrics
# HELP http_requests_total Total HTTP requests
# TYPE http_requests_total counter
http_requests_total{method="GET",path="/",status="200"} 1234
```

#### Receipt 2 — Metrics update in real-time
```bash
$ ab -n 1000 -c 10 http://localhost:8080/
$ curl -s http://localhost:8080/metrics | grep http_requests_total
http_requests_total{method="GET",path="/",status="200"} 2234
```

#### Receipt 3 — Latency overhead < 0.5ms p99
```bash
$ go test -bench=BenchmarkMetricsMiddleware -benchtime=10s
BenchmarkWithMetrics-8     10000000    127 ns/op
BenchmarkWithoutMetrics-8  10000000    125 ns/op
# Overhead: 2ns = 0.000002ms ✅
```

#### Receipt 4 — Structured logs parseable
```bash
$ ./edgeredirect 2>&1 | head -1 | jq .
{
  "level": "info",
  "time": "2026-07-06T21:23:12Z",
  "message": "server started",
  "port": 8080
}
```

### Break-It Checklist
| Scenario | Result |
|----------|--------|
| /metrics under high load | No performance degradation |
| Malformed HTTP request | Metrics count correctly |
| Redis down | Metrics still exported |
| Concurrent requests | No race conditions |
```

### Tests
- Unit: metrics registration, counter/histogram behavior
- Integration: /metrics HTTP endpoint
- Benchmark: overhead measurement
- Load: 10K RPS for 60s

---

## §4 — PHASE 2: Rate Limiting

**Goal:** Block >100 req/min per IP, graceful degradation saat Redis down

### Deliverables
```
edge/internal/ratelimit/
  ├── sliding_window.go       # Redis sliding window
  ├── sliding_window_test.go
  ├── middleware.go           # HTTP middleware
  └── middleware_test.go

edge/cmd/edgeredirect/main.go
  # Add: rate limit middleware
  # Add: RATE_LIMIT_RPM env var
```

### Acceptance Criteria
```markdown
#### Receipt 1 — Rate limit blocks correctly
```bash
$ for i in {1..101}; do curl -s -o /dev/null -w "%{http_code}\n" http://localhost:8080/; done | tail -5
200
200
200
429
429
```

#### Receipt 2 — Window resets after 60s
```bash
$ curl -w "%{http_code}" http://localhost:8080/  # After 60s from test above
200
```

#### Receipt 3 — Redis down → graceful degradation
```bash
$ docker stop redis
$ curl -w "%{http_code}" http://localhost:8080/
503
$ docker logs edgeredirect 2>&1 | tail -1 | jq .
{"level":"error","msg":"redis unreachable, rate limiting disabled"}
```

#### Receipt 4 — Concurrent IPs don't interfere
```bash
$ parallel -j 50 'curl -H "X-Forwarded-For: 192.168.1.{}" http://localhost:8080/' ::: {1..50}
# All return 200 (each IP has own quota)
```

### Break-It Checklist
| Scenario | Result |
|----------|--------|
| Redis slow (100ms latency) | Request proceeds, rate limit skipped |
| Race condition (2 concurrent from same IP) | Atomic INCR, correct counting |
| Clock skew | TTL-based, clock-independent |
| IP spoofing | X-Forwarded-For validated |
```

---

## §5 — PHASE 3: K8s Production Manifests

**Goal:** Zero-downtime deployment dengan auto-scaling

### Deliverables
```
edge/deploy/
  ├── production.yaml      # Deployment, HPA, PDB, NetworkPolicy
  ├── configmap.yaml       # Env vars
  ├── secret.yaml.example  # Credentials template
  └── README.md            # Deployment instructions
```

### Acceptance Criteria
```markdown
#### Receipt 1 — All resources READY
```bash
$ kubectl apply -f edge/deploy/production.yaml
deployment.apps/edgeredirect created
horizontalpodautoscaler.autoscaling/edgeredirect created
poddisruptionbudget.policy/edgeredirect created
networkpolicy.networking.k8s.io/edgeredirect created

$ kubectl get pods -l app=edgeredirect
NAME                            READY   STATUS    RESTARTS   AGE
edgeredirect-6d8f9c7b5d-abc12   1/1     Running   0          30s
edgeredirect-6d8f9c7b5d-def34   1/1     Running   0          30s
edgeredirect-6d8f9c7b5d-ghi56   1/1     Running   0          30s
```

#### Receipt 2 — HPA scales up under load
```bash
$ kubectl run -i --tty load-generator --image=busybox /bin/sh
$ while true; do wget -q -O- http://edgeredirect; done
# In another terminal:
$ kubectl get hpa -w
NAME           REFERENCE                 TARGETS   MINPODS   MAXPODS   REPLICAS   AGE
edgeredirect   Deployment/edgeredirect   72%/70%   3         50        5          2m
```

#### Receipt 3 — Zero-downtime rolling update
```bash
$ kubectl set image deployment/edgeredirect edgeredirect=edgeredirect:v2
$ while true; do curl -w "%{http_code}\n" http://edgeredirect; sleep 0.1; done
# All return 200, zero 5xx during rollout
```

#### Receipt 4 — NetworkPolicy blocks egress
```bash
$ kubectl exec -it edgeredirect-6d8f9c7b5d-abc12 -- wget -T 2 -O- https://google.com
wget: download timed out
# ✅ Egress blocked correctly
```
```

---

## §6 — PHASE 4: Migration Rollback Scripts

**Goal:** Setiap migration bisa di-revert tanpa data loss

### Deliverables
```
scripts/rollback/
  ├── 001_initial_schema_rollback.sql
  ├── 015_fraud_tracking_rollback.sql
  ├── ... (26 total)
  └── 026_landing_page_templates_rollback.sql

scripts/generate_rollback.php
scripts/test_rollback.sh
```

### Acceptance Criteria
```markdown
#### Receipt 1 — All rollback scripts idempotent
```bash
$ mysql test_db < scripts/021_wallet_system.sql
$ mysql test_db < scripts/rollback/021_wallet_system_rollback.sql
$ mysql test_db < scripts/rollback/021_wallet_system_rollback.sql  # Run 2x
Query OK, 0 rows affected (0.01 sec)  # No error
```

#### Receipt 2 — UP → DOWN → schema = baseline
```bash
$ mysqldump test_db > baseline.sql
$ mysql test_db < scripts/021_wallet_system.sql
$ mysql test_db < scripts/rollback/021_wallet_system_rollback.sql
$ mysqldump test_db > after_rollback.sql
$ diff baseline.sql after_rollback.sql
# Empty diff ✅
```

#### Receipt 3 — Rollback test suite passes
```bash
$ ./scripts/test_rollback.sh
Testing migration 001... UP OK, DOWN OK, schema match ✅
Testing migration 002... UP OK, DOWN OK, schema match ✅
...
Testing migration 026... UP OK, DOWN OK, schema match ✅
All 26 migrations: PASS
```
```

---

## §7 — FRESH REVIEWER DEPLOYMENT

Per ENGINEERING.md Appendix C: "Fresh-context reviewer sees only diff + spec"

### Reviewer Prompt Template
```markdown
You are an adversarial code reviewer. Find gaps, not style.

**Spec:**
[Paste acceptance criteria from relevant phase]

**Diff:**
[Paste git diff]

**Questions:**
1. Is every requirement implemented?
2. Are edge cases tested with receipts?
3. Did anything outside scope change?
4. What's the most likely production failure mode?
5. What receipt is missing or insufficient?

Report gaps explicitly. If suspicious, call it out.
```

### Deployment Method
```bash
# Deploy fresh reviewer as isolated subagent
cd ~/.paseo/worktrees/3q6b2aw8/smooth-cobra
git diff main...feature/p0-edge-monitoring > /tmp/pr1.diff

# Use task tool to spawn reviewer
<invoke task with reviewer prompt + diff + spec>
```

---

## §8 — QUALITY GATES (The Ratchet)

Before claiming ANY phase done:

```bash
# 1. Full test suite
cd edge && go test ./... -v -race -cover

# 2. Linter
golangci-lint run

# 3. Security scan
gosec ./...

# 4. Coverage check (must not decrease)
go test -coverprofile=coverage.out ./...
go tool cover -func=coverage.out | grep total

# 5. No new TODOs
grep -r "TODO\|FIXME\|HACK" edge/ --exclude-dir=vendor

# 6. No hardcoded secrets
git diff main | grep -iE "password|secret|key|token" | grep -v test

# 7. Benchmark (Phase 1 only)
go test -bench=. -benchmem
```

**Exit criteria:** All checks PASS. Zero regressions.

---

## §9 — TIMELINE

| Week | Phase | Deliverable | Reviewer |
|------|-------|-------------|----------|
| W1-2 | Phase 1 | PR #1 (monitoring) | Fresh agent |
| W3-4 | Phase 2 | PR #2 (rate limit) | Fresh agent |
| W5-6 | Phase 3 | PR #3 (K8s) | Fresh agent |
| W7-8 | Phase 4 | PR #4 (rollback) | Fresh agent |

**Total:** 8 weeks (4 sprints)

---

## §10 — SUCCESS METRICS

| Metric | Before | After |
|--------|--------|-------|
| Edge observability | 0% | 100% (5 key metrics) |
| Rate limiting | None | 100 req/min per IP |
| K8s production-readiness | 0% | 100% (HPA+PDB+NetworkPolicy) |
| Migration rollback coverage | 0/26 (0%) | 26/26 (100%) |

---

**PLAN STATUS:** READY FOR ISSUE CREATION  
**NEXT ACTION:** Create GitHub issue, get approval, start Phase 1
