import { test, expect } from '@playwright/test';

test('ทดสอบการสร้างโปรโมชั่น', async ({ page }) => {
  // 1. เข้าสู่ระบบ
  await page.goto('http://localhost:5173/');
  await page.getByRole('link', { name: 'เข้าสู่ระบบ' }).click();
  await page.getByRole('textbox', { name: 'ชื่อผู้ใช้' }).fill('admin01');
  await page.getByRole('textbox', { name: 'รหัสผ่าน' }).fill('Ab1234567891');
  await page.getByRole('button', { name: 'เข้าสู่ระบบ', exact: true }).click();

  // 2. นำทางไปยังหน้าจัดการโปรโมชั่น
  await page.getByRole('button', { name: '🎯 จัดการโปรโมชั่น' }).click();
  await page.getByRole('button', { name: '➕ สร้างโปรโมชั่นใหม่' }).click();

  // 3. กรอกข้อมูลโปรโมชั่น
  await page.getByRole('combobox').selectOption('SUMMER');
  await page.getByText('เปอร์เซ็นต์ (%)', { exact: true }).first().click();
  await page.getByPlaceholder('เช่น 20 (สูงสุด 90%)').fill('20.00');
  await page.getByRole('checkbox', { name: 'Bed ฿10,000 • เตียง' }).check();

  // 💡 [เพิ่มใหม่] เลือกว่าเป็น Seasonal Promotion (แก้ชื่อปุ่มให้ตรงกับในระบบถ้าจำเป็น)
  await page.getByRole('button', { name: 'Seasonal Promotion' }).click();

  // 4. กรอกวัน/เวลา (ใช้เวลาปัจจุบัน + เผื่อเวลาอนาคตเพื่อหลบ Validation)
  const now = new Date();
  // 💡 บวกเวลาเพิ่มไป 10 นาที (เพื่อให้แน่ใจว่าเป็นอนาคตแน่นอนเมื่อกด submit)
  now.setMinutes(now.getMinutes() + 10); 

  // ปรับ Timezone และ Format ให้ตรงกับ input type="datetime-local" (YYYY-MM-DDTHH:mm)
  const tzOffset = now.getTimezoneOffset() * 60000;
  const startTime = (new Date(now.getTime() - tzOffset)).toISOString().slice(0, 16);
  
  // เวลาสิ้นสุด (บวกไป 3 วันจากเวลาเริ่มต้น)
  const endDate = new Date(now.getTime());
  endDate.setDate(endDate.getDate() + 3);
  const endTime = (new Date(endDate.getTime() - tzOffset)).toISOString().slice(0, 16);

  // กรอกข้อมูลลงช่อง
  await page.locator('input[type="datetime-local"]').first().fill(startTime); 
  await page.locator('input[type="datetime-local"]').nth(1).fill(endTime);

  // 5. รายละเอียดเพิ่มเติมและกดบันทึก
  await page.getByRole('textbox', { name: 'รายละเอียดเพิ่มเติม' }).fill('1234');
  
  // 💡 [เพิ่มใหม่] สั่งให้เสียโฟกัสจากช่องพิมพ์ เพื่อให้ React อัปเดตข้อมูลให้สมบูรณ์ก่อนกด Submit
  await page.locator('body').click(); 

  // กดปุ่มบันทึก
  await page.getByRole('button', { name: 'สร้างโปรโมชั่น' }).click();

  // 6. รอให้ปุ่ม "สร้างโปรโมชั่น" (ปุ่ม Submit) หายไป 
  await expect(page.getByRole('button', { name: 'สร้างโปรโมชั่น', exact: true })).toBeHidden({ timeout: 10000 });

  // 7. ตรวจสอบผลลัพธ์ว่ามีข้อมูลโผล่มาในตารางแล้ว
  await expect(page.getByRole('cell', { name: 'Summer (ฤดูร้อน)' }).first()).toBeVisible();
});