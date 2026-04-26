# PDPPL Phase E — Action Templates (CEO-Ready)

**التاريخ**: 2026-04-26
**Deadline**: 2026-05-01 (5 أيام)
**الغرض**: قوالب جاهزة للنسخ-لصق-إرسال — لتسريع إكمال Phase E القانوني

> **CEO**: انسخ كل قالب → عدّل الـ `{{placeholders}}` → أرسل/وقّع/احفظ.

---

# 1️⃣ DPA Activation — 4 رسائل بريد جاهزة

## A. Supabase — DPA Self-Service (الأسرع)

> Supabase لديهم DPA self-service. لا حاجة لرسالة — اتبع الواجهة:

**خطوات (3 دقائق)**:
1. افتح: https://supabase.com/dashboard/project/detvvlnvbygyzgbsuobv/settings/general
2. ابحث عن قسم **"Legal"** أو **"Data Processing Agreement"**
3. اضغط **"Sign DPA"** أو **"Accept DPA"**
4. وقّع إلكترونياً باسمك (Sufyan Mesyef) + الشركة (Azkia for Software)
5. احفظ نسخة PDF في `الأرشيف-المؤسسي/06_القانوني-والامتثال/dpa-signed/supabase-dpa-signed-2026-04-XX.pdf`

**إن لم تظهر الواجهة — رسالة بديلة**:
```
To: privacy@supabase.io
Subject: DPA Request — Project ID detvvlnvbygyzgbsuobv (Qatar PDPPL Compliance)

Dear Supabase Privacy Team,

I am writing on behalf of Azkia for Software (Qatar), the controller for the
"Qatar University Advisor" platform hosted on your services.

Under Qatar Personal Data Privacy Protection Law (PDPPL — Law No. 13 of 2016,
Article 12), we are required to have a written Data Processing Agreement
with all processors before 2026-05-01.

Our Supabase project: detvvlnvbygyzgbsuobv (region: us-east-1)
Data processed: phone numbers, conversation history, student profile data
                (GPA, nationality), consent records (PDPPL Article 7).

Could you confirm:
1. The DPA accessible from our Dashboard fully covers GDPR + PDPPL?
2. Whether sub-processors (AWS, etc.) are listed in your DPA appendix?
3. Your data deletion SLA when we issue Article 16 (right to erasure) requests?

We need to file proof of DPA execution with Qatar's National Cyber Security
Agency by 2026-05-01.

Best regards,
Sufyan Mesyef
CEO, Azkia for Software
DPO: {{TBD — see DPO decision in section 2}}
Email: s.mesyef0904@education.qa
```

---

## B. Vercel — DPA Self-Service

**خطوات**:
1. افتح: https://vercel.com/teams/shahanya-schools-projects/settings/security
2. قسم **"Data Processing Addendum"** → اضغط **"Accept DPA"**
3. (اختياري) اطلب نسخة موقّعة عبر https://vercel.com/contact/sales

**رسالة بديلة**:
```
To: privacy@vercel.com
Subject: DPA Request for Hobby Account — PDPPL Qatar Compliance

Dear Vercel Privacy Team,

We host the "Qatar University Advisor" platform on Vercel under the team
"shahanya-schools-projects". To comply with Qatar PDPPL (Law 13/2016) by
2026-05-01, we require a signed DPA covering:

- Data: WhatsApp message metadata, IP logs, conversation persistence
- Region preference: EU (PDPPL recommends data localization)
- Sub-processors: please confirm AWS / GCP usage

Could you either point us to the signed DPA URL or send a counter-signed PDF?

Best regards,
Sufyan Mesyef
CEO, Azkia for Software
```

---

## C. Meta (WhatsApp Business) — Most complex

**خطوات**:
1. افتح Meta Business Suite → Settings → Compliance → Data Processing Terms
2. للحساب الذي يحتوي WhatsApp Phone ID
3. وقّع DPT (Data Processing Terms) — Meta version of DPA

**إن احتجت ممثل**:
```
To: business-support@meta.com (via Help Center ticket)
Subject: WhatsApp Business API DPA — Qatar PDPPL Compliance

We operate a WhatsApp Cloud API integration (Phone ID: {{your-phone-id}})
and require execution of Data Processing Terms before 2026-05-01 to comply
with Qatar PDPPL. Please advise whether the standard Meta DPT applies or
if we need a country-specific addendum.
```

---

## D. Google (Gemini API) — DPA Self-Service

**خطوات**:
1. افتح: https://console.cloud.google.com/iam-admin/settings → Cloud Data Processing Addendum
2. Accept → نسخة PDF تُرسل للإيميل تلقائياً
3. احفظ في الأرشيف

---

# 2️⃣ DPO Decision — قرار تعيين رسمي

> **انسخ هذا القالب → عدّل الأسماء/التواريخ → وقّع → احفظ في الأرشيف + سجّل في NCSA**

```markdown
# قرار إداري رقم: DEC-DPO-001
# تعيين مسؤول حماية البيانات (Data Protection Officer)

**الجهة المُصدِرة**: شركة أذكياء للبرمجيات (Azkia for Software)
**التاريخ**: 2026-04-XX
**التصنيف**: رسمي

---

## المرجع القانوني
- قانون حماية البيانات الشخصية القطري رقم 13 لسنة 2016 (PDPPL) — المادة 26
- اللائحة التنفيذية لقانون PDPPL

## القرار

نحن، {{Sufyan Mesyef}}، الرئيس التنفيذي لشركة أذكياء للبرمجيات (سجل تجاري
رقم {{TBD}})، نُقرر بموجب هذا الوثيقة:

**1. التعيين**:
يُعيَّن **{{اسم DPO الكامل}}** (الجنسية: {{قطري/مقيم}}، البطاقة الشخصية: {{XXX}})
في منصب **مسؤول حماية البيانات (DPO)** لشركة أذكياء للبرمجيات.

**2. النطاق**:
- جميع منصات الشركة بما فيها "مستشار جامعة قطر"
- جميع البيانات الشخصية للمستخدمين (طلاب، أولياء أمور، خريجين)

**3. المهام والصلاحيات**:
أ. ضمان امتثال الشركة لـ PDPPL وكل اللوائح ذات الصلة.
ب. الإشراف على جميع عمليات معالجة البيانات الشخصية.
ج. التواصل المباشر مع NCSA كنقطة الاتصال الرسمية.
د. الاستجابة لطلبات أصحاب البيانات (الوصول، التصحيح، الحذف، الاعتراض).
هـ. مراجعة DPA مع جميع المعالجين الخارجيين.
و. الإبلاغ عن خروقات البيانات خلال 72 ساعة لـ NCSA.
ز. التوعية الداخلية وتدريب الموظفين.

**4. الاستقلالية**:
يتمتع DPO بالاستقلالية الكاملة في أداء مهامه ولا يُلزم بقرارات تعارض القانون.
يصل مباشرة لـ CEO ويحضر جميع اجتماعات اتخاذ القرار المتعلقة بالبيانات.

**5. الميزانية والموارد**:
يُخصص للـ DPO {{ميزانية سنوية}} لـ:
- الاشتراك في تحديثات قانونية
- التدريب المتخصص
- استشارات قانونية خارجية عند الحاجة

**6. مدة التعيين**:
سنة واحدة قابلة للتجديد، تبدأ من تاريخ توقيع هذا القرار.

**7. النفاذ**:
يدخل هذا القرار حيز التنفيذ من تاريخ التوقيع أدناه.

---

| التوقيع | الاسم | المنصب | التاريخ |
|---------|-------|--------|---------|
| __________ | Sufyan Mesyef | CEO | 2026-04-XX |
| __________ | {{اسم DPO}} | DPO | 2026-04-XX |

**ختم الشركة**: ___________
```

---

# 3️⃣ NCSA Notification — تسجيل DPO

> أرسل هذا للـ NCSA portal أو عبر البريد الرسمي.

**Portal**: https://www.ncsa.gov.qa/ar (قسم "حماية البيانات")
**أو**: dataprotection@ncsa.gov.qa (تحقق من العنوان الرسمي قبل الإرسال)

```
الموضوع: إخطار تعيين مسؤول حماية البيانات (DPO) — شركة أذكياء للبرمجيات

السادة في الوكالة الوطنية للأمن السيبراني (NCSA)،
وفقاً لأحكام قانون حماية البيانات الشخصية القطري (رقم 13 لسنة 2016)
وتحديداً المادة 26، نُخطركم بالتالي:

1. الجهة الـمُتحكِّمة (Data Controller):
   - الاسم: شركة أذكياء للبرمجيات (Azkia for Software)
   - السجل التجاري: {{رقم السجل}}
   - العنوان: {{عنوان الشركة}}
   - الإيميل الرسمي: s.mesyef0904@education.qa

2. الـمنصات المُشغَّلة:
   - "مستشار جامعة قطر" — منصة استشارية للقبول الجامعي
     (https://qatar-university-advisor.vercel.app)
   - أنواع البيانات: أرقام هواتف، نسب أكاديمية، جنسية، اهتمامات
   - عدد المستخدمين الحالي: {{عدد المستخدمين}}

3. مسؤول حماية البيانات (DPO) المُعيَّن:
   - الاسم الكامل: {{اسم DPO}}
   - الجنسية: {{قطري/مقيم}}
   - رقم البطاقة الشخصية: {{XXX}}
   - الإيميل الرسمي: {{dpo@azkia.qa أو إيميل بديل}}
   - رقم الهاتف: {{XXX}}
   - تاريخ التعيين: 2026-04-XX
   - مرجع التعيين: قرار إداري رقم DEC-DPO-001

4. اتفاقيات معالجة البيانات (DPA):
   مرفقة نُسخ موقّعة لـ:
   - DPA مع Supabase (مزود قاعدة البيانات)
   - DPA مع Vercel (مزود استضافة)
   - DPA مع Meta/WhatsApp (قناة التواصل)
   - DPA مع Google/Gemini (مزود الذكاء الاصطناعي)

5. المرفقات:
   - قرار تعيين DPO (DEC-DPO-001)
   - سجل معالجة البيانات (ROPA) المحدّث
   - السياسات الأمنية والتقنية المعمول بها
   - 4 اتفاقيات DPA الموقّعة

نلتزم بالتعاون الكامل مع NCSA في أي تدقيق أو طلب معلومات إضافية.

تفضّلوا بقبول فائق الاحترام،

Sufyan Mesyef
الرئيس التنفيذي
شركة أذكياء للبرمجيات
2026-04-XX
```

---

# 4️⃣ Privacy Policy Review — Checklist (10 دقائق)

افتح: `src/app/privacy/page.tsx` وتأكد من ذكر:

- [ ] تعريف Azkia كـ Data Controller
- [ ] أنواع البيانات المجموعة (phone, GPA, nationality, conversation logs)
- [ ] الأساس القانوني للمعالجة (PDPPL Article 7 — explicit consent)
- [ ] قائمة المعالجين الخارجيين (Supabase, Vercel, Meta, Google)
- [ ] مدة الاحتفاظ بالبيانات (recommended: 24 شهر بعد آخر نشاط)
- [ ] حقوق المستخدم (PDPPL Articles 15-19): access, rectification, erasure, objection
- [ ] كيفية ممارسة الحقوق (email + WhatsApp number)
- [ ] معلومات DPO (name + email)
- [ ] إجراء الإبلاغ عن خرق
- [ ] تاريخ آخر تحديث + رقم إصدار

---

# 📊 Phase E — Tracking Sheet

| البند | الحالة | تاريخ الإكمال | المُلاحظات |
|------|--------|---------------|-----------|
| 1A — Supabase DPA | ⏳ | — | self-service via dashboard |
| 1B — Vercel DPA | ⏳ | — | self-service via dashboard |
| 1C — Meta DPT | ⏳ | — | Meta Business Suite |
| 1D — Google DPA | ⏳ | — | GCP Console |
| 2 — DPO Decision | ⏳ | — | يحتاج اختيار شخص + توقيع |
| 3 — NCSA Notification | ⏳ | — | بعد إكمال 1+2 |
| 4 — Privacy Policy Review | ⏳ | — | code change + redeploy |

---

# 🚦 الترتيب المُوصى به (4 ساعات عمل CEO)

1. **اليوم (30 دقيقة)**: 1A + 1B + 1D — الـ 3 DPAs self-service
2. **اليوم (1 ساعة)**: 1C — Meta (الأطول)
3. **غداً (1.5 ساعة)**: 2 — DPO Decision (اختيار شخص + توقيع)
4. **غداً (30 دقيقة)**: 3 — NCSA Notification (إرسال + تأكيد استلام)
5. **بعد غدٍ (30 دقيقة)**: 4 — Privacy Policy Review (CEO review + ack)

**Deadline**: 2026-05-01 (5 أيام — متوفّر وقت كافٍ للتنفيذ المتأنّي)

---

**التوقيع**: AzkiaOS v5.0 — 2026-04-26
**سند**: PDPPL-package-2026-04-26.md + DEC-SEC-003 closure
