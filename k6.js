import http from 'k6/http';
import { check, sleep } from 'k6';

// Usage: k6 run -e BASE_URL=http://localhost:8000 -e PAYLOAD=heavy -e MAX_VUS=16 k6.js
const BASE_URL = __ENV.BASE_URL || 'http://localhost:8000';
const PAYLOAD = __ENV.PAYLOAD || 'small';
const MAX_VUS = parseInt(__ENV.MAX_VUS || '16');
const STAGE = parseInt(__ENV.STAGE_SECONDS || '30');

const rows = Array.from({ length: 200 }, (_, i) =>
  `<tr><td>${i}</td><td>Item ${i}</td><td>世界 ${i * 7}</td></tr>`
).join('');

const html = PAYLOAD === 'heavy'
  ? `<h1>Report</h1><table border="1">${rows}</table>`
  : '<h1>Hello 世界</h1>';

const body = JSON.stringify({ html });
const params = { headers: { 'Content-Type': 'application/json' } };

export const options = {
  scenarios: {
    // Finds capacity by stepping up concurrent PDF renders.
    ramp: {
      executor: 'ramping-vus',
      exec: 'render',
      startVUs: 1,
      stages: [
        { duration: `${STAGE}s`, target: 1 },
        { duration: `${STAGE}s`, target: 2 },
        { duration: `${STAGE}s`, target: 4 },
        { duration: `${STAGE}s`, target: 8 },
        { duration: `${STAGE}s`, target: MAX_VUS },
      ],
    },
    // Cheap request whose latency only rises if the event loop is blocked.
    liveness: {
      executor: 'constant-vus',
      exec: 'probe',
      vus: 1,
      duration: `${STAGE * 5}s`,
    },
  },
  thresholds: {
    http_req_failed: ['rate<0.01'],
    'http_req_duration{scenario:liveness}': ['p(95)<200'],
    'http_req_duration{scenario:ramp}': ['p(95)<5000'],
  },
};

export function render() {
  const res = http.post(`${BASE_URL}/pdfs`, body, params);
  check(res, {
    'status is 200': (r) => r.status === 200,
    'body is a PDF': (r) => r.body && r.body.substring(0, 4) === '%PDF',
  });
}

export function probe() {
  const res = http.get(`${BASE_URL}/openapi.json`);
  check(res, { 'status is 200': (r) => r.status === 200 });
  sleep(0.2);
}
