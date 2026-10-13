import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { Rate, Trend } from 'k6/metrics';
import { BASE_URL, THRESHOLD } from './lib/Config.js';

const MAX_LOAD_MS = THRESHOLD.P95_MS; // เกณฑ์: โหลดเสร็จภายใน 3 วินาที

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
        home_page_load_time: [`p(95)<${MAX_LOAD_MS}`, `max<${MAX_LOAD_MS * 2}`],
        http_5xx_errors: ['rate==0'],
        home_valid_response: ['rate==1'],
        checks: [`rate>${THRESHOLD.CHECK_RATE}`],
        http_req_failed: [`rate<${THRESHOLD.MAX_ERROR_RATE}`],
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