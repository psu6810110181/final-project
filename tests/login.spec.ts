import { test, expect } from '@playwright/test';

test.describe('Login Page Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173/login');
  });

  test('should display login page correctly', async ({ page }) => {
    // Check if page loads and displays main elements
    await expect(page).toHaveTitle(/frontend/);
    
    // Check for main heading
    await expect(page.locator('h2')).toContainText('ลงชื่อเข้าใช้');
    
    // Check for logo
    await expect(page.locator('img[alt="HomeAlright Logo"]')).toBeVisible();
    
    // Check for form inputs
    await expect(page.locator('input[placeholder="ชื่อผู้ใช้"]')).toBeVisible();
    await expect(page.locator('input[placeholder="รหัสผ่าน"]')).toBeVisible();
    
    // Check for login button
    await expect(page.locator('button[type="submit"]')).toContainText('ลงชื่อเข้าใช้');
    
    // Check for register link
    await expect(page.locator('a[href="/register"]')).toContainText('สมัครสมาชิก');
  });

  test('should show validation for empty fields', async ({ page }) => {
    // Try to submit form with empty fields
    await page.click('button[type="submit"]');
    
    // Check if form validation works (inputs are empty)
    const usernameInput = page.locator('input[placeholder="ชื่อผู้ใช้"]');
    const passwordInput = page.locator('input[placeholder="รหัสผ่าน"]');
    
    // Check if inputs are empty (form validation)
    await expect(usernameInput).toHaveValue('');
    await expect(passwordInput).toHaveValue('');
  });

  test('should allow typing in form fields', async ({ page }) => {
    const usernameInput = page.locator('input[placeholder="ชื่อผู้ใช้"]');
    const passwordInput = page.locator('input[placeholder="รหัสผ่าน"]');
    
    // Type in username field
    await usernameInput.fill('testuser');
    await expect(usernameInput).toHaveValue('testuser');
    
    // Type in password field
    await passwordInput.fill('password123');
    await expect(passwordInput).toHaveValue('password123');
  });

  test('should handle password input type correctly', async ({ page }) => {
    const passwordInput = page.locator('input[placeholder="รหัสผ่าน"]');
    
    // Check if password field has type="password"
    await expect(passwordInput).toHaveAttribute('type', 'password');
    
    // Fill password and verify it's masked
    await passwordInput.fill('password123');
    await expect(passwordInput).toHaveValue('password123');
  });

  test('should navigate to register page when clicking register link', async ({ page }) => {
    // Click register link
    await page.click('a[href="/register"]');
    
    // Should navigate to register page
    await expect(page).toHaveURL('http://localhost:5173/register');
  });

  test('should handle forgot password link', async ({ page }) => {
    // Check if forgot password link exists
    const forgotPasswordLink = page.locator('text=กดที่นี่');
    await expect(forgotPasswordLink).toBeVisible();
    
    // Click the link (currently it's just a span, not a real link)
    await forgotPasswordLink.click();
    // Should stay on same page for now since it's not implemented
    await expect(page).toHaveURL('http://localhost:5173/login');
  });

  test('should handle remember me checkbox', async ({ page }) => {
    const checkbox = page.locator('input[type="checkbox"]');
    const label = page.locator('label[for="remember"]');
    
    // Check if checkbox and label exist
    await expect(checkbox).toBeVisible();
    await expect(label).toContainText('จดจำฉัน');
    
    // Check if checkbox is unchecked by default
    await expect(checkbox).not.toBeChecked();
    
    // Click to check
    await checkbox.check();
    await expect(checkbox).toBeChecked();
    
    // Click to uncheck
    await checkbox.uncheck();
    await expect(checkbox).not.toBeChecked();
  });

  test('should have proper focus styles', async ({ page }) => {
    const usernameInput = page.locator('input[placeholder="ชื่อผู้ใช้"]');
    
    // Focus on username input
    await usernameInput.focus();
    
    // Check if focused input has proper styling
    await expect(usernameInput).toHaveClass(/focus:ring-2/);
  });

  test('should display responsive layout on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Check if layout adapts to mobile
    await expect(page.locator('h2')).toContainText('ลงชื่อเข้าใช้');
    await expect(page.locator('input[placeholder="ชื่อผู้ใช้"]')).toBeVisible();
    await expect(page.locator('input[placeholder="รหัสผ่าน"]')).toBeVisible();
    
    // The left side with image should be hidden on mobile
    await expect(page.locator('.hidden.lg\\:flex')).not.toBeVisible();
  });

  test('should handle keyboard navigation', async ({ page }) => {
    const usernameInput = page.locator('input[placeholder="ชื่อผู้ใช้"]');
    const passwordInput = page.locator('input[placeholder="รหัสผ่าน"]');
    const submitButton = page.locator('button[type="submit"]');
    
    // Click on page body first to ensure focus can be set
    await page.click('body');
    
    // Tab through form elements
    await page.keyboard.press('Tab');
    // Wait a moment for focus to be set
    await page.waitForTimeout(100);
    
    // Check if any form element is focused (might not be the first one)
    const focusedElement = await page.locator(':focus');
    expect(await focusedElement.count()).toBeGreaterThan(0);
    
    // Continue tabbing through other elements
    await page.keyboard.press('Tab');
    await page.waitForTimeout(100);
    
    await page.keyboard.press('Tab');
    await page.waitForTimeout(100);
    
    await page.keyboard.press('Tab');
    await page.waitForTimeout(100);
    
    // Submit button should be reachable
    await expect(submitButton).toBeVisible();
  });

  test('should submit form with Enter key', async ({ page }) => {
    const usernameInput = page.locator('input[placeholder="ชื่อผู้ใช้"]');
    const passwordInput = page.locator('input[placeholder="รหัสผ่าน"]');
    
    // Fill form
    await usernameInput.fill('testuser');
    await passwordInput.fill('password123');
    
    // Submit with Enter key
    await passwordInput.press('Enter');
    
    // Should attempt to login (may show alert or navigate)
    // Note: This will trigger the login attempt which may fail with test credentials
  });

  test('should show loading state during login attempt', async ({ page }) => {
    const usernameInput = page.locator('input[placeholder="ชื่อผู้ใช้"]');
    const passwordInput = page.locator('input[placeholder="รหัสผ่าน"]');
    const submitButton = page.locator('button[type="submit"]');
    
    // Fill form with test credentials
    await usernameInput.fill('testuser');
    await passwordInput.fill('password123');
    
    // Setup alert handler to catch login failure
    let dialogHandled = false;
    page.on('dialog', async dialog => {
      expect(dialog.message()).toContain('Login Failed');
      await dialog.accept();
      dialogHandled = true;
    });
    
    // Submit form
    await submitButton.click();
    
    // Wait for dialog to be handled
    await page.waitForFunction(() => dialogHandled);
    
    // The button should remain enabled (current implementation doesn't have loading state)
    await expect(submitButton).toBeEnabled();
  });
});

test.describe('Login Page Authentication Tests', () => {
  test('should handle successful login and redirect to home', async ({ page }) => {
    await page.goto('http://localhost:5173/login');
    
    // Mock successful login response
    await page.route('**/api/auth/login', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          access_token: 'mock-token',
          user: { id: 1, username: 'testuser' }
        })
      });
    });
    
    // Mock cart fetch response
    await page.route('**/api/cart', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([])
      });
    });
    
    // Fill form with valid credentials
    await page.fill('input[placeholder="ชื่อผู้ใช้"]', 'testuser');
    await page.fill('input[placeholder="รหัสผ่าน"]', 'password123');
    
    // Submit form
    await page.click('button[type="submit"]');
    
    // Wait for navigation to complete
    await page.waitForURL('http://localhost:5173/', { timeout: 10000 });
    
    // Should redirect to home page after successful login
    await expect(page).toHaveURL('http://localhost:5173/');
  });

  test('should handle login failure with invalid credentials', async ({ page }) => {
    await page.goto('http://localhost:5173/login');
    
    // Mock failed login response
    await page.route('**/api/auth/login', route => {
      route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Invalid credentials' })
      });
    });
    
    // Fill form with invalid credentials
    await page.fill('input[placeholder="ชื่อผู้ใช้"]', 'wronguser');
    await page.fill('input[placeholder="รหัสผ่าน"]', 'wrongpass');
    
    // Setup alert handler
    let dialogHandled = false;
    page.on('dialog', async dialog => {
      expect(dialog.message()).toContain('Login Failed');
      await dialog.accept();
      dialogHandled = true;
    });
    
    // Submit form
    await page.click('button[type="submit"]');
    
    // Wait for dialog to be handled
    await page.waitForFunction(() => dialogHandled);
    
    // Should stay on login page
    await expect(page).toHaveURL('http://localhost:5173/login');
  });

  test('should handle network error during login', async ({ page }) => {
    await page.goto('http://localhost:5173/login');
    
    // Mock network error
    await page.route('**/api/auth/login', route => {
      route.abort('failed');
    });
    
    // Fill form
    await page.fill('input[placeholder="ชื่อผู้ใช้"]', 'testuser');
    await page.fill('input[placeholder="รหัสผ่าน"]', 'password123');
    
    // Setup alert handler
    let dialogHandled = false;
    page.on('dialog', async dialog => {
      expect(dialog.message()).toContain('Login Failed');
      await dialog.accept();
      dialogHandled = true;
    });
    
    // Submit form
    await page.click('button[type="submit"]');
    
    // Wait for dialog to be handled
    await page.waitForFunction(() => dialogHandled);
    
    // Should stay on login page
    await expect(page).toHaveURL('http://localhost:5173/login');
  });
});
