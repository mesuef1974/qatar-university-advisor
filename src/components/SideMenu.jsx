import React, { useState } from 'react';
import PrivacyPolicy  from './PrivacyPolicy.jsx';
import TermsOfService from './TermsOfService.jsx';
import RefundPolicy   from './RefundPolicy.jsx';
import {
  GraduationCapIcon,
  ChatIcon,
  UniversityIcon,
  CompareIcon,
  StarIcon,
  LightningIcon,
  LightBulbIcon,
  BookIcon,
  PrivacyIcon,
  TermsIcon,
  RefundIcon,
  SectionsIcon,
  CloseIcon,
  ChartIcon,
} from './icons/Icons';

const LEGAL_ITEMS = [
  { key: 'privacy', label: 'سياسة الخصوصية', Icon: PrivacyIcon },
  { key: 'terms',   label: 'شروط الاستخدام',  Icon: TermsIcon },
  { key: 'refund',  label: 'سياسة الاسترجاع', Icon: RefundIcon },
];

const SECTIONS = [
  { l: 'المحادثة',   v: 'chat',         Icon: ChatIcon },
  { l: 'الجامعات',   v: 'universities',  Icon: UniversityIcon },
  { l: 'المقارنة',   v: 'compare',       Icon: CompareIcon },
  { l: 'المفضلة',    v: 'favorites',     Icon: StarIcon },
];

export default function SideMenu({
  UNIVERSITIES_DB,
  topQuestions,
  quickBtns,
  setShowMenu,
  setActiveView,
  sendMessage,
}) {
  const [legalPage, setLegalPage] = useState(null);
  const [hoveredItem, setHoveredItem] = useState(null);
  const [expandedSection, setExpandedSection] = useState({ nav: true, faq: true, unis: false, legal: false });

  // ── عرض الصفحات القانونية فوق القائمة ──
  if (legalPage === 'privacy') {
    return <PrivacyPolicy  onBack={() => setLegalPage(null)} />;
  }
  if (legalPage === 'terms') {
    return <TermsOfService onBack={() => setLegalPage(null)} />;
  }
  if (legalPage === 'refund') {
    return <RefundPolicy   onBack={() => setLegalPage(null)} />;
  }

  const toggleSection = (key) => {
    setExpandedSection(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const uniCount = UNIVERSITIES_DB ? Object.keys(UNIVERSITIES_DB).length : 23;

  return (
    <div
      className="elite-sidemenu__overlay"
      onClick={() => setShowMenu(false)}
    >
      <aside
        className="elite-sidemenu"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Header with avatar ── */}
        <div className="elite-sidemenu__header">
          <div className="elite-sidemenu__header-top">
            <div className="elite-sidemenu__avatar">
              <GraduationCapIcon size={28} color="#C5A55A" />
            </div>
            <button
              className="elite-sidemenu__close-btn"
              onClick={() => setShowMenu(false)}
              aria-label="إغلاق القائمة"
            >
              <CloseIcon size={16} color="rgba(255,255,255,0.8)" />
            </button>
          </div>
          <div className="elite-sidemenu__welcome">
            <span className="elite-sidemenu__welcome-text">مرحبا بك</span>
            <span className="elite-sidemenu__welcome-sub">المستشار الجامعي القطري</span>
          </div>
          {/* Quick stats */}
          <div className="elite-sidemenu__stats-row">
            <div className="elite-stat-card elite-stat-card--mini">
              <ChartIcon size={14} color="#C5A55A" />
              <span>{uniCount}+ جامعة</span>
            </div>
            <div className="elite-stat-card elite-stat-card--mini">
              <BookIcon size={14} color="#C5A55A" />
              <span>100+ تخصص</span>
            </div>
          </div>
        </div>

        <div className="elite-sidemenu__body">
          {/* ── التنقل ── */}
          <div className="elite-sidemenu__section">
            <button
              className="elite-section-title"
              onClick={() => toggleSection('nav')}
              aria-expanded={expandedSection.nav}
            >
              <SectionsIcon size={14} color="var(--gold, #C5A55A)" />
              <span>التنقل</span>
              <span className={`elite-section-title__chevron ${expandedSection.nav ? 'elite-section-title__chevron--open' : ''}`} />
            </button>
            {expandedSection.nav && (
              <div className="elite-sidemenu__section-items">
                {SECTIONS.map((t, i) => (
                  <button key={i}
                    aria-label={t.l}
                    className={`elite-sidemenu__item ${hoveredItem === `section-${i}` ? 'elite-sidemenu__item--hover' : ''}`}
                    onMouseEnter={() => setHoveredItem(`section-${i}`)}
                    onMouseLeave={() => setHoveredItem(null)}
                    onClick={() => { setActiveView(t.v); setShowMenu(false); }}
                  >
                    <span className="elite-sidemenu__item-icon">
                      <t.Icon size={16} color="var(--maroon, #8A1538)" />
                    </span>
                    <span className="elite-sidemenu__item-label">{t.l}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ── وصول سريع ── */}
          {quickBtns?.length > 0 && (
            <div className="elite-sidemenu__section">
              <div className="elite-section-title elite-section-title--static">
                <LightningIcon size={14} color="var(--gold, #C5A55A)" />
                <span>وصول سريع</span>
              </div>
              <div className="elite-sidemenu__chips">
                {quickBtns.map((b, i) => (
                  <button key={i}
                    className="elite-chip"
                    onClick={() => { sendMessage(b.q); setActiveView('chat'); setShowMenu(false); }}
                  >
                    <span className="elite-chip__icon">{b.icon}</span>
                    <span>{b.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ── أسئلة شائعة ── */}
          <div className="elite-sidemenu__section">
            <button
              className="elite-section-title"
              onClick={() => toggleSection('faq')}
              aria-expanded={expandedSection.faq}
            >
              <LightBulbIcon size={14} color="var(--gold, #C5A55A)" />
              <span>أسئلة شائعة</span>
              <span className={`elite-section-title__chevron ${expandedSection.faq ? 'elite-section-title__chevron--open' : ''}`} />
            </button>
            {expandedSection.faq && (
              <div className="elite-sidemenu__section-items">
                {topQuestions.map((q, i) => (
                  <button key={i}
                    className={`elite-sidemenu__faq-card ${hoveredItem === `faq-${i}` ? 'elite-sidemenu__faq-card--hover' : ''}`}
                    onMouseEnter={() => setHoveredItem(`faq-${i}`)}
                    onMouseLeave={() => setHoveredItem(null)}
                    onClick={() => { sendMessage(q); setActiveView('chat'); setShowMenu(false); }}
                  >
                    <LightBulbIcon size={12} color="var(--maroon, #8A1538)" />
                    <span>{q}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ── الجامعات ── */}
          <div className="elite-sidemenu__section">
            <button
              className="elite-section-title"
              onClick={() => toggleSection('unis')}
              aria-expanded={expandedSection.unis}
            >
              <BookIcon size={14} color="var(--maroon, #8A1538)" />
              <span>الجامعات</span>
              <span className="elite-badge">{uniCount}</span>
              <span className={`elite-section-title__chevron ${expandedSection.unis ? 'elite-section-title__chevron--open' : ''}`} />
            </button>
            {expandedSection.unis && (
              <div className="elite-sidemenu__section-items">
                {Object.values(UNIVERSITIES_DB).map((u) => (
                  <button key={u.id}
                    className={`elite-sidemenu__item ${hoveredItem === `uni-${u.id}` ? 'elite-sidemenu__item--hover' : ''}`}
                    onMouseEnter={() => setHoveredItem(`uni-${u.id}`)}
                    onMouseLeave={() => setHoveredItem(null)}
                    onClick={() => { sendMessage(`خطة دراسة ${u.name} والمواد والتخصصات وفرص العمل`); setActiveView('chat'); setShowMenu(false); }}
                  >
                    <span className="elite-sidemenu__item-icon">
                      <UniversityIcon size={14} color="var(--text-secondary, #9CA3AF)" />
                    </span>
                    <span className="elite-sidemenu__item-label">{u.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ── القانوني ── */}
          <div className="elite-sidemenu__section elite-sidemenu__section--legal">
            <button
              className="elite-section-title"
              onClick={() => toggleSection('legal')}
              aria-expanded={expandedSection.legal}
            >
              <PrivacyIcon size={14} color="var(--text-secondary, #9CA3AF)" />
              <span>معلومات قانونية</span>
              <span className={`elite-section-title__chevron ${expandedSection.legal ? 'elite-section-title__chevron--open' : ''}`} />
            </button>
            {expandedSection.legal && (
              <div className="elite-sidemenu__section-items">
                {/* eslint-disable-next-line no-unused-vars */}
                {LEGAL_ITEMS.map(({ key, label, Icon }) => (
                  <button key={key}
                    className={`elite-sidemenu__item elite-sidemenu__item--muted ${hoveredItem === `legal-${key}` ? 'elite-sidemenu__item--hover' : ''}`}
                    onMouseEnter={() => setHoveredItem(`legal-${key}`)}
                    onMouseLeave={() => setHoveredItem(null)}
                    onClick={() => setLegalPage(key)}
                  >
                    <span className="elite-sidemenu__item-icon">
                      <Icon size={14} color="var(--text-secondary, #9CA3AF)" />
                    </span>
                    <span className="elite-sidemenu__item-label">{label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── Footer ── */}
        <div className="elite-sidemenu__footer">
          <span>&copy; 2026 المستشار الجامعي القطري</span>
          <span>v5.0</span>
        </div>
      </aside>
    </div>
  );
}
