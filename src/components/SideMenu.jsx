import React, { useState } from 'react';
import PrivacyPolicy  from './PrivacyPolicy.jsx';
import TermsOfService from './TermsOfService.jsx';
import RefundPolicy   from './RefundPolicy.jsx';
import theme from '../styles/theme.js';

const LEGAL_ITEMS = [
  { key: 'privacy', label: '🔒 سياسة الخصوصية' },
  { key: 'terms',   label: '📋 شروط الاستخدام'  },
  { key: 'refund',  label: '💰 سياسة الاسترجاع' },
];

const SECTIONS = [
  { l: '💬 المحادثة',       v: 'chat'           },
  { l: '🏛️ الجامعات',      v: 'universities'   },
  { l: '📊 المقارنة',       v: 'compare'        },
  { l: '⭐ المفضلة',         v: 'favorites'      },
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

  return (
    <div
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 200, display: 'flex' }}
      onClick={() => setShowMenu(false)}
    >
      <div
        style={{ width: 280, background: 'var(--card-bg,#FFFFFF)', height: '100%', overflowY: 'auto', display: 'flex', flexDirection: 'column' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Header ── */}
        <div style={{ display: 'flex', gap: 12, padding: 20, background: theme.colors.maroon, color: theme.colors.white, alignItems: 'center', flexShrink: 0 }}>
          <span style={{ fontSize: 30 }}>🎓</span>
          <div>
            <div style={{ fontWeight: 700, fontSize: 15 }}>المستشار الجامعي القطري</div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.8)' }}>v5.0 | قاعدة معرفة شاملة</div>
          </div>
        </div>

        {/* ── وصول سريع ── */}
        {quickBtns?.length > 0 && (
          <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border,#f0f0f0)' }}>
            <div style={{ fontWeight: 700, fontSize: 12, color: theme.colors.gray500, marginBottom: 10 }}>⚡ وصول سريع</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
              {quickBtns.map((b, i) => (
                <button key={i}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 5,
                    padding: '8px 13px', borderRadius: 12,
                    background: 'var(--maroon-bg,#FEF2F2)', color: 'var(--maroon,#8A1538)',
                    border: '1px solid rgba(138,21,56,0.15)',
                    cursor: 'pointer', fontSize: 12, fontWeight: 600,
                    fontFamily: "'Tajawal',sans-serif",
                    transition: 'background 0.15s ease',
                  }}
                  onMouseEnter={e=>e.currentTarget.style.background='rgba(138,21,56,0.1)'}
                  onMouseLeave={e=>e.currentTarget.style.background='var(--maroon-bg,#FEF2F2)'}
                  onClick={() => { sendMessage(b.q); setActiveView('chat'); setShowMenu(false); }}
                >
                  <span style={{ fontSize: 14 }}>{b.icon}</span>
                  <span>{b.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── أسئلة شائعة ── */}
        <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border,#f0f0f0)' }}>
          <div style={{ fontWeight: 700, fontSize: 12, color: theme.colors.gray500, marginBottom: 8 }}>💡 أسئلة شائعة</div>
          {topQuestions.map((q, i) => (
            <button key={i}
              style={{ display: 'block', width: '100%', textAlign: 'right', padding: '9px 10px', background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, color: 'var(--text,#1a1a1a)', borderRadius: 8, marginBottom: 2 }}
              onClick={() => { sendMessage(q); setActiveView('chat'); setShowMenu(false); }}
            >{q}</button>
          ))}
        </div>

        {/* ── الجامعات ── */}
        <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border,#f0f0f0)' }}>
          <div style={{ fontWeight: 700, fontSize: 12, color: theme.colors.gray500, marginBottom: 8 }}>📚 الجامعات</div>
          {Object.values(UNIVERSITIES_DB).map((u) => (
            <button key={u.id}
              style={{ display: 'block', width: '100%', textAlign: 'right', padding: '9px 10px', background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, color: 'var(--text,#1a1a1a)', borderRadius: 8, marginBottom: 2 }}
              onClick={() => { sendMessage(`خطة دراسة ${u.name} والمواد والتخصصات وفرص العمل`); setActiveView('chat'); setShowMenu(false); }}
            >{u.icon} {u.name}</button>
          ))}
        </div>

        {/* ── الأقسام ── */}
        <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border,#f0f0f0)' }}>
          <div style={{ fontWeight: 700, fontSize: 12, color: theme.colors.gray500, marginBottom: 8 }}>🔗 الأقسام</div>
          {SECTIONS.map((t, i) => (
            <button key={i}
              aria-label={t.l.replace(/[\u{1F000}-\u{1FFFF}\u{2600}-\u{27BF}]/gu, '').trim()}
              style={{ display: 'block', width: '100%', textAlign: 'right', padding: '9px 10px', background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: 'var(--text,#1a1a1a)', borderRadius: 8, marginBottom: 2 }}
              onClick={() => { setActiveView(t.v); setShowMenu(false); }}
            >{t.l}</button>
          ))}
        </div>

        {/* ── القانوني (للمستخدمين) ── */}
        <div style={{ padding: '12px 16px', marginTop: 'auto', borderTop: '1px solid var(--border,#f0f0f0)' }}>
          <div style={{ fontWeight: 700, fontSize: 12, color: theme.colors.gray300, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>
            معلومات قانونية
          </div>
          {LEGAL_ITEMS.map(({ key, label }) => (
            <button key={key}
              style={{ display: 'block', width: '100%', textAlign: 'right', padding: '8px 10px', background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, color: theme.colors.gray500, borderRadius: 8, marginBottom: 2 }}
              onClick={() => setLegalPage(key)}
            >{label}</button>
          ))}
          <div style={{ fontSize: 12, color: theme.colors.gray300, textAlign: 'center', marginTop: 12 }}>
            © 2026 المستشار الجامعي القطري
          </div>
        </div>

      </div>
    </div>
  );
}
