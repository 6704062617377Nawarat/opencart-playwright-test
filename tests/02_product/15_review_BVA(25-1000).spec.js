import { test, expect } from '@playwright/test';

test('TC-PROD-15: เพิ่มรีวิวและให้คะแนนสินค้า (ความยาว 25 ตัวอักษร - Valid BVA)', async ({ page }) => {
  // 1. ไปที่หน้าแรกและเข้าหน้าสินค้า MacBook
  await page.goto('http://localhost/opencart_test/');
  await page.getByRole('link', { name: 'MacBook' }).first().click();

  // 2. คลิกที่แท็บเขียนรีวิว (Reviews)
await page.getByRole('tab', { name: 'Reviews (0)' }).click();

  // 3. กรอกชื่อผู้รีวิว
  await page.locator('#input-author').fill('Sam');

  // 4. กรอกข้อความรีวิว (ทดสอบขอบเขต 25 - 1000 ตัวอักษร)
  const validReviewText = 'The product is working perfectly fine.';
  await page.locator('#input-text').fill(validReviewText);

  // 5. เลือกคะแนนเรตติ้ง (เลือกเรตติ้ง 5 ดาว)
  await page.locator('input[name="rating"][value="5"]').check();

  // 6. คลิกปุ่ม Continue เพื่อส่งรีวิว
  await page.getByRole('button', { name: 'Continue' }).click();

  // -----------------------------------------
  // Expected Result
    // ตรวจสอบว่าระบบแสดงข้อความยืนยันการส่งรีวิวสำเร็จ
    const successMessage = page.locator('.alert-success');
    await expect(successMessage).toContainText('Thank you for your review. It has been submitted to the webmaster for approval.');
  // -----------------------------------------
});