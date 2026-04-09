import React, { useState } from 'react';

export default function PrivacyConsent({ onAccept, onReject, onShowPrivacy, onShowTerms }) {
  const [rejected, setRejected] = useState(false);

  const handleAccept = () => {
    localStorage.setItem('advisor_consent_timestamp', new Date().toISOString());
    onAccept();
  };

  const handleReject = () => {
    setRejected(true);
    if (onReject) onReject();
  };

  if (rejected) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100dvh',
        background: 'linear-gradient(135deg, #8A1538 0%, #4a0d22 100%)',
        color: '#fff',
        textAlign: 'center',
        padding: '24px 20px',
        direction: 'rtl',
        fontFamily: "'Tajawal', 'Cairo', 'Segoe UI', sans-serif",
      }}>
        <div style={{ fontSize: 64, marginBottom: 16, lineHeight: 1 }}>🚫</div>
        <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 12, marginTop: 0 }}>
          لا يمكن المتابعة
        </h1>
        <p style={{
          fontSize: 14, opacity: 0.85, marginBottom: 28, lineHeight: 1.8,
          maxWidth: 360,
        }}>
          عذراً، يجب الموافقة على سياسة الخصوصية وشروط الاستخدام للمتابعة وفقاً لقانون حماية البيانات الشخصية القطري (PDPPL).
        </p>
        <button
          onClick={() => setRejected(false)}
          style={{
            padding: '14px 0',
            borderRadius: 14,
            background: 'linear-gradient(135deg, #C5A55A 0%, #a8893d 100%)',
            color: '#fff',
            border: 'none',
            fontSize: 15,
            fontWeight: 700,
            cursor: 'pointer',
            width: '100%',
            maxWidth: 340,
            boxShadow: '0 4px 16px rgba(197,165,90,0.35)',
            letterSpacing: 0.5,
          }}
        >
          العودة لشاشة الموافقة ↩
        </button>
      </div>
    );
  }

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100dvh',
      background: 'linear-gradient(135deg, #8A1538 0%, #4a0d22 100%)',
      color: '#fff',
      textAlign: 'center',
      padding: '16px 20px',
      direction: 'rtl',
      fontFamily: "'Tajawal', 'Cairo', 'Segoe UI', sans-serif",
    }}>
      {/* Icon */}
      <div style={{ fontSize: 40, marginBottom: 8, lineHeight: 1 }}>🎓</div>

      {/* Title */}
      <h1 style={{ fontSize: 18, fontWeight: 800, marginBottom: 4, marginTop: 0 }}>
        المستشار الجامعي القطري
      </h1>
      <p style={{ fontSize: 13, opacity: 0.8, marginBottom: 14, lineHeight: 1.5, maxWidth: 340 }}>
        نحمي بياناتك وفق القانون القطري
      </p>

      {/* Info cards — compact */}
      <div style={{
        background: 'rgba(255,255,255,0.1)',
        borderRadius: 12,
        padding: '12px 16px',
        maxWidth: 360,
        width: '100%',
        marginBottom: 14,
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255,255,255,0.15)',
      }}>
        {[
          { icon: '🔒', text: 'هاتفك لا يُخزَّن — يُستخدَم للرد فقط' },
          { icon: '📱', text: 'بياناتك على جهازك فقط' },
          { icon: '🚫', text: 'لا نبيع ولا نشارك بياناتك' },
        ].map(({ icon, text }, i) => (
          <div key={i} style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            textAlign: 'right',
            marginBottom: i < 2 ? 8 : 0,
          }}>
            <span style={{ fontSize: 16, flexShrink: 0 }}>{icon}</span>
            <p style={{ fontSize: 12, lineHeight: 1.5, margin: 0, opacity: 0.92 }}>{text}</p>
          </div>
        ))}
      </div>

      {/* Legal links */}
      <p style={{ fontSize: 11, opacity: 0.6, marginBottom: 12, lineHeight: 1.6 }}>
        بالمتابعة، توافق على{' '}
        <button
          onClick={onShowTerms}
          style={{
            background: 'none', border: 'none', color: '#C5A55A',
            cursor: 'pointer', fontSize: 12, textDecoration: 'underline',
            padding: 0, fontWeight: 600,
          }}
        >
          شروط الاستخدام
        </button>
        {' '}و{' '}
        <button
          onClick={onShowPrivacy}
          style={{
            background: 'none', border: 'none', color: '#C5A55A',
            cursor: 'pointer', fontSize: 12, textDecoration: 'underline',
            padding: 0, fontWeight: 600,
          }}
        >
          سياسة الخصوصية
        </button>
        {' '}وفق القوانين القطرية
      </p>

      {/* Accept button — large & prominent */}
      <button
        onClick={handleAccept}
        style={{
          padding: '18px 0',
          borderRadius: 16,
          background: 'linear-gradient(135deg, #C5A55A 0%, #a8893d 100%)',
          color: '#fff',
          border: 'none',
          fontSize: 18,
          fontWeight: 800,
          cursor: 'pointer',
          width: '100%',
          maxWidth: 360,
          boxShadow: '0 6px 24px rgba(197,165,90,0.45)',
          letterSpacing: 0.5,
          transition: 'transform 0.1s, box-shadow 0.1s',
        }}
        onMouseDown={e => e.currentTarget.style.transform = 'scale(0.98)'}
        onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
      >
        أوافق وأبدأ ✓
      </button>

      {/* Reject button — PDPPL Article 7 compliance */}
      <button
        onClick={handleReject}
        style={{
          padding: '8px 0',
          borderRadius: 10,
          background: 'transparent',
          color: 'rgba(255,255,255,0.45)',
          border: '1px solid rgba(255,255,255,0.15)',
          fontSize: 12,
          fontWeight: 500,
          cursor: 'pointer',
          width: '100%',
          maxWidth: 360,
          marginTop: 8,
          letterSpacing: 0.3,
          transition: 'border-color 0.2s, color 0.2s',
        }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.4)'; e.currentTarget.style.color = 'rgba(255,255,255,0.75)'; }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'; e.currentTarget.style.color = 'rgba(255,255,255,0.45)'; }}
      >
        أرفض
      </button>

      <p style={{ fontSize: 10, opacity: 0.4, marginTop: 10 }}>
        وفق قوانين دولة قطر
      </p>
    </div>
  );
}
