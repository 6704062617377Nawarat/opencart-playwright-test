import { THRESHOLD, TIMEOUT_S } from './lib/Config.js';
import { assertSystemReady, searchRequest, checkSearchResponse, checkHomeAlive, randomSleep, taggedThresholds, } from './lib/Helpers.js';

// Soak Test Settings
const SOAK_VUS = 20;

const RAMP_UP_SECONDS = 5 * 60;
const HOLD_SECONDS = 60 * 60;

const PERIOD_SECONDS = 10 * 60;
const PERIODS = HOLD_SECONDS / PERIOD_SECONDS;

// สร้าง Threshold สำหรับช่วงคงโหลดทั้ง 6 ช่วง
const thresholds = {};
for (let i = 1; i <= PERIODS; i++) {
    Object.assign(
        thresholds,
        taggedThresholds('period', `steady_${i}`, {
            p95Ms: THRESHOLD.P95_MS,
            maxRate: THRESHOLD.MAX_ERROR_RATE,
            minRequests: THRESHOLD.MIN_REQUESTS,
            checks: true,
        })
    );
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
    if (steadyElapsed < 0 || steadyElapsed >= HOLD_SECONDS) {
        return 'excluded';
    }

    return `steady_${Math.floor(steadyElapsed / PERIOD_SECONDS) + 1}`;
}

export function setup() {
    assertSystemReady();
    return { startTime: Date.now() };
}

// Soak Test
export default function (data) {
    const period = getPeriod((Date.now() - data.startTime) / 1000);

    const res = searchRequest({ name: 'Soak_Search', period }, TIMEOUT_S);
    checkSearchResponse(res, { period });

    randomSleep(2, 5);
}

export function teardown() {
    checkHomeAlive('home page still works after test', TIMEOUT_S);
}