import { sleep } from 'k6';
import exec from 'k6/execution';
import { THRESHOLD, TIMEOUT_S } from './lib/Config.js';
import {
    assertSystemReady,
    searchRequest,
    checkSearchResponse,
    record5xx,
    checkHomeAlive,
    randomSleep,
    taggedThresholds,
} from './lib/Helpers.js';

// ระดับโหลด
const LEVELS = [20, 30, 40, 50, 75, 100, 125, 150];

// ช่วงเวลา (วินาที)
const WARMUP_S = 30;       // 0 -> ระดับแรก
const RAMP_S = 20;         // ช่วงเพิ่ม VUs ระหว่างระดับ
const HOLD_S = 90;         // คงโหลดแต่ละระดับ
const COOLDOWN_S = 30;
const SETTLE_S = 10;
const END_BUFFER_S = TIMEOUT_S + 1;

// ชื่อระดับเติม 0 ข้างหน้าให้หน้าสรุปของ k6 เรียงจากน้อยไปมาก
const levelKey = (v) => `vu_${String(v).padStart(3, '0')}`;

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
const thresholds = { checks: [`rate>${THRESHOLD.CHECK_RATE}`] };
for (const v of LEVELS) {
    Object.assign(
        thresholds,
        taggedThresholds('level', levelKey(v), {
            p95Ms: THRESHOLD.P95_MS,
            maxRate: THRESHOLD.MAX_ERROR_RATE,
            minRequests: THRESHOLD.MIN_REQUESTS,
            http5xx: true,
        })
    );
}

export const options = {
    stages: buildStages(),
    thresholds,
};

export function setup() {
    assertSystemReady();
}

// Test
export default function () {
    const level = currentLevel();

    const res = searchRequest({ level }, TIMEOUT_S);
    record5xx(res, { level });
    checkSearchResponse(res);

    randomSleep(1, 3);
}

// ตรวจสอบว่าระบบกลับมาตอบสนองหลังจบทดสอบ
export function teardown() {
    sleep(5);
    checkHomeAlive('home page still works', TIMEOUT_S);
}