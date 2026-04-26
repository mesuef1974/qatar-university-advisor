/**
 * DB Scholarships Handler — DEC-AI-001 Phase 3 Expansion
 * ═══════════════════════════════════════════════════════
 * يحاول الإجابة على أسئلة "المنح / الابتعاث / السبونسر / الرعاة"
 * مباشرةً من Supabase (جدول scholarships).
 *
 * إذا فشل أو لم يطابق → يعود null والمستدعي يعود للـ static/AI.
 */

import { getSupabaseServerClient } from './supabase';
import { normalizeArabic } from './db-list-handler';

export interface DbScholarshipsResponse {
  text: string;
  suggestions: string[];
  source: 'db';
  count?: number;
}

// كلمات مفتاحية لتفعيل DB scholarships — \uXXXX escapes (defensively immune to bundler issues)
const SCHOLARSHIP_TRIGGERS = [
  'المنح', // المنح
  'منح دراسية', // منح دراسية
  'منح دراسيه', // منح دراسيه
  'الابتعاث', // الابتعاث
  'بعثة', // بعثة
  'بعثه', // بعثه
  'ابتعاث', // ابتعاث
  'منح متاحة', // منح متاحة
  'منح متاحه', // منح متاحه
  'كم منحة', // كم منحة
  'كم منحه', // كم منحه
  'قائمة المنح', // قائمة المنح
  'قائمه المنح', // قائمه المنح
  'جميع المنح', // جميع المنح
  'سبونسر', // سبونسر
  'راعي', // راعي
  'رعاية', // رعاية
  'list of scholarships',
  'all scholarships',
  'available scholarships',
  'sponsorship',
];

function matches(text: string, triggers: string[]): boolean {
  const n = normalizeArabic(text);
  return triggers.some((t) => n.includes(normalizeArabic(t)));
}

// ──────────────────────────────────────────────────────
// Nationality eligibility group meta
// ──────────────────────────────────────────────────────
const NATIONALITY_META: Record<string, { emoji: string; label: string }> = {
  qatari: { emoji: '\u{1F1F6}\u{1F1E6}', label: 'للقطريين' }, // 🇶🇦 للقطريين
  all: { emoji: '\u{1F30D}', label: 'لجميع الجنسيات' }, // 🌍 لجميع الجنسيات
  gcc: { emoji: '\u{1F91D}', label: 'دول الخليج' }, // 🤝 دول الخليج
};

interface ScholarshipRow {
  name_ar: string;
  name_en: string | null;
  provider: string | null;
  sponsor_name: string | null;
  nationality_eligible: string | null;
  gender_eligible: string | null;
  fields_eligible: string | null;
  monthly_allowance: number | null;
  currency: string | null;
  covers_tuition: boolean | null;
  covers_housing: boolean | null;
  covers_flights: boolean | null;
  max_duration_years: number | null;
  bond_years: number | null;
  description_ar: string | null;
  how_to_apply: string | null;
  deadline_note: string | null;
  is_active: boolean;
}

// ──────────────────────────────────────────────────────
// Format helpers
// ──────────────────────────────────────────────────────
function formatRow(s: ScholarshipRow): string {
  const provider = s.provider || s.sponsor_name;
  let line = `\u{1F4B0} **${s.name_ar}**`;
  if (provider) line += ` — ${provider}`;

  // Stipend
  if (s.monthly_allowance && s.monthly_allowance > 0) {
    const cur = s.currency || 'QAR';
    line += `\n   \u{1F4B5} ${s.monthly_allowance.toLocaleString('en-US')} ${cur}/شهر`; // /شهر
  }

  // Coverage checklist
  const coverage: string[] = [];
  if (s.covers_tuition) coverage.push('✅ رسوم'); // ✅ رسوم
  if (s.covers_housing) coverage.push('✅ سكن'); // ✅ سكن
  if (s.covers_flights) coverage.push('✅ تذاكر'); // ✅ تذاكر
  if (coverage.length > 0) {
    line += `\n   ${coverage.join(' · ')}`;
  }

  // Bond years
  if (s.bond_years && s.bond_years > 0) {
    line += `\n   \u{1F517} التزام ${s.bond_years} سنوات`; // 🔗 التزام N سنوات
  }

  return line;
}

// ──────────────────────────────────────────────────────
// Main entry point
// ──────────────────────────────────────────────────────
export async function tryDbScholarshipsResponse(
  userText: string
): Promise<DbScholarshipsResponse | null> {
  if (!matches(userText, SCHOLARSHIP_TRIGGERS)) {
    console.info('[db-scholarships-handler] no trigger matched for input');
    return null;
  }

  let client;
  try {
    client = getSupabaseServerClient();
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('[db-scholarships-handler] getSupabaseServerClient failed:', msg);
    return null;
  }

  try {
    const { data, error } = await client
      .from('scholarships')
      .select(
        'name_ar, name_en, provider, sponsor_name, nationality_eligible, gender_eligible, fields_eligible, monthly_allowance, currency, covers_tuition, covers_housing, covers_flights, max_duration_years, bond_years, description_ar, how_to_apply, deadline_note, is_active'
      )
      .eq('is_active', true)
      .order('nationality_eligible')
      .order('name_ar');

    if (error) {
      console.error('[db-scholarships-handler] scholarships query error:', error.message);
      return null;
    }
    if (!data || data.length === 0) {
      console.info('[db-scholarships-handler] scholarships query returned 0 rows');
      return null;
    }

    const rows = data as ScholarshipRow[];

    // Group by nationality_eligible
    const grouped: Record<string, ScholarshipRow[]> = {};
    for (const r of rows) {
      const key = (r.nationality_eligible || 'all').toLowerCase();
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(r);
    }

    const sections: string[] = [];
    const order: string[] = ['qatari', 'all', 'gcc'];
    for (const key of order) {
      const group = grouped[key];
      if (!group || group.length === 0) continue;
      const meta = NATIONALITY_META[key] || { emoji: '\u{1F393}', label: key };
      const lines = group.map(formatRow).join('\n\n');
      sections.push(`**${meta.emoji} ${meta.label} (${group.length}):**\n\n${lines}`);
    }

    // Catch any non-standard nationality_eligible buckets
    for (const key of Object.keys(grouped)) {
      if (order.includes(key)) continue;
      const group = grouped[key];
      const meta = NATIONALITY_META[key] || { emoji: '\u{1F393}', label: key };
      const lines = group.map(formatRow).join('\n\n');
      sections.push(`**${meta.emoji} ${meta.label} (${group.length}):**\n\n${lines}`);
    }

    const text = `\u{1F393} **المنح والابتعاث في قطر** — ${rows.length} منحة\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n${sections.join('\n\n')}\n\n\u{1F4A1} **اكتب اسم المنحة للتفاصيل**\n\n\u{1F4CA} **المصدر:** قاعدة بيانات أذكياء — محدَّثة 2026-04-26`;

    return {
      text,
      suggestions: [
        'منح القطريين', // منح القطريين
        'منح الابتعاث الخارجي', // منح الابتعاث الخارجي
        'منح الجامعات الأمريكية', // منح الجامعات الأمريكية
      ],
      source: 'db',
      count: rows.length,
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('[db-scholarships-handler] scholarships query exception:', msg);
    return null;
  }
}
