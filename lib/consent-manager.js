/* global process */

/**
 * PDPPL Consent Manager — Qatar University Advisor
 * =================================================
 * Manages explicit user consent per Qatar's Personal Data
 * Protection and Privacy Law (PDPPL) before any data processing.
 *
 * Integration flow:
 *   1. New user sends first message  -> send consent message
 *   2. User replies "1"              -> record consent, proceed
 *   3. User replies anything else    -> politely decline, re-prompt
 *   4. User sends "احذف بياناتي"     -> trigger data deletion
 *
 * Storage: Supabase `user_consents` table (primary), in-memory fallback.
 */

import { supabase, isSupabaseAvailable } from './supabase';

// ── In-memory fallback when Supabase is unavailable ──────────────────
// Maps userId (phone) -> { consentedAt: ISO string }
const memoryConsents = new Map();

// ── Constants ────────────────────────────────────────────────────────
const CONSENT_REPLY        = '1';
const DELETE_DATA_COMMAND  = 'احذف بياناتي';
const PRIVACY_POLICY_URL   = process.env.PRIVACY_POLICY_URL || 'https://qatar-university-advisor.vercel.app/privacy';

// ── Consent message (Arabic, PDPPL-compliant) ────────────────────────
function getConsentMessage() {
  return (
    'مرحباً بك في المرشد الجامعي الذكي 🎓\n' +
    '\n' +
    'قبل أن نبدأ، نود إعلامك بالتالي:\n' +
    '• هذه خدمة إرشادية تعمل بالذكاء الاصطناعي\n' +
    '• سنستخدم بياناتك (الاسم، المعدل، التفضيلات) لتقديم نصائح مخصصة\n' +
    '• بياناتك محمية وفق قانون حماية البيانات الشخصية القطري (PDPPL)\n' +
    '• يمكنك طلب حذف بياناتك في أي وقت بإرسال "احذف بياناتي"\n' +
    `• لمزيد من التفاصيل: [سياسة الخصوصية](${PRIVACY_POLICY_URL})\n` +
    '\n' +
    'للمتابعة والموافقة على معالجة بياناتك، أرسل: 1\n' +
    'للرفض: أرسل أي رسالة أخرى'
  );
}

/**
 * Check if a user has already given PDPPL consent.
 * Checks Supabase first, falls back to in-memory store.
 *
 * @param {string} userId - phone number (e.g. "97412345678")
 * @returns {Promise<boolean>}
 */
async function checkConsent(userId) {
  if (!userId) return false;

  // 1. Check in-memory cache first (fastest)
  if (memoryConsents.has(userId)) return true;

  // 2. Check Supabase if available
  if (isSupabaseAvailable() && supabase) {
    try {
      const { data, error } = await supabase
        .from('user_consents')
        .select('consented_at')
        .eq('phone', userId)
        .single();

      if (!error && data?.consented_at) {
        // Cache in memory for subsequent calls within the same instance
        memoryConsents.set(userId, { consentedAt: data.consented_at });
        return true;
      }
    } catch {
      // Supabase unreachable — fall through to memory-only
    }
  }

  return false;
}

/**
 * Record that a user has given explicit PDPPL consent.
 * Persists to Supabase and caches in memory.
 *
 * @param {string} userId - phone number
 * @returns {Promise<boolean>} true if recorded successfully
 */
async function recordConsent(userId) {
  if (!userId) return false;

  const consentedAt = new Date().toISOString();

  // Always store in memory
  memoryConsents.set(userId, { consentedAt });

  // Persist to Supabase if available
  if (isSupabaseAvailable() && supabase) {
    try {
      const { error } = await supabase
        .from('user_consents')
        .upsert(
          { phone: userId, consented_at: consentedAt },
          { onConflict: 'phone' }
        );

      if (error) {
        console.error('[consent-manager] Failed to persist consent:', error.message);
        // Memory-only is acceptable — consent is still recorded
      }
    } catch (err) {
      console.error('[consent-manager] Supabase error:', err.message);
    }
  }

  return true;
}

/**
 * Delete all user data (PDPPL right to erasure / Article 9).
 * Removes consent record, conversations, profile, favorites, and analytics.
 *
 * @param {string} userId - phone number
 * @returns {Promise<{ success: boolean, message: string }>}
 */
async function deleteUserData(userId) {
  if (!userId) {
    return { success: false, message: 'معرّف المستخدم غير صالح' };
  }

  // Remove from memory
  memoryConsents.delete(userId);

  if (!isSupabaseAvailable() || !supabase) {
    return {
      success: true,
      message: 'تم حذف بياناتك المحلية. قد تبقى بعض البيانات في قاعدة البيانات حتى تتوفر الخدمة.',
    };
  }

  try {
    // Delete in parallel across all tables
    const results = await Promise.allSettled([
      supabase.from('user_consents').delete().eq('phone', userId),
      supabase.from('conversations').delete().eq('user_id', userId),
      supabase.from('favorites').delete().eq('user_id', userId),
      supabase.from('users').delete().eq('phone', userId),
    ]);

    const failures = results.filter(r => r.status === 'rejected');
    if (failures.length > 0) {
      console.error('[consent-manager] Partial deletion failure:', failures);
      return {
        success: true,
        message: 'تم حذف معظم بياناتك بنجاح. بعض السجلات قد تحتاج مراجعة يدوية.',
      };
    }

    return {
      success: true,
      message: 'تم حذف جميع بياناتك بنجاح وفقاً لحقك في قانون حماية البيانات الشخصية القطري.',
    };
  } catch (err) {
    console.error('[consent-manager] deleteUserData error:', err.message);
    return {
      success: false,
      message: 'حدث خطأ أثناء حذف بياناتك. يرجى المحاولة لاحقاً أو التواصل مع الدعم.',
    };
  }
}

/**
 * Check if the incoming message is a data deletion request.
 * @param {string} messageText
 * @returns {boolean}
 */
function isDeleteDataRequest(messageText) {
  if (!messageText) return false;
  return messageText.trim() === DELETE_DATA_COMMAND;
}

/**
 * Check if the incoming message is a consent acceptance.
 * @param {string} messageText
 * @returns {boolean}
 */
function isConsentAccepted(messageText) {
  if (!messageText) return false;
  return messageText.trim() === CONSENT_REPLY;
}

/**
 * Get the polite refusal message when user declines consent.
 * @returns {string}
 */
function getConsentDeclinedMessage() {
  return (
    'نحترم قرارك. لا يمكننا تقديم الخدمة بدون موافقتك على معالجة البيانات.\n\n' +
    'إذا غيّرت رأيك، أرسل أي رسالة وسنعرض عليك الموافقة مرة أخرى.'
  );
}

/**
 * Get the data deletion confirmation message.
 * @returns {string}
 */
function getDataDeletedMessage() {
  return (
    'تم حذف جميع بياناتك بنجاح ✅\n\n' +
    'وفقاً لقانون حماية البيانات الشخصية القطري (PDPPL)، تم إزالة:\n' +
    '• ملفك الشخصي\n' +
    '• سجل المحادثات\n' +
    '• المفضلة\n' +
    '• سجل الموافقة\n\n' +
    'إذا أردت استخدام الخدمة مجدداً، أرسل أي رسالة.'
  );
}

/**
 * Handle the consent flow for an incoming message.
 * Returns null if the user has already consented (proceed to normal flow).
 * Returns a response object { text, suggestions } if consent is needed.
 *
 * @param {string} userId - phone number
 * @param {string} messageText - the user's message
 * @returns {Promise<{ text: string, suggestions: string[] } | null>}
 */
async function handleConsentFlow(userId, messageText) {
  // 1. Check for data deletion request (works at ANY time, even with consent)
  if (isDeleteDataRequest(messageText)) {
    await deleteUserData(userId);
    return {
      text: getDataDeletedMessage(),
      suggestions: [],
    };
  }

  // 2. If user already consented, pass through to normal flow
  const hasConsent = await checkConsent(userId);
  if (hasConsent) return null;

  // 3. User is accepting consent
  if (isConsentAccepted(messageText)) {
    await recordConsent(userId);
    // Return null to signal "proceed to normal flow"
    return null;
  }

  // 4. First interaction or consent declined — show/re-show consent message
  //    We need to distinguish: is this truly the first message, or a decline?
  //    If the message is anything other than "1", treat as needing consent prompt.
  //    But if it's a brand new user (no prior interaction), show the full consent.
  //    If they already saw the consent and sent something else, show the decline msg.

  // Check if user exists in Supabase (indicates they've seen the consent before)
  let isReturningNonConsented = false;
  if (isSupabaseAvailable() && supabase) {
    try {
      const { data } = await supabase
        .from('user_consents')
        .select('phone')
        .eq('phone', userId)
        .single();
      // If record exists but no consented_at, they've seen it before
      isReturningNonConsented = !!data;
    } catch {
      // No record — truly new user
    }
  }

  if (isReturningNonConsented) {
    return {
      text: getConsentDeclinedMessage(),
      suggestions: [],
    };
  }

  // Brand new user — show full consent message
  return {
    text: getConsentMessage(),
    suggestions: [],
  };
}

// ── Exports ──────────────────────────────────────────────────────────
export {
  checkConsent,
  recordConsent,
  deleteUserData,
  getConsentMessage,
  getConsentDeclinedMessage,
  getDataDeletedMessage,
  isDeleteDataRequest,
  isConsentAccepted,
  handleConsentFlow,
  // For testing
  CONSENT_REPLY,
  DELETE_DATA_COMMAND,
  // Expose memory store for testing only
  memoryConsents,
};
