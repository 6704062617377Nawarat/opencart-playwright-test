import { test, expect } from '@playwright/test';

test('ส่งคำขอลืมรหัสผ่านด้วยอีเมลที่ลงทะเบียนแล้ว', async ({ page }, testInfo) => {
  const baseURL = String(testInfo.project.use.baseURL).replace(/\/$/, '');
  const loginURL = `${baseURL}/index.php?route=account/login`;

  await page.goto(loginURL);

  // ไปยังหน้าลืมรหัสผ่าน
  await page.locator('#form-login')
  .getByRole('link', { name: /forgotten password/i })
  .click();

  await expect(page).toHaveURL(/route=account\/forgotten/);


  await page.locator('input[name="email"]').fill('faypramika@gmail.com');

  await page.getByRole('button', { name: /continue/i }).click();

  // เมื่อส่งคำขอสำเร็จ OpenCart จะกลับไปหน้า Login
  await expect(page).toHaveURL(/route=account\/login/);
  await expect(page.locator('.alert-success')).toBeVisible();
});