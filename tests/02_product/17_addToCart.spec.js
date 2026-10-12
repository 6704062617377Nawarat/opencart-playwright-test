import { test, expect } from '@playwright/test';

test('TC-PROD-17: กดเพิ่มสินค้า (Add to Cart) จากหน้ารวมสินค้า', async ({ page }) => {
  // 1. ไปที่หน้าแรก
  await page.goto('http://localhost/opencart_test/');

  // 2. ค้นหาสินค้า "MacBook" เพื่อให้แสดงผลในหน้ารวมสินค้า
  await page.getByRole('textbox', { name: 'Search' }).fill('MacBook');
  await page.getByRole('banner').getByRole('button').filter({ hasText: /^$/ }).click();

  // 3. คลิกปุ่ม "Add to Cart" ของสินค้าชิ้นแรกในหน้ารวมสินค้า
  // (ใน OpenCart หน้าแสดงรายการจะมีปุ่ม Add to Cart เป็นไอคอนรูปตะกร้า)
  await page.locator('.product-thumb').locator('button').filter({ has: page.locator('.fa-shopping-cart') }).first().click();

  // -----------------------------------------
  // Expected Result
  // ตรวจสอบว่าระบบแสดงแถบแจ้งเตือนสีเขียวพร้อมข้อความสำเร็จ
  const successMessage = page.locator('.alert-success');
  await expect(successMessage).toContainText('Success: You have added MacBook to your shopping cart!');
  // -----------------------------------------
});