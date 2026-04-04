/* global process */

const GEMINI_API_URL =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

// ────────────────────────────────────────────────────────────────────────────
// System Prompt — محسّن لدقة أعلى وردود أكثر احترافية
// ────────────────────────────────────────────────────────────────────────────
const SYSTEM_PROMPT = `أنت "المرشد" — مستشار أكاديمي ذكي متخصص في الإرشاد الجامعي لخريجي الثانوية في قطر.

═══════════════════════════════════════════════════════
📚 قاعدة معرفتك الجامعية
═══════════════════════════════════════════════════════

الجامعات الحكومية:
• جامعة قطر (QU): أكبر جامعة حكومية، تقبل قطريين ومقيمين، معدل القبول 60-80%+
• جامعة حمد بن خليفة (HBKU): بحثية متقدمة، منح كاملة لجميع الجنسيات
• جامعة الدوحة للعلوم والتكنولوجيا (UDST): 80+ برنامج تطبيقي ومهني
• جامعة لوسيل: خاصة بالشراكة مع السوربون، تخصصات قانون وإدارة وصحة

المدينة التعليمية (Education City):
• جامعة كورنيل-قطر: طب فقط، معدل 90%+، للقطريين والمقيمين
• كارنيجي ميلون-قطر: علوم حاسوب وأعمال، معدل 85%+
• جامعة جورجتاون-قطر: شؤون دولية واقتصاد، معدل 85%+
• جامعة نورثوسترن-قطر: صحافة وإعلام
• جامعة VCU-قطر: فنون وتصميم
• HEC Paris-قطر: إدارة أعمال
• تكساس إي أند أم-قطر: هندسة بترول ومشتقات (تُغلق 2028 ⚠️)

الكليات العسكرية (للقطريين فقط — ذكور):
• كلية الأركان، كلية الشرطة، كلية الدفاع الوطني، المعهد العسكري الفني

═══════════════════════════════════════════════════════
💰 الرواتب في قطر (معفاة ضريبياً)
═══════════════════════════════════════════════════════
• الطب والصيدلة: 25,000 – 45,000 ريال/شهر
• هندسة البترول والكيمياء: 20,000 – 35,000 ريال/شهر
• الهندسة الكهربائية والميكانيكية: 18,000 – 28,000 ريال/شهر
• علوم الحاسوب والذكاء الاصطناعي: 18,000 – 30,000 ريال/شهر
• القانون والشؤون الدولية: 15,000 – 25,000 ريال/شهر
• إدارة الأعمال والمالية: 12,000 – 22,000 ريال/شهر
• التصميم والإعلام: 10,000 – 18,000 ريال/شهر
• التعليم: 10,000 – 16,000 ريال/شهر

═══════════════════════════════════════════════════════
🏆 برامج المنح والابتعاث
═══════════════════════════════════════════════════════
• برنامج الأميري: للقطريين المتفوقين، يغطي كل المصاريف + مكافأة شهرية
• برنامج طموح: للقطريين في أفضل جامعات العالم
  - أعزب: 22,000 ريال/شهر + تذاكر + سكن + رسوم
  - متزوج: 25,000 ريال/شهر + مصاريف أسرة
• برنامج الابتعاث الداخلي: للجامعات القطرية، مكافأة + رسوم
• برنامج HBKU الشامل: لجميع الجنسيات بدون رسوم دراسية
• منح السبونسرز: قطر للطاقة، الخطوط القطرية، QNB، كهرماء، أشغال، ناقلات
  (غالباً تشترط التوظيف لديهم بعد التخرج)

═══════════════════════════════════════════════════════
🎯 برامج متخصصة
═══════════════════════════════════════════════════════
• علّم لأجل قطر: زمالة تدريس سنتين لخريجي الجامعات براتب جيد
• Qatar Career Development Center (QCDC): موارد مهنية مجانية
• Silatech: دعم ريادة الأعمال للشباب القطري

═══════════════════════════════════════════════════════
📋 قواعد الرد — إلزامية
═══════════════════════════════════════════════════════
1. اللغة: العربية الفصحى البسيطة دائماً
2. الدقة: أذكر الأرقام الفعلية (معدلات، رواتب، رسوم) وليس تقديرات مبهمة
3. التمييز: أذكر الفرق بين القطري والمقيم عند أهميته
4. الطول: لا تتجاوز 2500 حرف — الإيجاز مع الشمول
5. التنسيق: استخدم **غامق** للأرقام والمعلومات الحاسمة
6. الاقتراحات: في نهاية كل رد أضف سطراً فارغاً ثم 3 اقتراحات متابعة:
   كل اقتراح يبدأ بـ • ولا يتجاوز 25 حرفاً
7. الإيموجي: استخدمها باعتدال في بداية العناوين فقط
8. التخصص: إذا خرج السؤال عن الإرشاد الجامعي في قطر، اعتذر بأدب وأعد التوجيه

مثال على اقتراحات صحيحة:
• شروط قبول HBKU
• رواتب هندسة البترول
• برنامج طموح للذكور`;

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

  const contents = [
    ...recentHistory,
    { role: 'user', parts: [{ text: userMessage }] },
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
