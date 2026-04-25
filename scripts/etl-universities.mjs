#!/usr/bin/env node
/**
 * ETL: data/universities.json → Supabase
 * ═══════════════════════════════════════════════════════
 * Reads universities.json (single source of truth maintained
 * by Content Team) and generates idempotent UPSERT SQL for:
 *   - universities
 *   - programs
 *
 * Usage:
 *   node scripts/etl-universities.mjs > migration_005.sql
 *
 * Reference: docs/Truth-Source-Audit-CORRECTED-2026-04-26.md
 * Decision:  DEC-AI-001 (Hybrid architecture — Option C)
 */

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dataPath = resolve(__dirname, '..', 'data', 'universities.json');
const data = JSON.parse(readFileSync(dataPath, 'utf-8'));

// ─── Type mapping (Arabic → schema enum) ─────────────────
const TYPE_MAP = {
  'حكومية': 'public',
  'خاصة': 'private',
  'فرع دولي': 'branch',
  'عسكرية': 'military',
  'مهنية': 'vocational',
};

function mapType(t) {
  if (!t) return 'private';
  const s = String(t);
  if (s.includes('عسكرية') || s.includes('القوات المسلحة')) return 'military';
  if (s.includes('حكومية')) return 'public';
  if (s.includes('فرع') || s.includes('برانش') || s.includes('international')) return 'branch';
  if (s.includes('مهنية') || s.includes('تطبيقية')) return 'vocational';
  return 'private';
}

function mapLanguage(t) {
  if (!t) return 'arabic';
  const s = String(t).toLowerCase();
  if (s.includes('arabic') && s.includes('english')) return 'bilingual';
  if (s.includes('عربية') && s.includes('إنجليزية')) return 'bilingual';
  if (s.includes('english') || s.includes('إنجليزية')) return 'english';
  return 'arabic';
}

function mapDegree(d) {
  if (!d) return 'bachelor';
  const s = String(d).toLowerCase();
  if (s.includes('phd') || s.includes('دكتوراه')) return 'phd';
  if (s.includes('master') || s.includes('ماجستير')) return 'master';
  if (s.includes('diploma') || s.includes('دبلوم')) return 'diploma';
  if (s.includes('certif') || s.includes('شهادة')) return 'certificate';
  return 'bachelor';
}

function mapField(name) {
  if (!name) return null;
  const s = String(name).toLowerCase();
  if (s.match(/طب|صيد|تمريض|صحة|medic|pharm|nurs|health/)) return 'medicine';
  if (s.match(/هندس|engin/)) return 'engineering';
  if (s.match(/أعمال|إدار|محاسب|تسويق|مال|business|account|market|financ|MBA/i)) return 'business';
  if (s.match(/قانون|حقوق|law/)) return 'law';
  if (s.match(/علوم|فيزياء|كيمياء|أحياء|رياضيات|science|physic|chem|biol|math/)) return 'science';
  if (s.match(/فنون|تصميم|إعلام|art|design|media/)) return 'arts';
  if (s.match(/تربية|تعليم|education|teach/)) return 'education';
  if (s.match(/حاسب|تقنية|معلومات|computer|IT|cyber|software|AI/i)) return 'science';
  return null;
}

// SQL escape
function s(v) {
  if (v === null || v === undefined) return 'NULL';
  if (typeof v === 'boolean') return v ? 'TRUE' : 'FALSE';
  if (typeof v === 'number') return String(v);
  return `'${String(v).replace(/'/g, "''")}'`;
}

// Slug normalization
function slugify(key) {
  return key.toLowerCase().replace(/_/g, '-');
}

// ─── Output SQL header ───────────────────────────────────
console.log(`-- ═══════════════════════════════════════════════════════════════════════════
-- Migration 005: ETL universities.json → Supabase
-- Generated: ${new Date().toISOString()}
-- Source:    data/universities.json (lastGlobalUpdate: ${data._meta?.lastGlobalUpdate})
-- Universities: ${Object.keys(data.universities).length}
-- Idempotent: ON CONFLICT (slug) DO UPDATE
-- Reference: DEC-AI-001 (Hybrid architecture)
-- ═══════════════════════════════════════════════════════════════════════════

BEGIN;

-- ─────────────────────────────────────────
-- Universities (UPSERT by slug)
-- ─────────────────────────────────────────`);

let universityCount = 0;
let programCount = 0;
const universityKeys = Object.keys(data.universities);
const programInserts = [];

for (const key of universityKeys) {
  const u = data.universities[key];
  if (!u || !u.nameAr) continue;

  const slug = slugify(key);
  const name_ar = u.nameAr;
  const name_en = u.nameEn || u.nameAr;
  const short_name = key.replace(/_/g, '-');
  const type = mapType(u.type);
  const location = u.location || 'الدوحة';
  const website = u.website || null;
  const established_year = u.founded || null;
  const language = mapLanguage(u.teachingLanguage);
  const description = u.campusDescription || u.notes || null;

  // Build description from available fields
  const descParts = [];
  if (u.campusDescription) descParts.push(u.campusDescription);
  if (u.studentHousingDetails) descParts.push(`السكن: ${u.studentHousingDetails}`);
  if (u.notes) descParts.push(u.notes);
  const description_ar = descParts.length ? descParts.join(' — ').slice(0, 500) : null;

  const closing = u.closingNote || u.closing_note || null;
  const is_active = closing ? false : true;

  console.log(`
INSERT INTO public.universities (slug, name_ar, name_en, short_name, type, location, website, established_year, language, description_ar, is_active, closing_note, updated_at)
VALUES (${s(slug)}, ${s(name_ar)}, ${s(name_en)}, ${s(short_name)}, ${s(type)}, ${s(location)}, ${s(website)}, ${s(established_year)}, ${s(language)}, ${s(description_ar)}, ${s(is_active)}, ${s(closing)}, NOW())
ON CONFLICT (slug) DO UPDATE SET
  name_ar = EXCLUDED.name_ar,
  name_en = EXCLUDED.name_en,
  short_name = EXCLUDED.short_name,
  type = EXCLUDED.type,
  location = EXCLUDED.location,
  website = EXCLUDED.website,
  established_year = COALESCE(EXCLUDED.established_year, universities.established_year),
  language = EXCLUDED.language,
  description_ar = EXCLUDED.description_ar,
  is_active = EXCLUDED.is_active,
  closing_note = EXCLUDED.closing_note,
  updated_at = NOW();`);

  universityCount++;

  // Programs (collect for next phase)
  const progs = u.programs || u.majors || [];
  if (Array.isArray(progs)) {
    for (const p of progs) {
      const progName = typeof p === 'string' ? p : (p.nameAr || p.name || p.title);
      if (!progName) continue;
      const progNameEn = (typeof p === 'object' ? p.nameEn : null) || progName;
      const degree = mapDegree(typeof p === 'object' ? (p.degree || p.level) : null);
      const field = mapField(progName);
      const duration = (typeof p === 'object' && p.duration) || null;
      programInserts.push({ slug, progName, progNameEn, degree, field, duration });
    }
  }
}

// ─── Programs ────────────────────────────────────────────
console.log(`
-- ─────────────────────────────────────────
-- Programs (DELETE+INSERT by university — idempotent reset)
-- ─────────────────────────────────────────
-- Strategy: clear programs for universities present in JSON, then re-insert.
-- This keeps user-customized programs for universities NOT in JSON intact.
DELETE FROM public.programs WHERE university_id IN (
  SELECT id FROM public.universities WHERE slug IN (${universityKeys.map(k => `'${slugify(k)}'`).join(', ')})
);
`);

for (const pr of programInserts) {
  console.log(`INSERT INTO public.programs (university_id, name_ar, name_en, field, degree, duration_years, language, is_active)
SELECT id, ${s(pr.progName)}, ${s(pr.progNameEn)}, ${s(pr.field)}, ${s(pr.degree)}, ${s(pr.duration)}, 'arabic', TRUE
FROM public.universities WHERE slug = ${s(pr.slug)};`);
  programCount++;
}

console.log(`
-- ─────────────────────────────────────────
-- Stats
-- ─────────────────────────────────────────
-- Universities upserted: ${universityCount}
-- Programs inserted: ${programCount}

COMMIT;

-- Verification queries (run manually after):
-- SELECT COUNT(*) FROM universities WHERE is_active = TRUE;  -- expect: 28-30
-- SELECT COUNT(*) FROM programs WHERE is_active = TRUE;       -- expect: ${programCount}
-- SELECT slug, name_ar FROM universities ORDER BY name_ar;`);

// Stats to stderr (not part of SQL)
console.error(`✅ ETL Generated:`);
console.error(`   Universities: ${universityCount}`);
console.error(`   Programs: ${programCount}`);
