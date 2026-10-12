import { test, expect } from '@playwright/test';

test('TC-PROD-09: ทดสอบการค้นหาสินค้า Macbook', async ({ page }) => {
  await page.goto('http://localhost/opencart_test/');
  await page.getByRole('textbox', { name: 'Search' }).click();
  await page.getByRole('textbox', { name: 'Search' }).fill('Macbook');
  await page.getByRole('banner').getByRole('button').filter({ hasText: /^$/ }).click();
const productTitle = page.locator('.product-thumb h4 a').filter({ hasText: /MacBook/i }).first();
await expect(productTitle).toBeVisible();
});