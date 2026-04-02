import React, { useState } from 'react';

const CATEGORIES = [
  { key: 'all', label: 'الكل', icon: '🏛️' },
  { key: 'gov', label: 'حكومية', icon: '🇶🇦', filter: u => u.type.includes('حكومية') },
  { key: 'intl', label: 'دولية', icon: '🌍', filter: u => u.type === 'دولية' },
  { key: 'private', label: 'خاصة', icon: '🏫', filter: u => u.type.includes('خاصة') },
  { key: 'military', label: 'عسكرية', icon: '⚔️', filter: u => u.type === 'عسكرية' || u.type === 'أمنية' },
  { key: 'special', label: 'تخصصية', icon: '✈️', filter: u => u.type === 'تخصصية' },
];

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
    { title: '🇶🇦 الجامعات الحكومية', unis: filtered.filter(u => u.type.includes('حكومية')) },
    { title: '🌍 الجامعات الدولية (المدينة التعليمية)', unis: filtered.filter(u => u.type === 'دولية') },
    { title: '🏫 الجامعات والكليات الخاصة', unis: filtered.filter(u => u.type.includes('خاصة')) },
    { title: '⚔️ الكليات العسكرية والأمنية', unis: filtered.filter(u => u.type === 'عسكرية' || u.type === 'أمنية') },
    { title: '✈️ الأكاديميات التخصصية', unis: filtered.filter(u => u.type === 'تخصصية') },
  ].filter(g => g.unis.length > 0) : [{ title: '', unis: filtered }];

  const renderCard = (u) => {
    const colors = TYPE_COLORS[u.type] || TYPE_COLORS['خاصة'];
    const isRestricted = isNonQatari && u.qatariOnly;

    return (
      <div key={u.id} style={{
        ...S.ucard,
        opacity: isRestricted ? 0.7 : 1,
        borderRight: `3px solid ${colors.border}`,
      }}>
        <div style={S.ucardH} onClick={() => setExpandedUni(expandedUni === u.id ? null : u.id)}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1 }}>
            <span style={{ fontSize: 26 }}>{u.icon}</span>
            <div style={{ flex: 1 }}>
              <div style={S.un}>{u.name}</div>
              <div style={{ display: 'flex', gap: 5, marginTop: 3, flexWrap: 'wrap' }}>
                <span style={{
                  ...S.badge,
                  background: colors.bg,
                  color: colors.text,
                  border: `1px solid ${colors.border}`,
                }}>
                  {u.type}
                </span>
                <span style={S.mt}>📊 {u.minGrade}%+</span>
                {isRestricted && (
                  <span style={{ fontSize: 10, color: '#dc2626', fontWeight: 600 }}>🔒 قطريين فقط</span>
                )}
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
            <button style={S.ib} onClick={(e) => { e.stopPropagation(); toggleFav(u.id); }}>
              {userProfile.favorites.includes(u.id) ? '⭐' : '☆'}
            </button>
            <button style={S.ib} onClick={(e) => { e.stopPropagation(); toggleCmp(u.id); }}>
              {compareList.includes(u.id) ? '✅' : '📊'}
            </button>
            <span style={{ color: '#6b7280' }}>{expandedUni === u.id ? '▲' : '▼'}</span>
          </div>
        </div>

        {expandedUni === u.id && (
          <div style={S.uex}>
            <p style={{ fontSize: 12, color: '#374151', margin: '6px 0', lineHeight: 1.6 }}>
              {u.description}
            </p>

            {isRestricted && (
              <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 8, padding: '8px 12px', marginBottom: 8, fontSize: 12 }}>
                ⚠️ <strong>هذه المؤسسة للقطريين فقط.</strong> اضغط "بدائل متاحة" لمعرفة خياراتك.
              </div>
            )}

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: 8 }}>
              <span style={S.chip}>📍 {u.location}</span>
              <span style={S.chip}>🗣️ {u.language}</span>
              <span style={S.chip}>📅 {u.admissionPeriod}</span>
              <span style={S.chip}>💰 {u.tuition}</span>
            </div>

            <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
              <div style={S.pros}>
                <div style={{ fontWeight: 700, fontSize: 11, color: '#16a34a', marginBottom: 3 }}>✅ المميزات</div>
                {u.pros.map((p, i) => <div key={i} style={{ fontSize: 11, color: '#15803d' }}>• {p}</div>)}
              </div>
              <div style={S.cons}>
                <div style={{ fontWeight: 700, fontSize: 11, color: '#ea580c', marginBottom: 3 }}>⚠️ التحديات</div>
                {u.cons.map((c, i) => <div key={i} style={{ fontSize: 11, color: '#c2410c' }}>• {c}</div>)}
              </div>
            </div>

            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              <button style={S.ab} onClick={() => { setActiveView('chat'); sendMessage(`خطة دراسة ${u.name} والمواد والتخصصات`); }}>
                📚 التخصصات
              </button>
              <button style={{ ...S.ab, background: '#6B1030' }} onClick={() => { setActiveView('chat'); sendMessage(`فرص العمل والرواتب بعد التخرج من ${u.name}`); }}>
                💼 فرص العمل
              </button>
              <button style={{ ...S.ab, background: '#C5A55A' }} onClick={() => { setActiveView('chat'); sendMessage(`شروط القبول والتقديم في ${u.name}`); }}>
                📋 شروط القبول
              </button>
              {isRestricted && (
                <button style={{ ...S.ab, background: '#0284C7' }} onClick={() => { setActiveView('chat'); sendMessage('منح لغير القطريين'); }}>
                  🌍 بدائل متاحة
                </button>
              )}
            </div>

            {u.website && (
              <a href={`https://${u.website}`} target="_blank" rel="noopener noreferrer" style={S.wb}>
                🌐 {u.website}
              </a>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div style={S.vc}>
      <div style={S.vh}>
        <h2 style={S.vt}>🏛️ الجامعات في قطر</h2>
        <p style={S.vs}>{allUnis.length} مؤسسة تعليمية — اضغط للتفاصيل</p>
      </div>

      {/* Search */}
      <div style={{ padding: '0 4px', marginBottom: 10 }}>
        <input
          type="text"
          placeholder="🔍 ابحث عن جامعة..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          style={{
            width: '100%', padding: '10px 14px', borderRadius: 10,
            border: '1px solid #E5E7EB', fontSize: 14, textAlign: 'right',
            direction: 'rtl', outline: 'none', color: '#111827',
            background: '#fff',
          }}
        />
      </div>

      {/* Category Filters */}
      <div style={{
        display: 'flex', gap: 6, padding: '0 4px', marginBottom: 12,
        overflowX: 'auto', flexWrap: 'nowrap',
        msOverflowStyle: 'none', scrollbarWidth: 'none',
      }}>
        {CATEGORIES.map(cat => (
          <button
            key={cat.key}
            onClick={() => setActiveCategory(cat.key)}
            style={{
              padding: '6px 12px', borderRadius: 20, fontSize: 12,
              fontWeight: activeCategory === cat.key ? 700 : 400,
              background: activeCategory === cat.key ? '#8A1538' : '#fff',
              color: activeCategory === cat.key ? '#fff' : '#374151',
              border: activeCategory === cat.key ? 'none' : '1px solid #E5E7EB',
              cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0,
              minHeight: 36,
            }}
          >
            {cat.icon} {cat.label}
          </button>
        ))}
      </div>

      {/* Grouped University List */}
      {grouped.map((group, gi) => (
        <div key={gi}>
          {group.title && (
            <div style={{
              padding: '8px 12px', margin: '4px 0', fontSize: 14,
              fontWeight: 700, color: '#8A1538',
              borderBottom: '2px solid #C5A55A',
            }}>
              {group.title}
              <span style={{ fontSize: 12, fontWeight: 400, color: '#6B7280', marginRight: 8 }}>
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
