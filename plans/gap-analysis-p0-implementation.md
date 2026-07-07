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
### Deliverables
```
edge/internal/metrics/
  ├── prometheus.go       # Metrics registration & HTTP handler on :8081
  └── prometheus_test.go  # Unit tests

edge/internal/logger/
  ├── structured.go       # Zerolog JSON logger
  └── structured_test.go  # Unit tests

edge/cmd/edgeredirect/main.go
  # Add: /metrics endpoint on :8081 (internal only)
  # Add: metrics middleware (disabled by default)
  # Add: structured logger
  # Add: ENABLE_METRICS env var (feature flag)
```

### Metrics Exposed
```
http_requests_total{method,path,status}
http_request_duration_seconds{method,path}  # p50, p95, p99 via Histogram
redis_operations_total{operation,status}
kafka_messages_total{topic,status}
fraud_detections_total{reason}
```

### Feature Flags
```bash
ENABLE_METRICS=true    # Enable Prometheus metrics (default: false)
METRICS_PORT=8081      # Metrics endpoint port (default: 8081)
```

### Acceptance Criteria (per VERIFICATION.md §3)
```markdown
#### Receipt 1 — /metrics on separate port, blocked from public
```bash
$ curl http://localhost:8081/metrics
# HELP http_requests_total Total HTTP requests
# TYPE http_requests_total counter
http_requests_total{method="GET",path="/",status="200"} 1234

$ curl http://localhost:8080/metrics
404 Not Found  # ✅ Not exposed on main port
```

#### Receipt 2 — Metrics update in real-time
```bash
$ ab -n 1000 -c 10 http://localhost:8080/
$ curl -s http://localhost:8081/metrics | grep http_requests_total
http_requests_total{method="GET",path="/",status="200"} 2234
```

#### Receipt 3 — p99 latency overhead < 0.5ms (actual percentile)
```bash
$ go test -run=TestMetricsOverhead -v
--- PASS: TestMetricsOverhead (10.02s)
    metrics_test.go:45: Baseline (no metrics):
        p50: 0.08ms, p95: 0.12ms, p99: 0.15ms
    metrics_test.go:50: With metrics enabled:
        p50: 0.09ms, p95: 0.13ms, p99: 0.18ms
    metrics_test.go:55: Overhead:
        p50: +0.01ms, p95: +0.01ms, p99: +0.03ms ✅ (< 0.5ms)
```

#### Receipt 4 — Structured logs parseable
```bash
$ ./edgeredirect 2>&1 | head -1 | jq .
{
  "level": "info",
  "time": "2026-07-06T22:42:18Z",
  "message": "server started",
  "port": 8080,
  "metrics_port": 8081,
  "metrics_enabled": true
}
```

#### Receipt 5 — Feature flag disables metrics
```bash
$ ENABLE_METRICS=false ./edgeredirect
$ curl http://localhost:8081/metrics
curl: (7) Failed to connect to localhost port 8081: Connection refused
# ✅ Metrics server not started when disabled
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
### Feature Flags
```bash
ENABLE_RATE_LIMIT=true     # Enable rate limiting (default: false)
RATE_LIMIT_RPM=100         # Requests per minute per IP (default: 100)
RATE_LIMIT_BURST=10        # Burst allowance (default: 10)
RATE_LIMIT_TIMEOUT_MS=50   # Redis timeout (default: 50ms)
```

### Acceptance Criteria
```markdown
#### Receipt 1 — Rate limit blocks correctly
```bash
$ ENABLE_RATE_LIMIT=true ./edgeredirect &
$ for i in {1..101}; do curl -s -o /dev/null -w "%{http_code}\n" http://localhost:8080/; done | tail -5
200
200
200
429
429
```
#### Receipt 4 — Concurrent IPs don't interfere
#### Receipt 3 — Redis down → fail-open (allow requests through)
```bash
$ docker stop redis
$ curl -w "%{http_code}\n" http://localhost:8080/
200
$ docker logs edgeredirect 2>&1 | tail -1 | jq .
{"level":"warn","msg":"redis unreachable, rate limiting disabled temporarily"}
```

**Rationale (ADR-002 clarification):**
- **Fail-open** chosen over fail-closed
- **Why:** Edge layer prioritizes availability over perfect rate limiting
- **Trade-off:** Brief window of unprotected traffic vs. blocking all legitimate users
- **Mitigation:** Alert on Redis down, fix quickly (< 5 min SLA)
| Scenario | Result |
#### Receipt 5 — Slow Redis (50ms latency) → timeout bypass
```bash
$ tc qdisc add dev eth0 root netem delay 60ms  # Simulate slow Redis
$ time curl http://localhost:8080/
HTTP/1.1 200 OK
real    0m0.102s  # Request proceeds, rate limit skipped (< 50ms timeout)

$ docker logs edgeredirect | jq 'select(.msg=="rate limit timeout")'
{"level":"warn","msg":"rate limit timeout","latency_ms":52,"action":"bypassed"}
```

#### Receipt 6 — Redis memory pressure → keys not evicted mid-window
```bash
$ redis-cli CONFIG SET maxmemory 10mb
$ redis-cli CONFIG SET maxmemory-policy allkeys-lru
$ for i in {1..10000}; do curl -H "X-Forwarded-For: 192.168.1.$((i%100))" http://localhost:8080/; done
$ curl http://localhost:8080/  # Within same minute
429  # ✅ Rate limit still enforced (TTL prevents eviction)
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


#### Receipt 5 — Internal egress allowed (Redis, Kafka, MySQL)
```bash
$ kubectl exec -it edgeredirect-abc12 -- nc -zv redis.default.svc.cluster.local 6379
Connection to redis.default.svc.cluster.local 6379 port [tcp/redis] succeeded!

$ kubectl exec -it edgeredirect-abc12 -- nc -zv kafka.default.svc.cluster.local 9092
Connection to kafka.default.svc.cluster.local 9092 port [tcp/*] succeeded!

$ kubectl exec -it edgeredirect-abc12 -- nc -zv mysql.default.svc.cluster.local 3306
Connection to mysql.default.svc.cluster.local 3306 port [tcp/mysql] succeeded!
```

#### Receipt 6 — Liveness/Readiness probes pass
```bash
$ kubectl describe pod edgeredirect-abc12 | grep -A5 "Liveness\|Readiness"
    Liveness:   http-get http://:8080/health delay=10s timeout=1s period=10s #success=1 #failure=3
    Readiness:  http-get http://:8080/ready delay=5s timeout=1s period=5s #success=1 #failure=3

$ kubectl get pods -l app=edgeredirect
NAME                            READY   STATUS    RESTARTS   AGE
edgeredirect-6d8f9c7b5d-abc12   1/1     Running   0          5m  # ✅ READY = 1/1
```
---

## §6 — PHASE 4: Migration Rollback Scripts

**Goal:** Setiap migration bisa di-revert tanpa data loss
### Deliverables
```
edge/cmd/edgeredirect/main.go
  # Add: /health endpoint (liveness probe)
  # Add: /ready endpoint (readiness probe)

edge/deploy/production.yaml
  # Add: livenessProbe (httpGet /health)
  # Add: readinessProbe (httpGet /ready)
  # Add: startupProbe (httpGet /ready, slower initial)
  # Modify: resource requests/limits (based on Phase 0 baseline)

edge/deploy/configmap.yaml       # Env vars
edge/deploy/secret.yaml.example  # Credentials template
edge/deploy/README.md            # Deployment instructions + rollback
```

### Health Probes Implementation
```go
// /health — liveness probe (detect deadlocks)
func healthHandler(w http.ResponseWriter, r *http.Request) {
    w.WriteHeader(200)
    w.Write([]byte("ok"))
}

// /ready — readiness probe (detect dependencies down)
func readyHandler(redisClient, kafkaProducer) http.HandlerFunc {
    return func(w http.ResponseWriter, r *http.Request) {
        if !redisClient.Ping() || !kafkaProducer.IsHealthy() {
            w.WriteHeader(503)
            w.Write([]byte("redis or kafka unavailable"))
            return
        }
        w.WriteHeader(200)
        w.Write([]byte("ok"))
    }
}
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
#### Receipt 2 — UP → DOWN → schema = baseline (DDL-only comparison)
```bash
$ for table in $(mysql -Nse "SHOW TABLES FROM test_db"); do
    mysql -Nse "SHOW CREATE TABLE test_db.$table" >> baseline.sql
  done

$ mysql test_db < scripts/021_wallet_system.sql
$ mysql test_db < scripts/rollback/021_wallet_system_rollback.sql

$ for table in $(mysql -Nse "SHOW TABLES FROM test_db"); do
    mysql -Nse "SHOW CREATE TABLE test_db.$table" >> after_rollback.sql
  done

$ diff baseline.sql after_rollback.sql
# Empty diff ✅ (DDL-only, no timestamps/AUTO_INCREMENT)
```

#### Receipt 4 — Data preservation during rollback
```bash
$ mysql test_db -e "INSERT INTO wallets (user_id, balance) VALUES (1, 100.00);"
$ mysql test_db < scripts/021_wallet_system.sql  # Adds 'currency' column DEFAULT 'USD'
$ mysql test_db -e "SELECT * FROM wallets WHERE user_id=1;"
user_id | balance | currency
1       | 100.00  | USD

$ mysql test_db < scripts/rollback/021_wallet_system_rollback.sql
$ mysql test_db -e "SELECT * FROM wallets WHERE user_id=1;"
user_id | balance
1       | 100.00  # ✅ Data preserved, only column dropped (no data loss)
```
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

## §10 — PHASE 0: Resource Baseline Measurement

**Goal:** Measure actual edge service resource usage before setting K8s limits

### Why Required
Per reviewer feedback: "No evidence for 100m CPU / 128Mi RAM request values."

**Risk without baseline:**
- OOMKills in production (limits too low)
- Resource waste (limits too high)
- HPA thrashing (thresholds don't match actual usage)

### Deliverables
```bash
# 1. Deploy current edge service to staging K8s
$ kubectl apply -f edge/deploy/staging-minimal.yaml  # No resource limits

# 2. Measure idle baseline
$ kubectl top pods -l app=edgeredirect --containers
POD                     CONTAINER       CPU(cores)   MEMORY(bytes)
edgeredirect-abc12      edgeredirect    45m          82Mi

# 3. Inject load (10K RPS for 5 minutes)
$ kubectl run load-generator --image=williamyeh/wrk --rm -it -- \
    wrk -t 12 -c 400 -d 300s --latency http://edgeredirect:8080/

# 4. Measure under load
$ kubectl top pods -l app=edgeredirect --containers
POD                     CONTAINER       CPU(cores)   MEMORY(bytes)
edgeredirect-abc12      edgeredirect    380m         256Mi

# 5. Calculate safety margin (2x peak)
Request: 500m CPU, 512Mi RAM  # 2x measured peak (380m, 256Mi)
Limit: 1000m CPU, 1Gi RAM     # 2x request (headroom for burst)
HPA target: 70% of request = 350m CPU
```

### Acceptance Criteria
```markdown
#### Receipt 1 — Baseline measurement
[Paste kubectl top output from idle + load test]

#### Receipt 2 — No OOMKills during load test
```bash
$ kubectl get events --field-selector involvedObject.name=edgeredirect-abc12 | grep OOMKilled
# Empty output ✅
```

#### Receipt 3 — p99 latency stable under load
```bash
$ wrk -t 12 -c 400 -d 60s --latency http://edgeredirect:8080/
Latency Distribution
  50%    2.15ms
  75%    3.87ms
  90%    6.12ms
  99%    9.84ms  # ✅ < 10ms
```
```

### Timeline
**Week 0** — Run Phase 0 before starting Phase 3

### Output
Updated ADR-003 with evidence-based resource limits:
```markdown
**Decision:** 
- Request: 500m CPU, 512Mi RAM (based on 380m peak from load test)
- Limit: 1000m CPU, 1Gi RAM (2x headroom for burst)
- HPA target: 70% CPU (350m), 50-200 replicas

**Why:** 
- Measured peak: 380m CPU / 256Mi RAM at 10K RPS
- 2x safety margin prevents OOMKills during traffic spikes
- HPA triggers before CPU limit hit (70% < 100%)

**Evidence:** kubectl top output from Phase 0 (Receipt 1)

**Rollback trigger:** OOMKill events or CPU throttling under normal load
```
```

**Exit criteria:** All checks PASS. Zero regressions.

---
## §11 — TIMELINE (REVISED)

| Week | Phase | Deliverable | Reviewer |
|------|-------|-------------|----------|
| W0   | Phase 0 | Resource baseline measurement | N/A (observational) |
| W1-3 | Phase 1 | PR #1 (monitoring) | Fresh agent |
| W4-6 | Phase 2 | PR #2 (rate limit) | Fresh agent |
| W7-9 | Phase 3 | PR #3 (K8s) | Fresh agent |
| W10-12 | Phase 4 | PR #4 (rollback) | Fresh agent |

**Total:** 12 weeks (6 sprints) — includes 1-week buffer per phase

**Rationale for buffer:**
- Reviewer may find critical issues → re-work time
- Load testing may reveal bottlenecks → iteration time
- K8s tuning may require multiple attempts → adjustment time

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
