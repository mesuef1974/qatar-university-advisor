# دليل TypeScript Migration التدريجي
## T-Q7-T017

## الاستراتيجية: allowJs = true
نضيف TypeScript تدريجياً بدون كسر الكود الحالي:
- الملفات الجديدة: .ts / .tsx
- الملفات القديمة: تبقى .js (يقرأها TypeScript بدون فحص)

## الأولويات:
1. ✅ types/index.ts — الأنواع الأساسية
2. ✅ types/environment.d.ts — env variables
3. 🔄 lib/responses/*.ts — الوحدات الجديدة (عند النقل)
4. ⬜ lib/sanitizer.ts
5. ⬜ lib/circuit-breaker.ts
6. ⬜ api/admin.ts

## تشغيل فحص الأنواع:
```bash
npm run type-check
```
