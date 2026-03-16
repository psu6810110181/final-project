import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('http://localhost:5173/');
  await page.getByRole('link', { name: 'เข้าสู่ระบบ' }).click();
  await page.getByRole('textbox', { name: 'ชื่อผู้ใช้' }).fill('abcdef');
  await page.getByRole('textbox', { name: 'รหัสผ่าน' }).fill('Abcdefghij123!');
  await page.getByRole('button', { name: 'เข้าสู่ระบบ', exact: true }).click();
});

test('Flow สั่งซื้อและชำระเงิน', async ({ page }) => {
  await page.getByRole('button').filter({ hasText: /^$/ }).nth(5).click();
  await expect(page.getByText('เพิ่มลงตะกร้าแล้ว!')).toBeVisible();
  await page.locator('a[href="/cart"]').first().click();

  await page.getByText('คลิกเพื่อเพิ่มที่อยู่จัดส่ง').click();
  await page.getByRole('textbox', { name: 'บ้านเลขที่, ถนน, ตำบล, อำเภอ, จังหวัด, รหัสไปรษณีย์' }).fill('123');
  await page.getByRole('button', { name: 'ยืนยันที่อยู่' }).click();
  await page.getByRole('button', { name: 'ดำเนินการชำระเงิน' }).click();

  await page.waitForURL(/.*checkout\.stripe\.com.*/, { timeout: 15000 });
  await page.waitForLoadState('load');
  await page.setViewportSize({ width: 1280, height: 900 });
  await expect(page.getByTestId('hosted-payment-submit-button')).toBeVisible({ timeout: 15000 });

  // กรอกอีเมล
  const randomEmail = `test_${Date.now()}@example.com`;
  await page.locator('#email').fill(randomEmail);
  await page.keyboard.press('Tab');
  await page.waitForTimeout(1000);

  // คลิก PromptPay แล้วกลับมา Card เพื่อ expand form
  await page.evaluate(() => {
    (document.querySelector('[data-testid="promptpay-accordion-item-button"]') as HTMLElement)
      ?.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window }));
  });
  await page.waitForTimeout(1000);
  await page.evaluate(() => {
    (document.querySelector('[data-testid="card-accordion-item-button"]') as HTMLElement)
      ?.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window }));
  });
  await page.waitForTimeout(2000);

  // กรอกบัตร
  await page.getByPlaceholder('1234 1234 1234 1234').fill('4242424242424242');
  await page.getByPlaceholder('MM / YY').fill('01/50');
  await page.getByPlaceholder('CVC').fill('235');
  await page.getByPlaceholder('Full name on card').fill('Test User');

  // กดชำระเงิน
  await page.getByTestId('hosted-payment-submit-button').click();

  // ✅ ใช้ .first() เพื่อหลีกเลี่ยง strict mode violation
  await expect(page.getByText('ชำระเงินแล้ว').first()).toBeVisible({ timeout: 20000 });
});