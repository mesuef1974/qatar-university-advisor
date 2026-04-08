import React, { useState, useEffect } from 'react';
import theme from '../styles/theme.js';

/* ── Dark-mode toggle helpers ── */
function getInitialTheme() {
  try { return localStorage.getItem('theme-preference') || 'auto'; } catch { return 'auto'; }
}

function applyTheme(mode) {
  const root = document.documentElement;
  if (mode === 'dark')  { root.setAttribute('data-theme', 'dark');  }
  else if (mode === 'light') { root.setAttribute('data-theme', 'light'); }
  else                  { root.removeAttribute('data-theme'); }
  try { localStorage.setItem('theme-preference', mode); } catch { /* noop */ }
}

const THEME_CYCLE = { light: 'dark', dark: 'auto', auto: 'light' };
const THEME_ICON  = { light: '☀️', dark: '🌙', auto: '🔄' };
const THEME_LABEL = { light: 'الوضع الفاتح — انقر للوضع الداكن', dark: 'الوضع الداكن — انقر للتلقائي', auto: 'الوضع التلقائي — انقر للوضع الفاتح' };

export default function Header({
  S,
  userProfile,
  activeView,
  setActiveView,
  showMenu,
  setShowMenu,
  _sendMessage,
  selectNationality,
}) {
  const [showNatPicker, setShowNatPicker] = useState(false);
  const isQatari = userProfile.nationality === 'qatari';

  /* Dark mode toggle state — initialise once from localStorage */
  const [themeMode, setThemeMode] = useState(getInitialTheme);

  /* Apply on mount and whenever themeMode changes */
  useEffect(() => { applyTheme(themeMode); }, [themeMode]);

  const cycleTheme = () => setThemeMode(prev => THEME_CYCLE[prev] || 'auto');

  return (
    <div style={S.hdr}>

      {/* ══ Brand bar ══ */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingBottom: 10 }}>

        {/* Hamburger — opens quick-access menu */}
        <button
          style={{ ...S.hb, position: 'relative' }}
          onClick={() => setShowMenu(!showMenu)}
          aria-label="القائمة الجانبية"
          title="الوصول السريع والأقسام"
        >
          <svg width="17" height="13" viewBox="0 0 17 13" fill="none">
            <path d="M1 1h15M1 6.5h15M1 12h15" stroke="#fff" strokeWidth="1.8" strokeLinecap="round"/>
          </svg>
          {/* Pulse dot hinting at quick actions */}
          <span style={{
            position:'absolute', top:6, right:6,
            width:6, height:6, borderRadius:'50%',
            background:theme.colors.gold,
            boxShadow:'0 0 0 0 rgba(197,165,90,0.4)',
            animation:'menuPulse 2.5s ease-out infinite',
            pointerEvents:'none',
          }}/>
        </button>

        {/* Logo + name */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 0 }}>
          <div style={{
            width: 44, height: 44, borderRadius: '50%', flexShrink: 0,
            background: 'rgba(197,165,90,0.18)',
            border: '1.5px solid rgba(197,165,90,0.45)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 24,
            filter: 'drop-shadow(0 0 6px rgba(197,165,90,0.55))',
          }}>🎓</div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap',
              fontWeight: 800, fontSize: 15, color: '#fff',
              fontFamily: "'Cairo','Tajawal',sans-serif", lineHeight: 1.2,
            }}>
              <span>المستشار الجامعي القطري</span>

              {/* Nationality badge (clickable) */}
              {userProfile.nationality && (
                <button
                  onClick={() => setShowNatPicker(p => !p)}
                  aria-label={isQatari ? 'الجنسية: قطري — انقر للتغيير' : 'الجنسية: مقيم — انقر للتغيير'}
                  aria-expanded={false}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 3,
                    fontSize: 12, fontWeight: 700,
                    padding: '3px 8px', borderRadius: 10, cursor: 'pointer',
                    border: isQatari
                      ? '1px solid rgba(197,165,90,0.5)'
                      : '1px solid rgba(255,255,255,0.22)',
                    background: isQatari
                      ? 'rgba(197,165,90,0.2)'
                      : 'rgba(255,255,255,0.12)',
                    color: isQatari ? '#F5D78E' : 'rgba(255,255,255,0.9)',
                    fontFamily: "'Tajawal',sans-serif",
                  }}
                >
                  <span role="img" aria-label={isQatari ? 'علم قطر' : 'كرة الأرض'}>{isQatari ? '🇶🇦' : '🌍'}</span>
                  {isQatari ? ' قطري' : ' مقيم'}
                </button>
              )}
            </div>

            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.58)', marginTop: 2 }}>
              {userProfile.grade
                ? `معدل ${userProfile.grade}% · ${userProfile.track || ''}`
                : '23 جامعة · قاعدة معرفة شاملة'}
            </div>
          </div>
        </div>

        {/* Dark-mode toggle button */}
        <button
          onClick={cycleTheme}
          aria-label={THEME_LABEL[themeMode]}
          title={THEME_LABEL[themeMode]}
          style={{
            width: 36, height: 36, minHeight: 36,
            borderRadius: '50%',
            border: '1.5px solid rgba(197,165,90,0.45)',
            background: 'rgba(197,165,90,0.15)',
            backdropFilter: 'blur(8px)',
            cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 16,
            flexShrink: 0,
            transition: 'background 0.2s, border-color 0.2s',
          }}
        >
          {THEME_ICON[themeMode]}
        </button>

        {/* Favorites button */}
        <button
          style={{ ...S.hb, position: 'relative' }}
          onClick={() => setActiveView(activeView === 'favorites' ? 'chat' : 'favorites')}
          aria-label="المفضلة"
        >
          <svg
            width="17" height="17" viewBox="0 0 24 24"
            fill={activeView === 'favorites' ? theme.colors.gold : 'none'}
            stroke={activeView === 'favorites' ? theme.colors.gold : theme.colors.white}
            strokeWidth="1.8" strokeLinejoin="round"
          >
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
          </svg>
          {userProfile.favorites.length > 0 && (
            <span
              aria-label={`${userProfile.favorites.length} مفضلة`}
              style={{
                position: 'absolute', top: -3, left: -3,
                background: theme.colors.gold, color: theme.colors.maroonDark,
                borderRadius: '50%', width: 16, height: 16,
                fontSize: 12, fontWeight: 900,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                border: `2px solid ${theme.colors.maroon}`,
              }}>
              <span aria-hidden="true">{userProfile.favorites.length}</span>
            </span>
          )}
        </button>
      </div>

      {/* ══ Nationality picker dropdown ══ */}
      {showNatPicker && (
        <div style={{
          position: 'absolute', top: 62, right: 12, left: 12, zIndex: 300,
          background: theme.colors.white, borderRadius: 14, padding: 14,
          boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
          border: '1px solid rgba(0,0,0,0.06)',
        }}>
          <p style={{
            fontSize: 12, color: '#9CA3AF', textAlign: 'center',
            margin: '0 0 10px', fontWeight: 600,
            fontFamily: "'Tajawal',sans-serif",
          }}>
            تغيير الجنسية
          </p>
          <div style={{ display: 'flex', gap: 8 }}>
            {[
              { val: 'qatari',     flag: '🇶🇦', label: 'قطري / قطرية' },
              { val: 'non_qatari', flag: '🌍', label: 'مقيم في قطر'  },
            ].map(({ val, flag, label }) => (
              <button key={val}
                onClick={() => { selectNationality(val); setShowNatPicker(false); }}
                style={{
                  flex: 1, padding: '12px 8px', borderRadius: 10, cursor: 'pointer',
                  fontFamily: "'Tajawal',sans-serif", fontSize: 13, fontWeight: 700,
                  color: '#1C1C1E',
                  border: userProfile.nationality === val
                    ? `2px solid ${theme.colors.maroon}`
                    : `1.5px solid ${theme.colors.gray200}`,
                  background: userProfile.nationality === val ? '#FEF2F2' : theme.colors.gray50,
                }}
              >
                {flag} {label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ══ Gold accent underline ══ */}
      <div style={{
        height: 2, margin: '0 -14px',
        background: 'linear-gradient(90deg, transparent 0%, rgba(197,165,90,0.6) 50%, transparent 100%)',
      }} />
    </div>
  );
}
