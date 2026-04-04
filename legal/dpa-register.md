# سجل اتفاقيات معالجة البيانات (DPA Register)
## Qatar University Advisor | شركة النخبوية للبرمجيات
## وفق القانون القطري رقم 13/2016 (PDPPL)

---

## 1. Supabase (المعالج الرئيسي — قاعدة البيانات)

| البند | التفاصيل |
|-------|----------|
| **الشركة** | Supabase Inc. |
| **الدور** | Data Processor (معالج البيانات) |
| **البيانات المُعالَجة** | أرقام الهواتف، رسائل المحادثة، الملفات الأكاديمية |
| **موقع الخوادم** | AWS us-east-1 (الافتراضي) |
| **DPA الرسمي** | https://supabase.com/privacy |
| **GDPR Ready** | ✅ نعم |
| **حذف البيانات** | متاح عبر API |
| **الإجراء المطلوب** | قبول DPA في Supabase Dashboard |

**رابط DPA**: https://supabase.com/docs/guides/platform/dpa

---

## 2. Vercel (المعالج — الاستضافة والنشر)

| البند | التفاصيل |
|-------|----------|
| **الشركة** | Vercel Inc. |
| **الدور** | Data Processor (استضافة) |
| **البيانات المُعالَجة** | بيانات الطلبات (IPs، Headers)، Logs مؤقتة |
| **موقع الخوادم** | متعدد المواقع (Edge Network) |
| **DPA الرسمي** | https://vercel.com/legal/dpa |
| **GDPR Ready** | ✅ نعم |
| **الإجراء المطلوب** | قبول DPA في Vercel Dashboard → Settings → Legal |

---

## 3. Google (Gemini API — المعالج الرئيسي للـ AI)

| البند | التفاصيل |
|-------|----------|
| **الشركة** | Google LLC |
| **الدور** | Data Processor (معالجة AI) |
| **البيانات المُعالَجة** | نصوص رسائل المستخدمين (للتحليل) |
| **موقع الخوادم** | Google Cloud |
| **DPA الرسمي** | https://cloud.google.com/terms/data-processing-addendum |
| **ملاحظة مهمة** | ⚠️ Gemini API قد يُستخدم للتدريب — راجع إعدادات الخصوصية |
| **الإجراء المطلوب** | تفعيل "Data Governance" في Google Cloud Console |

---

## 4. Meta (WhatsApp Business API)

| البند | التفاصيل |
|-------|----------|
| **الشركة** | Meta Platforms Inc. |
| **الدور** | Data Processor (إرسال الرسائل) |
| **البيانات المُعالَجة** | أرقام الهواتف، محتوى الرسائل |
| **DPA الرسمي** | https://www.facebook.com/legal/terms/businesstools_dataprocessing |
| **الإجراء المطلوب** | قبول Business Terms في Meta Business Manager |

---

## ملخص الإجراءات المطلوبة:

| المعالج | الحالة | الإجراء |
|---------|--------|---------|
| Supabase | 🔴 يحتاج قبول DPA | اذهب إلى Dashboard → Settings → Legal → Accept DPA |
| Vercel | 🔴 يحتاج قبول DPA | اذهب إلى Dashboard → Settings → Legal → Accept DPA |
| Google | 🟡 راجع الإعدادات | Google Cloud Console → APIs → Gemini → Privacy Settings |
| Meta | 🟡 راجع الشروط | Meta Business Manager → Business Settings → Data Policy |

---

## وثيقة Record of Processing Activities (RoPA)

وفق المادة 21 من القانون رقم 13/2016:

| النشاط | الغرض | البيانات | المعالج | فترة الاحتفاظ |
|--------|--------|---------|---------|--------------|
| تسجيل المستخدمين | تقديم الخدمة | رقم الهاتف | Supabase | سنتان |
| تحليل الرسائل | فهم الاستفسارات | نص الرسالة | Google Gemini | لا يُحتفظ |
| إرسال الردود | تقديم الخدمة | محتوى الرد | Meta WhatsApp | 90 يوم |
| Analytics | تحسين الخدمة | بيانات مجهولة الهوية | Supabase | سنة واحدة |
