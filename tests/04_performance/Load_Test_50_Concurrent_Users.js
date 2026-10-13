import { THRESHOLD } from './lib/Config.js';
import {
    assertSystemReady,
    searchRequest,
    checkSearchResponse,
    checkHomeAlive,
    randomSleep,
    taggedThresholds,
} from './lib/Helpers.js';

// Test options
export const options = {
    stages: [
        { duration: '30s', target: 50 },
        { duration: '2m', target: 50 },
        { duration: '30s', target: 0 },
    ],
    thresholds: {
        http_req_failed: [`rate<${THRESHOLD.MAX_ERROR_RATE}`],
        checks: [`rate>${THRESHOLD.CHECK_RATE}`],
        ...taggedThresholds('name', 'Search', { p95Ms: THRESHOLD.P95_MS }),
    },
};

export function setup() {
    assertSystemReady();
}

// Test
export default function () {
    const res = searchRequest();
    checkSearchResponse(res);
    randomSleep(1, 3);
}

export function teardown() {
    checkHomeAlive('home page still works');
}