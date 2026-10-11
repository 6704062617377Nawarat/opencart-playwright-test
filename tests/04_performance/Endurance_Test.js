
import http from 'k6/http';
import { check, sleep, fail } from 'k6';

// Config
const BASE_URL = 'http://localhost/opencart_test/';
const LANG = 'en-gb';
const KEYWORDS = [
    'iphone', 'macbook', 'samsung', 'canon', 'apple',
    'ipod', 'nikon', 'sony', 'htc', 'imac'
];

// Soak Test Settings
const SOAK_VUS = 20;

const RAMP_UP_SECONDS = 5 * 60;
const HOLD_SECONDS = 60 * 60;
const COOLDOWN_SECONDS = 5 * 60;

const PERIOD_SECONDS = 10 * 60;
const PERIODS = HOLD_SECONDS / PERIOD_SECONDS;

// Thresholds
const P95_MS = 3000;
const MAX_ERROR_RATE = 0.01;
const MIN_REQUESTS = 100;

// สร้าง Threshold สำหรับช่วงคงโหลดทั้ง 6 ช่วง
const thresholds = {};

for (let i = 1; i <= PERIODS; i++) {
    const period = `steady_${i}`;

    thresholds[`http_req_duration{period:${period}}`] = [
        `p(95)<${P95_MS}`,
    ];

    thresholds[`http_req_failed{period:${period}}`] = [
        `rate<${MAX_ERROR_RATE}`,
    ];

    thresholds[`checks{period:${period}}`] = [
        'rate>0.99',
    ];

    thresholds[`http_reqs{period:${period}}`] = [`count>=${MIN_REQUESTS}`,];
}

export const options = {
    stages: [
        { duration: '5m', target: SOAK_VUS },
        { duration: '1h', target: SOAK_VUS },
        { duration: '5m', target: 0 },
    ],

    thresholds,
};

// Get Time Period
function getPeriod(elapsedSeconds) {
    const steadyElapsed = elapsedSeconds - RAMP_UP_SECONDS;

    // ไม่นำ Ramp-up และ Cool-down มารวมกับผลช่วงคงโหลด
    if (
        steadyElapsed < 0 ||
        steadyElapsed >= HOLD_SECONDS
    ) {
        return 'excluded';
    }

    const index =
        Math.floor(steadyElapsed / PERIOD_SECONDS) + 1;

    return `steady_${index}`;
}

// Setup
export function setup() {
    const res = http.get(BASE_URL);

    if (res.status !== 200) {
        fail(`OpenCart is not ready: HTTP ${res.status}`);
    }

    return {
        startTime: Date.now(),
    };
}

// Soak Test
export default function (data) {
    const elapsedSeconds =
        (Date.now() - data.startTime) / 1000;

    const period = getPeriod(elapsedSeconds);

    const keyword =
        KEYWORDS[(__VU + __ITER) % KEYWORDS.length];

    const url =
        `${BASE_URL}index.php?route=product/search` +
        `&language=${LANG}&search=${encodeURIComponent(keyword)}`;

    const res = http.get(url, {
        tags: {
            name: 'Soak_Search',
            period,
        },
        timeout: '10s',
    });

    // ตรวจสอบความถูกต้องของผลลัพธ์
    check(
        res,
        {
            'status is 200': (r) => r.status === 200,

            'response body exists': (r) =>
                !!r.body && r.body.length > 1000,

            'HTML is complete': (r) =>
                !!r.body && r.body.includes('</html>'),

            'products are displayed': (r) =>
                !!r.body && r.body.includes('product-thumb'),
        },
        { period }
    );

    sleep(Math.random() * 3 + 2);
}

// Teardown
export function teardown() {
    const res = http.get(BASE_URL, {
        timeout: '10s',
    });

    check(res, {
        'home page still works after test': (r) =>
            r.status === 200,
    });
}