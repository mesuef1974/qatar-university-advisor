
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

import { supabase } from './supabase';
import { logger } from './logger.js';
import { CATEGORY_KEYWORDS } from './category-keywords';

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
// التصنيف التلقائي للسؤال — uses shared keyword map from category-keywords.ts
// ──────────────────────────────────────────────────────

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
      logger.info(`[KB] Cache hit (${Math.round(bestSimilarity * 100)}%) for: "${question.slice(0, 50)}"`);

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
    logger.error('[KB] Search error:', { errorMessage: err.message });
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
    logger.info(`[KB] Answer too short to cache (${answer.length} chars)`);
    return null;
  }
  if (answer.length > MAX_ANSWER_LENGTH) {
    logger.info(`[KB] Answer too long to cache (${answer.length} chars)`);
    return null;
  }

  const questionClean = normalizeText(question);
  const detectedCategory = category || detectCategory(question);

  try {
    // تحقق إذا كان السؤال موجوداً بالفعل (بتشابه عالٍ > 85%)
    const existing = await searchKnowledgeCache(question);
    if (existing && existing.similarity > 0.85) {
      logger.info(`[KB] Similar entry exists (${Math.round(existing.similarity * 100)}%) — skipping save`);
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
      logger.error('[KB] Save error:', { errorMessage: error.message });
      return null;
    }

    logger.info(`[KB] Saved new entry (${detectedCategory}): "${question.slice(0, 50)}"`);
    return data.id;
  } catch (err) {
    logger.error('[KB] Save exception:', { errorMessage: err.message });
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

// ══════════════════════════════════════════════════════════
// T-020: pgvector Semantic Search
// ══════════════════════════════════════════════════════════

/**
 * توليد Embedding لنص باستخدام Gemini
 * @param {string} text
 * @returns {Promise<number[]|null>} vector أو null عند الفشل
 */
async function generateEmbedding(text) {
  /* global process */
  const apiKey = process.env.GOOGLE_API_KEY;
  if (!apiKey) return null;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:embedContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'models/text-embedding-004',
          content: { parts: [{ text }] },
        }),
      }
    );

    if (!response.ok) return null;
    const data = await response.json();
    return data?.embedding?.values || null;
  } catch {
    return null;
  }
}

/**
 * البحث الدلالي في knowledge_cache
 * @param {string} question
 * @returns {Promise<object|null>} { question, answer, category, similarity } أو null
 */
async function semanticSearch(question) {
  if (!supabase) return null;

  const embedding = await generateEmbedding(question);
  if (!embedding) return null;

  try {
    const { data, error } = await supabase.rpc('search_knowledge_semantic', {
      query_embedding: embedding,
      similarity_threshold: 0.75,
      match_count: 1,
    });

    if (error || !data || data.length === 0) return null;

    const best = data[0];
    return {
      question: best.question,
      answer: best.answer,
      category: best.category,
      similarity: best.similarity,
      source: 'semantic',
    };
  } catch {
    return null;
  }
}

/**
 * حفظ Embedding مع الإجابة في knowledge_cache
 * @param {string} question
 * @param {string} answer
 * @param {string[]} suggestions
 * @param {string} [category]
 */
async function saveToKnowledgeCacheWithEmbedding(question, answer, suggestions = [], category = null) {
  if (!supabase) return;

  // أولاً: احفظ بدون embedding (الدالة الموجودة)
  await saveToKnowledgeCache(question, answer, suggestions, category);

  // ثانياً: أضف embedding بشكل غير متزامن
  const embedding = await generateEmbedding(question);
  if (!embedding) return;

  try {
    await supabase
      .from('knowledge_cache')
      .update({ embedding })
      .eq('question', question);
  } catch {
    // silent fail — الـ embedding اختياري
  }
}

// ══════════════════════════════════════════════════════════
// T-020-SEED: Pre-seeding أسئلة الطلاب الشائعة في knowledge_cache
// ══════════════════════════════════════════════════════════

/**
 * قائمة الأسئلة الشائعة مع إجاباتها المختصرة
 * كل إجابة ≥ 100 حرف لتجاوز MIN_ANSWER_LENGTH guard
 */
const SEED_FAQ = [
  {
    question: 'ما هي شروط القبول في جامعة قطر؟',
    answer: 'تشترط جامعة قطر للقبول في البرامج الجامعية الحصول على شهادة الثانوية العامة بمعدل لا يقل عن 70% للمواطنين القطريين، و80% للمقيمين. كما يُشترط اجتياز اختبار القدرات واختبار اللغة الإنجليزية (IELTS أو ما يعادله)، إضافةً إلى بعض المتطلبات الخاصة بكل كلية.',
    suggestions: ['معدل القبول للمقيمين', 'الكليات المتاحة في جامعة قطر', 'التسجيل في جامعة قطر'],
    category: 'admission',
  },
  {
    question: 'ما هي المنح المتاحة للطلاب القطريين؟',
    answer: 'يتمتع الطلاب القطريون بعدة خيارات للمنح الدراسية، أبرزها: البعثة الأميرية التي تُغطي الدراسة في الخارج، ومنح جامعة قطر للطلاب المتميزين، ومنحة طموح التي تدعم التخصصات التقنية والعلمية. تتفاوت هذه المنح في تغطيتها بين الرسوم الدراسية كاملةً وبدل المعيشة وتذاكر السفر.',
    suggestions: ['البعثة الأميرية', 'منحة طموح', 'المنح الخارجية للقطريين'],
    category: 'scholarships',
  },
  {
    question: 'ما أفضل تخصصات المستقبل في قطر؟',
    answer: 'تُشير رؤية قطر 2030 وسوق العمل إلى أن أبرز تخصصات المستقبل هي: الذكاء الاصطناعي وعلوم البيانات، والهندسة البترولية والطاقة المتجددة، والطب والصحة الرقمية، والأمن السيبراني، وإدارة الأعمال والمالية الإسلامية. كما تزداد الحاجة لتخصصات التكنولوجيا الزراعية ضمن مبادرات الأمن الغذائي.',
    suggestions: ['تخصصات الهندسة في قطر', 'رواتب تخصصات المستقبل', 'تخصصات الذكاء الاصطناعي'],
    category: 'programs',
  },
  {
    question: 'كم رسوم جامعة كارنيجي ميلون قطر؟',
    answer: 'تبلغ رسوم جامعة كارنيجي ميلون قطر (CMU-Q) نحو 69,702 دولار أمريكي سنوياً (2026-2027). ويُتاح للطلاب المتميزين التقدم للمنح الجزئية أو الكاملة، وتصل منح القطريين إلى 100%. تعتبر CMU-Q من أغلى الجامعات في المدينة التعليمية، غير أن شهاداتها معادلة لشهادات الكامبس الأمريكي.',
    suggestions: ['مقارنة رسوم جامعات المدينة التعليمية', 'منح CMU قطر', 'تخصصات كارنيجي ميلون قطر'],
    category: 'universities',
  },
  {
    question: 'ما الفرق بين جامعة قطر وHBKU؟',
    answer: 'جامعة قطر (QU) هي الجامعة الوطنية الحكومية الكبرى وتقبل آلاف الطلاب سنوياً بأسعار معقولة، بينما جامعة حمد بن خليفة (HBKU) مؤسسة بحثية أذكياء في المدينة التعليمية تركز على الدراسات العليا والبحث المتخصص. HBKU أصغر وأكثر تخصصاً وترتبط ارتباطاً وثيقاً بمؤسسة قطر.',
    suggestions: ['برامج HBKU', 'جامعات المدينة التعليمية', 'مقارنة الجامعات في قطر'],
    category: 'universities',
  },
  {
    question: 'هل يوجد سكن جامعي في قطر؟',
    answer: 'نعم، توفر جامعة قطر سكناً جامعياً للطلاب المغتربين وبعض القادمين من خارج الدوحة، وهو منفصل للذكور والإناث. كما توفر جامعات المدينة التعليمية (Education City) سكناً لطلابها بإدارة مؤسسة قطر. الأولوية عادةً للطلاب الدوليين والمبتعثين، وتختلف التكاليف بحسب نوع الغرفة.',
    suggestions: ['تكاليف السكن الجامعي', 'السكن في Education City', 'الحياة الجامعية في قطر'],
    category: 'universities',
  },
  {
    question: 'ما معدل القبول للمقيمين في جامعة قطر؟',
    answer: 'يُشترط في الطلاب المقيمين (غير القطريين) الحصول على معدل لا يقل عن 80% في الثانوية العامة للقبول في معظم تخصصات جامعة قطر، مقارنةً بـ 70% للمواطنين. بعض الكليات التنافسية كالطب والهندسة قد تشترط معدلات أعلى تصل إلى 90%، فضلاً عن اجتياز مقابلة القبول.',
    suggestions: ['شروط القبول في جامعة قطر', 'الكليات الأعلى تنافسية', 'تكاليف الدراسة للمقيمين'],
    category: 'admission',
  },
  {
    question: 'ما هي تخصصات الطب المتاحة في قطر؟',
    answer: 'تتوفر تخصصات طبية متعددة في قطر: جامعة قطر تُتيح برنامج الطب البشري (6 سنوات) وتخصصات الصحة العامة والتمريض والصيدلة. جامعة وايل كورنيل الطبية (WCM-Q) في المدينة التعليمية تمنح درجة MD معترفاً بها دولياً. كما تُتاح برامج العلوم الطبية المساعدة والتغذية في عدة مؤسسات.',
    suggestions: ['وايل كورنيل الطبية', 'شروط قبول كلية الطب', 'الصيدلة في قطر'],
    category: 'programs',
  },
  {
    question: 'كيف أحصل على البعثة الأميرية؟',
    answer: 'البعثة الأميرية برنامج حكومي قطري يمنح المواطنين القطريين المتميزين فرصة الدراسة في جامعات عالمية مرموقة. يشترط عادةً الحصول على معدل تراكمي عالٍ، ويتم التقديم عبر وزارة التعليم والتعليم العالي. تُغطي البعثة الرسوم الدراسية وبدل المعيشة والتأمين الصحي وتذاكر السفر لمدة الدراسة.',
    suggestions: ['شروط البعثة الأميرية', 'الجامعات المعتمدة للبعثة', 'منح الدراسة في الخارج'],
    category: 'scholarships',
  },
  {
    question: 'ما هي جامعات المدينة التعليمية في قطر؟',
    answer: 'تضم المدينة التعليمية (Education City) في الدوحة ست جامعات عالمية: جامعة نورثويسترن (إعلام)، وجامعة كارنيجي ميلون (تقنية وأعمال)، وجامعة وايل كورنيل الطبية، وجامعة جورج تاون (شؤون دولية وقانون)، وجامعة فيرجينيا للهندسة (VCUarts)، وجامعة HEC Paris لإدارة الأعمال. تديرها مؤسسة قطر.',
    suggestions: ['رسوم جامعات Education City', 'مقارنة تخصصات المدينة التعليمية', 'القبول في Education City'],
    category: 'universities',
  },
  {
    question: 'ما رواتب الخريجين في قطر؟',
    answer: 'تُعدّ رواتب قطر من الأعلى في المنطقة. يبدأ راتب خريج الهندسة البترولية من 18,000–25,000 ريال، والطب من 20,000–35,000 ريال، وتقنية المعلومات من 12,000–18,000 ريال، والأعمال والمحاسبة من 8,000–14,000 ريال شهرياً. الرواتب في شركة قطر للبترول (QatarEnergy) تُعتبر الأعلى في السوق المحلية.',
    suggestions: ['أعلى الرواتب في قطر', 'وظائف QatarEnergy', 'سوق العمل للخريجين'],
    category: 'salary',
  },
  {
    question: 'هل يمكن الدراسة بالعربية في جامعة قطر؟',
    answer: 'نعم، تُدرَّس كثير من برامج جامعة قطر باللغة العربية خاصةً في كليات الشريعة والقانون والآداب والتربية. أما برامج الهندسة والعلوم والطب وإدارة الأعمال فتُدرَّس باللغة الإنجليزية. جامعات المدينة التعليمية تعتمد الإنجليزية حصراً في جميع برامجها.',
    suggestions: ['لغة التدريس في قطر', 'شروط اللغة الإنجليزية', 'كليات اللغة العربية'],
    category: 'universities',
  },
  {
    question: 'ما هي منحة طموح؟',
    answer: 'منحة طموح برنامج وطني قطري يستهدف تطوير الكوادر البشرية في قطاعات التقنية والابتكار. تُقدَّم للمواطنين القطريين الراغبين في الدراسة في تخصصات ذات أولوية استراتيجية. تشمل المنحة دعماً مالياً، وتدريباً مهنياً، وتوظيفاً مضموناً في جهات حكومية أو شبه حكومية بعد التخرج.',
    suggestions: ['شروط منحة طموح', 'التخصصات المدعومة بطموح', 'كيفية التقديم لمنحة طموح'],
    category: 'scholarships',
  },
  {
    question: 'ما هي جامعة وايل كورنيل الطبية في قطر؟',
    answer: 'جامعة وايل كورنيل الطبية قطر (WCM-Q) هي فرع جامعة كورنيل الأمريكية المرموقة، وتقدم برنامج الطب البشري (MD) المعتمد دولياً. تقع في المدينة التعليمية وتموّلها مؤسسة قطر. تستغرق الدراسة فيها 8 سنوات (سنتان تحضيريتان + 6 طب). خريجوها مؤهلون للترخيص الطبي في الولايات المتحدة وقطر.',
    suggestions: ['القبول في وايل كورنيل قطر', 'مقارنة برامج الطب في قطر', 'رسوم WCM-Q'],
    category: 'universities',
  },
  {
    question: 'كيف أتقدم للجامعات في قطر؟',
    answer: 'يختلف التقديم حسب الجامعة: جامعة قطر تقبل الطلبات عبر بوابتها الإلكترونية (qu.edu.qa) في الفترة من فبراير حتى أبريل سنوياً. جامعات المدينة التعليمية لها بوابة موحدة (ec.qa). يتطلب التقديم عادةً: الشهادة الثانوية، السيرة الذاتية، خطاب النية، توصيات، ونتائج اختبارات اللغة.',
    suggestions: ['موعد التقديم لجامعة قطر', 'مستندات القبول المطلوبة', 'الجدول الزمني للقبول'],
    category: 'admission',
  },
  {
    question: 'ما الفرق بين القطري والمقيم في شروط القبول؟',
    answer: 'يحظى المواطن القطري بأولوية في القبول وشروط معدل أدنى (70% مقابل 80% للمقيم) في جامعة قطر. كما يحق للقطريين الحصول على مكافأة شهرية من الدولة طوال فترة الدراسة. أما المقيمون فيخضعون لنفس اختبارات القبول مع معدلات أعلى ورسوم أكبر، دون الحق في المنح الحكومية عموماً.',
    suggestions: ['رسوم جامعة قطر للمقيمين', 'معدلات القبول حسب الجنسية', 'حقوق الطالب المقيم'],
    category: 'admission',
  },
  {
    question: 'ما تخصصات الهندسة المتاحة في قطر؟',
    answer: 'تُتيح جامعة قطر تخصصات: الهندسة المدنية، والكهربائية، والميكانيكية، والكيميائية، والبترولية، وهندسة الحاسوب. تُقدم جامعة كارنيجي ميلون قطر برامج هندسة الحاسوب وهندسة البيانات. جامعة UDST (التكنولوجيا والتصميم) تختص بالتطبيقية منها كالبناء والتقنيات الصناعية.',
    suggestions: ['هندسة البترول في قطر', 'UDST الجامعة', 'رواتب المهندسين في قطر'],
    category: 'programs',
  },
  {
    question: 'ما هي جامعة UDST في قطر؟',
    answer: 'جامعة UDST (جامعة الدوحة للعلوم والتكنولوجيا) هي الجامعة التطبيقية الوطنية في قطر، وكانت تُعرف سابقاً بـ "كلية قطر للعلوم والتكنولوجيا". تركز على التعليم التطبيقي والمهني في مجالات التقنية والأعمال والصحة. تمنح شهادات دبلوم وبكالوريوس وتتميز بربطها القوي بسوق العمل.',
    suggestions: ['برامج UDST', 'القبول في UDST', 'مقارنة UDST وجامعة قطر'],
    category: 'universities',
  },
  {
    question: 'هل شهادات جامعات قطر معترف بها دولياً؟',
    answer: 'نعم، شهادات جامعة قطر معتمدة دولياً وحاصلة على اعتماد مؤسسي من هيئات معترف بها. أما شهادات جامعات المدينة التعليمية (كارنيجي ميلون، كورنيل، جورج تاون، نورثويسترن) فهي معادلة تماماً لشهادات كامبساتها الأمريكية الأصلية، مما يُتيح الالتحاق بالدراسات العليا في أرقى الجامعات العالمية.',
    suggestions: ['الدراسة في الخارج بعد قطر', 'اعتماد جامعة قطر', 'ماجستير بعد التخرج في قطر'],
    category: 'universities',
  },
  {
    question: 'ما تكاليف الدراسة في جامعة قطر للمواطنين؟',
    answer: 'تكاد تكون الدراسة في جامعة قطر مجانية للمواطنين القطريين، إذ تتحمل الدولة رسوم التعليم بالكامل. علاوةً على ذلك، يتلقى الطالب القطري مكافأة شهرية تُقدَّر بنحو 1,200 ريال طوال سنوات الدراسة. يُضاف إلى ذلك إمكانية الحصول على سكن جامعي مدعوم وخدمات طلابية متكاملة.',
    suggestions: ['مكافأة الطالب القطري', 'رسوم المقيمين في جامعة قطر', 'المزايا الطلابية في QU'],
    category: 'universities',
  },
  {
    question: 'ما برامج الدراسات العليا المتاحة في قطر؟',
    answer: 'تُتيح قطر برامج دراسات عليا متنوعة: جامعة قطر تُقدم ماجستير ودكتوراه في أغلب التخصصات. HBKU تتخصص في برامج الدراسات العليا والبحثية المتقدمة. وايل كورنيل تُقدم برامج طبية متقدمة. كما تتوفر منح دراسات عليا ممولة من صندوق قطر للبحث والتطوير والابتكار (QNRF) للباحثين المتميزين.',
    suggestions: ['ماجستير في جامعة قطر', 'منح QNRF للبحث', 'HBKU برامج الدكتوراه'],
    category: 'programs',
  },
  {
    question: 'ما هي جامعة جورج تاون قطر؟',
    answer: 'جامعة جورج تاون قطر (GU-Q) فرع من جامعة جورج تاون الأمريكية العريقة، وتتخصص في الشؤون الدولية والدراسات الدبلوماسية والقانون الدولي. تقع في المدينة التعليمية وتمنح شهادة بكالوريوس معادلة لشهادة الكامبس الرئيسي في واشنطن. تعتبر الخيار الأمثل لمن يطمح للعمل في السلك الدبلوماسي أو المنظمات الدولية.',
    suggestions: ['تخصصات جورج تاون قطر', 'القبول في GU-Q', 'العمل الدبلوماسي بعد جورج تاون'],
    category: 'universities',
  },
];

// مؤشر لمنع إعادة التهيئة عند إعادة تحميل الوحدة (hot reload)
let _seedInitiated = false;

/**
 * يُعبئ knowledge_cache بأسئلة الطلاب الشائعة مع embeddings للبحث الدلالي
 *
 * - يتحقق من وجود السؤال قبل الإدراج (يتجنب التكرار تلقائياً)
 * - يولّد embedding لكل سؤال باستخدام Gemini (text-embedding-004)
 * - يُحدَّد source كـ 'seed' ويمنح quality_score = 0.90
 * - آمن للاستدعاء المتعدد: سيتخطى الموجودات
 *
 * @param {object} [options]
 * @param {boolean} [options.force=false] - أعد البذر حتى لو اكتمل من قبل
 * @param {boolean} [options.withEmbeddings=true] - ولّد pgvector embeddings
 * @returns {Promise<{ seeded: number, skipped: number, failed: number }>}
 */
async function seedKnowledgeCache({ force: _force = false, withEmbeddings = true } = {}) {
  if (!supabase) {
    logger.warn('[KB-SEED] Supabase غير متاح — تخطي التهيئة');
    return { seeded: 0, skipped: 0, failed: 0 };
  }

  const stats = { seeded: 0, skipped: 0, failed: 0 };

  logger.info(`[KB-SEED] بدء تهيئة قاعدة المعرفة بـ ${SEED_FAQ.length} سؤال شائع...`);

  for (const faq of SEED_FAQ) {
    try {
      const questionClean = normalizeText(faq.question);

      // تحقق من وجود السؤال بالفعل (تطابق عالٍ > 80%)
      const existing = await searchKnowledgeCache(faq.question);
      if (existing && existing.similarity > 0.80) {
        logger.info(`[KB-SEED] موجود بالفعل (${Math.round(existing.similarity * 100)}%): "${faq.question.slice(0, 40)}"`);
        stats.skipped++;
        continue;
      }

      // إدراج السؤال مباشرةً مع source='seed' و quality_score=0.90
      const { data: insertedRow, error: insertError } = await supabase
        .from('knowledge_cache')
        .insert({
          question: faq.question,
          question_clean: questionClean,
          answer: faq.answer,
          suggestions: JSON.stringify(faq.suggestions),
          source: 'seed',
          is_verified: true,
          is_active: true,
          quality_score: 0.90,
          category: faq.category,
        })
        .select('id')
        .single();

      if (insertError) {
        logger.error(`[KB-SEED] فشل الإدراج: "${faq.question.slice(0, 40)}" — ${insertError.message}`);
        stats.failed++;
        continue;
      }

      // توليد embedding وتحديث السجل (pgvector RAG)
      if (withEmbeddings) {
        const embedding = await generateEmbedding(faq.question);
        if (embedding && insertedRow?.id) {
          await supabase
            .from('knowledge_cache')
            .update({ embedding })
            .eq('id', insertedRow.id);
        }
      }

      logger.info(`[KB-SEED] تمت إضافة: "${faq.question.slice(0, 50)}"`);
      stats.seeded++;

      // تأخير بسيط لتجنب rate limiting على Gemini API
      if (withEmbeddings) {
        await new Promise(resolve => setTimeout(resolve, 200));
      }
    } catch (err) {
      logger.error(`[KB-SEED] خطأ غير متوقع: ${err.message}`);
      stats.failed++;
    }
  }

  logger.info(`[KB-SEED] اكتملت التهيئة — أُضيف: ${stats.seeded}, موجود: ${stats.skipped}, فشل: ${stats.failed}`);
  return stats;
}

// ──────────────────────────────────────────────────────
// تشغيل التهيئة عند أول تحميل للوحدة (في الخلفية)
// ──────────────────────────────────────────────────────
if (!_seedInitiated) {
  _seedInitiated = true;
  // نؤخر التنفيذ ثانية واحدة لضمان اكتمال تهيئة Supabase
  setTimeout(() => {
    seedKnowledgeCache({ withEmbeddings: true }).catch(err => {
      logger.error('[KB-SEED] فشل التشغيل التلقائي:', { errorMessage: err.message });
    });
  }, 1000);
}

export {
  normalizeText,
  detectCategory,
  searchKnowledgeCache,
  saveToKnowledgeCache,
  incrementCacheUse,
  logAnalytics,
  getFromKnowledgeBase,
  generateEmbedding,
  semanticSearch,
  saveToKnowledgeCacheWithEmbedding,
  seedKnowledgeCache,
};
