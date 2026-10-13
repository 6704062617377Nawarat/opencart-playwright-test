import { test, expect } from '@playwright/test';

// ============================================
// TC-CART-25: Remove product from cart
// ============================================
test('TC-CART-25: Remove product from cart', async ({ page }) => {
  const base = 'http://localhost/opencart_test';

  // 1. Open homepage
  await page.goto(
    `${base}/index.php?route=common/home&language=en-gb`
  );

  // 2. Add a product to the cart
  const addButton = page.locator(
    'button[title="Add to Cart"]'
  ).first();

  await expect(addButton).toBeVisible();

  const addResponsePromise = page.waitForResponse(
    response =>
      response.url().includes('route=checkout/cart.add') &&
      response.request().method() === 'POST',
    { timeout: 10000 }
  );

  await addButton.click();

  const addResponse = await addResponsePromise;
  console.log('Add to Cart HTTP status:', addResponse.status());

  // 3. Open cart
  await page.goto(
    `${base}/index.php?route=checkout/cart&language=en-gb`
  );

  const content = page.locator('#content');

  // 4. Verify cart contains a product
  await expect(content).not.toContainText(
    'Your shopping cart is empty!'
  );

  // 5. Let tester remove product manually
  const removeButton = page.locator(
    '#output-cart a[title="Remove"]'
  );

  await expect(removeButton).toBeVisible();

  console.log('Click Remove in the browser.');
  await page.pause();

  console.log('URL after manual testing:', page.url());
  console.log(
    'Cart after manual testing:',
    await content.innerText()
  );
});