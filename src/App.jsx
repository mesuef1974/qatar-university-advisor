import React, { useState, useRef } from "react";
import QatarUniversityAdvisor from "./QatarUniversityAdvisor.jsx";
import ExecutionPlan from "./components/ExecutionPlan.jsx";
import PrivacyConsent from "./components/PrivacyConsent.jsx";

// ── إعدادات فتح لوحة الأدمن سراً ──────────────────────────────
const ADMIN_TAPS    = 5;    // عدد النقرات المطلوبة
const ADMIN_WINDOW  = 3000; // الفترة الزمنية بالميلي ثانية

export default function App() {
  const [view, setView] = useState("app");

  // ── موافقة الخصوصية (مرة واحدة) ──
  const [consentGiven, setConsentGiven] = useState(
    () => localStorage.getItem('advisor_privacy_consent') === 'true'
  );

  // ── لوحة الأدمن (sessionStorage — تُعاد عند إغلاق المتصفح) ──
  const [adminUnlocked, setAdminUnlocked] = useState(
    () => sessionStorage.getItem('admin_unlocked') === 'true'
  );
  const tapCount = useRef(0);
  const tapTimer = useRef(null);

  // ── المنطق السري: 5 نقرات في 3 ثوانٍ على الزاوية ──
  const handleSecretTap = () => {
    tapCount.current += 1;
    if (tapTimer.current) clearTimeout(tapTimer.current);
    tapTimer.current = setTimeout(() => { tapCount.current = 0; }, ADMIN_WINDOW);

    if (tapCount.current >= ADMIN_TAPS) {
      tapCount.current = 0;
      clearTimeout(tapTimer.current);
      sessionStorage.setItem('admin_unlocked', 'true');
      setAdminUnlocked(true);
    }
  };

  const handleConsent = () => {
    localStorage.setItem('advisor_privacy_consent', 'true');
    setConsentGiven(true);
  };

  // ── شاشة الموافقة الأولى ──
  if (!consentGiven) {
    return <PrivacyConsent onAccept={handleConsent} />;
  }

  return (
    <div style={{ position: "relative", minHeight: "100vh" }}>

      {/* ══ منطقة النقر السري — غير مرئية، زاوية أسفل يسار ══ */}
      <div
        onClick={handleSecretTap}
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          width: 36,
          height: 36,
          zIndex: 9999,
          cursor: 'default',
          userSelect: 'none',
          WebkitTapHighlightColor: 'transparent',
        }}
      />

      {/* ══ لوحة الأدمن — تظهر فقط بعد الفتح السري ══ */}
      {adminUnlocked && (
        <div style={{
          position: 'fixed',
          bottom: 20,
          right: 20,
          zIndex: 9998,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-end',
          gap: 8,
        }}>
          {/* زر إغلاق لوحة الأدمن */}
          <button
            onClick={() => {
              sessionStorage.removeItem('admin_unlocked');
              setAdminUnlocked(false);
              setView('app');
            }}
            style={{
              padding: '4px 10px',
              background: 'rgba(220,38,38,0.85)',
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '11px',
            }}
          >
            ✕ إخفاء
          </button>

          {/* زر التبديل بين التطبيق والخطة */}
          <button
            onClick={() => setView(view === 'app' ? 'plan' : 'app')}
            style={{
              padding: '10px 15px',
              background: '#1e293b',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              boxShadow: '0 4px 6px rgba(0,0,0,0.25)',
              fontSize: '12px',
              fontWeight: 'bold',
            }}
          >
            {view === 'app' ? '📋 الخطة التنفيذية' : '📱 عرض التطبيق'}
          </button>
        </div>
      )}

      {view === 'app' ? <QatarUniversityAdvisor /> : <ExecutionPlan />}
    </div>
  );
}
