import React, { useState, useMemo } from 'react';
import { SearchIcon, StarIcon, CompareIcon, ChevronDownIcon, LinkIcon } from './icons/Icons';
import UniversityLogo from './UniversityLogos';

const typeFilters = [
  { id: 'all', label: 'الكل' },
  { id: 'حكومية', label: 'حكومية' },
  { id: 'دولية', label: 'دولية' },
  { id: 'خاصة', label: 'خاصة' },
  { id: 'عسكرية', label: 'عسكرية' },
];

function formatTuition(tuition) {
  if (!tuition) return 'مجانية';
  if (typeof tuition === 'string') return tuition;
  return tuition;
}

export default function UniversitiesView({ UNIVERSITIES_DB, expandedUni, setExpandedUni, userProfile, compareList, toggleFav, toggleCmp, setActiveView, sendMessage }) {
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');

  const universities = useMemo(() => {
    if (!UNIVERSITIES_DB) return [];
    let list = Array.isArray(UNIVERSITIES_DB) ? UNIVERSITIES_DB : Object.values(UNIVERSITIES_DB);

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(u =>
        (u.name || '').toLowerCase().includes(q) ||
        (u.description || '').toLowerCase().includes(q)
      );
    }

    if (activeFilter !== 'all') {
      list = list.filter(u => (u.type || '').includes(activeFilter));
    }

    return list;
  }, [UNIVERSITIES_DB, search, activeFilter]);

  const isFav = (id) => userProfile?.favorites?.includes(id);
  const isCmp = (id) => compareList?.includes(id);

  return (
    <div className="eds-unis">
      {/* Section header */}
      <div className="eds-unis__header">
        <h2 className="eds-unis__title">الجامعات والمؤسسات التعليمية</h2>
        <p className="eds-unis__subtitle">{universities.length}+ جامعة ومؤسسة في قطر</p>
      </div>

      {/* Search bar */}
      <div className="eds-unis__search-wrap">
        <SearchIcon size={18} color="var(--text-muted)" />
        <input
          type="text"
          className="eds-unis__search"
          placeholder="ابحث عن جامعة أو تخصص..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          dir="rtl"
        />
      </div>

      {/* Filter pills */}
      <div className="eds-unis__filters">
        {typeFilters.map(f => (
          <button
            key={f.id}
            className={`eds-unis__filter ${activeFilter === f.id ? 'eds-unis__filter--active' : ''}`}
            onClick={() => setActiveFilter(f.id)}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* University cards */}
      <div className="eds-unis__grid">
        {universities.map(uni => {
          const isExpanded = expandedUni === uni.id;
          return (
            <div key={uni.id} className="eds-unis__card">
              <div className="eds-unis__card-top">
                <UniversityLogo universityId={uni.id} size={48} />
                <div className="eds-unis__card-info">
                  <h3 className="eds-unis__card-name">{uni.name}</h3>
                  <span className="eds-unis__card-meta">
                    {uni.type}{uni.location && <> &bull; {uni.location}</>}
                  </span>
                </div>
              </div>

              {uni.description && (
                <p className="eds-unis__card-desc">{uni.description}</p>
              )}

              <div className="eds-unis__card-stats">
                <div className="eds-unis__stat">
                  <span className="eds-unis__stat-value">{uni.minGrade ? `${uni.minGrade}%` : '—'}</span>
                  <span className="eds-unis__stat-label">الحد الأدنى</span>
                </div>
                <div className="eds-unis__stat">
                  <span className="eds-unis__stat-value">{formatTuition(uni.tuition)}</span>
                  <span className="eds-unis__stat-label">الرسوم</span>
                </div>
                <div className="eds-unis__stat">
                  <span className="eds-unis__stat-value">{uni.language || '—'}</span>
                  <span className="eds-unis__stat-label">اللغة</span>
                </div>
              </div>

              <div className="eds-unis__card-actions">
                <button
                  className="eds-unis__details-btn"
                  onClick={() => setExpandedUni(isExpanded ? null : uni.id)}
                >
                  <span>{isExpanded ? 'إخفاء التفاصيل' : 'عرض التفاصيل'}</span>
                  <ChevronDownIcon size={14} color="var(--maroon)" />
                </button>
                <div className="eds-unis__card-btns">
                  <button
                    className={`eds-unis__fav-btn ${isFav(uni.id) ? 'eds-unis__fav-btn--active' : ''}`}
                    onClick={() => toggleFav(uni.id)}
                    aria-label="مفضلة"
                  >
                    <StarIcon size={18} color={isFav(uni.id) ? '#C5A55A' : 'var(--text-muted)'} filled={isFav(uni.id)} />
                  </button>
                  <button
                    className={`eds-unis__cmp-btn ${isCmp(uni.id) ? 'eds-unis__cmp-btn--active' : ''}`}
                    onClick={() => toggleCmp(uni.id)}
                    aria-label="مقارنة"
                  >
                    <CompareIcon size={18} color={isCmp(uni.id) ? '#7C3AED' : 'var(--text-muted)'} />
                  </button>
                </div>
              </div>

              {/* Expanded details */}
              {isExpanded && (
                <div className="eds-unis__details">
                  <table className="eds-unis__details-table">
                    <tbody>
                      {uni.admissionPeriod && (
                        <tr>
                          <td className="eds-unis__dt-label">فترة القبول</td>
                          <td className="eds-unis__dt-value">{uni.admissionPeriod}</td>
                        </tr>
                      )}
                      {uni.housing !== undefined && (
                        <tr>
                          <td className="eds-unis__dt-label">السكن الجامعي</td>
                          <td className="eds-unis__dt-value">{uni.housing ? 'متوفر' : 'غير متوفر'}</td>
                        </tr>
                      )}
                      {uni.qatariOnly !== undefined && (
                        <tr>
                          <td className="eds-unis__dt-label">قطريين فقط</td>
                          <td className="eds-unis__dt-value">{uni.qatariOnly ? 'نعم' : 'لا'}</td>
                        </tr>
                      )}
                      {uni.website && (
                        <tr>
                          <td className="eds-unis__dt-label">الموقع</td>
                          <td className="eds-unis__dt-value">
                            <a href={uni.website} target="_blank" rel="noopener noreferrer" className="eds-unis__link">
                              <LinkIcon size={14} color="var(--maroon)" />
                              <span>زيارة الموقع</span>
                            </a>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>

                  {uni.pros && uni.pros.length > 0 && (
                    <div className="eds-unis__pros">
                      <h4>المميزات</h4>
                      <ul>
                        {uni.pros.map((p, i) => <li key={i}>{p}</li>)}
                      </ul>
                    </div>
                  )}
                  {uni.cons && uni.cons.length > 0 && (
                    <div className="eds-unis__cons">
                      <h4>التحديات</h4>
                      <ul>
                        {uni.cons.map((c, i) => <li key={i}>{c}</li>)}
                      </ul>
                    </div>
                  )}

                  <button
                    className="eds-unis__ask-btn"
                    onClick={() => {
                      sendMessage(`أخبرني المزيد عن ${uni.name}`);
                      setActiveView('chat');
                    }}
                  >
                    اسأل المستشار عن هذه الجامعة
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {universities.length === 0 && (
        <div className="eds-empty">
          <SearchIcon size={48} color="var(--text-muted)" />
          <p>لم يتم العثور على نتائج</p>
        </div>
      )}
    </div>
  );
}
