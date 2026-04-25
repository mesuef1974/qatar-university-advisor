# 🚨 تقرير مراجعة قاعدة البيانات ومصدر الحقيقة

**التاريخ:** 2026-04-26
**النطاق:** DB integrity + Truth source + Bot accuracy + User interaction
**المنفّذ:** AzkiaOS (Engineering + QA + AI + Strategic + Advisory)
**التصنيف:** 🔴 **حرج — معلومات خاطئة تُقدَّم للمستخدمين**

---

## 0. الحكم النهائي (60 ثانية)

> **🚨 المنصة تكذب على الطلاب القطريين.** الـ bot يُقدّم معلومات قديمة + **يخترع جامعات وهمية** + **يتجاهل جامعات حقيقية** بسبب ازدواجية مصدر الحقيقة (responses.js يتجاوز Supabase).

| المحور | التقييم | الأثر |
|---|---|---|
| سلامة DB | 6.5/10 | مقبول لكن ناقص |
| تغطية البيانات | **3.5/10** | 🔴 78% من الجامعات بلا برامج! |
| مصدر الحقيقة | **2.0/10** | 🔴 ازدواجية كارثية |
| دقة الـ bot | **2.5/10** | 🔴 يخترع + يتجاهل |
| تفاعل المستخدم | 7.0/10 | UX جيد لكن المحتوى خاطئ |
| **التقييم الإجمالي** | **3.8/10** | 🔴 **خطر سمعة + قانوني + حقوقي** |

---

## 1. سلامة قاعدة البيانات (6.5/10)

### 1.1 الجداول الموجودة (15 جدول)
| الجدول | عدد الصفوف | التقييم |
|---|---|---|
| `universities` | 19 (18 active) | ✅ معقول |
| `programs` | 32 | ⚠️ قليل |
| `admission_requirements` | **6** | 🔴 ناقص جداً |
| `tuition_fees` | **7** | 🔴 ناقص جداً |
| `scholarships` | 10 | ⚠️ متوسط |
| `salary_data` | 22 | ✅ مقبول |
| `knowledge_cache` | 10 | ⚠️ ضئيل |
| `users` | 4 | (فترة beta) |
| `conversations` | 20 | (طبيعي) |
| `analytics` | 57 | (طبيعي) |
| **`user_consents`** | **0** | 🔴 **PDPPL Article 7 معطَّل!** |

### 1.2 المخالفات التي اكتُشفت

#### 🚨 78% من الجامعات بلا برامج موثَّقة
| الجامعة | برامج | شروط قبول | رسوم |
|---|---|---|---|
| جامعة قطر | 23 | 2 | 2 |
| Carnegie Mellon | 4 | 1 | 1 |
| Georgetown | 3 | 1 | 0 |
| Weill Cornell | 2 | 1 | 1 |
| **HBKU** | **0** | 0 | 1 |
| **UDST** (الدوحة للعلوم والتكنولوجيا) | **0** | 0 | 2 |
| **Lusail** | **0** | 0 | 0 |
| **Cardiff** | **0** | 0 | 0 |
| **VCUQ** | **0** | 0 | 0 |
| **Northwestern** | **0** | 1 | 0 |
| **HEC Paris** | **0** | 0 | 0 |
| **DIGS** | **0** | 0 | 0 |
| **CCQ** | **0** | 0 | 0 |
| 5 كليات عسكرية | **0** | 0 | 0 |

**الأثر:** 14 جامعة من 18 = **78% عرض ناقص للطلاب**.

#### 🚨 ادعاءات الـ frontend مغلوطة
| Stat على الواجهة | الواقع في DB | المخالفة |
|---|---|---|
| "30 جامعة ومؤسسة" | 18 active | **+67% تضخيم** |
| "156+ تخصص أكاديمي" | 32 program | **+390% تضخيم** |
| "13+ مسار مهني" | 22 salary entry | (هذا OK) |

**هذا تضليل مؤسسي محتمل.** قد يُشكّل خرقاً قانونياً (إعلان كاذب).

#### 🔴 user_consents = 0
رغم إنشاء الجدول اليوم (Migration 004)، **لا يوجد كود يكتب فيه عند موافقة المستخدم**.
PDPPL Article 7 يفرض **سجل موافقة لكل معالجة**. هذا الجدول فارغ = **انتهاك مستمر** رغم البنية التحتية الجاهزة.

---

## 2. مصدر الحقيقة — الازدواجية الكارثية (2/10)

### 2.1 المسارات الثلاث (Truth Source Triangle)

```
رسالة المستخدم
    ↓
findResponse.ts:475
    ↓
┌──────────────────────────────────────────┐
│ المسار 1: ردود ثابتة (responses.js)     │ ← 🔴 يستخدمها أولاً!
│ 387 سطر مُشفرة يدوياً                  │
│ "الكلية الجوية، أحمد بن محمد..."        │
│ source: "static"                         │
└──────────────────────────────────────────┘
    ↓ (إن لم يطابق)
┌──────────────────────────────────────────┐
│ المسار 2: knowledge_cache (Supabase)    │ ← Jaccard similarity
│ 10 صفوف فقط                              │
│ TTL = 90 يوم                             │
│ source: "cache"                          │
└──────────────────────────────────────────┘
    ↓ (إن لم يجد)
┌──────────────────────────────────────────┐
│ المسار 3: Gemini + db-context           │ ← الأخير!
│ يجلب universities/programs من Supabase   │
│ source: "ai"                             │
└──────────────────────────────────────────┘
```

### 2.2 المشكلة: المسار 1 يفوز دائماً

**مثال حي اختُبر للتو** (`POST /api/chat` بسؤال "كم عدد الجامعات في قطر؟"):

```json
{
  "answer": "🏛️ **جميع الجامعات في قطر**...
    • تكساس إي أند أم (85%+) — هندسة بترول
    • أكاديمية الطيران
    • أحمد بن محمد
    • الكلية الجوية
    • الأكاديمية البحرية
    • الأمن السيبراني...",
  "source": "static"
}
```

**التحقق ضد DB:**
| ما يقوله البوت | ما في DB | الحقيقة |
|---|---|---|
| تكساس إي أند أم نشطة | `is_active=false` | ❌ **انسحبت من قطر!** |
| أكاديمية الطيران | غير موجودة | ❌ **مخترَعة** |
| أحمد بن محمد | غير موجودة | ❌ **مخترَعة** |
| الكلية الجوية | غير موجودة | ❌ **مخترَعة** |
| الأكاديمية البحرية | غير موجودة | ❌ **مخترَعة** |
| الأمن السيبراني (كلية) | غير موجودة | ❌ **مخترَعة** |
| لم يذكر UDST | موجودة + `is_active=true` | ❌ **محذوفة من الرد** |
| لم يذكر HBKU | موجودة + `is_active=true` | ❌ **محذوفة من الرد** |
| لم يذكر Lusail/Cardiff/HEC | موجودة | ❌ **محذوفة من الرد** |

**السبب الجذري:** ملف `lib/responses.js` (387 سطر) يحوي ردود مُشفرة من **2024** قبل تحديث DB.

### 2.3 universities.json — مصدر ثالث متضارب
- ملف `data/universities.json` (146 KB) ثابت
- مصدر منفصل عن Supabase
- **لا يُتزامن** عند تحديث DB
- يُستخدم في `ai-system-prompt.js` كـ fallback

### 2.4 Knowledge_cache بدون invalidation
- TTL = **90 يوم** (طويل جداً)
- لا إبطال عند تحديث universities/programs
- مثال: لو حدّث Supabase معدل قبول جامعة قطر، الـ cache يُكمل 89 يوم بالقيمة القديمة.

---

## 3. كفاءة الـ DB (5/10)

### 3.1 Indexes موجودة (20 index بعد Migration 004) ✅

### 3.2 N+1 Query Problems
في `findResponse.ts:500-523`:
```typescript
const user = await getOrCreateUser(phone);          // call 1
const profileData = await getUserProfileData(phone); // call 2 (نفس phone!)
const history = await getConversationHistory(user.id); // call 3
```
كان يكفي JOIN واحد. **3 round-trips** لكل رسالة.

### 3.3 knowledge_cache بحث بدائي
في `lib/knowledge-base.js:84-130`:
- Jaccard similarity في **JavaScript** (ليس SQL)
- يجلب 10K سطر للذاكرة + يحسب
- pgvector موجود لكن غير مستخدم لـ knowledge_cache!

### 3.4 Semantic search كـ "آخر ملاذ"
- `pgvector` + `conversation_embeddings` + `knowledge_embeddings` موجودة ✅
- لكن `findResponse.ts:639` تستدعيها **بعد** فشل المسارات السابقة
- النتيجة: pgvector نادراً ما يُستخدم → استثمار مهدر

---

## 4. تفاعل المستخدم (7/10)

### 4.1 ما يعمل ✅
- صفحات frontend جميلة (Next.js 16)
- RTL Arabic سليم
- Dark/light mode
- Suggestions chips بعد كل رد (UX جيد)
- 5 routes تعمل (chat, calculator, scholarships, careers, compare)
- WhatsApp integration متكامل (Meta Cloud API v21)

### 4.2 ما يمكن تحسينه ⚠️
- لا feedback loop (المستخدم يصحح خطأ → النظام يتعلم)
- لا "تم الرد بمعلومات قديمة" disclaimer
- لا citation للمصدر (من أين أخذ الجواب؟)
- لا "تحدّثت آخر مرة بتاريخ X"

---

## 5. دقة المعلومات (2.5/10)

### 5.1 درجة الثقة الفعلية لكل مسار

| المسار | درجة الدقة المتوقعة | ما يحدث فعلياً |
|---|---|---|
| `static` (responses.js) | 30% (قديم) | يُستخدم 70% من الوقت! |
| `cache` (knowledge_cache) | 60% (TTL طويل) | نادراً |
| `ai` (Gemini + db-context) | 80% (live data) | نادراً |

### 5.2 خطر الهلوسة
- **لا warning صريح** في AI prompt يمنع Gemini من invent
- لا temperature=0 (سيُعطي إجابات مختلفة لنفس السؤال)
- لا citation requirement في الـ prompt
- لا confidence score يُرجع للمستخدم

### 5.3 لا اختبارات دقة
- `tests/unit/findResponse.test.js` يختبر **string matching**، لا الدقة الفعلية
- لا integration test يقول: "بوت + DB → الإجابة المتوقعة"
- لا regression suite لمنع تراجع الجودة

---

## 6. التشخيص النهائي

### السبب الجذري الواحد
> **`responses.js` (387 سطر مُشفر) كان حلاً مؤقتاً في 2024 قبل اكتمال DB، لكنه أصبح المسار الرئيسي ولم يُحذف. النتيجة: DB حديثة لكن الـ bot لا يقرأ منها.**

### تأثير على المستخدم النهائي
- 🔴 **طالب قطري يسأل عن HBKU** → يخبره البوت بأن الجامعة غير موجودة
- 🔴 **طالب يسأل عن تكساس إي أند أم** → يخبره البوت أنها متاحة (وقد انسحبت!)
- 🔴 **طالب يسأل عن "أحمد بن محمد" أو "الكلية الجوية"** → البوت يؤكد وجودها (وهي وهمية!)
- 🔴 **طالب يثق ويسجل في "أكاديمية الطيران"** → كارثة شخصية + سمعة المنصة

### تأثير قانوني محتمل
- إعلان كاذب: "30 جامعة ومؤسسة" بينما الفعلي 18 active
- PDPPL Article 7: 0 records في user_consents رغم وجود الجدول
- مادة الإعلان المضلل (قانون حماية المستهلك القطري)

---

## 7. التوصيات المُلحّة (P0 — خلال 7 أيام)

### REC-001 — حذف responses.js كلياً 🔴 P0
**الإجراء:**
1. حذف `lib/responses/*.js` و `lib/responses.js`
2. تعديل `findResponse.ts:654-726` لـ skip المسار 1
3. كل رد يأتي من Supabase (cache → AI fallback)

**الأثر:** 0 معلومات وهمية بعد التطبيق.

### REC-002 — مزامنة universities.json → Supabase 🔴 P0
**الإجراء:**
1. كتابة script ETL يستورد `data/universities.json` → جدول `universities` + `programs` + `admission_requirements`
2. حذف `data/universities.json` بعد التحقق
3. `data/` يبقى للـ static reference data فقط (لا للجامعات)

### REC-003 — تصحيح أرقام الواجهة 🔴 P0
**الإجراء:**
1. إصلاح `src/app/page.tsx`:
   - `30 جامعة` → استعلام live: `SELECT COUNT(*) FROM universities WHERE is_active=TRUE`
   - `156+ تخصص` → `SELECT COUNT(*) FROM programs WHERE is_active=TRUE`
2. أو ملء DB بالبيانات الحقيقية حتى تتطابق الأرقام مع 30 و 156

### REC-004 — تطبيق user_consents كتابة 🔴 P0
**الإجراء:**
1. عند أول رسالة من user جديد → عرض consent screen
2. عند الموافقة → INSERT INTO user_consents
3. لا معالجة قبل وجود consent (PDPPL Article 7)

### REC-005 — إضافة integration tests للدقة 🟡 P1
```javascript
test('بوت يذكر فقط الجامعات النشطة في DB', async () => {
  const response = await chat('كم عدد الجامعات؟');
  const dbActive = await supabase.from('universities').select().eq('is_active', true);
  // كل جامعة في الرد يجب أن تكون في dbActive
  // عدد الجامعات في الرد ≤ dbActive.length
});
```

### REC-006 — invalidate knowledge_cache عند تحديث DB 🟡 P1
- Trigger PostgreSQL على `universities`/`programs` → DELETE FROM knowledge_cache
- أو TTL = 7 أيام بدلاً من 90

### REC-007 — pgvector first 🟢 P2
- استخدم semantic search **قبل** static + cache
- مع threshold = 0.75
- الـ static يصبح آخر ملاذ، لا أول

### REC-008 — citation في الردود 🟢 P2
- كل رد يقول: "المصدر: قاعدة بيانات أذكياء، آخر تحديث 2026-04-26"
- يبني الثقة + يكشف القِدم

---

## 8. خارطة الطريق المقترحة

### الأسبوع 1 (P0 — حماية المستخدم)
- اليوم 1: حذف responses.js + اختبار smoke
- اليوم 2-3: ETL universities.json → Supabase
- اليوم 4: إصلاح أرقام الواجهة
- اليوم 5: تطبيق user_consents + privacy banner
- اليوم 6-7: 4 screenshots + smoke test + deploy

### الأسبوع 2-3 (P1 — جودة)
- Integration tests للدقة
- knowledge_cache invalidation
- temperature=0 في AI prompt
- citation system

### الشهر 2 (P2 — نضج)
- pgvector first
- feedback loop من المستخدمين
- A/B test للردود

---

## 9. ربط بالحوكمة المؤسسية

- **DEC-SEC-003** أغلق ثغرة P0 الأمنية (RLS) — هذا التقرير يكشف ثغرة P0 جودة
- **DEC-AI-001 المقترح** — قرار جديد لتطبيق REC-001 إلى REC-004
- **شيك ليست-13** — يجب إنشاؤها لـ truth source verification
- **محضر-18** — اجتماع طارئ لمراجعة هذا التقرير

---

## 10. التوقيع

> 🚨 **المنصة تتفاعل مع الطلاب بمعلومات خاطئة بنسبة كبيرة. هذا أخطر من ثغرة RLS لأنه يضر بقرارات حياتية.**

**التقييم النهائي:** 3.8/10
**الحالة:** 🔴 **يحتاج تدخل عاجل خلال 7 أيام**
**القرار المطلوب من CEO:** اعتماد DEC-AI-001 + تخصيص أسبوع كامل لـ REC-001 إلى REC-004

**أمين السر:** AzkiaOS Secretariat
**التاريخ:** 2026-04-26
