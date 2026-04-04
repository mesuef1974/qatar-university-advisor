# Dependency Audit Report | تقرير فحص المكتبات
**التاريخ**: 2026-04-04
**المنفذ**: رئيس الأمن السيبراني
**المشروع**: Qatar University Advisor

---

## 1. نتائج npm audit

### الملخص التنفيذي

```
إجمالي الثغرات: 6
  critical : 0
  high     : 0
  moderate : 6  ⚠️
  low      : 0
  info     : 0

إجمالي الحزم: 368 (23 prod + 329 dev + 118 optional)
```

### الثغرات المكتشفة (Moderate)

| الحزمة | النطاق المتأثر | الثغرة | CVE/Advisory |
|--------|---------------|--------|-------------|
| `esbuild` | `<=0.24.2` | esbuild enables any website to send any requests to the development server and read the response | [GHSA-67mh-4wv8-2f99](https://github.com/advisories/GHSA-67mh-4wv8-2f99) |
| `vite` | `0.11.0 - 6.1.6` | يعتمد على إصدار esbuild المتأثر | متسلسل |
| `vite-node` | `<=2.2.0-beta.2` | يعتمد على vite المتأثر | متسلسل |
| `@vitest/mocker` | `<=3.0.0-beta.4` | يعتمد على vite المتأثر | متسلسل |
| `vitest` | `0.0.1 - 3.0.0-beta.4` | يعتمد على الحزم المتأثرة | متسلسل |
| `@vitest/coverage-v8` | `<=2.2.0-beta.2` | يعتمد على vitest المتأثر | متسلسل |

### تفاصيل الثغرة الجذرية

**GHSA-67mh-4wv8-2f99 — esbuild Development Server**

- **الخطورة**: Moderate (CVSS 5.3)
- **النوع**: CWE-346 (Origin Validation Error)
- **التأثير**: يتيح لأي موقع ويب إرسال طلبات إلى خادم التطوير وقراءة الاستجابة
- **البيئة المتأثرة**: بيئة التطوير فقط (development) — لا إنتاج
- **ملاحظة مهمة**: جميع الثغرات الست هي حزم **devDependencies** وتؤثر فقط في بيئة التطوير المحلية، وليس في النشر الإنتاجي

---

## 2. الإجراءات المتخذة

### 2.1 تشغيل npm audit fix

```bash
npm audit fix
```

**النتيجة**: تم إضافة 2 حزمة وحذف 4 حزم.
الثغرات المتبقية: 6 moderate — لا يمكن إصلاحها تلقائياً لأن الإصلاح يتطلب **major version bump** (breaking change).

### 2.2 الإصلاح الكامل المتاح

```bash
npm audit fix --force
# سيثبّت: vitest@4.1.2 (major upgrade من v2.x → v4.x)
```

**السبب في عدم تطبيق --force تلقائياً**: ترقية major versions قد تكسر الاختبارات الحالية وتتطلب مراجعة يدوية.

### 2.3 توصية الإصلاح اليدوي

```bash
# الترقية اليدوية المنصوح بها بعد مراجعة release notes:
npm install --save-dev vitest@^4.1.2 @vitest/coverage-v8@^4.1.2
npm test  # التحقق من عدم كسر الاختبارات
```

---

## 3. تقييم إصدارات dependencies الرئيسية

### Production Dependencies

| الحزمة | الإصدار الحالي | الحالة |
|--------|--------------|--------|
| `@supabase/supabase-js` | `^2.101.1` | حديث |
| `jspdf` | `^4.2.1` | حديث |
| `react` | `^19.2.4` | حديث (React 19) |
| `react-dom` | `^19.2.4` | حديث |

### Dev Dependencies

| الحزمة | الإصدار الحالي | الملاحظة |
|--------|--------------|---------|
| `@eslint/js` | `^9.39.4` | حديث |
| `@vitejs/plugin-react` | `^6.0.1` | حديث |
| `@vitest/coverage-v8` | `^2.0.0` | **يحتاج ترقية → ^4.1.2** |
| `eslint` | `^9.39.4` | حديث |
| `vite` | `^8.0.1` | حديث |
| `vitest` | `^2.0.0` | **يحتاج ترقية → ^4.1.2** |

---

## 4. الخطوات التالية

### قصيرة المدى (خلال 7 أيام)
- [ ] مراجعة [vitest v4 release notes](https://github.com/vitest-dev/vitest/releases)
- [ ] ترقية `vitest` و `@vitest/coverage-v8` إلى `^4.1.2`
- [ ] تشغيل كامل حزمة الاختبارات بعد الترقية
- [ ] التحقق من عدم وجود breaking changes تؤثر في الاختبارات الحالية

### متوسطة المدى
- [ ] إعداد Dependabot لتلقّي تحديثات minor/patch تلقائياً (مكتمل في `.github/dependabot.yml`)
- [ ] إضافة `npm audit --audit-level=moderate` في CI/CD pipeline (مكتمل في `.github/workflows/security.yml`)
- [ ] مراجعة دورية أسبوعية لتقرير `npm audit`

---

## 5. تقييم المخاطر

| العنصر | التقييم |
|--------|---------|
| **تأثير على الإنتاج** | منخفض — جميع الثغرات في devDependencies |
| **تأثير على التطوير** | معتدل — ثغرة في خادم التطوير esbuild |
| **الأولوية** | متوسطة — يُنصح بالإصلاح خلال أسبوع |
| **مستوى الخطر الكلي** | Moderate ⚠️ |

---

*تقرير أُعدّ بواسطة قسم الأمن السيبراني — شركة النخبوية للبرمجيات*
*Qatar University Advisor | 2026-04-04*
