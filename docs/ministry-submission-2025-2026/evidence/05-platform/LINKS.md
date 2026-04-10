# روابط المنصة — المستشار الجامعي القطري

> **القسم الخامس من ملف الترشيح — الأدلة الداعمة**
> وزارة التعليم والتعليم العالي — جائزة الممارسات المتميزة 2025-2026

---

## 1. المنصة الإلكترونية العاملة (Web App)

- **الرابط الرئيسي للإنتاج:** <https://qatar-university-advisor.vercel.app>
- **الحالة:** قيد التشغيل على بيئة الإنتاج (Vercel Production)
- **اللغات المدعومة:** العربية (افتراضي — RTL)، الإنجليزية (LTR) عبر `next-intl`
- **الأوضاع البصرية:** الوضع الفاتح والوضع الداكن (عبر `next-themes`)
- **دعم الأجهزة:**
  - حاسوب مكتبي (تصميم متجاوب من 1280 بكسل فأعلى)
  - جهاز لوحي (768–1279 بكسل)
  - هاتف محمول (من 375 بكسل) — مع دعم التثبيت كتطبيق PWA قابل للعمل دون إنترنت (Service Worker + `offline.html`)
- **إمكانية الوصول:** متوافق مع WCAG 2.1 AA (راجع `evidence/04-quality-reports/accessibility-audit.md`)

## 2. تطبيق الواتساب (WhatsApp Business)

- **الرقم الرسمي:** **+974 5529 6286**
- **الحالة:** متكامل عبر WhatsApp Business Cloud API (Meta Graph API v21.0)
- **اللغات:** العربية والإنجليزية
- **ساعات الخدمة:** 24/7 بالردّ الآلي المدعوم بالذكاء الاصطناعي
- **الأمان:** التحقق من توقيع Meta عبر `X-Hub-Signature-256` (HMAC-SHA256) + Rate Limiting عبر Upstash Redis
- **السيناريو المرجعي:** `evidence/01-technical/whatsapp-scenario/README.md`

## 3. مستودع الشيفرة المصدرية

- **GitHub:** <https://github.com/mesuef1974/qatar-university-advisor>
- **الحالة:** خاص (Private)
- **فرع الإنتاج:** `main`
- **النشر التلقائي:** كل دمج في `main` يُطلق نشراً تلقائياً عبر Vercel GitHub Integration
- **نموذج المراجعة:** Pull Request إلزامي + Quality Gate (4 لقطات شاشة light/dark × desktop/mobile) قبل الدمج
- **الترخيص:** ملكية خاصة — شركة أذكياء للبرمجيات (All Rights Reserved)

## 4. مستندات البنية التقنية

| المستند | المسار النسبي |
|---|---|
| مواصفة الـ API (OpenAPI) | [`../01-technical/architecture/api-spec.yaml`](../01-technical/architecture/api-spec.yaml) |
| قرارات المعمارية (ADRs) | [`../01-technical/architecture/adr/`](../01-technical/architecture/adr/) |
| إعداد المراقبة (Monitoring) | [`../01-technical/architecture/monitoring-config.md`](../01-technical/architecture/monitoring-config.md) |
| خطة المراقبة | [`../01-technical/architecture/monitoring-setup.md`](../01-technical/architecture/monitoring-setup.md) |
| تدقيق التبعيات | [`../01-technical/architecture/dependency-audit.md`](../01-technical/architecture/dependency-audit.md) |
| دليل هجرة TypeScript | [`../01-technical/architecture/typescript-migration-guide.md`](../01-technical/architecture/typescript-migration-guide.md) |
| خطة إعادة الهيكلة | [`../01-technical/architecture/refactoring-plan.md`](../01-technical/architecture/refactoring-plan.md) |
| سيناريو الواتساب المقترح | [`../01-technical/whatsapp-scenario/README.md`](../01-technical/whatsapp-scenario/README.md) |

---

## مصادر التحقق

- الرابط الرئيسي مستخرج من: `api-legacy/admin.js` (خط 21) + `legal/disclaimer-academic.md` + `docs/monitoring-config.md`
- رابط المستودع مستخرج من: `git config --get remote.origin.url`
- رقم الواتساب مستخرج من: `docs/ministry-submission-2025-2026/presentation-content.json`
- الحزمة التقنية مستخرجة من: `package.json` (إصدار 2.0.0)

> **ملاحظة:** جميع الروابط تمّ التحقق منها من الشيفرة الفعلية في المستودع بتاريخ 2026-04-10. لا توجد روابط تحتاج تأكيداً من العميل.
