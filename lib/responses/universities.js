/**
 * Universities Module — Qatar University Advisor
 * مُستخرج من findResponse.js كجزء من تقسيم God File
 * T-Q7-T010: تحسين قابلية الصيانة
 *
 * يشمل هذا الملف كل ما يتعلق ببيانات الجامعات القطرية:
 * - جامعة قطر (QU)
 * - المدينة التعليمية (Education City): WCM, CMU, TAMU, GU, NU, VCU
 * - الجامعات الجديدة: UDST, Lusail, HBKU, CCQ, Doha Institute, CUQ, Barzan, QFBA
 * - الكليات العسكرية: ABMMC, Police, Airforce, Naval, Cyber
 * - أكاديمية الطيران (QAA)
 */

// TODO: نقل الـ functions المتعلقة من findResponse.js لهنا
// هذا الملف جاهز للاستقبال — سيُملأ تدريجياً
//
// الـ response keys المتعلقة بهذا الملف:
//   'wcm', 'cmu', 'tamu', 'gu', 'nu', 'vcu'           — جامعات المدينة التعليمية
//   'qu'                                                — جامعة قطر
//   'udst', 'lusail', 'hbku', 'ccq'                    — جامعات جديدة
//   'doha_institute', 'cuq_ulster', 'barzan', 'qfba'   — جامعات أخرى
//   'abmmc', 'police', 'airforce', 'naval', 'cyber'    — كليات عسكرية
//   'qaa'                                               — أكاديمية الطيران
//   'general_list'                                      — قائمة الجامعات العامة
//   'compare_wcm_qu', 'compare_tamu_qu', 'compare_cmu_qu', 'compare_military' — مقارنات
//   'tamu_closing', 'qatari_vs_non_qatari'              — معلومات إضافية
//
// الـ keyword patterns المتعلقة بهذا الملف (من findResponse.js):
//   q.includes('وايل') || q.includes('كورنيل') || q.includes('wcm')
//   q.includes('كارنيجي') || q.includes('cmu')
//   q.includes('تكساس') || q.includes('tamu')
//   q.includes('جورجتاون') || q.includes('georgetown')
//   q.includes('نورثوسترن') || q.includes('northwestern')
//   q.includes('فرجينيا') || q.includes('vcu')
//   q.includes('جامعة قطر') || q.includes('qu')
//   q.includes('udst') || q.includes('دوحة للعلوم')
//   q.includes('لوسيل') || q.includes('hbku')
//   q.includes('كلية المجتمع') || q.includes('ccq')
//   q.includes('معهد الدوحة') || q.includes('doha institute')
//   q.includes('أحمد بن محمد') || q.includes('abmmc')
//   q.includes('الشرطة') || q.includes('الجوي') || q.includes('بحرية') || q.includes('سيبراني')
//   q.includes('أكاديمية الطيران') || q.includes('qaa')

export const MODULE_NAME = 'universities';
export const MODULE_VERSION = '1.0.0';
