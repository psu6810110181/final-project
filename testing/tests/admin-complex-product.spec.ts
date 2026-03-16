import { test, expect } from '@playwright/test';

test('Admin can add master data and a product with variants', async ({ page }) => {
  // 1. เข้าสู่ระบบ
  await page.goto('http://localhost:5173/');
  await page.getByRole('link', { name: 'เข้าสู่ระบบ' }).click();
  await page.getByRole('textbox', { name: 'ชื่อผู้ใช้' }).fill('test02');
  await page.getByRole('textbox', { name: 'รหัสผ่าน' }).fill('123456');
  await page.getByRole('button', { name: 'เข้าสู่ระบบ', exact: true }).click();

  // 2. จัดการคุณสมบัติ (Master Data)
  await page.getByRole('button', { name: '⚙️ แก้ไข/ลบคุณสมบัติ' }).click();

  // - หมวดหมู่สินค้า
  await page.getByRole('textbox', { name: 'กรอกชื่อหมวดหมู่สินค้า' }).fill('ที่นอน');
  await page.getByRole('button', { name: 'เพิ่มข้อมูล' }).click();
  await page.waitForTimeout(1000); // ⏳ รอให้ระบบบันทึกสำเร็จ

  // - ห้อง
  await page.getByRole('button', { name: 'ห้อง' }).click();
  await page.getByRole('textbox', { name: 'กรอกชื่อหมวดหมู่ห้อง' }).fill('ห้องเด็ก');
  await page.getByRole('button', { name: 'เพิ่มข้อมูล' }).click();
  await page.waitForTimeout(1000); // ⏳

  // - คุณสมบัติพิเศษ
  await page.getByRole('button', { name: 'คุณสมบัติพิเศษ' }).click();
  await page.getByRole('textbox', { name: 'กรอกชื่อคุณสมบัติพิเศษ' }).fill('ทนไฟ');
  await page.getByRole('button', { name: 'เพิ่มข้อมูล' }).click();
  await page.waitForTimeout(1000); // ⏳

  // - สี (เพิ่มสีเขียวและสีแดง)
  await page.getByRole('button', { name: 'สี' }).click();
  await page.getByRole('textbox', { name: 'กรอกชื่อสี' }).fill('เขียว');
  await page.getByRole('button', { name: 'เพิ่มข้อมูล' }).click();
  await page.waitForTimeout(1000); // ⏳ ป้องกันบอทพิมพ์สลับกันก่อน API ทำงานเสร็จ
  
  await page.getByRole('textbox', { name: 'กรอกชื่อสี' }).fill('แดง');
  await page.getByRole('button', { name: 'เพิ่มข้อมูล' }).click();
  await page.waitForTimeout(1000); // ⏳

  // - วัสดุ
  await page.getByRole('button', { name: 'วัสดุ' }).click();
  await page.getByRole('textbox', { name: 'กรอกชื่อวัสดุ' }).fill('ขนเป็ด');
  await page.getByRole('button', { name: 'เพิ่มข้อมูล' }).click();
  await page.waitForTimeout(1000); // ⏳

  // - ขนาด
  await page.getByRole('button', { name: 'ขนาด' }).click();
  await page.getByRole('textbox', { name: 'กรอกชื่อขนาด' }).fill('123 x 87 x 321 cm');
  await page.getByRole('button', { name: 'เพิ่มข้อมูล' }).click();
  await page.waitForTimeout(1000); // ⏳

  // 3. กลับมาหน้า เพิ่มสินค้าหลัก
  await page.getByRole('button', { name: '➕ เพิ่มสินค้า' }).click();
  await page.waitForTimeout(500); // รอฟอร์มเปิด

  // กรอกข้อมูลพื้นฐานและราคา
  await page.getByRole('textbox', { name: 'เช่น โซฟาผ้า' }).fill('เตียงวาติกัน');
  await page.getByRole('spinbutton').first().fill('1200'); // ราคา
  await page.getByRole('spinbutton').nth(1).fill('197');   // สต็อกหลัก

  // เลือก Dropdown (หมวดหมู่ และ ห้อง)
  await page.getByText('-- เลือก -- ▼').first().click();
  await page.getByText('ที่นอน', { exact: true }).click();
  await page.getByText('-- เลือก -- ▼').click();
  await page.getByText('ห้องเด็ก', { exact: true }).click();

  // เลือก Dropdown (สี, วัสดุ, ขนาด หลัก)
  await page.getByText('- ▼').first().click();
  await page.getByText('เขียว', { exact: true }).click();
  await page.getByText('- ▼').first().click();
  await page.getByText('ขนเป็ด', { exact: true }).click();
  await page.getByText('- ▼').first().click();
  await page.getByText('123 x 87 x 321 cm', { exact: true }).click();

  // เลือกคุณสมบัติพิเศษ และกรอกรายละเอียด
  await page.getByText('ทนไฟ', { exact: true }).click();
  await page.getByRole('textbox', { name: 'อธิบายจุดเด่น วัสดุ ขนาด' }).fill('เตียงนี้ดีมากเลยนะ');

  // อัปโหลดรูปภาพหลัก (เลื่อนหน้าจอไปหาก่อนเผื่อมองไม่เห็น)
  const uploadBox1 = page.locator('div').filter({ hasText: /^\+ อัปโหลดรูปภาพ$/ });
  await uploadBox1.scrollIntoViewIfNeeded();
  await uploadBox1.click();
  await page.locator('input[type="file"]').first().setInputFiles('shopping.jpeg');

  // 4. จัดการตัวเลือกสินค้า (Variant สีแดง)
  const variantColorDropdown = page.getByText('- ▼').first();
  await variantColorDropdown.scrollIntoViewIfNeeded();
  await variantColorDropdown.click();
  
  // ✅ ใช้ getByRole เพื่อบังคับให้มันหาคำว่า "แดง" ที่อยู่ในรายชื่อ Dropdown เท่านั้น
  await page.getByRole('listitem').getByText('แดง', { exact: true }).click();
  
  await page.getByText('- ▼').first().click();
  await page.getByRole('listitem').getByText('ขนเป็ด', { exact: true }).click();
  
  await page.getByText('- ▼').click();
  await page.getByRole('listitem').getByText('123 x 87 x 321 cm').click();

  await page.getByRole('spinbutton').nth(2).fill('1300'); // ราคา Variant
  await page.getByRole('spinbutton').nth(3).fill('40');   // สต็อก Variant

  // อัปโหลดรูปรอง
  await page.locator('label').filter({ hasText: 'เพิ่มรูป' }).click();
  await page.locator('input[type="file"]').nth(1).setInputFiles('shopping-2.jpeg');

  // 5. บันทึกสินค้าและตรวจสอบ
  await page.getByRole('button', { name: 'ยืนยันการเพิ่มสินค้า' }).click();
  
  // รอให้แจ้งเตือนสำเร็จโชว์ขึ้นมา
  await expect(page.getByText('บันทึกสินค้าสำเร็จ')).toBeVisible({ timeout: 10000 });

  // 6. ไปหน้าแรกและตรวจสอบว่าสินค้าโชว์ในหน้าเว็บ
  await page.getByRole('link', { name: 'เฟอร์นิเจอร์' }).click();
  await page.getByRole('link', { name: /เตียงวาติกัน/ }).first().click();
});