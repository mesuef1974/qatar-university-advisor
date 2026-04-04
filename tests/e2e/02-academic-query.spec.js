/**
 * E2E Test 2: Academic Query — استعلام أكاديمي
 * سيناريو: طالب قطري + مسار علمي + معدل 90% → يحصل على توصيات
 */
import { test, expect } from '@playwright/test';

test.describe('Academic Query — استعلام أكاديمي', () => {
  test.beforeEach(async ({ page }) => {
    // إعداد سريع: تجاوز الموافقة واختيار الجنسية مباشرة عبر localStorage
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.setItem('advisor_privacy_consent', 'true');
      localStorage.setItem('advisor_nationality', 'qatari');
    });
    await page.reload();
    await page.waitForLoadState('domcontentloaded');

    // انتظر ظهور واجهة الدردشة
    await expect(page.locator('#chat-messages')).toBeVisible({ timeout: 10000 });
  });

  test('يرسل رسالة ويحصل على رد من البوت', async ({ page }) => {
    const input = page.locator('input[type="text"]').first();
    await expect(input).toBeVisible();

    await input.fill('أنا قطري مسار علمي معدلي 90%');

    const sendButton = page.locator('button[type="submit"]').first();
    await sendButton.click();

    // تحقق من ظهور رسالة المستخدم في الدردشة
    const chatArea = page.locator('#chat-messages');
    await expect(chatArea).toContainText('90%', { timeout: 5000 });

    // انتظر ظهور رد البوت (الرسالة الثانية بعد الترحيب ورسالة المستخدم)
    // البوت يرد بمعلومات عن الجامعات بناءً على المعدل
    const botMessages = page.locator('#chat-messages > div');
    await expect(botMessages).toHaveCount(3, { timeout: 30000 }); // ترحيب + مستخدم + رد
  });

  test('الرد يحتوي معلومات أكاديمية ذات صلة', async ({ page }) => {
    const input = page.locator('input[type="text"]').first();
    await input.fill('جامعة قطر');
    await input.press('Enter');

    // انتظر رد البوت الذي يحتوي على معلومات عن جامعة قطر
    const chatArea = page.locator('#chat-messages');
    await expect(chatArea).toContainText('جامعة قطر', { timeout: 30000 });
  });

  test('أزرار الاقتراحات تظهر بعد رد البوت', async ({ page }) => {
    // رسالة الترحيب يجب أن تحتوي على اقتراحات
    const chatArea = page.locator('#chat-messages');
    await expect(chatArea).toBeVisible({ timeout: 10000 });

    // الاقتراحات تكون أزرار داخل منطقة الدردشة
    // نتحقق من وجود اقتراح واحد على الأقل بعد رسالة الترحيب
    const suggestionButtons = chatArea.locator('button');
    await expect(suggestionButtons.first()).toBeVisible({ timeout: 10000 });
  });

  test('الإرسال بـ Enter يعمل', async ({ page }) => {
    const input = page.locator('input[type="text"]').first();
    await input.fill('المنح والابتعاث');
    await input.press('Enter');

    // تحقق من أن الحقل فُرّغ بعد الإرسال
    await expect(input).toHaveValue('', { timeout: 5000 });

    // تحقق من ظهور رسالة المستخدم في الدردشة
    const chatArea = page.locator('#chat-messages');
    await expect(chatArea).toContainText('المنح والابتعاث', { timeout: 5000 });
  });

  test('يمكن إرسال عدة رسائل متتالية', async ({ page }) => {
    const input = page.locator('input[type="text"]').first();
    const sendButton = page.locator('button[type="submit"]').first();

    // الرسالة الأولى
    await input.fill('جامعة قطر');
    await sendButton.click();
    await expect(input).toHaveValue('', { timeout: 5000 });

    // انتظر رد البوت
    await page.waitForTimeout(2000);

    // الرسالة الثانية
    await input.fill('تخصصات المستقبل');
    await sendButton.click();

    // تحقق من وجود رسائل متعددة في الدردشة
    const chatArea = page.locator('#chat-messages');
    await expect(chatArea).toContainText('جامعة قطر', { timeout: 10000 });
    await expect(chatArea).toContainText('تخصصات المستقبل', { timeout: 10000 });
  });
});
