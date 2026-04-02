import React, { useState } from 'react';

export default function Header({
  S,
  userProfile,
  activeView,
  setActiveView,
  showMenu,
  setShowMenu,
  quickBtns,
  sendMessage,
  selectNationality,
}) {
  const [showNatPicker, setShowNatPicker] = useState(false);
  const isQatari = userProfile.nationality === 'qatari';

  return (
    <div style={S.hdr}>

      {/* ══ Row 1: Brand bar ══ */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingBottom: 10 }}>

        {/* Hamburger */}
        <button
          style={S.hb}
          onClick={() => setShowMenu(!showMenu)}
          aria-label="القائمة الجانبية"
        >
          <svg width="17" height="13" viewBox="0 0 17 13" fill="none">
            <path d="M1 1h15M1 6.5h15M1 12h15" stroke="#fff" strokeWidth="1.8" strokeLinecap="round"/>
          </svg>
        </button>

        {/* Logo + name */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 0 }}>
          <div style={{
            width: 40, height: 40, borderRadius: '50%', flexShrink: 0,
            background: 'rgba(197,165,90,0.18)',
            border: '1.5px solid rgba(197,165,90,0.45)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 20,
          }}>🎓</div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap',
              fontWeight: 800, fontSize: 15, color: '#fff',
              fontFamily: "'Cairo','Tajawal',sans-serif", lineHeight: 1.2,
            }}>
              <span>المستشار الجامعي</span>

              {/* Nationality badge (clickable) */}
              {userProfile.nationality && (
                <button
                  onClick={() => setShowNatPicker(p => !p)}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 3,
                    fontSize: 10, fontWeight: 700,
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
                  {isQatari ? '🇶🇦 قطري' : '🌍 مقيم'}
                </button>
              )}
            </div>

            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.58)', marginTop: 2 }}>
              {userProfile.grade
                ? `معدل ${userProfile.grade}% · ${userProfile.track || ''}`
                : '23 جامعة · قاعدة معرفة شاملة'}
            </div>
          </div>
        </div>

        {/* Favorites button */}
        <button
          style={{ ...S.hb, position: 'relative' }}
          onClick={() => setActiveView(activeView === 'favorites' ? 'chat' : 'favorites')}
          aria-label="المفضلة"
        >
          <svg
            width="17" height="17" viewBox="0 0 24 24"
            fill={activeView === 'favorites' ? '#C5A55A' : 'none'}
            stroke={activeView === 'favorites' ? '#C5A55A' : '#fff'}
            strokeWidth="1.8" strokeLinejoin="round"
          >
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
          </svg>
          {userProfile.favorites.length > 0 && (
            <span style={{
              position: 'absolute', top: -3, left: -3,
              background: '#C5A55A', color: '#6B1030',
              borderRadius: '50%', width: 16, height: 16,
              fontSize: 9, fontWeight: 900,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: '2px solid #8A1538',
            }}>
              {userProfile.favorites.length}
            </span>
          )}
        </button>
      </div>

      {/* ══ Nationality picker dropdown ══ */}
      {showNatPicker && (
        <div style={{
          position: 'absolute', top: 62, right: 12, left: 12, zIndex: 300,
          background: '#fff', borderRadius: 14, padding: 14,
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
                    ? '2px solid #8A1538'
                    : '1.5px solid #E5E7EB',
                  background: userProfile.nationality === val ? '#FEF2F2' : '#FAFAFA',
                }}
              >
                {flag} {label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ══ Row 2: Quick-action chips ══ */}
      <div style={{
        display: 'flex', gap: 6, paddingBottom: 10,
        overflowX: 'auto', msOverflowStyle: 'none', scrollbarWidth: 'none',
      }}>
        {quickBtns.map((b, i) => (
          <button key={i}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 5,
              padding: '6px 13px', borderRadius: 20, flexShrink: 0,
              background: 'rgba(255,255,255,0.09)',
              border: '1px solid rgba(255,255,255,0.15)',
              color: 'rgba(255,255,255,0.92)', cursor: 'pointer',
              fontSize: 11.5, fontWeight: 600, whiteSpace: 'nowrap',
              fontFamily: "'Tajawal',sans-serif",
              transition: 'background 0.15s ease, border-color 0.15s ease',
            }}
            onMouseEnter={e=>{e.currentTarget.style.background='rgba(255,255,255,0.18)';e.currentTarget.style.borderColor='rgba(255,255,255,0.28)';}}
            onMouseLeave={e=>{e.currentTarget.style.background='rgba(255,255,255,0.09)';e.currentTarget.style.borderColor='rgba(255,255,255,0.15)';}}
            onClick={() => { setActiveView('chat'); sendMessage(b.q); }}
          >
            <span style={{ fontSize: 14 }}>{b.icon}</span>
            <span>{b.label}</span>
          </button>
        ))}
      </div>

      {/* ══ Gold accent underline ══ */}
      <div style={{
        height: 2, margin: '0 -14px',
        background: 'linear-gradient(90deg, transparent 0%, rgba(197,165,90,0.6) 50%, transparent 100%)',
      }} />
    </div>
  );
}
