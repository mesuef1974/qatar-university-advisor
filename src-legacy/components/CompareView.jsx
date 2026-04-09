import React from 'react';
import { CompareIcon, CloseIcon } from './icons/Icons';
import UniversityLogo from './UniversityLogos';

const compareFields = [
  { key: 'type', label: 'النوع' },
  { key: 'minGrade', label: 'الحد الأدنى', format: (v) => v ? `${v}%` : '—' },
  { key: 'tuition', label: 'الرسوم', format: (v) => v || 'مجانية' },
  { key: 'language', label: 'اللغة' },
  { key: 'location', label: 'الموقع' },
  { key: 'housing', label: 'السكن', format: (v) => v ? 'متوفر' : 'غير متوفر' },
  { key: 'qatariOnly', label: 'قطريين فقط', format: (v) => v ? 'نعم' : 'لا' },
  { key: 'admissionPeriod', label: 'فترة القبول' },
];

export default function CompareView({ UNIVERSITIES_DB, compareList, setCompareList, setActiveView, sendMessage: _sendMessage }) {
  const allUnis = Array.isArray(UNIVERSITIES_DB) ? UNIVERSITIES_DB : Object.values(UNIVERSITIES_DB || {});
  const selected = (compareList || []).map(id => allUnis.find(u => u.id === id)).filter(Boolean);

  const removeFromCompare = (id) => {
    setCompareList(prev => prev.filter(x => x !== id));
  };

  if (selected.length === 0) {
    return (
      <div className="eds-compare eds-compare--empty">
        <div className="eds-empty">
          <CompareIcon size={56} color="var(--text-muted)" />
          <h3>لم تختر جامعات للمقارنة بعد</h3>
          <p>اذهب إلى صفحة الجامعات واختر جامعتين أو أكثر للمقارنة</p>
          <button className="eds-btn eds-btn--primary" onClick={() => setActiveView('universities')}>
            تصفح الجامعات
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="eds-compare">
      <div className="eds-compare__header">
        <h2 className="eds-compare__title">مقارنة الجامعات</h2>
        <p className="eds-compare__subtitle">{selected.length} جامعات مختارة</p>
      </div>

      <div className="eds-compare__table-wrap">
        <table className="eds-compare__table">
          <thead>
            <tr>
              <th className="eds-compare__label-col"></th>
              {selected.map(uni => (
                <th key={uni.id} className="eds-compare__uni-col">
                  <div className="eds-compare__uni-header">
                    <UniversityLogo universityId={uni.id} size={40} />
                    <span className="eds-compare__uni-name">{uni.name}</span>
                    <button
                      className="eds-compare__remove"
                      onClick={() => removeFromCompare(uni.id)}
                      aria-label="إزالة"
                    >
                      <CloseIcon size={14} color="var(--text-muted)" />
                    </button>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {compareFields.map(field => (
              <tr key={field.key}>
                <td className="eds-compare__field-label">{field.label}</td>
                {selected.map(uni => (
                  <td key={uni.id} className="eds-compare__field-value">
                    {field.format ? field.format(uni[field.key]) : (uni[field.key] || '—')}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
