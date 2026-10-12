import { test, expect } from '@playwright/test';

test('TC-PROD-16: เพิ่มรีวิวและให้คะแนนสินค้า (ความยาว 1001 ตัวอักษร - Invalid BVA)', async ({ page }) => {
  // 1. ไปที่หน้าแรกและเข้าหน้าสินค้า MacBook
  await page.goto('http://localhost/opencart_test/');
  await page.getByRole('link', { name: 'MacBook' }).first().click();

  // 2. คลิกที่แท็บเขียนรีวิว (Reviews)
await page.getByRole('tab', { name: 'Reviews (0)' }).click();

  // 3. กรอกชื่อผู้รีวิว
  await page.locator('#input-author').fill('Sam');

    // 4. กรอกข้อความรีวิว (ทดสอบขอบเขตสูงกว่า 1000 ตัวอักษร)
  const longReviewText = 'A'.repeat(1001);
  await page.locator('#input-text').fill(longReviewText);

  // 5. เลือกคะแนนเรตติ้ง (เลือกเรตติ้ง 5 ดาว)
  await page.locator('input[name="rating"][value="5"]').check();

  // 6. คลิกปุ่ม Continue เพื่อส่งรีวิว
  await page.getByRole('button', { name: 'Continue' }).click();

  // -----------------------------------------
  // Expected Result
   // ตรวจสอบข้อความเตือนเรื่องความยาวตัวอักษรโดยค้นหาจากข้อความตรงๆ
  await expect(page.getByText('Review Text must be between 25 and 1000 characters!')).toBeVisible();

  // เช็กคำว่า Note: ด้วย
  await expect(page.getByText('Note:')).toBeVisible();

});