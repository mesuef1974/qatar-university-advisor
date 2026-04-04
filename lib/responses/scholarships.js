/**
 * Scholarships Module — Qatar University Advisor
 * مُستخرج من findResponse.js كجزء من تقسيم God File
 * T-Q7-T010: تحسين قابلية الصيانة
 *
 * يشمل هذا الملف كل ما يتعلق بالمنح الدراسية والتمويل:
 * - الابتعاث الأميري (هارفارد / MIT / أكسفورد / كامبريدج)
 * - الابتعاث الخارجي والداخلي
 * - منح الشركات: قطر للطاقة، خطوط قطرية، QNB، كهرماء، أشغال، ناقلات
 * - الجهات الراعية (قائمة كاملة)
 * - منح غير القطريين / المقيمين / الوافدين
 * - قطر وغير قطري (مقارنة)
 * - HBKU (منح كاملة لجميع الجنسيات)
 */

// TODO: نقل الـ functions المتعلقة من findResponse.js لهنا
// هذا الملف جاهز للاستقبال — سيُملأ تدريجياً
//
// الـ response keys المتعلقة بهذا الملف:
//   'scholarship_amiri'          — الابتعاث الأميري
//   'scholarship_external'       — ابتعاث خارجي
//   'scholarship_internal'       — ابتعاث داخلي
//   'scholarship_qatarenergy'    — منحة قطر للطاقة (قطبك)
//   'scholarship_qatarairways'   — منحة خطوط قطرية
//   'scholarship_qnb'            — منحة QNB
//   'scholarship_kahramaa'       — منحة كهرماء
//   'scholarship_ashghal'        — منحة أشغال
//   'scholarship_nakilat'        — منحة ناقلات
//   'scholarship_non_qatari'     — منح غير القطريين / المقيمين
//   'sponsors_list'              — قائمة الجهات الراعية
//
// الـ keyword patterns المتعلقة بهذا الملف (من findResponse.js):
//   isScholarshipContext = q.includes('منح') || q.includes('ابتعاث') || q.includes('بعثة')
//   q.includes('أميري') || q.includes('البعثة الأميرية')
//   isScholarshipContext && (q.includes('هارفارد') || q.includes('mit'))
//   q.includes('ابتعاث خارجي') || (q.includes('دراسة') && q.includes('في الخارج'))
//   q.includes('ابتعاث داخلي')
//   isScholarshipContext && q.includes('قطر للطاقة')
//   isScholarshipContext && q.includes('خطوط قطرية')
//   isScholarshipContext && q.includes('qnb')
//   q.includes('كهرماء') || q.includes('كاهراما')
//   q.includes('أشغال') || q.includes('ashghal')
//   q.includes('ناقلات') || q.includes('nakilat')
//   isNonQatariKeyword && isScholarshipContext → 'scholarship_non_qatari'
//   isNonQatariGeneric (catch-all) → 'scholarship_non_qatari'
//   q.includes('سبونسر') || q.includes('جهات راعية') → 'sponsors_list'
//
// ملاحظة هندسية مهمة:
//   isScholarshipContext يجب تحديده قبل فحص أسماء الجامعات
//   لتفادي التعارضات (مثل: كورنيل في سياق المنح ≠ كورنيل في سياق الجامعة)

export const MODULE_NAME = 'scholarships';
export const MODULE_VERSION = '1.0.0';
