import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { Rate, Trend } from 'k6/metrics';

// Config
const BASE_URL = 'http://localhost/opencart_test/';
const MAX_LOAD_MS = 3000; // เกณฑ์: โหลดเสร็จภายใน 3 วินาที

// Custom metrics
const homeLoadTime = new Trend('home_page_load_time', true);
const http5xxRate = new Rate('http_5xx_errors');
const validResponseRate = new Rate('home_valid_response');

// Test options
export const options = {
  stages: [
    { duration: '10s', target: 5 },  // ramp-up
    { duration: '30s', target: 10 }, // load คงที่
    { duration: '10s', target: 0 },  // ramp-down
  ],
  thresholds: {
    // 1) โหลดหน้า Home ภายใน 3 วินาที
    home_page_load_time: [`p(95)<${MAX_LOAD_MS}`, `max<${MAX_LOAD_MS * 2}`],
    // 2) ไม่เกิด HTTP 5xx
    http_5xx_errors: ['rate==0'],
    // 3) ได้ response ครบถ้วนสมบูรณ์ ไม่ถูกตัดกลางคัน/ไม่ว่างเปล่า ภายใต้ load
    home_valid_response: ['rate==1'],
    // เกณฑ์รวม
    checks: ['rate>0.99'],
    http_req_failed: ['rate<0.01'],
  },
};

// Test
export default function () {
  group('Home Page Load Time', () => {
    const res = http.get(BASE_URL, { tags: { name: 'HomePage' } });

    homeLoadTime.add(res.timings.duration);
    http5xxRate.add(res.status >= 500);

    const results = check(res, {
      'status is 200': (r) => r.status === 200,
      'no HTTP 5xx error': (r) => r.status < 500,
      [`load time < ${MAX_LOAD_MS} ms`]: (r) => r.timings.duration < MAX_LOAD_MS,
      'response body not empty': (r) => r.body && r.body.length > 1000,
      'response is complete HTML': (r) => r.body && r.body.includes('</html>'),
    });

    validResponseRate.add(results);
  });

  sleep(1);
}