import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ALL_RESPONSES, UNIVERSITIES_DB, CAREER_TEST } from '../lib/responses.js';
import { addNationalityContext } from '../lib/nationality-advisor.js';
import UniversitiesView from './components/UniversitiesView.jsx';
import CompareView from './components/CompareView.jsx';
import FavoritesView from './components/FavoritesView.jsx';
import Header from './components/Header.jsx';
import SideMenu from './components/SideMenu.jsx';
import InfoPanel from './components/InfoPanel.jsx';
import ChatView from './components/ChatView.jsx';
import useKeyboardNav from './hooks/useKeyboardNav.js';
import './styles/accessibility.css';


// ════════════════════════════════════════════════════════════════════
// المستشار الجامعي الذكي v5.0 — محلي بالكامل، سريع، موثوق
// ════════════════════════════════════════════════════════════════════

// ── Responsive: is the viewport wide enough for two-column layout? ──
function useIsWide() {
  const [wide, setWide] = useState(() => window.innerWidth >= 1024);
  useEffect(() => {
    const handler = () => setWide(window.innerWidth >= 1024);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);
  return wide;
}

export default function QatarUniversityAdvisor() {
  const isWide = useIsWide();
  // UX-A4: Keyboard Navigation الشامل
  useKeyboardNav();
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
    if (!savedNationality) return [];
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
  const [pdfLoading, setPdfLoading] = useState(false);
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
    const msgId   = Date.now() + Math.random();
    const msgTime = new Date().toLocaleTimeString('ar-QA',{hour:'2-digit',minute:'2-digit'});
    setMessages([{
      id:msgId, type:'bot',
      content:{text:welcome.text},
      suggestions:welcome.suggestions,
      time:msgTime,
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

    if (testState.active) return { type:'test' };
    if (q.includes('اختبار') || q.includes('تحديد التخصص') || q.includes('ابدأ اختبار') || q.includes('اكتشف تخصصي')) {
      return { type:'start_test' };
    }

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

    if (q.includes('مكامن') || (q.includes('reservoir') ))
      return { type:'response', key:'reservoir_engineer' };

    if (q.includes('خطة') || q.includes('مواد') || q.includes('كورسات') || q.includes('مقررات') || q.includes('سنة') || q.includes('منهج')) {
      if (q.includes('طب') || q.includes('medicine')) return { type:'response', key:'plan_medicine' };
      if (q.includes('بترول') || q.includes('petroleum') || q.includes('tamu') || q.includes('تكساس'))
        return { type:'response', key:'plan_petroleum' };
      if (q.includes('حاسب') || q.includes('cs') || q.includes('cmu') || q.includes('كارنيجي') || q.includes('برمجة'))
        return { type:'response', key:'plan_cs' };
      if (q.includes('هندسة') || q.includes('engineering'))
        return { type:'response', key:'plan_engineering_qu' };
    }

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

    if (q.includes('sat') || q.includes('اس ايه تي') || q.includes('اختبار قبول دولي'))
      return { type:'response', key:'sat_guide' };
    if (q.includes('ielts') || q.includes('toefl') || q.includes('توفل') || q.includes('آيلتس') || q.includes('لغة إنجليزية'))
      return { type:'response', key:'ielts_guide' };

    if (q.includes('نظر') || q.includes('عيون') || q.includes('نظارة') || q.includes('عدسات') || q.includes('6/6') || q.includes('lasik') || q.includes('ليزك'))
      return { type:'response', key:'eye_vision' };

    if (q.includes('طموح') || q.includes('10,000 ريال') || (q.includes('معلم') && q.includes('راتب')))
      return { type:'response', key:'thamoon' };

    if (q.includes('أميري') || q.includes('هارفارد') || q.includes('mit') || q.includes('أكسفورد') || (q.includes('ابتعاث') && q.includes('خارج')))
      return { type:'response', key:'amiri' };

    if ((q.includes('لياقة') || q.includes('اختبار بدني') || q.includes('جري') || q.includes('ضغط')) && (q.includes('عسكري') || q.includes('كلية') || q.includes('شرطة')))
      return { type:'response', key:'fitness_military' };

    if (q.includes('مقارنة') && q.includes('عسكري'))
      return { type:'response', key:'compare_military' };

    if (q.includes('راتب') || q.includes('وظيفة') || q.includes('فرص عمل') || q.includes('توظيف') || (q.includes('مستقبل') && !q.includes('سنة')))
      return { type:'response', key:'salaries' };

    if (q.includes('موعد') || q.includes('تقديم') || q.includes('متى') && q.includes('يفتح') || q.includes('تسجيل'))
      return { type:'response', key:'deadlines' };

    if (q.includes('عسكري') || q.includes('جيش') || q.includes('ضابط') || q.includes('ملازم') || q.includes('القوات'))
      return { type:'response', key:'general_military' };

    if (q.includes('منح') || q.includes('ابتعاث') || q.includes('مجان') || q.includes('تمويل'))
      return { type:'response', key:'amiri' };

    if (q.includes('طيران') || q.includes('طيار') || q.includes('خطوط قطرية'))
      return { type:'response', key:'qaa' };

    if (q.includes('طب') || q.includes('دكتور') || q.includes('طبيب'))
      return { type:'response', key:'plan_medicine' };

    if (q.includes('هندسة') || q.includes('مهندس'))
      return { type:'response', key:'plan_engineering_qu' };

    if (q.includes('جامعات') || q.includes('خيارات') || q.includes('متاح') || q.includes('كل الجامعات') || q.includes('قائمة'))
      return { type:'response', key:'general_list' };

    const gm = q.match(/(\d{2,3})\s*%?/);
    if (gm && (q.includes('%') || q.includes('معدل') || /^\d{2,3}$/.test(q.trim()))) {
      const g = parseInt(gm[1]);
      if (g >= 50 && g <= 100) return { type:'grade', grade:g, track: q.includes('علمي')?'علمي':q.includes('أدبي')||q.includes('ادبي')?'أدبي':null };
    }

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

  // ══ Welcome / Nationality screen ══
  if (!userProfile.nationality) {
    return <InfoPanel selectNationality={selectNationality} />;
  }

  // ══ Shared nav tabs definition (used in both mobile and desktop) ══
  const NAV_TABS = [
    {view:'chat',        label:'محادثة',  svg:(a)=><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={a?2.2:1.8} strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>},
    {view:'universities',label:'جامعات', svg:(a)=><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={a?2.2:1.8} strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9,22 9,12 15,12 15,22"/></svg>},
    {view:'compare',     label:'مقارنة',  svg:(a)=><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={a?2.2:1.8} strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>},
    {view:'favorites',   label:'مفضلة',   svg:(a)=><svg width="22" height="22" viewBox="0 0 24 24" fill={a?'currentColor':'none'} stroke="currentColor" strokeWidth={a?2.2:1.8} strokeLinecap="round" strokeLinejoin="round"><polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/></svg>},
  ];

  // ── Legal footer links (reused in both layouts) ──
  const LegalFooter = () => (
    <div style={{
      display:'flex', alignItems:'center', justifyContent:'center',
      gap:16, padding:'6px 16px 8px',
      background:'#fff', borderTop:'1px solid rgba(0,0,0,0.05)',
      flexShrink:0,
    }}>
      <a href="/privacy" style={{fontSize:12,color:'#9CA3AF',textDecoration:'none',fontFamily:"'Tajawal',sans-serif",direction:'rtl',transition:'color 0.15s'}}
        onMouseEnter={e=>e.target.style.color='#8A1538'} onMouseLeave={e=>e.target.style.color='#9CA3AF'}>سياسة الخصوصية</a>
      <span style={{fontSize:12,color:'#D1D5DB'}}>·</span>
      <a href="/terms" style={{fontSize:12,color:'#9CA3AF',textDecoration:'none',fontFamily:"'Tajawal',sans-serif",direction:'rtl',transition:'color 0.15s'}}
        onMouseEnter={e=>e.target.style.color='#8A1538'} onMouseLeave={e=>e.target.style.color='#9CA3AF'}>شروط الاستخدام</a>
    </div>
  );

  // ── Secondary view renderer (universities / compare / favorites) ──
  const renderSecondaryView = (panelView) => {
    if (panelView === 'universities') return (
      <UniversitiesView S={S} UNIVERSITIES_DB={UNIVERSITIES_DB}
        expandedUni={expandedUni} setExpandedUni={setExpandedUni}
        userProfile={userProfile} compareList={compareList}
        toggleFav={toggleFav} toggleCmp={toggleCmp}
        setActiveView={setActiveView} sendMessage={sendMessage} />
    );
    if (panelView === 'compare') return (
      <CompareView S={S} UNIVERSITIES_DB={UNIVERSITIES_DB}
        compareList={compareList} setCompareList={setCompareList}
        setActiveView={setActiveView} sendMessage={sendMessage} />
    );
    if (panelView === 'favorites') return (
      <FavoritesView S={S} UNIVERSITIES_DB={UNIVERSITIES_DB}
        userProfile={userProfile} toggleFav={toggleFav}
        setActiveView={setActiveView} sendMessage={sendMessage} />
    );
    return null;
  };

  // ══════════════════════════════════════════════════════════════════
  // Desktop two-column layout (>= 1024px)
  // Right panel (RTL): Chat — always visible
  // Left panel (RTL): Secondary views — switched via bottom nav tabs
  // ══════════════════════════════════════════════════════════════════
  if (isWide) {
    // On desktop "chat" tab click focuses the right panel — left panel stays on last secondary view
    const desktopSideView = activeView === 'chat' ? 'universities' : activeView;

    return (
      <div
        dir="rtl"
        style={{
          display:'flex', flexDirection:'row', width:'100%', height:'100dvh',
          fontFamily:"'Tajawal','Segoe UI',sans-serif", background:'#EDE5DA',
          overflow:'hidden', position:'relative',
        }}
      >
        {/* ── Right panel: Chat (always visible, RTL-right = visual right) ── */}
        <div style={{
          flex:'1 1 58%', display:'flex', flexDirection:'column',
          height:'100dvh', overflow:'hidden',
          borderRight:'1px solid rgba(138,21,56,0.12)',
          background:'#EDE5DA',
        }}>
          <Header S={S} userProfile={userProfile}
            activeView={activeView} setActiveView={setActiveView}
            showMenu={showMenu} setShowMenu={setShowMenu}
            selectNationality={selectNationality} />

          {showMenu && (
            <SideMenu UNIVERSITIES_DB={UNIVERSITIES_DB}
              topQuestions={topQuestions} quickBtns={quickBtns}
              setShowMenu={setShowMenu} setActiveView={setActiveView}
              sendMessage={sendMessage} />
          )}

          <div style={{flex:1,overflow:'hidden',display:'flex',flexDirection:'column'}}>
            <ChatView messages={messages} isTyping={isTyping}
              input={input} setInput={setInput} sendMessage={sendMessage}
              messagesEndRef={messagesEndRef} userProfile={userProfile}
              pdfLoading={pdfLoading} setPdfLoading={setPdfLoading}
              suggStyle={S.sugg} />
          </div>

          <LegalFooter />
        </div>

        {/* ── Left panel: Secondary views + sidebar nav ── */}
        <div style={{
          flex:'1 1 42%', display:'flex', flexDirection:'column',
          height:'100dvh', overflow:'hidden',
          background:'#F8F5F2',
          minWidth:320, maxWidth:520,
        }}>
          {/* Sidebar header */}
          <div style={{
            background:'linear-gradient(160deg,#8A1538 0%,#6B1030 100%)',
            color:'#fff', padding:'12px 16px 10px',
            flexShrink:0, zIndex:100,
            boxShadow:'0 2px 14px rgba(107,16,48,0.3)',
            display:'flex', alignItems:'center', gap:10,
          }}>
            <span style={{fontSize:20}}>🎓</span>
            <div>
              <div style={{fontWeight:800,fontSize:15,fontFamily:"'Cairo','Tajawal',sans-serif"}}>
                {desktopSideView === 'universities' ? 'الجامعات والمعاهد' :
                 desktopSideView === 'compare'      ? 'مقارنة الجامعات'  :
                                                      'الجامعات المفضلة'}
              </div>
              <div style={{fontSize:11,color:'rgba(255,255,255,0.6)',marginTop:1,fontFamily:"'Tajawal',sans-serif"}}>
                المستشار الجامعي الذكي · قطر
              </div>
            </div>
          </div>

          {/* Secondary view content */}
          <div style={{flex:1,overflow:'hidden',display:'flex',flexDirection:'column'}}>
            {renderSecondaryView(desktopSideView)}
          </div>

          {/* Bottom nav — controls left panel content (chat tab kept for UX consistency) */}
          <nav aria-label="التنقل الثانوي" style={{
            display:'flex', background:'#fff',
            borderTop:'1px solid rgba(0,0,0,0.06)',
            flexShrink:0, zIndex:90,
            boxShadow:'0 -4px 20px rgba(0,0,0,0.07)',
          }}>
            {NAV_TABS.map((t,i) => {
              const isActive = t.view === 'chat'
                ? activeView === 'chat'
                : activeView === t.view || (activeView === 'chat' && desktopSideView === t.view);
              return (
                <button key={i}
                  aria-label={t.label}
                  aria-current={isActive ? 'page' : undefined}
                  style={{
                    flex:1, display:'flex', flexDirection:'column',
                    alignItems:'center', gap:4,
                    padding:'9px 0 7px', background:'none', border:'none',
                    cursor:'pointer', fontFamily:"'Tajawal',sans-serif",
                    fontSize:12, fontWeight:isActive ? 700 : 400,
                    color:isActive ? '#8A1538' : '#9CA3AF',
                    position:'relative', transition:'color 0.18s',
                  }}
                  onMouseEnter={e=>{if(!isActive)e.currentTarget.style.background='rgba(138,21,56,0.04)';}}
                  onMouseLeave={e=>{e.currentTarget.style.background='none';}}
                  onClick={()=>{
                    // On desktop, "chat" tab just keeps focus on right panel — left panel stays on universities
                    setActiveView(t.view === 'chat' ? 'chat' : t.view);
                  }}
                >
                  {isActive && <div style={{
                    position:'absolute',top:0,left:'22%',right:'22%',
                    height:3,borderRadius:'0 0 4px 4px',
                    background:'linear-gradient(90deg,#8A1538,#C5A55A)',
                  }}/>}
                  {t.svg(isActive)}
                  <span>{t.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <style>{`
          @keyframes bounce{0%,80%,100%{transform:translateY(0)}40%{transform:translateY(-7px)}}
          @keyframes msgIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
          @keyframes menuPulse{0%{box-shadow:0 0 0 0 rgba(197,165,90,0.6)}70%{box-shadow:0 0 0 6px rgba(197,165,90,0)}100%{box-shadow:0 0 0 0 rgba(197,165,90,0)}}
          *{box-sizing:border-box}
          ::-webkit-scrollbar{width:3px;height:3px}
          ::-webkit-scrollbar-track{background:transparent}
          ::-webkit-scrollbar-thumb{background:rgba(138,21,56,0.18);border-radius:2px}
          ::-webkit-scrollbar-thumb:hover{background:rgba(138,21,56,0.35)}
          p{margin:2px 0;line-height:1.75}
          strong{font-weight:700;color:inherit}
          input::placeholder{color:rgba(107,16,48,0.35);font-family:'Tajawal',sans-serif}
        `}</style>
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════════════
  // Mobile / Tablet single-column layout (unchanged)
  // ══════════════════════════════════════════════════════════════════
  return (
    <div style={S.app} dir="rtl" id="main-content" role="main">
      <a href="#chat-messages" className="skip-nav">
        تخطى إلى المحتوى الرئيسي | Skip to main content
      </a>

      <Header
        S={S}
        userProfile={userProfile}
        activeView={activeView}
        setActiveView={setActiveView}
        showMenu={showMenu}
        setShowMenu={setShowMenu}
        selectNationality={selectNationality}
      />

      {showMenu&&(
        <SideMenu
          UNIVERSITIES_DB={UNIVERSITIES_DB}
          topQuestions={topQuestions}
          quickBtns={quickBtns}
          setShowMenu={setShowMenu}
          setActiveView={setActiveView}
          sendMessage={sendMessage}
        />
      )}

      <div style={{flex:1,overflow:'hidden',display:'flex',flexDirection:'column'}}>
        {activeView==='chat'&&(
          <ChatView
            messages={messages}
            isTyping={isTyping}
            input={input}
            setInput={setInput}
            sendMessage={sendMessage}
            messagesEndRef={messagesEndRef}
            userProfile={userProfile}
            pdfLoading={pdfLoading}
            setPdfLoading={setPdfLoading}
            suggStyle={S.sugg}
          />
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
      </div>

      <nav
        aria-label="التنقل الرئيسي"
        style={{
          display:'flex', background:'#fff',
          borderTop:'1px solid rgba(0,0,0,0.06)',
          flexShrink:0, zIndex:90,
          boxShadow:'0 -4px 20px rgba(0,0,0,0.07)',
          paddingBottom:'env(safe-area-inset-bottom,0)',
        }}
      >
        {NAV_TABS.map((t,i)=>{
          const isActive = activeView===t.view;
          return (
            <button key={i}
              aria-label={t.label}
              aria-current={isActive ? 'page' : undefined}
              style={{
                flex:1, display:'flex', flexDirection:'column',
                alignItems:'center', gap:4,
                padding:'9px 0 7px', background:'none', border:'none',
                cursor:'pointer', fontFamily:"'Tajawal',sans-serif",
                fontSize:12, fontWeight: isActive ? 700 : 400,
                color: isActive ? '#8A1538' : '#9CA3AF',
                position:'relative', transition:'color 0.18s',
              }}
              onMouseEnter={e=>{if(!isActive)e.currentTarget.style.background='rgba(138,21,56,0.04)';}}
              onMouseLeave={e=>{e.currentTarget.style.background='none';}}
              onClick={()=>setActiveView(t.view)}
            >
              {isActive && <div style={{
                position:'absolute',top:0,left:'22%',right:'22%',
                height:3,borderRadius:'0 0 4px 4px',
                background:'linear-gradient(90deg,#8A1538,#C5A55A)',
              }}/>}
              {t.svg(isActive)}
              <span>{t.label}</span>
            </button>
          );
        })}
      </nav>

      <div style={{
        display:'flex', alignItems:'center', justifyContent:'center',
        gap:16, padding:'6px 16px 8px',
        background:'#fff', borderTop:'1px solid rgba(0,0,0,0.05)',
        flexShrink:0,
      }}>
        <a href="/privacy" style={{
          fontSize:12, color:'#9CA3AF', textDecoration:'none',
          fontFamily:"'Tajawal',sans-serif", direction:'rtl',
          transition:'color 0.15s',
        }}
          onMouseEnter={e=>e.target.style.color='#8A1538'}
          onMouseLeave={e=>e.target.style.color='#9CA3AF'}
        >سياسة الخصوصية</a>
        <span style={{ fontSize:12, color:'#D1D5DB' }}>·</span>
        <a href="/terms" style={{
          fontSize:12, color:'#9CA3AF', textDecoration:'none',
          fontFamily:"'Tajawal',sans-serif", direction:'rtl',
          transition:'color 0.15s',
        }}
          onMouseEnter={e=>e.target.style.color='#8A1538'}
          onMouseLeave={e=>e.target.style.color='#9CA3AF'}
        >شروط الاستخدام</a>
      </div>

      <style>{`
        @keyframes bounce{0%,80%,100%{transform:translateY(0)}40%{transform:translateY(-7px)}}
        @keyframes msgIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
        @keyframes menuPulse{0%{box-shadow:0 0 0 0 rgba(197,165,90,0.6)}70%{box-shadow:0 0 0 6px rgba(197,165,90,0)}100%{box-shadow:0 0 0 0 rgba(197,165,90,0)}}
        *{box-sizing:border-box}
        ::-webkit-scrollbar{width:3px;height:3px}
        ::-webkit-scrollbar-track{background:transparent}
        ::-webkit-scrollbar-thumb{background:rgba(138,21,56,0.18);border-radius:2px}
        ::-webkit-scrollbar-thumb:hover{background:rgba(138,21,56,0.35)}
        p{margin:2px 0;line-height:1.75}
        strong{font-weight:700;color:inherit}
        input::placeholder{color:rgba(107,16,48,0.35);font-family:'Tajawal',sans-serif}
      `}</style>
    </div>
  );
}

const S={
  app:(()=>{
    const w = typeof window!=='undefined' ? window.innerWidth : 400;
    if (w >= 1024) return {
      display:'flex', flexDirection:'column',
      height:'100dvh', fontFamily:"'Tajawal','Segoe UI',sans-serif",
      background:'#EDE5DA', direction:'rtl', overflow:'hidden',
      width:'100%', maxWidth:'100%', margin:0,
      position:'relative', borderRadius:0, boxShadow:'none',
    };
    if (w >= 768) return {
      display:'flex', flexDirection:'column',
      height:'100dvh', fontFamily:"'Tajawal','Segoe UI',sans-serif",
      background:'#EDE5DA', direction:'rtl', overflow:'hidden',
      width:'100%', maxWidth:520, margin:'0 auto',
      position:'relative', borderRadius:20,
      boxShadow:'0 24px 64px rgba(0,0,0,0.35)',
    };
    return {
      display:'flex', flexDirection:'column',
      height:'100dvh', fontFamily:"'Tajawal','Segoe UI',sans-serif",
      background:'#EDE5DA', direction:'rtl', overflow:'hidden',
      width:'100%', maxWidth:'100%', margin:0,
      position:'relative', borderRadius:0, boxShadow:'none',
    };
  })(),
  hdr:{
    background:'linear-gradient(160deg,#8A1538 0%,#6B1030 100%)',
    color:'#fff', padding:'8px 14px 0',
    flexShrink:0, zIndex:100,
    boxShadow:'0 2px 14px rgba(107,16,48,0.3)',
  },
  hb:{
    background:'rgba(255,255,255,0.12)',
    border:'1px solid rgba(255,255,255,0.16)',
    color:'#fff', cursor:'pointer', padding:0,
    borderRadius:10, display:'flex',
    alignItems:'center', justifyContent:'center',
    width:36, height:36, flexShrink:0,
  },
  vc:{ flex:1, overflowY:'auto', padding:'14px 12px 8px', background:'#F8F5F2' },
  vh:{
    marginBottom:16, textAlign:'center',
    padding:'8px 0 14px',
    borderBottom:'1px solid rgba(138,21,56,0.08)',
  },
  vt:{
    fontSize:20, fontWeight:800, color:'#8A1538', margin:0,
    fontFamily:"'Cairo','Tajawal',sans-serif",
  },
  vs:{ fontSize:12, color:'#9CA3AF', margin:'4px 0 0' },
  ucard:{
    background:'#fff', borderRadius:16, marginBottom:10,
    boxShadow:'0 2px 12px rgba(0,0,0,0.07)',
    overflow:'hidden', border:'1px solid rgba(0,0,0,0.04)',
  },
  ucardH:{
    display:'flex', alignItems:'center',
    justifyContent:'space-between',
    padding:'14px 16px', cursor:'pointer',
  },
  un:{ fontWeight:700, fontSize:14, color:'#1C1C1E', lineHeight:1.3, marginBottom:3 },
  badge:{ fontSize:12, padding:'3px 9px', borderRadius:10, fontWeight:700, display:'inline-block' },
  mt:{ fontSize:12, color:'#9CA3AF' },
  ib:{
    background:'rgba(138,21,56,0.06)', border:'none',
    fontSize:16, cursor:'pointer', padding:'6px 8px',
    borderRadius:8, minHeight:'auto',
    display:'flex', alignItems:'center', justifyContent:'center',
  },
  uex:{ padding:'4px 16px 16px', borderTop:'1px solid #F5F5F5' },
  chip:{
    fontSize:12, color:'#374151', background:'#F9FAFB',
    padding:'4px 10px', borderRadius:10, border:'1px solid #EAEAEA',
    display:'inline-block',
  },
  pros:{
    flex:1, background:'#F0FDF4', padding:'10px 12px',
    borderRadius:10, border:'1px solid #DCFCE7',
  },
  cons:{
    flex:1, background:'#FFF7ED', padding:'10px 12px',
    borderRadius:10, border:'1px solid #FED7AA',
  },
  ab:{
    flex:1, padding:'10px 8px', background:'#8A1538', color:'#fff',
    border:'none', borderRadius:10, fontSize:12,
    cursor:'pointer', fontWeight:700, fontFamily:"'Tajawal',sans-serif",
  },
  wb:{
    display:'block', textAlign:'center', padding:'9px',
    background:'#EFF6FF', color:'#1D4ED8', borderRadius:10,
    textDecoration:'none', fontSize:12, marginTop:10,
    border:'1px solid #BFDBFE', fontWeight:600,
  },
  cl:{
    flex:'0 0 88px', padding:'10px', fontSize:12, fontWeight:700,
    color:'#374151', background:'#FAFAFA', borderLeft:'1px solid #F0F0F0',
  },
  cc:{ flex:1, padding:'10px', fontSize:12, color:'#1C1C1E', textAlign:'center', lineHeight:1.5 },
  em:{ textAlign:'center', padding:'48px 20px', color:'#9CA3AF' },
  gb:{
    padding:'13px 24px',
    background:'linear-gradient(135deg,#8A1538 0%,#6B1030 100%)',
    color:'#fff', border:'none', borderRadius:24,
    cursor:'pointer', fontSize:14, fontWeight:700,
    display:'block', width:'100%', marginTop:10,
    fontFamily:"'Tajawal',sans-serif",
    boxShadow:'0 4px 16px rgba(138,21,56,0.25)',
  },
  sugg:{
    padding:'8px 15px',
    background:'linear-gradient(135deg,rgba(138,21,56,0.03),rgba(138,21,56,0.06))',
    border:'1px solid rgba(138,21,56,0.2)',
    borderRadius:20, fontSize:12, color:'#8A1538',
    cursor:'pointer', fontWeight:600,
    fontFamily:"'Tajawal',sans-serif",
    boxShadow:'0 1px 4px rgba(0,0,0,0.06)',
    whiteSpace:'nowrap',
    transition:'all 0.15s ease',
  },
};
