import React, { useState, useMemo } from 'react';
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
  ScholarshipIcon,
} from './icons/Icons';
import UniversityLogo from './UniversityLogos';

/* ── Color System ── */
const TYPE_BAR_COLORS = {
  'حكومية':              '#8A1538',
  'حكومية/مؤسسة قطر':   '#8A1538',
  'دولية':               '#1B365D',
  'خاصة':                '#C5A55A',
  'خاصة غير ربحية':      '#C5A55A',
  'عسكرية':              '#2D5016',
  'أمنية':               '#2D5016',
  'تخصصية':              '#0E7490',
};

const TYPE_BADGE_STYLES = {
  'حكومية':              { bg: 'rgba(138,21,56,0.08)',  text: '#8A1538', border: 'rgba(138,21,56,0.2)' },
  'حكومية/مؤسسة قطر':   { bg: 'rgba(138,21,56,0.08)',  text: '#8A1538', border: 'rgba(138,21,56,0.2)' },
  'دولية':               { bg: 'rgba(27,54,93,0.08)',   text: '#1B365D', border: 'rgba(27,54,93,0.2)' },
  'خاصة':                { bg: 'rgba(197,165,90,0.10)', text: '#92722A', border: 'rgba(197,165,90,0.25)' },
  'خاصة غير ربحية':      { bg: 'rgba(197,165,90,0.10)', text: '#92722A', border: 'rgba(197,165,90,0.25)' },
  'عسكرية':              { bg: 'rgba(45,80,22,0.08)',   text: '#2D5016', border: 'rgba(45,80,22,0.2)' },
  'أمنية':               { bg: 'rgba(45,80,22,0.08)',   text: '#2D5016', border: 'rgba(45,80,22,0.2)' },
  'تخصصية':              { bg: 'rgba(14,116,144,0.08)', text: '#0E7490', border: 'rgba(14,116,144,0.2)' },
};

const CATEGORIES = [
  { key: 'all',      label: 'الكل',     Icon: AllCategoriesIcon,  iconColor: '#8A1538' },
  { key: 'gov',      label: 'حكومية',   Icon: GovernmentIcon,     iconColor: '#8A1538', filter: u => u.type.includes('حكومية') },
  { key: 'intl',     label: 'دولية',    Icon: InternationalIcon,  iconColor: '#1B365D', filter: u => u.type === 'دولية' },
  { key: 'private',  label: 'خاصة',     Icon: PrivateIcon,        iconColor: '#C5A55A', filter: u => u.type.includes('خاصة') },
  { key: 'military', label: 'عسكرية',   Icon: MilitaryIcon,       iconColor: '#2D5016', filter: u => u.type === 'عسكرية' || u.type === 'أمنية' },
  { key: 'special',  label: 'تخصصية',   Icon: AviationIcon,       iconColor: '#0E7490', filter: u => u.type === 'تخصصية' },
];

const SORT_OPTIONS = [
  { key: 'name',    label: 'حسب الاسم' },
  { key: 'grade',   label: 'حسب المعدل' },
  { key: 'tuition', label: 'حسب الرسوم' },
];

/* ── Stat Card ── */
function StatCard({ icon, iconColor, value, label }) {
  const IconComp = icon;
  return (
    <div style={styles.statCard}>
      <div style={{ ...styles.statIconWrap, background: `${iconColor}12` }}>
        <IconComp size={20} color={iconColor} />
      </div>
      <div style={styles.statValue}>{value}</div>
      <div style={styles.statLabel}>{label}</div>
    </div>
  );
}

/* ── Main Component ── */
export default function UniversitiesView({
  S: _S,
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
  const [sortBy, setSortBy] = useState('name');

  const allUnis = useMemo(() => Object.values(UNIVERSITIES_DB), [UNIVERSITIES_DB]);

  /* Filter */
  const filtered = useMemo(() => {
    let result = activeCategory === 'all'
      ? allUnis
      : allUnis.filter(CATEGORIES.find(c => c.key === activeCategory)?.filter || (() => true));

    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      result = result.filter(u =>
        u.name.toLowerCase().includes(q) ||
        u.description.toLowerCase().includes(q) ||
        u.type.includes(q)
      );
    }

    /* Sort */
    result = [...result].sort((a, b) => {
      if (sortBy === 'grade') return (b.minGrade || 0) - (a.minGrade || 0);
      if (sortBy === 'tuition') {
        const free = t => t && (t.includes('مجاني') || t.includes('مجانية'));
        if (free(a.tuition) && !free(b.tuition)) return -1;
        if (!free(a.tuition) && free(b.tuition)) return 1;
        return 0;
      }
      return a.name.localeCompare(b.name, 'ar');
    });

    return result;
  }, [allUnis, activeCategory, searchQuery, sortBy]);

  const isNonQatari = userProfile.nationality === 'non_qatari';

  /* Stats */
  const statsData = useMemo(() => {
    const uniqueTypes = new Set(allUnis.map(u => u.type));
    return {
      total: allUnis.length,
      specializations: '100+',
      scholarships: allUnis.filter(u => u.tuition && (u.tuition.includes('مجاني') || u.tuition.includes('منح'))).length,
      types: uniqueTypes.size,
    };
  }, [allUnis]);

  /* ── Render University Card ── */
  const renderCard = (u) => {
    const barColor = TYPE_BAR_COLORS[u.type] || '#6B7280';
    const badgeStyle = TYPE_BADGE_STYLES[u.type] || TYPE_BADGE_STYLES['خاصة'];
    const isRestricted = isNonQatari && u.qatariOnly;
    const isOpen = expandedUni === u.id;
    const isFav = userProfile.favorites.includes(u.id);
    const isCmp = compareList.includes(u.id);
    const isHovered = hoveredCard === u.id;

    return (
      <div
        key={u.id}
        onMouseEnter={() => setHoveredCard(u.id)}
        onMouseLeave={() => setHoveredCard(null)}
        style={{
          ...styles.card,
          opacity: isRestricted ? 0.78 : 1,
          transform: isHovered ? 'translateY(-4px)' : 'translateY(0)',
          boxShadow: isHovered
            ? '0 12px 32px rgba(0,0,0,0.12), 0 4px 12px rgba(0,0,0,0.06)'
            : '0 2px 12px rgba(0,0,0,0.08)',
        }}
      >
        {/* Color bar */}
        <div style={{ ...styles.colorBar, background: barColor }} />

        {/* Card body */}
        <div style={styles.cardBody}>
          {/* Header: Logo + Name + Badge */}
          <div style={styles.cardHeader}>
            <div style={styles.logoWrap}>
              <UniversityLogo universityId={u.id} size={56} />
            </div>
            <div style={styles.headerInfo}>
              <h3 style={styles.uniName}>{u.name}</h3>
              <div style={styles.badgeRow}>
                <span style={{
                  ...styles.typeBadge,
                  background: badgeStyle.bg,
                  color: badgeStyle.text,
                  border: `1px solid ${badgeStyle.border}`,
                }}>
                  {u.type}
                </span>
                {u.minGrade && (
                  <span style={styles.gradeChip}>
                    <ChartIcon size={11} color="var(--text-secondary, #6B7280)" />
                    {u.minGrade}%+
                  </span>
                )}
                {isRestricted && (
                  <span style={styles.restrictedBadge}>
                    <LockIcon size={11} color="#DC2626" />
                    قطريون فقط
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Divider */}
          <div style={styles.divider} />

          {/* Info chips row */}
          <div style={styles.infoChipsRow}>
            <span style={styles.infoChip}>
              <LocationIcon size={13} color="var(--text-secondary, #6B7280)" />
              {u.location}
            </span>
            <span style={styles.infoChip}>
              <LanguageIcon size={13} color="var(--text-secondary, #6B7280)" />
              {u.language}
            </span>
            <span style={styles.infoChip}>
              <MoneyIcon size={13} color="var(--text-secondary, #6B7280)" />
              {u.tuition}
            </span>
          </div>

          {/* Pros as chips (preview) */}
          {u.pros && u.pros.length > 0 && (
            <div style={styles.prosPreview}>
              {u.pros.slice(0, 3).map((p, i) => (
                <span key={i} style={styles.proChip}>
                  <CheckIcon size={10} color="#059669" />
                  {p}
                </span>
              ))}
            </div>
          )}

          {/* Divider */}
          <div style={styles.divider} />

          {/* Action buttons */}
          <div style={styles.actionsRow}>
            <button
              style={styles.detailsBtn}
              onClick={() => setExpandedUni(isOpen ? null : u.id)}
            >
              <ChevronDownIcon size={13} color="#FFFFFF" />
              <span>{isOpen ? 'اخفاء' : 'التفاصيل'}</span>
            </button>
            <button
              style={{
                ...styles.compareBtn,
                background: isCmp ? 'rgba(27,54,93,0.12)' : 'var(--card-bg, #fff)',
                borderColor: isCmp ? '#1B365D' : 'var(--border, #E5E7EB)',
                color: isCmp ? '#1B365D' : 'var(--text-secondary, #6B7280)',
              }}
              onClick={() => toggleCmp(u.id)}
            >
              <ChartIcon size={14} color={isCmp ? '#1B365D' : 'var(--text-secondary, #6B7280)'} />
              {isCmp ? 'تمت الاضافة' : 'مقارنة'}
            </button>
            <button
              style={{
                ...styles.favBtn,
                background: isFav ? 'rgba(197,165,90,0.15)' : 'var(--card-bg, #fff)',
                borderColor: isFav ? '#C5A55A' : 'var(--border, #E5E7EB)',
              }}
              onClick={() => toggleFav(u.id)}
              aria-label="مفضلة"
            >
              <StarIcon size={18} color={isFav ? '#C5A55A' : '#9CA3AF'} filled={isFav} />
            </button>
          </div>
        </div>

        {/* ── Expanded Details ── */}
        {isOpen && (
          <div style={styles.expandedSection}>
            {/* Description */}
            <p style={styles.description}>{u.description}</p>

            {/* Restricted warning */}
            {isRestricted && (
              <div style={styles.restrictedAlert}>
                <WarningIcon size={15} color="#D97706" />
                <span><strong>هذه المؤسسة للقطريين فقط.</strong> اضغط "بدائل متاحة" لمعرفة خياراتك.</span>
              </div>
            )}

            {/* Admission info grid */}
            <div style={styles.admissionGrid}>
              <div style={styles.admissionItem}>
                <div style={styles.admissionLabel}>
                  <ChartIcon size={12} color="#8A1538" /> الحد الادنى
                </div>
                <div style={styles.admissionValue}>{u.minGrade}%</div>
              </div>
              <div style={styles.admissionItem}>
                <div style={styles.admissionLabel}>
                  <CalendarIcon size={12} color="#8A1538" /> فترة القبول
                </div>
                <div style={styles.admissionValue}>{u.admissionPeriod}</div>
              </div>
              <div style={styles.admissionItem}>
                <div style={styles.admissionLabel}>
                  <MoneyIcon size={12} color="#8A1538" /> الرسوم
                </div>
                <div style={styles.admissionValue}>{u.tuition}</div>
              </div>
              <div style={styles.admissionItem}>
                <div style={styles.admissionLabel}>
                  <LanguageIcon size={12} color="#8A1538" /> اللغة
                </div>
                <div style={styles.admissionValue}>{u.language}</div>
              </div>
            </div>

            {/* Pros & Cons */}
            <div style={styles.prosConsGrid}>
              <div style={styles.prosBox}>
                <div style={styles.prosTitle}>
                  <CheckIcon size={13} color="#059669" /> المميزات
                </div>
                {u.pros.map((p, i) => (
                  <div key={i} style={styles.prosItem}>
                    <span style={styles.prosDot}>+</span> {p}
                  </div>
                ))}
              </div>
              <div style={styles.consBox}>
                <div style={styles.consTitle}>
                  <WarningIcon size={13} color="#ea580c" /> التحديات
                </div>
                {u.cons.map((c, i) => (
                  <div key={i} style={styles.consItem}>
                    <span style={styles.consDot}>-</span> {c}
                  </div>
                ))}
              </div>
            </div>

            {/* Action buttons */}
            <div style={styles.expandedActions}>
              <button style={{ ...styles.actionBtn, background: '#8A1538' }}
                onClick={() => { setActiveView('chat'); sendMessage(`خطة دراسة ${u.name} والمواد والتخصصات`); }}>
                <BookIcon size={14} color="#FFFFFF" /> التخصصات
              </button>
              <button style={{ ...styles.actionBtn, background: '#1B365D' }}
                onClick={() => { setActiveView('chat'); sendMessage(`فرص العمل والرواتب بعد التخرج من ${u.name}`); }}>
                <JobIcon size={14} color="#FFFFFF" /> فرص العمل
              </button>
              <button style={{ ...styles.actionBtn, background: '#C5A55A' }}
                onClick={() => { setActiveView('chat'); sendMessage(`شروط القبول والتقديم في ${u.name}`); }}>
                <ClipboardIcon size={14} color="#FFFFFF" /> شروط القبول
              </button>
              {isRestricted && (
                <button style={{ ...styles.actionBtn, background: '#0284C7' }}
                  onClick={() => { setActiveView('chat'); sendMessage('منح لغير القطريين'); }}>
                  <GlobeIcon size={14} color="#FFFFFF" /> بدائل متاحة
                </button>
              )}
            </div>

            {/* Website */}
            {u.website && (
              <a href={`https://${u.website}`} target="_blank" rel="noopener noreferrer" style={styles.websiteLink}>
                <LinkIcon size={13} color="#8A1538" />
                <span>{u.website}</span>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#8A1538" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3" />
                </svg>
              </a>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div style={styles.container}>
      {/* ── Stats Banner ── */}
      <div style={styles.statsBanner}>
        <StatCard icon={UniversityIcon} iconColor="#8A1538" value={`${statsData.total}+`} label="جامعة ومؤسسة" />
        <StatCard icon={BookIcon} iconColor="#1B365D" value={statsData.specializations} label="تخصص متاح" />
        <StatCard icon={ScholarshipIcon} iconColor="#C5A55A" value={`${statsData.scholarships}`} label="منح دراسية" />
        <StatCard icon={GlobeIcon} iconColor="#059669" value={`${statsData.types}`} label="نوع مؤسسة" />
      </div>

      {/* ── Search Bar ── */}
      <div style={styles.searchWrapper}>
        <div style={styles.searchBar}>
          <SearchIcon size={18} color="var(--maroon, #8A1538)" />
          <input
            type="text"
            placeholder="ابحث عن جامعة أو تخصص..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={styles.searchInput}
            onFocus={e => {
              e.target.closest('div').style.borderColor = 'var(--maroon, #8A1538)';
              e.target.closest('div').style.boxShadow = '0 0 0 3px rgba(138,21,56,0.1)';
            }}
            onBlur={e => {
              e.target.closest('div').style.borderColor = 'var(--border, #E5E7EB)';
              e.target.closest('div').style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)';
            }}
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} style={styles.clearBtn}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <path d="M18 6L6 18M6 6l12 12"/>
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* ── Filter Bar: Chips + Sort + Count ── */}
      <div style={styles.filterBar}>
        <div style={styles.chipsRow}>
          {CATEGORIES.map(cat => {
            const isActive = activeCategory === cat.key;
            return (
              <button
                key={cat.key}
                onClick={() => setActiveCategory(cat.key)}
                aria-label={cat.label}
                aria-pressed={isActive}
                style={{
                  ...styles.filterChip,
                  background: isActive
                    ? `linear-gradient(135deg, ${cat.iconColor}, ${cat.iconColor}dd)`
                    : 'var(--card-bg, #fff)',
                  color: isActive ? '#fff' : 'var(--text, #374151)',
                  border: isActive ? '1.5px solid transparent' : '1.5px solid var(--border, #E5E7EB)',
                  boxShadow: isActive
                    ? `0 4px 14px ${cat.iconColor}40`
                    : '0 1px 3px rgba(0,0,0,0.04)',
                  fontWeight: isActive ? 700 : 500,
                }}
              >
                <cat.Icon size={14} color={isActive ? '#FFFFFF' : cat.iconColor} />
                {cat.label}
              </button>
            );
          })}
        </div>

        <div style={styles.filterMeta}>
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
            style={styles.sortSelect}
          >
            {SORT_OPTIONS.map(opt => (
              <option key={opt.key} value={opt.key}>{opt.label}</option>
            ))}
          </select>
          <span style={styles.resultCount}>
            {filtered.length} جامعة ومؤسسة تعليمية
          </span>
        </div>
      </div>

      {/* ── Cards Grid ── */}
      <div style={styles.grid}>
        {filtered.map(renderCard)}
      </div>

      {/* ── Empty State ── */}
      {filtered.length === 0 && (
        <div style={styles.emptyState}>
          <div style={styles.emptyIcon}>
            <SearchIcon size={32} color="#9CA3AF" />
          </div>
          <p style={styles.emptyTitle}>لا توجد نتائج</p>
          <p style={styles.emptySubtitle}>جرب البحث بكلمة مختلفة أو غير الفلتر</p>
          <button style={styles.emptyBtn} onClick={() => { setSearchQuery(''); setActiveCategory('all'); }}>
            عرض جميع الجامعات
          </button>
        </div>
      )}
    </div>
  );
}

/* ── Styles ── */
const styles = {
  container: {
    flex: 1,
    overflowY: 'auto',
    padding: '20px 16px 24px',
    background: 'var(--bg, #F8F5F2)',
  },

  /* Stats Banner */
  statsBanner: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
    gap: 12,
    marginBottom: 20,
  },
  statCard: {
    background: 'var(--card-bg, #fff)',
    borderRadius: 14,
    padding: '16px 12px',
    textAlign: 'center',
    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
    border: '1px solid var(--border, #F0F0F0)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 6,
  },
  statIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statValue: {
    fontSize: 22,
    fontWeight: 800,
    color: 'var(--text, #1C1C1E)',
    lineHeight: 1,
    fontFamily: "'Tajawal', sans-serif",
  },
  statLabel: {
    fontSize: 11,
    color: 'var(--text-secondary, #6B7280)',
    fontWeight: 500,
    fontFamily: "'Tajawal', sans-serif",
  },

  /* Search */
  searchWrapper: {
    marginBottom: 14,
  },
  searchBar: {
    display: 'flex',
    alignItems: 'center',
    background: 'var(--card-bg, #fff)',
    borderRadius: 16,
    border: '1.5px solid var(--border, #E5E7EB)',
    boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
    padding: '4px 16px',
    gap: 10,
    transition: 'all 0.25s ease',
  },
  searchInput: {
    flex: 1,
    padding: '12px 4px',
    border: 'none',
    fontSize: 15,
    textAlign: 'right',
    direction: 'rtl',
    outline: 'none',
    color: 'var(--text, #1C1C1E)',
    background: 'transparent',
    fontFamily: "'Tajawal', sans-serif",
  },
  clearBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: 'var(--text-secondary, #9CA3AF)',
    padding: '4px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    minHeight: 'auto',
  },

  /* Filter Bar */
  filterBar: {
    marginBottom: 18,
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
  },
  chipsRow: {
    display: 'flex',
    gap: 8,
    overflowX: 'auto',
    msOverflowStyle: 'none',
    scrollbarWidth: 'none',
    paddingBottom: 2,
  },
  filterChip: {
    padding: '8px 16px',
    borderRadius: 24,
    fontSize: 13,
    fontFamily: "'Tajawal', sans-serif",
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    flexShrink: 0,
    transition: 'all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
    display: 'flex',
    alignItems: 'center',
    gap: 6,
  },
  filterMeta: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  sortSelect: {
    padding: '6px 12px',
    borderRadius: 10,
    border: '1px solid var(--border, #E5E7EB)',
    background: 'var(--card-bg, #fff)',
    color: 'var(--text, #374151)',
    fontSize: 12,
    fontFamily: "'Tajawal', sans-serif",
    fontWeight: 600,
    cursor: 'pointer',
    outline: 'none',
    direction: 'rtl',
  },
  resultCount: {
    fontSize: 12,
    color: 'var(--text-secondary, #6B7280)',
    fontWeight: 500,
    fontFamily: "'Tajawal', sans-serif",
  },

  /* Grid */
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 320px), 1fr))',
    gap: 20,
  },

  /* Card */
  card: {
    background: 'var(--card-bg, #fff)',
    borderRadius: 16,
    overflow: 'hidden',
    border: '1px solid var(--border, #F0F0F0)',
    transition: 'transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.25s ease',
    cursor: 'default',
  },
  colorBar: {
    height: 4,
    width: '100%',
  },
  cardBody: {
    padding: '20px 20px 16px',
    display: 'flex',
    flexDirection: 'column',
    gap: 14,
  },

  /* Card Header */
  cardHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: 14,
  },
  logoWrap: {
    flexShrink: 0,
    filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.08))',
  },
  headerInfo: {
    flex: 1,
    minWidth: 0,
  },
  uniName: {
    fontWeight: 700,
    fontSize: 15,
    color: 'var(--text, #1C1C1E)',
    lineHeight: 1.4,
    margin: '0 0 6px 0',
    fontFamily: "'Tajawal', sans-serif",
  },
  badgeRow: {
    display: 'flex',
    gap: 6,
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  typeBadge: {
    fontSize: 11,
    padding: '3px 10px',
    borderRadius: 20,
    fontWeight: 700,
    fontFamily: "'Tajawal', sans-serif",
    display: 'inline-block',
  },
  gradeChip: {
    fontSize: 11,
    color: 'var(--text-secondary, #6B7280)',
    display: 'flex',
    alignItems: 'center',
    gap: 3,
    fontWeight: 600,
    fontFamily: "'Tajawal', sans-serif",
  },
  restrictedBadge: {
    fontSize: 11,
    color: '#DC2626',
    fontWeight: 700,
    display: 'flex',
    alignItems: 'center',
    gap: 3,
    fontFamily: "'Tajawal', sans-serif",
  },

  /* Divider */
  divider: {
    height: 1,
    background: 'var(--border, #F0F0F0)',
    margin: '0',
  },

  /* Info Chips */
  infoChipsRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 8,
  },
  infoChip: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 5,
    fontSize: 12,
    color: 'var(--text-secondary, #6B7280)',
    background: 'var(--bg, #F8F5F2)',
    padding: '5px 10px',
    borderRadius: 8,
    fontWeight: 500,
    fontFamily: "'Tajawal', sans-serif",
    border: '1px solid var(--border, #F0F0F0)',
  },

  /* Pros Preview */
  prosPreview: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 6,
  },
  proChip: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
    fontSize: 11,
    color: '#059669',
    background: 'rgba(5, 150, 105, 0.06)',
    padding: '4px 9px',
    borderRadius: 8,
    fontWeight: 500,
    fontFamily: "'Tajawal', sans-serif",
    border: '1px solid rgba(5, 150, 105, 0.12)',
  },

  /* Actions Row */
  actionsRow: {
    display: 'flex',
    gap: 8,
    alignItems: 'center',
  },
  detailsBtn: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    padding: '9px 16px',
    borderRadius: 12,
    background: 'linear-gradient(135deg, #8A1538, #6B1030)',
    color: '#FFFFFF',
    border: 'none',
    fontSize: 13,
    fontWeight: 700,
    fontFamily: "'Tajawal', sans-serif",
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    boxShadow: '0 2px 8px rgba(138,21,56,0.25)',
  },
  compareBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: 5,
    padding: '9px 14px',
    borderRadius: 12,
    border: '1.5px solid var(--border, #E5E7EB)',
    fontSize: 12,
    fontWeight: 600,
    fontFamily: "'Tajawal', sans-serif",
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  favBtn: {
    width: 40,
    height: 40,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    border: '1.5px solid var(--border, #E5E7EB)',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    flexShrink: 0,
    padding: 0,
  },

  /* ── Expanded Section ── */
  expandedSection: {
    padding: '0 20px 20px',
    borderTop: '1px solid var(--border, #F0F0F0)',
    display: 'flex',
    flexDirection: 'column',
    gap: 14,
    animation: 'fadeIn 0.3s ease',
  },
  description: {
    fontSize: 13,
    color: 'var(--text, #374151)',
    lineHeight: 1.7,
    margin: '14px 0 0',
    fontFamily: "'Tajawal', sans-serif",
  },
  restrictedAlert: {
    background: 'var(--maroon-bg, #FEF2F2)',
    border: '1px solid #FECACA',
    borderRadius: 10,
    padding: '10px 14px',
    fontSize: 12,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    fontFamily: "'Tajawal', sans-serif",
    color: 'var(--text, #374151)',
  },

  /* Admission Grid */
  admissionGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: 10,
  },
  admissionItem: {
    background: 'var(--bg, #F8F5F2)',
    borderRadius: 10,
    padding: '10px 12px',
    border: '1px solid var(--border, #F0F0F0)',
  },
  admissionLabel: {
    fontSize: 11,
    color: 'var(--text-secondary, #6B7280)',
    fontWeight: 500,
    marginBottom: 4,
    display: 'flex',
    alignItems: 'center',
    gap: 4,
    fontFamily: "'Tajawal', sans-serif",
  },
  admissionValue: {
    fontSize: 13,
    color: 'var(--text, #1C1C1E)',
    fontWeight: 700,
    fontFamily: "'Tajawal', sans-serif",
  },

  /* Pros & Cons */
  prosConsGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 10,
  },
  prosBox: {
    background: 'rgba(5, 150, 105, 0.04)',
    borderRadius: 10,
    padding: 12,
    border: '1px solid rgba(5, 150, 105, 0.1)',
  },
  consBox: {
    background: 'rgba(234, 88, 12, 0.04)',
    borderRadius: 10,
    padding: 12,
    border: '1px solid rgba(234, 88, 12, 0.1)',
  },
  prosTitle: {
    fontWeight: 700,
    fontSize: 12,
    color: '#059669',
    marginBottom: 6,
    display: 'flex',
    alignItems: 'center',
    gap: 5,
    fontFamily: "'Tajawal', sans-serif",
  },
  consTitle: {
    fontWeight: 700,
    fontSize: 12,
    color: '#ea580c',
    marginBottom: 6,
    display: 'flex',
    alignItems: 'center',
    gap: 5,
    fontFamily: "'Tajawal', sans-serif",
  },
  prosItem: {
    fontSize: 12,
    color: '#15803d',
    marginBottom: 3,
    display: 'flex',
    alignItems: 'center',
    gap: 4,
    fontFamily: "'Tajawal', sans-serif",
  },
  consItem: {
    fontSize: 12,
    color: '#c2410c',
    marginBottom: 3,
    display: 'flex',
    alignItems: 'center',
    gap: 4,
    fontFamily: "'Tajawal', sans-serif",
  },
  prosDot: {
    fontWeight: 800,
    fontSize: 14,
    lineHeight: 1,
  },
  consDot: {
    fontWeight: 800,
    fontSize: 14,
    lineHeight: 1,
  },

  /* Expanded Action Buttons */
  expandedActions: {
    display: 'flex',
    gap: 8,
    flexWrap: 'wrap',
  },
  actionBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    padding: '8px 14px',
    borderRadius: 10,
    border: 'none',
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 700,
    fontFamily: "'Tajawal', sans-serif",
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
  },

  /* Website Link */
  websiteLink: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    fontSize: 12,
    color: '#8A1538',
    fontWeight: 600,
    textDecoration: 'none',
    fontFamily: "'Tajawal', sans-serif",
    padding: '8px 12px',
    background: 'rgba(138, 21, 56, 0.04)',
    borderRadius: 10,
    border: '1px solid rgba(138, 21, 56, 0.1)',
    transition: 'all 0.2s ease',
    width: 'fit-content',
  },

  /* Empty State */
  emptyState: {
    textAlign: 'center',
    padding: '48px 20px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 10,
  },
  emptyIcon: {
    width: 64,
    height: 64,
    borderRadius: 20,
    background: 'var(--card-bg, #fff)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
    marginBottom: 8,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: 700,
    color: 'var(--text, #1C1C1E)',
    margin: 0,
    fontFamily: "'Tajawal', sans-serif",
  },
  emptySubtitle: {
    fontSize: 13,
    color: 'var(--text-secondary, #9CA3AF)',
    margin: 0,
    fontFamily: "'Tajawal', sans-serif",
  },
  emptyBtn: {
    marginTop: 8,
    padding: '10px 24px',
    borderRadius: 12,
    background: 'linear-gradient(135deg, #8A1538, #6B1030)',
    color: '#FFFFFF',
    border: 'none',
    fontSize: 13,
    fontWeight: 700,
    fontFamily: "'Tajawal', sans-serif",
    cursor: 'pointer',
    boxShadow: '0 2px 8px rgba(138,21,56,0.25)',
  },
};
