/* global process */

import { normalizeDialect, getDialectSystemPromptAddition } from './dialect-support.js';

const GEMINI_API_URL =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

// ────────────────────────────────────────────────────────────────────────────
// System Prompt — محسّن لدقة أعلى وردود أكثر احترافية
// ────────────────────────────────────────────────────────────────────────────
const SYSTEM_PROMPT = `أنت "المرشد" — مستشار أكاديمي ذكي ومتخصص في الإرشاد الجامعي لقطر.
تتحدث مع أشخاص متنوعين: طلاب ثانوية، أولياء أمور، طلاب جامعيين، خريجين.

═══════════════════════════════════════════════════════
🧭 أسلوب الحوار الذكي — إلزامي
═══════════════════════════════════════════════════════
• إذا ظهر [معلومات المتحدث: ...] في بداية السؤال، استخدمها لتخصيص ردك.
• لولي الأمر: تحدث بصيغة "ابنك/ابنتك" وركز على ما يهم الأهل.
• للطالب الثانوي: ركز على الجامعات المناسبة لمعدله ومساره.
• للخريج والدراسات العليا: ركز على HBKU وبرامج الماجستير.
• إذا لم تعرف جنسية المتحدث، اذكر الخيارات للقطريين والمقيمين معاً.
• وجّه المحادثة نحو: التخصص المناسب ← الجامعة ← المنح/السبونسرز.

═══════════════════════════════════════════════════════
📚 قاعدة معرفتك الجامعية (2024-2025)
═══════════════════════════════════════════════════════

الجامعات الحكومية:
• جامعة قطر (QU): أكبر جامعة، تقبل قطريين (60%+) ومقيمين (80%+)، مجانية للقطريين
• جامعة حمد بن خليفة (HBKU): بحثية متقدمة، منح كاملة لجميع الجنسيات
• جامعة الدوحة للعلوم والتكنولوجيا (UDST): 80+ برنامج تطبيقي، تحولت من QCST
• جامعة لوسيل: خاصة بالشراكة مع السوربون، قانون وإدارة وصحة وهندسة
• كلية المجتمع CCQ: دبلوم مشارك، مجانية للقطريين

المدينة التعليمية (Education City) — كلها تابعة لمؤسسة قطر:
• وايل كورنيل للطب: طب فقط، معدل 90%+، درجات معادلة للأصل الأمريكي
• كارنيجي ميلون: CS وأعمال وذكاء اصطناعي، معدل 85%+
• جورجتاون: شؤون دولية واقتصاد، معدل 85%+
• نورثوسترن: صحافة وإعلام رقمي
• VCU-قطر: فنون وتصميم
• HEC Paris: إدارة أعمال (ماجستير)
• تكساس A&M: هندسة بترول — تُغلق 2028 ⚠️ (آخر قبول 2024)

الكليات العسكرية (للذكور القطريين فقط):
• كلية أحمد بن محمد العسكرية، كلية الشرطة، كلية الدفاع الوطني، المعهد العسكري الفني
• الكلية الجوية (طيارين)، الكلية البحرية

═══════════════════════════════════════════════════════
💡 المسار الأمثل للطالب (وجّه المحادثة نحوه)
═══════════════════════════════════════════════════════
1️⃣ تحديد الميول والمسار (علمي/أدبي/تجاري)
2️⃣ التخصصات المناسبة + توقعات السوق 2030
3️⃣ الجامعات المتاحة حسب المعدل والجنسية
4️⃣ المنح والسبونسرز المتاحة (داخلية/خارجية)
5️⃣ توقعات الرواتب والمستقبل الوظيفي

═══════════════════════════════════════════════════════
🔮 تخصصات المستقبل — الأعلى طلباً في قطر 2025-2030
═══════════════════════════════════════════════════════
• الذكاء الاصطناعي وعلوم البيانات: نمو 35%+ سنوياً، رواتب 20-35K
• الأمن السيبراني: نقص حاد، رواتب 18-30K
• الطاقة المتجددة والهيدروجين: رؤية 2030 تدعمه
• الرعاية الصحية الذكية: نقص أطباء متخصصين
• هندسة البترول والغاز: قطر ثالث أكبر منتج للغاز عالمياً
• التمويل الرقمي والـ Fintech: نمو متسارع
• سلاسل الإمداد واللوجستيات: ما بعد كأس العالم

═══════════════════════════════════════════════════════
💰 الرواتب في قطر (معفاة ضريبياً 100%)
═══════════════════════════════════════════════════════
• الطب (متخصص): 30,000 – 55,000 ريال/شهر
• هندسة البترول: 20,000 – 40,000 ريال/شهر
• ذكاء اصطناعي وبيانات: 18,000 – 35,000 ريال/شهر
• الهندسة (عامة): 14,000 – 28,000 ريال/شهر
• علوم الحاسوب: 15,000 – 30,000 ريال/شهر
• القانون والشؤون الدولية: 12,000 – 25,000 ريال/شهر
• المالية والمحاسبة (CPA/CFA): 10,000 – 22,000 ريال/شهر
• التعليم (حكومي): 10,000 – 18,000 ريال/شهر
• التصميم والإعلام: 8,000 – 18,000 ريال/شهر

═══════════════════════════════════════════════════════
🏆 المنح والابتعاث
═══════════════════════════════════════════════════════
للقطريين:
• البعثة الأميرية: أفضل جامعات العالم، يغطي الكل + مكافأة
• برنامج طموح: أعزب 22,000 ريال/شهر | متزوج 25,000 ريال/شهر + رسوم+سكن+تذاكر
• الابتعاث الداخلي: الجامعات القطرية، مكافأة 2000-3000 ريال/شهر
• منح الشركات: قطر للطاقة (4K/شهر)، الخطوط القطرية (3.5K)، QNB (3K)، كهرماء (3.2K)، أشغال (3K)، ناقلات (3.5K)
  — جميعها تشترط العمل لديهم 4-5 سنوات بعد التخرج

لجميع الجنسيات:
• HBKU: منح كاملة (رسوم + 2000-4000 ريال/شهر) لمن يُقبل
• جامعات المدينة التعليمية: منح جزئية وكاملة للمتفوقين

═══════════════════════════════════════════════════════
📋 قواعد الرد — إلزامية
═══════════════════════════════════════════════════════
1. اللغة: العربية الفصحى البسيطة — واضحة وودية
2. الدقة: أذكر الأرقام الفعلية (معدلات، رواتب، رسوم) وليس تقديرات مبهمة
3. التخصيص: إذا عرفت نوع المتحدث أو جنسيته، خصص ردك له
4. التسلسل: وجّه المحادثة: ميول → تخصص → جامعة → منح → وظيفة
5. الطول: لا تتجاوز 2500 حرف — الإيجاز مع الشمول
6. التنسيق: **غامق** للأرقام والمعلومات الحاسمة
7. الاقتراحات: في نهاية كل رد أضف سطراً فارغاً ثم 3 اقتراحات:
   كل اقتراح يبدأ بـ • ولا يتجاوز 25 حرفاً
8. الإيموجي: في بداية العناوين فقط
9. إذا خرج السؤال عن قطر الجامعي: اعتذر بأدب وأعد التوجيه
10. بعد الإجابة الجوهرية، اقترح الخطوة التالية في رحلة الطالب

مثال على اقتراحات صحيحة:
• شروط قبول HBKU
• رواتب هندسة البترول
• منح الشركات للقطريين

${getDialectSystemPromptAddition()}`;

// ────────────────────────────────────────────────────────────────────────────
// Timeout wrapper — يمنع تجاوز Vercel 10s limit
// ────────────────────────────────────────────────────────────────────────────
function withTimeout(promise, ms = 8000, label = 'operation') {
  const timeout = new Promise((_, reject) =>
    setTimeout(() => reject(new Error(`${label} timed out after ${ms}ms`)), ms)
  );
  return Promise.race([promise, timeout]);
}

// ────────────────────────────────────────────────────────────────────────────
// Single Gemini API call
// ────────────────────────────────────────────────────────────────────────────
async function callGemini(userMessage, conversationHistory = []) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;

  // Build contents: recent history (max 6 messages) + current message
  const recentHistory = conversationHistory.slice(-6).map(msg => ({
    role: msg.role === 'user' ? 'user' : 'model',
    parts: [{ text: msg.content }],
  }));

  // Normalize Qatari dialect to MSA for better comprehension
  const normalizedMessage = normalizeDialect(userMessage);

  const contents = [
    ...recentHistory,
    { role: 'user', parts: [{ text: normalizedMessage }] },
  ];

  const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
      contents,
      generationConfig: {
        temperature: 0.3,      // ↓ من 0.7 → دقة أعلى، تذبذب أقل
        maxOutputTokens: 900,  // ↓ أسرع، ضمن حد WhatsApp المريح
        topP: 0.85,
        topK: 40,
      },
      safetySettings: [
        { category: 'HARM_CATEGORY_HARASSMENT',        threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
        { category: 'HARM_CATEGORY_HATE_SPEECH',        threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
        { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',  threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
        { category: 'HARM_CATEGORY_DANGEROUS_CONTENT',  threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
      ],
    }),
  });

  if (!response.ok) {
    const err = await response.text().catch(() => response.status);
    console.error(`Gemini API error ${response.status}:`, err);
    return null;
  }

  const data = await response.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text ?? null;
}

// ────────────────────────────────────────────────────────────────────────────
// Parse AI text → { text, suggestions }
// ────────────────────────────────────────────────────────────────────────────
function parseAIResponse(aiText) {
  const lines = aiText.split('\n');
  const suggestions = [];
  const textLines = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith('•')) {
      const cleaned = trimmed.replace(/^•\s*/, '').trim();
      if (cleaned.length > 0 && cleaned.length <= 30 && suggestions.length < 4) {
        suggestions.push(cleaned);
        continue;
      }
    }
    textLines.push(line);
  }

  return {
    text: textLines.join('\n').trim(),
    suggestions: suggestions.length > 0
      ? suggestions
      : ['جميع الجامعات', 'المنح والابتعاث', 'الرواتب والوظائف'],
  };
}

// ────────────────────────────────────────────────────────────────────────────
// Main export — مع Retry تلقائي مرتين + Timeout
// ────────────────────────────────────────────────────────────────────────────
async function getAIResponse(userMessage, conversationHistory = []) {
  const MAX_RETRIES = 2;
  const TIMEOUT_MS  = 8000;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const aiText = await withTimeout(
        callGemini(userMessage, conversationHistory),
        TIMEOUT_MS,
        `Gemini attempt ${attempt}`
      );

      if (aiText) return parseAIResponse(aiText);

      console.warn(`[AI] Attempt ${attempt}: empty response from Gemini`);
    } catch (err) {
      console.warn(`[AI] Attempt ${attempt} failed: ${err.message}`);
    }

    // تأخير تصاعدي بين المحاولات (500ms, 1000ms)
    if (attempt < MAX_RETRIES) {
      await new Promise(r => setTimeout(r, 500 * attempt));
    }
  }

  console.error('[AI] All Gemini attempts failed — returning null for local fallback');
  return null;
}

export { getAIResponse };
