import React from 'react';
import { StarIcon, TrashIcon } from './icons/Icons';
import UniversityLogo from './UniversityLogos';

export default function FavoritesView({ UNIVERSITIES_DB, userProfile, toggleFav, setActiveView, sendMessage: _sendMessage }) {
  const allUnis = Array.isArray(UNIVERSITIES_DB) ? UNIVERSITIES_DB : Object.values(UNIVERSITIES_DB || {});
  const favIds = userProfile?.favorites || [];
  const favorites = favIds.map(id => allUnis.find(u => u.id === id)).filter(Boolean);

  if (favorites.length === 0) {
    return (
      <div className="eds-favs eds-favs--empty">
        <div className="eds-empty">
          <StarIcon size={56} color="var(--text-muted)" />
          <h3>لم تضف جامعات إلى المفضلة بعد</h3>
          <p>تصفح الجامعات وأضف المفضلة لديك بالضغط على نجمة</p>
          <button className="eds-btn eds-btn--primary" onClick={() => setActiveView('universities')}>
            تصفح الجامعات
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="eds-favs">
      <div className="eds-favs__header">
        <h2 className="eds-favs__title">الجامعات المفضلة</h2>
        <p className="eds-favs__subtitle">{favorites.length} جامعة</p>
      </div>

      <div className="eds-favs__list">
        {favorites.map(uni => (
          <div key={uni.id} className="eds-favs__item">
            <UniversityLogo universityId={uni.id} size={40} />
            <div className="eds-favs__item-info">
              <span className="eds-favs__item-name">{uni.name}</span>
              <span className="eds-favs__item-type">{uni.type}</span>
            </div>
            <button
              className="eds-favs__remove-btn"
              onClick={() => toggleFav(uni.id)}
              aria-label="إزالة من المفضلة"
            >
              <TrashIcon size={16} color="#DC2626" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
