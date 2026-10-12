import { test, expect } from '@playwright/test';

test('TC-CART-23: ทดสอบการเปลี่ยนจำนวนสินค้าในตะกร้าเป็นตัวอักษร (Negative Testing)', async ({ page }) => {
  // 1. ไปที่หน้าแรกและเพิ่มสินค้า Canon EOS 5D ลงตะกร้า
  await page.goto('http://localhost/opencart_test/');
  await page.getByRole('textbox', { name: 'Search' }).fill('Canon EOS 5D');
  await page.getByRole('banner').getByRole('button').filter({ hasText: /^$/ }).click();
  await page.locator('.product-thumb h4 a').click();

  // เลือก Option บังคับ (สี Red)
  await page.locator('#input-option-226').selectOption('15');
  await page.locator('#button-cart').click();

  // 2. ไปที่หน้า Shopping Cart
  await page.getByRole('link', { name: 'shopping cart' }).click();

  // 3. (Pre-condition) ปรับจำนวนเป็น 4 ชิ้นตามเงื่อนไขของเคส
  await page.locator('input[name*="quantity"]').fill('4');
  await page.locator('input[name*="quantity"]').press('Enter');

  // *** บรรทัดที่ต้องเพิ่ม: รอให้หน้าเว็บโหลดเสร็จ โดยรอจนกว่าจะมีแถบแจ้งเตือน (Alert) โชว์ขึ้นมาก่อน ***
  await page.waitForSelector('.alert');

  // 4. ทดสอบเปลี่ยนจำนวนเป็น "ตัวอักษร" (Negative Testing)
  // ตอนนี้หน้าเว็บรีเฟรชเสร็จแล้ว พิมพ์ abc ได้อย่างปลอดภัย
  await page.locator('input[name*="quantity"]').fill('abc');
  await page.locator('input[name*="quantity"]').press('Enter');

  // -----------------------------------------
  // Expected Result
  // -----------------------------------------
  // - ตรวจสอบว่าสินค้าถูกลบและหน้าจอแสดงข้อความ "Your shopping cart is empty!"
  const emptyCartMessage = page.locator('#content p').filter({ hasText: 'Your shopping cart is empty!' });
  await expect(emptyCartMessage).toBeVisible();
});