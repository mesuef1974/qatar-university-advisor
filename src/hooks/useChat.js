// ════════════════════════════════════════════════════════════════════
// useChat — Custom hook for chat logic, career test, and favorites
// Qatar University Advisor — Design System v2.0
// ════════════════════════════════════════════════════════════════════

import { useState, useCallback, useEffect, useRef } from 'react';
import { ALL_RESPONSES, UNIVERSITIES_DB, CAREER_TEST } from '../../lib/responses.js';
import { addNationalityContext } from '../../lib/nationality-advisor.js';

// ─── Welcome message factory ───────────────────────────────────────
function buildWelcomeMessage(nationality) {
  if (nationality === 'qatari') {
    return {
      text: `🎓 **أهلاً بك في المستشار الجامعي القطري!**\n🇶🇦 مرحباً بالطالب/ة القطري/ة\n\nأنا هنا لمساعدتك في اختيار جامعتك وتخصصك.\n\n✅ كل الجامعات الحكومية مجانية لك\n✅ الكليات العسكرية متاحة لك\n✅ الابتعاث الأميري والخارجي متاح\n✅ منح قطر للطاقة والخطوط القطرية وQNB\n\nيمكنك سؤالي عن أي شيء!`,
      suggestions: ['جميع الجامعات', 'الابتعاث الأميري', 'الكليات العسكرية', 'أرسل معدلك'],
    };
  }
  return {
    text: `🎓 **أهلاً بك في المستشار الجامعي القطري!**\n🌍 مرحباً بالطالب/ة المقيم/ة في قطر\n\nأنا هنا لمساعدتك في اختيار جامعتك وتخصصك.\n\n📋 خياراتك المتاحة:\n• جامعة قطر (رسوم 800-1,400 ريال/ساعة)\n• جامعات المدينة التعليمية (منح كاملة متاحة من مؤسسة قطر)\n• جامعة حمد بن خليفة HBKU (منح ممولة بالكامل لجميع الجنسيات)\n• جامعة لوسيل وUDST والكليات الخاصة\n• منحة الفاخورة للمقيمين\n\nيمكنك سؤالي عن أي شيء!`,
    suggestions: ['منح لغير القطريين', 'جامعات المدينة التعليمية', 'HBKU منح كاملة', 'أرسل معدلك'],
  };
}

// ─── Grade response factory ─────────────────────────────────────────
function buildGradeResponse(grade) {
  if (grade >= 95)
    return {
      text: `🌟 **معدل استثنائي (${grade}%)!**\n\nأمامك أرقى الخيارات:\n\n• 🏥 **وايل كورنيل للطب** (أفضل 10 عالمياً)\n• 🏥 **طب جامعة قطر**\n• 🖥️ **كارنيجي ميلون** (CS، إدارة)\n• 👑 **الابتعاث الأميري** (هارفارد/MIT)\n• ⚔️ **جميع الكليات العسكرية** بامتياز\n\n💡 اسألني عن خطة دراسة أي تخصص!`,
      suggestions: ['وايل كورنيل — الشروط والخطة', 'خطة دراسة الطب', 'الابتعاث الأميري — الشروط', 'هندسة البترول في TAMU'],
    };
  if (grade >= 90)
    return {
      text: `🌟 **معدل ممتاز (${grade}%)!**\n\nمتاح لك:\n• 🏥 كلية الطب — جامعة قطر\n• 🦷 طب الأسنان — جامعة قطر\n• 🖥️ كارنيجي ميلون\n• ⚙️ تكساس إي أند أم (هندسة بترول)\n• 🌐 جورجتاون\n• ⚔️ جميع الكليات العسكرية`,
      suggestions: ['خطة دراسة الطب في QU', 'هندسة البترول في TAMU', 'كارنيجي ميلون — التفاصيل', 'مقارنة كورنيل وطب QU'],
    };
  if (grade >= 85)
    return {
      text: `⭐ **معدل ممتاز (${grade}%)!**\n\nمتاح لك:\n• ⚙️ تكساس إي أند أم (هندسة بترول)\n• 🖥️ كارنيجي ميلون\n• 🌐 جورجتاون\n• 💊 الصيدلة — جامعة قطر\n• ⚔️ جميع الكليات العسكرية`,
      suggestions: ['هندسة البترول — خطة السنوات الأربع', 'كارنيجي ميلون — الشروط', 'الكليات العسكرية المتاحة', 'الصيدلة vs الطب'],
    };
  if (grade >= 80)
    return {
      text: `✅ **معدل جيد جداً (${grade}%)!**\n\nمتاح لك:\n• ⚙️ الهندسة — جامعة قطر (7 تخصصات)\n• 📺 نورثوسترن (إعلام)\n• 🎨 فرجينيا كومنولث\n• 👩‍⚕️ التمريض والعلوم الصحية\n• ⚔️ كلية أحمد بن محمد، الشرطة، الجوية`,
      suggestions: ['خطة دراسة الهندسة في QU', 'الإعلام في نورثوسترن', 'الكليات العسكرية بمعدل 80%', 'فرص عمل الهندسة في قطر'],
    };
  if (grade >= 75)
    return {
      text: `📚 **معدل جيد (${grade}%)!**\n\nمتاح لك:\n• 📚 آداب وعلوم — جامعة قطر\n• 💼 الإدارة والاقتصاد\n• 🎓 التربية + برنامج طموح (10,000 ريال/شهر)\n• 🎨 فرجينيا كومنولث\n• ⚔️ أحمد بن محمد (ذكور)، الشرطة`,
      suggestions: ['برنامج طموح — تفاصيل', 'خطة دراسة الإدارة في QU', 'فرجينيا كومنولث — التصميم', 'الكليات العسكرية بمعدل 75%'],
    };
  if (grade >= 70)
    return {
      text: `📚 **معدل مقبول (${grade}%)!**\n\nمتاح لك:\n• 📚 جامعة قطر — كليات الآداب والإدارة والشريعة والتربية\n• ✈️ أكاديمية الطيران (علمي + نظر 6/6)\n• ⚔️ كلية أحمد بن محمد (ذكور)\n• 👮 أكاديمية الشرطة`,
      suggestions: ['جامعة قطر — الكليات المتاحة', 'أكاديمية الطيران — الشروط', 'أحمد بن محمد العسكرية', 'برنامج طموح'],
    };
  return {
    text: `📝 **معدل ${grade}% — أقل من الحد الأدنى لمعظم الجامعات**\n\nلا تقلق! لديك خيارات:\n• 📘 كلية المجتمع قطر (دبلوم مشارك)\n• 🔄 إعادة الثانوية لتحسين المعدل\n• 🛠️ معاهد التدريب المهني\n\n💡 الدبلوم المشارك يمكنك لاحقاً من الانتقال للجامعة!`,
    suggestions: ['كلية المجتمع قطر', 'كيف أحسّن معدلي؟', 'التدريب المهني في قطر', 'هل يمكنني الانتقال للجامعة لاحقاً؟'],
  };
}

// ─── Career test result calculator ─────────────────────────────────
function calcTestResult(traits) {
  const cats = {
    engineering: (traits.engineering || 0) + (traits.technical || 0) + (traits.analytical || 0),
    medical: (traits.medical || 0) + (traits.humanitarian || 0) + (traits.scientific || 0),
    military: (traits.military || 0) + (traits.patriotic || 0) + (traits.physical || 0),
    business: (traits.business || 0) + (traits.ambitious || 0) + (traits.practical || 0),
    creative: (traits.creative || 0) + (traits.artistic || 0) + (traits.innovative || 0),
    aviation: (traits.adventurous || 0) + (traits.physical || 0) * 0.5 + (traits.technical || 0) * 0.5,
    international: (traits.international || 0) + (traits.social || 0) + (traits.communication || 0),
  };
  return CAREER_TEST.results[Object.entries(cats).sort((a, b) => b[1] - a[1])[0][0]];
}

// ─── Keyword-based response finder ──────────────────────────────────
function findResponse(text, testStateActive) {
  const q = text.toLowerCase().trim();

  if (testStateActive) return { type: 'test' };

  // ── أسئلة عن البوت نفسه ──
  if (q.includes('من أنت') || q.includes('من انت') || q.includes('عرف نفسك') || q.includes('ما هي وظيفتك') || q.includes('وظيفتك') || q.includes('ايش انت') || q.includes('شو انت'))
    return { type: 'response', key: 'bot_identity' };

  // ── تحيات ──
  if (q.includes('مرحبا') || q.includes('هلا') || q.includes('السلام') || q.includes('سلام') || q.includes('هاي') || q.includes('hi') || q.includes('hello'))
    return { type: 'response', key: 'greeting' };

  // ── شكر ──
  if (q.includes('شكرا') || q.includes('مشكور') || q.includes('thanks'))
    return { type: 'response', key: 'thanks' };

  // ── مساعدة ──
  if (q.includes('ساعدني') || q.includes('مساعدة') || q.includes('help') || q.includes('كيف أستخدم'))
    return { type: 'response', key: 'help' };

  // ── من أنا ──
  if (q.includes('من أنا') || q.includes('من انا'))
    return { type: 'response', key: 'who_am_i' };

  if (q.includes('اختبار') || q.includes('تحديد التخصص') || q.includes('ابدأ اختبار') || q.includes('اكتشف تخصصي'))
    return { type: 'start_test' };

  // ── Button-specific patterns (fuzzy match — guards against invisible chars) ──
  if (q.includes('أرسل') && q.includes('معدل') || q.includes('ارسل') && q.includes('معدل'))
    return { type: 'ask_grade' };
  if (q.includes('المدينة التعليمية') || q.includes('education city'))
    return { type: 'response', key: 'education_city' };
  if (q.includes('hbku') || q.includes('حمد بن خليفة'))
    return { type: 'response', key: 'hbku' };
  if ((q.includes('منح') || q.includes('scholarship')) && (q.includes('غير القطري') || q.includes('مقيم') || q.includes('وافد') || q.includes('أجنبي')))
    return { type: 'response', key: 'scholarships_non_qatari' };

  // Comparisons
  if (q.includes('مقارن') || q.includes('الفرق') || q.includes('vs') || q.includes('ولا') || q.includes('أيهما')) {
    if ((q.includes('كورنيل') || q.includes('وايل')) && (q.includes('قطر') || q.includes('qu') || q.includes('طب')))
      return { type: 'response', key: 'compare_wcm_qu' };
    if ((q.includes('تكساس') || q.includes('tamu')) && (q.includes('هندسة') || q.includes('qu') || q.includes('قطر')))
      return { type: 'response', key: 'compare_tamu_qu' };
    if ((q.includes('كارنيجي') || q.includes('cmu')) && (q.includes('حاسب') || q.includes('qu') || q.includes('قطر')))
      return { type: 'response', key: 'compare_cmu_qu' };
    if (q.includes('عسكري') || q.includes('كليات الخمس') || q.includes('خمس كليات'))
      return { type: 'response', key: 'compare_military' };
  }

  if (q.includes('مكامن') || q.includes('reservoir')) return { type: 'response', key: 'reservoir_engineer' };

  // Study plans
  if (q.includes('خطة') || q.includes('مواد') || q.includes('كورسات') || q.includes('مقررات') || q.includes('سنة') || q.includes('منهج')) {
    if (q.includes('طب') || q.includes('medicine')) return { type: 'response', key: 'plan_medicine' };
    if (q.includes('بترول') || q.includes('petroleum') || q.includes('tamu') || q.includes('تكساس'))
      return { type: 'response', key: 'plan_petroleum' };
    if (q.includes('حاسب') || q.includes('cs') || q.includes('cmu') || q.includes('كارنيجي') || q.includes('برمجة'))
      return { type: 'response', key: 'plan_cs' };
    if (q.includes('هندسة') || q.includes('engineering')) return { type: 'response', key: 'plan_engineering_qu' };
  }

  // Universities by name
  if (q.includes('وايل') || q.includes('كورنيل') || q.includes('wcm') || q.includes('cornell')) return { type: 'response', key: 'wcm' };
  if (q.includes('كارنيجي') || q.includes('كارنيغي') || q.includes('cmu') || q.includes('carnegie')) return { type: 'response', key: 'cmu' };
  if (q.includes('تكساس') || q.includes('tamu') || q.includes('texas') || q.includes('إي أند أم')) return { type: 'response', key: 'tamu' };
  if (q.includes('جورجتاون') || q.includes('georgetown')) return { type: 'response', key: 'gu' };
  if (q.includes('نورثوسترن') || q.includes('northwestern') || q.includes('إعلام') || q.includes('صحافة')) return { type: 'response', key: 'nu' };
  if (q.includes('فرجينيا') || q.includes('vcu') || (q.includes('تصميم') && !q.includes('داخلي'))) return { type: 'response', key: 'vcu' };
  if (q.includes('أكاديمية الطيران') || q.includes('اكاديمية الطيران') || q.includes('qaa')) return { type: 'response', key: 'qaa' };
  if (q.includes('جامعة قطر') || q.includes('جامعه قطر') || (q.includes('qu') && !q.includes('عسكر'))) return { type: 'response', key: 'qu' };

  // Military colleges
  if (q.includes('أحمد بن محمد') || q.includes('احمد بن محمد') || q.includes('abmmc')) return { type: 'response', key: 'abmmc' };
  if (q.includes('الشرطة') || q.includes('بوليس') || q.includes('police')) return { type: 'response', key: 'police' };
  if (q.includes('جوية') || q.includes('الجوي') || q.includes('طيار مقاتل') || q.includes('f-16') || q.includes('مقاتل')) return { type: 'response', key: 'airforce' };
  if (q.includes('بحرية') || q.includes('بحري') || q.includes('الغانم') || q.includes('سفينة') || q.includes('سواحل')) return { type: 'response', key: 'naval' };
  if (q.includes('سيبراني') || q.includes('سايبر') || q.includes('cyber') || q.includes('اختراق') || q.includes('هاكر')) return { type: 'response', key: 'cyber' };

  // Tests / Language
  if (q.includes('sat') || q.includes('اس ايه تي') || q.includes('اختبار قبول دولي')) return { type: 'response', key: 'sat_guide' };
  if (q.includes('ielts') || q.includes('toefl') || q.includes('توفل') || q.includes('آيلتس') || q.includes('لغة إنجليزية')) return { type: 'response', key: 'ielts_guide' };

  if (q.includes('نظر') || q.includes('عيون') || q.includes('نظارة') || q.includes('عدسات') || q.includes('6/6') || q.includes('lasik') || q.includes('ليزك')) return { type: 'response', key: 'eye_vision' };
  if (q.includes('طموح') || q.includes('10,000 ريال') || (q.includes('معلم') && q.includes('راتب'))) return { type: 'response', key: 'thamoon' };
  if (q.includes('أميري') || q.includes('هارفارد') || q.includes('mit') || q.includes('أكسفورد') || (q.includes('ابتعاث') && q.includes('خارج'))) return { type: 'response', key: 'amiri' };
  if ((q.includes('لياقة') || q.includes('اختبار بدني') || q.includes('جري') || q.includes('ضغط')) && (q.includes('عسكري') || q.includes('كلية') || q.includes('شرطة'))) return { type: 'response', key: 'fitness_military' };
  if (q.includes('مقارنة') && q.includes('عسكري')) return { type: 'response', key: 'compare_military' };
  if (q.includes('راتب') || q.includes('وظيفة') || q.includes('فرص عمل') || q.includes('توظيف') || (q.includes('مستقبل') && !q.includes('سنة'))) return { type: 'response', key: 'salaries' };
  if (q.includes('موعد') || q.includes('تقديم') || (q.includes('متى') && q.includes('يفتح')) || q.includes('تسجيل')) return { type: 'response', key: 'deadlines' };
  if (q.includes('عسكري') || q.includes('جيش') || q.includes('ضابط') || q.includes('ملازم') || q.includes('القوات')) return { type: 'response', key: 'general_military' };
  if (q.includes('منح') || q.includes('ابتعاث') || q.includes('مجان') || q.includes('تمويل')) return { type: 'response', key: 'amiri' };
  if (q.includes('طيران') || q.includes('طيار') || q.includes('خطوط قطرية')) return { type: 'response', key: 'qaa' };
  if (q.includes('طب') || q.includes('دكتور') || q.includes('طبيب')) return { type: 'response', key: 'plan_medicine' };
  if (q.includes('هندسة') || q.includes('مهندس')) return { type: 'response', key: 'plan_engineering_qu' };
  if (q.includes('جامعات') || q.includes('خيارات') || q.includes('متاح') || q.includes('كل الجامعات') || q.includes('قائمة')) return { type: 'response', key: 'general_list' };

  // Grade detection
  const gm = q.match(/(\d{2,3})\s*%?/);
  if (gm && (q.includes('%') || q.includes('معدل') || /^\d{2,3}$/.test(q.trim()))) {
    const g = parseInt(gm[1]);
    if (g >= 50 && g <= 100)
      return { type: 'grade', grade: g, track: q.includes('علمي') ? 'علمي' : q.includes('أدبي') || q.includes('ادبي') ? 'أدبي' : null };
  }

  if (q.includes('أنا طالب') || (q.includes('طالب') && !q.includes('عدد') && !q.includes('كلية'))) return { type: 'student' };
  if (q.includes('ولي أمر') || q.includes('ابني') || q.includes('بنتي')) return { type: 'parent' };

  return { type: 'unknown' };
}

// ════════════════════════════════════════════════════════════════════
// useChat — main hook
// ════════════════════════════════════════════════════════════════════
export function useChat() {
  // ── Persist nationality & favorites ──────────────────────────────
  const savedNationality = localStorage.getItem('advisor_nationality');
  const savedFavorites = JSON.parse(localStorage.getItem('advisor_favorites') || '[]');

  // ── User profile ─────────────────────────────────────────────────
  const [userProfile, setUserProfile] = useState({
    type: null,
    grade: null,
    track: null,
    favorites: savedFavorites,
    nationality: savedNationality || null,
  });

  // ── Messages ─────────────────────────────────────────────────────
  const [messages, setMessages] = useState(() => {
    if (!savedNationality) return [];
    const welcome = buildWelcomeMessage(savedNationality);
    return [
      {
        id: Date.now() + Math.random(),
        type: 'bot',
        content: { text: welcome.text },
        suggestions: welcome.suggestions,
        time: new Date().toLocaleTimeString('ar-QA', { hour: '2-digit', minute: '2-digit' }),
      },
    ];
  });

  // ── Input & typing ───────────────────────────────────────────────
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  // ── Career test state ────────────────────────────────────────────
  const [testState, setTestState] = useState({
    active: false,
    currentQuestion: 0,
    answers: [],
    traits: {},
  });

  // ── Scroll ref ───────────────────────────────────────────────────
  const messagesEndRef = useRef(null);

  // ── Persist favorites ────────────────────────────────────────────
  useEffect(() => {
    localStorage.setItem('advisor_favorites', JSON.stringify(userProfile.favorites));
  }, [userProfile.favorites]);

  // ── Auto-scroll to latest message ────────────────────────────────
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // ── Add bot message ───────────────────────────────────────────────
  const addBotMessage = useCallback((text, suggestions = []) => {
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now() + Math.random(),
        type: 'bot',
        content: { text },
        suggestions,
        time: new Date().toLocaleTimeString('ar-QA', { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  }, []);

  // ── Select nationality ────────────────────────────────────────────
  const selectNationality = useCallback(
    (nat) => {
      setUserProfile((p) => ({ ...p, nationality: nat }));
      localStorage.setItem('advisor_nationality', nat);
      const welcome = buildWelcomeMessage(nat);
      setMessages([
        {
          id: Date.now() + Math.random(),
          type: 'bot',
          content: { text: welcome.text },
          suggestions: welcome.suggestions,
          time: new Date().toLocaleTimeString('ar-QA', { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    },
    []
  );

  // ── Send message ──────────────────────────────────────────────────
  const sendMessage = useCallback(
    (text) => {
      const userText = (text !== undefined ? text : input).trim();
      if (!userText) return;

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now(),
          type: 'user',
          content: { text: userText },
          time: new Date().toLocaleTimeString('ar-QA', { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
      setInput('');
      setIsTyping(true);

      setTimeout(() => {
        setIsTyping(false);

        // ── Career test active ──────────────────────────────────────
        if (testState.active) {
          const q = CAREER_TEST.questions[testState.currentQuestion];
          const sel = q.options.find((o) => userText.includes(o.text.substring(0, 6)));
          if (!sel) {
            addBotMessage('⚠️ الرجاء اختيار إجابة من الخيارات.', q.options.map((o) => o.text));
            return;
          }
          const traits = { ...testState.traits };
          Object.entries(sel.traits).forEach(([t, v]) => {
            traits[t] = (traits[t] || 0) + v;
          });
          const next = testState.currentQuestion + 1;
          if (next >= CAREER_TEST.questions.length) {
            setTestState({ active: false, currentQuestion: 0, answers: [], traits: {} });
            const r = calcTestResult(traits);
            addBotMessage(
              `🎉 **نتيجة اختبار التخصص**\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n${r.icon} **التخصص المناسب لك:**\n**${r.title}**\n\n${r.description}\n\n**🏛️ الجامعات المقترحة:**\n${r.universities.map((id) => `• ${UNIVERSITIES_DB[id]?.icon} ${UNIVERSITIES_DB[id]?.name}`).join('\n')}\n\n**💼 المسارات المهنية:**\n${r.careers.join(' | ')}\n\n💡 اسألني عن خطة أي تخصص أو جامعة بالتفصيل!`,
              [...r.universities.map((id) => UNIVERSITIES_DB[id]?.name || id).slice(0, 3), 'خطة دراسية مفصلة']
            );
          } else {
            setTestState({ active: true, currentQuestion: next, answers: [], traits });
            const nq = CAREER_TEST.questions[next];
            addBotMessage(
              `✅ تم!\n\n**📝 السؤال ${next + 1} من 10:**\n\n${nq.question}`,
              nq.options.map((o) => o.text)
            );
          }
          return;
        }

        // ── Keyword routing ───────────────────────────────────────
        const result = findResponse(userText, testState.active);

        if (result.type === 'ask_grade') {
          addBotMessage(
            `📊 **أخبرني بمعدلك ومسارك!**\n\nاكتب معدلك بهذا الشكل:\n• "معدلي 85% علمي"\n• "92% أدبي"\n• أو الرقم فقط: "85"\n\nوسأخبرك بكل الجامعات والتخصصات المتاحة لك! 🎓`,
            ['معدلي 95%+ علمي', 'معدلي 85% علمي', 'معدلي 75% أدبي', 'معدلي 65%']
          );
          return;
        }

        if (result.type === 'start_test') {
          setTestState({ active: true, currentQuestion: 0, answers: [], traits: {} });
          const q0 = CAREER_TEST.questions[0];
          addBotMessage(
            `🎯 **اختبار تحديد التخصص**\n\n10 أسئلة تساعدك لاكتشاف التخصص الأنسب لشخصيتك.\n\n**📝 السؤال 1 من 10:**\n\n${q0.question}`,
            q0.options.map((o) => o.text)
          );
          return;
        }

        if (result.type === 'response') {
          const r = ALL_RESPONSES[result.key];
          if (r) {
            const enhanced = addNationalityContext(
              { text: r.text, suggestions: r.suggestions || [] },
              userProfile.nationality,
              result.key
            );
            addBotMessage(enhanced.text, enhanced.suggestions);
            return;
          }
        }

        if (result.type === 'grade') {
          const u = { grade: result.grade };
          if (result.track) u.track = result.track;
          setUserProfile((p) => ({ ...p, ...u }));
          const r = buildGradeResponse(result.grade);
          const enhanced = addNationalityContext(r, userProfile.nationality, 'grade');
          addBotMessage(enhanced.text, enhanced.suggestions);
          return;
        }

        if (result.type === 'student') {
          setUserProfile((p) => ({ ...p, type: 'student' }));
          addBotMessage(
            `أهلاً بك! 🎓\n\nيسعدني مساعدتك في رحلتك التعليمية.\n\n**أخبرني: ما معدلك ومسارك؟**`,
            ['معدلي 95%+ علمي', 'معدلي 85% علمي', 'معدلي 75% أدبي', 'لم تظهر نتائجي بعد']
          );
          return;
        }

        if (result.type === 'parent') {
          setUserProfile((p) => ({ ...p, type: 'parent' }));
          addBotMessage(`أهلاً بك! 👨‍👩‍👧\n\n**ما معدل ابنك/ابنتك ومساره؟**`, [
            'معدله 90%+ علمي',
            'معدلها 85% علمية',
            'يريد المسار العسكري',
            'الجامعات المتاحة',
          ]);
          return;
        }

        // Default fallback
        addBotMessage(
          `لم أجد إجابة محددة لهذا السؤال. 🙏\n\n**جرّب أحد هؤلاء:**\n• اسم الجامعة: "وايل كورنيل" أو "تكساس إي أند أم"\n• معدلك: "معدلي 85% علمي"\n• تخصص: "خطة دراسة هندسة البترول"\n• سؤال: "كيف أصبح مهندس مكامن؟"\n• "اختبار التخصص"`,
          ['جامعة قطر — التفاصيل', 'خطة دراسة هندسة البترول', 'مقارنة الكليات العسكرية', 'ابدأ اختبار التخصص']
        );
      }, 400 + Math.random() * 300);
    },
    [input, testState, userProfile.nationality, userProfile.track, addBotMessage]
  );

  // ── Favorites ─────────────────────────────────────────────────────
  const addFavorite = useCallback((id) => {
    setUserProfile((p) => ({
      ...p,
      favorites: p.favorites.includes(id) ? p.favorites : [...p.favorites, id],
    }));
  }, []);

  const removeFavorite = useCallback((id) => {
    setUserProfile((p) => ({
      ...p,
      favorites: p.favorites.filter((f) => f !== id),
    }));
  }, []);

  const toggleFavorite = useCallback((id) => {
    setUserProfile((p) => ({
      ...p,
      favorites: p.favorites.includes(id) ? p.favorites.filter((f) => f !== id) : [...p.favorites, id],
    }));
  }, []);

  // ── Exposed API ───────────────────────────────────────────────────
  return {
    // state
    messages,
    input,
    isTyping,
    userProfile,
    testState,
    messagesEndRef,
    // setters
    setInput,
    setUserProfile,
    // actions
    sendMessage,
    addBotMessage,
    selectNationality,
    addFavorite,
    removeFavorite,
    toggleFavorite,
  };
}

export default useChat;
