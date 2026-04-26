/**
 * DB List Handler — DEC-AI-001 Phase 3
 * ═══════════════════════════════════════
 * يحاول الإجابة على أسئلة "قائمة الجامعات / كم العدد" مباشرةً من Supabase
 * (مصدر الحقيقة بعد ETL في DEC-AI-001 Phase 1+2).
 *
 * إذا فشل أو لم يطابق → يعود null والمستدعي يعود للـ static/AI.
 */

import { getSupabaseServerClient } from './supabase';

export interface DbListResponse {
  text: string;
  suggestions: string[];
  source: 'db';
  count?: number;
}

// كلمات مفتاحية لتفعيل DB list — مُحسَّنة للعربية القطرية
const LIST_TRIGGERS = [
  'كم عدد الجامعات',
  'كم جامعه',
  'كم جامعة',
  'قائمه الجامعات',
  'قائمة الجامعات',
  'جميع الجامعات',
  'كل الجامعات',
  'الجامعات في قطر',
  'الجامعات الموجوده',
  'الجامعات المتاحه',
  'list of universities',
  'all universities',
  'how many universities',
];

const MILITARY_TRIGGERS = [
  'الكليات العسكريه',
  'الكليات العسكرية',
  'الكليه العسكريه',
  'الكلية العسكرية',
  'كليات عسكريه',
  'كليات عسكرية',
  'الجامعات العسكريه',
  'military colleges',
];

// Char-by-char normalization (no regex with raw Arabic — avoids bundle issues).
function normalizeArabic(s: string): string {
  let out = '';
  for (let i = 0; i < s.length; i++) {
    const code = s.charCodeAt(i);
    // Skip Arabic diacritics (tashkeel + dagger alif)
    if ((code >= 0x064B && code <= 0x065F) || code === 0x0670) continue;
    let ch = s[i];
    // Alif variants -> bare alif
    if (code === 0x0623 || code === 0x0625 || code === 0x0622) ch = '\u0627';
    // taa marbouta -> haa
    else if (code === 0x0629) ch = '\u0647';
    // alif maksura -> yaa
    else if (code === 0x0649) ch = '\u064A';
    out += ch;
  }
  return out.toLowerCase();
}

function matches(text: string, triggers: string[]): boolean {
  const n = normalizeArabic(text);
  return triggers.some((t) => n.includes(normalizeArabic(t)));
}

// ──────────────────────────────────────────────────────
// Type emoji + label map
// ──────────────────────────────────────────────────────
const TYPE_META: Record<string, { emoji: string; label: string }> = {
  public: { emoji: '🏛️', label: 'حكومية' },
  private: { emoji: '🏢', label: 'خاصة' },
  branch: { emoji: '🌐', label: 'فرع دولي' },
  military: { emoji: '⚔️', label: 'عسكرية' },
  vocational: { emoji: '🛠️', label: 'مهنية' },
};

interface UniRow {
  slug: string;
  name_ar: string;
  short_name: string | null;
  type: string;
  location: string | null;
  is_active: boolean;
  closing_note: string | null;
}

// ──────────────────────────────────────────────────────
// Format helpers
// ──────────────────────────────────────────────────────
function formatGroup(rows: UniRow[]): string[] {
  return rows.map((u) => {
    const meta = TYPE_META[u.type] || { emoji: '🎓', label: u.type };
    let line = `• ${meta.emoji} **${u.name_ar}**`;
    if (u.short_name) line += ` (${u.short_name})`;
    if (u.location) line += ` — ${u.location}`;
    if (!u.is_active && u.closing_note) line += ` ⚠️ ${u.closing_note}`;
    return line;
  });
}

// ──────────────────────────────────────────────────────
// Main entry point
// ──────────────────────────────────────────────────────
export async function tryDbListResponse(userText: string): Promise<DbListResponse | null> {
  // Match-first: avoid creating client unless needed
  const isMilitary = matches(userText, MILITARY_TRIGGERS);
  const isList = matches(userText, LIST_TRIGGERS);
  if (!isMilitary && !isList) {
    console.info('[db-list-handler] no trigger matched for input');
    return null;
  }

  // Create client lazily via the explicit factory (works at runtime in any route).
  let client;
  try {
    client = getSupabaseServerClient();
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('[db-list-handler] getSupabaseServerClient failed:', msg);
    return null;
  }

  // ── 1. Military colleges only ────────────────────────
  if (isMilitary) {
    try {
      const { data, error } = await client
        .from('universities')
        .select('slug, name_ar, short_name, type, location, is_active, closing_note')
        .eq('type', 'military')
        .eq('is_active', true)
        .order('name_ar');

      if (error) {
        console.error('[db-list-handler] military query error:', error.message);
        return null;
      }
      if (!data || data.length === 0) {
        console.info('[db-list-handler] military query returned 0 rows');
        return null;
      }

      const lines = formatGroup(data as UniRow[]);
      const text = `⚔️ **الكليات العسكرية في قطر** (${data.length})\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n${lines.join('\n')}\n\n💡 **اكتب اسم الكلية للتفاصيل** (مثل: "الكلية الجوية" أو "البحرية")\n\n📊 **المصدر:** قاعدة بيانات أذكياء — محدَّثة 2026-04-26`;

      return {
        text,
        suggestions: ['شروط القبول العسكرية', 'الفرق بين الكليات الخمس', 'البرامج المتاحة'],
        source: 'db',
        count: data.length,
      };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error('[db-list-handler] military query exception:', msg);
      return null;
    }
  }

  // ── 2. All universities list ─────────────────────────
  if (isList) {
    try {
      const { data, error } = await client
        .from('universities')
        .select('slug, name_ar, short_name, type, location, is_active, closing_note')
        .eq('is_active', true)
        .order('type')
        .order('name_ar');

      if (error) {
        console.error('[db-list-handler] list query error:', error.message);
        return null;
      }
      if (!data || data.length === 0) {
        console.info('[db-list-handler] list query returned 0 rows');
        return null;
      }

      const rows = data as UniRow[];
      const grouped: Record<string, UniRow[]> = {};
      for (const r of rows) {
        if (!grouped[r.type]) grouped[r.type] = [];
        grouped[r.type].push(r);
      }

      const sections: string[] = [];
      const order: string[] = ['public', 'branch', 'private', 'military', 'vocational'];
      for (const type of order) {
        const group = grouped[type];
        if (!group || group.length === 0) continue;
        const meta = TYPE_META[type];
        sections.push(`**${meta.emoji} ${meta.label} (${group.length}):**\n${formatGroup(group).join('\n')}`);
      }

      const text = `🎓 **جميع الجامعات والمؤسسات في قطر** — ${rows.length} مؤسسة\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n${sections.join('\n\n')}\n\n💡 **اكتب اسم الجامعة للتفاصيل الكاملة**\n\n📊 **المصدر:** قاعدة بيانات أذكياء — محدَّثة 2026-04-26`;

      return {
        text,
        suggestions: ['جامعة قطر — تفاصيل', 'الكليات العسكرية', 'الجامعات الحكومية فقط'],
        source: 'db',
        count: rows.length,
      };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error('[db-list-handler] list query exception:', msg);
      return null;
    }
  }

  return null;
}
