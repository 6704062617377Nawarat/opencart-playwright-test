import { test, expect } from '@playwright/test';

test('ทดสอบการจัดเรียงสินค้าจากราคาต่ำไปสูง (Sort by Price: Low to High)', async ({ page }) => {
  // 1. ไปหน้า Laptops & Notebooks
  await page.goto('http://localhost/opencart_test/');
  await page.getByRole('link', { name: 'Laptops & Notebooks' }).click();
  await page.getByRole('link', { name: 'Show All Laptops & Notebooks' }).click();

  // 2. เลือกการจัดเรียงสินค้าจากราคาต่ำไปสูง
  await page.getByRole('combobox', { name: 'Sort By' }).selectOption({ label: 'Price (Low > High)' });
  await expect(page).toHaveURL(/sort=p.price&order=ASC/i);

  // 3. ตรวจสอบว่าหน้าจอแสดงสินค้าที่ถูกจัดเรียงจากราคาต่ำไปสูง
  const productPrices = await page.$$eval('.product-thumb .price', (priceElements) => {
    return priceElements.map(el => {
      const mainPriceText = el.innerText.split('\n')[0];
      return parseFloat(mainPriceText.replace(/[^0-9.-]+/g, ''));
    });
  });

  // สร้าง Array ใหม่มาเรียงตัวเลขจากน้อยไปมาก เพื่อไว้เป็นตัวเทียบ
  const sortedPrices = [...productPrices].sort((a, b) => a - b);

  // ตรวจสอบว่าราคาบนหน้าเว็บ (productPrices) เรียงถูกต้องเหมือน Array ที่เราคำนวณไว้ (sortedPrices) หรือไม่
  expect(productPrices).toEqual(sortedPrices);
});