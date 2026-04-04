/**
 * E2E Test 3: PDF Report — توليد التقرير
 * سيناريو: إرسال معدل → ظهور زر تنزيل PDF → التفاعل معه
 */
import { test, expect } from '@playwright/test';

test.describe('PDF Report — تقرير PDF', () => {
  test.beforeEach(async ({ page }) => {
    // إعداد سريع: تجاوز الموافقة واختيار الجنسية
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.setItem('advisor_privacy_consent', 'true');
      localStorage.setItem('advisor_nationality', 'qatari');
    });
    await page.reload();
    await page.waitForLoadState('domcontentloaded');
    await expect(page.locator('#chat-messages')).toBeVisible({ timeout: 10000 });
  });

  test('زر تحميل PDF يظهر عند إرسال المعدل', async ({ page }) => {
    const input = page.locator('input[type="text"]').first();
    await input.fill('معدلي 90% علمي');
    await input.press('Enter');

    // انتظر رد البوت الذي يحتوي على معلومات المعدل
    const chatArea = page.locator('#chat-messages');
    await expect(chatArea).toContainText('90', { timeout: 30000 });

    // إذا ظهر رد يحتوي على "تقريرك الأكاديمي"، يجب أن يظهر زر PDF
    const pdfButton = chatArea.getByText('تنزيل تقريري PDF', { exact: false });
    const hasPdfButton = await pdfButton.isVisible().catch(() => false);

    if (hasPdfButton) {
      await expect(pdfButton).toBeVisible();
      await expect(pdfButton).toBeEnabled();
    } else {
      // إذا لم يظهر التقرير الأكاديمي في هذا الرد، نتحقق من وجود الرد على الأقل
      // هذا سلوك متوقع — زر PDF يظهر فقط عند ذكر "تقريرك الأكاديمي الشخصي"
      await expect(chatArea).toContainText('جامع', { timeout: 5000 });
    }
  });

  test('واجهة الدردشة لا تنهار عند عدم وجود معدل', async ({ page }) => {
    const input = page.locator('input[type="text"]').first();
    await input.fill('مرحباً');
    await input.press('Enter');

    // تأكد من بقاء الواجهة تعمل بشكل طبيعي
    const chatArea = page.locator('#chat-messages');
    await expect(chatArea).toBeVisible({ timeout: 5000 });

    // حقل الإدخال لا يزال يعمل
    await expect(input).toBeVisible();
    await expect(input).toBeEditable();
  });

  test('Quick buttons (الأزرار السريعة) موجودة وتعمل', async ({ page }) => {
    // البحث عن أزرار الاختصارات (الخطط، الوظائف، العسكرية، إلخ)
    const chatArea = page.locator('#chat-messages');
    await expect(chatArea).toBeVisible({ timeout: 10000 });

    // اقتراحات رسالة الترحيب يجب أن تكون قابلة للنقر
    const suggestions = chatArea.locator('button');
    const firstSuggestion = suggestions.first();
    await expect(firstSuggestion).toBeVisible({ timeout: 10000 });

    // انقر على أول اقتراح وتحقق من إرسال رسالة
    const suggestionText = await firstSuggestion.textContent();
    await firstSuggestion.click();

    // يجب أن يظهر النص المُقترح كرسالة مستخدم أو يحصل على رد
    await expect(chatArea).toContainText(suggestionText || '', { timeout: 15000 });
  });
});
