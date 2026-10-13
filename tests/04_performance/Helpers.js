import http from 'k6/http';
import { check, sleep, fail } from 'k6';
import { Rate } from 'k6/metrics';
import { BASE_URL, LANG, KEYWORDS, THRESHOLD } from './Config.js';

// Custom metric: สัดส่วน HTTP 5xx errors
export const http5xx = new Rate('http_5xx_errors');

// Setup / Teardown

// ตรวจสอบระบบก่อนเริ่มทดสอบ
export function assertSystemReady() {
    const res = http.get(BASE_URL);
    if (res.status !== 200) {
        fail(`OpenCart is not ready: ${res.status}`);
    }
}

// เรียกหน้า Home
export function getHome(timeoutS) {
    return http.get(BASE_URL, timeoutS ? { timeout: `${timeoutS}s` } : undefined);
}

export function checkHomeAlive(label = 'home page still works', timeoutS) {
    return check(getHome(timeoutS), {
        [label]: (r) => r.status === 200,
    });
}

// Search request

export function pickKeyword() {
    return KEYWORDS[(__VU + __ITER) % KEYWORDS.length];
}

export function buildSearchUrl(keyword) {
    return (
        `${BASE_URL}index.php?route=product/search` +
        `&language=${LANG}&search=${encodeURIComponent(keyword)}`
    );
}

// ยิง Search 1 ครั้ง; tags จะถูก merge กับ name: 'Search'
export function searchRequest(tags = {}, timeoutS) {
    const params = { tags: { name: 'Search', ...tags } };
    if (timeoutS) params.timeout = `${timeoutS}s`;
    return http.get(buildSearchUrl(pickKeyword()), params);
}

// ตรวจสอบความถูกต้องของผล Search
export function checkSearchResponse(res, tags) {
    return check(
        res,
        {
            'status is 200': (r) => r.status === 200,
            'response body exists': (r) => !!r.body && r.body.length > 1000,
            'HTML is complete': (r) => !!r.body && r.body.includes('</html>'),
            'products are displayed': (r) =>
                !!r.body && r.body.includes('product-thumb'),
        },
        tags
    );
}

export function record5xx(res, tags) {
    http5xx.add(res.status >= 500, tags);
}

// Utilities

// sleep แบบสุ่มในช่วง [min, max) วินาที
export function randomSleep(min, max) {
    sleep(Math.random() * (max - min) + min);
}

// สร้าง thresholds สำหรับ tag หนึ่งค่า เช่น taggedThresholds('level', 'vu_020', {...})
// ใส่เฉพาะ option ที่ต้องการ
export function taggedThresholds(
    tag,
    value,
    { p95Ms, maxRate, minRequests, http5xx: with5xx = false, checks = false } = {}
) {
    const sel = `{${tag}:${value}}`;
    const t = {};
    if (p95Ms !== undefined) t[`http_req_duration${sel}`] = [`p(95)<${p95Ms}`];
    if (maxRate !== undefined) t[`http_req_failed${sel}`] = [`rate<${maxRate}`];
    if (with5xx) t[`http_5xx_errors${sel}`] = [`rate<${maxRate}`];
    if (checks) t[`checks${sel}`] = [`rate>${THRESHOLD.CHECK_RATE}`];
    if (minRequests !== undefined) t[`http_reqs${sel}`] = [`count>=${minRequests}`];
    return t;
}