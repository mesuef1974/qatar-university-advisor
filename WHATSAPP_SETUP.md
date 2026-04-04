# دليل ربط WhatsApp Business Bot — رقم +97455296286

دليل تفصيلي خطوة بخطوة لربط بوت WhatsApp الخاص بمستشار الجامعات القطرية بالرقم **+97455296286**.

---

## المتطلبات قبل البدء

- [ ] حساب Meta Business Suite مفعّل على [business.facebook.com](https://business.facebook.com)
- [ ] تطبيق Meta Developer موجود أو جاهز للإنشاء على [developers.facebook.com](https://developers.facebook.com/apps)
- [ ] رقم الهاتف +97455296286 مُضاف ومُفعَّل في Meta WhatsApp Manager
- [ ] مشروع Vercel منشور ورابطه جاهز (مثال: `https://qatar-university-advisor.vercel.app`)
- [ ] ملف `.env.local` محلياً مع القيم الصحيحة

---

## الخطوة 1: إنشاء تطبيق Meta Developer (إذا لم يكن موجوداً)

1. اذهب إلى [developers.facebook.com/apps](https://developers.facebook.com/apps)
2. اضغط **Create App** (الزر الأزرق في الأعلى)
3. اختر نوع التطبيق: **Business**
4. أدخل البيانات:
   - **App Name**: `Qatar University Advisor`
   - **App Contact Email**: بريدك الإلكتروني
5. اضغط **Create App** وأكمل التحقق الأمني إذا طُلب
6. في صفحة المنتجات (Add Products)، ابحث عن **WhatsApp** واضغط **Set up**

---

## الخطوة 2: ربط رقم الهاتف +97455296286

### إذا كان الرقم جديداً:
1. من القائمة اليسرى: **WhatsApp → Phone Numbers**
2. اضغط **Add Phone Number**
3. أدخل الرقم: `+97455296286`
4. اختر طريقة التحقق: **SMS** أو **Voice Call**
5. أدخل رمز التحقق الذي ستستقبله

### إذا كان الرقم موجوداً بالفعل:
1. من **WhatsApp → API Setup**
2. في القائمة المنسدلة **From**, اختر الرقم `+97455296286`
3. ستظهر قيمة **Phone number ID** — انسخها الآن

---

## الخطوة 3: الحصول على Phone Number ID

1. اذهب إلى: **WhatsApp → API Setup** في لوحة التطبيق
2. تأكد أن الرقم المختار هو `+97455296286` في حقل **From**
3. ستجد تحت الرقم قيمة مثل: `1234567890123456`
4. هذه هي قيمة `WHATSAPP_PHONE_ID`

```bash
# في ملف .env.local
WHATSAPP_PHONE_ID=1234567890123456
```

---

## الخطوة 4: إنشاء Token دائم (Permanent Access Token)

> لا تستخدم الـ Temporary Token الذي يظهر في API Setup — ينتهي خلال 24 ساعة.

**الطريقة الصحيحة لإنشاء Token دائم:**

1. اذهب إلى [Meta Business Suite](https://business.facebook.com)
2. من الإعدادات (Settings): انتقل إلى **Users → System Users**
3. اضغط **Add** وأنشئ مستخدماً جديداً:
   - الاسم: `QU Advisor Bot`
   - الدور: **Admin**
4. بعد الإنشاء، اضغط على المستخدم ثم **Generate New Token**
5. اختر تطبيقك: `Qatar University Advisor`
6. فعّل الصلاحيات التالية:
   - `whatsapp_business_messaging`
   - `whatsapp_business_management`
7. اضغط **Generate Token**
8. **انسخ الـ Token فوراً** — لن يظهر مرة أخرى!

```bash
# في ملف .env.local
WHATSAPP_TOKEN=EAAxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

---

## الخطوة 5: الحصول على App Secret

1. في لوحة تطبيقك على [developers.facebook.com](https://developers.facebook.com/apps)
2. من القائمة اليسرى: **App Settings → Basic**
3. ابحث عن حقل **App Secret**
4. اضغط **Show** وأدخل كلمة المرور إذا طُلبت
5. انسخ القيمة

```bash
# في ملف .env.local
WEBHOOK_APP_SECRET=abc123def456abc123def456abc12345
```

---

## الخطوة 6: اختيار Webhook Verify Token

هذا نص سري تختاره أنت. يُستخدم مرة واحدة فقط عند التحقق من الـ Webhook.

```bash
# في ملف .env.local
# اختر أي نص سري — اجعله قوياً وفريداً
WEBHOOK_VERIFY_TOKEN=qatar_advisor_secure_token_2024
```

> **مهم:** احتفظ بهذه القيمة — ستحتاجها في الخطوة 8.

---

## الخطوة 7: رفع المتغيرات على Vercel

1. اذهب إلى [vercel.com/dashboard](https://vercel.com/dashboard)
2. اختر مشروع `qatar-university-advisor`
3. انتقل إلى **Settings → Environment Variables**
4. أضف كل متغير كالتالي:

| Key | Value | Environment |
|-----|-------|-------------|
| `WHATSAPP_TOKEN` | رمز الوصول الدائم | Production, Preview |
| `WHATSAPP_PHONE_ID` | معرف رقم الهاتف | Production, Preview |
| `WEBHOOK_VERIFY_TOKEN` | النص السري الذي اخترته | Production, Preview |
| `WEBHOOK_APP_SECRET` | App Secret من Meta | Production |
| `GEMINI_API_KEY` | مفتاح Gemini (اختياري) | Production, Preview |

5. بعد إضافة جميع المتغيرات، اضغط **Redeploy** لتفعيلها:
   - انتقل إلى **Deployments**
   - على آخر deployment، اضغط القائمة (**...**) ثم **Redeploy**

---

## الخطوة 8: ربط الـ Webhook في Meta Console

1. في لوحة تطبيقك: **WhatsApp → Configuration**
2. في قسم **Webhook**، اضغط **Edit**
3. أدخل البيانات:
   - **Callback URL**:
     ```
     https://qatar-university-advisor.vercel.app/api/webhook
     ```
   - **Verify Token**: نفس قيمة `WEBHOOK_VERIFY_TOKEN` التي أضفتها في Vercel
4. اضغط **Verify and Save**

   - إذا نجح: ستظهر رسالة "Verified" باللون الأخضر
   - إذا فشل: تحقق من أن المتغير صحيح وأن المشروع منشور بشكل صحيح

5. بعد التحقق، اشترك في أحداث الـ Webhook:
   - في قسم **Webhook Fields**، ابحث عن **messages**
   - اضغط **Subscribe** بجانبه

---

## الخطوة 9: ربط رقم الهاتف بالـ Webhook

1. في لوحة تطبيقك: **WhatsApp → Configuration**
2. في قسم **Phone Numbers**، اختر الرقم `+97455296286`
3. تأكد أن الرقم مرتبط بالـ Webhook الذي أنشأته

---

## الخطوة 10: اختبار البوت

### اختبار الـ Webhook مباشرةً:

```bash
# اختبار التحقق (GET)
curl -s "https://qatar-university-advisor.vercel.app/api/webhook?\
hub.mode=subscribe&\
hub.verify_token=qatar_advisor_secure_token_2024&\
hub.challenge=challenge_123"
# المتوقع: يرد بـ challenge_123
```

```bash
# اختبار رفض Token خاطئ
curl -s "https://qatar-university-advisor.vercel.app/api/webhook?\
hub.mode=subscribe&\
hub.verify_token=wrong_token&\
hub.challenge=test"
# المتوقع: 403 Forbidden
```

### اختبار الرسائل الحقيقية:

1. افتح WhatsApp على هاتفك
2. ابحث عن رقم `+97455296286` أو امسح QR Code المتاح في Meta Console
3. أرسل أي رسالة: مثلاً `مرحبا` أو `الجامعات القطرية`
4. يجب أن يرد البوت خلال 2-5 ثوانٍ

### مراقبة الـ Logs:

```bash
# باستخدام Vercel CLI
vercel logs qatar-university-advisor --follow
```

أو من Dashboard: **Deployments → Functions → View Function Logs**

---

## استكشاف الأخطاء وإصلاحها

### البوت لا يرد على الرسائل

1. تحقق من Vercel Logs هل هناك أخطاء
2. تأكد أن `WHATSAPP_TOKEN` صحيح وغير منتهي الصلاحية
3. تأكد أن `WHATSAPP_PHONE_ID` هو معرف الرقم وليس الرقم نفسه
4. تأكد أن Webhook مشترك في حدث `messages`

### خطأ 403 عند التحقق من الـ Webhook

1. تأكد أن `WEBHOOK_VERIFY_TOKEN` في Vercel مطابق تماماً لما أدخلته في Meta
2. لا توجد مسافات زائدة في بداية أو نهاية القيمة
3. تأكد أن الـ Redeploy تم بعد إضافة المتغيرات

### خطأ `WEBHOOK_APP_SECRET is not set in production`

1. أضف `WEBHOOK_APP_SECRET` في Vercel → Settings → Environment Variables
2. تأكد أنك اخترت **Production** في Environment
3. أعد النشر (Redeploy)

### الـ Token انتهت صلاحيته

1. اذهب إلى Meta Business Suite → System Users
2. اختر المستخدم المربوط بالتطبيق
3. اضغط **Generate New Token** من جديد
4. حدّث قيمة `WHATSAPP_TOKEN` في Vercel
5. أعد النشر

---

## معلومات مهمة عن الرقم +97455296286

| البيانات | القيمة |
|----------|--------|
| رقم الهاتف | +97455296286 |
| دولة | قطر (+974) |
| نوع الرقم | WhatsApp Business |
| Webhook URL | `https://qatar-university-advisor.vercel.app/api/webhook` |
| API Version | `graph.facebook.com/v21.0` |
| Rate Limit | 60 طلب/دقيقة لكل IP |

---

## روابط مفيدة

- [Meta WhatsApp Cloud API Docs](https://developers.facebook.com/docs/whatsapp/cloud-api)
- [Vercel Environment Variables](https://vercel.com/docs/projects/environment-variables)
- [Meta Business Suite](https://business.facebook.com)
- [Meta for Developers](https://developers.facebook.com/apps)
- [Google AI Studio (Gemini)](https://aistudio.google.com/app/apikey)
