
import http from 'k6/http';
import { check, sleep } from 'k6';

// Config
const BASE_URL = 'http://localhost/opencart_test/';
const LANG = 'en-gb';
const PRODUCT_ID = 40;

// Test options
export const options = {
    vus: 10,
    duration: '1m',

    thresholds: {
        // 1) 95% ของ Request ต้องเสร็จภายใน 3 วินาทีโดยประมาณ
        'http_req_duration{name:AddToCart}': [
            'p(95)<3000',
        ],
        // 2) Request ที่ล้มเหลวต้องต่ำกว่า 1%
        'http_req_failed{name:AddToCart}': [
            'rate<0.01',
        ],
        // 3) Check โดยรวมต้องผ่านมากกว่า 99%
        checks: ['rate>0.99'],
    },
};

// Test
export default function () {
    const home = http.get(BASE_URL);

    check(home, {
        'home page returns 200': (r) => r.status === 200,
    });

    // เพิ่มสินค้าลงตะกร้า
    const url =
        `${BASE_URL}index.php?route=checkout/cart.add` +
        `&language=${LANG}`;

    const payload = {
        product_id: String(PRODUCT_ID),
        quantity: '1',
    };

    const res = http.post(url, payload, {
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'X-Requested-With': 'XMLHttpRequest',
        },
        tags: {
            name: 'AddToCart',
        },
    });

    let data = null;

    try {
        data = res.json();
    } catch (_) {
        // Response ไม่ใช่ JSON
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