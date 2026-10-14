export const BASE_URL = 'http://localhost/opencart_test/';
export const LANG = 'en-gb';
export const PRODUCT_ID = 40;

export const KEYWORDS = [
    'iphone', 'macbook', 'samsung', 'canon', 'apple',
    'ipod', 'nikon', 'sony', 'htc', 'imac',
];

// เกณฑ์ค่าเริ่มต้น
export const THRESHOLD = {
    P95_MS: 3000,          // 95% ของ Request ต้องเสร็จภายใน 3 วินาทีโดยประมาณ
    MAX_ERROR_RATE: 0.01,  // request ล้มเหลว และ 5xx ต้องต่ำกว่า 1%
    MIN_REQUESTS: 100,     // จำนวน request ขั้นต่ำต่อช่วง/ระดับ
    CHECK_RATE: 0.99,      // check โดยรวมต้องผ่านมากกว่า 99%
};

export const TIMEOUT_S = 10;