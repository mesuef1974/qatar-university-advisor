import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ALL_RESPONSES, UNIVERSITIES_DB, CAREER_TEST } from '../lib/responses.js';
import { addNationalityContext } from '../lib/nationality-advisor.js';
import UniversitiesView from './components/UniversitiesView.jsx';
import CompareView from './components/CompareView.jsx';
import FavoritesView from './components/FavoritesView.jsx';
import Header from './components/Header.jsx';
import SideMenu from './components/SideMenu.jsx';
import ExecutionPlan from './components/ExecutionPlan.jsx';

// ════════════════════════════════════════════════════════════════════
// المستشار الجامعي الذكي v5.0 — محلي بالكامل، سريع، موثوق
// ════════════════════════════════════════════════════════════════════

// ─── Render text (XSS-safe: no dangerouslySetInnerHTML) ───
function renderLine(line, idx) {
  if (!line) return <p key={idx} style={{margin:'2px 0',lineHeight:1.6,color:'#1a1a1a'}}>&nbsp;</p>;
  const parts = [];
  const regex = /\*\*(.*?)\*\*/g;
  let lastIndex = 0;
  let match;
  let pIdx = 0;
  while ((match = regex.exec(line)) !== null) {
    if (match.index > lastIndex) {
      parts.push(<React.Fragment key={pIdx++}>{line.slice(lastIndex, match.index)}</React.Fragment>);
    }
    parts.push(<strong key={pIdx++}>{match[1]}</strong>);
    lastIndex = regex.lastIndex;
  }
  if (lastIndex < line.length) {
    parts.push(<React.Fragment key={pIdx++}>{line.slice(lastIndex)}</React.Fragment>);
  }
  return <p key={idx} style={{margin:'2px 0',lineHeight:1.6,color:'#1a1a1a'}}>{parts}</p>;
}
const renderText = (text) => text.split('\n').map((line, i) => renderLine(line, i));

// ═══════════════════════════════════════════════════════
// المكون الرئيسي
// ═══════════════════════════════════════════════════════
export default function QatarUniversityAdvisor() {
  // Helper to build initial welcome message based on nationality
  const getWelcomeMessage = (nationality) => {
    if (nationality === 'qatari') {
      return {
        text: `🎓 **أهلاً بك في المستشار الجامعي الذكي!**\n🇶🇦 مرحباً بالطالب/ة القطري/ة\n\nأنا هنا لمساعدتك في اختيار جامعتك وتخصصك.\n\n✅ كل الجامعات الحكومية مجانية لك\n✅ الكليات العسكرية متاحة لك\n✅ الابتعاث الأميري والخارجي متاح\n✅ منح قطر للطاقة والخطوط القطرية وQNB\n\nيمكنك سؤالي عن أي شيء!`,
        suggestions: ['جميع الجامعات', 'الابتعاث الأميري', 'الكليات العسكرية', 'أرسل معدلك']
      };
    }
    return {
      text: `🎓 **أهلاً بك في المستشار الجامعي الذكي!**\n🌍 مرحباً بالطالب/ة المقيم/ة في قطر\n\nأنا هنا لمساعدتك في اختيار جامعتك وتخصصك.\n\n📋 خياراتك المتاحة:\n• جامعة قطر (رسوم 800-1,400 ريال/ساعة)\n• جامعات المدينة التعليمية (منح كاملة متاحة من مؤسسة قطر)\n• جامعة حمد بن خليفة HBKU (منح ممولة بالكامل لجميع الجنسيات)\n• جامعة لوسيل وUDST والكليات الخاصة\n• منحة الفاخورة للمقيمين\n\nيمكنك سؤالي عن أي شيء!`,
      suggestions: ['منح لغير القطريين', 'جامعات المدينة التعليمية', 'HBKU منح كاملة', 'أرسل معدلك']
    };
  };

  // Restore nationality and favorites from localStorage
  const savedNationality = localStorage.getItem('advisor_nationality');
  const savedFavorites = JSON.parse(localStorage.getItem('advisor_favorites') || '[]');

  const [messages, setMessages] = useState(() => {
    if (!savedNationality) return []; // No messages until nationality is selected
    const welcome = getWelcomeMessage(savedNationality);
    return [{
      id:Date.now()+Math.random(), type:'bot',
      content:{text:welcome.text},
      suggestions:welcome.suggestions,
      time:new Date().toLocaleTimeString('ar-QA',{hour:'2-digit',minute:'2-digit'})
    }];
  });
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [userProfile, setUserProfile] = useState({type:null,grade:null,track:null,favorites:savedFavorites,nationality:savedNationality||null});
  const [activeView, setActiveView] = useState('chat');
  const [showMenu, setShowMenu] = useState(false);
  const [compareList, setCompareList] = useState([]);
  const [expandedUni, setExpandedUni] = useState(null);
  const [testState, setTestState] = useState({active:false,currentQuestion:0,answers:[],traits:{}});
  const messagesEndRef = useRef(null);

  // Persist favorites to localStorage
  useEffect(() => {
    localStorage.setItem('advisor_favorites', JSON.stringify(userProfile.favorites));
  }, [userProfile.favorites]);

  // Select nationality handler
  const selectNationality = (nat) => {
    setUserProfile(p => ({...p, nationality: nat}));
    localStorage.setItem('advisor_nationality', nat);
    const welcome = getWelcomeMessage(nat);
    setMessages([{
      id:Date.now()+Math.random(), type:'bot',
      content:{text:welcome.text},
      suggestions:welcome.suggestions,
      time:new Date().toLocaleTimeString('ar-QA',{hour:'2-digit',minute:'2-digit'})
    }]);
  };

  const addBotMessage = useCallback((text, suggestions=[]) => {
    setMessages(prev=>[...prev,{
      id:Date.now()+Math.random(), type:'bot',
      content:{text}, suggestions,
      time:new Date().toLocaleTimeString('ar-QA',{hour:'2-digit',minute:'2-digit'})
    }]);
  }, []);

  useEffect(()=>{ messagesEndRef.current?.scrollIntoView({behavior:'smooth'}); },[messages]);

  // ══════════════════════════════════════════
  // محرك البحث الذكي عن الاستجابة المناسبة
  // ══════════════════════════════════════════
  const findResponse = useCallback((text) => {
    const q = text.toLowerCase().trim();

    // ─── اختبار التخصص ───
    if (testState.active) return { type:'test' };
    if (q.includes('اختبار') || q.includes('تحديد التخصص') || q.includes('ابدأ اختبار') || q.includes('اكتشف تخصصي')) {
      return { type:'start_test' };
    }

    // ─── الكشف بالكلمات المفتاحية — ترتيب الأولوية مهم ───

    // مقارنات
    if ((q.includes('مقارن') || q.includes('الفرق') || q.includes('vs') || q.includes('ولا') || q.includes('أيهما'))) {
      if ((q.includes('كورنيل') || q.includes('وايل')) && (q.includes('قطر') || q.includes('qu') || q.includes('طب')))
        return { type:'response', key:'compare_wcm_qu' };
      if ((q.includes('تكساس') || q.includes('tamu')) && (q.includes('هندسة') || q.includes('qu') || q.includes('قطر')))
        return { type:'response', key:'compare_tamu_qu' };
      if ((q.includes('كارنيجي') || q.includes('cmu')) && (q.includes('حاسب') || q.includes('qu') || q.includes('قطر')))
        return { type:'response', key:'compare_cmu_qu' };
      if (q.includes('عسكري') || q.includes('كليات الخمس') || q.includes('خمس كليات'))
        return { type:'response', key:'compare_military' };
    }

    // مهندس مكامن (سؤال محدد)
    if (q.includes('مكامن') || (q.includes('reservoir') ))
      return { type:'response', key:'reservoir_engineer' };

    // خطط دراسية
    if (q.includes('خطة') || q.includes('مواد') || q.includes('كورسات') || q.includes('مقررات') || q.includes('سنة') || q.includes('منهج')) {
      if (q.includes('طب') || q.includes('medicine')) return { type:'response', key:'plan_medicine' };
      if (q.includes('بترول') || q.includes('petroleum') || q.includes('tamu') || q.includes('تكساس'))
        return { type:'response', key:'plan_petroleum' };
      if (q.includes('حاسب') || q.includes('cs') || q.includes('cmu') || q.includes('كارنيجي') || q.includes('برمجة'))
        return { type:'response', key:'plan_cs' };
      if (q.includes('هندسة') || q.includes('engineering'))
        return { type:'response', key:'plan_engineering_qu' };
    }

    // جامعات بالاسم
    if (q.includes('وايل') || q.includes('كورنيل') || q.includes('wcm') || q.includes('cornell'))
      return { type:'response', key:'wcm' };
    if (q.includes('كارنيجي') || q.includes('كارنيغي') || q.includes('cmu') || q.includes('carnegie'))
      return { type:'response', key:'cmu' };
    if (q.includes('تكساس') || q.includes('tamu') || q.includes('texas') || q.includes('إي أند أم'))
      return { type:'response', key:'tamu' };
    if (q.includes('جورجتاون') || q.includes('georgetown'))
      return { type:'response', key:'gu' };
    if (q.includes('نورثوسترن') || q.includes('northwestern') || q.includes('إعلام') || q.includes('صحافة'))
      return { type:'response', key:'nu' };
    if (q.includes('فرجينيا') || q.includes('vcu') || q.includes('تصميم') && !q.includes('داخلي'))
      return { type:'response', key:'vcu' };
    if (q.includes('أكاديمية الطيران') || q.includes('اكاديمية الطيران') || q.includes('qaa'))
      return { type:'response', key:'qaa' };
    if (q.includes('جامعة قطر') || q.includes('جامعه قطر') || (q.includes('qu') && !q.includes('عسكر')))
      return { type:'response', key:'qu' };

    // كليات عسكرية بالاسم
    if (q.includes('أحمد بن محمد') || q.includes('احمد بن محمد') || q.includes('abmmc'))
      return { type:'response', key:'abmmc' };
    if (q.includes('الشرطة') || q.includes('بوليس') || q.includes('police'))
      return { type:'response', key:'police' };
    if (q.includes('جوية') || q.includes('الجوي') || q.includes('طيار مقاتل') || q.includes('f-16') || q.includes('مقاتل'))
      return { type:'response', key:'airforce' };
    if (q.includes('بحرية') || q.includes('بحري') || q.includes('الغانم') || q.includes('سفينة') || q.includes('سواحل'))
      return { type:'response', key:'naval' };
    if (q.includes('سيبراني') || q.includes('سايبر') || q.includes('cyber') || q.includes('اختراق') || q.includes('هاكر'))
      return { type:'response', key:'cyber' };

    // SAT / IELTS / لغة
    if (q.includes('sat') || q.includes('اس ايه تي') || q.includes('اختبار قبول دولي'))
      return { type:'response', key:'sat_guide' };
    if (q.includes('ielts') || q.includes('toefl') || q.includes('توفل') || q.includes('آيلتس') || q.includes('لغة إنجليزية'))
      return { type:'response', key:'ielts_guide' };

    // نظر / عيون
    if (q.includes('نظر') || q.includes('عيون') || q.includes('نظارة') || q.includes('عدسات') || q.includes('6/6') || q.includes('lasik') || q.includes('ليزك'))
      return { type:'response', key:'eye_vision' };

    // برنامج طموح
    if (q.includes('طموح') || q.includes('10,000 ريال') || (q.includes('معلم') && q.includes('راتب')))
      return { type:'response', key:'thamoon' };

    // الابتعاث الأميري
    if (q.includes('أميري') || q.includes('هارفارد') || q.includes('mit') || q.includes('أكسفورد') || (q.includes('ابتعاث') && q.includes('خارج')))
      return { type:'response', key:'amiri' };

    // اللياقة العسكرية
    if ((q.includes('لياقة') || q.includes('اختبار بدني') || q.includes('جري') || q.includes('ضغط')) && (q.includes('عسكري') || q.includes('كلية') || q.includes('شرطة')))
      return { type:'response', key:'fitness_military' };

    // مقارنة الكليات العسكرية
    if (q.includes('مقارنة') && q.includes('عسكري'))
      return { type:'response', key:'compare_military' };

    // رواتب / فرص عمل عامة
    if (q.includes('راتب') || q.includes('وظيفة') || q.includes('فرص عمل') || q.includes('توظيف') || (q.includes('مستقبل') && !q.includes('سنة')))
      return { type:'response', key:'salaries' };

    // مواعيد التقديم
    if (q.includes('موعد') || q.includes('تقديم') || q.includes('متى') && q.includes('يفتح') || q.includes('تسجيل'))
      return { type:'response', key:'deadlines' };

    // الكليات العسكرية عامة
    if (q.includes('عسكري') || q.includes('جيش') || q.includes('ضابط') || q.includes('ملازم') || q.includes('القوات'))
      return { type:'response', key:'general_military' };

    // المنح والابتعاث
    if (q.includes('منح') || q.includes('ابتعاث') || q.includes('مجان') || q.includes('تمويل'))
      return { type:'response', key:'amiri' };

    // الطيران عام
    if (q.includes('طيران') || q.includes('طيار') || q.includes('خطوط قطرية'))
      return { type:'response', key:'qaa' };

    // الطب عام
    if (q.includes('طب') || q.includes('دكتور') || q.includes('طبيب'))
      return { type:'response', key:'plan_medicine' };

    // الهندسة عامة
    if (q.includes('هندسة') || q.includes('مهندس'))
      return { type:'response', key:'plan_engineering_qu' };

    // قائمة الجامعات
    if (q.includes('جامعات') || q.includes('خيارات') || q.includes('متاح') || q.includes('كل الجامعات') || q.includes('قائمة'))
      return { type:'response', key:'general_list' };

    // المعدل
    const gm = q.match(/(\d{2,3})\s*%?/);
    if (gm && (q.includes('%') || q.includes('معدل') || /^\d{2,3}$/.test(q.trim()))) {
      const g = parseInt(gm[1]);
      if (g >= 50 && g <= 100) return { type:'grade', grade:g, track: q.includes('علمي')?'علمي':q.includes('أدبي')||q.includes('ادبي')?'أدبي':null };
    }

    // نوع المستخدم
    if (q.includes('أنا طالب') || (q.includes('طالب') && !q.includes('عدد') && !q.includes('كلية')))
      return { type:'student' };
    if (q.includes('ولي أمر') || q.includes('ابني') || q.includes('بنتي'))
      return { type:'parent' };

    return { type:'unknown' };
  },[testState.active]);

  // ─── نصيحة المعدل ───
  const gradeResponse = (grade, _track) => {
    if (grade>=95) return {text:`🌟 **معدل استثنائي (${grade}%)!**\n\nأمامك أرقى الخيارات:\n\n• 🏥 **وايل كورنيل للطب** (أفضل 10 عالمياً)\n• 🏥 **طب جامعة قطر**\n• 🖥️ **كارنيجي ميلون** (CS، إدارة)\n• 👑 **الابتعاث الأميري** (هارفارد/MIT)\n• ⚔️ **جميع الكليات العسكرية** بامتياز\n\n💡 اسألني عن خطة دراسة أي تخصص!`,suggestions:['وايل كورنيل — الشروط والخطة','خطة دراسة الطب','الابتعاث الأميري — الشروط','هندسة البترول في TAMU']};
    if (grade>=90) return {text:`🌟 **معدل ممتاز (${grade}%)!**\n\nمتاح لك:\n• 🏥 كلية الطب — جامعة قطر\n• 🦷 طب الأسنان — جامعة قطر\n• 🖥️ كارنيجي ميلون\n• ⚙️ تكساس إي أند أم (هندسة بترول)\n• 🌐 جورجتاون\n• ⚔️ جميع الكليات العسكرية`,suggestions:['خطة دراسة الطب في QU','هندسة البترول في TAMU','كارنيجي ميلون — التفاصيل','مقارنة كورنيل وطب QU']};
    if (grade>=85) return {text:`⭐ **معدل ممتاز (${grade}%)!**\n\nمتاح لك:\n• ⚙️ تكساس إي أند أم (هندسة بترول)\n• 🖥️ كارنيجي ميلون\n• 🌐 جورجتاون\n• 💊 الصيدلة — جامعة قطر\n• ⚔️ جميع الكليات العسكرية`,suggestions:['هندسة البترول — خطة السنوات الأربع','كارنيجي ميلون — الشروط','الكليات العسكرية المتاحة','الصيدلة vs الطب']};
    if (grade>=80) return {text:`✅ **معدل جيد جداً (${grade}%)!**\n\nمتاح لك:\n• ⚙️ الهندسة — جامعة قطر (7 تخصصات)\n• 📺 نورثوسترن (إعلام)\n• 🎨 فرجينيا كومنولث\n• 👩‍⚕️ التمريض والعلوم الصحية\n• ⚔️ كلية أحمد بن محمد، الشرطة، الجوية`,suggestions:['خطة دراسة الهندسة في QU','الإعلام في نورثوسترن','الكليات العسكرية بمعدل 80%','فرص عمل الهندسة في قطر']};
    if (grade>=75) return {text:`📚 **معدل جيد (${grade}%)!**\n\nمتاح لك:\n• 📚 آداب وعلوم — جامعة قطر\n• 💼 الإدارة والاقتصاد\n• 🎓 التربية + برنامج طموح (10,000 ريال/شهر)\n• 🎨 فرجينيا كومنولث\n• ⚔️ أحمد بن محمد (ذكور)، الشرطة`,suggestions:['برنامج طموح — تفاصيل','خطة دراسة الإدارة في QU','فرجينيا كومنولث — التصميم','الكليات العسكرية بمعدل 75%']};
    if (grade>=70) return {text:`📚 **معدل مقبول (${grade}%)!**\n\nمتاح لك:\n• 📚 جامعة قطر — كليات الآداب والإدارة والشريعة والتربية\n• ✈️ أكاديمية الطيران (علمي + نظر 6/6)\n• ⚔️ كلية أحمد بن محمد (ذكور)\n• 👮 أكاديمية الشرطة`,suggestions:['جامعة قطر — الكليات المتاحة','أكاديمية الطيران — الشروط','أحمد بن محمد العسكرية','برنامج طموح']};
    return {text:`📝 **معدل ${grade}% — أقل من الحد الأدنى لمعظم الجامعات**\n\nلا تقلق! لديك خيارات:\n• 📘 كلية المجتمع قطر (دبلوم مشارك)\n• 🔄 إعادة الثانوية لتحسين المعدل\n• 🛠️ معاهد التدريب المهني\n\n💡 الدبلوم المشارك يمكنك لاحقاً من الانتقال للجامعة!`,suggestions:['كلية المجتمع قطر','كيف أحسّن معدلي؟','التدريب المهني في قطر','هل يمكنني الانتقال للجامعة لاحقاً؟']};
  };

  // ─── اختبار التخصص ───
  const calcTestResult = (traits) => {
    const cats = {
      engineering:(traits.engineering||0)+(traits.technical||0)+(traits.analytical||0),
      medical:(traits.medical||0)+(traits.humanitarian||0)+(traits.scientific||0),
      military:(traits.military||0)+(traits.patriotic||0)+(traits.physical||0),
      business:(traits.business||0)+(traits.ambitious||0)+(traits.practical||0),
      creative:(traits.creative||0)+(traits.artistic||0)+(traits.innovative||0),
      aviation:(traits.adventurous||0)+(traits.physical||0)*0.5+(traits.technical||0)*0.5,
      international:(traits.international||0)+(traits.social||0)+(traits.communication||0)
    };
    return CAREER_TEST.results[Object.entries(cats).sort((a,b)=>b[1]-a[1])[0][0]];
  };

  // ─── إرسال رسالة ───
  const sendMessage = useCallback((text=input) => {
    if (!text.trim()) return;
    const userText = text.trim();

    setMessages(prev=>[...prev,{
      id:Date.now(), type:'user',
      content:{text:userText},
      time:new Date().toLocaleTimeString('ar-QA',{hour:'2-digit',minute:'2-digit'})
    }]);
    setInput('');
    setIsTyping(true);

    setTimeout(()=>{
      setIsTyping(false);

      // ─── اختبار التخصص نشط ───
      if (testState.active) {
        const q = CAREER_TEST.questions[testState.currentQuestion];
        const sel = q.options.find(o => userText.includes(o.text.substring(0,6)));
        if (!sel) {
          addBotMessage(`⚠️ الرجاء اختيار إجابة من الخيارات.`, q.options.map(o=>o.text));
          return;
        }
        const traits = {...testState.traits};
        Object.entries(sel.traits).forEach(([t,v])=>{ traits[t]=(traits[t]||0)+v; });
        const next = testState.currentQuestion + 1;
        if (next >= CAREER_TEST.questions.length) {
          setTestState({active:false,currentQuestion:0,answers:[],traits:{}});
          const r = calcTestResult(traits);
          addBotMessage(
            `🎉 **نتيجة اختبار التخصص**\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n${r.icon} **التخصص المناسب لك:**\n**${r.title}**\n\n${r.description}\n\n**🏛️ الجامعات المقترحة:**\n${r.universities.map(id=>`• ${UNIVERSITIES_DB[id]?.icon} ${UNIVERSITIES_DB[id]?.name}`).join('\n')}\n\n**💼 المسارات المهنية:**\n${r.careers.join(' | ')}\n\n💡 اسألني عن خطة أي تخصص أو جامعة بالتفصيل!`,
            [...r.universities.map(id=>UNIVERSITIES_DB[id]?.name||id).slice(0,3), 'خطة دراسية مفصلة']
          );
        } else {
          setTestState({active:true, currentQuestion:next, answers:[], traits});
          const nq = CAREER_TEST.questions[next];
          addBotMessage(`✅ تم!\n\n**📝 السؤال ${next+1} من 10:**\n\n${nq.question}`, nq.options.map(o=>o.text));
        }
        return;
      }

      // ─── البحث عن الرد المناسب ───
      const result = findResponse(userText);

      if (result.type === 'start_test') {
        setTestState({active:true,currentQuestion:0,answers:[],traits:{}});
        const q0 = CAREER_TEST.questions[0];
        addBotMessage(`🎯 **اختبار تحديد التخصص**\n\n10 أسئلة تساعدك لاكتشاف التخصص الأنسب لشخصيتك.\n\n**📝 السؤال 1 من 10:**\n\n${q0.question}`, q0.options.map(o=>o.text));
        return;
      }

      if (result.type === 'response') {
        const r = ALL_RESPONSES[result.key];
        if (r) {
          const enhanced = addNationalityContext({text: r.text, suggestions: r.suggestions || []}, userProfile.nationality, result.key);
          addBotMessage(enhanced.text, enhanced.suggestions);
          return;
        }
      }

      if (result.type === 'grade') {
        const u = {grade:result.grade};
        if (result.track) u.track = result.track;
        setUserProfile(p=>({...p,...u}));
        const r = gradeResponse(result.grade, result.track || userProfile.track);
        const enhanced = addNationalityContext(r, userProfile.nationality, 'grade');
        addBotMessage(enhanced.text, enhanced.suggestions);
        return;
      }

      if (result.type === 'student') {
        setUserProfile(p=>({...p,type:'student'}));
        addBotMessage(`أهلاً بك! 🎓\n\nيسعدني مساعدتك في رحلتك التعليمية.\n\n**أخبرني: ما معدلك ومسارك؟**`,
          ['معدلي 95%+ علمي','معدلي 85% علمي','معدلي 75% أدبي','لم تظهر نتائجي بعد']);
        return;
      }

      if (result.type === 'parent') {
        setUserProfile(p=>({...p,type:'parent'}));
        addBotMessage(`أهلاً بك! 👨‍👩‍👧\n\n**ما معدل ابنك/ابنتك ومساره؟**`,
          ['معدله 90%+ علمي','معدلها 85% علمية','يريد المسار العسكري','الجامعات المتاحة']);
        return;
      }

      // رد افتراضي مفيد
      addBotMessage(
        `لم أجد إجابة محددة لهذا السؤال. 🙏\n\n**جرّب أحد هؤلاء:**\n• اسم الجامعة: "وايل كورنيل" أو "تكساس إي أند أم"\n• معدلك: "معدلي 85% علمي"\n• تخصص: "خطة دراسة هندسة البترول"\n• سؤال: "كيف أصبح مهندس مكامن؟"\n• "اختبار التخصص"`,
        ['جامعة قطر — التفاصيل','خطة دراسة هندسة البترول','مقارنة الكليات العسكرية','ابدأ اختبار التخصص']
      );
    }, 400 + Math.random()*300);
  },[input, testState, findResponse, userProfile.track, userProfile.nationality, addBotMessage]);

  const toggleFav = (id) => setUserProfile(p=>({...p,favorites:p.favorites.includes(id)?p.favorites.filter(f=>f!==id):[...p.favorites,id]}));
  const toggleCmp = (id) => setCompareList(p=>p.includes(id)?p.filter(c=>c!==id):p.length<3?[...p,id]:p);

  const quickBtns = [
    {icon:'📚',label:'الخطط',q:'خطة دراسة هندسة البترول'},
    {icon:'💼',label:'الوظائف',q:'فرص العمل والرواتب في قطر'},
    {icon:'⚔️',label:'العسكرية',q:'مقارنة الكليات العسكرية الخمس'},
    {icon:'🏥',label:'الطب',q:'خطة دراسة الطب'},
    {icon:'🎯',label:'اختبار',q:'ابدأ اختبار التخصص'},
    {icon:'🎓',label:'المنح',q:'الابتعاث الأميري'}
  ];

  const topQuestions = [
    'كيف أصبح مهندس مكامن في قطر للطاقة؟',
    'خطة دراسة الطب سنة بسنة',
    'مقارنة كورنيل مع طب QU',
    'هندسة البترول vs الكيميائية',
    'الكليات العسكرية — مقارنة كاملة',
    'SAT — كيف أستعد؟'
  ];

  // Welcome screen when no nationality selected
  if (!userProfile.nationality) {
    return (
      <div style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',height:'100dvh',background:'linear-gradient(135deg, #8A1538 0%, #6B1030 100%)',color:'#fff',textAlign:'center',padding:20,direction:'rtl'}}>
        <div style={{fontSize:60,marginBottom:20}}>🎓</div>
        <h1 style={{fontSize:28,fontWeight:800,marginBottom:8,fontFamily:"'Cairo','Tajawal',sans-serif"}}>المستشار الجامعي الذكي</h1>
        <p style={{fontSize:16,opacity:0.85,marginBottom:40}}>دليلك الشامل للجامعات والتخصصات والمنح في قطر</p>
        <p style={{fontSize:18,fontWeight:600,marginBottom:20}}>أنا طالب/ة...</p>
        <div style={{display:'flex',gap:16,flexWrap:'wrap',justifyContent:'center'}}>
          <button onClick={()=>selectNationality('qatari')} style={{
            padding:'16px 40px',borderRadius:12,border:'2px solid #C5A55A',
            background:'rgba(197,165,90,0.15)',color:'#fff',fontSize:18,fontWeight:700,
            cursor:'pointer',minWidth:180,transition:'all 0.3s',fontFamily:"'Tajawal',sans-serif"
          }}>
            🇶🇦 قطري / قطرية
          </button>
          <button onClick={()=>selectNationality('non_qatari')} style={{
            padding:'16px 40px',borderRadius:12,border:'2px solid rgba(255,255,255,0.3)',
            background:'rgba(255,255,255,0.1)',color:'#fff',fontSize:18,fontWeight:700,
            cursor:'pointer',minWidth:180,transition:'all 0.3s',fontFamily:"'Tajawal',sans-serif"
          }}>
            🌍 مقيم / غير قطري
          </button>
        </div>
        <p style={{marginTop:30,fontSize:13,opacity:0.6}}>يمكنك تغيير اختيارك لاحقاً من الإعدادات</p>
      </div>
    );
  }

  return (
    <div style={S.app} dir="rtl">
      {/* Header */}
      <Header
        S={S}
        userProfile={userProfile}
        activeView={activeView}
        setActiveView={setActiveView}
        showMenu={showMenu}
        setShowMenu={setShowMenu}
        quickBtns={quickBtns}
        sendMessage={sendMessage}
        selectNationality={selectNationality}
      />

      {/* Side Menu */}
      {showMenu&&(
        <SideMenu
          S={S}
          UNIVERSITIES_DB={UNIVERSITIES_DB}
          topQuestions={topQuestions}
          setShowMenu={setShowMenu}
          setActiveView={setActiveView}
          sendMessage={sendMessage}
        />
      )}

      {/* Bottom Nav */}
      <div style={{display:'flex',background:'#fff',borderTop:'1px solid #e5e7eb',flexShrink:0,zIndex:90}}>
        {[{icon:'💬',label:'محادثة',view:'chat'},{icon:'🏛️',label:'جامعات',view:'universities'},{icon:'📊',label:'مقارنة',view:'compare'},{icon:'⭐',label:'مفضلة',view:'favorites'},{icon:'🗺️',label:'الخطة',view:'execution-plan'}].map((t,i)=>(
          <button key={i} style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',gap:2,padding:'10px 0',minHeight:50,background:'none',border:'none',cursor:'pointer',fontSize:11,transition:'color 0.2s',...(activeView===t.view?{color:'#8A1538',borderTop:'2px solid #C5A55A'}:{color:'#6b7280'})}} onClick={()=>setActiveView(t.view)}>
            <span style={{fontSize:20}}>{t.icon}</span><span>{t.label}</span>
          </button>
        ))}
      </div>

      {/* Main */}
      <div style={{flex:1,overflow:'hidden',display:'flex',flexDirection:'column'}}>
        {activeView==='chat'&&(
          <>
            <div style={{flex:1,overflowY:'auto',padding:'12px 12px 4px'}}>
              {messages.map(msg=>(
                <div key={msg.id} style={{display:'flex',gap:8,marginBottom:12,alignItems:'flex-end',justifyContent:msg.type==='user'?'flex-start':'flex-end'}}>
                  {msg.type==='bot'&&<div style={{width:30,height:30,background:'#8A1538',borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',fontSize:14,flexShrink:0}}>🎓</div>}
                  <div style={{maxWidth:'82%'}}>
                    <div style={{padding:'8px 12px',borderRadius:12,fontSize:13,wordBreak:'break-word',boxShadow:'0 1px 3px rgba(0,0,0,0.1)',color:'#111827',lineHeight:1.6,...(msg.type==='user'?{background:'#FCE4EC',borderTopLeftRadius:3}:{background:'#fff',borderTopRightRadius:3})}}>
                      {renderText(msg.content.text)}
                      <div style={{fontSize:10,color:'#8696a0',textAlign:'left',marginTop:4}}>{msg.time}</div>
                    </div>
                    {msg.suggestions?.length>0&&(
                      <div style={{display:'flex',flexWrap:'wrap',gap:5,marginTop:5}}>
                        {msg.suggestions.map((s,i)=>(
                          <button key={i} style={S.sugg} onClick={()=>sendMessage(s)}>{s}</button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {isTyping&&(
                <div style={{display:'flex',gap:8,marginBottom:12,alignItems:'flex-end',justifyContent:'flex-end'}}>
                  <div style={{width:30,height:30,background:'#8A1538',borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',fontSize:14}}>🎓</div>
                  <div style={{background:'#fff',padding:'10px 16px',borderRadius:12,display:'flex',gap:4,alignItems:'center'}}>
                    {[0,0.2,0.4].map((d,i)=><span key={i} style={{width:7,height:7,background:'#8696a0',borderRadius:'50%',display:'inline-block',animation:`bounce 1.2s ${d}s infinite`}}/>)}
                  </div>
                </div>
              )}
              <div ref={messagesEndRef}/>
            </div>

            {/* Quick questions bar */}
            <div style={{display:'flex',gap:6,padding:'5px 12px',background:'#f8f9fa',borderTop:'1px solid #eee',overflowX:'auto',flexShrink:0,alignItems:'center'}}>
              <span style={{fontSize:11,color:'#6b7280',flexShrink:0}}>💡</span>
              {['هندسة البترول','الكليات العسكرية','وايل كورنيل','الابتعاث الأميري','SAT دليل'].map((q,i)=>(
                <button key={i} style={{padding:'3px 9px',background:'#FEF2F2',border:'1px solid #8A1538',borderRadius:12,fontSize:11,color:'#8A1538',cursor:'pointer',whiteSpace:'nowrap',flexShrink:0}} onClick={()=>sendMessage(q)}>{q}</button>
              ))}
            </div>

            <div style={{display:'flex',gap:8,padding:'8px 12px',paddingBottom:'max(8px, env(safe-area-inset-bottom, 8px))',background:'#f0f0f0',alignItems:'center',flexShrink:0}}>
              <input style={{flex:1,padding:'10px 14px',border:'none',borderRadius:22,fontSize:16,outline:'none',background:'#fff',color:'#111827',textAlign:'right',boxShadow:'0 1px 3px rgba(0,0,0,0.1)',minHeight:44}}
                value={input} onChange={e=>setInput(e.target.value)}
                onKeyDown={e=>e.key==='Enter'&&sendMessage()}
                placeholder="اسأل عن خطة دراسية، مواد، فرص عمل، مقارنة..."/>
              <button style={{width:42,height:42,borderRadius:'50%',background:'#8A1538',border:'none',color:'#fff',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',transform:'rotate(180deg)'}}
                onClick={()=>sendMessage()}><span style={{fontSize:20}}>➤</span></button>
            </div>
          </>
        )}
        {activeView==='universities'&&(
          <UniversitiesView
            S={S}
            UNIVERSITIES_DB={UNIVERSITIES_DB}
            expandedUni={expandedUni}
            setExpandedUni={setExpandedUni}
            userProfile={userProfile}
            compareList={compareList}
            toggleFav={toggleFav}
            toggleCmp={toggleCmp}
            setActiveView={setActiveView}
            sendMessage={sendMessage}
          />
        )}
        {activeView==='compare'&&(
          <CompareView
            S={S}
            UNIVERSITIES_DB={UNIVERSITIES_DB}
            compareList={compareList}
            setCompareList={setCompareList}
            setActiveView={setActiveView}
            sendMessage={sendMessage}
          />
        )}
        {activeView==='favorites'&&(
          <FavoritesView
            S={S}
            UNIVERSITIES_DB={UNIVERSITIES_DB}
            userProfile={userProfile}
            toggleFav={toggleFav}
            setActiveView={setActiveView}
            sendMessage={sendMessage}
          />
        )}
        {activeView==='execution-plan'&&<ExecutionPlan />}
      </div>

      <style>{`
        @keyframes bounce{0%,80%,100%{transform:translateY(0)}40%{transform:translateY(-6px)}}
        *{box-sizing:border-box}
        ::-webkit-scrollbar{width:4px}
        ::-webkit-scrollbar-thumb{background:#8A1538;border-radius:2px}
        p{margin:2px 0;line-height:1.6}
        strong{font-weight:700}
      `}</style>
    </div>
  );
}

const S={
  app:{display:'flex',flexDirection:'column',height:'100dvh',fontFamily:"'Tajawal','Segoe UI',sans-serif",background:'#F5F0EB',direction:'rtl',overflow:'hidden',maxWidth:480,margin:'0 auto',position:'relative',boxShadow:window.innerWidth>768?'0 0 40px rgba(138,21,56,0.15)':'none'},
  hdr:{background:'#8A1538',color:'#fff',padding:'8px 12px 0',flexShrink:0,zIndex:100},
  hb:{background:'none',border:'none',color:'#fff',cursor:'pointer',padding:'4px 8px',borderRadius:6,position:'relative'},
  vc:{flex:1,overflowY:'auto',padding:12},
  vh:{marginBottom:12,textAlign:'center'},
  vt:{fontSize:17,fontWeight:700,color:'#8A1538',margin:0},
  vs:{fontSize:12,color:'#6b7280',margin:'3px 0 0'},
  ucard:{background:'#fff',borderRadius:12,marginBottom:10,boxShadow:'0 1px 4px rgba(0,0,0,0.1)',overflow:'hidden'},
  ucardH:{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'12px 14px',cursor:'pointer'},
  un:{fontWeight:700,fontSize:14,color:'#1a1a1a'},
  badge:{color:'#fff',fontSize:10,padding:'2px 6px',borderRadius:8,fontWeight:600},
  mt:{fontSize:11,color:'#6b7280'},
  ib:{background:'none',border:'none',fontSize:18,cursor:'pointer',padding:4},
  uex:{padding:'0 14px 14px',borderTop:'1px solid #f0f0f0'},
  chip:{fontSize:11,color:'#374151',background:'#f9fafb',padding:'3px 8px',borderRadius:8},
  pros:{flex:1,background:'#f0fdf4',padding:'8px 10px',borderRadius:8},
  cons:{flex:1,background:'#fff7ed',padding:'8px 10px',borderRadius:8},
  ab:{flex:1,padding:'8px',background:'#8A1538',color:'#fff',border:'none',borderRadius:8,fontSize:12,cursor:'pointer',fontWeight:600},
  wb:{display:'block',textAlign:'center',padding:'6px',background:'#e0f2fe',color:'#0369a1',borderRadius:8,textDecoration:'none',fontSize:12,marginTop:8},
  cl:{flex:'0 0 95px',padding:'9px 10px',fontSize:11,fontWeight:600,color:'#374151',background:'#f9fafb',borderLeft:'1px solid #f0f0f0'},
  cc:{flex:1,padding:'9px 10px',fontSize:11,color:'#1a1a1a',textAlign:'center'},
  em:{textAlign:'center',padding:40,color:'#6b7280'},
  gb:{padding:'10px 20px',background:'#8A1538',color:'#fff',border:'none',borderRadius:20,cursor:'pointer',fontSize:13,fontWeight:600,display:'block',width:'100%',marginTop:8},
  sugg:{padding:'5px 10px',background:'#fff',border:'1px solid #8A1538',borderRadius:14,fontSize:12,color:'#8A1538',cursor:'pointer',marginBottom:4}
};
