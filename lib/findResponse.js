/**
 * findResponse.js — Facade Entry Point
 * ══════════════════════════════════════════════════════════════════════
 * T-Q7-T010: تقسيم God File — هذا الملف أصبح Facade رفيع
 *
 * الملفات الفعلية:
 *   lib/responses/message-router.js   — findResponse() keyword dispatcher
 *   lib/responses/profile-handler.js  — GPA / nationality / track detection
 *   lib/responses/suggestion-engine.js — suggestion generation & merging
 *   lib/responses/response-formatter.js — buildSmartWelcome / gradeResponse / getDefaultResponse
 *
 * الـ API العام لم يتغيّر — جميع المستوردين يعملون بدون تعديل.
 */

import { ALL_RESPONSES, CAREER_TEST } from './responses.js';
import { getAIResponse } from './ai-handler';
import { sanitizeInput, getInjectionResponse } from './sanitizer';
import { addNationalityContext } from './nationality-advisor.js';
import { getFromKnowledgeBase, saveToKnowledgeCache, semanticSearch } from './knowledge-base.js';
import { STAGES, getNextStage, getStagePrompt, generateFinalReport, isConversationComplete } from './conversation-state.js';
import {
  getOrCreateUser,
  getConversationHistory,
  saveMessage,
  updateUserProfile,
  saveUserProfileData,
  getUserProfileData,
} from './supabase';

// ── Sub-module imports ────────────────────────────────────────────────
import { findResponse } from './responses/message-router.js';
import {
  buildUserProfile,
  buildProfileContext,
  getNextProfilingQuestion,
  getInMemoryProfile,
  saveInMemoryProfile,
  USER_TYPES,
} from './responses/profile-handler.js';
import { generateSmartSuggestions } from './responses/suggestion-engine.js';
import {
  gradeResponse,
  buildSmartWelcome,
  getDefaultResponse,
} from './responses/response-formatter.js';

// ── Re-export public API (callers import from here) ───────────────────
export { findResponse, gradeResponse };

/**
 * Process a user message and return { text, suggestions }
 * ═══════════════════════════════════════════════════════
 * الترتيب الذكي:
 *   0. استرجاع ملف المستخدم وتاريخ المحادثة
 *   1. التحقق من طلب الترحيب / الرسالة الأولى
 *   2. البحث في قاعدة المعرفة (كاش)       → أسرع
 *   3. البحث في الردود المحلية (keywords)  → مضمون
 *   4. Claude AI كـ Fallback              → أذكى
 *   5. حفظ رد Claude في الكاش للمستقبل
 *
 * @param {string} userText - نص رسالة المستخدم
 * @param {string|null} phone - رقم هاتف المستخدم (للملف الشخصي)
 * @param {string|null} nationality - 'qatari' | 'non_qatari' | null (legacy)
 */
async function processMessage(userText, phone = null, nationality = null) {
  // ── T-FIX-004: Sanitize input — Prompt Injection Defense ──────────────────
  const { safe, sanitized, reason } = sanitizeInput(userText);
  if (!safe) {
    console.warn(`[Security] Blocked input — reason: ${reason} | phone: ***`);
    return getInjectionResponse();
  }
  const safeMessage = sanitized;

  // ══════════════════════════════════════════════════════
  // T-009: Supabase = مصدر الحقيقة الوحيد للملف الشخصي
  // In-Memory = Cache مؤقت (30 دقيقة TTL) فقط
  // ══════════════════════════════════════════════════════
  let profile = {};
  let conversationHistory = [];
  let supabaseUser = null;
  let profileChanged = false;

  if (phone) {
    // الخطوة 1: تحقق من الكاش المحلي أولاً (أسرع)
    const cachedProfile = getInMemoryProfile(phone);

    if (cachedProfile) {
      // كاش صالح — استخدمه مباشرة
      profile = cachedProfile;
    } else {
      // الكاش فارغ أو منتهي الصلاحية — اسحب من Supabase
      const [dbUser, dbProfile] = await Promise.all([
        getOrCreateUser(phone, nationality).catch(() => null),
        getUserProfileData(phone).catch(() => ({})),
      ]);

      supabaseUser = dbUser;

      if (dbProfile && Object.keys(dbProfile).length > 0) {
        profile = dbProfile;
        // احفظ في الكاش المحلي
        saveInMemoryProfile(phone, profile);
      }
    }

    // الخطوة 2: استرجاع المستخدم من Supabase إذا لم يُسترجع بعد
    if (!supabaseUser) {
      supabaseUser = await getOrCreateUser(phone, profile.nationality || nationality).catch(() => null);
    }

    // الخطوة 3: استرجاع تاريخ المحادثة (آخر 10 رسائل)
    if (supabaseUser) {
      const history = await getConversationHistory(supabaseUser.id).catch(() => []);
      conversationHistory = history.map(h => ({
        role: h.role,
        content: h.message,
      }));
    }
  }

  // تحديث الملف من رسالة المستخدم الحالية
  const profileBefore = JSON.stringify(profile);
  profile = buildUserProfile(userText, profile);
  profileChanged = JSON.stringify(profile) !== profileBefore;

  // ── T-011: تحديث مرحلة المحادثة ────────────────────────
  const currentStage = profile.conversationStage || STAGES.STAGE_0;
  const nextStage = getNextStage(currentStage, profile, userText);
  if (nextStage !== currentStage) {
    profile.conversationStage = nextStage;
    profileChanged = true;
  }

  // الخطوة 4: احفظ في Supabase إذا تغيّر الملف
  if (phone && profileChanged) {
    // حفظ في الكاش المحلي فوراً
    saveInMemoryProfile(phone, profile);
    // حفظ في Supabase بشكل غير متزامن (لا ينتظر)
    saveUserProfileData(phone, profile).catch(() => {});
  } else if (phone && !getInMemoryProfile(phone)) {
    // تأكد أن الكاش محدّث حتى لو لم يتغير الملف
    saveInMemoryProfile(phone, profile);
  }

  // دمج nationality القديمة مع الجديدة
  const effectiveNationality = profile.nationality || nationality;

  // حفظ رسالة المستخدم في التاريخ
  if (supabaseUser) {
    saveMessage(supabaseUser.id, 'user', userText).catch(() => {});
  }

  // بناء سياق الملف الشخصي لـ Claude
  const profileContext = buildProfileContext(profile);

  // ── 0. أمر حذف البيانات (PDPPL) ──────────────────────
  const qRaw = userText.trim();
  const isDeleteRequest = qRaw.includes('احذف بياناتي') || qRaw.toLowerCase().includes('delete my data');
  if (isDeleteRequest) {
    // تمييز المستخدم للحذف في Supabase
    if (supabaseUser && phone) {
      updateUserProfile(phone, { deletion_requested: true, deletion_requested_at: new Date().toISOString() }).catch(() => {});
    }
    const deleteResponse = {
      text: '🔒 تم استلام طلبك.\n\nسيتم حذف جميع بياناتك الشخصية خلال 30 يوماً وفق قانون PDPPL القطري.\n\nإذا كنت بحاجة لأي مساعدة أكاديمية قبل ذلك، يسعدني خدمتك.',
      suggestions: ['جميع الجامعات', 'الرواتب والوظائف', 'إنهاء المحادثة'],
    };
    if (supabaseUser) saveMessage(supabaseUser.id, 'assistant', deleteResponse.text).catch(() => {});
    return deleteResponse;
  }

  // S-009: إعادة البداية
  const qRestart = userText.toLowerCase().trim();
  const isRestartRequest = qRestart.includes('ابدأ من جديد') || qRestart.includes('ابدأ من البداية') ||
      qRestart.includes('مسح المحادثة') || qRestart.includes('محادثة جديدة') || qRestart.includes('reset') ||
      qRestart.includes('نسيت كل شيء') || qRestart.includes('تناسى كل شيء');
  if (isRestartRequest) {
    if (phone) {
      saveInMemoryProfile(phone, {});
      saveUserProfileData(phone, {}).catch(() => {});
    }
    const restartResponse = {
      text: '🔄 تم! بدأنا من جديد.\n\nأنا المرشد الأكاديمي 🎓 — كيف أقدر أساعدك؟\n\nأخبرني: هل أنت طالب/ة تبحث عن جامعة، أم ولي أمر؟',
      suggestions: ['أنا طالب', 'أنا ولي أمر', 'عرض الجامعات'],
    };
    if (supabaseUser) saveMessage(supabaseUser.id, 'assistant', restartResponse.text).catch(() => {});
    return restartResponse;
  }

  // ── 1. التحقق من الرسالة الأولى / الترحيب ───────────
  const isFirstMessage = profile.messageCount <= 1;
  const q = userText.toLowerCase().trim();
  const isGreeting = q.includes('مرحبا') || q.includes('هلا') || q.includes('السلام')
    || q.includes('اهلا') || q.includes('هاي') || q === 'hi' || q === 'hello'
    || q.includes('ابدأ') || q.includes('مرحبا') || q.includes('أهلاً');

  if (isFirstMessage || isGreeting) {
    const result = findResponse(userText);
    if (result.type === 'greeting' || isFirstMessage) {
      const welcome = buildSmartWelcome(profile, effectiveNationality, conversationHistory.length > 0);
      if (supabaseUser) saveMessage(supabaseUser.id, 'assistant', welcome.text).catch(() => {});
      return welcome;
    }
  }

  // ── 2. سؤال استكشافي (إذا الملف ناقص وأكثر من رسالة) ──
  if (profile.messageCount === 2 && !profile.nationality && !profile.gpa) {
    const profilingQ = getNextProfilingQuestion(profile);
    if (profilingQ) {
      const response = {
        text: profilingQ,
        suggestions: ['أنا قطري', 'أنا مقيم', 'تخطي'],
      };
      if (supabaseUser) saveMessage(supabaseUser.id, 'assistant', response.text).catch(() => {});
      return response;
    }
  }

  // ── 3. البحث في قاعدة المعرفة (الكاش) ──────────────
  const cachedResponse = await getFromKnowledgeBase(userText).catch(() => null);
  if (cachedResponse) {
    // خصص الاقتراحات حسب الملف
    const smartSuggestions = generateSmartSuggestions(profile, 'knowledge_cache');
    const mergedSuggestions = cachedResponse.suggestions?.length > 0
      ? cachedResponse.suggestions
      : smartSuggestions;

    const response = {
      text: cachedResponse.answer,
      suggestions: mergedSuggestions.slice(0, 3),
    };

    if (supabaseUser) saveMessage(supabaseUser.id, 'assistant', response.text).catch(() => {});
    return response;
  }

  // ── 3.5. Semantic Search (T-020) — إذا فشل Jaccard ────
  /* global process */
  if (!cachedResponse && process.env.ANTHROPIC_API_KEY) {
    const semanticResult = await semanticSearch(userText).catch(() => null);
    if (semanticResult) {
      const response = {
        text: semanticResult.answer,
        suggestions: ['تفاصيل أكثر', 'سؤال آخر', 'جميع الجامعات'],
        source: 'semantic_cache',
        similarity: semanticResult.similarity,
      };
      if (supabaseUser) saveMessage(supabaseUser.id, 'assistant', response.text).catch(() => {});
      return response;
    }
  }

  // ── 4. البحث في الردود المحلية ────────────────────────
  const result = findResponse(userText);

  // ── تصحيح المنح حسب جنسية الملف الشخصي ────────────
  // إذا كان findResponse() أرجع scholarship_amiri لكن المستخدم غير قطري → صحّح تلقائياً
  if (result.type === 'response' && result.key === 'scholarship_amiri') {
    const isNonQatariProfile = effectiveNationality === 'non_qatari'
      || profile.nationality === 'non_qatari'
      || profile.userType === 'non_qatari_student';
    if (isNonQatariProfile) {
      result.key = 'scholarship_non_qatari';
    }
  }

  let response;
  let contextKey = null;

  switch (result.type) {
    case 'response': {
      const resp = ALL_RESPONSES[result.key];
      if (!resp) { response = getDefaultResponse(profile); break; }
      response = { text: resp.text, suggestions: resp.suggestions || [] };
      contextKey = result.key;
      break;
    }

    case 'grade': {
      response = gradeResponse(result.grade, result.track || profile.track);
      // T-009: حدّث الملف بالمعدل في Supabase وInMemory معاً
      if (!profile.gpa || profile.gpa !== result.grade) {
        profile.gpa = result.grade;
        if (phone) {
          saveInMemoryProfile(phone, profile);
          saveUserProfileData(phone, profile).catch(() => {});
        }
      }
      contextKey = 'grade';
      break;
    }

    case 'greeting': {
      const welcome = buildSmartWelcome(profile, effectiveNationality, conversationHistory.length > 0);
      if (supabaseUser) saveMessage(supabaseUser.id, 'assistant', welcome.text).catch(() => {});
      return welcome;
    }

    default: {
      // ── 5. Claude AI Fallback ─────────────────────────
      // أضف سياق الملف الشخصي للسؤال
      const enrichedQuestion = profileContext
        ? `${profileContext}\n\nسؤال المستخدم: ${safeMessage}`
        : safeMessage;

      const aiResponse = await getAIResponse(enrichedQuestion, conversationHistory).catch(() => null);

      if (aiResponse) {
        // حفظ الرد في قاعدة المعرفة للاستخدام المستقبلي
        saveToKnowledgeCache(userText, aiResponse.text, aiResponse.suggestions).catch(() => {});

        // اقتراحات ذكية مخصصة
        const smartSuggestions = generateSmartSuggestions(profile, 'ai');
        const finalSuggestions = aiResponse.suggestions?.length > 0
          ? aiResponse.suggestions
          : smartSuggestions;

        const finalResponse = { text: aiResponse.text, suggestions: finalSuggestions.slice(0, 3) };
        if (supabaseUser) saveMessage(supabaseUser.id, 'assistant', finalResponse.text).catch(() => {});
        return finalResponse;
      }

      response = getDefaultResponse(profile);
      contextKey = null;
      break;
    }
  }

  // تطبيق سياق الجنسية
  if (contextKey && effectiveNationality) {
    response = addNationalityContext(response, effectiveNationality, contextKey);
  }

  // استبدال الاقتراحات بأخرى ذكية بناءً على الملف
  if (profile.gpa || profile.nationality || profile.track) {
    const smartSuggs = generateSmartSuggestions(profile, contextKey || '');
    if (smartSuggs.length > 0 && (!response.suggestions || response.suggestions.length === 0)) {
      response.suggestions = smartSuggs;
    }
  }

  // ── T-011: سؤال المرحلة التالية ────────────────────────
  const stagePrompt = getStagePrompt(profile.conversationStage || STAGES.STAGE_0, profile);
  if (stagePrompt && response.text && !response.text.includes(stagePrompt)) {
    // أضف سؤال المرحلة في نهاية الرد إذا لم يكن موجوداً مسبقاً
    response.text = response.text + '\n\n━━━━━━━━\n' + stagePrompt;
  }

  // ── T-011: تقرير نهائي عند STAGE_6 ─────────────────────
  if (isConversationComplete(profile.conversationStage) && result.type === 'unknown') {
    response = generateFinalReport(profile);
  }

  if (supabaseUser) saveMessage(supabaseUser.id, 'assistant', response.text).catch(() => {});
  return response;
}

export { processMessage };
