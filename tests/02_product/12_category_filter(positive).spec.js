import { test, expect } from '@playwright/test';

test('TC-PROD-12: ทดสอบการกรองสินค้าตามหมวดหมู่ (Categories) แถบเมนูหลักด้านบน', async ({ page }) => {

 // 1. ไปที่หน้าแรก
  await page.goto('http://localhost/opencart_test/');

  // 2. คลิกเมนูหลัก "Laptops & Notebooks" บนแถบ Navigation
  await page.getByRole('link', { name: 'Laptops & Notebooks' }).click();

  // 3. คลิกเลือก "Show All Laptops & Notebooks" 
  await page.getByRole('link', { name: 'Show All Laptops & Notebooks' }).click();

  // Expected Result
  await expect(page).toHaveURL(/route=product\/category/i);

  // ตรวจสอบ 1: หัวข้อหลัก (h1) ของหน้าเว็บเปลี่ยนเป็นข้อความ "Laptops & Notebooks"
  const pageHeading = page.locator('#content h1');
  await expect(pageHeading).toHaveText('Laptops & Notebooks');

  // ตรวจสอบ 2: เมนูด้านซ้ายมือ (Sidebar) จะต้องไฮไลต์ข้อความ "Laptops & Notebooks"
  // (ใน OpenCart ตัวที่ถูกเลือกมักจะมีคลาส .active อยู่)
  const activeSidebarItem = page.locator('.list-group a.active');
  await expect(activeSidebarItem).toContainText('Laptops & Notebooks');
});