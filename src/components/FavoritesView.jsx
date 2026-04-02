import React from 'react';

export default function FavoritesView({
  S,
  UNIVERSITIES_DB,
  userProfile,
  toggleFav,
  setActiveView,
  sendMessage,
}) {
  const favs = userProfile.favorites.map((id) => UNIVERSITIES_DB[id]).filter(Boolean);
  return (
    <div style={S.vc}>
      <div style={S.vh}>
        <h2 style={S.vt}>⭐ المفضلة</h2>
      </div>
      {favs.length === 0 ? (
        <div style={S.em}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>⭐</div>
          <p>أضف جامعات للمفضلة من قائمة الجامعات</p>
          <button style={S.gb} onClick={() => setActiveView('universities')}>
            استعرض الجامعات
          </button>
        </div>
      ) : (
        favs.map((u) => (
          <div
            key={u.id}
            style={{
              display: 'flex',
              gap: 10,
              background: '#fff',
              borderRadius: 12,
              padding: 14,
              marginBottom: 10,
              alignItems: 'center',
              boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
            }}
          >
            <span style={{ fontSize: 26 }}>{u.icon}</span>
            <div style={{ flex: 1 }}>
              <div style={S.un}>{u.name}</div>
              <div style={S.mt}>
                {u.minGrade}%+ | {u.tuition}
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
              <button style={S.ib} onClick={() => toggleFav(u.id)}>
                ⭐
              </button>
              <button
                style={{ ...S.ab, padding: '4px 8px', fontSize: 10, flex: 'unset' }}
                onClick={() => {
                  setActiveView('chat');
                  sendMessage(`خطة دراسة ${u.name} والمواد والتخصصات`);
                }}
              >
                📚
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
