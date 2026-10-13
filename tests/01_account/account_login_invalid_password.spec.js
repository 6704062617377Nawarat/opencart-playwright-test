import { test, expect } from '@playwright/test';

test('เข้าสู่ระบบไม่ได้เมื่อใช้รหัสผ่านไม่ถูกต้อง', async ({ page }, testInfo) => {
  const baseURL = String(testInfo.project.use.baseURL).replace(/\/$/, '');
  const loginURL = `${baseURL}/index.php?route=account/login`;

  await page.goto(loginURL);

  // ใช้อีเมลของบัญชีที่มีอยู่จริง แต่ใส่รหัสผ่านผิด
  await page.locator('input[name="email"]').fill('faypramika@gmail.com');
  await page.locator('input[name="password"]').fill('skynani123');

  await page.getByRole('button', { name: /login/i }).click();

  await expect(page.locator('body'))
    .toContainText(/no match for e-mail address and\/or password/i);

  // ตรวจว่ายังอยู่หน้า Login ไม่ได้เข้าสู่หน้า My Account
  await expect(page).toHaveURL(/route=account\/login/);
});