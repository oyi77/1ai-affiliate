#!/usr/bin/env bash
# Autoresearch harness entrypoint — 1ai-affiliate
#
# Measures smartlink routing throughput (the per-click attribution hot path)
# plus a semantic self-check that must pass or the run is rejected.
#
# Exit 0  = success, emits METRIC lines
# Exit !=0 = failure (self-check failed or benchmark crashed)
#
# Deterministic: seeded workload, no network, no wall-clock-of-day, no DB.

set -euo pipefail

# Resolve script dir so node can resolve ./engine regardless of cwd
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" >/dev/null 2>&1 && pwd)"
cd "$SCRIPT_DIR"

# Workload size can be tuned by env (CI vs local) without touching code.
export BENCH_N="${BENCH_N:-120000}"
export BENCH_WARM="${BENCH_WARM:-5000}"

node bench/smartlink/bench.js
# bench.js exits non-zero on self-check failure; `set -e` propagates it.
