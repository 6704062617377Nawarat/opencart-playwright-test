import { test, expect } from '@playwright/test';

test('TC-CART-28: Guest Checkout', async ({ page }) => {
  const base = 'http://localhost/opencart_test';

  // 1. เปิดหน้าสินค้า (ไม่ล็อกอิน) แล้วเพิ่มลงตะกร้า
  await page.goto(`${base}/index.php?route=product/product&product_id=40&language=en-gb`); // iPhone
  await page.locator('#button-cart').click();
  await expect(page.locator('.alert-success')).toContainText('added');

  // 2. ไปหน้า Checkout
  await page.goto(`${base}/index.php?route=checkout/checkout&language=en-gb`);

  // 3. เลือก Guest Checkout (ถ้าระบบเปิดใช้งาน)
  const guestOption = page.getByLabel('Guest Checkout');
  await expect(guestOption).toBeVisible();
  await guestOption.check();

  // 4. กรอกข้อมูลลูกค้าและที่อยู่
  await page.locator('#input-firstname').fill('Test');
  await page.locator('#input-lastname').fill('Guest');
  await page.locator('#input-email').fill(`guest${Date.now()}@example.com`);
  await page.locator('#input-shipping-address-1').fill('123 Test Road');
  await page.locator('#input-shipping-city').fill('Bangkok');
  await page.locator('#input-shipping-postcode').fill('10110');
  await page.locator('#input-shipping-country').selectOption({ label: 'Thailand' });
  await page.locator('#input-shipping-zone').selectOption({ label: 'Bangkok' });

  await page.locator('#button-register').click();
  await expect(page.locator('.alert-danger')).toHaveCount(0);

  // 5. เลือกวิธีจัดส่ง (กดปุ่ม Choose แล้วเลือกใน modal)
await page.locator('#button-shipping-methods').click();
const shippingModal = page.locator('#modal-shipping');
await expect(shippingModal).toBeVisible();
await shippingModal.locator('input[name="shipping_method"]').first().check();
await shippingModal.locator('#button-shipping-method').click();
await expect(page.locator('#input-shipping-method')).not.toHaveValue('');

// 6. เลือกวิธีชำระเงิน (Cash On Delivery)
await page.locator('#button-payment-methods').click();
const paymentModal = page.locator('#modal-payment');
await expect(paymentModal).toBeVisible();
await paymentModal.locator('input[name="payment_method"]').first().check();
await paymentModal.locator('#button-payment-method').click();
await expect(page.locator('#input-payment-method')).not.toHaveValue('');

// 7. ยืนยันคำสั่งซื้อ
await page.locator('#button-confirm').click();

  // 8. ตรวจสอบว่าสั่งซื้อสำเร็จ
  await expect(page).toHaveURL(/route=checkout\/success/);
  await expect(page.locator('#content h1')).toContainText('Your order has been placed');
});