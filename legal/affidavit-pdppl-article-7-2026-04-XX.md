# إقرار امتثال — المادة 7 من PDPPL (قانون 13/2016)
## PDPPL Article 7 Compliance Affidavit
## Qatar University Advisor | شركة أذكياء للبرمجيات

---

| البند | التفاصيل |
|-------|----------|
| **رقم الإصدار** | 1.0 |
| **تاريخ التوقيع** | 2026-04-XX (يُملأ يوم النشر إلى الإنتاج) |
| **المنتج** | Qatar University Advisor (qua.qa) |
| **المسؤول** | Sufyan Mesyef — CEO، شركة أذكياء للبرمجيات |
| **DPO** | dpo@azkia.qa |
| **المرجع القانوني** | قانون رقم 13 لسنة 2016 — حماية خصوصية البيانات الشخصية (PDPPL) — المادة 7 |
| **الحالة** | ⏸ مسودة بانتظار التوقيع — يُحدَّث إلى ✅ Signed يوم النشر |

---

## 1. الإقرار

أقرّ أنا، **Sufyan Mesyef**، بصفتي المدير التنفيذي لـ شركة أذكياء للبرمجيات، أن منتج **Qatar University Advisor** أصبح في تاريخ التوقيع المذكور أعلاه ممتثلاً لمتطلبات **المادة 7 من PDPPL** التي تنصّ على وجوب الحصول على **موافقة صريحة، مستنيرة، حرّة، وقابلة للسحب** قبل أي معالجة لبيانات شخصية.

## 2. الأدلة التقنية على الامتثال

### 2.1 آلية الموافقة على الويب
- **الملف**: [`src/components/ConsentModal.tsx`](../src/components/ConsentModal.tsx)
- **التشغيل**: يظهر تلقائياً على أول زيارة (gated بـ `localStorage.qua_consent_v1`)
- **منع التجاوز**: المودال لا يُغلق بـ Escape ولا بالنقر خارجه — اختيار صريح إلزامي
- **التسجيل**: نقرة "أوافق" → POST `/api/consent` → INSERT في جدول `user_consents` مع IP + User-Agent + Timestamp + نص الموافقة الكامل
- **commit**: `8811e64` على branch `claude/trusting-lovelace-9ee6a3`

### 2.2 آلية الموافقة على WhatsApp
- **الملف**: [`src/app/api/webhook/route.ts`](../src/app/api/webhook/route.ts) السطور 184-227
- **السلوك**: قبل كل `processMessage()` يُفحص `hasUserConsented(phone)` — إن لم يوافق المستخدم، تُرسَل رسالة الموافقة + 3 أزرار تفاعلية
- **اللغة**: عربي + إنجليزي للقبول والرفض (`أوافق`/`agree` / `لا أوافق`/`decline`)
- **منع تسرّب**: `processMessage()` لا يُستدعى أبداً قبل `is_active = TRUE`

### 2.3 جدول user_consents
- **الإنشاء**: Migration `004_pdppl_complete_2026_04_26.sql`
- **RLS**: deny-by-default — service_role فقط
- **الحقول**: id, phone, consent_type, consented_at, withdrawn_at, ip_address, user_agent, consent_text, is_active, created_at
- **سحب الموافقة**: `withdrawConsent(phone)` يضع `is_active=false` + `withdrawn_at=NOW()`

### 2.4 نص الموافقة المعتمد
نص الموافقة الكامل بالعربية محفوظ في [`lib/consent-handler.ts`](../lib/consent-handler.ts) السطور 44-77 ويتضمن:
- ✅ هوية مُعالج البيانات (شركة أذكياء للبرمجيات)
- ✅ الغرض من المعالجة (استشارة جامعية مخصصة)
- ✅ فئات البيانات المجموعة (هاتف، جنسية، معدل، محتوى المحادثة)
- ✅ المعالجون الفرعيون (Supabase, Vercel, Meta WhatsApp, Google Gemini)
- ✅ مدة الاحتفاظ (طوال الاستخدام + 30 يوماً بعد طلب الحذف)
- ✅ حقوق صاحب البيانات (المواد 9-14 من PDPPL مع رقم كل مادة)
- ✅ معلومات DPO (dpo@azkia.qa)
- ✅ المرجع القانوني الصريح (المادة 7)
- ✅ خياران واضحان: أوافق / لا أوافق

### 2.5 سرّيّة وأمن السجل
- **PII Scrubber** (Article 5 + 15): `lib/sanitizer.ts` `scrubPII()` يُطبَّق في `logQuery()` قبل INSERT في `analytics`
- **Sentry PII filtering**: `sentry.{client,server,edge}.config.ts` يحذف phone/gpa/nationality/email من event payloads
- **CRON authentication hard-fail**: `src/app/api/cron/pdppl-cleanup/route.ts` يرفض التشغيل إذا `CRON_SECRET` غير مُعيَّن (commit `63f34ed`)

## 3. التحقّقات المُجراة (Verification Steps)

| # | الفحص | الأداة | النتيجة |
|---|---|---|---|
| 1 | TypeScript strict mode | `npx tsc --noEmit` | ✅ PASS |
| 2 | Webhook unit tests | `npx vitest run tests/webhook.test.js` | ✅ 20/20 PASS |
| 3 | Browser preview — Modal RTL | `preview_screenshot` | ✅ يُرَى بـ RTL صحيح |
| 4 | Decline flow | `preview_click + screenshot` | ✅ Modal يُغلق + localStorage يُحدَّث |
| 5 | RLS state | Migrations 003 + 004 applied | ✅ deny-by-default على PII tables |
| 6 | Vercel env vars | CEO confirmed (2026-04-27) | ✅ SUPABASE_SERVICE_ROLE_KEY + CRON_SECRET + SENTRY_DSN |

## 4. الفجوات المتبقية (شفافية)

البنود التالية في خارطة طريق ما بعد 2026-05-01 ولا تؤثّر على امتثال المادة 7:

| Finding | البند | الموعد المُقترَح |
|---|---|---|
| F-2 | Rate limiter يفشل مفتوحاً عند خلل Upstash | 2026-04-28 (ضمن نفس النشر) |
| F-5 | تفعيل semantic search على knowledge_embeddings | 2026-05-15 |
| F-6 | تفكيك ملفات > 700 سطر | Sprint+1 |
| F-7+F-12 | توسيع coverage scope | Sprint+1 |
| F-8 | DR drill قياس RTO/RPO | 2026-05-15 |
| F-9 | إصلاح `unoptimized={true}` على 5 صور | Sprint+1 |
| F-10+F-11 | a11y baseline + dark mode contrast | 2026-05-10 |
| F-13 | Sentry source maps + DORA dashboard | Sprint+1 |

## 5. تعهّد المراجعة الدورية

أتعهّد بمراجعة آلية الموافقة كل **3 أشهر** أو عند:
- تغيير في قائمة المعالجين الفرعيين
- تعديل في فئات البيانات المجموعة
- تحديث في PDPPL أو الأنظمة التنفيذية
- شكوى من NCSA أو من أي صاحب بيانات

أيّ تغيير يستوجب تحديث `CONSENT_TEXT` في `lib/consent-handler.ts` + سحب الموافقات النشطة + إعادة طلب الموافقة في الجلسة التالية لكل مستخدم.

## 6. التوقيع

| الدور | الاسم | التوقيع | التاريخ |
|---|---|---|---|
| **CEO** | Sufyan Mesyef | _______________________ | ____/____/______ |
| **DPO** (مؤقتاً) | Sufyan Mesyef | _______________________ | ____/____/______ |
| **شاهد** (اختياري) | _______________________ | _______________________ | ____/____/______ |

---

## ملاحظات للتوقيع
1. **لا توقّع قبل** التحقق من نشر التغييرات على production (https://qatar-university-advisor.vercel.app).
2. **لا توقّع قبل** smoke tests:
   - زيارة الموقع → ConsentModal يظهر
   - "لا أوافق" → Modal يُغلق
   - زيارة جديدة (مسح localStorage) → Modal يظهر مرة أخرى
   - WhatsApp: رسالة من رقم جديد → نص الموافقة + أزرار
3. **بعد التوقيع**: انسخ هذا الملف إلى `الأرشيف-المؤسسي/06_القانوني-والامتثال/` مع التاريخ الفعلي.
4. **NCSA notification**: أرسل نسخة موقّعة (PDF) عبر بوابة NCSA — احفظ confirmation number في `legal/ncsa-registration.md`.

---
**نهاية الإقرار.**
