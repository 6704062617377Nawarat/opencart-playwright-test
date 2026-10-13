import { test, expect } from '@playwright/test';

test('ออกจากระบบสำเร็จ', async ({ page }, testInfo) => {
  const baseURL = String(testInfo.project.use.baseURL).replace(/\/$/, '');
  const loginURL = `${baseURL}/index.php?route=account/login`;

  await page.goto(loginURL);

  await page.locator('input[name="email"]').fill('faypramika@gmail.com');
  await page.locator('input[name="password"]').fill('fy123456');
  await page.getByRole('button', { name: /login/i }).click();

  await expect(page).toHaveURL(/route=account\/account/);

  // เปิดเมนู My Account แล้วกด Logout
  await page.locator('.dropdown-toggle').filter({ hasText: /my account/i }).click();
  await page.locator('#top').getByRole('link', { name: 'Logout', exact: true }).click();

  await expect(page).toHaveURL(/route=account\/logout/);
  await expect(page.locator('h1')).toHaveText(/account logout/i);
});