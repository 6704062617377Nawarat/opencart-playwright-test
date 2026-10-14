import { test, expect } from '@playwright/test';

test('TC-CART-27: Member Checkout with Saved Address', async ({ page }) => {
  const base = 'http://localhost/opencart_test';

  // 1. ล็อกอินสมาชิก
  await page.goto(`${base}/index.php?route=account/login&language=en-gb`);
  await page.locator('#input-email').fill('faypramika@gmail.com');
  await page.locator('#input-password').fill('fy123456');
  await page.getByRole('button', { name: 'Login' }).click();
  await expect(page).toHaveURL(/route=account\/account/);

  // 2. เพิ่มสินค้าลงตะกร้า (iPhone ไม่มี option บังคับ)
  await page.goto(`${base}/index.php?route=product/product&product_id=40&language=en-gb`);
  await page.locator('#button-cart').click();
  await expect(page.locator('.alert-success')).toContainText('added');

  // 3. เปิดหน้า Checkout
  await page.goto(`${base}/index.php?route=checkout/checkout&language=en-gb`);
// 4. ใช้ที่อยู่ที่บันทึกไว้
await expect(page.getByLabel('I want to use an existing address')).toBeChecked();

const savedAddress = page.locator('#input-shipping-address');
await expect(savedAddress).toBeVisible();

// ต้องมีที่อยู่เดิมให้เลือกอย่างน้อย 1 รายการ (นอกจาก "Please Select")
expect(await savedAddress.locator('option').count()).toBeGreaterThan(1);

// เลือกที่อยู่แรกที่บันทึกไว้
await savedAddress.selectOption({ index: 1 });
await expect(savedAddress).not.toHaveValue('');

  // 5. เลือกวิธีจัดส่ง (modal)
  await page.locator('#button-shipping-methods').click();
  const shippingModal = page.locator('#modal-shipping');
  await expect(shippingModal).toBeVisible();
  await shippingModal.locator('input[name="shipping_method"]').first().check();
  await shippingModal.locator('#button-shipping-method').click();
  await expect(page.locator('#input-shipping-method')).not.toHaveValue('');

  // 6. เลือกวิธีชำระเงิน (modal)
  await page.locator('#button-payment-methods').click();
  const paymentModal = page.locator('#modal-payment');
  await expect(paymentModal).toBeVisible();
  await paymentModal.locator('input[name="payment_method"]').first().check();
  await paymentModal.locator('#button-payment-method').click();
  await expect(page.locator('#input-payment-method')).not.toHaveValue('');

  // 7. ยืนยันคำสั่งซื้อ
  await page.locator('#button-confirm').click();

  // 8. ตรวจหน้าผลสำเร็จ
  await expect(page).toHaveURL(/route=checkout\/success/);
  await expect(page.locator('#content h1')).toContainText('Your order has been placed');
});