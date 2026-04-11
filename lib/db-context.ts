/**
 * DB Context — Qatar University Advisor
 * ═══════════════════════════════════════
 * يستعلم من جداول Supabase لبناء سياق مركّز للـ AI
 * بدلاً من تحميل ملف universities.json الثابت.
 *
 * سلسلة الأولوية:
 *   1. استعلم من Supabase حسب فئة السؤال
 *   2. عند الفشل أو غياب البيانات → أعد null
 *      (المستدعي يعود لـ universities.json احتياطياً)
 */

/* global process */

import { supabase } from './supabase';
import { CATEGORY_KEYWORDS } from './category-keywords';

// ──────────────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────────────

interface ProgramRow {
  name_ar: string;
  field: string;
  degree: string;
}

interface AdmissionRow {
  nationality: string;
  min_gpa: number | null;
  english_requirement: string | null;
  notes: string | null;
}

interface TuitionRow {
  nationality: string;
  amount_per_year: number | null;
  is_free_for_qatari: boolean;
  notes: string | null;
}

interface UniversityRow {
  id: number;
  slug: string;
  name_ar: string;
  name_en: string;
  type: string;
  location: string;
  website: string | null;
  description_ar: string | null;
  is_active: boolean;
  closing_note: string | null;
  programs: ProgramRow[];
  admission_requirements: AdmissionRow[];
  tuition_fees: TuitionRow[];
}

interface ScholarshipRow {
  name_ar: string;
  name_en: string | null;
  provider: string | null;
  nationality_eligible: string;
  monthly_allowance: number | null;
  covers_tuition: boolean;
  covers_housing: boolean;
  covers_flights: boolean;
  bond_years: number | null;
  description_ar: string | null;
  how_to_apply: string | null;
  deadline_note: string | null;
}

interface SalaryRow {
  field: string;
  specialty: string | null;
  sector: string;
  min_salary: number;
  max_salary: number;
  avg_salary: number | null;
  experience: string;
  notes: string | null;
}

type Category = 'universities' | 'admission' | 'programs' | 'scholarships' | 'salary' | 'military' | 'general';

// ──────────────────────────────────────────────────────
// Category detection — uses shared keyword map from category-keywords.ts
// ──────────────────────────────────────────────────────

function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .replace(/[\u064B-\u065F\u0670]/g, '')
    .replace(/[أإآا]/g, 'ا')
    .replace(/[ةه]/g, 'ه')
    .replace(/[يى]/g, 'ي')
    .replace(/[^\u0600-\u06FF\u0750-\u077F\w\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function detectCategory(text: string): Category {
  const normalized = normalizeText(text);
  let bestCategory: Category = 'general';
  let bestScore = 0;

  for (const [cat, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    const score = keywords.filter((kw) => normalized.includes(normalizeText(kw))).length;
    if (score > bestScore) {
      bestScore = score;
      bestCategory = cat as Category;
    }
  }
  return bestCategory;
}

// ──────────────────────────────────────────────────────
// Formatters
// ──────────────────────────────────────────────────────

function formatUniversities(unis: UniversityRow[]): string {
  const lines = unis.map((u) => {
    let line = `### ${u.slug}: ${u.name_ar} (${u.name_en})\n`;
    line += `  النوع: ${u.type} | الموقع: ${u.location}`;
    if (!u.is_active && u.closing_note) line += ` ⚠️ ${u.closing_note}`;
    line += '\n';
    if (u.description_ar) line += `  الوصف: ${u.description_ar}\n`;

    // شروط القبول
    const qatariAdm = u.admission_requirements?.find((a) => a.nationality === 'qatari');
    const nonQatariAdm = u.admission_requirements?.find((a) => a.nationality === 'non_qatari');
    if (qatariAdm?.min_gpa != null) {
      line += `  القبول (قطري): معدل ${qatariAdm.min_gpa}%+`;
      if (qatariAdm.english_requirement) line += ` | إنجليزي: ${qatariAdm.english_requirement}`;
      if (qatariAdm.notes) line += `\n    ${qatariAdm.notes}`;
      line += '\n';
    }
    if (nonQatariAdm?.min_gpa != null) {
      line += `  القبول (مقيم): معدل ${nonQatariAdm.min_gpa}%+`;
      if (nonQatariAdm.notes) line += `\n    ${nonQatariAdm.notes}`;
      line += '\n';
    }

    // البرامج (أول 8)
    const progNames = (u.programs || [])
      .slice(0, 8)
      .map((p) => p.name_ar)
      .join('، ');
    if (progNames) line += `  البرامج: ${progNames}\n`;

    // الرسوم
    const freeForQatari = (u.tuition_fees || []).find((f) => f.is_free_for_qatari);
    const qatariFee = (u.tuition_fees || []).find((f) => f.nationality === 'qatari' && !f.is_free_for_qatari);
    const nonQatariFee = (u.tuition_fees || []).find(
      (f) => f.nationality === 'non_qatari' || f.nationality === 'international',
    );
    const feeParts: string[] = [];
    if (freeForQatari) {
      feeParts.push('مجانية للقطريين');
    } else if (qatariFee?.amount_per_year) {
      feeParts.push(`قطري: ${qatariFee.amount_per_year.toLocaleString()} ريال/سنة`);
    }
    if (nonQatariFee?.amount_per_year) {
      feeParts.push(`مقيم/دولي: ${nonQatariFee.amount_per_year.toLocaleString()} ريال/سنة`);
    }
    if (feeParts.length > 0) line += `  الرسوم: ${feeParts.join(' | ')}\n`;

    if (u.website) line += `  الموقع: ${u.website}`;

    return line;
  });

  return ['## بيانات الجامعات (مصدر الحقيقة — Supabase):', lines.join('\n\n')].join('\n');
}

function formatScholarships(schols: ScholarshipRow[]): string {
  const lines = schols.map((s) => {
    let line = `- ${s.name_ar}`;
    if (s.provider) line += ` (${s.provider})`;
    const eligible = s.nationality_eligible === 'qatari' ? 'للقطريين' : s.nationality_eligible === 'all' ? 'لجميع الجنسيات' : s.nationality_eligible;
    line += `: ${eligible}`;
    if (s.monthly_allowance) line += ` — مكافأة: ${s.monthly_allowance.toLocaleString()} ريال/شهر`;
    const coverage: string[] = [];
    if (s.covers_tuition) coverage.push('رسوم');
    if (s.covers_housing) coverage.push('سكن');
    if (s.covers_flights) coverage.push('تذاكر');
    if (coverage.length > 0) line += ` — يشمل: ${coverage.join(' + ')}`;
    if (s.bond_years) line += ` — التزام ${s.bond_years} سنوات`;
    if (s.description_ar) line += `\n  ${s.description_ar}`;
    if (s.how_to_apply) line += `\n  التقديم: ${s.how_to_apply}`;
    if (s.deadline_note) line += `\n  الموعد: ${s.deadline_note}`;
    return line;
  });

  return ['\n## المنح والابتعاث (مصدر الحقيقة — Supabase):', lines.join('\n')].join('\n');
}

function formatSalary(rows: SalaryRow[]): string {
  const lines = rows.map((s) => {
    let line = `- ${s.field}`;
    if (s.specialty) line += ` / ${s.specialty}`;
    line += `: ${s.min_salary.toLocaleString()}–${s.max_salary.toLocaleString()} ريال/شهر`;
    if (s.avg_salary) line += ` (متوسط: ${s.avg_salary.toLocaleString()})`;
    if (s.sector !== 'all') line += ` | قطاع: ${s.sector}`;
    if (s.experience !== 'fresh') line += ` | خبرة: ${s.experience}`;
    if (s.notes) line += `\n  ملاحظة: ${s.notes}`;
    return line;
  });

  return ['\n## بيانات الرواتب في قطر (مصدر الحقيقة — Supabase):', lines.join('\n')].join('\n');
}

// ──────────────────────────────────────────────────────
// Main export
// ──────────────────────────────────────────────────────

const FETCH_TIMEOUT_MS = 3000;

/**
 * يجلب سياقاً مركّزاً من Supabase بناءً على فئة السؤال.
 *
 * @param question  - نص سؤال المستخدم (للكشف عن الفئة)
 * @returns سلسلة نصية للـ system prompt، أو null عند تعذّر الجلب
 */
export async function fetchDbContext(question: string): Promise<string | null> {
  if (!supabase) return null;

  const category = detectCategory(question);

  const timeout = new Promise<null>((resolve) => setTimeout(() => resolve(null), FETCH_TIMEOUT_MS));

  const work = async (): Promise<string | null> => {
    try {
      const sections: string[] = [];

      // ── جداول الجامعات (دائماً عند الحاجة) ─────────────────
      const needsUnis = ['universities', 'admission', 'programs', 'military', 'general'].includes(category);
      if (needsUnis) {
        const { data: unis, error } = await supabase!
          .from('universities')
          .select(
            `id, slug, name_ar, name_en, type, location, website, description_ar, is_active, closing_note,
             programs(name_ar, field, degree),
             admission_requirements(nationality, min_gpa, english_requirement, notes),
             tuition_fees(nationality, amount_per_year, is_free_for_qatari, notes)`,
          )
          .order('name_ar');

        if (!error && unis && unis.length > 0) {
          // جميع الجامعات (نشطة وغير نشطة) — الغير نشطة تُذكر للتوعية (مثل TAMU 2028)
          sections.push(formatUniversities(unis as unknown as UniversityRow[]));
        }
      }

      // ── جدول المنح ─────────────────────────────────────────
      const needsSchols = ['scholarships', 'general'].includes(category);
      if (needsSchols) {
        const { data: schols, error } = await supabase!
          .from('scholarships')
          .select(
            'name_ar, name_en, provider, nationality_eligible, monthly_allowance, covers_tuition, covers_housing, covers_flights, bond_years, description_ar, how_to_apply, deadline_note',
          )
          .eq('is_active', true)
          .order('name_ar');

        if (!error && schols && schols.length > 0) {
          sections.push(formatScholarships(schols as ScholarshipRow[]));
        }
      }

      // ── جدول الرواتب ───────────────────────────────────────
      const needsSalary = ['salary', 'general'].includes(category);
      if (needsSalary) {
        const { data: salaryRows, error } = await supabase!
          .from('salary_data')
          .select('field, specialty, sector, min_salary, max_salary, avg_salary, experience, notes')
          .order('field');

        if (!error && salaryRows && salaryRows.length > 0) {
          sections.push(formatSalary(salaryRows as SalaryRow[]));
        }
      }

      if (sections.length === 0) return null;

      return sections.join('\n');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error('[db-context] Query error:', msg);
      return null;
    }
  };

  return Promise.race([work(), timeout]);
}
