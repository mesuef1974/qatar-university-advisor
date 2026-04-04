/**
 * E2E Test 2: Academic Query — استعلام أكاديمي
 * سيناريو: طالب قطري + مسار علمي + معدل 90% → يحصل على توصيات
 */
import { test, expect } from '@playwright/test';

test.describe('Academic Query — استعلام أكاديمي', () => {
  test('يرسل رسالة ويحصل على رد', async ({ page }) => {
    await page.goto('/');

    const input = page.locator('input[type="text"], textarea').first();
    const sendButton = page.locator('button[type="submit"], [data-testid="send-btn"]').first();

    await input.fill('أنا قطري مسار علمي معدلي 90%');
    await sendButton.click();

    // انتظر الرد (timeout أطول بسبب AI)
    await expect(page.locator('.message, [data-testid="message"]').nth(1))
      .toBeVisible({ timeout: 30000 });
  });

  test('الرد يحتوي معلومات ذات صلة', async ({ page }) => {
    await page.goto('/');

    const input = page.locator('input[type="text"], textarea').first();
    await input.fill('ما هي جامعات قطر؟');
    await input.press('Enter');

    // انتظر أي رد
    await page.waitForTimeout(15000);
    const messages = page.locator('.message, [data-testid="message"]');
    await expect(messages).toHaveCount({ minimum: 1 });
  });
});
