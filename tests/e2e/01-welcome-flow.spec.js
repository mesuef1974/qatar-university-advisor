/**
 * E2E Test 1: Welcome Flow — استقبال مستخدم جديد
 * سيناريو: موافقة الخصوصية → اختيار الجنسية → رسالة ترحيب → حقل الإدخال
 */
import { test, expect } from '@playwright/test';

test.describe('Welcome Flow — الترحيب بمستخدم جديد', () => {
  test.beforeEach(async ({ page }) => {
    // مسح localStorage لضمان ظهور شاشة الموافقة
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
    await page.reload();
    await page.waitForLoadState('domcontentloaded');
  });

  test('الصفحة الرئيسية تُحمَّل بنجاح مع العنوان الصحيح', async ({ page }) => {
    await expect(page).toHaveTitle(/المرشد الأكاديمي|Qatar University Advisor/i);
  });

  test('شاشة الموافقة على الخصوصية تظهر أولاً', async ({ page }) => {
    // يجب أن يظهر عنوان "المستشار الجامعي الذكي" في شاشة الموافقة
    const heading = page.locator('h1');
    await expect(heading).toBeVisible({ timeout: 10000 });
    await expect(heading).toContainText('المستشار الجامعي الذكي');

    // يجب أن يظهر زر الموافقة
    const acceptButton = page.getByText('أوافق وأبدأ الاستخدام', { exact: false });
    await expect(acceptButton).toBeVisible();
  });

  test('الموافقة تنتقل لشاشة اختيار الجنسية', async ({ page }) => {
    // اضغط على زر الموافقة
    const acceptButton = page.getByText('أوافق وأبدأ الاستخدام', { exact: false });
    await expect(acceptButton).toBeVisible({ timeout: 10000 });
    await acceptButton.click();

    // يجب أن تظهر شاشة اختيار الجنسية
    const nationalityPrompt = page.getByText('اختر نوع إقامتك للمتابعة', { exact: false });
    await expect(nationalityPrompt).toBeVisible({ timeout: 5000 });

    // يجب أن يظهر زرا الاختيار
    const qatariButton = page.getByText('قطري / قطرية', { exact: false });
    const residentButton = page.getByText('مقيم في قطر', { exact: false });
    await expect(qatariButton).toBeVisible();
    await expect(residentButton).toBeVisible();
  });

  test('اختيار "قطري" يعرض رسالة ترحيب مخصصة', async ({ page }) => {
    // الموافقة على الخصوصية
    await page.getByText('أوافق وأبدأ الاستخدام', { exact: false }).click();
    await page.waitForLoadState('networkidle');

    // اختيار قطري
    const qatariButton = page.getByText('قطري / قطرية', { exact: false });
    await expect(qatariButton).toBeVisible({ timeout: 5000 });
    await qatariButton.click();

    // يجب أن تظهر رسالة ترحيب للقطري تحتوي على معلومات ذات صلة
    const welcomeMessage = page.locator('#chat-messages').first();
    await expect(welcomeMessage).toBeVisible({ timeout: 10000 });
    await expect(welcomeMessage).toContainText('المستشار الجامعي الذكي');
    await expect(welcomeMessage).toContainText('مجانية');
  });

  test('حقل الإدخال يعمل ويقبل النص العربي', async ({ page }) => {
    // تجاوز شاشات الموافقة والجنسية
    await page.getByText('أوافق وأبدأ الاستخدام', { exact: false }).click();
    await page.getByText('قطري / قطرية', { exact: false }).click();

    // انتظر ظهور حقل الإدخال
    const input = page.locator('input[type="text"]').first();
    await expect(input).toBeVisible({ timeout: 10000 });
    await expect(input).toBeEditable();

    // اكتب نصاً وتحقق من القيمة
    await input.fill('مرحباً');
    await expect(input).toHaveValue('مرحباً');
  });

  test('زر الإرسال موجود وقابل للنقر', async ({ page }) => {
    // تجاوز شاشات الموافقة والجنسية
    await page.getByText('أوافق وأبدأ الاستخدام', { exact: false }).click();
    await page.getByText('قطري / قطرية', { exact: false }).click();

    const sendButton = page.locator('button[type="submit"]').first();
    await expect(sendButton).toBeVisible({ timeout: 10000 });
    await expect(sendButton).toBeEnabled();
  });
});
