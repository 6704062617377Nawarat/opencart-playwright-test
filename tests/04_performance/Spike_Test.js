import { sleep } from 'k6';
import { Rate } from 'k6/metrics';
import exec from 'k6/execution';
import { THRESHOLD, TIMEOUT_S } from './lib/Config.js';
import {
    assertSystemReady,
    searchRequest,
    checkSearchResponse,
    record5xx,
    getHome,
    randomSleep,
    taggedThresholds,
} from './lib/Helpers.js';

// ระดับโหลด
const BASE_VUS = 10;     // traffic ปกติ
const SPIKE_VUS = 100;   // traffic ที่พุ่งขึ้น

// เกณฑ์เฉพาะ Spike (ต่างจากค่า default)
const P95_MS = 5000;
const MIN_REQUESTS = 70;
const END_BUFFER_S = TIMEOUT_S + 2;

// แผนการทดสอบ (ตามลำดับเวลา)
//   s          = ความยาวช่วง (วินาที), vus = จำนวน VUs ปลายช่วง
//   phase      = ชื่อช่วงที่นับผล (null = ไม่นับผล)
//   skipStart  = ตัดต้นช่วงออกจากการนับผล, skipEnd = ตัดท้ายช่วงออก
const PLAN = [
    { s: 10, vus: BASE_VUS, phase: null },                                   // warm up
    { s: 50, vus: BASE_VUS, phase: 'baseline', skipStart: 5, skipEnd: 5 },   // traffic ปกติ
    { s: 5, vus: SPIKE_VUS, phase: 'spike' },                                // traffic พุ่งอย่างฉับพลัน
    { s: 60, vus: SPIKE_VUS, phase: 'spike', skipEnd: END_BUFFER_S },        // คง traffic สูง
    { s: 5, vus: BASE_VUS, phase: null },                                    // traffic ลดลงฉับพลัน
    { s: 120, vus: BASE_VUS, phase: 'recovery', skipStart: 30 },             // 30 วินาทีแรกให้คิวค้างเคลียร์ก่อน
];

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
    Object.assign(
        thresholds,
        taggedThresholds('phase', phase, {
            // ช่วง spike ไม่มีเกณฑ์เวลา (แค่แสดงค่า) จึงไม่ใส่ p95Ms
            p95Ms: phase === 'spike' ? undefined : P95_MS,
            maxRate: THRESHOLD.MAX_ERROR_RATE,
            minRequests: MIN_REQUESTS,
            http5xx: true,
        })
    );
}
thresholds['http_req_duration{phase:spike}'] = ['p(95)>=0']; // แสดงผลเท่านั้น ไม่ใช่เกณฑ์ตัดสิน
// ระบบต้องยังตอบสนองหลังจบการทดสอบ
thresholds.system_alive_after_test = ['rate==1'];

export const options = {
    stages: PLAN.map((st) => ({ duration: `${st.s}s`, target: st.vus })),
    thresholds,
};

export function setup() {
    assertSystemReady();
}

// Test
export default function () {
    const phase = currentPhase();

    const res = searchRequest({ phase }, TIMEOUT_S);
    record5xx(res, { phase });

    if (res.status !== 200) {
        console.log(`phase=${phase} status=${res.status} error=${res.error} code=${res.error_code} bodyLen=${res.body ? res.body.length : 0}`);
    }

    checkSearchResponse(res);
    randomSleep(1, 3);
}

// ตรวจสอบว่าระบบยังทำงานหลังจบทดสอบ
export function teardown() {
    sleep(5);
    systemAlive.add(getHome(TIMEOUT_S).status === 200);
}