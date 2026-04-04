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

---

## 5. Data Import / Seeding Example

After the migration succeeds, populate `knowledge_embeddings` with your existing knowledge base. Below is a concrete Node.js script you can run locally or as a one-off Vercel serverless function:

```js
// scripts/seed-embeddings.js
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY   // use service role for seeding
);

// Example knowledge entries to embed
const knowledgeItems = [
  { category: 'admission', question: 'What is the minimum GPA for Engineering?', answer: 'The minimum GPA is 3.0 on a 4.0 scale.' },
  { category: 'registration', question: 'When does early registration open?', answer: 'Early registration opens on the first Sunday of November.' },
  // ... add more items from your findResponse.js data
];

async function generateEmbedding(text) {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1/models/embedding-001:embedContent?key=${process.env.GEMINI_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'models/embedding-001',
        content: { parts: [{ text }] },
      }),
    }
  );
  const data = await res.json();
  return data.embedding.values; // float[] of length 768
}

async function seed() {
  for (const item of knowledgeItems) {
    const embedding = await generateEmbedding(`${item.question} ${item.answer}`);
    const { error } = await supabase.from('knowledge_embeddings').insert({
      content: `${item.question}\n${item.answer}`,
      category: item.category,
      embedding: embedding,
    });
    if (error) console.error('Insert failed:', item.question, error.message);
    else console.log('Inserted:', item.question);
  }
}

seed().then(() => console.log('Seeding complete.'));
```

Run with: `node --env-file=.env scripts/seed-embeddings.js`

---

## 6. Rollback Instructions

If the migration fails or causes issues, run the following SQL in Supabase SQL Editor to undo it:

```sql
-- Drop the search function first (depends on the table and extension)
DROP FUNCTION IF EXISTS search_knowledge(vector(768), float, int, text);

-- Drop the table (this deletes all embedded data — only safe right after migration)
DROP TABLE IF EXISTS knowledge_embeddings;

-- Optionally disable the pgvector extension (only if no other tables use it)
-- DROP EXTENSION IF EXISTS vector;
```

> **Warning:** If you have already seeded data into `knowledge_embeddings`, dropping the table will destroy it. Export first with:
> ```sql
> COPY (SELECT id, content, category, created_at FROM knowledge_embeddings) TO STDOUT WITH CSV HEADER;
> ```

After rollback, fix the root cause of the failure, then re-run the migration from Step 1.

---

## 7. Index Type Recommendation (HNSW vs IVFFlat)

pgvector supports two index types for approximate nearest neighbor search:

| Index Type | Best For | Build Speed | Query Speed | Accuracy |
|------------|----------|-------------|-------------|----------|
| **HNSW** | < 100K rows | Slower build | Faster queries | Higher |
| **IVFFlat** | > 100K rows | Faster build | Slower queries | Lower (needs tuning) |

**Recommendation for this project: Use HNSW.**

The Qatar University knowledge base is expected to stay well under 100K rows. HNSW provides better query accuracy out of the box with no need to tune `lists` or run periodic `REINDEX`.

The migration file should already create an HNSW index. If not, add:

```sql
CREATE INDEX IF NOT EXISTS idx_knowledge_embeddings_hnsw
  ON knowledge_embeddings
  USING hnsw (embedding vector_cosine_ops)
  WITH (m = 16, ef_construction = 64);
```

If the dataset grows beyond 100K rows in the future, consider switching to IVFFlat:

```sql
-- IVFFlat alternative (for large datasets)
CREATE INDEX IF NOT EXISTS idx_knowledge_embeddings_ivfflat
  ON knowledge_embeddings
  USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100);
-- After creating, run: ANALYZE knowledge_embeddings;
```
