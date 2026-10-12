
import { test, expect } from '@playwright/test';

// ============================================
// TC-CART-23: Remove product from cart
// ============================================
test('TC-CART-23: Remove product from cart', async ({ page }) => {
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


// ============================================
// TC-CART-24: Test valid and expired coupon codes
// ============================================
test('TC-CART-24: Test valid and expired coupon codes', async ({ page }) => {
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

  // 4. Wait for coupon response before manual interaction
  const couponResponsePromise = page.waitForResponse(
    response =>
      response.url().includes('route=extension/') &&
      response.request().method() === 'POST' &&
      response.headers()['content-type']?.includes('application/json') &&
      response.url().includes('coupon'),
    { timeout: 120000 }
  );

  // Apply coupon manually in the browser
  await page.pause();

  const couponResponse = await couponResponsePromise;
  const responseText = await couponResponse.text();

  console.log('Coupon raw response:', responseText);

  // OpenCart may prepend config text before JSON
  const jsonStart = responseText.indexOf('{');
  expect(jsonStart).toBeGreaterThanOrEqual(0);

  const couponResult = JSON.parse(
    responseText.slice(jsonStart)
  );

  console.log('Coupon response:', couponResult);

  expect(couponResponse.status()).toBe(200);
  expect(couponResult.success).toContain(
    'Your coupon discount has been applied!'
  );
});




test('TC-CART-25: Member Checkout with Saved Address', async ({ page }) => {
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



// ============================================
// TC-CART-26: Guest Checkout
// Expected: Guest can proceed through checkout.
// This test checks payment method selection.
// ============================================
test('TC-CART-26: Guest Checkout', async ({ page }) => {
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





test('TC-CART-27: Verify Customer Order History', async ({ page }) => {
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




test('TC-CART-28: Admin Login Successfully', async ({ page }) => {
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






test('TC-CART-29: Guest Adds Product to Cart', async ({ page }) => {
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


test('TC-CART-30: Update Product Stock', async ({ page }) => {
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



test('TC-CART-31: Update Customer Order Status', async ({ page }) => {
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
