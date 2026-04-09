# Contributing to Qatar University Advisor

شكراً لاهتمامك بالمساهمة في هذا المشروع. هذا الدليل يوضح المعايير والإجراءات المتبعة.

---

## جدول المحتويات

- [معايير الكود](#معايير-الكود)
- [إعداد بيئة التطوير](#إعداد-بيئة-التطوير)
- [تنسيق رسائل الـ Commit](#تنسيق-رسائل-الـ-commit)
- [كيفية رفع Pull Request](#كيفية-رفع-pull-request)
- [معايير المراجعة](#معايير-المراجعة)
- [الإبلاغ عن الأخطاء](#الإبلاغ-عن-الأخطاء)

---

## معايير الكود

### JavaScript / JSX

- **ES Modules فقط** — استخدم `import`/`export`، لا `require()`
- **لا `var`** — استخدم `const` افتراضياً، `let` عند الضرورة فقط
- **Arrow functions** للدوال المجهولة والـ callbacks
- **Async/await** بدلاً من `.then()/.catch()` لجعل الكود أوضح
- حد أقصى **100 حرف** في السطر الواحد
- **مسافتان** للـ indentation (وليس tabs)
- فاصلة منقوطة في نهاية كل تعليمة

```js
// صح
const fetchData = async (url) => {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
};

// خطأ
var fetchData = function(url) {
  return fetch(url).then(function(res) {
    return res.json()
  })
}
```

### TypeScript

- المشروع يستخدم TypeScript بنمط incremental (`allowJs: true`)
- الملفات الجديدة يجب أن تكون `.ts` أو `.tsx` وليس `.js`/`.jsx`
- استخدم الأنواع المُعرَّفة في `types/index.ts` (UserProfile, University, ConversationStage, etc.)
- لا تستخدم `any` — استخدم `unknown` ثم تحقق من النوع
- شغّل `npm run type-check` قبل أي commit

### React Components

- **Functional components فقط** — لا class components
- كل component في ملف منفصل باسم يبدأ بحرف كبير: `MyComponent.jsx`
- استخدم **named exports** وليس default exports حيثما أمكن
- Props يجب أن تكون واضحة ومُوثَّقة بـ JSDoc إذا كانت معقدة
- لا تضع business logic داخل الـ JSX — استخرجها لدوال منفصلة

```jsx
// صح
function UniversityCard({ name, gpa, majors }) {
  const isEligible = gpa >= 2.5;
  return (
    <div className={isEligible ? 'eligible' : 'ineligible'}>
      <h3>{name}</h3>
    </div>
  );
}

export { UniversityCard };
```

### ملفات الـ API و Serverless Functions

- تحقق **دائماً** من البيانات الواردة قبل المعالجة
- تعامل مع جميع حالات الخطأ وأرجع status codes صحيحة
- لا ترجع رسائل خطأ تكشف تفاصيل داخلية للمستخدم
- استخدم `console.error` للأخطاء و`console.warn` للتحذيرات، لا `console.log` في الإنتاج

### CSS

- استخدم CSS Variables للألوان والمسافات المتكررة
- اسماء الـ classes بصيغة kebab-case: `university-card`, `search-input`
- لا inline styles إلا للقيم الديناميكية التي لا يمكن تجنبها
- أضف تعليقاً فوق كل section رئيسي في ملفات CSS الكبيرة

### هيكل المشروع الحالي

```
api/                  — Vercel Serverless Functions
  webhook.js          — نقطة استقبال WhatsApp
  admin.js            — لوحة الإدارة (Rate Limited)
  cron-pdppl-cleanup.js — حذف PDPPL التلقائي
lib/                  — مكتبات مشتركة
  rate-limiter.js     — Rate Limiting (Upstash Redis)
  semantic-search.js  — بحث دلالي (pgvector)
  security-headers.js — CSP Middleware
  circuit-breaker.js  — Circuit Breaker Pattern
  responses/          — 6 وحدات ردود (Facade Pattern)
src/                  — React Frontend (Vite)
  components/         — PWAInstallPrompt, AcademicDisclaimer
  pages/              — PrivacyPolicy, TermsOfService
  hooks/              — useAccessibility
  styles/             — accessibility.css
types/                — TypeScript Definitions
tests/unit/           — Vitest (174 اختبار)
tests/e2e/            — Playwright (5 specs)
legal/                — PDPPL, DPA, Disclaimer
docs/                 — التوثيق التقني
```

### الأمان

- **لا تضع أي secret أو token في الكود المصدري أبداً**
- استخدم `process.env.VARIABLE_NAME` للوصول إلى المتغيرات الحساسة
- تحقق دائماً من توقيع الـ Webhook قبل معالجة أي طلب
- استخدم `crypto.timingSafeEqual` للمقارنة بين tokens لتجنب timing attacks

### CI/CD Pipeline

- **GitHub Actions** يشغّل تلقائياً عند كل PR: `npm test` + `npm run lint` + `npm run build` + `npm audit`
- **Lighthouse CI** يفحص الأداء (LCP < 2500ms, JS < 400KB)
- **TruffleHog** يفحص الأكواد لمنع تسريب secrets
- **Dependabot** يفحص التبعيات أسبوعياً ويرفع PRs تلقائية للتحديثات الأمنية

---

## إعداد بيئة التطوير

```bash
# 1. Fork المشروع ثم clone نسختك
git clone https://github.com/YOUR_USERNAME/qatar-university-advisor.git
cd qatar-university-advisor

# 2. إضافة الـ upstream
git remote add upstream https://github.com/ORIGINAL_ORG/qatar-university-advisor.git

# 3. تثبيت الاعتماديات
npm install

# 4. إعداد متغيرات البيئة
cp .env.example .env.local
# عدّل .env.local بقيمك التجريبية

# 5. تشغيل الاختبارات للتأكد أن كل شيء يعمل
npm test

# التحقق من الأنواع
npm run type-check

# تشغيل اختبارات E2E (يحتاج Playwright مثبتاً)
npx playwright install --with-deps chromium
npm run test:e2e

# التحقق من التغطية
npm run test:coverage

# 6. تشغيل بيئة التطوير
npm run dev
```

### قبل رفع أي كود

```bash
# تشغيل الـ linter
npm run lint

# تشغيل الاختبارات
npm test

# التحقق من الأنواع
npm run type-check

# التحقق من البناء
npm run build
```

لا يُقبل أي PR يُخفق في أحد هذه الأوامر.

---

## تنسيق رسائل الـ Commit

نتبع معيار **Conventional Commits**. كل رسالة commit يجب أن تكون بالشكل:

```
<type>(<scope>): <short description>

[optional body]

[optional footer]
```

### أنواع الـ Commit (type)

| النوع | متى تستخدمه |
|-------|-------------|
| `feat` | إضافة ميزة جديدة |
| `fix` | إصلاح خطأ (bug fix) |
| `docs` | تغييرات في التوثيق فقط |
| `style` | تغييرات في التنسيق (CSS, spacing) دون تغيير في المنطق |
| `refactor` | إعادة هيكلة الكود دون إضافة ميزة أو إصلاح خطأ |
| `test` | إضافة أو تعديل الاختبارات |
| `chore` | تغييرات في الأدوات أو الإعدادات (vite, eslint, package.json) |
| `perf` | تحسين في الأداء |
| `security` | إصلاح ثغرة أمنية |
| `revert` | التراجع عن commit سابق |

### الـ Scope (النطاق)

اذكر الجزء من المشروع المتأثر:

| Scope | المقصود |
|-------|---------|
| `webhook` | ملفات `api/webhook.js` |
| `whatsapp` | ملفات `lib/whatsapp.js` |
| `ui` | مكونات React في `src/` |
| `ai` | تكامل Gemini في `lib/ai-handler.js` |
| `responses` | قاعدة الردود في `lib/responses*.js` |
| `deps` | تحديث الاعتماديات |
| `ci` | ملفات CI/CD و GitHub Actions |
| `rate-limiter` | `lib/rate-limiter.js` |
| `semantic-search` | `lib/semantic-search.js` |
| `security` | `lib/security-headers.js` + security configs |
| `pwa` | `public/manifest.json`, `public/sw.js` |
| `a11y` | Accessibility: `src/hooks/useAccessibility.js`, `src/styles/accessibility.css` |
| `legal` | `legal/*`, Privacy Policy, Terms |
| `admin` | `api/admin.js` |
| `e2e` | `tests/e2e/*` |
| `types` | `types/index.ts`, `types/environment.d.ts` |

### أمثلة صحيحة

```
feat(webhook): add rate limiting with in-memory sliding window

Limits each IP to 60 requests per minute to protect against abuse.
State resets automatically after the window expires.
```

```
fix(whatsapp): handle empty suggestions array in sendResponseWithSuggestions
```

```
docs(readme): add WhatsApp bot setup section with step-by-step guide
```

```
security(webhook): reject POST requests with invalid X-Hub-Signature-256
```

```
refactor(responses): extract GPA calculation to standalone utility function
```

```
chore(deps): bump vite from 8.0.0 to 8.0.1
```

### قواعد عامة للـ Commit

- الوصف القصير بالإنجليزية، في حدود **72 حرفاً**، بصيغة الأمر (imperative): `add`, `fix`, `update` وليس `added`, `fixed`
- إذا كانت التغييرات **breaking change**، أضف `!` بعد الـ type: `feat!: ...` وأضف في الـ footer: `BREAKING CHANGE: ...`
- commit واحد = تغيير واحد منطقي — لا تخلط إصلاح خطأ مع إضافة ميزة في نفس الـ commit

---

## كيفية رفع Pull Request

### 1. تحديث فرعك من الـ upstream

```bash
git fetch upstream
git checkout main
git merge upstream/main
```

### 2. إنشاء فرع جديد للميزة

```bash
# اسم الفرع: type/short-description
git checkout -b feat/compare-universities-export
# أو
git checkout -b fix/webhook-signature-validation
```

### 3. تطوير وتوثيق التغييرات

- اكتب الكود وفق معايير هذا الدليل
- أضف أو حدّث الاختبارات لتغطية التغييرات الجديدة
- حدّث التوثيق إذا أضفت ميزة جديدة أو غيّرت سلوكاً موجوداً

### 4. التحقق النهائي قبل الرفع

```bash
npm run lint     # لا يجب أن يكون هناك أخطاء
npm test         # جميع الاختبارات يجب أن تنجح
npm run build    # البناء يجب أن ينجح بدون أخطاء
```

### 5. Push إلى فرعك

```bash
git push origin feat/compare-universities-export
```

### 6. فتح Pull Request على GitHub

1. اذهب إلى الـ repository على GitHub
2. اضغط **Compare & pull request**
3. اختر الـ base branch: `main`
4. أكمل وصف الـ PR بالقالب التالي:

```markdown
## ما الذي يفعله هذا الـ PR؟

وصف موجز للتغييرات.

## لماذا هذا التغيير ضروري؟

السياق والسبب.

## كيف تم الاختبار؟

- [ ] اختبارات Vitest تنجح محلياً
- [ ] تم اختبار الميزة يدوياً على `npm run dev`
- [ ] تم اختبار بوت WhatsApp (إن كانت التغييرات تؤثر عليه)

## Screenshots (إن وجدت)

<!-- أضف صور للواجهة إذا كانت هناك تغييرات مرئية -->

## Checklist

- [ ] الكود يتبع معايير هذا الدليل
- [ ] الاختبارات تغطي التغييرات الجديدة
- [ ] التوثيق محدَّث (إن لزم)
- [ ] لا secrets أو tokens في الكود
```

---

## معايير المراجعة

سيتم مراجعة كل PR على الأبعاد التالية:

### الوظيفية
- هل الكود يحقق الهدف المطلوب؟
- هل تم التعامل مع حالات الخطأ وحالات الحافة (edge cases)؟

### الجودة
- هل الكود واضح ومقروء؟
- هل يمكن تبسيطه أو تحسينه؟
- هل هناك تكرار يمكن تجنبه؟

### الأمان
- هل البيانات الواردة مُتحقق منها؟
- هل لا توجد secrets مكشوفة؟
- هل التعديلات على `webhook.js` آمنة؟

### الاختبارات
- هل التغييرات مغطاة باختبارات؟
- هل الاختبارات الموجودة لا تزال تنجح؟

### الامتثال القانوني (PDPPL)
- هل التغييرات تجمع أو تعالج بيانات شخصية جديدة؟
- هل تم تحديث `legal/dpa-register.md` إذا أُضيف معالج بيانات جديد؟
- هل Privacy Policy تحتاج تحديثاً؟
- هل تم إضافة حذف تلقائي للبيانات الجديدة في PDPPL Cron؟

### الالتزام بالمعايير
- هل رسائل الـ commits تتبع Conventional Commits؟
- هل الكود يتبع معايير هذا الدليل؟

---

## الإبلاغ عن الأخطاء

إذا وجدت خطأً:

1. تأكد أن الخطأ لم يُبلَّغ عنه مسبقاً في [Issues](../../issues)
2. افتح Issue جديداً بالعنوان:
   ```
   bug: <وصف موجز للخطأ>
   ```
3. أضف في الوصف:
   - **خطوات إعادة الخطأ** — بالترتيب
   - **السلوك المتوقع** — ماذا كان يجب أن يحدث؟
   - **السلوك الفعلي** — ماذا حدث؟
   - **البيئة** — نظام التشغيل، إصدار Node.js، المتصفح (إن كان الخطأ في الواجهة)
   - **Logs أو Screenshots** إن وجدت

---

## الثغرات الأمنية

إذا اكتشفت ثغرة أمنية، **لا ترفع Issue عاماً**. تواصل مباشرةً مع فريق الأمن عبر: security@azkia-software.qa أو راجع `.github/SECURITY.md` للتفاصيل الكاملة. سيتم الرد خلال 48 ساعة.
