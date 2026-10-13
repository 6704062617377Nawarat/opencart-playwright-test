import { test, expect } from '@playwright/test';

test('TC-CART-22: ทดสอบการเปลี่ยนจำนวนสินค้าในตะกร้า แล้วระบบอัปเดตราคาถูกต้อง', async ({ page }) => {
  // 1. ไปที่หน้าแรกและเพิ่มสินค้า Canon EOS 5D ลงตะกร้า
  await page.goto('http://localhost/opencart_test/');
  await page.getByRole('textbox', { name: 'Search' }).fill('Canon EOS 5D');
  await page.getByRole('banner').getByRole('button').filter({ hasText: /^$/ }).click();
  await page.locator('.product-thumb h4 a').click();

  // เลือก Option บังคับ (สี Red) แล้วกด Add to Cart
  await page.locator('#input-option-226').selectOption('15');
  await page.locator('#button-cart').click();

  // 2. คลิกเข้าไปที่หน้า Shopping Cart
  await page.getByRole('link', { name: 'shopping cart' }).click();

  // 3. เปลี่ยนจำนวนสินค้าเป็น 2 แล้วกด Enter เพื่ออัปเดตตารางอัตโนมัติ
  const quantityInput = page.locator('input[name*="quantity"]');
  await quantityInput.fill('2');
  await quantityInput.press('Enter');

  // -----------------------------------------
  // Expected Result
  // -----------------------------------------
  // ตรวจสอบว่าช่อง Quantity อัปเดตเป็น 2
  await expect(quantityInput).toHaveValue('2');

  // ตรวจสอบว่าราคารวม (Total) ในตารางอัปเดตเป็น $244.00
  const totalPriceCell = page.locator('.table-responsive tbody tr td').filter({ hasText: '$244.00' }).last();
  await expect(totalPriceCell).toBeVisible();
});