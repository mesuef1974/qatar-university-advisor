/**
 * AI System Prompt Builder — Qatar University Advisor
 * ══════════════════════════════════════════════════════
 * يبني system prompt لـ Claude مع بيانات الجامعات الحقيقية
 * من universities.json — مصدر الحقيقة الوحيد.
 *
 * الهدف: Claude يجيب من البيانات الفعلية وليس من معرفته العامة.
 *
 * شركة أذكياء للبرمجيات | Azkia
 */

import { readFileSync } from 'fs';
import { join } from 'path';
import { getDialectSystemPromptAddition } from './dialect-support.js';

/**
 * يبني ملخص قاعدة بيانات الجامعات من universities.json
 * @returns {string} ملخص نصي لجميع الجامعات والمنح
 */
function buildDatabaseSummary() {
  try {
    const raw = readFileSync(join(process.cwd(), 'data', 'universities.json'), 'utf-8');
    const data = JSON.parse(raw);
    const unis = data.universities || {};

    // ── بناء ملخص الجامعات ──
    const uniLines = Object.entries(unis).map(([id, u]) => {
      const name = `${u.nameAr} (${u.nameEn})`;
      const type = u.type || '';
      const location = u.location || '';

      // استخراج شروط القبول
      let admissionInfo = '';
      const req = u.admissionRequirements || {};
      if (req.qatari) {
        admissionInfo += `قطري: معدل ${req.qatari.minGPA || req.qatari.scientificTrack?.minGPA || '—'}%+`;
        if (req.qatari.notes) admissionInfo += ` (${req.qatari.notes})`;
      }
      if (req.nonQatari) {
        admissionInfo += admissionInfo ? ' | ' : '';
        admissionInfo += `غير قطري: معدل ${req.nonQatari.minGPA || '—'}%+`;
      }
      if (req.gpa) admissionInfo = `معدل ${req.gpa}`;
      if (req.sat) admissionInfo += `, ${req.sat}`;
      if (req.english || req.ielts) admissionInfo += `, إنجليزي: ${req.english || `IELTS ${req.ielts}+`}`;

      // البرامج/الكليات
      const programs = u.programs || u.colleges || [];
      const programList = programs.slice(0, 6).join('، ');

      // الرسوم
      let tuitionInfo = '';
      const fees = u.tuitionFees || u.tuition || {};
      if (fees.qatari === 0) tuitionInfo += 'مجاني للقطريين';
      else if (fees.qatari) tuitionInfo += `قطري: ${fees.qatari}`;
      if (fees.nonQatari) {
        const nq = typeof fees.nonQatari === 'object'
          ? (fees.nonQatari.perYear || fees.nonQatari.perCredit || '')
          : fees.nonQatari;
        tuitionInfo += tuitionInfo ? ` | غير قطري: ${nq}` : `رسوم: ${nq}`;
      }
      if (fees.perYear) tuitionInfo += tuitionInfo ? ` | ${fees.perYear}` : `رسوم: ${fees.perYear}`;
      if (fees.international) tuitionInfo += tuitionInfo ? ` | دولي: ${fees.international}` : `دولي: ${fees.international}`;

      // المنح
      let scholInfo = '';
      const schol = u.scholarships || {};
      if (typeof schol === 'string') {
        scholInfo = schol;
      } else {
        const parts = [];
        if (schol.qatari) {
          const q = typeof schol.qatari === 'object' ? schol.qatari.name || schol.qatari.coverage || '' : schol.qatari;
          parts.push(`قطري: ${q}`);
        }
        if (schol.nonQatari) {
          const nq = typeof schol.nonQatari === 'object' ? schol.nonQatari.name || '' : schol.nonQatari;
          if (nq) parts.push(`غير قطري: ${nq}`);
        }
        if (schol.merit) parts.push(`جدارة: ${schol.merit}`);
        if (schol.financial) parts.push(`مالية: ${schol.financial}`);
        scholInfo = parts.join(' | ');
      }

      // المواعيد
      let deadlineInfo = '';
      const deadlines = u.applicationDeadlines || {};
      if (typeof deadlines === 'string') {
        deadlineInfo = deadlines;
      } else if (deadlines.fallSemester2026) {
        deadlineInfo = `فتح: ${deadlines.fallSemester2026.open} — إغلاق: ${deadlines.fallSemester2026.close}`;
      }

      // تجميع
      let line = `### ${id}: ${name}\n`;
      line += `  النوع: ${type} | الموقع: ${location}\n`;
      if (admissionInfo) line += `  القبول: ${admissionInfo}\n`;
      if (programList) line += `  البرامج: ${programList}\n`;
      if (tuitionInfo) line += `  الرسوم: ${tuitionInfo}\n`;
      if (scholInfo) line += `  المنح: ${scholInfo}\n`;
      if (deadlineInfo) line += `  المواعيد: ${deadlineInfo}\n`;
      line += `  الموقع: ${u.website || '—'}`;
      return line;
    });

    // ── بناء ملخص المنح الحكومية ──
    const scholarships = data.governmentScholarships || {};
    const scholLines = Object.entries(scholarships).map(([_id, s]) => {
      const coverage = Array.isArray(s.coverage) ? s.coverage.join('، ') : (s.coverage || '');
      let line = `- ${s.nameAr} (${s.provider || ''})`;
      if (s.eligibility) line += `: ${s.eligibility}`;
      if (coverage) line += ` — التغطية: ${coverage}`;
      if (s.gpaRequired) line += ` — معدل ${s.gpaRequired}%+`;
      if (s.deadline) line += ` — الموعد: ${s.deadline}`;
      if (s.tracks) line += ` — التخصصات: ${s.tracks.join('، ')}`;
      return line;
    });

    // ── الأجوبة السريعة ──
    const quickAnswers = data.quickAnswers || {};
    const qaLines = Object.entries(quickAnswers).map(([q, a]) => `س: ${q}\nج: ${a}`);

    return [
      '## بيانات الجامعات (مصدر الحقيقة — universities.json):',
      uniLines.join('\n\n'),
      '\n## المنح الحكومية والابتعاث:',
      scholLines.join('\n'),
      '\n## أجوبة سريعة معتمدة:',
      qaLines.join('\n'),
    ].join('\n');
  } catch (e) {
    console.error('[ai-system-prompt] Failed to load universities.json:', e?.message);
    return '(قاعدة البيانات غير متاحة حالياً — أجب من معرفتك العامة بحذر)';
  }
}

/**
 * يبني System Prompt الكامل مع بيانات الجامعات الحقيقية
 * @param {string} [nationality] - 'qatari' | 'non_qatari' | undefined
 * @param {string} [dbContext] - سياق جاهز من Supabase (مصدر الحقيقة الأول).
 *                               إذا غاب، يُقرأ الاحتياط من universities.json.
 * @returns {string} system prompt غني بالبيانات
 */
export function buildSystemPrompt(nationality, dbContext) {
  const dbSummary = dbContext || buildDatabaseSummary();

  const nationalityContext = nationality === 'qatari'
    ? 'المستخدم قطري الجنسية — ركّز على المنح القطرية والمزايا الحكومية.'
    : nationality === 'non_qatari'
      ? 'المستخدم مقيم في قطر (غير قطري) — ركّز على شروط القبول لغير القطريين والرسوم.'
      : 'جنسية المستخدم غير محددة — اذكر الخيارات للقطريين والمقيمين معاً.';

  return `أنت "مُرشِدي" — المستشار الجامعي القطري الذكي.
تتحدث مع أشخاص متنوعين: طلاب ثانوية، أولياء أمور، طلاب جامعيين، خريجين.

═══════════════════════════════════════════════════════
هويتك وقواعدك الأساسية
═══════════════════════════════════════════════════════
1. أنت "مُرشِدي" — لا تذكر أنك Claude أو Anthropic أو أي نموذج ذكاء اصطناعي
2. أجب بالعربية الفصحى البسيطة دائماً — ودية ومهنية
3. كن مختصراً ومفيداً (3-7 أسطر عادةً، لا تتجاوز 2500 حرف)
4. ${nationalityContext}

═══════════════════════════════════════════════════════
مصدر الحقيقة — البيانات أدناه هي المرجع الأساسي
═══════════════════════════════════════════════════════
** استخدم البيانات التالية كمصدر حقيقة وحيد ولا تستخدم أي معلومات من خارجه. لا تختلق أرقاماً. **
** إذا لم تجد المعلومة في البيانات أعلاه، قل بوضوح: لا تتوفر لدي هذه المعلومة حالياً. أنصحك بزيارة الموقع الرسمي للجامعة. ثم اقترح جامعة مشابهة من البيانات المتاحة. **

${dbSummary}

═══════════════════════════════════════════════════════
أسلوب الحوار الذكي
═══════════════════════════════════════════════════════
• إذا ظهر [معلومات المتحدث: ...] في بداية السؤال، استخدمها لتخصيص ردك
• لولي الأمر: تحدث بصيغة "ابنك/ابنتك" وركز على ما يهم الأهل
• للطالب الثانوي: ركز على الجامعات المناسبة لمعدله ومساره
• للخريج والدراسات العليا: ركز على HBKU وبرامج الماجستير
• وجّه المحادثة نحو: التخصص المناسب ← الجامعة ← المنح/السبونسرز

═══════════════════════════════════════════════════════
تخصصات المستقبل — الأعلى طلباً في قطر 2026-2031
═══════════════════════════════════════════════════════
• الذكاء الاصطناعي وعلوم البيانات: نمو 35%+ سنوياً، رواتب 20-35K
• الأمن السيبراني: نقص حاد، رواتب 18-30K
• الطاقة المتجددة والهيدروجين: رؤية 2030 تدعمه
• الرعاية الصحية الذكية: نقص أطباء متخصصين
• هندسة البترول والغاز: قطر ثالث أكبر منتج للغاز عالمياً
• التمويل الرقمي والـ Fintech: نمو متسارع

═══════════════════════════════════════════════════════
الرواتب في قطر (معفاة ضريبياً 100%)
═══════════════════════════════════════════════════════
• الطب (متخصص): 30,000 – 55,000 ريال/شهر
• هندسة البترول: 20,000 – 40,000 ريال/شهر
• ذكاء اصطناعي وبيانات: 18,000 – 35,000 ريال/شهر
• الهندسة (عامة): 14,000 – 28,000 ريال/شهر
• علوم الحاسوب: 15,000 – 30,000 ريال/شهر
• القانون والشؤون الدولية: 12,000 – 25,000 ريال/شهر
• المالية والمحاسبة: 10,000 – 22,000 ريال/شهر
• التعليم (حكومي): 10,000 – 18,000 ريال/شهر
• التصميم والإعلام: 8,000 – 18,000 ريال/شهر

═══════════════════════════════════════════════════════
المنح والابتعاث — للقطريين
═══════════════════════════════════════════════════════
• البعثة الأميرية: أفضل جامعات العالم، يغطي الكل + مكافأة
• برنامج طموح: أعزب 22,000 ريال/شهر | متزوج 25,000 ريال/شهر + رسوم+سكن+تذاكر
• الابتعاث الداخلي: مكافأة 2000-3000 ريال/شهر
• منح الشركات: قطر للطاقة (3K/شهر)، الخطوط القطرية (3.5K)، QNB (3K)، كهرماء (3.2K)، أشغال (3K)، ناقلات (3.5K)
  — جميعها تشترط العمل لديهم 4-5 سنوات بعد التخرج

═══════════════════════════════════════════════════════
قواعد الرد — إلزامية
═══════════════════════════════════════════════════════
1. الدقة: أذكر الأرقام من البيانات أعلاه — لا تختلق
2. التخصيص: خصص الرد حسب الجنسية والمعدل إن عُرفا
3. التنسيق: **غامق** للأرقام والمعلومات الحاسمة
4. الاقتراحات: في نهاية كل رد أضف سطراً فارغاً ثم 3 اقتراحات:
   كل اقتراح يبدأ بـ • ولا يتجاوز 25 حرفاً
5. إذا خرج السؤال عن التعليم في قطر: "أنا متخصص في الإرشاد الجامعي القطري فقط"
6. بعد الإجابة، اقترح الخطوة التالية في رحلة الطالب

مثال على اقتراحات صحيحة:
• شروط قبول HBKU
• رواتب هندسة البترول
• منح الشركات للقطريين

${getDialectSystemPromptAddition()}`;
}
