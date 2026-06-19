# Edge — Go Redirect Layer

Sub-millisecond redirect engine. The hot path.

## Directories

```
edge/
├── cmd/
│   ├── edgeredirect/main.go   # Redirect server (hot path)
│   └── clickconsumer/main.go  # Cold path consumer
├── internal/
│   ├── config/                # Env-based configuration
│   ├── model/                 # Domain models (ClickEvent, ConversionEvent, ...)
│   ├── redis/                 # Redis client (campaign state, click records)
│   ├── kafka/                 # Kafka producer + consumer group
│   ├── router/                # In-memory traffic routing engine
│   ├── detect/                # Fraud detection pipeline
│   ├── clickhouse/            # ClickHouse analytics client
│   ├── graphql/               # GraphQL schema
│   └── webhook/               # Outbound webhook dispatch
├── deploy/k8s.yaml            # Kubernetes manifests + HPA
├── Dockerfile                 # Multi-stage build
└── go.mod
```

## Hot Path: edgeredirect

```
Request → Campaign lookup (Redis, sub-ms)
       → GeoIP resolution (local MMDB, no external calls)
       → Fraud detection (in-memory rules engine)
       → Traffic routing (rule-based: geo, device, carrier)
       → Daily cap check (Redis atomic increment)
       → Click event → Kafka (async, non-blocking)
       → Ephemeral state → Redis (for attribution window)
       → HTTP 302 redirect to target URL
```

**Latency target**: < 1ms per request.
**Key invariant**: Zero database calls in the hot path.

## Cold Path: clickconsumer

```
Kafka consumer group → consume click events
                    → batch to ClickHouse (every 5s or 1000 events)
                    → session-based attribution matching
                    → time-series OLAP analytics
```

## Build

```bash
cd edge
go build ./cmd/edgeredirect
go build ./cmd/clickconsumer
go test ./...
```

## Deployment

Kubernetes with HPA:
- **edge-redirect**: 3-50 replicas, HPA on CPU 70% + Kafka lag
- **click-consumer**: 2-20 replicas, HPA on CPU 80% + Kafka lag
- Pod anti-affinity for edge nodes
- Rolling updates (maxSurge=1, maxUnavailable=0)
