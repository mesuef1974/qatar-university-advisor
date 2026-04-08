import React from 'react';
import { ChatIcon, UniversityIcon, CompareIcon, StarIcon, CloseIcon, BookIcon, TermsIcon, PrivacyIcon } from './icons/Icons';

const navLinks = [
  { id: 'chat', label: 'المحادثة', Icon: ChatIcon },
  { id: 'universities', label: 'الجامعات', Icon: UniversityIcon },
  { id: 'compare', label: 'المقارنة', Icon: CompareIcon },
  { id: 'favorites', label: 'المفضلة', Icon: StarIcon },
];

export default function SideMenu({ UNIVERSITIES_DB: _UNIVERSITIES_DB, topQuestions, quickBtns, setShowMenu, setActiveView, sendMessage }) {
  const questions = topQuestions || [
    'ما هي أفضل الجامعات في قطر؟',
    'كيف أقدم على جامعة قطر؟',
    'ما هي المنح المتاحة؟',
    'ما الفرق بين الجامعات الحكومية والخاصة؟',
    'ما شروط القبول للطلاب الدوليين؟',
  ];

  const handleNav = (viewId) => {
    setActiveView(viewId);
    setShowMenu(false);
  };

  const handleQuestion = (q) => {
    sendMessage(q);
    setActiveView('chat');
    setShowMenu(false);
  };

  return (
    <>
      {/* Overlay */}
      <div className="eds-menu__overlay" onClick={() => setShowMenu(false)} />

      {/* Panel */}
      <aside className="eds-menu__panel">
        {/* Panel header */}
        <div className="eds-menu__head">
          <span className="eds-menu__head-title">القائمة</span>
          <button
            className="eds-menu__close"
            onClick={() => setShowMenu(false)}
            aria-label="إغلاق القائمة"
          >
            <CloseIcon size={18} color="var(--text)" />
          </button>
        </div>

        {/* Navigation */}
        <div className="eds-menu__section">
          <h3 className="eds-menu__section-title">التنقل السريع</h3>
          <nav className="eds-menu__nav">
            {navLinks.map((link) => (
              <button key={link.id} className="eds-menu__nav-item" onClick={() => handleNav(link.id)}>
                <link.Icon size={18} color="var(--maroon)" />
                <span>{link.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Common questions */}
        <div className="eds-menu__section">
          <h3 className="eds-menu__section-title">أسئلة شائعة</h3>
          <div className="eds-menu__questions">
            {questions.map((q, i) => (
              <button key={i} className="eds-menu__question" onClick={() => handleQuestion(q)}>
                {q}
              </button>
            ))}
          </div>
        </div>

        {/* Quick buttons */}
        {quickBtns && quickBtns.length > 0 && (
          <div className="eds-menu__section">
            <h3 className="eds-menu__section-title">اختصارات</h3>
            <div className="eds-menu__quick-btns">
              {quickBtns.map((btn, i) => (
                <button key={i} className="eds-menu__quick-btn" onClick={() => handleQuestion(btn.text || btn)}>
                  {btn.label || btn.text || btn}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Footer links */}
        <div className="eds-menu__footer">
          <div className="eds-menu__legal">
            <a href="#privacy" className="eds-menu__legal-link">
              <PrivacyIcon size={14} color="var(--text-muted)" />
              <span>سياسة الخصوصية</span>
            </a>
            <a href="#terms" className="eds-menu__legal-link">
              <TermsIcon size={14} color="var(--text-muted)" />
              <span>شروط الاستخدام</span>
            </a>
          </div>
          <p className="eds-menu__copyright">المستشار الجامعي القطري &copy; 2026</p>
        </div>
      </aside>
    </>
  );
}
