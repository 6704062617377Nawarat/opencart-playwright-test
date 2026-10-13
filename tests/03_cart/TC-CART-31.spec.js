import { test, expect } from '@playwright/test';
test('TC-CART-31: Guest Adds Product to Cart', async ({ page }) => {
  const base = 'http://localhost/opencart_test';

  // 1. Open the storefront as a guest
  await page.goto(
    `${base}/index.php?route=product/category&language=en-gb&path=20`
  );

  // 2. Verify that the user is not logged in
  await expect(page.locator('body')).not.toContainText('Logout');

  // 3. Open a product page
  await page.goto(
    `${base}/index.php?route=product/product&language=en-gb&product_id=42`
  );

  // 4. Let the user add the product manually
  console.log('Please click Add to Cart manually in the browser.');
  await page.pause();

  // 5. Open the shopping cart after clicking Resume
  await page.goto(
    `${base}/index.php?route=checkout/cart&language=en-gb`
  );

  const cartContent = page.locator('#content');

  // 6. Verify that the cart page is displayed
  await expect(cartContent).toContainText(/Shopping Cart/i);

  // 7. Fail if the cart is empty
  await expect(
    cartContent,
    'FAIL: Guest cart is empty; product was not added successfully'
  ).not.toContainText('Your shopping cart is empty!');

  // 8. Verify that a product row is visible
  const productRows = cartContent.locator('table tbody tr:visible');

  await expect(
    productRows.first(),
    'FAIL: No visible product row in the shopping cart'
  ).toBeVisible({ timeout: 5000 });

  console.log('PASS: Guest user added a product to the cart.');
});