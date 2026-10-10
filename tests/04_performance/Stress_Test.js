import http from 'k6/http';
import { check, sleep, fail } from 'k6';
import { Rate } from 'k6/metrics';
import exec from 'k6/execution';

// Config
const BASE_URL = 'http://localhost/opencart_test/';
const LANG = 'en-gb';
const KEYWORDS = [
    'iphone', 'macbook', 'samsung', 'canon', 'apple',
    'ipod', 'nikon', 'sony', 'htc', 'imac'
];

// ระดับโหลด
const LEVELS = [20, 30, 40, 50, 75, 100, 125, 150];

// เกณฑ์
const P95_MS = 3000;        // 95% ของ Request ต้องเสร็จภายใน 3 วินาทีโดยประมาณ
const MAX_RATE = 0.01;      // request ล้มเหลว และ 5xx ต้องต่ำกว่า 1%
const MIN_REQUESTS = 100;   // จำนวน request ขั้นต่ำต่อระดับ

// ช่วงเวลา (วินาที)
const WARMUP_S = 30;       // 0 -> ระดับแรก
const RAMP_S = 20;         // ช่วงเพิ่ม VUs ระหว่างระดับ
const HOLD_S = 90;         // คงโหลดแต่ละระดับ
const COOLDOWN_S = 30;
const SETTLE_S = 10;
const TIMEOUT_S = 10;
const END_BUFFER_S = TIMEOUT_S + 1;

// ชื่อระดับเติม 0 ข้างหน้าให้หน้าสรุปของ k6 เรียงจากน้อยไปมาก
const levelKey = (v) => `vu_${String(v).padStart(3, '0')}`;
const http5xx = new Rate('http_5xx_errors');

function buildStages() {
    const stages = [
        { duration: `${WARMUP_S}s`, target: LEVELS[0] },
        { duration: `${HOLD_S}s`, target: LEVELS[0] },
    ];
    for (let i = 1; i < LEVELS.length; i++) {
        stages.push({ duration: `${RAMP_S}s`, target: LEVELS[i] });
        stages.push({ duration: `${HOLD_S}s`, target: LEVELS[i] });
    }
    stages.push({ duration: `${COOLDOWN_S}s`, target: 0 });
    return stages;
}

// ระบุว่า ณ เวลานี้อยู่ในช่วงวัดผลของระดับไหน
function currentLevel() {
    let t = exec.instance.currentTestRunDuration / 1000;
    if (t < WARMUP_S) return 'excluded';
    t -= WARMUP_S;
    for (let i = 0; i < LEVELS.length; i++) {
        if (i > 0) {
            if (t < RAMP_S) return 'excluded';
            t -= RAMP_S;
        }
        if (t < HOLD_S) {
            return t >= SETTLE_S && t < HOLD_S - END_BUFFER_S
                ? levelKey(LEVELS[i])
                : 'excluded';
        }
        t -= HOLD_S;
    }
    return 'excluded';
}

// Thresholds แยกตามระดับโหลด
const thresholds = {};
for (const v of LEVELS) {
    const k = levelKey(v);
    thresholds[`http_req_duration{level:${k}}`] = [`p(95)<${P95_MS}`];
    thresholds[`http_req_failed{level:${k}}`] = [`rate<${MAX_RATE}`];
    thresholds[`http_5xx_errors{level:${k}}`] = [`rate<${MAX_RATE}`];
    thresholds[`http_reqs{level:${k}}`] = [`count>=${MIN_REQUESTS}`];
}

thresholds.checks = ['rate>0.99'];

// Test options
export const options = {
    stages: buildStages(),
    thresholds,
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
    const level = currentLevel();

    const keyword =
        KEYWORDS[(__VU + __ITER) % KEYWORDS.length];

    const url =
        `${BASE_URL}index.php?route=product/search` +
        `&language=${LANG}&search=${encodeURIComponent(keyword)}`;

    const res = http.get(url, {
        tags: { name: 'Search', level },
        timeout: `${TIMEOUT_S}s`,
    });

    http5xx.add(res.status >= 500, { level });

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

// ตรวจสอบว่าระบบกลับมาตอบสนองหลังจบทดสอบ
export function teardown() {
    sleep(5);
    const res = http.get(BASE_URL, { timeout: `${TIMEOUT_S}s` });

    check(res, {
        'home page still works': (r) => r.status === 200,
    });
}