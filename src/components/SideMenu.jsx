import React, { useState } from 'react';
import PrivacyPolicy  from './PrivacyPolicy.jsx';
import TermsOfService from './TermsOfService.jsx';
import RefundPolicy   from './RefundPolicy.jsx';
// theme imported via CSS variables
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

  const menuItemStyle = (key) => ({
    display: 'flex', width: '100%', textAlign: 'right', alignItems: 'center', gap: 8,
    padding: '10px 12px', background: hoveredItem === key ? 'var(--surface, #F9FAFB)' : 'none',
    border: 'none', cursor: 'pointer', fontSize: 13, color: 'var(--text,#1a1a1a)',
    borderRadius: 8, marginBottom: 2,
    fontFamily: "'Tajawal',sans-serif",
    transition: 'background 0.15s ease',
  });

  return (
    <div
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 200, display: 'flex' }}
      onClick={() => setShowMenu(false)}
    >
      <div
        style={{
          width: 280, background: 'var(--card-bg,#FFFFFF)', height: '100%',
          overflowY: 'auto', display: 'flex', flexDirection: 'column',
          boxShadow: '4px 0 24px rgba(0,0,0,0.12)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Header ── */}
        <div style={{
          display: 'flex', gap: 12, padding: '16px 20px',
          background: 'linear-gradient(135deg, #8A1538 0%, #6B1030 100%)',
          color: '#FFFFFF', alignItems: 'center', flexShrink: 0,
        }}>
          <div style={{
            width: 38, height: 38, borderRadius: 10,
            background: 'rgba(197,165,90,0.2)',
            border: '1.5px solid rgba(197,165,90,0.4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <GraduationCapIcon size={22} color="#C5A55A" />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 15, fontFamily: "'Cairo','Tajawal',sans-serif" }}>
              المستشار الجامعي القطري
            </div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.65)' }}>v5.0 | قاعدة معرفة شاملة</div>
          </div>
        </div>

        {/* ── وصول سريع ── */}
        {quickBtns?.length > 0 && (
          <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border,#f0f0f0)' }}>
            <div style={{
              fontWeight: 700, fontSize: 12, color: 'var(--text-secondary, #6B7280)',
              marginBottom: 10, display: 'flex', alignItems: 'center', gap: 5,
            }}>
              <LightningIcon size={13} color="var(--gold, #C5A55A)" />
              وصول سريع
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
              {quickBtns.map((b, i) => (
                <button key={i}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 5,
                    padding: '8px 13px', borderRadius: 'var(--radius-md, 12px)',
                    background: 'var(--maroon-bg,#FEF2F2)', color: 'var(--maroon,#8A1538)',
                    border: '1px solid rgba(138,21,56,0.15)',
                    cursor: 'pointer', fontSize: 12, fontWeight: 600,
                    fontFamily: "'Tajawal',sans-serif",
                    transition: 'background 0.15s ease, transform 0.15s ease',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(138,21,56,0.1)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'var(--maroon-bg,#FEF2F2)'; e.currentTarget.style.transform = 'translateY(0)'; }}
                  onClick={() => { sendMessage(b.q); setActiveView('chat'); setShowMenu(false); }}
                >
                  <span style={{ fontSize: 13, display: 'flex' }}>{b.icon}</span>
                  <span>{b.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── أسئلة شائعة ── */}
        <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border,#f0f0f0)' }}>
          <div style={{
            fontWeight: 700, fontSize: 12, color: 'var(--text-secondary, #6B7280)',
            marginBottom: 8, display: 'flex', alignItems: 'center', gap: 5,
          }}>
            <LightBulbIcon size={13} color="var(--gold, #C5A55A)" />
            أسئلة شائعة
          </div>
          {topQuestions.map((q, i) => (
            <button key={i}
              style={menuItemStyle(`faq-${i}`)}
              onMouseEnter={() => setHoveredItem(`faq-${i}`)}
              onMouseLeave={() => setHoveredItem(null)}
              onClick={() => { sendMessage(q); setActiveView('chat'); setShowMenu(false); }}
            >{q}</button>
          ))}
        </div>

        {/* ── الجامعات ── */}
        <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border,#f0f0f0)' }}>
          <div style={{
            fontWeight: 700, fontSize: 12, color: 'var(--text-secondary, #6B7280)',
            marginBottom: 8, display: 'flex', alignItems: 'center', gap: 5,
          }}>
            <BookIcon size={13} color="var(--maroon, #8A1538)" />
            الجامعات
          </div>
          {Object.values(UNIVERSITIES_DB).map((u) => (
            <button key={u.id}
              style={menuItemStyle(`uni-${u.id}`)}
              onMouseEnter={() => setHoveredItem(`uni-${u.id}`)}
              onMouseLeave={() => setHoveredItem(null)}
              onClick={() => { sendMessage(`خطة دراسة ${u.name} والمواد والتخصصات وفرص العمل`); setActiveView('chat'); setShowMenu(false); }}
            >
              <UniversityIcon size={14} color="var(--text-secondary, #9CA3AF)" />
              <span style={{ flex: 1 }}>{u.name}</span>
            </button>
          ))}
        </div>

        {/* ── الأقسام ── */}
        <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border,#f0f0f0)' }}>
          <div style={{
            fontWeight: 700, fontSize: 12, color: 'var(--text-secondary, #6B7280)',
            marginBottom: 8, display: 'flex', alignItems: 'center', gap: 5,
          }}>
            <SectionsIcon size={13} color="var(--text-secondary, #6B7280)" />
            الأقسام
          </div>
          {SECTIONS.map((t, i) => (
            <button key={i}
              aria-label={t.l}
              style={menuItemStyle(`section-${i}`)}
              onMouseEnter={() => setHoveredItem(`section-${i}`)}
              onMouseLeave={() => setHoveredItem(null)}
              onClick={() => { setActiveView(t.v); setShowMenu(false); }}
            >
              <t.Icon size={16} color="var(--maroon, #8A1538)" />
              <span>{t.l}</span>
            </button>
          ))}
        </div>

        {/* ── القانوني ── */}
        <div style={{ padding: '12px 16px', marginTop: 'auto', borderTop: '1px solid var(--border,#f0f0f0)' }}>
          <div style={{
            fontWeight: 700, fontSize: 11, color: 'var(--text-secondary, #9CA3AF)',
            marginBottom: 8, letterSpacing: 0.5,
          }}>
            معلومات قانونية
          </div>
          {/* eslint-disable-next-line no-unused-vars */}
          {LEGAL_ITEMS.map(({ key, label, Icon }) => (
            <button key={key}
              style={menuItemStyle(`legal-${key}`)}
              onMouseEnter={() => setHoveredItem(`legal-${key}`)}
              onMouseLeave={() => setHoveredItem(null)}
              onClick={() => setLegalPage(key)}
            >
              <Icon size={14} color="var(--text-secondary, #9CA3AF)" />
              <span style={{ color: 'var(--text-secondary, #6B7280)' }}>{label}</span>
            </button>
          ))}
          <div style={{
            fontSize: 11, color: 'var(--text-secondary, #9CA3AF)',
            textAlign: 'center', marginTop: 12, paddingBottom: 4,
          }}>
            © 2026 المستشار الجامعي القطري
          </div>
        </div>

      </div>
    </div>
  );
}
