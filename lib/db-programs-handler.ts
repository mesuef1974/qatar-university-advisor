/**
 * DB Programs Handler — DEC-AI-001 Phase 3 Expansion
 * ═══════════════════════════════════════════════════
 * يحاول الإجابة على أسئلة "قائمة التخصصات / البرامج المتاحة / كم تخصص"
 * مباشرةً من Supabase (programs + universities).
 *
 * إذا فشل أو لم يطابق → يعود null والمستدعي يعود للـ static/AI.
 */

import { getSupabaseServerClient } from './supabase';
import { normalizeArabic } from './db-list-handler';

export interface DbProgramsResponse {
  text: string;
  suggestions: string[];
  source: 'db';
  count?: number;
}

// كلمات مفتاحية لتفعيل DB programs — \uXXXX escapes (defensively immune to bundler issues)
const PROGRAM_TRIGGERS = [
  'كم تخصص', // كم تخصص
  'قائمه التخصصات', // قائمه التخصصات
  'قائمة التخصصات', // قائمة التخصصات
  'جميع التخصصات', // جميع التخصصات
  'كل التخصصات', // كل التخصصات
  'البرامج المتاحه', // البرامج المتاحه
  'البرامج المتاحة', // البرامج المتاحة
  'تخصصات الجامعات', // تخصصات الجامعات
  'list of programs',
  'all programs',
  'how many programs',
];

function matches(text: string, triggers: string[]): boolean {
  const n = normalizeArabic(text);
  return triggers.some((t) => n.includes(normalizeArabic(t)));
}

// ──────────────────────────────────────────────────────
// Type emoji map (mirror db-list-handler)
// ──────────────────────────────────────────────────────
const TYPE_EMOJI: Record<string, string> = {
  public: '🏛️',
  private: '🏢',
  branch: '🌐',
  military: '⚔️',
  vocational: '🛠️',
};

interface ProgramRow {
  name_ar: string;
  is_active: boolean;
  university: {
    slug: string;
    name_ar: string;
    type: string;
    is_active: boolean;
  } | null;
}

// ──────────────────────────────────────────────────────
// Main entry point
// ──────────────────────────────────────────────────────
export async function tryDbProgramsResponse(
  userText: string
): Promise<DbProgramsResponse | null> {
  if (!matches(userText, PROGRAM_TRIGGERS)) {
    console.info('[db-programs-handler] no trigger matched for input');
    return null;
  }

  let client;
  try {
    client = getSupabaseServerClient();
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('[db-programs-handler] getSupabaseServerClient failed:', msg);
    return null;
  }

  try {
    const { data, error } = await client
      .from('programs')
      .select('name_ar, is_active, university:universities!inner(slug, name_ar, type, is_active)')
      .eq('is_active', true)
      .eq('universities.is_active', true);

    if (error) {
      console.error('[db-programs-handler] programs query error:', error.message);
      return null;
    }
    if (!data || data.length === 0) {
      console.info('[db-programs-handler] programs query returned 0 rows');
      return null;
    }

    const rows = data as unknown as ProgramRow[];

    // Group by university slug
    const byUni: Record<
      string,
      { name_ar: string; type: string; programs: string[] }
    > = {};
    for (const r of rows) {
      if (!r.university || !r.university.is_active) continue;
      const key = r.university.slug;
      if (!byUni[key]) {
        byUni[key] = {
          name_ar: r.university.name_ar,
          type: r.university.type,
          programs: [],
        };
      }
      byUni[key].programs.push(r.name_ar);
    }

    const universities = Object.values(byUni);
    if (universities.length === 0) {
      console.info('[db-programs-handler] no active universities had programs');
      return null;
    }

    // Sort by program count desc, take top 8
    universities.sort((a, b) => b.programs.length - a.programs.length);
    const top = universities.slice(0, 8);

    const totalPrograms = rows.length;
    const totalUnis = universities.length;

    const blocks = top.map((u) => {
      const emoji = TYPE_EMOJI[u.type] || '🎓';
      const sample = u.programs.slice(0, 6).join('، '); // ، with space
      const more = u.programs.length > 6 ? ` (+${u.programs.length - 6})` : '';
      return `${emoji} **${u.name_ar}** (${u.programs.length})\n   ${sample}${more}`;
    });

    const text = `🎓 **برامج وتخصصات الجامعات في قطر** — ${totalPrograms} برنامج عبر ${totalUnis} جامعة\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n${blocks.join('\n\n')}\n\n💡 **اكتب اسم تخصص للتفاصيل** (مثل: "تخصصات الطب" أو "هندسة")\n\n📊 **المصدر:** قاعدة بيانات أذكياء — محدَّثة 2026-04-26`;

    return {
      text,
      suggestions: ['برامج جامعة قطر', 'تخصصات الطب', 'تخصصات الهندسة'],
      source: 'db',
      count: totalPrograms,
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('[db-programs-handler] programs query exception:', msg);
    return null;
  }
}
