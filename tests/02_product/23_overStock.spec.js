import { test, expect } from '@playwright/test';

test('TC-CART-23: ทดสอบการเปลี่ยนจำนวนสินค้าในตะกร้าจนจำนวนสินค้าเกินสต็อกที่มีอยู่ (Negative Testing)', async ({ page }) => {
  // 1. ไปที่หน้าแรกและเพิ่มสินค้า Canon EOS 5D ลงตะกร้า (เริ่มต้น 1 ชิ้น)
  await page.goto('http://localhost/opencart_test/');
  await page.getByRole('textbox', { name: 'Search' }).fill('Canon EOS 5D');
  await page.getByRole('banner').getByRole('button').filter({ hasText: /^$/ }).click();
  await page.locator('.product-thumb h4 a').click();

  await page.locator('#input-option-226').selectOption('15');
  await page.locator('#button-cart').click();

  // 2. ไปที่หน้า Shopping Cart
  await page.getByRole('link', { name: 'shopping cart' }).click();

  // 3. เปลี่ยนจำนวนสินค้าในตารางเป็น 4 ชิ้น แล้วกด Enter เพื่ออัปเดต
  const quantityInput = page.locator('input[name*="quantity"]');
  await quantityInput.fill('4');
  await quantityInput.press('Enter');

  // -----------------------------------------
  // Expected Result
  // -----------------------------------------
  // - ตรวจสอบว่าช่อง Quantity แสดงผลเป็น 4
  await expect(quantityInput).toHaveValue('4');

  // - ตรวจสอบว่าระบบแสดงข้อความแจ้งเตือนเรื่องสินค้าหมดสต็อก
  const alertBox = page.locator('.alert-danger');
  await expect(alertBox).toContainText('Products marked with *** are not available in the desired quantity or not in stock!');
});