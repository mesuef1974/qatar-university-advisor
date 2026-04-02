/* global process */

// Google Gemini API (Free Tier: 15 requests/minute)
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

const SYSTEM_PROMPT = `أنت المستشار الجامعي الذكي — مساعد متخصص في الإرشاد الأكاديمي لخريجي الثانوية في قطر.

## معلوماتك الأساسية:
- تعرف جميع الجامعات في قطر (25+ جامعة): جامعة قطر، المدينة التعليمية (كورنيل، كارنيجي ميلون، تكساس، جورجتاون، نورثوسترن، VCU، HEC)، HBKU، UDST، لوسيل، كلية المجتمع، الكليات العسكرية
- تعرف شروط القبول والمعدلات والرسوم لكل جامعة
- تعرف برامج الابتعاث (الأميري، الخارجي، الداخلي، طموح)
- تعرف السبونسرز (قطر للطاقة، الخطوط القطرية، QNB، كهرماء، أشغال، ناقلات)
- تعرف الفرق بين القطري وغير القطري في الرسوم والمنح والكليات العسكرية
- تعرف الرواتب في قطر لكل تخصص (معفاة من الضرائب)
- تعرف رؤية قطر 2030 والتخصصات المطلوبة
- تكساس إي أند أم ستغلق 2028
- جامعة الدوحة للعلوم والتكنولوجيا (UDST) 80 برنامج تطبيقي
- جامعة حمد بن خليفة (HBKU) منح كاملة لجميع الجنسيات
- جامعة لوسيل خاصة بالشراكة مع السوربون
- علّم لأجل قطر برنامج زمالة سنتين لخريجي الجامعات
- برنامج طموح: ذكور عزاب 22,000 ريال/شهر، متزوجون 25,000 ريال/شهر

## قواعد الرد:
1. أجب دائماً بالعربية الفصحى البسيطة
2. كن محدداً ودقيقاً بالأرقام (معدلات، رواتب، رسوم)
3. استخدم **نص غامق** للمعلومات المهمة
4. في نهاية كل رد، اكتب سطراً فارغاً ثم 3-4 اقتراحات متابعة قصيرة (كل اقتراح يبدأ بـ • وأقل من 30 حرف)
5. اذكر الفرق بين القطري وغير القطري عندما يكون مهماً
6. لا تتجاوز 3000 حرف في الرد
7. استخدم إيموجي مناسبة في بداية العناوين
8. إذا سُئلت عن شيء خارج نطاق التعليم في قطر، قل أنك متخصص في الإرشاد الجامعي فقط`;

async function getAIResponse(userMessage) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return null;
  }

  try {
    const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        system_instruction: {
          parts: [{ text: SYSTEM_PROMPT }]
        },
        contents: [{
          parts: [{ text: userMessage }]
        }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 1024,
          topP: 0.9,
        },
        safetySettings: [
          { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
          { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
          { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
          { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
        ],
      }),
    });

    if (!response.ok) {
      console.error('Gemini API error:', response.status);
      return null;
    }

    const data = await response.json();
    const aiText = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!aiText) return null;

    // Extract suggestions from AI response (lines starting with •)
    const lines = aiText.split('\n');
    const suggestions = [];
    const textLines = [];

    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.startsWith('•')) {
        const cleaned = trimmed.replace(/^•\s*/, '');
        if (cleaned.length > 0 && cleaned.length < 40 && suggestions.length < 4) {
          suggestions.push(cleaned);
        } else {
          textLines.push(line);
        }
      } else {
        textLines.push(line);
      }
    }

    return {
      text: textLines.join('\n').trim(),
      suggestions: suggestions.length > 0 ? suggestions : ['جميع الجامعات', 'الرواتب والوظائف', 'المنح والابتعاث'],
    };
  } catch (error) {
    console.error('AI handler error:', error.message);
    return null;
  }
}

export { getAIResponse };
