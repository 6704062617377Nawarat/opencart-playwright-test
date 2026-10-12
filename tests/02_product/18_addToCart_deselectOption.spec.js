import { test, expect } from '@playwright/test';

test('TC-PROD-18: กดเพิ่มสินค้าที่มีตัวเลือกย่อยโดยยังไม่เลือก option (Negative Testing)', async ({ page }) => {
  // 1. ไปที่หน้าแรก
  await page.goto('http://localhost/opencart_test/');

  // 2. ค้นหาสินค้าที่มีตัวเลือกย่อย 
  await page.getByRole('textbox', { name: 'Search' }).fill('Canon EOS 5D');
  await page.getByRole('banner').getByRole('button').filter({ hasText: /^$/ }).click();

  // 3. คลิกเข้าไปที่หน้าสินค้า
  await page.getByRole('link', { name: 'Canon EOS 5D' }).first().click();

  // 4. กดปุ่ม Add to Cart โดยยังไม่ได้เลือก Option บังคับ
  await page.locator('#button-cart').click();

  // -----------------------------------------
  // Expected Result
  // ตรวจสอบว่าระบบแสดงข้อความเตือน "Select Required" ใต้ช่องตัวเลือก
  const requiredMessage = page.getByText('Select Required!');
  await expect(requiredMessage).toBeVisible();
  // -----------------------------------------
});