import { test, expect } from '@playwright/test';

test('เพิ่มและแก้ไขที่อยู่สำหรับจัดส่งสินค้า', async ({ page }, testInfo) => {
  const baseURL = String(testInfo.project.use.baseURL).replace(/\/$/, '');
  const address1 = `99 Test Road ${Date.now()}`;
  const updatedAddress1 = `99 Updated Test Road ${Date.now()}`;

  // เข้าสู่ระบบ
  await page.goto(`${baseURL}/index.php?route=account/login`);
  await page.locator('input[name="email"]').fill('faypramika@gmail.com');
  await page.locator('input[name="password"]').fill('fy123456');
  await page.getByRole('button', { name: /login/i }).click();
  await expect(page.locator('h1')).toHaveText(/my account/i);

  // เปิด Address Book จากลิงก์ในบัญชี เพื่อให้ URL มี customer token
  await page.locator('a[href*="route=account/address"]').first().click();
  await expect(page).toHaveURL(/route=account\/address/);

  // เปิดฟอร์มเพิ่มที่อยู่
  await page.getByRole('link', { name: 'New Address', exact: true }).click();

  await page.locator('input[name="firstname"]').fill('Playwright');
  await page.locator('input[name="lastname"]').fill('Test');
  await page.locator('input[name="company"]').fill('Test Company');
  await page.locator('input[name="address_1"]').fill(address1);
  await page.locator('input[name="address_2"]').fill('Building A');
  await page.locator('input[name="city"]').fill('Bangkok');
  await page.locator('input[name="postcode"]').fill('10110');

  await page.locator('select[name="country_id"]').selectOption({ label: 'Thailand' });
  await expect(page.locator('select[name="zone_id"] option')).not.toHaveCount(1);
  await page.locator('select[name="zone_id"]').selectOption({ label: 'Bangkok' });

  // ตั้งเป็นที่อยู่เริ่มต้น
  await page.locator('input[name="default"][value="1"]').check();

  await page.getByRole('button', { name: /continue/i }).click();

  // ตรวจว่าบันทึกที่อยู่ใหม่แล้ว
  await expect(page).toHaveURL(/route=account\/address/);
  await expect(page.locator('.alert-success')).toBeVisible();

  const addressRow = page.locator('#address tr').filter({ hasText: address1 });
  await expect(addressRow).toBeVisible();

  // เปิดแก้ไขที่อยู่แถวที่เพิ่งเพิ่ม
  await addressRow.locator('a[title="Edit"]').click();
  await expect(page.locator('input[name="address_1"]')).toHaveValue(address1);

  // บันทึกการแก้ไข แล้วตรวจผลตอบกลับจาก OpenCart
  await page.locator('input[name="address_1"]').fill(updatedAddress1);

  const saveResponsePromise = page.waitForResponse((response) =>
    response.url().includes('route=account/address.save') &&
    response.request().method() === 'POST'
  );

  await page.getByRole('button', { name: /continue/i }).click();

  const saveResponse = await saveResponsePromise;
  const saveResult = await saveResponse.json();

  console.log('ผลตอบกลับจากการบันทึก:', saveResult);

  // เมื่อบันทึกสำเร็จ OpenCart จะส่ง URL สำหรับกลับไปหน้า Address Book
  expect(saveResult.success).toMatch(/successfully updated/i);

 await page.locator('a[href*="route=account/address"]').first().click();
 await expect(page).toHaveURL(/route=account\/address/);

  await expect(page).toHaveURL(/route=account\/address/);

  const updatedAddressRow = page
    .locator('#address tr')
    .filter({ hasText: updatedAddress1 });

  await expect(updatedAddressRow).toBeVisible();
});