
import { test, expect } from '@playwright/test';
// ============================================
// TC-CART-26: Test valid and expired coupon codes
// ============================================
test('TC-CART-26: Test valid and expired coupon codes', async ({ page }) => {
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
      response.request().method() === 'POST'
  );

  await addButton.click();

  const addResponse = await addResponsePromise;
  expect(addResponse.status()).toBe(200);

  // 3. Open cart
  await page.goto(
    `${base}/index.php?route=checkout/cart&language=en-gb`
  );

  await expect(page.locator('#content')).not.toContainText(
    'Your shopping cart is empty!'
  );

  
 
  // 4. Apply valid coupon: SALE2026
  const couponPanel = page.getByText('Use Coupon Code', {
    exact: true
  });

  await couponPanel.click();

  const couponInput = page.locator('#input-coupon');
  await expect(couponInput).toBeVisible();
  await couponInput.fill('SALE2026');

  const validResponsePromise = page.waitForResponse(
    response =>
      response.url().includes('coupon') &&
      response.request().method() === 'POST'
  );

  await page.getByRole('button', {
    name: 'Apply Coupon'
  }).click();

  const validResponse = await validResponsePromise;
  expect(validResponse.status()).toBe(200);

console.log(
  'Alert text:',
  await page.locator('[class*="alert"]').allTextContents()
);

console.log(
  'Body text:',
  (await page.locator('body').innerText()).slice(0, 3000)
);

  // 5. Apply expired/invalid coupon: 1111
  await couponPanel.click();

  await expect(couponInput).toBeVisible();
  await couponInput.fill('1111');

  const expiredResponsePromise = page.waitForResponse(
    response =>
      response.url().includes('coupon') &&
      response.request().method() === 'POST'
  );

  await page.getByRole('button', {
    name: 'Apply Coupon'
  }).click();

  const expiredResponse = await expiredResponsePromise;
  expect(expiredResponse.status()).toBe(200);


const successMessage = page.getByText(
  'Your coupon discount has been applied!',
  { exact: false }
);

if (await successMessage.count() > 0) {
  await expect(successMessage.first()).toBeVisible();
} else {
  console.log('Current URL:', page.url());
  console.log(
    'Visible alert text:',
    await page.locator('[class*="alert"]').allTextContents()
  );
  console.log(
    'Page text:',
    (await page.locator('body').innerText()).slice(0, 3000)
  );

  throw new Error(
    'Coupon success message was not found on the page.'
  );
}


});