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
const BASE_VUS = 10;     // traffic ปกติ
const SPIKE_VUS = 100;   // traffic ที่พุ่งขึ้น

// เกณฑ์
const P95_MS = 5000;        // 95% ของ Request ต้องเสร็จภายใน 5 วินาทีโดยประมาณ
const MAX_RATE = 0.01;      // request ล้มเหลว และ 5xx ต้องต่ำกว่า 1%
const MIN_REQUESTS = 70;   // จำนวน request ขั้นต่ำต่อช่วง
const TIMEOUT_S = 10;
const END_BUFFER_S = TIMEOUT_S + 2; // ตัดท้ายช่วง spike เพื่อไม่ให้ request คร่อมไปช่วง recovery

// แผนการทดสอบ (ตามลำดับเวลา)
//   s          = ความยาวช่วง (วินาที), vus = จำนวน VUs ปลายช่วง
//   phase      = ชื่อช่วงที่นับผล (null = ไม่นับผล)
//   skipStart  = ตัดต้นช่วงออกจากการนับผล, skipEnd = ตัดท้ายช่วงออก
const PLAN = [
    { s: 10, vus: BASE_VUS, phase: null },                                          // warm up
    { s: 50, vus: BASE_VUS, phase: 'baseline', skipStart: 5, skipEnd: 5 },          // traffic ปกติ
    { s: 5, vus: SPIKE_VUS, phase: 'spike' },                                      // traffic พุ่งอย่างฉับพลัน
    { s: 60, vus: SPIKE_VUS, phase: 'spike', skipEnd: END_BUFFER_S },               // คง traffic สูง
    { s: 5, vus: BASE_VUS, phase: null },                                         // traffic ลดลงฉับพลัน
    { s: 120, vus: BASE_VUS, phase: 'recovery', skipStart: 30 },                    // 30 วินาทีแรกให้คิวค้างเคลียร์ก่อน
];

const http5xx = new Rate('http_5xx_errors');
const systemAlive = new Rate('system_alive_after_test');

// ระบุว่า ณ เวลานี้อยู่ในช่วงนับผลช่วงไหน
function currentPhase() {
    let t = exec.instance.currentTestRunDuration / 1000;
    for (const st of PLAN) {
        if (t < st.s) {
            if (!st.phase) return 'excluded';
            const from = st.skipStart || 0;
            const to = st.s - (st.skipEnd || 0);
            return t >= from && t < to ? st.phase : 'excluded';
        }
        t -= st.s;
    }
    return 'excluded';
}

// Thresholds แยกตามช่วง
const thresholds = {};
for (const phase of ['baseline', 'spike', 'recovery']) {
    thresholds[`http_req_failed{phase:${phase}}`] = [`rate<${MAX_RATE}`];
    thresholds[`http_5xx_errors{phase:${phase}}`] = [`rate<${MAX_RATE}`];
    thresholds[`http_reqs{phase:${phase}}`] = [`count>=${MIN_REQUESTS}`];
}
// เวลาตอบ: ใช้ตัดสินช่วงปกติและช่วงฟื้นตัว (ช่วง spike ไม่มีเกณฑ์เวลา แค่แสดงค่า)
thresholds['http_req_duration{phase:baseline}'] = [`p(95)<${P95_MS}`];
thresholds['http_req_duration{phase:recovery}'] = [`p(95)<${P95_MS}`];
thresholds['http_req_duration{phase:spike}'] = ['p(95)>=0']; // แสดงผลเท่านั้น ไม่ใช่เกณฑ์ตัดสิน
// ระบบต้องยังตอบสนองหลังจบการทดสอบ
thresholds.system_alive_after_test = ['rate==1'];

// Test options
export const options = {
    stages: PLAN.map((st) => ({ duration: `${st.s}s`, target: st.vus })),
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
    const phase = currentPhase();

    const keyword =
        KEYWORDS[(__VU + __ITER) % KEYWORDS.length];

    const url =
        `${BASE_URL}index.php?route=product/search` +
        `&language=${LANG}&search=${encodeURIComponent(keyword)}`;

    const res = http.get(url, {
        tags: { name: 'Search', phase },
        timeout: `${TIMEOUT_S}s`,
    });

    http5xx.add(res.status >= 500, { phase });
    if (res.status !== 200) {
        console.log(`phase=${phase} status=${res.status} error=${res.error} code=${res.error_code} bodyLen=${res.body ? res.body.length : 0}`);
    }

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

// ตรวจสอบว่าระบบยังทำงานหลังจบทดสอบ
export function teardown() {
    sleep(5);
    const res = http.get(BASE_URL, { timeout: `${TIMEOUT_S}s` });
    systemAlive.add(res.status === 200);
}