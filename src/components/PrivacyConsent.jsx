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
        fontFamily: "'Segoe UI', Tahoma, Arial, sans-serif",
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
      padding: '24px 20px',
      direction: 'rtl',
      fontFamily: "'Segoe UI', Tahoma, Arial, sans-serif",
    }}>
      {/* Icon */}
      <div style={{ fontSize: 64, marginBottom: 16, lineHeight: 1 }}>🎓</div>

      {/* Title */}
      <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 8, marginTop: 0 }}>
        المستشار الجامعي الذكي
      </h1>
      <p style={{ fontSize: 14, opacity: 0.8, marginBottom: 28, lineHeight: 1.6, maxWidth: 340 }}>
        مرحباً! قبل البدء، نريد أن نكون شفافين معك حول كيفية استخدام بياناتك.
      </p>

      {/* Info cards */}
      <div style={{
        background: 'rgba(255,255,255,0.1)',
        borderRadius: 16,
        padding: '20px 24px',
        maxWidth: 360,
        width: '100%',
        marginBottom: 24,
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255,255,255,0.15)',
      }}>
        {[
          { icon: '🔒', text: 'رقم هاتفك غير مخزَّن — يُستخدَم لإرسال الرد فقط' },
          { icon: '📱', text: 'تفضيلاتك محفوظة على جهازك فقط، لا تصل لأي خادم' },
          { icon: '🚫', text: 'لا نبيع بياناتك ولا نشاركها مع أطراف تجارية' },
          { icon: '📚', text: 'المعلومات إرشادية — تحقَّق دائماً من الجهات الرسمية' },
        ].map(({ icon, text }, i) => (
          <div key={i} style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: 12,
            textAlign: 'right',
            marginBottom: i < 3 ? 14 : 0,
          }}>
            <span style={{ fontSize: 20, flexShrink: 0, marginTop: 1 }}>{icon}</span>
            <p style={{ fontSize: 13, lineHeight: 1.65, margin: 0, opacity: 0.92 }}>{text}</p>
          </div>
        ))}
      </div>

      {/* Legal links */}
      <p style={{ fontSize: 12, opacity: 0.7, marginBottom: 20, lineHeight: 1.8 }}>
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

      {/* Accept button */}
      <button
        onClick={handleAccept}
        style={{
          padding: '15px 0',
          borderRadius: 14,
          background: 'linear-gradient(135deg, #C5A55A 0%, #a8893d 100%)',
          color: '#fff',
          border: 'none',
          fontSize: 16,
          fontWeight: 700,
          cursor: 'pointer',
          width: '100%',
          maxWidth: 340,
          boxShadow: '0 4px 16px rgba(197,165,90,0.35)',
          letterSpacing: 0.5,
          transition: 'transform 0.1s, box-shadow 0.1s',
        }}
        onMouseDown={e => e.currentTarget.style.transform = 'scale(0.98)'}
        onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
      >
        أوافق وأبدأ الاستخدام ✓
      </button>

      {/* Reject button — PDPPL Article 7 compliance */}
      <button
        onClick={handleReject}
        style={{
          padding: '12px 0',
          borderRadius: 14,
          background: 'transparent',
          color: 'rgba(255,255,255,0.55)',
          border: '1px solid rgba(255,255,255,0.2)',
          fontSize: 14,
          fontWeight: 600,
          cursor: 'pointer',
          width: '100%',
          maxWidth: 340,
          marginTop: 10,
          letterSpacing: 0.3,
          transition: 'border-color 0.2s, color 0.2s',
        }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.4)'; e.currentTarget.style.color = 'rgba(255,255,255,0.75)'; }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'; e.currentTarget.style.color = 'rgba(255,255,255,0.55)'; }}
      >
        أرفض
      </button>

      <p style={{ fontSize: 11, opacity: 0.5, marginTop: 16 }}>
        مرخَّص وفق قوانين دولة قطر
      </p>
    </div>
  );
}
