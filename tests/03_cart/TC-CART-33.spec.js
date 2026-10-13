import { test, expect } from '@playwright/test';
test('TC-CART-33: Update Customer Order Status', async ({ page }) => {
  const base = 'http://localhost/opencart_test';

  // 1. Open Admin Login
  await page.goto(`${base}/admin/`);

  // 2. Log in manually
  console.log('Please log in to the OpenCart Admin Panel.');
  await page.pause();

  // 3. Verify Admin Dashboard
  await expect(page.locator('body')).toContainText(
    'Dashboard',
    { timeout: 10000 }
  );

  // 4. Open Orders page manually
  console.log(
    'Please open Sales > Orders and select an existing order.'
  );
  await page.pause();

  // 5. Change the order status manually
  console.log(
    'Please edit the order, change its status (e.g. Pending to Shipped), and save.'
  );
  await page.pause();

  // 6. Verify that the update was saved
  await expect(
    page.locator('body'),
    'FAIL: Order status update success message was not displayed'
  ).toContainText(
    /success: you have modified orders|order.*modified successfully|successfully modified/i,
    { timeout: 10000 }
  );

  console.log('PASS: Customer order status was updated successfully.');
});