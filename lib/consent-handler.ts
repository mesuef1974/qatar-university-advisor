/**
 * Consent Handler — Qatar University Advisor
 * ═══════════════════════════════════════════
 * PDPPL Article 7 (قانون 13/2016) compliant user consent capture
 * for the WhatsApp bot.
 *
 * Manages the `user_consents` table created via Migration 004 (2026-04-26).
 * Server-only: uses the SUPABASE_SERVICE_ROLE_KEY singleton from `./supabase`.
 */

import { supabase } from './supabase';

// ──────────────────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────────────────

export interface ConsentRow {
  id: string;
  phone: string;
  consent_type: string;
  consented_at: string;
  withdrawn_at: string | null;
  ip_address: string | null;
  user_agent: string | null;
  consent_text: string | null;
  is_active: boolean;
  created_at: string;
}

export interface RecordConsentResult {
  success: boolean;
  id?: string;
}

export interface ConsentBanner {
  text: string;
  suggestions: string[];
}

// ──────────────────────────────────────────────────────────
// Consent text (Arabic, PDPPL Article 7)
// ──────────────────────────────────────────────────────────

const CONSENT_TEXT = `🔒 موافقة على معالجة البيانات الشخصية (PDPPL — قانون 13/2016)

مرحباً بك في "المستشار الجامعي القطري" التابع لـ شركة أذكياء للبرمجيات.

📌 الغرض من المعالجة:
تقديم استشارة جامعية مخصصة (اختيار التخصص، الجامعات، المنح، شروط القبول).

📊 البيانات التي نجمعها:
• رقم الهاتف
• الجنسية
• المعدل الدراسي
• محتوى المحادثة

🌐 المعالجون الفرعيون:
• Supabase (تخزين قاعدة البيانات)
• Vercel (استضافة التطبيق)
• Meta WhatsApp (قناة المراسلة)
• Google Gemini (المعالجة الذكية)

⏳ مدة الاحتفاظ:
طوال مدة استخدامك للخدمة + 30 يوماً بعد طلب الحذف.

⚖️ حقوقك (المواد 22–25 من PDPPL):
• الوصول إلى بياناتك
• تصحيح أي بيانات غير دقيقة
• حذف بياناتك (راسلنا على dpo@azkia.qa)
• سحب الموافقة في أي وقت

📚 المرجع القانوني: PDPPL Qatar — قانون رقم 13 لسنة 2016 (المادة 7).

هل توافق على معالجة بياناتك وفق ما سبق؟
أرسل "أوافق" للمتابعة، أو "لا أوافق" للإلغاء.`;

const CONSENT_SUGGESTIONS = ['أوافق', 'لا أوافق', 'سياسة الخصوصية'];

// ──────────────────────────────────────────────────────────
// API
// ──────────────────────────────────────────────────────────

/**
 * Check if a user (by phone) has an active consent record.
 * Returns false on missing supabase client or any error.
 */
export async function hasUserConsented(phone: string): Promise<boolean> {
  if (!supabase || !phone) return false;

  try {
    const { data, error } = await supabase
      .from('user_consents')
      .select('id')
      .eq('phone', phone)
      .eq('is_active', true)
      .is('withdrawn_at', null)
      .limit(1)
      .maybeSingle();

    if (error) return false;
    return !!data;
  } catch {
    return false;
  }
}

/**
 * Record a new consent row for the given phone.
 * PDPPL Article 7 requires evidence of consent — we persist the exact
 * consent text shown to the user, plus IP and user-agent when available.
 */
export async function recordConsent(
  phone: string,
  ipAddress?: string,
  userAgent?: string,
): Promise<RecordConsentResult> {
  if (!supabase || !phone) return { success: false };

  try {
    const now = new Date().toISOString();
    const { data, error } = await supabase
      .from('user_consents')
      .insert({
        phone,
        consent_type: 'data_processing',
        consented_at: now,
        ip_address: ipAddress ?? null,
        user_agent: userAgent ?? null,
        consent_text: CONSENT_TEXT,
        is_active: true,
      })
      .select('id')
      .single();

    if (error || !data) return { success: false };
    return { success: true, id: (data as { id: string }).id };
  } catch {
    return { success: false };
  }
}

/**
 * Withdraw consent for the given phone — sets is_active=false and
 * withdrawn_at=NOW() on every active row.
 */
export async function withdrawConsent(phone: string): Promise<boolean> {
  if (!supabase || !phone) return false;

  try {
    const { error } = await supabase
      .from('user_consents')
      .update({ is_active: false, withdrawn_at: new Date().toISOString() })
      .eq('phone', phone)
      .eq('is_active', true);

    return !error;
  } catch {
    return false;
  }
}

/**
 * Returns the consent banner text (Arabic) and suggested quick-reply buttons.
 * Used by the WhatsApp webhook before any data processing for a new user.
 */
export function getConsentBanner(): ConsentBanner {
  return {
    text: CONSENT_TEXT,
    suggestions: [...CONSENT_SUGGESTIONS],
  };
}
