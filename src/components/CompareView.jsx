import React from 'react';
import {
  CompareIcon,
  ChartIcon,
  MoneyIcon,
  LanguageIcon,
  UniversityIcon,
  GlobeIcon,
  CheckIcon,
  CloseIcon,
  TrashIcon,
  QatarFlagIcon,
  SearchIcon,
  BookIcon,
} from './icons/Icons';

// ════════════════════════════════════════════════════════════════════
// CompareView — Professional University Comparison v2.0
// ════════════════════════════════════════════════════════════════════

export default function CompareView({
  S: _S,
  UNIVERSITIES_DB,
  compareList,
  setCompareList,
  setActiveView,
  sendMessage,
}) {
  const unis = compareList.map((id) => UNIVERSITIES_DB[id]).filter(Boolean);

  // ─── Styles ───
  const styles = {
    container: {
      padding: '20px 16px',
      minHeight: '100%',
      background: 'var(--bg, #FFFFFF)',
    },
    header: {
      display: 'flex', alignItems: 'center', gap: 12,
      marginBottom: 24, paddingBottom: 16,
      borderBottom: '2px solid var(--border, rgba(0,0,0,0.06))',
    },
    headerIcon: {
      width: 44, height: 44, borderRadius: 14,
      background: 'linear-gradient(135deg, #8A1538, #6B1030)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      boxShadow: '0 4px 14px rgba(138,21,56,0.25)',
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
      border: '2px dashed var(--border, rgba(0,0,0,0.1))',
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
      background: 'linear-gradient(135deg, #8A1538, #6B1030)',
      color: '#FFFFFF', border: 'none', borderRadius: 14,
      fontSize: 14, fontWeight: 700, cursor: 'pointer',
      fontFamily: "'Tajawal',sans-serif",
      boxShadow: '0 4px 16px rgba(138,21,56,0.25)',
      transition: 'all 0.2s ease',
    },
    // Suggestion pills
    suggestionSection: {
      marginTop: 28, width: '100%', maxWidth: 340,
    },
    suggestionLabel: {
      fontSize: 13, fontWeight: 700,
      color: 'var(--text-secondary, #6B7280)',
      marginBottom: 12, textAlign: 'center',
    },
    suggestionPill: {
      display: 'flex', alignItems: 'center', gap: 8,
      padding: '10px 16px', marginBottom: 8,
      background: 'var(--card-bg, #FFFFFF)',
      border: '1.5px solid var(--border, rgba(0,0,0,0.08))',
      borderRadius: 12, cursor: 'pointer',
      fontSize: 13, fontWeight: 600, width: '100%',
      color: 'var(--text, #1C1C1E)',
      fontFamily: "'Tajawal',sans-serif", textAlign: 'right',
      transition: 'all 0.2s ease',
    },
    // Table
    tableWrap: {
      background: 'var(--card-bg, #FFFFFF)',
      borderRadius: 16, overflow: 'hidden',
      boxShadow: '0 4px 20px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.03)',
      border: '1px solid var(--border, rgba(0,0,0,0.06))',
    },
    tableHeaderRow: {
      display: 'flex',
      background: 'linear-gradient(135deg, rgba(138,21,56,0.04), rgba(138,21,56,0.08))',
      borderBottom: '2px solid rgba(138,21,56,0.12)',
    },
    tableHeaderLabel: {
      flex: '0 0 100px', padding: '16px 14px',
      fontSize: 11, fontWeight: 700,
      color: 'var(--maroon, #8A1538)',
      textTransform: 'uppercase',
      letterSpacing: 0.5,
      display: 'flex', alignItems: 'center',
    },
    tableHeaderCell: {
      flex: 1, padding: '16px 12px',
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      gap: 6, textAlign: 'center',
    },
    uniAvatar: {
      width: 44, height: 44, borderRadius: 12,
      background: 'var(--maroon-bg, rgba(138,21,56,0.08))',
      border: '2px solid rgba(138,21,56,0.15)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    },
    uniName: {
      fontSize: 12, fontWeight: 700,
      color: 'var(--text, #1C1C1E)',
      lineHeight: 1.3, maxWidth: 100,
    },
    tableRow: (isEven) => ({
      display: 'flex',
      borderBottom: '1px solid var(--border, rgba(0,0,0,0.04))',
      background: isEven ? 'var(--surface, rgba(0,0,0,0.015))' : 'var(--card-bg, #FFFFFF)',
      transition: 'background 0.15s ease',
    }),
    rowLabel: {
      flex: '0 0 100px', padding: '14px 14px',
      display: 'flex', alignItems: 'center', gap: 6,
      fontSize: 12.5, fontWeight: 700,
      color: 'var(--text-secondary, #6B7280)',
    },
    rowCell: {
      flex: 1, padding: '14px 12px',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: 13, fontWeight: 600,
      color: 'var(--text, #1C1C1E)',
    },
    badge: (bg, color) => ({
      padding: '4px 10px', borderRadius: 20,
      background: bg, color: color,
      fontSize: 11.5, fontWeight: 700,
      display: 'inline-flex', alignItems: 'center', gap: 4,
    }),
    actionBar: {
      display: 'flex', gap: 10, marginTop: 16, flexWrap: 'wrap',
    },
    actionBtn: (bg) => ({
      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
      padding: '12px 20px', flex: 1, minWidth: 140,
      background: bg, color: '#FFFFFF',
      border: 'none', borderRadius: 12,
      fontSize: 13, fontWeight: 700, cursor: 'pointer',
      fontFamily: "'Tajawal',sans-serif",
      boxShadow: `0 4px 14px ${bg}33`,
      transition: 'all 0.2s ease',
    }),
  };

  const rows = [
    {
      label: 'المعدل', key: 'minGrade',
      format: (v) => <span style={styles.badge('rgba(138,21,56,0.1)', '#8A1538')}>{v}%+</span>,
      Icon: ChartIcon, iconColor: '#8A1538',
    },
    {
      label: 'الرسوم', key: 'tuition',
      format: (v) => <span style={styles.badge('rgba(197,165,90,0.12)', '#92750E')}>{v}</span>,
      Icon: MoneyIcon, iconColor: '#C5A55A',
    },
    {
      label: 'اللغة', key: 'language',
      format: (v) => <span style={styles.badge('rgba(29,78,216,0.1)', '#1D4ED8')}>{v}</span>,
      Icon: LanguageIcon, iconColor: '#1D4ED8',
    },
    {
      label: 'سكن', key: 'housing',
      format: (v) => v
        ? <span style={styles.badge('rgba(5,150,105,0.1)', '#059669')}><CheckIcon size={13} color="#059669" /> متوفر</span>
        : <span style={styles.badge('rgba(220,38,38,0.1)', '#DC2626')}><CloseIcon size={13} color="#DC2626" /> غير متوفر</span>,
      Icon: UniversityIcon, iconColor: '#059669',
    },
    {
      label: 'متاح لـ', key: 'qatariOnly',
      format: (v) => v
        ? <span style={{...styles.badge('rgba(138,21,56,0.08)', '#8A1538'), gap: 4}}><QatarFlagIcon size={13} /> قطريين فقط</span>
        : <span style={{...styles.badge('rgba(107,114,128,0.1)', '#6B7280'), gap: 4}}><GlobeIcon size={13} color="#6B7280" /> الجميع</span>,
      Icon: GlobeIcon, iconColor: '#6B7280',
    },
  ];

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerIcon}>
          <CompareIcon size={22} color="#FFFFFF" />
        </div>
        <div>
          <h2 style={styles.headerTitle}>مقارنة الجامعات</h2>
          {unis.length > 0 && (
            <div style={styles.headerCount}>{unis.length} جامعات في المقارنة</div>
          )}
        </div>
      </div>

      {unis.length === 0 ? (
        /* ─── Empty State ─── */
        <div style={styles.emptyContainer}>
          <div style={styles.emptyIconWrap}>
            <CompareIcon size={48} color="var(--text-secondary, #B0B8C4)" />
          </div>
          <h3 style={styles.emptyTitle}>قارن بين الجامعات</h3>
          <p style={styles.emptyDesc}>
            اختر جامعتين أو أكثر من صفحة الجامعات لمقارنتها جنبا إلى جنب
          </p>
          <button
            style={styles.ctaButton}
            onClick={() => setActiveView('universities')}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(138,21,56,0.3)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 4px 16px rgba(138,21,56,0.25)'; }}
          >
            <SearchIcon size={16} color="#FFFFFF" />
            تصفح الجامعات
          </button>

          <div style={styles.suggestionSection}>
            <div style={styles.suggestionLabel}>أو جرب هذه المقارنات السريعة</div>
            {[
              'مقارنة كورنيل مع طب QU',
              'مقارنة تكساس مع هندسة QU',
              'مقارنة الكليات العسكرية الخمس',
            ].map((q, i) => (
              <button
                key={i}
                style={styles.suggestionPill}
                onClick={() => {
                  setActiveView('chat');
                  sendMessage(q);
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = 'var(--maroon, #8A1538)';
                  e.currentTarget.style.background = 'rgba(138,21,56,0.03)';
                  e.currentTarget.style.transform = 'translateX(-2px)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = 'var(--border, rgba(0,0,0,0.08))';
                  e.currentTarget.style.background = 'var(--card-bg, #FFFFFF)';
                  e.currentTarget.style.transform = '';
                }}
              >
                <CompareIcon size={14} color="var(--maroon, #8A1538)" />
                {q}
              </button>
            ))}
          </div>
        </div>
      ) : (
        /* ─── Comparison Table ─── */
        <>
          <div style={styles.tableWrap}>
            {/* Header row with university names */}
            <div style={styles.tableHeaderRow}>
              <div style={styles.tableHeaderLabel}>المعيار</div>
              {unis.map((u) => (
                <div key={u.id} style={styles.tableHeaderCell}>
                  <div style={styles.uniAvatar}>
                    <UniversityIcon size={22} color="var(--maroon, #8A1538)" />
                  </div>
                  <div style={styles.uniName}>{u.name}</div>
                </div>
              ))}
            </div>

            {/* Data rows */}
            {rows.map((r, i) => (
              <div key={i} style={styles.tableRow(i % 2 === 0)}>
                <div style={styles.rowLabel}>
                  <r.Icon size={14} color={r.iconColor} />
                  {r.label}
                </div>
                {unis.map((u) => (
                  <div key={u.id} style={styles.rowCell}>
                    {r.format ? r.format(u[r.key]) : u[r.key]}
                  </div>
                ))}
              </div>
            ))}
          </div>

          {/* Action buttons */}
          <div style={styles.actionBar}>
            <button
              style={styles.actionBtn('linear-gradient(135deg, #8A1538, #6B1030)')}
              onClick={() => {
                setActiveView('chat');
                sendMessage(
                  `قارن بالتفصيل بين ${unis.map((u) => u.name).join(' و')} — الخطة الدراسية والمواد وفرص العمل`
                );
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = ''; }}
            >
              <BookIcon size={15} color="#FFFFFF" />
              مقارنة تفصيلية
            </button>
            <button
              style={styles.actionBtn('#DC2626')}
              onClick={() => setCompareList([])}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = ''; }}
            >
              <TrashIcon size={14} color="#FFFFFF" />
              مسح الكل
            </button>
          </div>
        </>
      )}
    </div>
  );
}
