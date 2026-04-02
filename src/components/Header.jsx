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

  const natBadge = userProfile.nationality === 'qatari' ? '🇶🇦' : '🌍';
  const natLabel = userProfile.nationality === 'qatari' ? 'قطري' : 'مقيم';

  return (
    <div style={S.hdr}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingBottom: 8 }}>
        <button style={S.hb} onClick={() => setShowMenu(!showMenu)}>
          <span style={{ fontSize: 20 }}>☰</span>
        </button>
        <div
          style={{
            position: 'relative',
            width: 38,
            height: 38,
            background: '#128c7e',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <span style={{ fontSize: 20 }}>🎓</span>
          <div
            style={{
              position: 'absolute',
              bottom: 2,
              left: 2,
              width: 9,
              height: 9,
              background: '#25d366',
              borderRadius: '50%',
              border: '2px solid #075e54',
            }}
          />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700, fontSize: 14, color: '#fff', display: 'flex', alignItems: 'center', gap: 6 }}>
            المستشار الجامعي الذكي v5
            {userProfile.nationality && (
              <span
                onClick={(e) => { e.stopPropagation(); setShowNatPicker(!showNatPicker); }}
                style={{
                  fontSize: 11,
                  background: 'rgba(255,255,255,0.2)',
                  padding: '2px 8px',
                  borderRadius: 10,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 3,
                  transition: 'background 0.2s',
                }}
                title="تغيير الجنسية"
              >
                {natBadge} {natLabel}
              </span>
            )}
          </div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.85)' }}>
            {userProfile.grade ? `📊 ${userProfile.grade}% ${userProfile.track || ''}` : ''} قاعدة
            معرفة شاملة
          </div>
        </div>
        <button
          style={{ ...S.hb, position: 'relative' }}
          onClick={() => setActiveView(activeView === 'favorites' ? 'chat' : 'favorites')}
        >
          <span style={{ fontSize: 18 }}>⭐</span>
          {userProfile.favorites.length > 0 && (
            <span
              style={{
                position: 'absolute',
                top: -2,
                right: -2,
                background: '#25d366',
                color: '#fff',
                borderRadius: '50%',
                width: 14,
                height: 14,
                fontSize: 9,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {userProfile.favorites.length}
            </span>
          )}
        </button>
      </div>

      {/* Nationality picker dropdown */}
      {showNatPicker && (
        <div style={{
          position: 'absolute', top: 52, left: 60, right: 60, zIndex: 300,
          background: '#fff', borderRadius: 12, padding: 12, boxShadow: '0 4px 20px rgba(0,0,0,0.25)',
          display: 'flex', gap: 8, justifyContent: 'center',
        }}>
          <button onClick={() => { selectNationality('qatari'); setShowNatPicker(false); }} style={{
            flex: 1, padding: '10px 8px', borderRadius: 8, border: userProfile.nationality === 'qatari' ? '2px solid #8A1538' : '1px solid #e5e7eb',
            background: userProfile.nationality === 'qatari' ? '#FEF2F2' : '#fff', cursor: 'pointer', fontSize: 14, fontWeight: 600,
            color: '#1a1a1a', fontFamily: "'Tajawal',sans-serif", minHeight: 44,
          }}>
            🇶🇦 قطري
          </button>
          <button onClick={() => { selectNationality('non_qatari'); setShowNatPicker(false); }} style={{
            flex: 1, padding: '10px 8px', borderRadius: 8, border: userProfile.nationality === 'non_qatari' ? '2px solid #8A1538' : '1px solid #e5e7eb',
            background: userProfile.nationality === 'non_qatari' ? '#FEF2F2' : '#fff', cursor: 'pointer', fontSize: 14, fontWeight: 600,
            color: '#1a1a1a', fontFamily: "'Tajawal',sans-serif", minHeight: 44,
          }}>
            🌍 مقيم
          </button>
        </div>
      )}

      <div style={{ display: 'flex', gap: 4, overflowX: 'auto', paddingBottom: 8 }}>
        {quickBtns.map((b, i) => (
          <button
            key={i}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 2,
              padding: '6px 10px',
              background: 'rgba(255,255,255,0.15)',
              border: 'none',
              borderRadius: 12,
              color: '#fff',
              cursor: 'pointer',
              fontSize: 11,
              whiteSpace: 'nowrap',
              flexShrink: 0,
              minHeight: 44,
              justifyContent: 'center',
              transition: 'background 0.2s',
            }}
            onClick={() => {
              setActiveView('chat');
              sendMessage(b.q);
            }}
          >
            <span>{b.icon}</span>
            <span style={{ fontSize: 10 }}>{b.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
