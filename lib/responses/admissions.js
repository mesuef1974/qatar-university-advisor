/**
 * Admissions Module — Qatar University Advisor
 * مُستخرج من findResponse.js كجزء من تقسيم God File
 * T-Q7-T010: تحسين قابلية الصيانة
 *
 * يشمل هذا الملف كل ما يتعلق بشروط القبول والتقديم:
 * - شروط القبول العامة ومتطلبات المعدل
 * - التقديم لطلاب الصف 10/11 (مبكر)
 * - حالات الرفض وطرق التعامل معها
 * - طلاب من خارج قطر
 * - الجنسية المزدوجة
 * - تحويل بين الجامعات
 * - القيود الجندرية
 * - الاعتمادية الدولية
 * - مواعيد التقديم
 * - اختبارات SAT / IELTS / TOEFL
 * - متطلبات اللياقة البدنية العسكرية
 * - متطلبات النظر
 */

// TODO: نقل الـ functions المتعلقة من findResponse.js لهنا
// هذا الملف جاهز للاستقبال — سيُملأ تدريجياً
//
// الـ response keys المتعلقة بهذا الملف:
//   'grade_10_11_early'       — طلاب صف 10/11
//   'rejection_advice'        — رفض القبول
//   'outside_qatar_student'   — طلاب من خارج قطر
//   'dual_nationality'        — جنسية مزدوجة
//   'university_transfer'     — تحويل بين الجامعات
//   'gender_restrictions'     — قيود جندرية
//   'international_accreditation' — اعتمادية دولية
//   'deadlines'               — مواعيد التقديم
//   'sat_guide'               — دليل SAT
//   'ielts_guide'             — دليل IELTS/TOEFL
//   'eye_vision'              — متطلبات النظر
//   'fitness_military'        — اللياقة البدنية العسكرية
//   'compare_requirements_all' — مقارنة شروط القبول
//
// الـ keyword patterns المتعلقة بهذا الملف (من findResponse.js):
//   normalizedQ.includes('صف 10') || normalizedQ.includes('الصف العاشر')
//   normalizedQ.includes('رفض') || normalizedQ.includes('لم أقبل')
//   normalizedQ.includes('من خارج قطر')
//   normalizedQ.includes('جنسيتين') || normalizedQ.includes('جنسية مزدوجة')
//   normalizedQ.includes('تحويل') || normalizedQ.includes('نقل قيد')
//   normalizedQ.includes('بنات') || normalizedQ.includes('مختلط')
//   normalizedQ.includes('معترف') || normalizedQ.includes('اعتماد')
//   q.includes('موعد') || q.includes('تقديم')
//   q.includes('sat') || q.includes('ielts') || q.includes('toefl')
//   q.includes('نظر') || q.includes('نظارة')
//   (q.includes('لياقة') || q.includes('جري')) && q.includes('عسكري')
//
// الـ grade-based recommendations (gradeResponse function):
//   grade >= 95 → وايل كورنيل، طب QU، كارنيجي، الابتعاث الأميري
//   grade >= 90 → طب وأسنان QU، CMU، TAMU، Georgetown
//   grade >= 85 → TAMU، CMU، Georgetown، صيدلة QU
//   grade >= 80 → هندسة QU، Northwestern، VCU، تمريض
//   grade >= 75 → آداب وعلوم QU، إدارة، تربية
//   grade >= 70 → QU (آداب/إدارة/شريعة)، أكاديمية الطيران
//   grade < 70  → كلية المجتمع، إعادة الثانوية

export const MODULE_NAME = 'admissions';
export const MODULE_VERSION = '1.0.0';
