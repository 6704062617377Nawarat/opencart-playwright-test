import { test, expect } from '@playwright/test';

test('TC-PROD-10: ทดสอบการค้นหาสินค้าที่ไม่มีอยู่ในคีย์เวิร์ด (แสดงข้อความไม่พบสินค้า)', async ({ page }) => {
  await page.goto('http://localhost/opencart_test/');
  await page.getByRole('textbox', { name: 'Search' }).click();
  await page.getByRole('textbox', { name: 'Search' }).fill('qwertyuiop');
  
  await page.getByRole('banner').getByRole('button').filter({ hasText: /^$/ }).click();
  await expect(page).toHaveURL(/search=qwertyuiop/i);
  
  const noProductMessage = page.locator('p').filter({ hasText: 'There is no product that matches the search criteria.' });
  await expect(noProductMessage).toBeVisible();
  
  const productThumbs = page.locator('.product-thumb');
  await expect(productThumbs).toHaveCount(0);
  
});