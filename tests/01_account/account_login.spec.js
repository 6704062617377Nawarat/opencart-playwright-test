import { test, expect } from '@playwright/test';

test('เข้าสู่ระบบด้วยอีเมลและรหัสผ่านที่ถูกต้อง', async ({ page }, testInfo) => {
  const baseURL = String(testInfo.project.use.baseURL).replace(/\/$/, '');
  const loginURL = `${baseURL}/index.php?route=account/login`;

  await page.goto(loginURL);

  await page.locator('input[name="email"]').fill('faypramika@gmail.com');
  await page.locator('input[name="password"]').fill('fy123456');

  await page.getByRole('button', { name: /login/i }).click();

  await expect(page).toHaveURL(/route=account\/account/);
  await expect(page.locator('h1')).toHaveText('My Account');
});