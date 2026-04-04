/* global process */
/**
 * Unit Tests — WhatsApp API Module
 * QA-A1: رفع تغطية الاختبارات من 35% إلى 70%
 * 12 حالة اختبار تغطي: sendTextMessage, sendButtonMessage, sendListMessage,
 *   sendResponseWithSuggestions, markAsRead, formatForWhatsApp, splitMessage
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

// ── Mock global fetch ──
const mockFetch = vi.fn();
global.fetch = mockFetch;

// ── Set environment variables ──
beforeEach(() => {
  vi.clearAllMocks();
  process.env.WHATSAPP_PHONE_ID = 'test-phone-id';
  process.env.WHATSAPP_TOKEN = 'test-token';

  // Default: successful API response
  mockFetch.mockResolvedValue({
    ok: true,
    text: () => Promise.resolve('ok'),
  });
});

import {
  sendTextMessage,
  sendButtonMessage,
  sendListMessage,
  sendResponseWithSuggestions,
  markAsRead,
  formatForWhatsApp,
} from '../../lib/whatsapp.js';

// ══════════════════════════════════════════════════════
describe('formatForWhatsApp — تنسيق النص لواتساب', () => {
  it('يحوّل **bold** إلى *bold*', () => {
    const result = formatForWhatsApp('هذا **نص مهم** جداً');
    expect(result).toBe('هذا *نص مهم* جداً');
  });

  it('يقصّر الفواصل الطويلة', () => {
    const result = formatForWhatsApp('قسم ━━━━━━━━━━━━━━━━━━━━━ آخر');
    expect(result).toBe('قسم ───────────── آخر');
  });

  it('يحوّل الفواصل المزدوجة', () => {
    const result = formatForWhatsApp('══════════════════════');
    expect(result).toBe('═══════════');
  });
});

// ══════════════════════════════════════════════════════
describe('sendTextMessage — إرسال رسالة نصية', () => {
  it('يُرسل رسالة نصية بنجاح', async () => {
    await sendTextMessage('97412345678', 'مرحباً');

    expect(mockFetch).toHaveBeenCalledTimes(1);
    const [url, options] = mockFetch.mock.calls[0];
    expect(url).toContain('test-phone-id/messages');
    expect(options.method).toBe('POST');

    const body = JSON.parse(options.body);
    expect(body.messaging_product).toBe('whatsapp');
    expect(body.to).toBe('97412345678');
    expect(body.type).toBe('text');
    expect(body.text.body).toBe('مرحباً');
  });

  it('يرمي خطأ عند فشل الـ API', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 400,
      text: () => Promise.resolve('Bad Request'),
    });

    await expect(sendTextMessage('97412345678', 'اختبار'))
      .rejects
      .toThrow('WhatsApp API sendText error 400');
  });

  it('يقسّم الرسائل الطويلة تلقائياً', async () => {
    const longText = 'ا'.repeat(5000);
    await sendTextMessage('97412345678', longText);
    // Should split into at least 2 chunks
    expect(mockFetch).toHaveBeenCalledTimes(2);
  });
});

// ══════════════════════════════════════════════════════
describe('sendButtonMessage — إرسال رسالة بأزرار', () => {
  it('يُرسل رسالة بأزرار بنجاح', async () => {
    await sendButtonMessage('97412345678', 'اختر جامعة', ['جامعة قطر', 'CMU', 'HBKU']);

    expect(mockFetch).toHaveBeenCalledTimes(1);
    const body = JSON.parse(mockFetch.mock.calls[0][1].body);
    expect(body.type).toBe('interactive');
    expect(body.interactive.type).toBe('button');
    expect(body.interactive.action.buttons).toHaveLength(3);
  });

  it('يقتصر على 3 أزرار كحد أقصى', async () => {
    await sendButtonMessage('97412345678', 'اختر', ['أ', 'ب', 'ج', 'د', 'هـ']);

    const body = JSON.parse(mockFetch.mock.calls[0][1].body);
    expect(body.interactive.action.buttons).toHaveLength(3);
  });

  it('يقصّر عنوان الزر إلى 20 حرفاً', async () => {
    await sendButtonMessage('97412345678', 'اختر', ['هذا نص طويل جداً لا يتسع في زر واتساب أبداً']);

    const body = JSON.parse(mockFetch.mock.calls[0][1].body);
    const title = body.interactive.action.buttons[0].reply.title;
    expect(title.length).toBeLessThanOrEqual(20);
  });
});

// ══════════════════════════════════════════════════════
describe('sendListMessage — إرسال رسالة قائمة', () => {
  it('يُرسل قائمة بعناصر متعددة', async () => {
    await sendListMessage('97412345678', 'اختر سؤالاً', ['سؤال 1', 'سؤال 2', 'سؤال 3']);

    expect(mockFetch).toHaveBeenCalledTimes(1);
    const body = JSON.parse(mockFetch.mock.calls[0][1].body);
    expect(body.interactive.type).toBe('list');
    expect(body.interactive.action.sections[0].rows).toHaveLength(3);
  });

  it('يقتصر على 10 عناصر كحد أقصى', async () => {
    const items = Array.from({ length: 15 }, (_, i) => `عنصر ${i + 1}`);
    await sendListMessage('97412345678', 'اختر', items);

    const body = JSON.parse(mockFetch.mock.calls[0][1].body);
    expect(body.interactive.action.sections[0].rows).toHaveLength(10);
  });
});

// ══════════════════════════════════════════════════════
describe('sendResponseWithSuggestions — إرسال رد مع اقتراحات', () => {
  it('يُرسل نصاً فقط بدون اقتراحات', async () => {
    await sendResponseWithSuggestions('97412345678', 'مرحباً', []);

    expect(mockFetch).toHaveBeenCalledTimes(1);
    const body = JSON.parse(mockFetch.mock.calls[0][1].body);
    expect(body.type).toBe('text');
  });

  it('يُرسل أزرار عندما الاقتراحات <= 3 وقصيرة', async () => {
    await sendResponseWithSuggestions('97412345678', 'اختر', ['قطر', 'CMU', 'HBKU']);

    expect(mockFetch).toHaveBeenCalledTimes(1);
    const body = JSON.parse(mockFetch.mock.calls[0][1].body);
    expect(body.type).toBe('interactive');
  });
});

// ══════════════════════════════════════════════════════
describe('markAsRead — تعليم الرسالة كمقروءة', () => {
  it('يُرسل طلب تعليم كمقروء بنجاح', async () => {
    await markAsRead('msg_123');

    expect(mockFetch).toHaveBeenCalledTimes(1);
    const body = JSON.parse(mockFetch.mock.calls[0][1].body);
    expect(body.status).toBe('read');
    expect(body.message_id).toBe('msg_123');
  });

  it('لا يرمي خطأ عند فشل markAsRead', async () => {
    mockFetch.mockResolvedValueOnce({ ok: false, status: 500 });

    // Should not throw — markAsRead is non-critical
    await expect(markAsRead('msg_fail')).resolves.not.toThrow();
  });
});
