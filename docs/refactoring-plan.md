# خطة إعادة هيكلة findResponse.js

## الوضع الحالي
- `findResponse.js`: 878 سطر (God File Anti-Pattern — يُعالج domains متعددة في ملف واحد)
- يحتوي على 3 functions رئيسية: `findResponse`, `gradeResponse`, `processMessage`
- صعوبة الصيانة وإضافة ميزات جديدة
- تداخل المسؤوليات (SRP violation)
- وقت تحميل الوحدة مرتفع نسبياً

## البنية الحالية (تحليل)

### الـ imports (السطور 1-24)
```
ALL_RESPONSES, CAREER_TEST      ← responses.js
getAIResponse                   ← ai-handler.js
sanitizeInput, getInjectionResponse ← sanitizer.js
addNationalityContext            ← nationality-advisor.js
getFromKnowledgeBase, ...        ← knowledge-base.js
STAGES, getNextStage, ...        ← conversation-state.js
buildUserProfile, ...            ← user-profiler.js
getOrCreateUser, ...             ← supabase.js
```

### الـ functions الثلاث
1. **`findResponse(text)`** — السطور 30-481
   - Keyword matching بالعربية والإنجليزية والعامية القطرية
   - يُرجع `{ type, key/grade/track }`
   - يشمل: جنسية، منح، تخصصات، جامعات، مقارنات

2. **`gradeResponse(grade, track)`** — السطور 486-494
   - توصيات حسب المعدل (95+ / 90+ / 85+ / 80+ / 75+ / 70+ / أقل)
   - يُرجع `{ text, suggestions }`

3. **`processMessage(userText, phone, nationality)`** — السطور 511-801
   - المنسق الرئيسي (Orchestrator)
   - يدير: Supabase، cache، conversation stages، AI fallback، PDPPL

### الـ helpers
- **`buildSmartWelcome(profile, nationality, hasHistory)`** — السطور 810-868
- **`getDefaultResponse(profile)`** — السطور 870-876
- **`PDPPL_NOTICE`** — ثابت للإشعار القانوني

## الهدف
6 وحدات متخصصة + Facade Pattern في findResponse.js

## هيكل الوحدات الجديدة

```
lib/
├── findResponse.js              ← Facade (يبقى كـ entry point)
└── responses/
    ├── index.js                 ← Barrel export
    ├── universities.js          ← بيانات الجامعات وأسماؤها
    ├── admissions.js            ← شروط القبول والتقديم
    ├── scholarships.js          ← المنح الدراسية والتمويل
    ├── majors.js                ← التخصصات وخطط الدراسة
    └── response-formatter.js    ← تنسيق الردود النهائية
```

## الخطوات (تدريجية)

### المرحلة 1 (الهيكل) — مكتملة ✅
- إنشاء مجلد `lib/responses/`
- إنشاء الملفات الفارغة مع التوثيق الكامل
- توثيق الـ response keys والـ keyword patterns لكل وحدة
- إنشاء خطة الإعادة هيكلة (هذا الملف)

### المرحلة 2 (النقل التدريجي) — قادمة 🔄
الترتيب المقترح للنقل (من الأبسط للأكثر تعقيداً):

**الخطوة 2.1**: نقل `gradeResponse` إلى `admissions.js`
- دالة مستقلة، لا تعتمد على imports خارجية
- الاختبار: التأكد من نفس النتائج قبل وبعد

**الخطوة 2.2**: نقل `buildSmartWelcome` + `getDefaultResponse` إلى `response-formatter.js`
- تعتمد على: `generateSmartSuggestions`, `getWelcomeMessage`, `USER_TYPES`, `gradeResponse`
- استيراد `gradeResponse` من `admissions.js` بعد نقله

**الخطوة 2.3**: استخراج keyword patterns للمنح إلى `scholarships.js`
- دالة `matchScholarshipKeyword(q, isScholarshipContext)` → response key
- تعتمد فقط على نص السؤال

**الخطوة 2.4**: استخراج keyword patterns للجامعات إلى `universities.js`
- دالة `matchUniversityKeyword(q)` → response key

**الخطوة 2.5**: استخراج keyword patterns للتخصصات إلى `majors.js`
- دالة `matchMajorKeyword(q)` → response key

**الخطوة 2.6**: استخراج keyword patterns للقبول إلى `admissions.js`
- دالة `matchAdmissionKeyword(q)` → response key

### المرحلة 3 (الـ Facade) — نهائية
- `findResponse.js` يُصبح Facade يستورد من الوحدات:
  ```javascript
  import { matchAdmissionKeyword } from './responses/admissions.js';
  import { matchScholarshipKeyword } from './responses/scholarships.js';
  import { matchUniversityKeyword } from './responses/universities.js';
  import { matchMajorKeyword } from './responses/majors.js';
  import { buildSmartWelcome, getDefaultResponse } from './responses/response-formatter.js';
  ```
- `processMessage` يبقى في `findResponse.js` (Orchestrator)
- جميع imports الخارجية تبقى تعمل (backward compatibility)

## مبدأ التقسيم (SRP — Single Responsibility Principle)

| الوحدة | المسؤولية الوحيدة |
|--------|------------------|
| `universities.js` | معلومات الجامعات القطرية وأسماؤها ومقارناتها |
| `admissions.js` | شروط القبول والتقديم والمعدلات المطلوبة |
| `scholarships.js` | المنح الدراسية والتمويل والجهات الراعية |
| `majors.js` | التخصصات الأكاديمية وخطط الدراسة والوظائف |
| `response-formatter.js` | تنسيق وبناء الردود النهائية للمستخدم |
| `findResponse.js` (Facade) | التنسيق بين الوحدات + processMessage |

## اعتبارات مهمة

### الأولوية في المطابقة
الترتيب الحالي في `findResponse()` مهم جداً — يجب الحفاظ عليه:
1. العامية القطرية (normalizeDialect)
2. S-001 إلى S-008 (سيناريوهات خاصة)
3. المقارنات (comparisons)
4. **isScholarshipContext** — يجب تحديده أولاً لتفادي التعارضات
5. المنح (scholarships) — قبل أسماء الجامعات
6. خطط الدراسة (study plans)
7. أسماء الجامعات
8. المعدل الدراسي (grade-based)
9. الاقتراحات الافتراضية

### backward compatibility
- `export { findResponse, gradeResponse, processMessage }` يجب أن يبقى كما هو
- `ai-handler.js` يستورد من `findResponse.js` — لا تكسر هذا
- الاختبارات الموجودة في `tests/` يجب أن تبقى تعمل

## الجدول الزمني المقترح
- المرحلة 2: أسبوع واحد (بعد T011 E2E Tests)
- المرحلة 3: يومان (بعد اكتمال المرحلة 2 والـ tests)
- T017 TypeScript Migration: يُطبق على الوحدات الجديدة أولاً

---
*آخر تحديث: 2026-04-04*
*T-Q7-T010 — شركة أذكياء للبرمجيات*
