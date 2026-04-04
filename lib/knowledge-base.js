
/**
 * Knowledge Base Manager — Qatar University Advisor
 * ═══════════════════════════════════════════════════
 * نظام الذاكرة الذاتية: يحفظ ردود Gemini الجيدة ويُعيد استخدامها
 *
 * الفلسفة:
 *   1. ابحث أولاً في الكاش → أسرع + أرخص + أكثر اتساقاً
 *   2. إذا لم تجد → اسأل Gemini → احفظ الرد تلقائياً
 *   3. الردود المستخدمة أكثر تُعطى أولوية أعلى
 */

import { supabase } from './supabase.js';

// ──────────────────────────────────────────────────────
// Text normalizer — تطبيع النص للمطابقة الدقيقة
// ──────────────────────────────────────────────────────

/**
 * ينظف النص العربي للمقارنة:
 * - يزيل التشكيل (الحركات)
 * - يحول للأحرف الصغيرة
 * - يزيل الأحرف الخاصة والمسافات الزائدة
 * - يوحّد همزات الألف
 */
function normalizeText(text) {
  return text
    .toLowerCase()
    .replace(/[\u064B-\u065F\u0670]/g, '')    // إزالة التشكيل
    .replace(/[أإآا]/g, 'ا')                   // توحيد الألف
    .replace(/[ةه]/g, 'ه')                     // توحيد التاء المربوطة
    .replace(/[يى]/g, 'ي')                     // توحيد الياء
    .replace(/[^\u0600-\u06FF\u0750-\u077F\w\s]/g, ' ')  // حذف الرموز
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * حساب نسبة التشابه بين نصين باستخدام خوارزمية Jaccard على مستوى الكلمات
 * يُعيد قيمة بين 0 (مختلفان تماماً) و 1 (متطابقان)
 */
function jaccardSimilarity(a, b) {
  const setA = new Set(a.split(' ').filter(w => w.length > 1));
  const setB = new Set(b.split(' ').filter(w => w.length > 1));
  if (setA.size === 0 && setB.size === 0) return 1;
  const intersection = new Set([...setA].filter(w => setB.has(w)));
  const union = new Set([...setA, ...setB]);
  return intersection.size / union.size;
}

// ──────────────────────────────────────────────────────
// التصنيف التلقائي للسؤال
// ──────────────────────────────────────────────────────
const CATEGORY_KEYWORDS = {
  universities: ['جامعة', 'كلية', 'معهد', 'hbku', 'qu', 'udst', 'cmu', 'cornell', 'georgetown', 'قبول', 'تسجيل', 'ملتحق'],
  scholarships: ['منحة', 'منح', 'ابتعاث', 'بعثة', 'سبونسر', 'راعي', 'رعاية', 'طموح', 'أميري', 'مكافأة'],
  salary: ['راتب', 'رواتب', 'أجر', 'مرتب', 'دخل', 'كسب', 'توظيف', 'وظيفة', 'وظائف', 'مهنة', 'عمل'],
  admission: ['معدل', 'قبول', 'شروط', 'متطلبات', 'تقديم', 'درجة', 'نسبة', 'احتمال'],
  programs: ['تخصص', 'برنامج', 'دراسة', 'هندسة', 'طب', 'قانون', 'أعمال', 'علوم', 'حاسوب', 'خطة'],
  military: ['عسكري', 'جيش', 'شرطة', 'دفاع', 'أركان', 'ضابط'],
};

function detectCategory(text) {
  const normalized = normalizeText(text);
  let bestCategory = 'general';
  let bestScore = 0;

  for (const [cat, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    const score = keywords.filter(kw => normalized.includes(normalizeText(kw))).length;
    if (score > bestScore) {
      bestScore = score;
      bestCategory = cat;
    }
  }
  return bestCategory;
}

// ──────────────────────────────────────────────────────
// البحث في قاعدة المعرفة
// ──────────────────────────────────────────────────────

const SIMILARITY_THRESHOLD = 0.40; // حد التشابه الأدنى للاعتبار كاش هيت
const MAX_CACHE_AGE_DAYS = 90;     // تجاهل الردود الأقدم من 90 يوم

/**
 * يبحث في knowledge_cache عن إجابة مطابقة أو مشابهة للسؤال
 * @param {string} question - سؤال المستخدم
 * @returns {{ id, answer, suggestions, similarity } | null}
 */
async function searchKnowledgeCache(question) {
  if (!supabase) return null;

  const questionClean = normalizeText(question);
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - MAX_CACHE_AGE_DAYS);

  try {
    // استرجع أفضل 30 إجابة نشطة من نفس الفئة أو الأحدث استخداماً
    const category = detectCategory(question);

    const { data, error } = await supabase
      .from('knowledge_cache')
      .select('id, question_clean, answer, suggestions, use_count, quality_score, expires_at')
      .eq('is_active', true)
      .or(`category.eq.${category},category.eq.general`)
      .or(`expires_at.is.null,expires_at.gt.${cutoffDate.toISOString()}`)
      .order('use_count', { ascending: false })
      .limit(50);

    if (error || !data || data.length === 0) return null;

    // حساب درجة التشابه لكل إجابة
    let bestMatch = null;
    let bestSimilarity = 0;

    for (const entry of data) {
      // تحقق من انتهاء الصلاحية
      if (entry.expires_at && new Date(entry.expires_at) < new Date()) continue;

      const sim = jaccardSimilarity(questionClean, entry.question_clean);
      const weightedScore = sim * (0.7 + entry.quality_score * 0.3);

      if (weightedScore > bestSimilarity) {
        bestSimilarity = weightedScore;
        bestMatch = entry;
      }
    }

    if (bestMatch && bestSimilarity >= SIMILARITY_THRESHOLD) {
      console.log(`[KB] Cache hit (${Math.round(bestSimilarity * 100)}%) for: "${question.slice(0, 50)}"`);

      // تحليل الاقتراحات
      let suggestions = ['جميع الجامعات', 'المنح والابتعاث', 'الرواتب والوظائف'];
      try {
        const raw = bestMatch.suggestions;
        if (Array.isArray(raw)) suggestions = raw;
        else if (typeof raw === 'string') suggestions = JSON.parse(raw);
      } catch {
        // استخدام الافتراضي
      }

      return {
        id: bestMatch.id,
        answer: bestMatch.answer,
        suggestions,
        similarity: bestSimilarity,
      };
    }

    return null;
  } catch (err) {
    console.error('[KB] Search error:', err.message);
    return null;
  }
}

// ──────────────────────────────────────────────────────
// حفظ في قاعدة المعرفة
// ──────────────────────────────────────────────────────

const MIN_ANSWER_LENGTH = 100;     // لا تحفظ ردوداً قصيرة جداً
const MAX_ANSWER_LENGTH = 5000;    // لا تحفظ ردوداً مفرطة الطول

/**
 * يحفظ سؤالاً وإجابته في knowledge_cache
 * يُستدعى تلقائياً بعد كل رد من Gemini
 * @param {string} question - سؤال المستخدم الأصلي
 * @param {string} answer - إجابة Gemini
 * @param {string[]} suggestions - اقتراحات المتابعة
 * @param {string} [category] - الفئة (يُكشف تلقائياً إذا لم يُحدَّد)
 */
async function saveToKnowledgeCache(question, answer, suggestions = [], category = null) {
  if (!supabase) return null;

  // تحقق من الحد الأدنى للجودة
  if (!question || !answer) return null;
  if (answer.length < MIN_ANSWER_LENGTH) {
    console.log(`[KB] Answer too short to cache (${answer.length} chars)`);
    return null;
  }
  if (answer.length > MAX_ANSWER_LENGTH) {
    console.log(`[KB] Answer too long to cache (${answer.length} chars)`);
    return null;
  }

  const questionClean = normalizeText(question);
  const detectedCategory = category || detectCategory(question);

  try {
    // تحقق إذا كان السؤال موجوداً بالفعل (بتشابه عالٍ > 85%)
    const existing = await searchKnowledgeCache(question);
    if (existing && existing.similarity > 0.85) {
      console.log(`[KB] Similar entry exists (${Math.round(existing.similarity * 100)}%) — skipping save`);
      // فقط ارفع use_count للموجود
      await incrementCacheUse(existing.id);
      return existing.id;
    }

    const { data, error } = await supabase
      .from('knowledge_cache')
      .insert({
        question,
        question_clean: questionClean,
        answer,
        suggestions: JSON.stringify(suggestions),
        source: 'gemini',
        is_verified: false,
        is_active: true,
        quality_score: 0.75,  // نقطة بداية — ترتفع مع الاستخدام
        category: detectedCategory,
      })
      .select('id')
      .single();

    if (error) {
      console.error('[KB] Save error:', error.message);
      return null;
    }

    console.log(`[KB] Saved new entry (${detectedCategory}): "${question.slice(0, 50)}"`);
    return data.id;
  } catch (err) {
    console.error('[KB] Save exception:', err.message);
    return null;
  }
}

// ──────────────────────────────────────────────────────
// تحديث عداد الاستخدام
// ──────────────────────────────────────────────────────

/**
 * يزيد use_count لعنصر في الكاش ويرفع quality_score قليلاً
 * @param {string} id - UUID للعنصر
 */
async function incrementCacheUse(id) {
  if (!supabase || !id) return;

  try {
    // استخدام الدالة المدمجة في Supabase
    await supabase.rpc('increment_cache_use', { cache_id: id });

    // رفع quality_score تدريجياً (حتى 0.95 max)
    const { data } = await supabase
      .from('knowledge_cache')
      .select('use_count, quality_score')
      .eq('id', id)
      .single();

    if (data && data.use_count % 5 === 0) {  // كل 5 استخدامات
      const newScore = Math.min(0.95, data.quality_score + 0.02);
      await supabase
        .from('knowledge_cache')
        .update({ quality_score: newScore })
        .eq('id', id);
    }
  } catch {
    // silent fail
  }
}

// ──────────────────────────────────────────────────────
// تسجيل الـ Analytics
// ──────────────────────────────────────────────────────

/**
 * يسجل استعلاماً في analytics مع معلومات الكاش
 * @param {string} query - السؤال
 * @param {boolean} cacheHit - هل جاء الرد من الكاش؟
 * @param {number} responseMs - زمن الاستجابة بالمللي ثانية
 * @param {string} matchedKey - مفتاح المطابقة
 */
async function logAnalytics(query, cacheHit, responseMs, matchedKey = null) {
  if (!supabase) return;

  try {
    await supabase
      .from('analytics')
      .insert({
        query: query?.slice(0, 500),
        matched_key: matchedKey?.slice(0, 200),
        cache_hit: cacheHit,
        response_ms: responseMs,
        source: 'whatsapp',
      });
  } catch {
    // silent fail
  }
}

// ──────────────────────────────────────────────────────
// الوظيفة الرئيسية: ابحث ثم احفظ
// ──────────────────────────────────────────────────────

/**
 * الدالة الرئيسية — تُستدعى من findResponse.js
 * 1. يبحث في الكاش
 * 2. إذا وجد → يُعيد الرد مباشرة مع تحديث الإحصاء
 * 3. إذا لم يجد → يُعيد null (ليسأل Gemini)
 *
 * @param {string} question - سؤال المستخدم
 * @returns {{ answer, suggestions, fromCache: true } | null}
 */
async function getFromKnowledgeBase(question) {
  if (!question?.trim()) return null;

  const startTime = Date.now();

  const hit = await searchKnowledgeCache(question);
  const responseMs = Date.now() - startTime;

  if (hit) {
    // تحديث الإحصاءات بالخلفية (لا ننتظر)
    incrementCacheUse(hit.id).catch(() => {});
    logAnalytics(question, true, responseMs, hit.id).catch(() => {});

    return {
      answer: hit.answer,
      suggestions: hit.suggestions,
      fromCache: true,
    };
  }

  logAnalytics(question, false, responseMs).catch(() => {});
  return null;
}

export {
  normalizeText,
  detectCategory,
  searchKnowledgeCache,
  saveToKnowledgeCache,
  incrementCacheUse,
  logAnalytics,
  getFromKnowledgeBase,
};
