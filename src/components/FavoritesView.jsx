import React from 'react';
import {
  StarIcon,
  BookIcon,
  UniversityIcon,
} from './icons/Icons';

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
        <h2 style={{ ...S.vt, display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{
            width: 36, height: 36, borderRadius: 10,
            background: 'linear-gradient(135deg,#C5A55A,#A8893F)',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <StarIcon size={20} color="#FFFFFF" filled />
          </span>
          المفضلة
        </h2>
      </div>
      {favs.length === 0 ? (
        <div style={S.em}>
          <div style={{ marginBottom: 12, display: 'flex', justifyContent: 'center' }}>
            <StarIcon size={48} color="var(--text-secondary, #9CA3AF)" />
          </div>
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
              background: 'var(--card-bg,#fff)',
              borderRadius: 'var(--radius-md, 12px)',
              padding: 14,
              marginBottom: 10,
              alignItems: 'center',
              boxShadow: 'var(--shadow-sm, 0 1px 4px rgba(0,0,0,0.1))',
              border: '1px solid var(--border, #E5E7EB)',
              transition: 'transform 0.15s ease, box-shadow 0.15s ease',
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = 'var(--shadow-md, 0 4px 12px rgba(0,0,0,0.1))'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'var(--shadow-sm, 0 1px 4px rgba(0,0,0,0.1))'; }}
          >
            <div style={{
              width: 40, height: 40, borderRadius: 10,
              background: 'var(--maroon-bg, #FEF2F2)',
              border: '1px solid rgba(138,21,56,0.15)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}>
              <UniversityIcon size={20} color="var(--maroon, #8A1538)" />
            </div>
            <div style={{ flex: 1 }}>
              <div style={S.un}>{u.name}</div>
              <div style={S.mt}>
                {u.minGrade}%+ | {u.tuition}
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
              <button
                style={{
                  ...S.ib,
                  background: 'rgba(197,165,90,0.12)',
                  transition: 'all 0.15s ease',
                }}
                onClick={() => toggleFav(u.id)}
                aria-label="إزالة من المفضلة"
              >
                <StarIcon size={16} color="#C5A55A" filled />
              </button>
              <button
                style={{
                  ...S.ab,
                  padding: '4px 8px', fontSize: 12, flex: 'unset',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 3,
                }}
                onClick={() => {
                  setActiveView('chat');
                  sendMessage(`خطة دراسة ${u.name} والمواد والتخصصات`);
                }}
                aria-label="عرض التخصصات"
              >
                <BookIcon size={13} color="#FFFFFF" />
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
