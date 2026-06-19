import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

const errorRate = new Rate('errors');

export const options = {
  vus: 50,
  duration: '30s',
  thresholds: {
    http_req_duration: ['p(95)<100'],  // P95 < 100ms
    errors: ['rate<0.05'],             // < 5% error rate
  },
};

const TOKEN = __ENV.ADMIN_TOKEN || '';

export default function () {
  const endpoints = [
    '/api/admin/stats',
    '/api/admin/offers',
    '/api/admin/campaigns',
    '/api/admin/reports?limit=10',
    '/health',
  ];

  const endpoint = endpoints[Math.floor(Math.random() * endpoints.length)];

  const headers = { 'Content-Type': 'application/json' };
  if (TOKEN) headers['Authorization'] = `Bearer ${TOKEN}`;

  const res = http.get(`http://localhost:3001${endpoint}`, { headers, timeout: '10s' });

  check(res, {
    'status is 200': (r) => r.status === 200,
    'response time < 100ms': (r) => r.timings.duration < 100,
  });

  errorRate.add(res.status >= 500);

  sleep(0.1);
}
