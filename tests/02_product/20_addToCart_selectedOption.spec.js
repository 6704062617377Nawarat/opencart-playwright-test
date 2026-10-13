import { test, expect } from '@playwright/test';

test('TC-PROD-20: เพิ่มสินค้าที่มีตัวเลือกย่อยโดยเลือก Option แล้ว (Positive Testing)', async ({ page }) => {
  // 1. ไปที่หน้าแรก
  await page.goto('http://localhost/opencart_test/');

  // 2. ค้นหาสินค้า "Canon EOS 5D"
  await page.getByRole('textbox', { name: 'Search' }).fill('Canon EOS 5D');
  await page.getByRole('banner').getByRole('button').filter({ hasText: /^$/ }).click();

 // 3. คลิกที่ชื่อสินค้า Canon EOS 5D ในหน้ารวมผลการค้นหา
  await page.locator('.product-thumb h4 a').click();

  // 4. สั่งหมุนล้อเมาส์เลื่อนหน้าจอลงมาข้างล่าง 300 พิกเซลเพื่อให้เห็นช่องตัวเลือก Option
  await page.mouse.wheel(0, 300);

  // 5. เลือก Option สี Red (value='15')
  await page.locator('#input-option-226').selectOption('15');

  // 6. คลิกปุ่ม Add to Cart
  await page.locator('#button-cart').click();

  // -----------------------------------------
  // Expected Result
  // -----------------------------------------
  // ตรวจสอบว่าระบบแสดงแถบแจ้งเตือนความสำเร็จ
  const successAlert = page.locator('.alert-success');
  await expect(successAlert).toContainText('Success: You have added Canon EOS 5D to your shopping cart!');
});