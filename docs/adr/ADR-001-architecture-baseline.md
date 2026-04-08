# ADR-001: معمارية أساسية Serverless-first

**الحالة:** Accepted
**التاريخ:** 2026-04-05
**القرار:** فريق الهندسة + قسم المنتجات
**السياق:** وثيقة أساسية لمشروع Qatar University Advisor

---

## السياق

نحتاج إلى اختيار المعمارية الأساسية لمنصة Qatar University Advisor التي تخدم:
- **40,000+** طالب ثانوية قطري سنوياً (موسمية عالية: أغسطس–سبتمبر)
- قناتين: واجهة ويب + بوت WhatsApp
- فريق صغير (< 5 مطورين)
- ميزانية تشغيلية محدودة في المرحلة الأولى

**القيود:**
- لا نملك فريق DevOps مخصص لإدارة Servers
- حركة المرور غير متساوية (peaks موسمية 10×)
- متطلبات PDPPL القطري لحماية البيانات
- الحاجة إلى زمن استجابة < 3s على WhatsApp

---

## الخيارات المدروسة

### الخيار 1: Monolith تقليدي (Node.js + PostgreSQL على VM)
- ✅ تحكم كامل
- ❌ تكلفة ثابتة عالية (~$200+/شهر حتى بدون مستخدمين)
- ❌ يحتاج إدارة Server و Patching
- ❌ توسعية يدوية

### الخيار 2: Containers على Kubernetes
- ✅ توسعية ممتازة
- ❌ تعقيد تشغيلي عالٍ جداً لفريق صغير
- ❌ تكلفة أساسية مرتفعة

### الخيار 3: Serverless-first (المعتمد) ✅
- ✅ تكلفة = صفر عند صفر حركة
- ✅ توسعية تلقائية للـ peaks الموسمية
- ✅ لا إدارة Server
- ❌ Cold starts (مقبولة < 1s)
- ❌ Vendor lock-in جزئي على Vercel

---

## القرار

**اعتماد معمارية Serverless-first:**

| الطبقة | التقنية |
|---|---|
| Frontend | React 19 + Vite 8 على Vercel Edge |
| Serverless Functions | Vercel Functions (Node.js 18+) |
| Messaging | WhatsApp Cloud API (Meta) — `graph.facebook.com/v21.0` |
| AI | Google Gemini AI (اختياري، مع RAG محلي) |
| Storage (v1) | Static JSON + Supabase (pgvector جاهز) |
| Caching | Redis (Upstash) للموسمية |
| Security | HMAC-SHA256 webhook verification + Rate limiting |

---

## النتائج (Consequences)

### إيجابية
- **تكلفة تشغيل متوقعة:** ~$0 حتى 10K MAU، ~$50/شهر عند 50K MAU
- **Time-to-market سريع:** لا Infrastructure setup
- **توسعية تلقائية** للموسمية (peaks أغسطس–سبتمبر)
- **Zero DevOps overhead** للفريق الصغير

### سلبية
- **Cold starts** على Serverless Functions (مقبولة < 1s، قابلة للتحسين بـ warm-up)
- **Vendor lock-in** جزئي على Vercel (مخفّف: الكود Node.js قياسي)
- **حدود Runtime:** 10s على Hobby، 60s على Pro (كافٍ لـ WhatsApp webhooks)

### مخاطر مقبولة
- إذا تجاوز الاستخدام 100K MAU → إعادة تقييم الترحيل إلى Containers

---

## المراجع

- `README.md` — Tech Stack
- `package.json` — dependencies
- `vercel.json` — Serverless config
- `docs/monitoring-setup.md`
- `docs/cost-management.md`
- PR/FAQ v1: `docs/product/PR-FAQ-v1.md`

---

## التوقيعات

- [ ] Head of Engineering
- [ ] CTO / Tech Lead
- [ ] Head of Product
