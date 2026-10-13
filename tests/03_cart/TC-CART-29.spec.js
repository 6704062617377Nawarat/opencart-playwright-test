import { test, expect } from '@playwright/test';
test('TC-CART-29: Verify Customer Order History', async ({ page }) => {
  const base = 'http://localhost/opencart_test';

  // 1. Open the storefront
  await page.goto(`${base}/`);

  // 2. Log in manually
  console.log('Please log in with a customer account that has at least one order.');
  await page.pause();

  // 3. Open Order History from the account page
  console.log('Please open My Account > Order History, then click Resume.');
  await page.pause();

  // 4. Verify that Order History is displayed
  const body = page.locator('body');

  await expect(body).toContainText(/order history/i);

  // 5. Fail if the account has no previous orders
  await expect(
    body,
    'FAIL: The customer account has no previous orders'
  ).not.toContainText(/you have not made any previous orders/i);

  // 6. Verify that at least one order is displayed
  const orderRows = page.locator(
    '#content table tbody tr:visible'
  );

  await expect(
    orderRows.first(),
    'FAIL: No order is displayed in Order History'
  ).toBeVisible({ timeout: 10000 });

  // 7. Let the user open an order to inspect its details
  console.log('Please click the View button for an order, then click Resume.');
  await page.pause();

 
  // 8. Verify that order details are displayed
  await expect(body).toContainText('Order #1');
  await expect(body).toContainText('Order ID');
  await expect(body).toContainText('Canon EOS 5D');
  await expect(body).toContainText('Order History');

  console.log('PASS: Order history and order details are displayed.');

  console.log('PASS: Order History and order details are displayed.');
});