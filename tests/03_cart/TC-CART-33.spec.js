import { test, expect } from '@playwright/test';

test('TC-CART-33: Update Customer Order Status', async ({ page }) => {
  const base = 'http://localhost/opencart_test';

  // 1. ล็อกอิน Admin
  await page.goto(`${base}/admin/`);
  await page.locator('#input-username').fill(process.env.OC_ADMIN_USER);
  await page.locator('#input-password').fill(process.env.OC_ADMIN_PASS);
  await page.getByRole('button', { name: 'Login' }).click();
  await expect(page).toHaveURL(/route=common\/dashboard/, { timeout: 10000 });

  await expect(page).toHaveURL(/route=common\/dashboard/, { timeout: 10000 });

// ปิด Security Notification ถ้ามี
const securityModal = page.locator('.modal.show');
if (await securityModal.isVisible({ timeout: 3000 }).catch(() => false)) {
  await securityModal.locator('button.btn-close').click();
  await expect(securityModal).toBeHidden();
}

  // 2. เปิด Sales > Orders ผ่านเมนู (user_token ติดไปกับลิงก์)
  await page.locator('#menu-sale > a').click();
  await page.locator('#menu-sale').getByRole('link', { name: 'Orders' }).click();
  await expect(page).toHaveURL(/route=sale\/order/);

  // 3. เปิดออเดอร์แรกในรายการ (Precondition: ต้องมีอย่างน้อย 1 ออเดอร์)
  const firstEdit = page.locator('#order tbody tr').first().locator('a[title="Edit"], a.btn-primary').first();
  await expect(firstEdit).toBeVisible();
  await firstEdit.click();
  await expect(page).toHaveURL(/route=sale\/order\.info/);

  // 4. เปลี่ยนสถานะเป็น Shipped แล้วบันทึก
  const statusSelect = page.locator('#input-order-status');
  await statusSelect.selectOption({ label: 'Shipped' });
  await page.locator('#button-history').click();

  // 5. ตรวจว่าบันทึกสำเร็จ
  await expect(page.locator('.alert-success')).toContainText('Success', { timeout: 10000 });

  // 6. ตรวจว่าสถานะล่าสุดแสดงในประวัติของออเดอร์
  await expect(page.locator('#history')).toContainText('Shipped');
});