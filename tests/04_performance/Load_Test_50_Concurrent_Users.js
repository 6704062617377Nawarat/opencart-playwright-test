import http from 'k6/http';
import { check, sleep, fail } from 'k6';

// Config
const BASE_URL = 'http://localhost/opencart_test/';
const LANG = 'en-gb';
const KEYWORDS = [
    'iphone', 'macbook', 'samsung', 'canon', 'apple',
    'ipod', 'nikon', 'sony', 'htc', 'imac'
];

// Test options
export const options = {
    stages: [
        { duration: '30s', target: 50 },
        { duration: '2m', target: 50 },
        { duration: '30s', target: 0 },
    ],
    thresholds: {
        // 1) Request ที่ล้มเหลวต้องต่ำกว่า 1%
        http_req_failed: ['rate<0.01'],
        // 2) Check โดยรวมต้องผ่านมากกว่า 99%
        checks: ['rate>0.99'],
        // 3) 95% ของ Request ต้องเสร็จภายใน 3 วินาทีโดยประมาณ
        'http_req_duration{name:Search}': [
            'p(95)<3000',
        ],
    },
};

// ตรวจสอบระบบก่อนเริ่มทดสอบ
export function setup() {
    const res = http.get(BASE_URL);

    if (res.status !== 200) {
        fail(`OpenCart is not ready: ${res.status}`);
    }
}

// Test
export default function () {
    const keyword =
        KEYWORDS[(__VU + __ITER) % KEYWORDS.length];

    const url =
        `${BASE_URL}index.php?route=product/search` +
        `&language=${LANG}&search=${encodeURIComponent(keyword)}`;

    const res = http.get(url, {
        tags: { name: 'Search' },
    });

    check(res, {
        'status is 200': (r) => r.status === 200,
        'response body exists': (r) =>
            !!r.body && r.body.length > 1000,
        'HTML is complete': (r) =>
            !!r.body && r.body.includes('</html>'),
        'products are displayed': (r) =>
            !!r.body && r.body.includes('product-thumb'),
    });

    sleep(Math.random() * 2 + 1);
}

// ตรวจสอบระบบหลังจบทดสอบ
export function teardown() {
    const res = http.get(BASE_URL);

    check(res, {
        'home page still works': (r) => r.status === 200,
    });
}