
// In-memory Prometheus-compatible counters. For multi-instance deployments,
// these should be replaced by a real metrics collector (e.g., prom-client).
const counters = {
  requests_total: 0,
  responses_4xx_total: 0,
  responses_5xx_total: 0,
  requests_by_route: new Map(),
};

function incrementRequest(routeKey) {
  counters.requests_total += 1;
  const prev = counters.requests_by_route.get(routeKey) || { total: 0, '4xx': 0, '5xx': 0 };
  prev.total += 1;
  counters.requests_by_route.set(routeKey, prev);
}

function incrementResponseStatus(statusCode, routeKey) {
  const bucket = statusCode >= 500 ? '5xx' : statusCode >= 400 ? '4xx' : null;
  if (!bucket) return;
  counters[`responses_${bucket}_total`] += 1;
  const prev = counters.requests_by_route.get(routeKey) || { total: 0, '4xx': 0, '5xx': 0 };
  prev[bucket] += 1;
  counters.requests_by_route.set(routeKey, prev);
}

function getMetrics() {
  const lines = [
    '# HELP requests_total Total HTTP requests',
    '# TYPE requests_total counter',
    `requests_total ${counters.requests_total}`,
    '# HELP responses_4xx_total Total 4xx responses',
    '# TYPE responses_4xx_total counter',
    `responses_4xx_total ${counters.responses_4xx_total}`,
    '# HELP responses_5xx_total Total 5xx responses',
    '# TYPE responses_5xx_total counter',
    `responses_5xx_total ${counters.responses_5xx_total}`,
    '# HELP requests_by_route_total Requests per route',
    '# TYPE requests_by_route_total counter',
  ];
  counters.requests_by_route.forEach((buckets, routeKey) => {
    lines.push(`requests_by_route_total{route="${routeKey}"} ${buckets.total}`);
    lines.push(`requests_by_route_4xx_total{route="${routeKey}"} ${buckets['4xx']}`);
    lines.push(`requests_by_route_5xx_total{route="${routeKey}"} ${buckets['5xx']}`);
  });
  return lines.join('\n') + '\n';
}

module.exports = { incrementRequest, incrementResponseStatus, getMetrics, counters };
