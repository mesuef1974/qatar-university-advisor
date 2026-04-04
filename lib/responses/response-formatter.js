/**
 * Response Formatter Module — Qatar University Advisor
 * مُستخرج من findResponse.js كجزء من تقسيم God File
 * T-Q7-T010: تحسين قابلية الصيانة
 *
 * يشمل هذا الملف functions تنسيق وبناء الردود النهائية:
 * - buildSmartWelcome — رسالة الترحيب المخصصة حسب الملف الشخصي
 * - getDefaultResponse — الرد الافتراضي عند عدم فهم السؤال
 * - gradeResponse — توصيات الجامعات حسب المعدل
 * - PDPPL_NOTICE — إشعار الخصوصية القطرية
 * - addNationalityContext — تخصيص الرد حسب الجنسية
 * - إدارة الاقتراحات الذكية (generateSmartSuggestions)
 *
 * التكامل مع الوحدات الأخرى:
 *   - يستورد generateSmartSuggestions من user-profiler.js
 *   - يستورد USER_TYPES من user-profiler.js
 *   - يستخدم gradeResponse داخلياً لبناء ترحيب بمعدل معروف
 *   - يستخدم getWelcomeMessage من user-profiler.js
 */

import {
  generateSmartSuggestions,
  getWelcomeMessage,
  USER_TYPES,
} from '../user-profiler.js';

export const MODULE_NAME = 'response-formatter';
export const MODULE_VERSION = '1.0.0';

// ══════════════════════════════════════════════════════
// إشعار خصوصية PDPPL — يُضاف فقط للمستخدمين الجدد
// ══════════════════════════════════════════════════════
export const PDPPL_NOTICE = '\n\n🔒 ملاحظة: بياناتك محفوظة بسرية تامة وفق قانون PDPPL القطري. لحذف بياناتك اكتب: \'احذف بياناتي\'';

/**
 * Get grade-based university recommendations
 * @param {number} grade - معدل الطالب (50-100)
 * @param {string|null} _track - المسار الأكاديمي (علمي/أدبي)
 * @returns {{ text: string, suggestions: string[] }}
 */
export function gradeResponse(grade, _track) {
  if (grade >= 95) return { text: `🌟 *معدل استثنائي (${grade}%)!*\n\nأمامك أرقى الخيارات:\n\n🏥 *وايل كورنيل للطب* (أفضل 10 عالمياً)\n🏥 *طب جامعة قطر*\n🖥️ *كارنيجي ميلون* (CS، إدارة)\n👑 *الابتعاث الأميري* (هارفارد/MIT)\n⚔️ *جميع الكليات العسكرية* بامتياز\n\n💡 اسألني عن خطة دراسة أي تخصص!`, suggestions: ['وايل كورنيل', 'خطة دراسة الطب', 'الابتعاث الأميري', 'هندسة البترول'] };
  if (grade >= 90) return { text: `🌟 *معدل ممتاز (${grade}%)!*\n\nمتاح لك:\n🏥 كلية الطب — جامعة قطر\n🦷 طب الأسنان — جامعة قطر\n🖥️ كارنيجي ميلون\n⚙️ تكساس إي أند أم (هندسة بترول)\n🌐 جورجتاون\n⚔️ جميع الكليات العسكرية`, suggestions: ['خطة دراسة الطب', 'هندسة البترول', 'كارنيجي ميلون', 'مقارنة كورنيل وطب QU'] };
  if (grade >= 85) return { text: `⭐ *معدل ممتاز (${grade}%)!*\n\nمتاح لك:\n⚙️ تكساس إي أند أم (هندسة بترول)\n🖥️ كارنيجي ميلون\n🌐 جورجتاون\n💊 الصيدلة — جامعة قطر\n⚔️ جميع الكليات العسكرية`, suggestions: ['هندسة البترول', 'كارنيجي ميلون', 'الكليات العسكرية', 'الصيدلة'] };
  if (grade >= 80) return { text: `✅ *معدل جيد جداً (${grade}%)!*\n\nمتاح لك:\n⚙️ الهندسة — جامعة قطر (7 تخصصات)\n📺 نورثوسترن (إعلام)\n🎨 فرجينيا كومنولث\n👩‍⚕️ التمريض والعلوم الصحية\n⚔️ كلية أحمد بن محمد، الشرطة، الجوية`, suggestions: ['هندسة جامعة قطر', 'نورثوسترن', 'الكليات العسكرية', 'فرص عمل الهندسة'] };
  if (grade >= 75) return { text: `📚 *معدل جيد (${grade}%)!*\n\nمتاح لك:\n📚 آداب وعلوم — جامعة قطر\n💼 الإدارة والاقتصاد\n🎓 التربية + برنامج طموح (10,000 ريال/شهر)\n🎨 فرجينيا كومنولث\n⚔️ أحمد بن محمد، الشرطة`, suggestions: ['برنامج طموح', 'الإدارة في QU', 'فرجينيا كومنولث', 'الكليات العسكرية'] };
  if (grade >= 70) return { text: `📚 *معدل مقبول (${grade}%)!*\n\nمتاح لك:\n📚 جامعة قطر — الآداب والإدارة والشريعة والتربية\n✈️ أكاديمية الطيران (علمي + نظر 6/6)\n⚔️ كلية أحمد بن محمد\n👮 أكاديمية الشرطة`, suggestions: ['جامعة قطر', 'أكاديمية الطيران', 'أحمد بن محمد', 'برنامج طموح'] };
  return { text: `📝 *معدل ${grade}% — أقل من الحد الأدنى لمعظم الجامعات*\n\nلا تقلق! لديك خيارات:\n📘 كلية المجتمع قطر (دبلوم مشارك)\n🔄 إعادة الثانوية لتحسين المعدل\n🛠️ معاهد التدريب المهني\n\n💡 الدبلوم المشارك يمكنك لاحقاً من الانتقال للجامعة!`, suggestions: ['كلية المجتمع قطر', 'التدريب المهني', 'تحسين المعدل'] };
}

/**
 * رسالة الترحيب الذكية المخصصة حسب الملف الشخصي
 * @param {object} profile - ملف المستخدم
 * @param {string|null} nationality - 'qatari' | 'non_qatari' | null
 * @param {boolean} hasHistory - هل المستخدم لديه تاريخ محادثة سابق؟
 * @returns {{ text: string, suggestions: string[] }}
 */
export function buildSmartWelcome(profile, nationality, hasHistory = false) {
  const { userType, gpa } = profile;

  // إذا كان هناك تاريخ → تحية عودة (بدون إشعار PDPPL — المستخدم رآه سابقاً)
  if (hasHistory) {
    const returnGreeting = {
      text: `أهلاً بعودتك! 👋\n\nأتذكرك — يسعدني مواصلة إرشادك.\n${gpa ? `معدلك ${gpa}%` : ''}\n\nما الذي تريد معرفته اليوم؟`,
      suggestions: generateSmartSuggestions(profile, 'return'),
    };
    return returnGreeting;
  }

  // ولي أمر
  if (userType === USER_TYPES.PARENT) {
    return {
      text: `أهلاً بك! 🎓\n\nيسعدني مساعدتك في إرشاد أبنائك نحو المستقبل الأكاديمي المناسب.\n\nلأقدم لك إرشاداً دقيقاً، أخبرني:\n• ما جنسية ابنك/ابنتك؟ (قطري / مقيم)\n• ما معدله/ها في الثانوية أو المتوقع؟\n• هل لديه تخصص أو مجال مفضّل؟` + PDPPL_NOTICE,
      suggestions: ['ابني قطري', 'ابنتي مقيمة', 'معدله 85%'],
    };
  }

  // طالب دراسات عليا / خريج
  if (userType === USER_TYPES.STUDENT_GRAD) {
    return {
      text: `أهلاً! 🎓\n\nأنت تبحث عن الدراسات العليا في قطر — خيار ممتاز!\n\nقطر فيها فرص ماجستير ودكتوراه رائعة، أبرزها:\n• **HBKU** — منح كاملة لجميع الجنسيات\n• **جامعة قطر** — 40+ برنامج عالي\n• **كليات المدينة التعليمية** — معايير دولية\n\nأخبرني: ما تخصصك وماذا تريد دراسة؟` + PDPPL_NOTICE,
      suggestions: ['برامج الماجستير في HBKU', 'دكتوراه في قطر', 'شروط الدراسات العليا'],
    };
  }

  // طالب بمعدل معروف
  if (gpa) {
    const gradeResp = gradeResponse(gpa, profile.track);
    return {
      text: `أهلاً! 🎓 رأيت معدلك **${gpa}%** — دعني أرشدك مباشرة:\n\n${gradeResp.text}` + PDPPL_NOTICE,
      suggestions: gradeResp.suggestions?.slice(0, 3) || generateSmartSuggestions(profile, 'grade'),
    };
  }

  // حسب الجنسية
  if (nationality === 'non_qatari') {
    return {
      text: '🎓 *أهلاً بك في المرشد الأكاديمي!*\n🌍 مرحباً بالطالب/ة المقيم/ة في قطر\n\nأنا هنا لمساعدتك في اختيار جامعتك وتخصصك.\n\n📋 **خياراتك المتاحة:**\n• **HBKU** — منح كاملة لجميع الجنسيات\n• **جامعة قطر** — رسوم مدعومة\n• **المدينة التعليمية** — 8 جامعات عالمية\n• UDST وجامعة لوسيل\n\n💡 أرسل معدلك أو اسأل عن أي تخصص!' + PDPPL_NOTICE,
      suggestions: ['منح HBKU لجميع الجنسيات', 'المدينة التعليمية', 'رسوم الجامعات للمقيمين'],
    };
  }

  if (nationality === 'qatari') {
    return {
      text: '🎓 *أهلاً بك في المرشد الأكاديمي!*\n🇶🇦 مرحباً بالطالب/ة القطري/ة\n\nأنا هنا لمساعدتك في اختيار مستقبلك الأكاديمي.\n\n✅ **مميزاتك كقطري/ة:**\n• جامعة قطر مجانية + مكافأة شهرية\n• الكليات العسكرية متاحة\n• برنامج طموح (22,000-25,000 ريال/شهر)\n• منح الشركات: قطر للطاقة، خطوط قطرية، QNB\n\n💡 أرسل معدلك أو اسأل عن أي تخصص!' + PDPPL_NOTICE,
      suggestions: ['منح القطريين', 'الكليات العسكرية', 'برنامج طموح للخارج'],
    };
  }

  // افتراضي — الترحيب العام الذكي
  const defaultWelcome = getWelcomeMessage();
  return {
    ...defaultWelcome,
    text: defaultWelcome.text + PDPPL_NOTICE,
  };
}

/**
 * الرد الافتراضي عند عدم فهم السؤال
 * @param {object} profile - ملف المستخدم (اختياري)
 * @returns {{ text: string, suggestions: string[] }}
 */
export function getDefaultResponse(profile = {}) {
  const smartSuggs = generateSmartSuggestions(profile, 'default');
  return {
    text: '🤔 لم أفهم سؤالك بالضبط.\n\nجرّب أحد هذه:\n• اكتب اسم جامعة (مثل: كارنيجي ميلون)\n• اكتب معدلك (مثل: 85%)\n• اسأل عن تخصص (مثل: هندسة البترول)\n• اكتب "جامعات" لعرض القائمة الكاملة',
    suggestions: smartSuggs.length > 0 ? smartSuggs : ['جميع الجامعات', 'الرواتب والوظائف', 'الكليات العسكرية'],
  };
}
