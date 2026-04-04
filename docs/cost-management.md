# إدارة التكاليف — Qatar University Advisor
## T-Q7-T008 + T020: Cost Alerts + Performance Budget

---

## 📊 التكاليف الشهرية المتوقعة

### Free Tier الحالي:
| الخدمة | الحد المجاني | الاستخدام المتوقع | التكلفة |
|--------|------------|-----------------|---------|
| Vercel | 100GB bandwidth | ~10GB | $0 |
| Supabase | 500MB DB + 2GB storage | ~100MB | $0 |
| Gemini API | 1M tokens/month | ~500K tokens | $0 |
| WhatsApp Business | أول 1000 محادثة/شهر | ~500 | $0 |
| Upstash Redis | 10K requests/day | ~1K | $0 |
| **المجموع** | | | **$0/شهر** |

### عند النمو (1000+ مستخدم يومي):
| الخدمة | التكلفة |
|--------|---------|
| Vercel Pro | $20/شهر |
| Supabase Pro | $25/شهر |
| Gemini API | ~$50/شهر |
| WhatsApp | ~$30/شهر |
| **المجموع** | **~$125/شهر** |

---

## 🚨 Cost Alerts — الإعداد المطلوب

### Google Cloud Console (Gemini API):
1. انتقل إلى: console.cloud.google.com
2. Billing → Budgets & Alerts
3. أنشئ Budget:
   - Amount: $50/شهر
   - Alerts: 50% ($25), 90% ($45), 100% ($50)
   - Send email + Pub/Sub notification

### Vercel:
- استخدام Analytics مجاني متاح
- تحقق من Usage في: vercel.com/dashboard → Usage

### Supabase:
- Database → Reports → Database Size
- تفعيل Email Alerts عند 80% من الحد

---

## ⚡ Performance Budget

### Core Web Vitals الهدف:
| Metric | الهدف | الحالي (تقديري) |
|--------|-------|----------------|
| LCP (Largest Contentful Paint) | < 2.5s | ~2.0s |
| INP (Interaction to Next Paint) | < 200ms | ~100ms |
| CLS (Cumulative Layout Shift) | < 0.1 | ~0.05 |
| FCP (First Contentful Paint) | < 2.0s | ~1.5s |
| TTI (Time to Interactive) | < 3.5s | ~3.0s |

### Bundle Budget:
| النوع | الحد الأقصى |
|-------|------------|
| JavaScript | 400KB gzipped |
| CSS | 50KB gzipped |
| Images | 200KB لكل صفحة |
| Total | 800KB |

### Lazy Loading المطبّق:
- ✅ jsPDF (dynamic import) — يوفر ~300KB عند التحميل الأول
- 🔄 قيد التطبيق: تقسيم findResponse.js

---

## 📈 مراقبة الأداء

### أدوات مقترحة:
1. **Vercel Analytics** — مجاني + Core Web Vitals
2. **Lighthouse CI** — في GitHub Actions
3. **WebPageTest** — اختبار يدوي دوري

### Lighthouse Score الهدف:
- Performance: 90+
- Accessibility: 90+
- Best Practices: 95+
- SEO: 85+

---

## 📉 Usage Baselines (Measure Monthly)

Track actual usage against free tier limits to predict when paid plans become necessary.

| Service | Metric | Baseline (Month 1) | Free Tier Limit | % Used |
|---------|--------|---------------------|-----------------|--------|
| Vercel | Bandwidth | ___ GB | 100 GB | ___% |
| Vercel | Serverless Invocations | ___ K | 100K / month | ___% |
| Supabase | Database Size | ___ MB | 500 MB | ___% |
| Supabase | Storage | ___ MB | 1 GB | ___% |
| Supabase | Edge Function Invocations | ___ K | 500K / month | ___% |
| Gemini API | Tokens consumed | ___ K | 1M / month | ___% |
| Upstash Redis | Daily requests | ___ | 10K / day | ___% |

> **Action:** Fill in baselines after the first full month of production traffic. Re-measure monthly and set alerts at 70% of each limit.

---

## 💰 Vercel Spend Management

Vercel offers a **Spend Management** feature (available on Pro and Enterprise plans) that lets you set hard spending caps so you are never billed beyond a defined amount.

### How to enable:
1. Go to **Vercel Dashboard -> Settings -> Billing -> Spend Management**
2. Set a **monthly spend cap** (e.g., $50/month)
3. When the cap is reached, Vercel will pause non-essential compute rather than charge overages

### Recommendations:
- Enable Spend Management **before** switching to Vercel Pro to avoid surprise bills
- Set the cap conservatively ($20-50) during early growth; raise it as traffic patterns stabilize
- Combine with **Usage Alerts** (Settings -> Notifications) to get email warnings at 50%, 75%, and 90% of the cap
- Review the Spend Management dashboard weekly during the first month after launch
