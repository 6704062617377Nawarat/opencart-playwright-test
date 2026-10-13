import { test, expect } from '@playwright/test';

test('ลงทะเบียนสมาชิกใหม่ด้วยข้อมูลที่ถูกต้อง', async ({ page }, testInfo) => {
  const baseURL = String(testInfo.project.use.baseURL).replace(/\/$/, '');
  const registerURL = `${baseURL}/index.php?route=account/register`;
  const email = `playwright.${Date.now()}@example.com`;

  await page.goto(registerURL);

  await page.locator('input[name="firstname"]').fill('Test');
  await page.locator('input[name="lastname"]').fill('Playwright');
  await page.locator('input[name="email"]').fill(email);
  await page.locator('input[name="password"]').fill('TestPass123!');

  // ติ๊กช่อง I have read and agree to the Privacy Policy
  await page.locator('input[name="agree"]').check();

  // กด Continue เพื่อส่งแบบฟอร์ม
  await page.getByRole('button', { name: /continue/i }).click();

  await expect(page).toHaveURL(/route=account\/success/);
  await expect(
    page.getByRole('heading', { name: /your account has been created/i })
  ).toBeVisible();
});