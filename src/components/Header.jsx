import React, { useState, useEffect } from 'react';
import theme from '../styles/theme.js';
import {
  MenuIcon,
  GraduationCapIcon,
  SunIcon,
  MoonIcon,
  AutoThemeIcon,
  StarIcon,
  QatarFlagIcon,
  GlobeIcon,
} from './icons/Icons';

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
const THEME_LABEL = { light: 'الوضع الفاتح — انقر للوضع الداكن', dark: 'الوضع الداكن — انقر للتلقائي', auto: 'الوضع التلقائي — انقر للوضع الفاتح' };

const ThemeIconMap = { light: SunIcon, dark: MoonIcon, auto: AutoThemeIcon };

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

  /* Dark mode toggle state */
  const [themeMode, setThemeMode] = useState(getInitialTheme);
  useEffect(() => { applyTheme(themeMode); }, [themeMode]);
  const cycleTheme = () => setThemeMode(prev => THEME_CYCLE[prev] || 'auto');

  const CurrentThemeIcon = ThemeIconMap[themeMode];

  return (
    <div style={{
      background: 'linear-gradient(135deg, #8A1538 0%, #6B1030 60%, #501020 100%)',
      padding: '0 16px',
      position: 'relative',
      boxShadow: '0 2px 12px rgba(138,21,56,0.25)',
    }}>

      {/* ══ Brand bar ══ */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10,
        height: 60,
      }}>

        {/* Hamburger */}
        <button
          style={{
            ...S.hb,
            position: 'relative',
            width: 40, height: 40, minHeight: 40,
            borderRadius: 10,
            background: 'rgba(255,255,255,0.08)',
            border: '1px solid rgba(255,255,255,0.12)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer',
            transition: 'background 0.15s ease',
          }}
          onClick={() => setShowMenu(!showMenu)}
          aria-label="القائمة الجانبية"
          title="الوصول السريع والأقسام"
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}
          onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
        >
          <MenuIcon size={18} color="#FFFFFF" />
        </button>

        {/* Logo + name */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 0 }}>
          <div style={{
            width: 40, height: 40, borderRadius: 10, flexShrink: 0,
            background: 'rgba(197,165,90,0.18)',
            border: '1.5px solid rgba(197,165,90,0.4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <GraduationCapIcon size={22} color="#C5A55A" />
          </div>

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
                    display: 'inline-flex', alignItems: 'center', gap: 4,
                    fontSize: 11, fontWeight: 700,
                    padding: '2px 8px', borderRadius: 8, cursor: 'pointer',
                    border: isQatari
                      ? '1px solid rgba(197,165,90,0.5)'
                      : '1px solid rgba(255,255,255,0.22)',
                    background: isQatari
                      ? 'rgba(197,165,90,0.2)'
                      : 'rgba(255,255,255,0.12)',
                    color: isQatari ? '#F5D78E' : 'rgba(255,255,255,0.9)',
                    fontFamily: "'Tajawal',sans-serif",
                    transition: 'background 0.15s ease',
                  }}
                >
                  {isQatari
                    ? <QatarFlagIcon size={13} />
                    : <GlobeIcon size={13} color="rgba(255,255,255,0.9)" />
                  }
                  {isQatari ? ' قطري' : ' مقيم'}
                </button>
              )}
            </div>

            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.55)', marginTop: 1 }}>
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
            borderRadius: 10,
            border: '1px solid rgba(255,255,255,0.12)',
            background: 'rgba(255,255,255,0.08)',
            cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
            transition: 'background 0.15s ease',
          }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}
          onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
        >
          <CurrentThemeIcon size={16} color="#FFFFFF" />
        </button>

        {/* Favorites button */}
        <button
          style={{
            ...S.hb,
            position: 'relative',
            width: 36, height: 36, minHeight: 36,
            borderRadius: 10,
            background: activeView === 'favorites'
              ? 'rgba(197,165,90,0.2)'
              : 'rgba(255,255,255,0.08)',
            border: activeView === 'favorites'
              ? '1px solid rgba(197,165,90,0.5)'
              : '1px solid rgba(255,255,255,0.12)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer',
            transition: 'background 0.15s ease',
          }}
          onClick={() => setActiveView(activeView === 'favorites' ? 'chat' : 'favorites')}
          aria-label="المفضلة"
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(197,165,90,0.2)'}
          onMouseLeave={e => { if (activeView !== 'favorites') e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; }}
        >
          <StarIcon
            size={17}
            color={activeView === 'favorites' ? theme.colors.gold : '#FFFFFF'}
            filled={activeView === 'favorites'}
          />
          {userProfile.favorites.length > 0 && (
            <span
              aria-label={`${userProfile.favorites.length} مفضلة`}
              style={{
                position: 'absolute', top: -4, left: -4,
                background: theme.colors.gold, color: theme.colors.maroonDark,
                borderRadius: '50%', width: 16, height: 16,
                fontSize: 10, fontWeight: 900,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                border: '2px solid #6B1030',
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
          background: 'var(--card-bg,#FFFFFF)', borderRadius: 14, padding: 14,
          boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
          border: '1px solid var(--border,rgba(0,0,0,0.06))',
        }}>
          <p style={{
            fontSize: 12, color: 'var(--text-secondary,#9CA3AF)', textAlign: 'center',
            margin: '0 0 10px', fontWeight: 600,
            fontFamily: "'Tajawal',sans-serif",
          }}>
            تغيير الجنسية
          </p>
          <div style={{ display: 'flex', gap: 8 }}>
            {[
              { val: 'qatari',     label: 'قطري / قطرية', Icon: QatarFlagIcon },
              { val: 'non_qatari', label: 'مقيم في قطر',  Icon: GlobeIcon },
            // eslint-disable-next-line no-unused-vars
            ].map(({ val, label, Icon }) => (
              <button key={val}
                onClick={() => { selectNationality(val); setShowNatPicker(false); }}
                style={{
                  flex: 1, padding: '12px 8px', borderRadius: 10, cursor: 'pointer',
                  fontFamily: "'Tajawal',sans-serif", fontSize: 13, fontWeight: 700,
                  color: 'var(--text,#1C1C1E)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                  border: userProfile.nationality === val
                    ? `2px solid var(--maroon,${theme.colors.maroon})`
                    : '1.5px solid var(--border,#E5E7EB)',
                  background: userProfile.nationality === val ? 'var(--maroon-bg,#FEF2F2)' : 'var(--surface,#F9FAFB)',
                  transition: 'background 0.15s ease, border-color 0.15s ease',
                }}
              >
                <Icon size={16} color={val === 'qatari' ? undefined : 'var(--text-secondary,#6B7280)'} />
                {label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ══ Gold accent underline ══ */}
      <div style={{
        height: 2,
        background: 'linear-gradient(90deg, transparent 0%, rgba(197,165,90,0.6) 50%, transparent 100%)',
      }} />
    </div>
  );
}
