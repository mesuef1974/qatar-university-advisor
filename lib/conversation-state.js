/**
 * T-011: Conversation State Machine — Qatar University Advisor
 * ════════════════════════════════════════════════════════════
 * يُحوّل المحادثة من ردود فردية إلى رحلة إرشادية مترابطة
 *
 * المراحل السبع:
 *   STAGE_0 → الترحيب (أول رسالة)
 *   STAGE_1 → تحديد الهوية (قطري/مقيم، طالب/ولي أمر)
 *   STAGE_2 → المسار والمعدل (علمي/أدبي + GPA)
 *   STAGE_3 → التخصص المفضل (ما تريد دراسته)
 *   STAGE_4 → الجامعات المقترحة (بناءً على الملف)
 *   STAGE_5 → المنح والتمويل (داخلي/خارجي)
 *   STAGE_6 → التقرير النهائي (ملخص الخطة)
 *
 * شركة أذكياء للبرمجيات | FAANG Standards
 */

const STAGES = {
  STAGE_0: 'STAGE_0', // ترحيب
  STAGE_1: 'STAGE_1', // هوية
  STAGE_2: 'STAGE_2', // مسار + معدل
  STAGE_3: 'STAGE_3', // تخصص
  STAGE_4: 'STAGE_4', // جامعات
  STAGE_5: 'STAGE_5', // منح
  STAGE_6: 'STAGE_6', // تقرير نهائي
};

/**
 * الانتقال الذكي — غير خطي
 * المستخدم يمكنه القفز بين المراحل حسب أسئلته
 * @param {string} currentStage
 * @param {object} profile
 * @param {string} userMessage
 * @returns {string} nextStage
 */
function getNextStage(currentStage, profile, userMessage) {
  const q = userMessage.toLowerCase().trim();

  // القفز المباشر حسب محتوى الرسالة (غير خطي)
  const isAskingAboutScholarships = q.includes('منح') || q.includes('ابتعاث') || q.includes('بعثة') || q.includes('سبونسر');
  const isAskingAboutUniversities = q.includes('جامعة') || q.includes('كلية') || q.includes('تخصص');
  const isAskingAboutFinalReport = q.includes('خطة') || q.includes('تقرير') || q.includes('ملخص') || q.includes('توصية');
  const hasFullProfile = profile.nationality && profile.gpa && (profile.track || profile.userType);

  // إذا الملف مكتمل → اقترح التقرير النهائي
  if (hasFullProfile && isAskingAboutFinalReport) return STAGES.STAGE_6;

  // إذا سأل عن منح مباشرة → STAGE_5
  if (isAskingAboutScholarships && profile.nationality) return STAGES.STAGE_5;

  // إذا سأل عن جامعات والملف كافٍ → STAGE_4
  if (isAskingAboutUniversities && profile.gpa) return STAGES.STAGE_4;

  // الانتقال الخطي الافتراضي
  switch (currentStage) {
    case STAGES.STAGE_0: return STAGES.STAGE_1;
    case STAGES.STAGE_1:
      if (!profile.nationality) return STAGES.STAGE_1; // لم يُحدد بعد
      return STAGES.STAGE_2;
    case STAGES.STAGE_2:
      if (!profile.gpa && !profile.track) return STAGES.STAGE_2; // لم يُكمل بعد
      return STAGES.STAGE_3;
    case STAGES.STAGE_3:
      return STAGES.STAGE_4;
    case STAGES.STAGE_4:
      return STAGES.STAGE_5;
    case STAGES.STAGE_5:
      if (hasFullProfile) return STAGES.STAGE_6;
      return STAGES.STAGE_5;
    case STAGES.STAGE_6:
      return STAGES.STAGE_6; // نهائي
    default:
      return STAGES.STAGE_1;
  }
}

/**
 * سؤال المرحلة التالي
 * يُوجّه المستخدم لإكمال ملفه
 * @param {string} stage
 * @param {object} profile
 * @returns {string|null} سؤال للمستخدم أو null إذا لا يوجد سؤال
 */
function getStagePrompt(stage, profile) {
  switch (stage) {
    case STAGES.STAGE_1:
      if (!profile.nationality) {
        return '🌍 لأرشدك بدقة، هل أنت *قطري الجنسية* أم *مقيم في قطر*؟';
      }
      if (!profile.userType || profile.userType === 'GENERAL') {
        return '👤 وهل أنت *طالب/ة* في المرحلة الثانوية، أم *ولي أمر*، أم *طالب جامعي* تريد التحويل؟';
      }
      return null;

    case STAGES.STAGE_2:
      if (!profile.gpa) {
        return '📊 ما *معدلك التراكمي* في الثانوية؟ (مثال: 85% أو 90%)';
      }
      if (!profile.track) {
        return '📚 وما *مسارك الدراسي*؟ علمي، أدبي، تجاري، أم تقني؟';
      }
      return null;

    case STAGES.STAGE_3:
      if (!profile.preferredMajor) {
        return '🎯 ما *التخصص أو المجال* الذي تميل إليه؟ (مثال: طب، هندسة، أعمال، إعلام...)';
      }
      return null;

    case STAGES.STAGE_4:
      return null; // الجامعات تُعرض تلقائياً بناءً على الملف

    case STAGES.STAGE_5:
      if (profile.nationality === 'qatari') {
        return '💰 هل تعرف أنك كقطري/ة تستحق *الابتعاث الأميري*؟ هل تريد تفاصيل المنح المتاحة لك؟';
      } else {
        return '💰 هل تريد معرفة *المنح المتاحة للمقيمين* في قطر؟';
      }

    case STAGES.STAGE_6:
      return null; // التقرير يُولَّد تلقائياً

    default:
      return null;
  }
}

/**
 * توليد التقرير النهائي STAGE_6
 * @param {object} profile
 * @returns {object} { text, suggestions }
 */
function generateFinalReport(profile) {
  const { nationality, gpa, track, preferredMajor } = profile;

  const nationalityLabel = nationality === 'qatari' ? '🇶🇦 قطري' : '🌍 مقيم';
  const gpaLabel = gpa ? `${gpa}%` : 'غير محدد';
  const trackLabel = track || 'غير محدد';
  const majorLabel = preferredMajor || 'غير محدد';

  // توصية الجامعات بناءً على الملف
  let universities = '';
  if (gpa >= 90) {
    universities = '1️⃣ وايل كورنيل للطب\n2️⃣ طب جامعة قطر\n3️⃣ كارنيجي ميلون\n4️⃣ جورجتاون';
  } else if (gpa >= 85) {
    universities = '1️⃣ كارنيجي ميلون\n2️⃣ تكساس إي أند أم\n3️⃣ جامعة قطر (هندسة)\n4️⃣ نورثوسترن';
  } else if (gpa >= 80) {
    universities = '1️⃣ جامعة قطر\n2️⃣ UDST\n3️⃣ نورثوسترن\n4️⃣ فرجينيا كومنولث';
  } else {
    universities = '1️⃣ جامعة قطر\n2️⃣ كلية المجتمع قطر\n3️⃣ UDST';
  }

  // توصية المنح
  let scholarships = '';
  if (nationality === 'qatari') {
    scholarships = '• *الابتعاث الأميري* (أعلى المنح — هارفارد/MIT)\n• *منحة قطر للطاقة* (للهندسة والعلوم)\n• *الابتعاث الداخلي* (عبر مؤسسة قطر)';
  } else {
    scholarships = '• *منحة قطر للتعليم*\n• *منح جامعة قطر للمتميزين*\n• *منح Education City الداخلية*';
  }

  const text = `📋 *تقريرك الأكاديمي الشخصي*\n━━━━━━━━━━━━━━━━━━━━━\n\n👤 *ملفك:*\n• الجنسية: ${nationalityLabel}\n• المعدل: ${gpaLabel}\n• المسار: ${trackLabel}\n• التخصص المفضل: ${majorLabel}\n\n🏫 *الجامعات المقترحة لك:*\n${universities}\n\n💰 *المنح المتاحة لك:*\n${scholarships}\n\n📅 *الخطوات التالية:*\n1. قدّم قبل انتهاء الموعد (عادةً فبراير-أبريل)\n2. جهّز: شهادة الثانوية + IELTS + خطاب تحفيزي\n3. قدّم لأكثر من جامعة في آنٍ واحد\n\n💡 *احفظ هذا التقرير! يمكنك إرساله لولي أمرك.*`;

  return {
    text,
    suggestions: ['تفاصيل المنح', 'شروط القبول التفصيلية', 'خطة دراسية مخصصة'],
  };
}

/**
 * هل المحادثة مكتملة؟ (وصلت STAGE_6)
 * @param {string} stage
 * @returns {boolean}
 */
function isConversationComplete(stage) {
  return stage === STAGES.STAGE_6;
}

/**
 * نسبة إكمال الملف الشخصي (للـ progress bar)
 * @param {object} profile
 * @returns {number} 0-100
 */
function getProfileCompleteness(profile) {
  let score = 0;
  if (profile.nationality) score += 25;
  if (profile.userType && profile.userType !== 'GENERAL') score += 15;
  if (profile.gpa) score += 25;
  if (profile.track) score += 15;
  if (profile.preferredMajor) score += 20;
  return score;
}

export {
  STAGES,
  getNextStage,
  getStagePrompt,
  generateFinalReport,
  isConversationComplete,
  getProfileCompleteness,
};
