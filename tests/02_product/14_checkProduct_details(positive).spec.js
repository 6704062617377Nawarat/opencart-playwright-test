import { test, expect } from '@playwright/test';

test('TC-PROD-14: ตรวจสอบการแสดงผลรายละเอียดสินค้า (ชื่อ, รูปภาพ, ราคา, สต็อก)', async ({ page }) => {
  // 1. ไปที่หน้าแรก
  await page.goto('http://localhost/opencart_test/');

  // 2. คลิกเลือกสินค้า "MacBook" (หรือเปลี่ยนเป็นสินค้าอื่นที่คุณมีในระบบ) เพื่อเข้าไปหน้า Product Detail
  await page.getByRole('link', { name: 'MacBook' }).first().click();

  // -----------------------------------------
  // Expected Result: ตรวจสอบข้อมูล 4 ส่วนหลัก
  await expect(page).toHaveURL(/route=product\/product/i);
  await expect(page.getByRole('heading', { name: 'MacBook' })).toBeVisible();
  await expect(page.getByRole('img', { name: 'MacBook' }).first()).toBeVisible();
  await expect(page.getByText('$602.00')).toBeVisible();
  await expect(page.getByText('Availability: In Stock')).toBeVisible();
  // -----------------------------------------

  // ตรวจสอบที่ 1: ชื่อสินค้า (Product Name)
  const productName = page.locator('h1');
  await expect(productName).toHaveText('MacBook');

  // ตรวจสอบที่ 2: ราคาสินค้า (Product Price)
  const productPrice = page.locator('#content h2').filter({ hasText: '$' }).first();
  await expect(productPrice).toBeVisible();

  // ตรวจสอบที่ 3: สต็อกสินค้า (Stock Status)
  const stockStatus = page.locator('.list-unstyled').filter({ hasText: 'Availability:' });
  await expect(stockStatus).toContainText('In Stock'); 
});