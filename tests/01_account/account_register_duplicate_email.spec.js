import { test, expect } from '@playwright/test';

test('แจ้ง Error เมื่อสมัครด้วยอีเมลที่มีอยู่แล้ว', async ({ page }, testInfo) => {
  const baseURL = String(testInfo.project.use.baseURL).replace(/\/$/, '');
  const registerURL = `${baseURL}/index.php?route=account/register`;

  await page.goto(registerURL);

  await page.locator('input[name="firstname"]').fill('Test');
  await page.locator('input[name="lastname"]').fill('Duplicate');
  await page.locator('input[name="email"]').fill('faypramika@gmail.com');
  await page.locator('input[name="password"]').fill('TestPass123!');
  await page.locator('input[name="agree"]').check();

  await page.getByRole('button', { name: /continue/i }).click();

  await expect(page.locator('body'))
    .toContainText(/E-Mail Address is already registered/i);
});