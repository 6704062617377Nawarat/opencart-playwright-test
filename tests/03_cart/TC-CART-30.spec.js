import { test, expect } from '@playwright/test';
test('TC-CART-30: Admin Login Successfully', async ({ page }) => {
  const base = 'http://localhost/opencart_test';

  // 1. Open the Admin Login page
  await page.goto(`${base}/admin/`);

  // 2. Let the user log in manually
  console.log('Please enter your Admin username and password.');
  await page.pause();

  // 3. Verify that the Admin Dashboard is displayed
  await expect(page).toHaveURL(
    /route=common\/dashboard/,
    { timeout: 10000 }
  );

  await expect(page.locator('body')).toContainText(
    'Dashboard',
    { timeout: 10000 }
  );

  console.log('PASS: Admin login successful. Dashboard is displayed.');
});