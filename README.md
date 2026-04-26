# Qatar University Advisor — مستشار الجامعات القطرية

<div align="center">

**AR** | [EN](#english-overview)

مستشار ذكي يساعد الطلاب القطريين على اختيار الجامعة والتخصص المناسب عبر واجهة ويب تفاعلية وبوت WhatsApp مدمج.

---

**EN** | [AR](#-نظرة-عامة)

An AI-powered advisor that helps Qatari students choose the right university and major through an interactive web interface and an integrated WhatsApp bot.

<!-- Status badges (will be activated after CI publishes coverage report — شيك-ليست-14 / C3) -->
<!-- ![Coverage](https://img.shields.io/badge/coverage-pending-lightgrey) -->
<!-- ![Tests](https://img.shields.io/badge/tests-535%20passing-brightgreen) -->
<!-- ![PDPPL](https://img.shields.io/badge/PDPPL-in%20progress-yellow) -->

</div>

---

## Screenshots

> _Screenshots will be added after the first stable release._
>
> | Web Interface | WhatsApp Bot |
> |---|---|
> | `[placeholder — web UI screenshot]` | `[placeholder — WhatsApp chat screenshot]` |

---

## نظرة عامة

**Qatar University Advisor** هو تطبيق ويب مبني بـ React يتيح للطلاب:

- البحث في قاعدة بيانات شاملة للجامعات القطرية والتخصصات
- مقارنة الجامعات جنباً إلى جنب
- الحصول على توصيات مبنية على المعدل والجنسية
- التفاعل مع البوت مباشرةً عبر WhatsApp دون الحاجة لفتح المتصفح
- استخدام Google Gemini AI للردود المتقدمة (اختياري)

## English Overview

**Qatar University Advisor** is a React web application that allows students to:

- Search a comprehensive database of Qatari universities and majors
- Compare universities side by side
- Get recommendations based on GPA and nationality
- Interact directly via WhatsApp without opening a browser
- Use Google Gemini AI for advanced responses (optional)

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 16 (App Router), React 19 |
| Styling | Tailwind CSS v4 + shadcn/ui |
| AI | Google Gemini AI |
| Messaging | WhatsApp Cloud API (Meta) via `graph.facebook.com/v21.0` |
| Backend (Serverless) | Vercel Serverless Functions (Next.js API Routes) |
| Database | Supabase (PostgreSQL + pgvector for semantic search) |
| Rate Limiting / Dedup | Upstash Redis (distributed, survives cold starts) |
| Security | HMAC-SHA256 webhook verification, CSP, PII anonymization, Prompt Injection defense |
| State Management | Zustand |
| Testing | Vitest + Playwright (E2E) |
| Linting | ESLint 9 + TypeScript strict |

---

## Installation & Setup

### المتطلبات الأساسية / Prerequisites

- Node.js >= 18
- npm >= 9
- حساب Vercel (للنشر) / Vercel account (for deployment)
- حساب Meta for Developers (لبوت WhatsApp) / Meta for Developers account (for WhatsApp bot)

### 1. Clone the repository

```bash
git clone https://github.com/your-org/qatar-university-advisor.git
cd qatar-university-advisor
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

```bash
cp .env.example .env.local
```

افتح `.env.local` وأضف قيمك الفعلية. انظر قسم [Environment Variables](#environment-variables) أدناه.

### 4. Run in development mode

```bash
npm run dev
```

التطبيق سيعمل على `http://localhost:5173` افتراضياً.

### 5. Run tests

```bash
npm test              # run once
npm run test:watch    # watch mode
npm run test:coverage # with coverage report
```

### 6. Build for production

```bash
npm run build
```

المخرجات في مجلد `dist/`.

---

## Environment Variables

انسخ `.env.example` إلى `.env.local` وأضف القيم التالية:

| المتغير | الوصف | مطلوب |
|---|---|---|
| `WHATSAPP_TOKEN` | رمز الوصول الدائم من Meta Business Suite → System Users | نعم |
| `WHATSAPP_PHONE_ID` | معرف رقم الهاتف من Facebook Developers → تطبيقك → WhatsApp → API Setup | نعم |
| `WEBHOOK_VERIFY_TOKEN` | نص سري تختاره بنفسك، يُستخدم مرة واحدة عند ربط الـ Webhook | نعم |
| `WEBHOOK_APP_SECRET` | App Secret من Facebook Developers → App Settings → Basic | نعم (الإنتاج) |
| `GEMINI_API_KEY` | مفتاح Google Gemini AI (مجاني) من [aistudio.google.com](https://aistudio.google.com/app/apikey) | لا (موصى به) |

> **تنبيه:** لا ترفع `.env.local` إلى Git. تأكد أنه مدرج في `.gitignore`.
>
> في بيئة الإنتاج على Vercel، أضف المتغيرات من:
> **Dashboard → Project → Settings → Environment Variables**

---

## WhatsApp Bot Setup — ربط بوت WhatsApp خطوة بخطوة

### الخطوة 1: إنشاء Meta Business App

1. اذهب إلى [developers.facebook.com](https://developers.facebook.com/apps)
2. اضغط **Create App**
3. اختر نوع التطبيق: **Business**
4. أدخل اسم التطبيق وبريدك الإلكتروني واضغط **Create App**
5. في لوحة التطبيق، ابحث عن **WhatsApp** واضغط **Set up**

### الخطوة 2: الحصول على PHONE_ID و TOKEN

**Phone Number ID:**
1. من لوحة التطبيق: **WhatsApp → API Setup**
2. انسخ قيمة **Phone number ID** (رقم طويل من الأرقام)
3. ضعها في `.env.local` كـ `WHATSAPP_PHONE_ID`

**Access Token (دائم):**
1. اذهب إلى [Meta Business Suite](https://business.facebook.com)
2. من الإعدادات: **System Users → Add**
3. أنشئ مستخدماً من نوع Admin
4. اضغط **Generate New Token**
5. اختر تطبيقك وفعّل صلاحيات: `whatsapp_business_messaging`, `whatsapp_business_management`
6. انسخ الـ Token الناتج وضعه كـ `WHATSAPP_TOKEN`

**App Secret:**
1. في لوحة التطبيق: **App Settings → Basic**
2. انسخ **App Secret** (اضغط Show إذا مخفي)
3. ضعه كـ `WEBHOOK_APP_SECRET`

### الخطوة 3: رفع المتغيرات على Vercel

1. اذهب إلى [vercel.com](https://vercel.com) وافتح مشروعك
2. انتقل إلى **Settings → Environment Variables**
3. أضف كل متغير من الجدول أعلاه بنفس الاسم والقيمة
4. انقر **Save** بعد كل متغير
5. أعد نشر المشروع (**Redeploy**) لتفعيل المتغيرات

### الخطوة 4: إضافة Webhook URL في Meta Console

1. في لوحة التطبيق: **WhatsApp → Configuration**
2. في قسم **Webhook**، اضغط **Edit**
3. في حقل **Callback URL** أدخل:
   ```
   https://your-project.vercel.app/api/webhook
   ```
4. في حقل **Verify Token** أدخل نفس قيمة `WEBHOOK_VERIFY_TOKEN` من ملف `.env.local`
5. اضغط **Verify and Save**
6. بعد التحقق، اشترك في الحدث: **messages** تحت قسم **Webhook Fields**

### الخطوة 5: اختبار البوت

**اختبار التحقق:**
```bash
curl "https://your-project.vercel.app/api/webhook?hub.mode=subscribe&hub.verify_token=YOUR_TOKEN&hub.challenge=test123"
# المتوقع: يرد بـ test123
```

**اختبار الرسائل:**
1. أرسل رسالة WhatsApp إلى رقم الأعمال المربوط
2. تحقق من logs Vercel: **Dashboard → Deployments → Functions → Logs**
3. يجب أن يرد البوت خلال ثوانٍ

> للمزيد من التفاصيل حول إعداد الرقم، انظر [WHATSAPP_SETUP.md](محاضر الاجتماعات/WHATSAPP_SETUP.md).

---

## Features

- **بحث ذكي** — يفهم الأسئلة العربية الطبيعية ويربطها بالجامعات والتخصصات المناسبة
- **توصيات مبنية على المعدل** — أدخل معدلك الدراسي واحصل على قائمة بالجامعات المتاحة
- **مقارنة الجامعات** — قارن بين جامعتين أو أكثر في جدول واحد
- **المفضلات** — احفظ الجامعات والتخصصات المفضلة لمراجعتها لاحقاً
- **تكامل WhatsApp** — بوت كامل يعمل على WhatsApp Business بدون تطبيق إضافي
- **دعم الجنسيات المختلفة** — توصيات مخصصة للقطريين وغير القطريين
- **AI متقدم** — تكامل اختياري مع Google Gemini لردود أكثر دقة وتفصيلاً
- **واجهة متجاوبة** — تعمل على الهاتف والحاسوب بتصميم احترافي
- **أمان عالي** — التحقق من توقيع Meta، تحديد معدل الطلبات، سياسة CSP صارمة

---

## Project Structure

```
qatar-university-advisor/
├── api/
│   └── webhook.js              # Vercel Serverless Function — WhatsApp webhook handler
├── lib/
│   ├── whatsapp.js             # WhatsApp Cloud API client (send messages, buttons, lists)
│   ├── findResponse.js         # Message processing engine — keyword matching & routing
│   ├── ai-handler.js           # Google Gemini AI integration
│   ├── responses.js            # Core response database (universities, majors, GPA logic)
│   ├── responses-extended.js   # Extended response database
│   └── nationality-advisor.js  # Nationality-specific admission logic
├── src/
│   ├── App.jsx                 # Root application component
│   ├── QatarUniversityAdvisor.jsx  # Main advisor component
│   ├── index.css               # Global styles
│   ├── App.css                 # App-level styles
│   ├── main.jsx                # React entry point
│   └── components/
│       ├── Header.jsx          # App header with navigation
│       ├── SideMenu.jsx        # Sidebar navigation menu
│       ├── UniversitiesView.jsx # Universities listing view
│       ├── CompareView.jsx     # University comparison view
│       ├── FavoritesView.jsx   # Saved favorites view
│       ├── PrivacyConsent.jsx  # GDPR/privacy consent dialog
│       ├── PrivacyPolicy.jsx   # Privacy policy page
│       ├── TermsOfService.jsx  # Terms of service page
│       ├── RefundPolicy.jsx    # Refund policy page
│       └── ExecutionPlan.jsx   # Admin execution plan view
├── tests/                      # Vitest test files
├── public/                     # Static assets
├── Docs/                       # Project documentation & meeting notes
├── .env.example                # Environment variables template
├── vercel.json                 # Vercel deployment config + security headers
├── vite.config.js              # Vite build configuration
├── vitest.config.js            # Vitest test configuration
├── eslint.config.js            # ESLint 9 flat config
└── package.json                # Dependencies & scripts
```

---

## Deployment

المشروع مُهيأ للنشر على Vercel:

```bash
# تثبيت Vercel CLI
npm i -g vercel

# نشر (المرة الأولى — يطلب ربط المشروع)
vercel

# نشر في الإنتاج
vercel --prod
```

تأكد من إضافة جميع متغيرات البيئة في Vercel Dashboard قبل النشر.

---

## Contributing

نرحب بالمساهمات! اقرأ [CONTRIBUTING.md](محاضر الاجتماعات/CONTRIBUTING.md) لمعرفة معايير الكود وطريقة رفع PR.

---

## License

هذا المشروع خاص (private). جميع الحقوق محفوظة.
