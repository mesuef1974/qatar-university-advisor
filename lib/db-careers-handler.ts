/**
 * DB Careers Handler — DEC-AI-001 Phase 3 Expansion
 * ═══════════════════════════════════════════════════
 * يحاول الإجابة على أسئلة "المسارات المهنية / الرواتب / فرص العمل"
 * مباشرةً من Supabase (salary_data table).
 *
 * إذا فشل أو لم يطابق → يعود null والمستدعي يعود للـ static/AI.
 */

import { getSupabaseServerClient } from './supabase';
import { normalizeArabic } from './db-list-handler';

export interface DbCareersResponse {
  text: string;
  suggestions: string[];
  source: 'db';
  count?: number;
}

// كلمات مفتاحية لتفعيل DB careers — يدعم العربية الخام و\uXXXX
const CAREER_TRIGGERS = [
  'الرواتب',
  'الراتب',
  'الوظائف',
  'المسارات المهنية',
  'سوق العمل',
  'كم راتب',
  'متوسط الراتب',
  'وظيفة',
  'مهنة',
  'مستقبل مهني',
  'فرص العمل',
  'list of careers',
  'salaries',
  'job market',
  'career paths',
  'salary ranges',
];

function matches(text: string, triggers: string[]): boolean {
  const n = normalizeArabic(text);
  return triggers.some((t) => n.includes(normalizeArabic(t)));
}

// ──────────────────────────────────────────────────────
// Field emoji + label map
// ──────────────────────────────────────────────────────
const FIELD_META: Record<string, { emoji: string; label: string }> = {
  engineering: { emoji: '⚙️', label: 'الهندسة' },
  medicine: { emoji: '🏥', label: 'الطب والصحة' },
  health: { emoji: '🏥', label: 'الطب والصحة' },
  it: { emoji: '💻', label: 'تقنية المعلومات' },
  tech: { emoji: '💻', label: 'تقنية المعلومات' },
  business: { emoji: '💼', label: 'الإدارة والأعمال' },
  finance: { emoji: '💰', label: 'المال والمصرفية' },
  education: { emoji: '🎓', label: 'التعليم' },
  law: { emoji: '⚖️', label: 'القانون' },
  media: { emoji: '📺', label: 'الإعلام' },
  design: { emoji: '🎨', label: 'التصميم' },
  military: { emoji: '⚔️', label: 'العسكرية' },
  aviation: { emoji: '✈️', label: 'الطيران' },
  energy: { emoji: '🛢️', label: 'الطاقة' },
};

function fieldMeta(field: string): { emoji: string; label: string } {
  const key = (field || '').toLowerCase().trim();
  return FIELD_META[key] || { emoji: '🎯', label: field || 'مجالات أخرى' };
}

interface SalaryRow {
  field: string;
  specialty: string | null;
  sector: string | null;
  min_salary: number | null;
  max_salary: number | null;
  avg_salary: number | null;
  experience: string | null;
  notes: string | null;
}

// ──────────────────────────────────────────────────────
// Format helpers
// ──────────────────────────────────────────────────────
function formatNumber(n: number): string {
  return n.toLocaleString('en-US');
}

function formatRange(min: number | null, max: number | null): string {
  if (min !== null && max !== null) return `${formatNumber(min)}–${formatNumber(max)} ريال/شهر`;
  if (min !== null) return `من ${formatNumber(min)} ريال/شهر`;
  if (max !== null) return `حتى ${formatNumber(max)} ريال/شهر`;
  return '';
}

function formatRow(r: SalaryRow): string {
  const meta = fieldMeta(r.field);
  const title = r.specialty ? `**${r.specialty}**` : `**${meta.label}**`;
  const parts: string[] = [`${meta.emoji} ${title}`];

  const range = formatRange(r.min_salary, r.max_salary);
  if (range) parts.push(`💵 ${range}`);
  if (r.avg_salary !== null) parts.push(`متوسط ${formatNumber(r.avg_salary)}`);

  const meta2: string[] = [];
  if (r.sector) meta2.push(`🏢 ${r.sector}`);
  if (r.experience) meta2.push(`🧭 ${r.experience}`);

  let line = `• ${parts.join(' — ')}`;
  if (meta2.length > 0) line += `\n   ${meta2.join(' · ')}`;
  return line;
}

// ──────────────────────────────────────────────────────
// Main entry point
// ──────────────────────────────────────────────────────
export async function tryDbCareersResponse(
  userText: string
): Promise<DbCareersResponse | null> {
  if (!matches(userText, CAREER_TRIGGERS)) {
    console.info('[db-careers-handler] no trigger matched for input');
    return null;
  }

  let client;
  try {
    client = getSupabaseServerClient();
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('[db-careers-handler] getSupabaseServerClient failed:', msg);
    return null;
  }

  try {
    const { data, error } = await client
      .from('salary_data')
      .select('field, specialty, sector, min_salary, max_salary, avg_salary, experience, notes')
      .order('field')
      .order('specialty');

    if (error) {
      console.error('[db-careers-handler] salary_data query error:', error.message);
      return null;
    }
    if (!data || data.length === 0) {
      console.info('[db-careers-handler] salary_data query returned 0 rows');
      return null;
    }

    const rows = data as SalaryRow[];

    // Group by field
    const grouped: Record<string, SalaryRow[]> = {};
    for (const r of rows) {
      const key = (r.field || 'other').toLowerCase().trim();
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(r);
    }

    const sections: string[] = [];
    const fieldKeys = Object.keys(grouped).sort();
    for (const key of fieldKeys) {
      const group = grouped[key];
      if (!group || group.length === 0) continue;
      const meta = fieldMeta(key);
      const lines = group.map(formatRow);
      sections.push(`**${meta.emoji} ${meta.label} (${group.length}):**\n${lines.join('\n')}`);
    }

    const text = `💼 **المسارات المهنية والرواتب في قطر** — ${rows.length} مسار\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n${sections.join('\n\n')}\n\n💡 **اكتب اسم تخصص للحصول على تفاصيل أعمق**\n\n📊 **المصدر:** قاعدة بيانات أذكياء — محدَّثة 2026-04-26`;

    return {
      text,
      suggestions: ['رواتب الهندسة', 'رواتب الطب', 'وظائف بدون خبرة'],
      source: 'db',
      count: rows.length,
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('[db-careers-handler] salary_data query exception:', msg);
    return null;
  }
}
