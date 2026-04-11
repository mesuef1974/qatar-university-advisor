/**
 * Shared category keyword map — single source of truth.
 * Used by: knowledge-base.js, db-context.ts
 *
 * Each key maps to an array of Arabic keywords that signal a question
 * belongs to that category.
 */
export const CATEGORY_KEYWORDS: Record<string, string[]> = {
  universities: [
    'جامعة', 'كلية', 'معهد', 'hbku', 'qu', 'udst', 'cmu', 'cornell',
    'georgetown', 'تسجيل', 'ملتحق',
  ],
  scholarships: [
    'منحة', 'منح', 'ابتعاث', 'بعثة', 'سبونسر', 'راعي', 'رعاية',
    'طموح', 'أميري', 'مكافأة',
  ],
  salary: [
    'راتب', 'رواتب', 'أجر', 'مرتب', 'دخل', 'كسب', 'توظيف',
    'وظيفة', 'وظائف', 'مهنة', 'عمل',
  ],
  admission: [
    'معدل', 'قبول', 'شروط', 'متطلبات', 'تقديم', 'درجة', 'نسبة', 'احتمال',
  ],
  programs: [
    'تخصص', 'برنامج', 'دراسة', 'هندسة', 'طب', 'قانون', 'أعمال',
    'علوم', 'حاسوب', 'خطة',
  ],
  military: ['عسكري', 'جيش', 'شرطة', 'دفاع', 'أركان', 'ضابط'],
};

/**
 * Detect the primary category of an Arabic text query.
 * Returns 'general' if no category keyword is found.
 */
export function detectCategory(text: string): string {
  const normalized = text.toLowerCase();
  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (keywords.some((kw) => normalized.includes(kw))) {
      return category;
    }
  }
  return 'general';
}
