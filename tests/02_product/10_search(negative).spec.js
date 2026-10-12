import { test, expect } from '@playwright/test';

test('TC-PROD-10: ทดสอบการค้นหาสินค้าที่ไม่มีอยู่ในคีย์เวิร์ด (แสดงข้อความไม่พบสินค้า)', async ({ page }) => {
  
  // 1. ไปที่หน้าแรก
  await page.goto('http://localhost/opencart_test/');
  
  // 2. ค้นหาสินค้าที่ไม่มีอยู่ในระบบ (เช่น "qwertyuiop") เพื่อให้แสดงผลว่าไม่พบสินค้า
  await page.getByRole('textbox', { name: 'Search' }).click();
  await page.getByRole('textbox', { name: 'Search' }).fill('qwertyuiop');
  
  // 3. คลิกปุ่มค้นหา (Search) หรือกด Enter
  await page.getByRole('banner').getByRole('button').filter({ hasText: /^$/ }).click();
  await expect(page).toHaveURL(/search=qwertyuiop/i);
  
  //expected Result
  // -----------------------------------------
  // ตรวจสอบว่าหน้าผลการค้นหาสินค้าแสดงข้อความว่าไม่พบสินค้า
  const noProductMessage = page.locator('p').filter({ hasText: 'There is no product that matches the search criteria.' });
  await expect(noProductMessage).toBeVisible();
  
  // ตรวจสอบว่าหน้าผลการค้นหาสินค้าไม่มีรายการสินค้าแสดงผล
  const productThumbs = page.locator('.product-thumb');
  await expect(productThumbs).toHaveCount(0);
  
});