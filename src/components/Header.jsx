import React, { useState, useEffect, useRef } from 'react';
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
  ChatIcon,
  UniversityIcon,
  CompareIcon,
  CloseIcon,
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

const NAV_TABS = [
  { key: 'chat',        label: 'المحادثة',  Icon: ChatIcon },
  { key: 'universities', label: 'الجامعات',  Icon: UniversityIcon },
  { key: 'compare',     label: 'المقارنة',  Icon: CompareIcon },
  { key: 'favorites',   label: 'المفضلة',   Icon: StarIcon },
];

export default function Header({
  S: _S,
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
  const natRef = useRef(null);

  /* Dark mode toggle state */
  const [themeMode, setThemeMode] = useState(getInitialTheme);
  useEffect(() => { applyTheme(themeMode); }, [themeMode]);
  const cycleTheme = () => setThemeMode(prev => THEME_CYCLE[prev] || 'auto');

  /* Close nationality picker on outside click */
  useEffect(() => {
    if (!showNatPicker) return;
    const handler = (e) => {
      if (natRef.current && !natRef.current.contains(e.target)) setShowNatPicker(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showNatPicker]);

  const CurrentThemeIcon = ThemeIconMap[themeMode];

  return (
    <header className="elite-header">
      {/* ══ Row 1: Brand bar ══ */}
      <div className="elite-header__brand">
        {/* Hamburger — mobile only */}
        <button
          className="elite-header__hamburger"
          onClick={() => setShowMenu(!showMenu)}
          aria-label="القائمة الجانبية"
          title="الوصول السريع والأقسام"
        >
          {showMenu
            ? <CloseIcon size={18} color="#FFFFFF" />
            : <MenuIcon size={18} color="#FFFFFF" />
          }
        </button>

        {/* Logo + Text */}
        <div className="elite-header__logo-group">
          <div className="elite-header__logo-icon">
            <GraduationCapIcon size={26} color="#C5A55A" />
          </div>
          <div className="elite-header__titles">
            <div className="elite-header__app-name">
              <span>المستشار الجامعي القطري</span>
              {/* Nationality badge */}
              {userProfile.nationality && (
                <button
                  ref={natRef}
                  onClick={() => setShowNatPicker(p => !p)}
                  aria-label={isQatari ? 'الجنسية: قطري — انقر للتغيير' : 'الجنسية: مقيم — انقر للتغيير'}
                  className={`elite-header__nat-badge ${isQatari ? 'elite-header__nat-badge--qatari' : ''}`}
                >
                  {isQatari
                    ? <QatarFlagIcon size={13} />
                    : <GlobeIcon size={13} color="rgba(255,255,255,0.9)" />
                  }
                  {isQatari ? ' قطري' : ' مقيم'}
                </button>
              )}
            </div>
            <div className="elite-header__subtitle">
              {userProfile.grade
                ? `معدل ${userProfile.grade}% · ${userProfile.track || ''}`
                : 'دليلك الذكي للجامعات في قطر'}
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="elite-header__actions">
          <button
            onClick={cycleTheme}
            aria-label={THEME_LABEL[themeMode]}
            title={THEME_LABEL[themeMode]}
            className="elite-header__action-btn"
          >
            <CurrentThemeIcon size={16} color="#FFFFFF" />
          </button>

          <button
            className={`elite-header__action-btn ${activeView === 'favorites' ? 'elite-header__action-btn--active' : ''}`}
            onClick={() => setActiveView(activeView === 'favorites' ? 'chat' : 'favorites')}
            aria-label="المفضلة"
          >
            <StarIcon
              size={17}
              color={activeView === 'favorites' ? theme.colors.gold : '#FFFFFF'}
              filled={activeView === 'favorites'}
            />
            {userProfile.favorites.length > 0 && (
              <span className="elite-header__fav-count" aria-label={`${userProfile.favorites.length} مفضلة`}>
                <span aria-hidden="true">{userProfile.favorites.length}</span>
              </span>
            )}
          </button>
        </div>
      </div>

      {/* ══ Row 2: Navigation tabs — Desktop only ══ */}
      <nav className="elite-header__nav" aria-label="التنقل الرئيسي">
        {/* eslint-disable-next-line no-unused-vars */}
        {NAV_TABS.map(({ key, label, Icon }) => (
          <button
            key={key}
            className={`elite-header__nav-tab ${activeView === key ? 'elite-header__nav-tab--active' : ''}`}
            onClick={() => setActiveView(key)}
            aria-current={activeView === key ? 'page' : undefined}
          >
            <Icon size={15} color={activeView === key ? '#C5A55A' : 'rgba(255,255,255,0.7)'} />
            <span>{label}</span>
          </button>
        ))}
      </nav>

      {/* ══ Nationality picker dropdown ══ */}
      {showNatPicker && (
        <div className="elite-header__nat-dropdown">
          <p className="elite-header__nat-dropdown-title">تغيير الجنسية</p>
          <div className="elite-header__nat-dropdown-options">
            {[
              { val: 'qatari',     label: 'قطري / قطرية', Icon: QatarFlagIcon },
              { val: 'non_qatari', label: 'مقيم في قطر',  Icon: GlobeIcon },
            // eslint-disable-next-line no-unused-vars
            ].map(({ val, label, Icon }) => (
              <button key={val}
                onClick={() => { selectNationality(val); setShowNatPicker(false); }}
                className={`elite-header__nat-option ${userProfile.nationality === val ? 'elite-header__nat-option--selected' : ''}`}
              >
                <Icon size={16} color={val === 'qatari' ? undefined : 'var(--text-secondary,#6B7280)'} />
                {label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ══ Gold accent line ══ */}
      <div className="elite-header__accent-line" />
    </header>
  );
}
