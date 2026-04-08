import React from 'react';
import {
  StarIcon,
  BookIcon,
  UniversityIcon,
  TrashIcon,
  CompareIcon,
  SearchIcon,
  ChartIcon,
  MoneyIcon,
} from './icons/Icons';

// ════════════════════════════════════════════════════════════════════
// FavoritesView — Professional Favorites List v2.0
// ════════════════════════════════════════════════════════════════════

export default function FavoritesView({
  S: _S,
  UNIVERSITIES_DB,
  userProfile,
  toggleFav,
  setActiveView,
  sendMessage,
}) {
  const favs = userProfile.favorites.map((id) => UNIVERSITIES_DB[id]).filter(Boolean);

  // ─── Styles ───
  const styles = {
    container: {
      padding: '20px 16px',
      minHeight: '100%',
      background: 'var(--bg, #FFFFFF)',
    },
    header: {
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      marginBottom: 24, paddingBottom: 16,
      borderBottom: '2px solid var(--border, rgba(0,0,0,0.06))',
    },
    headerLeft: {
      display: 'flex', alignItems: 'center', gap: 12,
    },
    headerIcon: {
      width: 44, height: 44, borderRadius: 14,
      background: 'linear-gradient(135deg, #C5A55A, #A8893F)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      boxShadow: '0 4px 14px rgba(197,165,90,0.3)',
    },
    headerTitle: {
      fontSize: 20, fontWeight: 800, margin: 0,
      color: 'var(--text, #1C1C1E)',
      fontFamily: "'Cairo','Tajawal',sans-serif",
    },
    headerCount: {
      fontSize: 12, color: 'var(--text-secondary, #6B7280)',
      marginTop: 2,
    },
    countBadge: {
      padding: '6px 14px', borderRadius: 20,
      background: 'rgba(197,165,90,0.12)',
      color: '#92750E',
      fontSize: 13, fontWeight: 700,
    },
    // Empty state
    emptyContainer: {
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', padding: '48px 24px',
      minHeight: '50vh', textAlign: 'center',
    },
    emptyIconWrap: {
      width: 100, height: 100, borderRadius: '50%',
      background: 'var(--surface, #F5F0EB)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      marginBottom: 24,
      border: '2px dashed rgba(197,165,90,0.3)',
    },
    emptyTitle: {
      fontSize: 20, fontWeight: 800, margin: '0 0 8px',
      color: 'var(--text, #1C1C1E)',
      fontFamily: "'Cairo','Tajawal',sans-serif",
    },
    emptyDesc: {
      fontSize: 14, color: 'var(--text-secondary, #6B7280)',
      margin: '0 0 24px', lineHeight: 1.7, maxWidth: 300,
    },
    ctaButton: {
      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
      padding: '14px 28px',
      background: 'linear-gradient(135deg, #C5A55A, #A8893F)',
      color: '#FFFFFF', border: 'none', borderRadius: 14,
      fontSize: 14, fontWeight: 700, cursor: 'pointer',
      fontFamily: "'Tajawal',sans-serif",
      boxShadow: '0 4px 16px rgba(197,165,90,0.3)',
      transition: 'all 0.2s ease',
    },
    // Card styles
    card: {
      display: 'flex', alignItems: 'center', gap: 14,
      background: 'var(--card-bg, #FFFFFF)',
      borderRadius: 16, padding: '16px 18px',
      marginBottom: 12,
      boxShadow: '0 2px 12px rgba(0,0,0,0.04), 0 1px 3px rgba(0,0,0,0.02)',
      border: '1px solid var(--border, rgba(0,0,0,0.06))',
      transition: 'all 0.2s ease',
    },
    cardAvatar: {
      width: 48, height: 48, borderRadius: 14,
      background: 'var(--maroon-bg, rgba(138,21,56,0.06))',
      border: '1.5px solid rgba(138,21,56,0.12)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexShrink: 0,
    },
    cardContent: {
      flex: 1, minWidth: 0,
    },
    cardName: {
      fontSize: 14.5, fontWeight: 700,
      color: 'var(--text, #1C1C1E)',
      marginBottom: 4,
      whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
    },
    cardMeta: {
      display: 'flex', alignItems: 'center', gap: 12,
      flexWrap: 'wrap',
    },
    metaItem: {
      display: 'flex', alignItems: 'center', gap: 4,
      fontSize: 12, color: 'var(--text-secondary, #6B7280)',
      fontWeight: 500,
    },
    cardActions: {
      display: 'flex', gap: 6, flexShrink: 0,
    },
    iconBtn: (bg, _hoverBg) => ({
      width: 36, height: 36, borderRadius: 10,
      background: bg, border: 'none',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      cursor: 'pointer',
      transition: 'all 0.15s ease',
    }),
    detailBtn: {
      padding: '8px 14px', borderRadius: 10,
      background: 'linear-gradient(135deg, #8A1538, #6B1030)',
      color: '#FFFFFF', border: 'none',
      fontSize: 12, fontWeight: 700,
      cursor: 'pointer',
      display: 'flex', alignItems: 'center', gap: 5,
      fontFamily: "'Tajawal',sans-serif",
      transition: 'all 0.15s ease',
      boxShadow: '0 2px 8px rgba(138,21,56,0.2)',
    },
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <div style={styles.headerIcon}>
            <StarIcon size={22} color="#FFFFFF" filled />
          </div>
          <div>
            <h2 style={styles.headerTitle}>المفضلة</h2>
            <div style={styles.headerCount}>الجامعات المحفوظة</div>
          </div>
        </div>
        {favs.length > 0 && (
          <div style={styles.countBadge}>{favs.length} جامعات</div>
        )}
      </div>

      {favs.length === 0 ? (
        /* ─── Empty State ─── */
        <div style={styles.emptyContainer}>
          <div style={styles.emptyIconWrap}>
            <StarIcon size={48} color="var(--text-secondary, #B0B8C4)" />
          </div>
          <h3 style={styles.emptyTitle}>لا توجد جامعات محفوظة</h3>
          <p style={styles.emptyDesc}>
            أضف جامعاتك المفضلة من صفحة الجامعات للوصول إليها بسرعة
          </p>
          <button
            style={styles.ctaButton}
            onClick={() => setActiveView('universities')}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(197,165,90,0.35)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 4px 16px rgba(197,165,90,0.3)'; }}
          >
            <SearchIcon size={16} color="#FFFFFF" />
            تصفح الجامعات
          </button>
        </div>
      ) : (
        /* ─── Favorites List ─── */
        <div>
          {favs.map((u) => (
            <div
              key={u.id}
              style={styles.card}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.08), 0 2px 6px rgba(0,0,0,0.04)';
                e.currentTarget.style.borderColor = 'rgba(138,21,56,0.15)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.04), 0 1px 3px rgba(0,0,0,0.02)';
                e.currentTarget.style.borderColor = 'var(--border, rgba(0,0,0,0.06))';
              }}
            >
              {/* University Avatar */}
              <div style={styles.cardAvatar}>
                <UniversityIcon size={24} color="var(--maroon, #8A1538)" />
              </div>

              {/* Content */}
              <div style={styles.cardContent}>
                <div style={styles.cardName}>{u.name}</div>
                <div style={styles.cardMeta}>
                  <span style={styles.metaItem}>
                    <ChartIcon size={12} color="#8A1538" />
                    {u.minGrade}%+
                  </span>
                  <span style={styles.metaItem}>
                    <MoneyIcon size={12} color="#C5A55A" />
                    {u.tuition}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div style={styles.cardActions}>
                {/* Details button */}
                <button
                  style={styles.detailBtn}
                  onClick={() => {
                    setActiveView('chat');
                    sendMessage(`خطة دراسة ${u.name} والمواد والتخصصات`);
                  }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = ''; }}
                  aria-label="عرض التخصصات"
                >
                  <BookIcon size={13} color="#FFFFFF" />
                  التفاصيل
                </button>

                {/* Remove from favorites */}
                <button
                  style={styles.iconBtn('rgba(220,38,38,0.08)')}
                  onClick={() => toggleFav(u.id)}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(220,38,38,0.15)'; e.currentTarget.style.transform = 'scale(1.05)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'rgba(220,38,38,0.08)'; e.currentTarget.style.transform = ''; }}
                  aria-label="إزالة من المفضلة"
                >
                  <TrashIcon size={15} color="#DC2626" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
