import React, { useState } from 'react';

/**
 * LanguageToggle — زر تبديل اللغة (عربي/إنجليزي)
 * I18N-A1: Sprint 1
 *
 * ملاحظة: هذا المكون مستقل ولا يعتمد على i18next
 * لأن التطبيق الحالي لم يُحوَّل بالكامل إلى i18n بعد.
 * في Sprint 2 سيتم ربطه بـ i18next عند تحويل باقي المكونات.
 */
export default function LanguageToggle() {
  const [lang, setLang] = useState('ar');

  const isArabic = lang === 'ar';

  const toggle = () => {
    const next = isArabic ? 'en' : 'ar';
    setLang(next);
    // Update document direction
    document.documentElement.dir = next === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = next;
    // Store preference
    localStorage.setItem('advisor_language', next);
  };

  return (
    <button
      onClick={toggle}
      aria-label={isArabic ? 'Switch to English' : 'التبديل للعربية'}
      style={{
        position: 'fixed',
        top: 12,
        left: isArabic ? 12 : 'auto',
        right: isArabic ? 'auto' : 12,
        zIndex: 10000,
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        padding: '6px 14px',
        background: 'rgba(138, 21, 56, 0.92)',
        color: '#fff',
        border: '1px solid rgba(197, 165, 90, 0.4)',
        borderRadius: 20,
        cursor: 'pointer',
        fontSize: 13,
        fontWeight: 600,
        fontFamily: "'Cairo', 'Segoe UI', sans-serif",
        backdropFilter: 'blur(8px)',
        boxShadow: '0 2px 12px rgba(0,0,0,0.2)',
        transition: 'background 0.2s, transform 0.1s',
      }}
      onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(138, 21, 56, 1)'; }}
      onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(138, 21, 56, 0.92)'; }}
      onMouseDown={(e) => { e.currentTarget.style.transform = 'scale(0.96)'; }}
      onMouseUp={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
    >
      <span style={{ fontSize: 16, lineHeight: 1 }}>
        {isArabic ? '🇬🇧' : '🇶🇦'}
      </span>
      <span>{isArabic ? 'English' : 'العربية'}</span>
    </button>
  );
}
