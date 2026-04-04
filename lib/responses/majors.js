/**
 * Majors Module — Qatar University Advisor
 * مُستخرج من findResponse.js كجزء من تقسيم God File
 * T-Q7-T010: تحسين قابلية الصيانة
 *
 * يشمل هذا الملف كل ما يتعلق بالتخصصات الأكاديمية ومساراتها:
 * - التخصصات الطبية والصحية
 * - التخصصات الهندسية
 * - تخصصات الأعمال والإدارة
 * - تخصصات العلوم الإنسانية والاجتماعية
 * - تخصصات العلوم البحتة
 * - خطط الدراسة لكل تخصص
 * - الرواتب والوظائف
 * - الرؤية 2030 وتخصصات المستقبل
 * - مهنة التعليم وبرامجها
 */

// TODO: نقل الـ functions المتعلقة من findResponse.js لهنا
// هذا الملف جاهز للاستقبال — سيُملأ تدريجياً
//
// الـ response keys المتعلقة بهذا الملف (خطط الدراسة):
//   طبية: 'plan_medicine', 'plan_dentistry', 'plan_pharmacy', 'plan_nursing', 'plan_health_sciences'
//   هندسية: 'plan_petroleum', 'plan_civil_eng', 'plan_electrical_eng', 'plan_mechanical_eng'
//            'plan_chemical_eng', 'plan_computer_eng', 'plan_industrial_eng', 'plan_mechatronics'
//            'plan_engineering_qu' (عام)
//   تقنية: 'plan_cs', 'plan_mis', 'plan_ai_cmu', 'plan_bio_cmu'
//   أعمال: 'plan_accounting', 'plan_finance', 'plan_marketing'
//   إنسانية: 'plan_law', 'plan_sharia', 'plan_education', 'plan_psychology'
//            'plan_media', 'plan_arabic', 'plan_english'
//   علوم: 'plan_biology', 'plan_chemistry', 'plan_physics', 'plan_math', 'plan_env_science'
//   معمار: 'plan_architecture'
//
// مسارات أخرى متعلقة:
//   'salaries'             — الرواتب والوظائف
//   'qatar_vision_2030'    — رؤية 2030 وتخصصات المستقبل
//   'reservoir_engineer'   — هندسة المكامن
//   'thamoon'              — برنامج طموح للمعلمين
//   'teach_for_qatar'      — علّم لأجل قطر
//   'teaching_career'      — مهنة التعليم
//   'compare_fees_all'     — مقارنة الرسوم لجميع الجامعات
//   'general_military'     — الكليات العسكرية (عام)
//
// الـ keyword patterns المتعلقة بهذا الملف (من findResponse.js):
//   q.includes('خطة') || q.includes('مواد') || q.includes('مقررات') || q.includes('منهج')
//   q.includes('تخصص') || q.includes('هندسة') || q.includes('رياضيات')
//   q.includes('طب') || q.includes('صيدلة') || q.includes('أسنان') || q.includes('تمريض')
//   q.includes('قانون') || q.includes('محاسبة') || q.includes('تمويل') || q.includes('تسويق')
//   q.includes('نظم معلومات') || q.includes('ذكاء اصطناعي')
//   q.includes('راتب') || q.includes('وظيفة') || q.includes('فرص عمل')
//   q.includes('رؤية 2030') || q.includes('تخصصات المستقبل')
//   q.includes('مكامن') || q.includes('reservoir')
//   q.includes('طموح') || q.includes('10,000 ريال')
//   q.includes('علّم لأجل قطر') || q.includes('مهنة التعليم')
//   q.includes('جامعات') || q.includes('قائمة') — قائمة عامة

export const MODULE_NAME = 'majors';
export const MODULE_VERSION = '1.0.0';
