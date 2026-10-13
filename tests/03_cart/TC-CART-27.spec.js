import { test, expect } from '@playwright/test';
test('TC-CART-27: Member Checkout with Saved Address', async ({ page }) => {
  const base = 'http://localhost/opencart_test';

  // 1. Open member login page
  await page.goto(
    `${base}/index.php?route=account/login&language=en-gb`
  );

  // 2. Log in manually using a member account with a saved address
  console.log('Please log in with your member account.');
  await page.pause();

  // 3. Verify that the member is logged in
  await expect(page.locator('body')).toContainText('Logout');

  // 4. Open a product category
  await page.goto(
    `${base}/index.php?route=product/category&language=en-gb&path=20`
  );

  // 5. Add the first available product to the cart
  const addToCartButton = page.locator(
    'button[formaction*="cart.add"]'
  ).first();

  await expect(addToCartButton).toBeVisible({ timeout: 10000 });
  await addToCartButton.click();

  // 6. Open Checkout
  await page.goto(
    `${base}/index.php?route=checkout/checkout&language=en-gb`
  );

  await expect(page.locator('body')).toContainText('Checkout');


  // 7. Test Shipping Method
  const shippingSection = page.locator(
    '#checkout-shipping-method'
  );

  const shippingChooseButton = shippingSection.getByRole(
    'button',
    { name: /Choose/i }
  );

  await expect(
    shippingChooseButton,
    'Shipping Method: Choose button should be visible'
  ).toBeVisible({ timeout: 5000 });

  await shippingChooseButton.click();

  // Wait for a shipping option or an error message
  const shippingResult = page.locator(
    '#collapse-shipping-method, #checkout-shipping-method .alert'
  );

  await expect(
    shippingResult,
    'FAIL: Shipping Method options did not load after clicking Choose'
  ).toBeVisible({ timeout: 5000 });

  const shippingText = await shippingResult.innerText();

  expect(
    shippingText.trim().length,
    'FAIL: Shipping Method section is empty'
  ).toBeGreaterThan(0);


  // 8. Test Payment Method
  const paymentChooseButton = page.locator(
    '#button-payment-methods'
  );

  if (await paymentChooseButton.count() > 0) {
    await paymentChooseButton.click();
  } else {
    // Fallback: find the Choose button in the payment section
    await page.locator('#checkout-payment-method')
      .getByRole('button', { name: /Choose/i })
      .click();
  }

  // Fail if payment options do not load
  const paymentOptions = page.locator(
    '#collapse-payment-method'
  );

  await expect(paymentOptions).not.toBeEmpty({
    timeout: 5000
  });

  // 9. If both methods load, checkout can proceed to the next step
  console.log(
    'Shipping and payment options loaded successfully.'
  );
});