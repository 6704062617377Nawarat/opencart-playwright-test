import { test, expect } from '@playwright/test';

test('TC-CART-29: Verify Customer Order History', async ({ page }) => {
  const base = 'http://localhost/opencart_test';

  // 1. เปิดหน้า Login
  await page.goto(`${base}/index.php?route=account/login&language=en-gb`);

  // 2. ล็อกอินด้วยบัญชีสมาชิกที่เคยสั่งซื้อแล้ว (ต้องมีอย่างน้อย 1 ออเดอร์)
  await page.locator('#input-email').fill('faypramika@gmail.com');
  await page.locator('#input-password').fill('fy123456');
  await page.getByRole('button', { name: 'Login' }).click();
  await expect(page).toHaveURL(/route=account\/account/);

  // 3. ไปหน้าประวัติการสั่งซื้อ ผ่านลิงก์เมนู (มี customer_token ติดมาด้วย)
  await page.getByRole('link', { name: 'Order History' }).first().click();
  await expect(page).toHaveURL(/route=account\/order/);
  await expect(page.locator('#content h1')).toContainText('Orders');

  // 4. ตรวจสอบว่ามีรายการคำสั่งซื้ออย่างน้อย 1 รายการ และมีรายละเอียดในตาราง
  const rows = page.locator('#content table tbody tr');
  await expect(rows.first()).toBeVisible();
  expect(await rows.count()).toBeGreaterThanOrEqual(1);

  // ตรวจว่าแถวแรกมีข้อมูล (Order ID, สถานะ, วันที่, ยอดรวม)
  await expect(rows.first().locator('td').first()).not.toBeEmpty();

  // 5. กดปุ่ม View (ไอคอนรูปตา) เพื่อดูรายละเอียดคำสั่งซื้อ
  const viewButton = rows.first().locator('a.btn-info, a[data-bs-original-title="View"]');
  await expect(viewButton).toBeVisible();
  await viewButton.click();

  // 6. ตรวจสอบว่าเปิดหน้ารายละเอียดคำสั่งซื้อสำเร็จ
await expect(page).toHaveURL(/route=account\/order\.info/);
await expect(page.locator('.breadcrumb')).toContainText('Order #');
await expect(page.locator('#content')).toContainText('Order ID');

  // 7. ตรวจว่ามีรายละเอียดสินค้าในคำสั่งซื้อ
  await expect(page.locator('#content table').first()).toBeVisible();
});