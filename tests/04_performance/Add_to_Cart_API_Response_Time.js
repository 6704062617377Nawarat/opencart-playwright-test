import http from 'k6/http';
import { check, sleep } from 'k6';
import { BASE_URL, LANG, PRODUCT_ID, THRESHOLD } from './lib/Config.js';
import { taggedThresholds } from './lib/Helpers.js';

// Test options
export const options = {
    vus: 10,
    duration: '1m',

    thresholds: {
        ...taggedThresholds('name', 'AddToCart', {
            p95Ms: THRESHOLD.P95_MS,
            maxRate: THRESHOLD.MAX_ERROR_RATE,
        }),
        checks: [`rate>${THRESHOLD.CHECK_RATE}`],
    },
};

// Test
export default function () {
    const home = http.get(BASE_URL);

    check(home, {
        'home page returns 200': (r) => r.status === 200,
    });

    const url = `${BASE_URL}index.php?route=checkout/cart.add&language=${LANG}`;

    const payload = {
        product_id: String(PRODUCT_ID),
        quantity: '1',
    };

    const res = http.post(url, payload, {
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'X-Requested-With': 'XMLHttpRequest',
        },
        tags: { name: 'AddToCart' },
    });

    let data = null;
    try {
        data = res.json();
    } catch (_) {
        // response ไม่ใช่ JSON -> data ยังเป็น null
    }

    check(res, {
        'API returns HTTP 200': (r) => r.status === 200,
        'response is valid JSON': () => data !== null,
        'product added successfully': () =>
            data !== null &&
            typeof data.success === 'string' &&
            data.success.length > 0,
        'no HTTP 5xx server error': (r) => r.status < 500,
    });

    sleep(1);
}