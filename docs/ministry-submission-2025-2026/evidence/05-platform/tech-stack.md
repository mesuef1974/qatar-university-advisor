# البنية التقنية — ملخص عام

> **القسم الخامس — الأدلة الداعمة**
> ملخص مهني للبنية التقنية للمستشار الجامعي القطري (إصدار التطبيق: 2.0.0)

---

## الواجهة الأمامية (Frontend)

- **إطار العمل:** Next.js 16.2.3 (App Router + Turbopack)
- **مكتبة العرض:** React 19.2
- **اللغة:** TypeScript 5
- **التصميم:** Tailwind CSS 4 + مكتبة مكوّنات shadcn/ui + Base UI
- **إدارة الحالة:** Zustand 5
- **التوطين (i18n):** next-intl (عربي افتراضي RTL، إنجليزي LTR)
- **السمات:** next-themes (فاتح/داكن + احترام تفضيل النظام)
- **PWA:** Service Worker + Manifest + صفحة Offline

## الخادم والـ API (Backend)

- **بيئة التشغيل:** Node.js
- **الـ API:** Next.js API Routes (Vercel Serverless Functions)
- **قاعدة البيانات:** PostgreSQL عبر Supabase، مع امتداد pgvector للبحث الدلالي
- **طبقة الوصول:** `@supabase/supabase-js` v2 باستخدام SERVICE_ROLE_KEY خلف RLS deny-by-default
- **تحديد المعدّل (Rate Limiting):** Upstash Redis + `@upstash/ratelimit`
- **المهام المجدولة (Cron):** Vercel Cron — تنظيف PDPPL يومياً 02:00 UTC

## الذكاء الاصطناعي

- **النموذج الأساسي:** Anthropic Claude Sonnet 4
- **وضع Fallback:** ردود محلية مبنية على القواعد عند عدم توفر المفتاح
- **البحث الدلالي:** pgvector على Supabase لمطابقة أسئلة الطلاب بقاعدة المعارف

## قناة الواتساب

- **واجهة التكامل:** WhatsApp Business Cloud API (Meta Graph API v21.0)
- **الأمان:** HMAC-SHA256 عبر `X-Hub-Signature-256` + `WEBHOOK_APP_SECRET`
- **الرقم الرسمي:** +974 5529 6286

## الاستضافة والبنية التحتية

| الخدمة | الاستخدام |
|---|---|
| **Vercel** | استضافة التطبيق + Serverless Functions + Cron + CDN عالمي |
| **Supabase** | قاعدة البيانات PostgreSQL + pgvector + Auth |
| **Upstash Redis** | تحديد المعدّل والتخزين المؤقت |
| **Meta Cloud API** | قناة WhatsApp الرسمية |
| **Anthropic API** | نموذج الذكاء الاصطناعي |

## الجودة والاختبارات

- **الفحص الساكن:** ESLint 9 + `eslint-config-next`
- **فحص الأنواع:** `tsc --noEmit`
- **الاختبارات الآلية:** Playwright (E2E) + Vitest (وحدات)
- **ميزانية الأداء:** Lighthouse Budget (`lighthouse-budget.json`)
- **بوابة الجودة:** 4 لقطات شاشة إلزامية (فاتح/داكن × مكتبي/محمول) قبل أي نشر

## الأمان والامتثال

- **قانون حماية البيانات الشخصية القطري (PDPPL Law 13-2016):** متوافق بالكامل
  - RLS (Row-Level Security) deny-by-default على جميع الجداول
  - هجرة 003 + اختبارات RLS موثّقة (راجع commits `2a07d22` و `67083bf` و `0681b1e`)
  - حذف تلقائي للبيانات المؤقتة عبر مهمة Cron يومية
- **اتفاقيات معالجة البيانات (DPAs):** 4 موقّعة (Vercel، Supabase، Anthropic، Meta)
- **موظف حماية البيانات (DPO):** معيّن
- **الوكالة الوطنية للأمن السيبراني (NCSA):** مُسجَّل
- **التحقق من الـ Webhook:** HMAC-SHA256 في بيئة الإنتاج (إلزامي)
- **إدارة الأسرار:** Vercel Environment Variables — لا يوجد `NEXT_PUBLIC_*` لأي مفتاح سري
- **مراقبة الأخطاء:** Sentry (مُفعّل عبر integration)
- **المراقبة:** Grafana Cloud

---

## مراجع التحقق

- `package.json` (الإصدار 2.0.0) — التبعيات والإصدارات
- `vercel.json` — إعدادات النشر والـ Cron
- `.env.example` — المتغيرات المطلوبة
- `evidence/01-technical/architecture/` — ADRs وتفاصيل المعمارية
- `evidence/03-pdppl-compliance/` — ملفات الامتثال

> **تنبيه:** README.md الجذر يحتوي حالياً على وصف قديم (React + Vite + Gemini) — القيم أعلاه مأخوذة من `package.json` الفعلي الذي يعكس الحزمة الحالية (Next.js + Anthropic Claude).
