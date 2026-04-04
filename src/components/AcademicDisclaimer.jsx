import React, { useState } from 'react';

// ════════════════════════════════════════════════════════════════════
// AcademicDisclaimer — إخلاء المسؤولية الأكاديمي
// يُعرض كـ banner ثابت في أسفل الشاشة أو أعلى الصفحة
// ════════════════════════════════════════════════════════════════════

export default function AcademicDisclaimer({ position = 'bottom' }) {
  const [dismissed, setDismissed] = useState(
    () => sessionStorage.getItem('disclaimer_dismissed') === 'true'
  );

  if (dismissed) return null;

  const isBottom = position === 'bottom';

  const containerStyle = {
    position: 'fixed',
    ...(isBottom ? { bottom: 0 } : { top: 0 }),
    left: 0,
    right: 0,
    zIndex: 1000,
    background: 'linear-gradient(135deg,rgba(254,243,199,0.98),rgba(255,237,168,0.98))',
    borderTop: isBottom ? '2px solid #F59E0B' : 'none',
    borderBottom: isBottom ? 'none' : '2px solid #F59E0B',
    padding: '8px 16px',
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    boxShadow: isBottom
      ? '0 -2px 16px rgba(245,158,11,0.18)'
      : '0 2px 16px rgba(245,158,11,0.18)',
    direction: 'rtl',
    fontFamily: "'Tajawal','Cairo','Segoe UI',Tahoma,sans-serif",
  };

  const textStyle = {
    flex: 1,
    fontSize: 12,
    color: '#92400E',
    lineHeight: 1.6,
    fontWeight: 500,
  };

  const linkStyle = {
    color: '#8A1538',
    textDecoration: 'underline',
    fontWeight: 600,
    whiteSpace: 'nowrap',
    cursor: 'pointer',
  };

  const dismissStyle = {
    background: 'none',
    border: '1px solid rgba(146,64,14,0.3)',
    borderRadius: 6,
    padding: '3px 8px',
    cursor: 'pointer',
    fontSize: 11,
    color: '#92400E',
    fontFamily: "'Tajawal',sans-serif",
    flexShrink: 0,
  };

  const handleDismiss = () => {
    sessionStorage.setItem('disclaimer_dismissed', 'true');
    setDismissed(true);
  };

  return (
    <div style={containerStyle} role="note" aria-label="إخلاء المسؤولية الأكاديمي">
      <span style={{ fontSize: 16, flexShrink: 0 }}>⚠️</span>
      <p style={textStyle}>
        <strong>المعلومات المقدَّمة إرشادية فقط.</strong> تحقق دائماً من الجامعة مباشرة قبل اتخاذ أي قرار أكاديمي.{' '}
        <a href="/privacy" style={linkStyle}>سياسة الخصوصية</a>
        {' | '}
        <a href="/terms" style={linkStyle}>شروط الاستخدام</a>
      </p>
      <button
        style={dismissStyle}
        onClick={handleDismiss}
        aria-label="إغلاق التنبيه"
      >
        ✕
      </button>
    </div>
  );
}
