# نموذج التسجيل لدى الهيئة الوطنية للأمن السيبراني
# NCSA Registration Application Form
## Qatar University Advisor | شركة النخبوية للبرمجيات
**رقم المرجع:** NCSA-REG-2026-001 | **التاريخ:** 2026-04-04

---

## القسم الأول: بيانات الجهة المُسجِّلة
## Section 1: Registrant Information

| البند / Field | البيانات / Data |
|---------------|----------------|
| **اسم الجهة / Entity Name** | شركة النخبوية للبرمجيات / Elite Software Company |
| **السجل التجاري / Commercial Registration** | [يُملأ] |
| **نوع الجهة / Entity Type** | شركة ذات مسؤولية محدودة / Limited Liability Company |
| **العنوان / Address** | الدوحة، دولة قطر / Doha, State of Qatar |
| **البريد الإلكتروني / Email** | [يُملأ] |
| **الهاتف / Phone** | [يُملأ] |
| **الموقع الإلكتروني / Website** | [يُملأ] |
| **الممثل القانوني / Legal Representative** | المدير العام (CEO) |
| **المستشار القانوني / Legal Counsel** | elite-legal-counsel |

---

## القسم الثاني: وصف النشاط ومعالجة البيانات
## Section 2: Activity Description & Data Processing

### أ. وصف المشروع / Project Description

| البند / Field | الوصف / Description |
|---------------|---------------------|
| **اسم المشروع** | Qatar University Advisor — المرشد الجامعي لدولة قطر |
| **نوع الخدمة** | مستشار أكاديمي ذكي عبر WhatsApp والويب |
| **الجمهور المستهدف** | طلاب الثانوية العامة وأولياء الأمور في قطر |
| **تاريخ الإطلاق** | 2026 |
| **البنية التحتية** | Vercel (استضافة) + Supabase (قاعدة بيانات) + Google Gemini (ذكاء اصطناعي) + WhatsApp Business API |

### ب. أنواع البيانات الشخصية المُعالجة / Types of Personal Data Processed

| نوع البيانات / Data Type | المصدر / Source | حساسة؟ / Sensitive? | الأساس القانوني / Legal Basis |
|--------------------------|-----------------|---------------------|-------------------------------|
| أرقام الهواتف / Phone Numbers | WhatsApp | نعم / Yes | موافقة صريحة / Explicit Consent (المادة 4) |
| الجنسية / Nationality | إدخال المستخدم / User Input | نعم / Yes | موافقة صريحة / Explicit Consent (المادة 4) |
| سجل المحادثات / Conversation History | التفاعل مع البوت / Bot Interaction | لا / No | مصلحة مشروعة / Legitimate Interest (المادة 5) |
| المعدل الأكاديمي / Academic GPA | إدخال اختياري / Optional Input | لا / No | موافقة صريحة / Explicit Consent (المادة 4) |
| عنوان IP / IP Address | الاتصال بالخادم / Server Connection | لا / No | مصلحة مشروعة / Legitimate Interest (المادة 5) |
| بيانات الجلسة / Session Data | ملفات تعريف الارتباط / Cookies | لا / No | مصلحة مشروعة / Legitimate Interest (المادة 5) |

### ج. معالجو البيانات الخارجيون / External Data Processors

| المعالج / Processor | الدولة / Country | نوع المعالجة / Processing Type | DPA مُوقَّع / DPA Signed? |
|---------------------|------------------|-------------------------------|--------------------------|
| Supabase Inc. | الولايات المتحدة / USA | تخزين + مصادقة / Storage + Auth | ⏳ قيد الإعداد |
| Vercel Inc. | الولايات المتحدة / USA | استضافة + CDN / Hosting + CDN | ⏳ قيد الإعداد |
| Google Cloud (Gemini) | الولايات المتحدة / USA | معالجة لغوية / NLP Processing | ⏳ قيد الإعداد |
| Meta/WhatsApp | الولايات المتحدة / USA | مراسلة / Messaging | ⏳ قيد الإعداد |

---

## القسم الثالث: الإجراءات الأمنية المُطبَّقة
## Section 3: Security Measures Implemented

### أ. الحماية التقنية / Technical Safeguards

| الإجراء / Measure | الحالة / Status | التفاصيل / Details |
|-------------------|----------------|---------------------|
| تشفير البيانات أثناء النقل / Encryption in Transit | ✅ مُطبَّق | TLS 1.3 عبر HTTPS |
| تشفير البيانات المخزنة / Encryption at Rest | ✅ مُطبَّق | AES-256 (Supabase) |
| المصادقة الآمنة / Secure Authentication | ✅ مُطبَّق | crypto.timingSafeEqual + API Keys |
| حماية من الحقن / Injection Protection | ✅ مُطبَّق | sanitizer.js — 20+ نمط |
| Content Security Policy | ✅ مُطبَّق | CSP headers في vercel.json |
| Rate Limiting | ✅ مُطبَّق | Upstash Redis — حسب IP |
| فحص أمني تلقائي / Automated Security Scan | ✅ مُطبَّق | npm audit في CI + Dependabot |
| Circuit Breaker | ✅ مُطبَّق | حماية من فشل الخدمات الخارجية |

### ب. الحماية التنظيمية / Organizational Safeguards

| الإجراء / Measure | الحالة / Status |
|-------------------|----------------|
| سياسة الخصوصية مُعلنة / Published Privacy Policy | ✅ |
| إخلاء مسؤولية أكاديمي / Academic Disclaimer | ✅ |
| خطة استجابة للحوادث / Incident Response Plan | ✅ |
| قائمة امتثال PDPPL / PDPPL Compliance Checklist | ✅ |
| مستشار قانوني معيّن / Legal Counsel Appointed | ✅ QR-2026-008 |
| DPO معيّن / DPO Appointed | ⏳ قيد التعيين (LEGAL-006) |
| تدريب الموظفين / Staff Training | ⏳ مُخطَّط (2026-05-15) |

---

## القسم الرابع: آلية التعامل مع حقوق أصحاب البيانات
## Section 4: Data Subject Rights Mechanism

| الحق / Right | الآلية / Mechanism | زمن الاستجابة / Response Time |
|--------------|---------------------|------------------------------|
| حق الوصول / Right of Access | طلب عبر البريد الإلكتروني | 15 يوم عمل |
| حق التصحيح / Right to Rectification | طلب عبر البريد الإلكتروني | 7 أيام عمل |
| حق الحذف / Right to Erasure | طلب عبر البريد + تأكيد هوية | 30 يوم عمل |
| حق النقل / Right to Portability | تصدير JSON عبر API | 15 يوم عمل |
| حق الاعتراض / Right to Object | طلب مكتوب | 7 أيام عمل |

---

## القسم الخامس: الإقرار والتوقيع
## Section 5: Declaration & Signature

> **نُقرّ بأن جميع المعلومات الواردة في هذا النموذج صحيحة ودقيقة، وأن شركة النخبوية للبرمجيات تلتزم بالامتثال الكامل لقانون حماية خصوصية البيانات الشخصية (القانون رقم 13 لسنة 2016) وجميع اللوائح الصادرة عن الهيئة الوطنية للأمن السيبراني.**
>
> **We hereby declare that all information provided in this form is accurate and complete, and that Elite Software Company commits to full compliance with the Personal Data Privacy Protection Law (Law No. 13 of 2016) and all regulations issued by the National Cyber Security Agency.**

---

| التوقيع / Signature | الاسم / Name | الصفة / Title | التاريخ / Date |
|---------------------|-------------|---------------|----------------|
| __________________ | [يُملأ] | المدير العام / CEO | ____/____/____ |
| __________________ | [يُملأ] | المستشار القانوني / Legal Counsel | ____/____/____ |

---

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚖️ مُراجَع ومعتمد قانونياً
المستشار القانوني: elite-legal-counsel
التاريخ: 2026-04-04
رقم المراجعة: REV-2026-005
الحكم: ✅ متوافق — جاهز للتقديم بعد استكمال DPA + DPO
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

*شركة النخبوية للبرمجيات | elite-legal + elite-legal-counsel | 2026-04-04*
