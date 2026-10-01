import { test, expect } from '@playwright/test';

test('ทดสอบการค้นหาสินค้า Macbook', async ({ page }) => {
  await page.goto('http://localhost/opencart_test/');
  await page.getByRole('textbox', { name: 'Search' }).click();
  await page.getByRole('textbox', { name: 'Search' }).fill('');
  await page.getByRole('textbox', { name: 'Search' }).press('CapsLock');
  await page.getByRole('textbox', { name: 'Search' }).fill('Macbook');
  await page.getByRole('banner').getByRole('button').filter({ hasText: /^$/ }).click();
  await expect(page.locator('h4').filter({ hasText: 'Macbook' }).first()).toBeVisible();
});