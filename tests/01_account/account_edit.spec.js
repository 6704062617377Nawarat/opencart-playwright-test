import { test, expect } from '@playwright/test';

test('แก้ไขชื่อ นามสกุล และอีเมลของสมาชิก', async ({ page }, testInfo) => {
  const baseURL = String(testInfo.project.use.baseURL).replace(/\/$/, '');

  // ใส่ข้อมูลบัญชี
  await page.goto(`${baseURL}/index.php?route=account/login`);
  await page.locator('input[name="email"]').fill('faypramika@gmail.com');
  await page.locator('input[name="password"]').fill('fy123456');
  await page.getByRole('button', { name: /login/i }).click();
  await expect(page.locator('h1')).toHaveText(/my account/i);

  // เปิดหน้าแก้ไขข้อมูลส่วนตัว
  await page.locator('a[href*="route=account/edit"]').first().click();
  await expect(page).toHaveURL(/route=account\/edit/);

  // เก็บข้อมูลเดิมไว้ เพื่อคืนค่าหลังทดสอบ
  const firstNameInput = page.locator('input[name="firstname"]');
  const lastNameInput = page.locator('input[name="lastname"]');
  const emailInput = page.locator('input[name="email"]');

  const originalFirstName = await firstNameInput.inputValue();
  const originalLastName = await lastNameInput.inputValue();
  const originalEmail = await emailInput.inputValue();

  const updatedFirstName = `PW${Date.now()}`.slice(0, 32);
  const updatedLastName = 'UpdatedTest';
  const updatedEmail = `playwright.${Date.now()}@example.com`;

  // ฟังก์ชันกดบันทึกและอ่านผลตอบกลับ AJAX จาก OpenCart
  const saveProfile = async () => {
    const responsePromise = page.waitForResponse((response) =>
      response.url().includes('route=account/edit.save') &&
      response.request().method() === 'POST'
    );

    await page.getByRole('button', { name: /continue/i }).click();

    return await (await responsePromise).json();
  };

  // แก้ไขข้อมูล
  await firstNameInput.fill(updatedFirstName);
  await lastNameInput.fill(updatedLastName);
  await emailInput.fill(updatedEmail);

  const updateResult = await saveProfile();
  expect(updateResult.success).toBeTruthy();

  // โหลดหน้าใหม่เพื่อตรวจว่าข้อมูลถูกบันทึกจริง
  await page.reload();
  await expect(firstNameInput).toHaveValue(updatedFirstName);
  await expect(lastNameInput).toHaveValue(updatedLastName);
  await expect(emailInput).toHaveValue(updatedEmail);

  // คืนค่าบัญชีเดิม เพื่อให้ยังล็อกอินได้ด้วยข้อมูลเดิมเมื่อรันครั้งถัดไป
  await firstNameInput.fill(originalFirstName);
  await lastNameInput.fill(originalLastName);
  await emailInput.fill(originalEmail);

  const restoreResult = await saveProfile();
  expect(restoreResult.success).toBeTruthy();
});