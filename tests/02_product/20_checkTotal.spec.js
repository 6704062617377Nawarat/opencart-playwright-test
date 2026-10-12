import { test, expect } from '@playwright/test';

test('TC-CART-20: ตรวจสอบการคำนวณยอดรวมในตะกร้าสินค้า (ราคา x จำนวน = ยอดรวม)', async ({ page }) => {
  // 1. ไปที่หน้าแรกและค้นหาสินค้า Canon EOS 5D
  await page.goto('http://localhost/opencart_test/');
  await page.getByRole('textbox', { name: 'Search' }).fill('Canon EOS 5D');
  await page.getByRole('banner').getByRole('button').filter({ hasText: /^$/ }).click();

  // 2. คลิกเข้าหน้าสินค้า
  await page.locator('.product-thumb h4 a').click();

  // 3. เปลี่ยนจำนวนสินค้า (Quantity) เป็น 2
  await page.locator('#input-quantity').fill('2');

  // 4. เลือก Option บังคับ (สี Red)
  await page.locator('#input-option-226').selectOption('15');

  // 5. คลิกปุ่ม Add to Cart
  await page.locator('#button-cart').click();

  // 6. คลิกเข้าไปที่หน้าตะกร้าสินค้า (Shopping Cart) จากแถบแจ้งเตือนด้านบน หรือเมนูด้านบน
  await page.getByRole('link', { name: 'shopping cart' }).click();

  // -----------------------------------------
  // Expected Result
  // -----------------------------------------
  // ตรวจสอบว่าตารางในตะกร้าแสดงผลถูกต้องตามเงื่อนไข
  // - ตรวจสอบจำนวน Quantity เป็น 2
  const quantityInput = page.locator('input[name*="quantity"]');
  await expect(quantityInput).toHaveValue('2');

  // - ตรวจสอบราคารวม (Total) ในตารางสินค้า เป็น $244.00
  // เจาะจงหาข้อความ $244.00 ที่อยู่ในตารางตะกร้าสินค้า
  const totalPriceCell = page.locator('.table-responsive tbody tr td').filter({ hasText: '$244.00' });
  await expect(totalPriceCell).toBeVisible();
});