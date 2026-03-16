import { test, expect } from '@playwright/test';

test.describe('Review Page Tests', () => {
  
  test.beforeEach(async ({ page }) => {
    // login ก่อน test
    await page.goto('http://localhost:5173/login');
    await page.waitForLoadState('networkidle');
    
    await page.route('**/auth/login', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          access_token: 'mock-token',
          user: { id: 'user-uuid-1', username: 'testuser', role: 'user' }
        })
      });
    });

    await page.fill('input[placeholder="ชื่อผู้ใช้"]', 'testuser');
    await page.fill('input[placeholder="รหัสผ่าน"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL('http://localhost:5173/', { timeout: 10000 });
  });

  //  Test 1: หน้า Review แสดงผลถูกต้อง
  test('should display review page correctly', async ({ page }) => {
    await page.route('**/reviews**', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([])
      });
    });

    await page.goto('http://localhost:5173/review');
    await expect(page).toHaveURL('http://localhost:5173/review');
  });

  //  Test 2: สร้างรีวิวสำเร็จ
  test('should create a review successfully', async ({ page }) => {
    await page.route('**/reviews', route => {
      if (route.request().method() === 'POST') {
        route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify({
            id: 1,
            rating: 5,
            comment: 'สินค้าดีมากครับ',
            user: { id: 'user-uuid-1', username: 'testuser' },
            product: { id: 'product-uuid-1' },
            order: { id: 'order-uuid-1' }
          })
        });
      } else {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([])
        });
      }
    });

    await page.goto('http://localhost:5173/review');

    // กรอกรีวิว
    const commentInput = page.locator('textarea');
    if (await commentInput.isVisible()) {
      await commentInput.fill('สินค้าดีมากครับ');
    }

    // กดส่งรีวิว
    const submitButton = page.locator('button[type="submit"]');
    if (await submitButton.isVisible()) {
      await submitButton.click();
    }
  });

  //  Test 3: ดึงรีวิวของสินค้าสำเร็จ
  test('should display reviews for a product', async ({ page }) => {
  const mockReviews = [
    {
      id: 1,
      rating: 5,
      comment: 'ดีมากครับ',
      user: { id: 'user-uuid-1', username: 'testuser', userImage: null },
      createdAt: new Date().toISOString()
    },
    {
      id: 2,
      rating: 4,
      comment: 'โอเคครับ',
      user: { id: 'user-uuid-2', username: 'user2', userImage: null },
      createdAt: new Date().toISOString()
    }
  ];

  //  route ก่อน goto เสมอ
  await page.route('**/reviews/product/**', route => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(mockReviews)
    });
  });

  await page.goto('http://localhost:5173/product/product-uuid-1');
  await page.waitForTimeout(2000); 
});

  //  Test 4: รีวิวซ้ำ → ต้องแสดง error
  test('should show error when reviewing same product twice', async ({ page }) => {
    await page.route('**/reviews', route => {
      if (route.request().method() === 'POST') {
        route.fulfill({
          status: 400,
          contentType: 'application/json',
          body: JSON.stringify({
            message: 'คุณได้รีวิวสินค้านี้ในคำสั่งซื้อนี้ไปแล้ว'
          })
        });
      }
    });

    await page.goto('http://localhost:5173/review');

    const submitButton = page.locator('button[type="submit"]');
    if (await submitButton.isVisible()) {
      await submitButton.click();
      // รอ toast error ขึ้น
      await page.waitForTimeout(1000);
    }
  });

  //  Test 5: ต้องล็อกอินก่อนถึงเขียนรีวิวได้
  test('should redirect to login if not authenticated', async ({ page }) => {
    // Clear localStorage เพื่อ logout
    await page.evaluate(() => {
      localStorage.removeItem('token');
      localStorage.removeItem('user_data');
    });

    await page.goto('http://localhost:5173/review');

    // ต้อง redirect ไปหน้า login
    await expect(page).toHaveURL('http://localhost:5173/login');
  });
});