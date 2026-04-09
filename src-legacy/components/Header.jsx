import React from 'react';
import { GraduationCapIcon, MenuIcon, SunIcon, MoonIcon, ChatIcon, UniversityIcon, CompareIcon, StarIcon } from './icons/Icons';

const tabs = [
  { id: 'chat', label: 'محادثة', Icon: ChatIcon },
  { id: 'universities', label: 'الجامعات', Icon: UniversityIcon },
  { id: 'compare', label: 'مقارنة', Icon: CompareIcon },
  { id: 'favorites', label: 'مفضلة', Icon: StarIcon },
];

export default function Header({ userProfile: _userProfile, activeView, setActiveView, showMenu, setShowMenu, selectNationality: _selectNationality }) {
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';

  const toggleTheme = () => {
    const next = isDark ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('theme', next);
  };

  return (
    <header className="eds-header">
      <div className="eds-header__bar">
        {/* Right side (RTL): Logo + title */}
        <div className="eds-header__brand">
          <div className="eds-header__logo-circle">
            <GraduationCapIcon size={22} color="#FFFFFF" />
          </div>
          <span className="eds-header__title">المستشار الجامعي القطري</span>
        </div>

        {/* Left side (RTL): actions */}
        <div className="eds-header__actions">
          <button
            className="eds-header__icon-btn"
            onClick={toggleTheme}
            aria-label={isDark ? 'الوضع الفاتح' : 'الوضع الداكن'}
          >
            {isDark ? <SunIcon size={18} color="var(--text)" /> : <MoonIcon size={18} color="var(--text)" />}
          </button>
          <button
            className="eds-header__menu-btn"
            onClick={() => setShowMenu(!showMenu)}
            aria-label="القائمة"
          >
            <MenuIcon size={20} color="var(--text)" />
          </button>
        </div>
      </div>

      {/* Desktop navigation tabs */}
      <nav className="eds-header__nav">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`eds-header__tab ${activeView === tab.id ? 'eds-header__tab--active' : ''}`}
            onClick={() => setActiveView(tab.id)}
          >
            <tab.Icon size={16} color={activeView === tab.id ? '#8A1538' : 'var(--text-muted)'} />
            <span>{tab.label}</span>
          </button>
        ))}
      </nav>
    </header>
  );
}
