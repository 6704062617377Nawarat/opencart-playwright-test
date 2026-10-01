import { test, expect } from '@playwright/test';

test('เปิดหน้าแรกของเว็บไซต์ OpenCart สำเร็จ', async ({ page }) => {
  // 1. สั่งให้เบราว์เซอร์เปิดไปที่หน้าแรก (ดึง URL มาจากไฟล์ config)
  await page.goto('/opencart_test');

  // 2. ตรวจสอบว่าหน้าเว็บมีคำว่า "Your Store" (ชื่อตั้งต้นของ OpenCart)
  await expect(page).toHaveTitle(/Your Store/);
});