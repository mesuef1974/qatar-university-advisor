/**
 * E2E Test 5: System Resilience — صمود النظام
 * سيناريو: التطبيق يبقى يعمل حتى عند أخطاء الشبكة وأحجام الشاشة المختلفة
 */
import { test, expect } from '@playwright/test';

test.describe('System Resilience — صمود النظام', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.setItem('advisor_privacy_consent', 'true');
      localStorage.setItem('advisor_nationality', 'qatari');
    });
  });

  test('الصفحة تُحمَّل حتى بدون اتصال API', async ({ page }) => {
    // محاكاة فشل كل طلبات API
    await page.route('**/api/**', route => route.abort('connectionrefused'));

    await page.reload();
    await page.waitForLoadState('domcontentloaded');

    // الصفحة الرئيسية يجب أن تُحمَّل بنجاح
    await expect(page).toHaveURL(/\//);
    await expect(page).toHaveTitle(/المرشد الأكاديمي|Qatar University Advisor/i);

    // واجهة الدردشة يجب أن تظهر (التطبيق يعمل محلياً)
    await expect(page.locator('#chat-messages')).toBeVisible({ timeout: 10000 });

    // حقل الإدخال يجب أن يكون متاحاً
    const input = page.locator('input[type="text"]').first();
    await expect(input).toBeVisible();
    await expect(input).toBeEditable();
  });

  test('لا توجد أخطاء JavaScript غير معالجة عند التحميل', async ({ page }) => {
    const jsErrors = [];
    page.on('pageerror', err => jsErrors.push(err.message));

    await page.reload();
    await page.waitForLoadState('networkidle');

    // انتظر لرصد أي أخطاء متأخرة
    await page.waitForTimeout(2000);

    // لا يجب أن توجد أخطاء JS غير معالجة
    expect(jsErrors).toHaveLength(0);
  });

  test('الصفحة تعمل على الموبايل (375x667)', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.reload();
    await page.waitForLoadState('domcontentloaded');

    // الواجهة يجب أن تظهر بشكل صحيح
    await expect(page.locator('#chat-messages')).toBeVisible({ timeout: 10000 });

    // حقل الإدخال يجب أن يكون مرئياً ويعمل
    const input = page.locator('input[type="text"]').first();
    await expect(input).toBeVisible();

    // زر الإرسال مرئي
    const sendButton = page.locator('button[type="submit"]').first();
    await expect(sendButton).toBeVisible();
  });

  test('الصفحة تعمل على التابلت (768x1024)', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.reload();
    await page.waitForLoadState('domcontentloaded');

    // الواجهة يجب أن تظهر
    await expect(page.locator('#chat-messages')).toBeVisible({ timeout: 10000 });
    const input = page.locator('input[type="text"]').first();
    await expect(input).toBeVisible();
  });

  test('الصفحة تعمل على شاشة عريضة (1440x900)', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.reload();
    await page.waitForLoadState('domcontentloaded');

    // على الشاشة العريضة يظهر اللوحة الجانبية مع الدردشة
    await expect(page.locator('#chat-messages')).toBeVisible({ timeout: 10000 });

    // لوحة المعلومات الجانبية تظهر على الشاشات العريضة
    const brandingText = page.getByText('المستشار الجامعي الذكي');
    await expect(brandingText.first()).toBeVisible();
  });

  test('إعادة تحميل الصفحة لا تكسر الواجهة', async ({ page }) => {
    await page.reload();
    await page.waitForLoadState('domcontentloaded');

    // الدردشة تعمل بعد إعادة التحميل
    await expect(page.locator('#chat-messages')).toBeVisible({ timeout: 10000 });

    const input = page.locator('input[type="text"]').first();
    await expect(input).toBeVisible();

    // يمكن إرسال رسالة بعد إعادة التحميل
    await input.fill('مرحبا');
    await expect(input).toHaveValue('مرحبا');
  });

  test('اتجاه الصفحة RTL صحيح', async ({ page }) => {
    await page.reload();
    await page.waitForLoadState('domcontentloaded');

    // التطبيق يستخدم dir="rtl"
    const mainContent = page.locator('#main-content');
    await expect(mainContent).toBeVisible({ timeout: 10000 });
    await expect(mainContent).toHaveAttribute('dir', 'rtl');
  });
});
