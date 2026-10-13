import { test, expect } from '@playwright/test';

test('เมนูใช้งานได้บนหน้าจอมือถือ', async ({ page }, testInfo) => {
  const baseURL = String(testInfo.project.use.baseURL).replace(/\/$/, '');

  // จำลองขนาดหน้าจอมือถือ
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(`${baseURL}/`);

  // ปุ่มแฮมเบอร์เกอร์ของเมนู OpenCart
  const menuButton = page.locator(
    'button.navbar-toggler[data-bs-target="#navbar-menu"]'
  );
  const menu = page.locator('#navbar-menu');

  await expect(menuButton).toBeVisible();

  // กดเปิดเมนู แล้วรอให้ animation เปิดเสร็จ
  await menuButton.click();
  await expect(menu).toHaveClass(/show/);

// กดปิดเมนู แล้วตรวจว่าเมนูซ่อนแล้ว
  await menuButton.click();
  await expect(menu).toBeHidden();
});