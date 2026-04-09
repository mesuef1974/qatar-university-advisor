/**
 * Smart Search Engine — Qatar University Advisor
 * ══════════════════════════════════════════════════
 * محرك بحث ذكي يحلل أسئلة المستخدم ويطابقها مع بيانات الجامعات
 * يدعم اللهجة الخليجية + المرادفات + كشف النية + تصفية بالمعدل والجنسية
 *
 * Azkia | FAANG Standards
 */

import keywordDictionary from '../data/keyword-dictionary.json';

// ────────────────────────────────────────────────────────────────────────────
// Types
// ────────────────────────────────────────────────────────────────────────────

export interface SearchQuery {
  rawText: string;
  normalizedText: string;
  intent: string;
  major?: string;
  gpa?: number;
  nationality?: 'qatari' | 'non_qatari';
  costPreference?: string;
  keywords: string[];
}

export interface SearchResult {
  id: string;
  university: Record<string, unknown>;
  matchScore: number;
  matchReasons: string[];
}

interface SearchIndex {
  aliases: string[];
  majorKeywords: string[];
  features: string[];
  costCategory: string;
}

type IntentPatterns = Record<string, { ar: string[]; en: string[] }>;
type MajorSynonyms = Record<string, string[]>;
type DialectMap = Record<string, string>;
type CostCategories = Record<string, { label: string; keywords?: string[]; min?: number; max?: number }>;

// ────────────────────────────────────────────────────────────────────────────
// Dictionary references (typed from JSON)
// ────────────────────────────────────────────────────────────────────────────
const intentPatterns = keywordDictionary.intentPatterns as IntentPatterns;
const majorSynonyms = keywordDictionary.majorSynonyms as MajorSynonyms;
const dialectMap = keywordDictionary.dialectMap as DialectMap;
const costCategories = keywordDictionary.costCategories as CostCategories;

// ────────────────────────────────────────────────────────────────────────────
// 1. parseQuery — تحليل السؤال واستخراج النية والفلاتر
// ────────────────────────────────────────────────────────────────────────────

export function parseQuery(text: string): SearchQuery {
  const rawText = text.trim();
  let normalized = rawText.toLowerCase();

  // تطبيق dialectMap — تحويل اللهجة للفصحى
  for (const [dialect, formal] of Object.entries(dialectMap)) {
    const regex = new RegExp(`\\b${escapeRegex(dialect)}\\b`, 'gi');
    normalized = normalized.replace(regex, formal);
  }

  // كشف النية
  const intent = detectIntent(normalized);

  // استخراج التخصص
  const major = detectMajor(normalized);

  // استخراج المعدل — regex for numbers like 85, 85%, 3.5
  const gpa = extractGPA(normalized);

  // استخراج الجنسية
  const nationality = detectNationality(normalized);

  // استخراج تفضيل التكلفة
  const costPreference = detectCostPreference(normalized);

  // استخراج الكلمات المفتاحية (كلمات مهمة بعد تصفية الأدوات)
  const keywords = extractKeywords(normalized);

  return {
    rawText,
    normalizedText: normalized,
    intent,
    major: major || undefined,
    gpa: gpa || undefined,
    nationality: nationality || undefined,
    costPreference: costPreference || undefined,
    keywords,
  };
}

// ────────────────────────────────────────────────────────────────────────────
// 2. searchUniversities — بحث ومطابقة
// ────────────────────────────────────────────────────────────────────────────

export function searchUniversities(
  query: SearchQuery,
  universities: Record<string, Record<string, unknown>>
): SearchResult[] {
  const results: SearchResult[] = [];

  for (const [id, uni] of Object.entries(universities)) {
    const searchIndex = uni.searchIndex as SearchIndex | undefined;
    if (!searchIndex) continue;

    let score = 0;
    const reasons: string[] = [];

    // 1. مطابقة الاسم / الأسماء البديلة (+20)
    const aliasMatch = matchAliases(query, searchIndex, uni);
    if (aliasMatch) {
      score += 20;
      reasons.push(aliasMatch);
    }

    // 2. مطابقة التخصص (+40)
    if (query.major) {
      const majorMatch = matchMajor(query.major, searchIndex);
      if (majorMatch) {
        score += 40;
        reasons.push(majorMatch);
      }
    }

    // 3. مطابقة الكلمات المفتاحية العامة (+5 لكل كلمة، حد أقصى 25)
    const kwScore = matchKeywords(query.keywords, searchIndex, uni);
    if (kwScore > 0) {
      score += Math.min(kwScore, 25);
      reasons.push(`تطابق كلمات مفتاحية (${Math.min(kwScore, 25)} نقطة)`);
    }

    // 4. مطابقة المعدل — الجامعة تقبل هذا المعدل (+25)
    if (query.gpa) {
      const gpaMatch = matchGPA(query.gpa, query.nationality, uni);
      if (gpaMatch === true) {
        score += 25;
        reasons.push(`المعدل ${query.gpa}% يكفي للقبول`);
      } else if (gpaMatch === false) {
        // المعدل لا يكفي - خصم
        score -= 10;
        reasons.push(`المعدل ${query.gpa}% قد لا يكفي`);
      }
      // null = لا بيانات عن المعدل
    }

    // 5. مطابقة الميزات (+3 لكل ميزة، حد أقصى 15)
    const featureScore = matchFeatures(query, searchIndex);
    if (featureScore > 0) {
      score += Math.min(featureScore, 15);
      reasons.push(`ميزات متطابقة (${Math.min(featureScore, 15)} نقطة)`);
    }

    // 6. مطابقة التكلفة (+10)
    if (query.costPreference) {
      const costMatch = matchCost(query.costPreference, query.nationality, searchIndex);
      if (costMatch) {
        score += 10;
        reasons.push(costMatch);
      }
    }

    if (score > 0) {
      results.push({ id, university: uni, matchScore: score, matchReasons: reasons });
    }
  }

  return rankResults(results);
}

// ────────────────────────────────────────────────────────────────────────────
// 3. rankResults — ترتيب بالتطابق تنازلياً
// ────────────────────────────────────────────────────────────────────────────

function rankResults(results: SearchResult[]): SearchResult[] {
  return results.sort((a, b) => b.matchScore - a.matchScore);
}

// ────────────────────────────────────────────────────────────────────────────
// 4. formatSmartResponse — تنسيق الرد من نتائج البحث
// ────────────────────────────────────────────────────────────────────────────

export function formatSmartResponse(
  query: SearchQuery,
  results: SearchResult[]
): { text: string; suggestions: string[] } | null {
  if (results.length === 0) return null;

  // الحد الأقصى 5 نتائج
  const top = results.slice(0, 5);

  let text = '';

  // رد حسب النية
  if (query.intent === 'check_admission' && query.gpa) {
    text = formatAdmissionResponse(query, top);
  } else if (query.intent === 'find_scholarship') {
    text = formatScholarshipResponse(top);
  } else if (query.intent === 'cost_info') {
    text = formatCostResponse(top);
  } else if (query.intent === 'deadline_info') {
    text = formatDeadlineResponse(top);
  } else if (query.intent === 'major_info' && query.major) {
    text = formatMajorResponse(query.major, top);
  } else {
    text = formatGeneralResponse(query, top);
  }

  // اقتراحات ذكية
  const suggestions = generateSuggestions(query, top);

  return { text, suggestions };
}

// ────────────────────────────────────────────────────────────────────────────
// Internal helpers
// ────────────────────────────────────────────────────────────────────────────

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function detectIntent(text: string): string {
  let bestIntent = 'find_university';
  let bestScore = 0;

  for (const [intent, patterns] of Object.entries(intentPatterns)) {
    const allPatterns = [...patterns.ar, ...patterns.en];
    let score = 0;
    for (const pattern of allPatterns) {
      if (text.includes(pattern.toLowerCase())) {
        score += pattern.length; // كلمات أطول = ثقة أعلى
      }
    }
    if (score > bestScore) {
      bestScore = score;
      bestIntent = intent;
    }
  }

  return bestIntent;
}

function detectMajor(text: string): string | null {
  let bestMajor: string | null = null;
  let bestScore = 0;

  for (const [major, synonyms] of Object.entries(majorSynonyms)) {
    for (const syn of synonyms) {
      if (text.includes(syn.toLowerCase())) {
        const score = syn.length;
        if (score > bestScore) {
          bestScore = score;
          bestMajor = major;
        }
      }
    }
  }

  return bestMajor;
}

function extractGPA(text: string): number | null {
  // Match patterns: "معدلي 85", "85%", "معدل 90", "3.5 GPA"
  const percentMatch = text.match(/(\d{2,3})\s*%/);
  if (percentMatch) return parseInt(percentMatch[1], 10);

  const gradeMatch = text.match(/معدل[يه]?\s*(\d{2,3})/);
  if (gradeMatch) return parseInt(gradeMatch[1], 10);

  const gpaMatch = text.match(/(\d{2,3})\s*(?:معدل|درجة|نسبة)/);
  if (gpaMatch) return parseInt(gpaMatch[1], 10);

  // Standalone 2-3 digit number that looks like a GPA (60-100)
  const standaloneMatch = text.match(/\b(\d{2,3})\b/);
  if (standaloneMatch) {
    const val = parseInt(standaloneMatch[1], 10);
    if (val >= 50 && val <= 100) return val;
  }

  return null;
}

function detectNationality(text: string): 'qatari' | 'non_qatari' | null {
  const qatariPatterns = ['قطري', 'مواطن', 'قطرية', 'qatari'];
  const nonQatariPatterns = ['مقيم', 'وافد', 'غير قطري', 'أجنبي', 'non-qatari', 'non qatari', 'expat', 'مقيمة', 'وافدة'];

  for (const p of nonQatariPatterns) {
    if (text.includes(p)) return 'non_qatari';
  }
  for (const p of qatariPatterns) {
    if (text.includes(p)) return 'qatari';
  }
  return null;
}

function detectCostPreference(text: string): string | null {
  for (const [category, info] of Object.entries(costCategories)) {
    if (info.keywords) {
      for (const kw of info.keywords) {
        if (text.includes(kw.toLowerCase())) return category;
      }
    }
  }

  if (text.includes('أرخص') || text.includes('رخيص') || text.includes('أقل تكلفة') || text.includes('cheap')) {
    return 'low';
  }

  return null;
}

function extractKeywords(text: string): string[] {
  // أدوات وحروف عربية شائعة نتجاهلها
  const stopWords = new Set([
    'في', 'من', 'على', 'إلى', 'عن', 'هل', 'ما', 'هذا', 'هذه', 'أنا', 'أنت',
    'لا', 'نعم', 'يا', 'أو', 'و', 'ثم', 'لكن', 'إذا', 'كان', 'هو', 'هي',
    'أريد', 'أحتاج', 'أين', 'كيف', 'لـ', 'جيد', 'إذاً', 'هيا', 'ليس',
    'the', 'a', 'an', 'is', 'are', 'in', 'for', 'to', 'of', 'and', 'or',
    'i', 'my', 'me', 'can', 'do', 'what', 'which', 'how', 'where',
  ]);

  return text
    .split(/[\s,،.؟?!]+/)
    .filter(w => w.length > 1 && !stopWords.has(w));
}

function matchAliases(
  query: SearchQuery,
  searchIndex: SearchIndex,
  uni: Record<string, unknown>
): string | null {
  const text = query.normalizedText;
  const nameAr = (uni.nameAr as string || '').toLowerCase();
  const nameEn = (uni.nameEn as string || '').toLowerCase();

  // Direct name match
  if (text.includes(nameAr) || text.includes(nameEn)) {
    return `تطابق اسم الجامعة: ${uni.nameAr}`;
  }

  // Alias match
  for (const alias of searchIndex.aliases) {
    if (text.includes(alias.toLowerCase())) {
      return `تطابق اسم بديل: ${alias}`;
    }
  }

  return null;
}

function matchMajor(major: string, searchIndex: SearchIndex): string | null {
  // Check majorKeywords
  const majorSyns = majorSynonyms[major] || [major];

  for (const syn of majorSyns) {
    for (const kw of searchIndex.majorKeywords) {
      if (kw.toLowerCase().includes(syn.toLowerCase()) || syn.toLowerCase().includes(kw.toLowerCase())) {
        return `تخصص "${major}" متوفر`;
      }
    }
  }

  return null;
}

function matchKeywords(keywords: string[], searchIndex: SearchIndex, uni: Record<string, unknown>): number {
  let score = 0;
  const uniKeywords = (uni.keywords as string[] || []).map(k => k.toLowerCase());
  const allIndexWords = [
    ...searchIndex.aliases,
    ...searchIndex.majorKeywords,
    ...searchIndex.features,
    ...uniKeywords,
  ].map(w => w.toLowerCase());

  for (const kw of keywords) {
    for (const indexWord of allIndexWords) {
      if (indexWord.includes(kw) || kw.includes(indexWord)) {
        score += 5;
        break;
      }
    }
  }

  return score;
}

function matchGPA(
  gpa: number,
  nationality: 'qatari' | 'non_qatari' | undefined,
  uni: Record<string, unknown>
): boolean | null {
  const reqs = uni.admissionRequirements as Record<string, unknown> | undefined;
  if (!reqs) return null;

  const nat = nationality || 'qatari';

  if (nat === 'qatari' && reqs.qatari) {
    const qReqs = reqs.qatari as Record<string, unknown>;
    const minGPA = qReqs.minGPA as number | undefined;
    if (typeof minGPA === 'number') {
      return gpa >= minGPA;
    }
  }

  if (nat === 'non_qatari' && reqs.nonQatari) {
    const nqReqs = reqs.nonQatari as Record<string, unknown>;
    const minGPA = nqReqs.minGPA as number | undefined;
    if (typeof minGPA === 'number') {
      return gpa >= minGPA;
    }
  }

  return null;
}

function matchFeatures(query: SearchQuery, searchIndex: SearchIndex): number {
  let score = 0;
  const text = query.normalizedText;

  for (const feature of searchIndex.features) {
    if (text.includes(feature.toLowerCase())) {
      score += 3;
    }
  }

  // Nationality-specific feature matching
  if (query.nationality === 'qatari') {
    for (const feature of searchIndex.features) {
      if (feature.includes('مجاني للقطريين') || feature.includes('قطري')) {
        score += 3;
      }
    }
  }

  return score;
}

function matchCost(costPref: string, nationality: 'qatari' | 'non_qatari' | undefined, searchIndex: SearchIndex): string | null {
  if (costPref === 'free' && searchIndex.costCategory === 'free_qatari' && nationality !== 'non_qatari') {
    return 'مجاني للقطريين';
  }
  if (costPref === 'low' && (searchIndex.costCategory === 'low' || searchIndex.costCategory === 'free_qatari')) {
    return 'تكلفة منخفضة';
  }
  if (costPref === 'free' || costPref === 'low') {
    if (searchIndex.costCategory === 'free_qatari' || searchIndex.costCategory === 'low') {
      return 'تكلفة مناسبة';
    }
  }
  return null;
}

// ────────────────────────────────────────────────────────────────────────────
// Response formatters
// ────────────────────────────────────────────────────────────────────────────

function formatAdmissionResponse(query: SearchQuery, results: SearchResult[]): string {
  const gpa = query.gpa!;
  const natLabel = query.nationality === 'non_qatari' ? 'مقيم' : 'قطري';
  let text = `بناءً على معدلك **${gpa}%** (${natLabel})، إليك الجامعات المتاحة:\n\n`;

  for (const r of results) {
    const uni = r.university;
    const nameAr = uni.nameAr as string;
    const reqs = uni.admissionRequirements as Record<string, unknown> | undefined;
    let minGPA = '—';
    if (reqs) {
      const nat = query.nationality === 'non_qatari' ? 'nonQatari' : 'qatari';
      const natReqs = reqs[nat] as Record<string, unknown> | undefined;
      if (natReqs?.minGPA) minGPA = `${natReqs.minGPA}%`;
    }
    const check = r.matchReasons.some(r => r.includes('يكفي')) ? '✅' : '⚠️';
    text += `${check} **${nameAr}** — الحد الأدنى: ${minGPA}\n`;
    if (query.major) {
      const majorMatch = r.matchReasons.find(r => r.includes('تخصص'));
      if (majorMatch) text += `   📚 ${majorMatch}\n`;
    }
    text += '\n';
  }

  return text;
}

function formatScholarshipResponse(results: SearchResult[]): string {
  let text = 'إليك الجامعات التي توفر منح دراسية:\n\n';

  for (const r of results) {
    const uni = r.university;
    const nameAr = uni.nameAr as string;
    const scholarships = uni.scholarships as Record<string, unknown> | string | undefined;
    text += `🎓 **${nameAr}**\n`;
    if (typeof scholarships === 'string') {
      text += `   ${scholarships}\n`;
    } else if (scholarships) {
      const entries = Object.entries(scholarships).slice(0, 3);
      for (const [, val] of entries) {
        if (typeof val === 'string') text += `   • ${val}\n`;
      }
    }
    text += '\n';
  }

  return text;
}

function formatCostResponse(results: SearchResult[]): string {
  let text = 'إليك معلومات الرسوم الدراسية:\n\n';

  for (const r of results) {
    const uni = r.university;
    const nameAr = uni.nameAr as string;
    const fees = uni.tuitionFees as Record<string, unknown> | undefined;
    text += `💰 **${nameAr}**\n`;
    if (fees) {
      if (fees.qatariNote) text += `   القطريون: ${fees.qatariNote}\n`;
      else if (fees.qatari && typeof fees.qatari === 'string') text += `   القطريون: ${fees.qatari}\n`;
      if (fees.perYear) text += `   الرسوم: ${fees.perYear}\n`;
      if (fees.note) text += `   ملاحظة: ${fees.note}\n`;
    }
    text += '\n';
  }

  return text;
}

function formatDeadlineResponse(results: SearchResult[]): string {
  let text = 'إليك مواعيد التقديم:\n\n';

  for (const r of results) {
    const uni = r.university;
    const nameAr = uni.nameAr as string;
    const deadlines = uni.applicationDeadlines as Record<string, unknown> | string | undefined;
    text += `📅 **${nameAr}**\n`;
    if (typeof deadlines === 'string') {
      text += `   ${deadlines}\n`;
    } else if (deadlines) {
      if (deadlines.fall) text += `   خريف: ${deadlines.fall}\n`;
      if (deadlines.spring) text += `   ربيع: ${deadlines.spring}\n`;
      if (deadlines.note) text += `   ملاحظة: ${deadlines.note}\n`;
    }
    text += '\n';
  }

  return text;
}

function formatMajorResponse(major: string, results: SearchResult[]): string {
  const majorLabel = major.replace(/_/g, ' ');
  let text = `الجامعات التي توفر تخصص **${majorLabel}** في قطر:\n\n`;

  for (const r of results) {
    const uni = r.university;
    const nameAr = uni.nameAr as string;
    const type = uni.type as string;
    text += `🏫 **${nameAr}** (${type})\n`;

    // Extract specific matching programs
    const reqs = uni.admissionRequirements as Record<string, unknown> | undefined;
    if (reqs?.qatari) {
      const qReqs = reqs.qatari as Record<string, unknown>;
      if (qReqs.minGPA) text += `   الحد الأدنى: ${qReqs.minGPA}%\n`;
    }
    const website = uni.website as string;
    if (website) text += `   🔗 ${website}\n`;
    text += '\n';
  }

  return text;
}

function formatGeneralResponse(query: SearchQuery, results: SearchResult[]): string {
  let text = '';

  if (results.length === 1) {
    const r = results[0];
    const uni = r.university;
    const nameAr = uni.nameAr as string;
    const nameEn = uni.nameEn as string;
    const type = uni.type as string;
    const location = uni.location as string;
    const website = uni.website as string;

    text = `**${nameAr}** (${nameEn})\n`;
    text += `📍 ${location} | ${type}\n`;
    if (website) text += `🔗 ${website}\n\n`;

    // Colleges
    const colleges = uni.colleges as Array<Record<string, unknown>> | undefined;
    if (colleges && colleges.length > 0) {
      text += '**الكليات والتخصصات:**\n';
      for (const college of colleges.slice(0, 5)) {
        const cName = (college.name as string) || (college.nameEn as string) || '';
        text += `• ${cName}\n`;
      }
      if (colleges.length > 5) text += `• ... و${colleges.length - 5} كليات أخرى\n`;
      text += '\n';
    }

    // Admission
    const reqs = uni.admissionRequirements as Record<string, unknown> | undefined;
    if (reqs) {
      text += '**شروط القبول:**\n';
      if (reqs.qatari) {
        const qr = reqs.qatari as Record<string, unknown>;
        if (qr.minGPA) text += `• القطريون: معدل ${qr.minGPA}%+\n`;
      }
      if (reqs.nonQatari) {
        const nqr = reqs.nonQatari as Record<string, unknown>;
        if (nqr.minGPA) text += `• المقيمون: معدل ${nqr.minGPA}%+\n`;
      }
      text += '\n';
    }
  } else {
    text = 'إليك أبرز الجامعات المطابقة:\n\n';
    for (const r of results) {
      const uni = r.university;
      const nameAr = uni.nameAr as string;
      const type = uni.type as string;
      const reasons = r.matchReasons.slice(0, 2).join(' | ');
      text += `🏫 **${nameAr}** (${type})\n   ${reasons}\n\n`;
    }
  }

  return text;
}

function generateSuggestions(query: SearchQuery, results: SearchResult[]): string[] {
  const suggestions: string[] = [];

  if (results.length > 0) {
    const topUni = results[0].university.nameAr as string;
    suggestions.push(`شروط ${topUni}`);
  }

  if (query.major) {
    suggestions.push(`رسوم ${query.major.replace(/_/g, ' ')}`);
  }

  if (!query.gpa) {
    suggestions.push('هل معدلي يكفي؟');
  }

  suggestions.push('المنح والابتعاث');

  if (suggestions.length < 3) {
    suggestions.push('جميع الجامعات');
  }

  return suggestions.slice(0, 3);
}
