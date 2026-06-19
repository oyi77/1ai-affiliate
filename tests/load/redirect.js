import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';

const errorRate = new Rate('errors');
const redirectDuration = new Trend('redirect_duration', true);

export const options = {
  vus: 100,
  duration: '30s',
  thresholds: {
    http_req_duration: ['p(95)<5'],  // P95 < 5ms
    errors: ['rate<0.01'],           // < 1% error rate
  },
};

export default function () {
  const res = http.get('http://localhost:3001/go/testhash', {
    redirects: 0,  // Don't follow redirect — measure just the 302
    timeout: '5s',
  });

  check(res, {
    'status is 302 or 404': (r) => r.status === 302 || r.status === 404,
    'response time < 5ms': (r) => r.timings.duration < 5,
  });

  errorRate.add(res.status >= 500);
  redirectDuration.add(res.timings.duration);

  sleep(0.01);
}
