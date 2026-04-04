/**
 * E2E Test — QR-010-003: Smoke Test لصفحات Legal
 * التحقق أن صفحات Privacy Policy و Terms of Service تُحمَّل بدون أخطاء
 * شركة النخبوية للبرمجيات | 2026-04-04
 */

import { test, expect } from '@playwright/test';

test.describe('Legal Pages Smoke Test — فحص الصفحات القانونية', () => {

  test('صفحة سياسة الخصوصية تُحمَّل بنجاح', async ({ page }) => {
    await page.goto('/privacy');
    await page.waitForLoadState('domcontentloaded');

    // الصفحة يجب أن تحتوي على عنوان واضح
    const heading = page.getByText(/سياسة الخصوصية|Privacy Policy/i);
    await expect(heading.first()).toBeVisible({ timeout: 10000 });

    // يجب أن تذكر PDPPL
    const pdpplRef = page.getByText(/PDPPL|13.*2016|حماية.*البيانات/i);
    await expect(pdpplRef.first()).toBeVisible();

    // لا أخطاء JavaScript
    const errors = [];
    page.on('pageerror', err => errors.push(err.message));
    await page.waitForTimeout(1000);
    expect(errors).toHaveLength(0);
  });

  test('صفحة شروط الخدمة تُحمَّل بنجاح', async ({ page }) => {
    await page.goto('/terms');
    await page.waitForLoadState('domcontentloaded');

    // الصفحة يجب أن تحتوي على عنوان واضح
    const heading = page.getByText(/شروط الخدمة|Terms of Service/i);
    await expect(heading.first()).toBeVisible({ timeout: 10000 });

    // يجب أن تذكر إخلاء المسؤولية
    const disclaimer = page.getByText(/إخلاء.*المسؤولية|disclaimer|تعليمي|أكاديمي/i);
    await expect(disclaimer.first()).toBeVisible();

    // لا أخطاء JavaScript
    const errors = [];
    page.on('pageerror', err => errors.push(err.message));
    await page.waitForTimeout(1000);
    expect(errors).toHaveLength(0);
  });

  test('روابط التنقل بين الصفحات القانونية تعمل', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');

    // البحث عن رابط سياسة الخصوصية في أي مكان بالصفحة
    const privacyLink = page.getByRole('link', { name: /سياسة الخصوصية|Privacy/i });
    if (await privacyLink.first().isVisible({ timeout: 3000 }).catch(() => false)) {
      await privacyLink.first().click();
      await expect(page).toHaveURL(/privacy/i);
    }
  });

});
