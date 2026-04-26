/**
 * Backfill Knowledge Embeddings
 * ═════════════════════════════
 * Reads universities + programs + scholarships + salary_data from Supabase,
 * generates Gemini embeddings for each row's natural-language summary,
 * and upserts into knowledge_embeddings.
 *
 * Usage:
 *   GOOGLE_API_KEY=... SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... \
 *     node scripts/backfill-embeddings.js
 *
 * Idempotent: re-running only updates rows whose summary text has changed.
 * Rate-limited: ~1 request/sec to stay well under Gemini free tier (60 RPM).
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;
const RATE_LIMIT_MS = 1000;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}
if (!GOOGLE_API_KEY) {
  console.error('❌ Missing GOOGLE_API_KEY (needed for Gemini text-embedding-004)');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function embed(text) {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-001:embedContent?key=${GOOGLE_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'models/gemini-embedding-001',
        content: { parts: [{ text }] },
        outputDimensionality: 768,
      }),
    },
  );
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`Gemini embed failed ${res.status}: ${body.slice(0, 200)}`);
  }
  const data = await res.json();
  const v = data.embedding?.values;
  if (!Array.isArray(v) || v.length !== 768) {
    throw new Error('Gemini returned non-768 vector');
  }
  return v;
}

function summarizeUniversity(u) {
  const parts = [
    u.name_ar,
    u.name_en,
    u.short_name,
    u.type ? `النوع: ${u.type}` : '',
    u.location ? `الموقع: ${u.location}` : '',
    u.description_ar || '',
  ].filter(Boolean);
  return parts.join(' | ');
}

function summarizeProgram(p, uniName) {
  return [
    p.name_ar,
    p.name_en,
    uniName ? `الجامعة: ${uniName}` : '',
    p.field ? `المجال: ${p.field}` : '',
    p.degree ? `الدرجة: ${p.degree}` : '',
    p.duration_years ? `المدة: ${p.duration_years} سنوات` : '',
  ].filter(Boolean).join(' | ');
}

function summarizeScholarship(s) {
  return [
    s.name_ar,
    s.provider ? `الجهة: ${s.provider}` : '',
    s.coverage_summary || '',
    s.eligibility || '',
  ].filter(Boolean).join(' | ');
}

function summarizeSalary(s) {
  return [
    s.field || s.role,
    s.sector ? `القطاع: ${s.sector}` : '',
    s.salary_min && s.salary_max ? `الراتب: ${s.salary_min}-${s.salary_max} ريال` : '',
  ].filter(Boolean).join(' | ');
}

async function processBatch(rows, contentType, summarize, makeMetadata) {
  let success = 0;
  let skipped = 0;
  let failed = 0;

  for (const row of rows) {
    const content = summarize(row);
    if (!content || content.length < 5) {
      skipped++;
      continue;
    }

    try {
      // Skip if existing row has same content (idempotent)
      const { data: existing } = await supabase
        .from('knowledge_embeddings')
        .select('id, content')
        .eq('content_type', contentType)
        .contains('metadata', { source_id: row.id })
        .maybeSingle();

      if (existing && existing.content === content) {
        skipped++;
        continue;
      }

      const vec = await embed(content);
      await sleep(RATE_LIMIT_MS);

      const payload = {
        content,
        content_type: contentType,
        embedding: vec,
        metadata: { ...makeMetadata(row), source_id: row.id },
        language: /[؀-ۿ]/.test(content) ? 'ar' : 'en',
      };

      if (existing) {
        await supabase.from('knowledge_embeddings').update(payload).eq('id', existing.id);
      } else {
        await supabase.from('knowledge_embeddings').insert(payload);
      }
      success++;
      process.stdout.write('.');
    } catch (err) {
      failed++;
      console.error(`\n  ❌ ${contentType} id=${row.id}: ${err.message}`);
    }
  }
  console.log(`\n  ${contentType}: ${success} embedded, ${skipped} skipped, ${failed} failed`);
  return { success, skipped, failed };
}

async function main() {
  console.log('🔄 Loading rows from Supabase...\n');

  const [unisRes, progsRes, scholRes, salRes] = await Promise.all([
    supabase.from('universities').select('*').eq('is_active', true),
    supabase.from('programs').select('*, universities(name_ar)').eq('is_active', true),
    supabase.from('scholarships').select('*').eq('is_active', true),
    supabase.from('salary_data').select('*'),
  ]);

  const totals = {
    universities: unisRes.data?.length || 0,
    programs: progsRes.data?.length || 0,
    scholarships: scholRes.data?.length || 0,
    salary_data: salRes.data?.length || 0,
  };
  const total = Object.values(totals).reduce((a, b) => a + b, 0);
  console.log(`   ${total} rows total: ${JSON.stringify(totals)}`);
  console.log(`   Estimated time @ ${RATE_LIMIT_MS}ms/req: ~${Math.ceil((total * RATE_LIMIT_MS) / 60_000)} min\n`);

  const results = {};

  console.log('📚 universities...');
  results.universities = await processBatch(
    unisRes.data || [],
    'university',
    summarizeUniversity,
    (u) => ({ slug: u.slug, name_ar: u.name_ar }),
  );

  console.log('\n🎓 programs...');
  results.programs = await processBatch(
    progsRes.data || [],
    'major',
    (p) => summarizeProgram(p, p.universities?.name_ar),
    (p) => ({ field: p.field, degree: p.degree, university_id: p.university_id }),
  );

  console.log('\n💰 scholarships...');
  results.scholarships = await processBatch(
    scholRes.data || [],
    'scholarship',
    summarizeScholarship,
    (s) => ({ provider: s.provider, name: s.name_ar }),
  );

  console.log('\n💼 salary_data...');
  results.salaries = await processBatch(
    salRes.data || [],
    'admission',
    summarizeSalary,
    (s) => ({ field: s.field, sector: s.sector }),
  );

  console.log('\n═══════════════════════════════════════');
  console.log('✅ Backfill complete');
  console.log(JSON.stringify(results, null, 2));
}

main().catch((err) => {
  console.error('❌ Backfill crashed:', err);
  process.exit(1);
});
