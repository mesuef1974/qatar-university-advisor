/**
 * Profile Handler — Qatar University Advisor
 * ══════════════════════════════════════════
 * مُستخرج من findResponse.js كجزء من تقسيم God File
 * T-Q7-T010: تحسين قابلية الصيانة
 *
 * يُجمع هذا الملف جميع عمليات الملف الشخصي للمستخدم في مكان واحد:
 *   - extractGPA        — استخراج المعدل من النص
 *   - detectNationality — كشف الجنسية
 *   - detectTrack       — كشف المسار الدراسي
 *   - detectUserType    — كشف نوع المستخدم
 *   - buildUserProfile  — بناء الملف الشخصي الكامل
 *   - buildProfileContext — بناء سياق الملف الشخصي لـ AI
 *   - getNextProfilingQuestion — السؤال الاستكشافي التالي
 *   - getInMemoryProfile / saveInMemoryProfile — إدارة الكاش المحلي
 *
 * جميع هذه الوظائف مُصدَّرة من user-profiler.js — هذا الملف يُعيد تصديرها
 * من خلال واجهة موحدة تمثل قسم "إدارة الملف الشخصي" في المعمارية.
 */

export {
  USER_TYPES,
  detectUserType,
  detectNationality,
  detectTrack,
  extractGPA,
  buildUserProfile,
  buildProfileContext,
  getWelcomeMessage,
  getNextProfilingQuestion,
  getInMemoryProfile,
  saveInMemoryProfile,
} from '../user-profiler.js';
