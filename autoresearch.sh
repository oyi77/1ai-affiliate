#!/usr/bin/env bash
# Autoresearch benchmark entrypoint for 1ai-affiliate smartlink routing hot path.
# Measures per-click smartlink routing throughput (routeSmartlink selection path)
# against a deterministic, seeded workload with a semantic self-check that
# rejects any optimization that breaks routing correctness.
#
# Exit 0 on success, non-zero on self-check failure or missing METRIC.
# Emits: METRIC routing_throughput_ops=<n>  (primary)
#        METRIC smartlinks_routed=<n>
#        METRIC selfcheck=pass
set -euo pipefail

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$DIR"

# BENCH_ITER can be overridden by the harness; default 600000 (fixed, deterministic).
exec node bench/bench.js
