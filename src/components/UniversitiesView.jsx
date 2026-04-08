import React, { useState } from 'react';
import {
  SearchIcon,
  AllCategoriesIcon,
  GovernmentIcon,
  InternationalIcon,
  PrivateIcon,
  MilitaryIcon,
  AviationIcon,
  LocationIcon,
  LanguageIcon,
  CalendarIcon,
  MoneyIcon,
  CheckIcon,
  WarningIcon,
  LockIcon,
  BookIcon,
  JobIcon,
  ClipboardIcon,
  GlobeIcon,
  LinkIcon,
  ChevronDownIcon,
  UniversityIcon,
  ChartIcon,
  StarIcon,
} from './icons/Icons';
// UniversityLogo component will be created in parallel
// import { UniversityLogo } from './UniversityLogos';

const CATEGORIES = [
  { key: 'all',      label: 'الكل',     Icon: AllCategoriesIcon,  iconColor: '#8A1538' },
  { key: 'gov',      label: 'حكومية',   Icon: GovernmentIcon,     iconColor: '#8A1538', filter: u => u.type.includes('حكومية') },
  { key: 'intl',     label: 'دولية',    Icon: InternationalIcon,  iconColor: '#1D4ED8', filter: u => u.type === 'دولية' },
  { key: 'private',  label: 'خاصة',     Icon: PrivateIcon,        iconColor: '#059669', filter: u => u.type.includes('خاصة') },
  { key: 'military', label: 'عسكرية',   Icon: MilitaryIcon,       iconColor: '#4B5563', filter: u => u.type === 'عسكرية' || u.type === 'أمنية' },
  { key: 'special',  label: 'تخصصية',   Icon: AviationIcon,       iconColor: '#C2410C', filter: u => u.type === 'تخصصية' },
];

const GROUP_ICONS = {
  gov:      GovernmentIcon,
  intl:     InternationalIcon,
  private:  PrivateIcon,
  military: MilitaryIcon,
  special:  AviationIcon,
};

const GROUP_COLORS = {
  gov:      '#8A1538',
  intl:     '#1D4ED8',
  private:  '#059669',
  military: '#4B5563',
  special:  '#C2410C',
};

const TYPE_COLORS = {
  'حكومية': { bg: '#FEF2F2', text: '#8A1538', border: '#8A1538' },
  'دولية': { bg: '#EFF6FF', text: '#1D4ED8', border: '#1D4ED8' },
  'خاصة': { bg: '#F0FDF4', text: '#059669', border: '#059669' },
  'عسكرية': { bg: '#F3F4F6', text: '#374151', border: '#374151' },
  'أمنية': { bg: '#F3F4F6', text: '#374151', border: '#374151' },
  'تخصصية': { bg: '#FFF7ED', text: '#C2410C', border: '#C2410C' },
  'حكومية/مؤسسة قطر': { bg: '#FEF2F2', text: '#8A1538', border: '#8A1538' },
  'خاصة غير ربحية': { bg: '#F0FDF4', text: '#059669', border: '#059669' },
};

export default function UniversitiesView({
  S,
  UNIVERSITIES_DB,
  expandedUni,
  setExpandedUni,
  userProfile,
  compareList,
  toggleFav,
  toggleCmp,
  setActiveView,
  sendMessage,
}) {
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [hoveredCard, setHoveredCard] = useState(null);

  const allUnis = Object.values(UNIVERSITIES_DB);

  // Filter by category
  let filtered = activeCategory === 'all'
    ? allUnis
    : allUnis.filter(CATEGORIES.find(c => c.key === activeCategory)?.filter || (() => true));

  // Filter by search
  if (searchQuery.trim()) {
    const q = searchQuery.trim().toLowerCase();
    filtered = filtered.filter(u =>
      u.name.toLowerCase().includes(q) ||
      u.description.toLowerCase().includes(q) ||
      u.type.includes(q)
    );
  }

  // Filter by nationality (hide military for non-Qatari)
  const isNonQatari = userProfile.nationality === 'non_qatari';
  if (isNonQatari && activeCategory === 'all') {
    // Show all but mark military as "قطريين فقط"
  }

  // Group by type for "all" view
  const grouped = activeCategory === 'all' ? [
    { key: 'gov',      title: 'الجامعات الحكومية',                      unis: filtered.filter(u => u.type.includes('حكومية')) },
    { key: 'intl',     title: 'الجامعات الدولية (المدينة التعليمية)',    unis: filtered.filter(u => u.type === 'دولية') },
    { key: 'private',  title: 'الجامعات والكليات الخاصة',               unis: filtered.filter(u => u.type.includes('خاصة')) },
    { key: 'military', title: 'الكليات العسكرية والأمنية',              unis: filtered.filter(u => u.type === 'عسكرية' || u.type === 'أمنية') },
    { key: 'special',  title: 'الأكاديميات التخصصية',                   unis: filtered.filter(u => u.type === 'تخصصية') },
  ].filter(g => g.unis.length > 0) : [{ key: 'filtered', title: '', unis: filtered }];

  const renderCard = (u) => {
    const colors = TYPE_COLORS[u.type] || TYPE_COLORS['خاصة'];
    const isRestricted = isNonQatari && u.qatariOnly;
    const isOpen = expandedUni === u.id;
    const isFav = userProfile.favorites.includes(u.id);
    const isCmp = compareList.includes(u.id);
    const isHovered = hoveredCard === u.id;

    return (
      <div key={u.id}
        onMouseEnter={() => setHoveredCard(u.id)}
        onMouseLeave={() => setHoveredCard(null)}
        style={{
          ...S.ucard,
          opacity: isRestricted ? 0.72 : 1,
          transition: 'transform 0.2s ease, box-shadow 0.2s ease',
          transform: isHovered ? 'translateY(-2px)' : 'translateY(0)',
          boxShadow: isHovered
            ? 'var(--shadow-lg, 0 8px 24px rgba(0,0,0,0.13))'
            : 'var(--shadow-sm, 0 2px 12px rgba(0,0,0,0.07))',
          borderRadius: 'var(--radius-md, 12px)',
          border: '1px solid var(--border, #E5E7EB)',
        }}>
        {/* Card header row */}
        <div style={S.ucardH} onClick={() => setExpandedUni(isOpen ? null : u.id)}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, minWidth: 0 }}>
            {/* University icon in colored circle */}
            <div style={{
              width: 44, height: 44, borderRadius: 'var(--radius-md, 12px)', flexShrink: 0,
              background: colors.bg,
              border: `1.5px solid ${colors.border}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <UniversityIcon size={22} color={colors.text} />
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={S.un}>{u.name}</div>
              <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', alignItems: 'center' }}>
                <span style={{
                  ...S.badge,
                  background: colors.bg,
                  color: colors.text,
                  border: `1px solid ${colors.border}`,
                }}>
                  {u.type}
                </span>
                <span style={{ ...S.mt, display: 'flex', alignItems: 'center', gap: 3 }}>
                  <ChartIcon size={12} color="var(--text-secondary, #9CA3AF)" />
                  {u.minGrade}%+
                </span>
                {isRestricted && (
                  <span style={{ fontSize: 12, color: '#DC2626', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 3 }}>
                    <LockIcon size={12} color="#DC2626" />
                    قطريون فقط
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div style={{ display: 'flex', gap: 4, alignItems: 'center', flexShrink: 0 }}>
            <button
              style={{
                ...S.ib,
                background: isFav ? 'rgba(197,165,90,0.12)' : 'rgba(138,21,56,0.05)',
                transition: 'all 0.18s ease',
              }}
              onClick={(e) => { e.stopPropagation(); toggleFav(u.id); }}
              aria-label="مفضلة"
            >
              <StarIcon size={16} color={isFav ? '#C5A55A' : '#9CA3AF'} filled={isFav} />
            </button>
            <button
              style={{
                ...S.ib,
                background: isCmp ? 'rgba(5,150,105,0.08)' : 'rgba(138,21,56,0.05)',
                transition: 'all 0.18s ease',
              }}
              onClick={(e) => { e.stopPropagation(); toggleCmp(u.id); }}
              aria-label="مقارنة"
            >
              <ChartIcon size={16} color={isCmp ? '#059669' : '#9CA3AF'} />
            </button>
            <div style={{
              width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--text-secondary,#9CA3AF)', transition: 'transform 0.22s ease',
              transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            }}>
              <ChevronDownIcon size={14} />
            </div>
          </div>
        </div>

        {expandedUni === u.id && (
          <div style={S.uex}>
            <p style={{ fontSize: 12, color: 'var(--text,#374151)', margin: '6px 0', lineHeight: 1.6 }}>
              {u.description}
            </p>

            {isRestricted && (
              <div style={{
                background: 'var(--maroon-bg, #FEF2F2)',
                border: '1px solid #FECACA',
                borderRadius: 'var(--radius-sm, 8px)',
                padding: '8px 12px', marginBottom: 8, fontSize: 12,
                display: 'flex', alignItems: 'center', gap: 6,
              }}>
                <WarningIcon size={14} color="#D97706" />
                <span><strong>هذه المؤسسة للقطريين فقط.</strong> اضغط "بدائل متاحة" لمعرفة خياراتك.</span>
              </div>
            )}

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: 8 }}>
              <span style={{ ...S.chip, display: 'flex', alignItems: 'center', gap: 4 }}>
                <LocationIcon size={12} color="var(--text-secondary, #6B7280)" /> {u.location}
              </span>
              <span style={{ ...S.chip, display: 'flex', alignItems: 'center', gap: 4 }}>
                <LanguageIcon size={12} color="var(--text-secondary, #6B7280)" /> {u.language}
              </span>
              <span style={{ ...S.chip, display: 'flex', alignItems: 'center', gap: 4 }}>
                <CalendarIcon size={12} color="var(--text-secondary, #6B7280)" /> {u.admissionPeriod}
              </span>
              <span style={{ ...S.chip, display: 'flex', alignItems: 'center', gap: 4 }}>
                <MoneyIcon size={12} color="var(--text-secondary, #6B7280)" /> {u.tuition}
              </span>
            </div>

            <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
              <div style={S.pros}>
                <div style={{ fontWeight: 700, fontSize: 12, color: '#16a34a', marginBottom: 3, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <CheckIcon size={13} color="#16a34a" /> المميزات
                </div>
                {u.pros.map((p, i) => <div key={i} style={{ fontSize: 12, color: '#15803d' }}>• {p}</div>)}
              </div>
              <div style={S.cons}>
                <div style={{ fontWeight: 700, fontSize: 12, color: '#ea580c', marginBottom: 3, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <WarningIcon size={13} color="#ea580c" /> التحديات
                </div>
                {u.cons.map((c, i) => <div key={i} style={{ fontSize: 12, color: '#c2410c' }}>• {c}</div>)}
              </div>
            </div>

            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              <button style={{ ...S.ab, display: 'flex', alignItems: 'center', gap: 5 }} onClick={() => { setActiveView('chat'); sendMessage(`خطة دراسة ${u.name} والمواد والتخصصات`); }}>
                <BookIcon size={14} color="#FFFFFF" /> التخصصات
              </button>
              <button style={{ ...S.ab, background: '#6B1030', display: 'flex', alignItems: 'center', gap: 5 }} onClick={() => { setActiveView('chat'); sendMessage(`فرص العمل والرواتب بعد التخرج من ${u.name}`); }}>
                <JobIcon size={14} color="#FFFFFF" /> فرص العمل
              </button>
              <button style={{ ...S.ab, background: '#C5A55A', display: 'flex', alignItems: 'center', gap: 5 }} onClick={() => { setActiveView('chat'); sendMessage(`شروط القبول والتقديم في ${u.name}`); }}>
                <ClipboardIcon size={14} color="#FFFFFF" /> شروط القبول
              </button>
              {isRestricted && (
                <button style={{ ...S.ab, background: '#0284C7', display: 'flex', alignItems: 'center', gap: 5 }} onClick={() => { setActiveView('chat'); sendMessage('منح لغير القطريين'); }}>
                  <GlobeIcon size={14} color="#FFFFFF" /> بدائل متاحة
                </button>
              )}
            </div>

            {u.website && (
              <a href={`https://${u.website}`} target="_blank" rel="noopener noreferrer"
                style={{ ...S.wb, display: 'flex', alignItems: 'center', gap: 5 }}>
                <LinkIcon size={13} color="var(--maroon, #8A1538)" /> {u.website}
              </a>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div style={S.vc}>
      {/* ── Header ── */}
      <div style={{
        marginBottom: 14, padding: '10px 0 16px',
        borderBottom: '1px solid rgba(138,21,56,0.09)',
      }}>
        <h2 style={{ ...S.vt, display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{
            width: 36, height: 36, borderRadius: 10,
            background: 'linear-gradient(135deg,#8A1538,#6B1030)',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <UniversityIcon size={20} color="#FFFFFF" />
          </span>
          الجامعات في قطر
        </h2>
        <p style={{ ...S.vs, marginTop: 6 }}>{allUnis.length} مؤسسة تعليمية — اضغط على أي بطاقة للتفاصيل</p>
      </div>

      {/* Search */}
      <div style={{ marginBottom: 12, position: 'relative' }}>
        <div style={{
          display: 'flex', alignItems: 'center',
          background: 'var(--card-bg,#fff)', borderRadius: 'var(--radius-md, 14px)',
          border: '1.5px solid rgba(138,21,56,0.15)',
          boxShadow: 'var(--shadow-sm, 0 2px 8px rgba(0,0,0,0.05))',
          padding: '3px 14px',
          transition: 'all 0.2s ease',
        }}>
          <SearchIcon size={16} color="var(--maroon, #8A1538)" />
          <input
            type="text"
            placeholder="ابحث عن جامعة أو تخصص..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{
              flex: 1, padding: '10px 10px', border: 'none',
              fontSize: 14, textAlign: 'right', direction: 'rtl',
              outline: 'none', color: 'var(--text,#1C1C1E)', background: 'transparent',
              fontFamily: "'Tajawal',sans-serif",
            }}
            onFocus={e => e.target.closest('div').style.borderColor = 'var(--maroon, #8A1538)'}
            onBlur={e => e.target.closest('div').style.borderColor = 'rgba(138,21,56,0.15)'}
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'var(--text-secondary,#9CA3AF)', fontSize: 16, padding: '0 2px', flexShrink: 0,
              minHeight: 'auto',
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M18 6L6 18M6 6l12 12"/>
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Category filter chips */}
      <div style={{
        display: 'flex', gap: 6, marginBottom: 14,
        overflowX: 'auto', msOverflowStyle: 'none', scrollbarWidth: 'none',
      }}>
        {CATEGORIES.map(cat => {
          const isActive = activeCategory === cat.key;
          return (
            <button
              key={cat.key}
              onClick={() => setActiveCategory(cat.key)}
              aria-label={cat.label}
              aria-pressed={isActive}
              style={{
                padding: '7px 14px', borderRadius: 20, fontSize: 12,
                fontWeight: isActive ? 700 : 500,
                fontFamily: "'Tajawal',sans-serif",
                background: isActive
                  ? 'linear-gradient(135deg,#8A1538,#6B1030)'
                  : 'var(--card-bg,#fff)',
                color: isActive ? '#fff' : 'var(--text,#374151)',
                border: isActive
                  ? '1.5px solid transparent'
                  : '1.5px solid var(--border,#E5E7EB)',
                cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0,
                boxShadow: isActive
                  ? '0 3px 12px rgba(138,21,56,0.28)'
                  : 'var(--shadow-sm, 0 1px 3px rgba(0,0,0,0.04))',
                transition: 'all 0.2s cubic-bezier(0.34,1.56,0.64,1)',
                display: 'flex', alignItems: 'center', gap: 5,
              }}
            >
              <cat.Icon size={14} color={isActive ? '#FFFFFF' : cat.iconColor} />
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* Grouped University List */}
      {grouped.map((group, gi) => (
        <div key={gi}>
          {group.title && (
            <div style={{
              padding: '8px 14px', margin: '4px 0 6px', fontSize: 14,
              fontWeight: 700, color: 'var(--maroon, #8A1538)',
              borderBottom: '2px solid var(--gold, #C5A55A)',
              background: 'linear-gradient(90deg,rgba(138,21,56,0.05) 0%,rgba(197,165,90,0.06) 60%,transparent 100%)',
              borderRadius: '8px 8px 0 0',
              display: 'flex', alignItems: 'center', gap: 8,
            }}>
              {GROUP_ICONS[group.key] && React.createElement(GROUP_ICONS[group.key], {
                size: 16,
                color: GROUP_COLORS[group.key] || '#8A1538',
              })}
              {group.title}
              <span style={{ fontSize: 12, fontWeight: 400, color: 'var(--text-secondary,#6B7280)', marginRight: 8 }}>
                ({group.unis.length})
              </span>
            </div>
          )}
          {group.unis.map(renderCard)}
        </div>
      ))}

      {filtered.length === 0 && (
        <div style={S.em}>
          <p>لا توجد نتائج</p>
          <button style={S.gb} onClick={() => { setSearchQuery(''); setActiveCategory('all'); }}>
            عرض الكل
          </button>
        </div>
      )}
    </div>
  );
}
