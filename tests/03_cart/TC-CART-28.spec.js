import { test, expect } from '@playwright/test';
// ============================================
// TC-CART-28: Guest Checkout
// Expected: Guest can proceed through checkout.
// This test checks payment method selection.
// ============================================
test('TC-CART-28: Guest Checkout', async ({ page }) => {
  const base = 'http://localhost/opencart_test';

  // 1. Open homepage without logging in
  await page.goto(
    `${base}/index.php?route=common/home&language=en-gb`
  );

  // 2. Verify the user is not logged in
  await page.goto(
    `${base}/index.php?route=account/account&language=en-gb`
  );

  await expect(page).toHaveURL(/route=account\/login/);

  // 3. Return to homepage
  await page.goto(
    `${base}/index.php?route=common/home&language=en-gb`
  );

  // 4. Add a product to the cart
  const addButton = page.locator(
    'button[title="Add to Cart"]'
  ).first();

  await expect(addButton).toBeVisible();

  const addResponsePromise = page.waitForResponse(
    response =>
      response.url().includes('route=checkout/cart.add') &&
      response.request().method() === 'POST'
  );

  await addButton.click();

  const addResponse = await addResponsePromise;
  expect(addResponse.status()).toBe(200);

  // 5. Open cart and verify product exists
  await page.goto(
    `${base}/index.php?route=checkout/cart&language=en-gb`
  );

  await expect(page.locator('#content')).not.toContainText(
    'Your shopping cart is empty!'
  );

  // 6. Open checkout
  await page.goto(
    `${base}/index.php?route=checkout/checkout&language=en-gb`
  );

  // 7. Verify Guest Checkout is available
  await expect(page.locator('#content')).toContainText(
    'Guest Checkout'
  );

  // 8. Verify checkout form is displayed
  await expect(page.locator('#content')).toContainText(
    'Your Personal Details'
  );

  await expect(page.locator('#content')).toContainText(
    'Shipping Address'
  );

  // 9. Click Choose to inspect payment method options
  const chooseButton = page.getByRole('button', {
    name: 'Choose',
    exact: true
  });

  await expect(chooseButton).toBeVisible();
  await chooseButton.click();

  // 10. Expected payment method section
  // The test fails if the section remains empty.
  const paymentSection = page.locator(
    '#collapse-payment-method'
  );

  await expect(paymentSection).not.toBeEmpty({
    timeout: 5000
  });
});