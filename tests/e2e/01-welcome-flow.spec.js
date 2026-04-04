/**
 * E2E Test 1: Welcome Flow — استقبال مستخدم جديد
 * سيناريو: رسالة ترحيب أولى → استجابة صحيحة
 */
import { test, expect } from '@playwright/test';

test.describe('Welcome Flow — الترحيب بمستخدم جديد', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('الصفحة الرئيسية تُحمَّل بنجاح', async ({ page }) => {
    await expect(page).toHaveTitle(/قطر|Qatar/i);
    // تحقق من وجود عنصر الدردشة
    await expect(page.locator('[data-testid="chat-container"], .chat-container, #chat')).toBeVisible({ timeout: 10000 });
  });

  test('يظهر رسالة ترحيب عند فتح الصفحة', async ({ page }) => {
    // البحث عن أول رسالة في الدردشة
    const firstMessage = page.locator('.message, [data-testid="message"]').first();
    await expect(firstMessage).toBeVisible({ timeout: 5000 });
  });

  test('حقل الإدخال يعمل', async ({ page }) => {
    const input = page.locator('input[type="text"], textarea').first();
    await expect(input).toBeVisible();
    await input.click();
    await input.fill('مرحباً');
    await expect(input).toHaveValue('مرحباً');
  });
});
