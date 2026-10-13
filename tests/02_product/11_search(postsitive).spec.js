import { test, expect } from '@playwright/test';

test('TC-PROD-11: ทดสอบการค้นหาสินค้า Macbook', async ({ page }) => {
 // 1. ไปที่หน้าแรก
  await page.goto('http://localhost/opencart_test/');
  
  // 2. ค้นหาสินค้า "Macbook" เพื่อให้แสดงผลในหน้ารวมสินค้า
  await page.getByRole('textbox', { name: 'Search' }).click();
  
  // 3. กรอกคำค้นหา "Macbook" ลงในช่องค้นหา
  await page.getByRole('textbox', { name: 'Search' }).fill('Macbook');
  
  // 4. คลิกปุ่มค้นหา (Search) หรือกด Enter
  await page.getByRole('banner').getByRole('button').filter({ hasText: /^$/ }).click();

  //expected Result
  // ตรวจสอบว่าหน้าผลการค้นหาสินค้าแสดงผลถูกต้อง
  const productTitle = page.locator('.product-thumb h4 a').filter({ hasText: /MacBook/i }).first();
await expect(productTitle).toBeVisible();
});