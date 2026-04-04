/**
 * Test Utilities للـ E2E Tests
 */

/**
 * انتظر ظهور رسالة في الدردشة
 */
export async function waitForBotResponse(page, timeout = 30000) {
  await page.waitForSelector('.message:nth-child(2), [data-testid="message"]:nth-child(2)', {
    timeout
  });
}

/**
 * إرسال رسالة للدردشة
 */
export async function sendMessage(page, text) {
  const input = page.locator('input[type="text"], textarea').first();
  await input.fill(text);

  // حاول الإرسال بـ Enter أو زر الإرسال
  const sendBtn = page.locator('button[type="submit"]').first();
  if (await sendBtn.isVisible()) {
    await sendBtn.click();
  } else {
    await input.press('Enter');
  }
}

/**
 * مسح الدردشة (refresh)
 */
export async function clearChat(page) {
  await page.reload();
  await page.waitForLoadState('networkidle');
}
