# وثيقة متطلبات المنتج — المرحلة ب
## PRD: ENG-003 + CI-001
### Qatar University Advisor | شركة النخبوية للبرمجيات
**الإصدار:** 1.0 | **التاريخ:** 2026-04-04 | **السري:** داخلي

---

## ENG-003 — Health Endpoint `/api/health`

### المشكلة
الـ endpoint موثّق في الـ docs لكن غير موجود في الكود.
المراقبة عمياء — لا طريقة لمعرفة حالة الخدمات دون تسجيل دخول يدوي.

### المتطلبات الوظيفية
| # | المتطلب | الأولوية |
|---|---------|---------|
| 1 | فحص اتصال Supabase (query بسيط) | MUST |
| 2 | فحص استهلاك الذاكرة (process.memoryUsage) | MUST |
| 3 | فحص Redis/Upstash إن وُجد | SHOULD |
| 4 | إظهار uptime + timestamp | MUST |
| 5 | إظهار version من package.json | SHOULD |
| 6 | رد JSON منظّم بحالة كل خدمة | MUST |
| 7 | HTTP 200 إذا كل شيء سليم، 503 إذا في خلل | MUST |

### هيكل الرد المتوقع
```json
{
  "status": "healthy | degraded | unhealthy",
  "timestamp": "2026-04-04T20:00:00.000Z",
  "version": "1.0.1",
  "uptime": 3600,
  "services": {
    "supabase": { "status": "healthy", "latency": 45 },
    "memory":   { "status": "healthy", "used": "128MB", "limit": "512MB" },
    "redis":    { "status": "healthy | skipped" }
  }
}
```

### معايير القبول
- الاستجابة خلال < 2 ثانية
- لا يكشف بيانات حساسة (keys, secrets)
- محمي من الاستدعاء المفرط (rate limit 10/دقيقة)
- يعمل بدون env variables (graceful degradation)

---

## CI-001 — تحسين GitHub Actions Pipeline

### المشكلة الحالية
1. `continue-on-error: true` على Coverage → فشل الاختبارات لا يوقف البناء
2. لا يوجد `npm audit` في الـ pipeline → ثغرات تمر بلا كشف (كما حدث في INC-2026-001)
3. CI يعمل على `main` فقط → لا حماية على `develop`
4. لا فحص أمني تلقائي

### التحسينات المطلوبة
| # | التحسين | الأولوية |
|---|---------|---------|
| 1 | إضافة `npm audit --audit-level=moderate` | MUST |
| 2 | تشغيل CI على `develop` و`main` معاً | MUST |
| 3 | إزالة `continue-on-error: true` من Coverage | SHOULD |
| 4 | إضافة security scan كخطوة مستقلة | MUST |
| 5 | تشغيل CI على Pull Requests لجميع الفروع | MUST |

### معايير القبول
- أي ثغرة moderate فأعلى تُوقف البناء
- Coverage فشله يُوقف البناء
- CI يعمل على develop + main + كل PRs
- وقت التشغيل الكلي < 5 دقائق

---

*المسؤول: elite-engineering (ENG-003) + elite-devops (CI-001)*
*الموعد: 2026-04-11 | الفرع: feature/ENG-003-health-endpoint*
