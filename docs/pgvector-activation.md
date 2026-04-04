# تفعيل pgvector على Supabase Production

## الخطوات:

### 1. تشغيل Migration
1. انتقل إلى Supabase Dashboard
2. اختر مشروعك → SQL Editor → New Query
3. الصق محتوى `supabase/migrations/001_pgvector_semantic_search.sql`
4. اضغط Run
5. يجب أن يظهر: "Success. No rows returned"

### 2. التحقق من التفعيل
```sql
SELECT * FROM pg_extension WHERE extname = 'vector';
-- يجب أن يرجع سطراً واحداً
```

### 3. اختبار دالة البحث
```sql
SELECT search_knowledge(
  '[0.1, 0.2, ...]'::vector(768),
  0.7, 5, NULL
);
-- يرجع نتائج فارغة (لأن الجدول فارغ بعد) ✓
```

### 4. إضافة GEMINI_API_KEY في Vercel
متغير `GEMINI_API_KEY` يجب أن يكون موجوداً (مطلوب لتوليد embeddings)

## ملاحظة
الجداول فارغة بعد Migration.
لملئها: استخدم `saveKnowledgeEmbedding()` في `lib/semantic-search.js`
أو أنشئ script لاستيراد البيانات من findResponse.js
