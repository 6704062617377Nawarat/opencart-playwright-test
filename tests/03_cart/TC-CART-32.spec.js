import { test, expect } from '@playwright/test';
test('TC-CART-32: Update Product Stock', async ({ page }) => {
  const base = 'http://localhost/opencart_test';

  // 1. Open Admin Login
  await page.goto(`${base}/admin/`);

  // 2. Log in manually
  console.log('Please log in to the OpenCart Admin Panel.');
  await page.pause();

  // 3. Verify that Admin Dashboard is displayed
  await expect(page.locator('body')).toContainText(
    'Dashboard',
    { timeout: 10000 }
  );

  // 4. Open the Products page manually
  console.log(
    'Please open Catalog > Products, edit a product, and change its Quantity.'
  );
  await page.pause();

  // 5. Save the product manually
  console.log('Please save the product, then click Resume.');
  await page.pause();

  // 6. Verify that the save operation succeeded
  await expect(
    page.locator('body'),
    'FAIL: Product update success message was not displayed'
  ).toContainText(
    /success: you have modified products|products modified successfully/i,
    { timeout: 10000 }
  );

  console.log('PASS: Product stock update was saved successfully.');
});