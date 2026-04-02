import React, { useState, useRef, useEffect } from "react";
import QatarUniversityAdvisor from "./QatarUniversityAdvisor.jsx";
import ExecutionPlan from "./components/ExecutionPlan.jsx";
import PrivacyConsent from "./components/PrivacyConsent.jsx";

// ── Secret admin unlock (5 taps / 3 s on bottom-left corner) ──
const ADMIN_TAPS   = 5;
const ADMIN_WINDOW = 3000;

// ── Responsive: is the viewport wide enough for two-column layout? ──
function useIsWide() {
  const [wide, setWide] = useState(() => window.innerWidth >= 1024);
  useEffect(() => {
    const handler = () => setWide(window.innerWidth >= 1024);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);
  return wide;
}

// ── Stats shown in the desktop left panel ──
const PANEL_STATS = [
  { n: '23',   l: 'جامعة ومعهد'       },
  { n: '100+', l: 'تخصص دراسي'         },
  { n: '10+',  l: 'منحة وبرنامج ابتعاث' },
  { n: '5',    l: 'كليات عسكرية وأمنية' },
];

const PANEL_FEATURES = [
  { icon: '🎯', text: 'اختبار تحديد التخصص المناسب لك' },
  { icon: '📊', text: 'مقارنة شاملة بين الجامعات'        },
  { icon: '🏅', text: 'دليل المنح والابتعاث الأميري'      },
  { icon: '💼', text: 'توقعات الرواتب وفرص العمل'         },
  { icon: '🗓️', text: 'مواعيد التقديم والقبول'             },
];

// ══════════════════════════════════════════════════════════
// Desktop left branding panel
// ══════════════════════════════════════════════════════════
function DesktopPanel() {
  return (
    <div style={{
      width: 360, flexShrink: 0,
      background: 'linear-gradient(170deg,#8A1538 0%,#6B1030 55%,#4A0B22 100%)',
      display: 'flex', flexDirection: 'column',
      padding: '40px 32px 32px',
      color: '#fff', overflowY: 'auto', position: 'relative',
    }}>
      {/* Decorative circles */}
      <div style={{
        position: 'absolute', top: -60, right: -60,
        width: 220, height: 220, borderRadius: '50%',
        background: 'rgba(197,165,90,0.07)', pointerEvents: 'none',
      }}/>
      <div style={{
        position: 'absolute', bottom: 40, left: -40,
        width: 160, height: 160, borderRadius: '50%',
        background: 'rgba(255,255,255,0.03)', pointerEvents: 'none',
      }}/>

      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 32, position: 'relative' }}>
        <div style={{
          width: 58, height: 58, borderRadius: '50%',
          background: 'rgba(197,165,90,0.16)',
          border: '2px solid rgba(197,165,90,0.42)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 28,
        }}>🎓</div>
        <div>
          <div style={{
            fontWeight: 800, fontSize: 18, lineHeight: 1.25,
            fontFamily: "'Cairo','Tajawal',sans-serif",
          }}>المستشار الجامعي الذكي</div>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)', marginTop: 3 }}>
            Qatar University Advisor · v5.0
          </div>
        </div>
      </div>

      {/* Gold divider */}
      <div style={{
        height: 1, marginBottom: 28,
        background: 'linear-gradient(90deg,rgba(197,165,90,0.6) 0%,transparent 100%)',
      }}/>

      {/* Tagline */}
      <p style={{
        fontSize: 14, lineHeight: 1.8,
        color: 'rgba(255,255,255,0.78)', marginBottom: 28,
        fontFamily: "'Tajawal',sans-serif",
      }}>
        دليلك الشامل لاختيار الجامعة والتخصص المناسب،
        واكتشاف المنح الدراسية وفرص العمل في دولة قطر.
      </p>

      {/* Stats grid */}
      <div style={{
        display: 'grid', gridTemplateColumns: '1fr 1fr',
        gap: 12, marginBottom: 32,
      }}>
        {PANEL_STATS.map(({ n, l }) => (
          <div key={l} style={{
            background: 'rgba(255,255,255,0.07)',
            border: '1px solid rgba(197,165,90,0.22)',
            borderRadius: 12, padding: '14px 12px', textAlign: 'center',
          }}>
            <div style={{
              fontSize: 26, fontWeight: 800, color: '#C5A55A',
              fontFamily: "'Cairo',sans-serif", lineHeight: 1,
            }}>{n}</div>
            <div style={{
              fontSize: 11, color: 'rgba(255,255,255,0.55)',
              marginTop: 5, lineHeight: 1.4,
              fontFamily: "'Tajawal',sans-serif",
            }}>{l}</div>
          </div>
        ))}
      </div>

      {/* Feature list */}
      <div style={{ flex: 1 }}>
        <div style={{
          fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.4)',
          letterSpacing: 1, marginBottom: 14,
          textTransform: 'uppercase', fontFamily: "'Tajawal',sans-serif",
        }}>
          ما يقدمه المستشار
        </div>
        {PANEL_FEATURES.map(({ icon, text }) => (
          <div key={text} style={{
            display: 'flex', alignItems: 'flex-start', gap: 10,
            marginBottom: 12,
          }}>
            <span style={{
              fontSize: 16, width: 28, height: 28,
              background: 'rgba(197,165,90,0.14)',
              border: '1px solid rgba(197,165,90,0.3)',
              borderRadius: 8, display: 'flex', alignItems: 'center',
              justifyContent: 'center', flexShrink: 0,
            }}>{icon}</span>
            <span style={{
              fontSize: 13, color: 'rgba(255,255,255,0.72)',
              lineHeight: 1.6, paddingTop: 4,
              fontFamily: "'Tajawal',sans-serif",
            }}>{text}</span>
          </div>
        ))}
      </div>

      {/* Qatar flag accent at bottom */}
      <div style={{ marginTop: 24, paddingTop: 20, borderTop: '1px solid rgba(255,255,255,0.1)' }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          fontSize: 12, color: 'rgba(255,255,255,0.4)',
          fontFamily: "'Tajawal',sans-serif",
        }}>
          <span style={{ fontSize: 18 }}>🇶🇦</span>
          <span>مصمَّم خصيصاً للطلاب في قطر</span>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════
// Root App
// ══════════════════════════════════════════════════════════
export default function App() {
  const isWide = useIsWide();
  const [view, setView] = useState("app");

  // ── Privacy consent ──
  const [consentGiven, setConsentGiven] = useState(
    () => localStorage.getItem('advisor_privacy_consent') === 'true'
  );

  // ── Admin panel (sessionStorage — resets on browser close) ──
  const [adminUnlocked, setAdminUnlocked] = useState(
    () => sessionStorage.getItem('admin_unlocked') === 'true'
  );
  const tapCount = useRef(0);
  const tapTimer = useRef(null);

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

  // ── Privacy consent screen ──
  if (!consentGiven) {
    return <PrivacyConsent onAccept={handleConsent} />;
  }

  // ── The main app content ──
  const AppContent = view === 'app'
    ? <QatarUniversityAdvisor />
    : <ExecutionPlan />;

  return (
    <div style={{ position: 'relative', minHeight: '100vh', width: '100%' }}>

      {/* ══ Desktop two-column layout ══ */}
      {isWide ? (
        <div style={{
          display: 'flex', height: '100vh', width: '100%', overflow: 'hidden',
        }}>
          {/* Left branding panel */}
          <DesktopPanel />

          {/* Right: app + decorative fill */}
          <div style={{
            flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'linear-gradient(135deg,#F5EFE8 0%,#EDE5DA 100%)',
            padding: '24px 32px',
            position: 'relative', overflow: 'hidden',
          }}>
            {/* Subtle background circles */}
            <div style={{
              position: 'absolute', top: '-10%', right: '-5%',
              width: 300, height: 300, borderRadius: '50%',
              background: 'rgba(138,21,56,0.04)', pointerEvents: 'none',
            }}/>
            <div style={{
              position: 'absolute', bottom: '-10%', left: '-5%',
              width: 240, height: 240, borderRadius: '50%',
              background: 'rgba(197,165,90,0.06)', pointerEvents: 'none',
            }}/>

            {/* App card */}
            <div style={{
              width: '100%', maxWidth: 560, height: '100%',
              maxHeight: 'calc(100vh - 48px)',
              borderRadius: 20, overflow: 'hidden',
              boxShadow: '0 24px 64px rgba(0,0,0,0.18), 0 0 0 1px rgba(138,21,56,0.1)',
              position: 'relative',
            }}>
              {view === 'app' ? <QatarUniversityAdvisor /> : <ExecutionPlan />}
            </div>
          </div>
        </div>
      ) : (
        /* ══ Mobile / Tablet: full-screen single column ══ */
        <div style={{ minHeight: '100vh' }}>
          {AppContent}
        </div>
      )}

      {/* ══ Secret tap zone (bottom-left corner, invisible) ══ */}
      <div
        onClick={handleSecretTap}
        style={{
          position: 'fixed', bottom: 0, left: 0,
          width: 36, height: 36, zIndex: 9999,
          cursor: 'default', userSelect: 'none',
          WebkitTapHighlightColor: 'transparent',
        }}
      />

      {/* ══ Admin panel (visible only after secret unlock) ══ */}
      {adminUnlocked && (
        <div style={{
          position: 'fixed', bottom: 20, right: 20,
          zIndex: 9998, display: 'flex', flexDirection: 'column',
          alignItems: 'flex-end', gap: 8,
        }}>
          <button
            onClick={() => {
              sessionStorage.removeItem('admin_unlocked');
              setAdminUnlocked(false);
              setView('app');
            }}
            style={{
              padding: '4px 10px',
              background: 'rgba(220,38,38,0.88)',
              color: '#fff', border: 'none', borderRadius: 6,
              cursor: 'pointer', fontSize: 11,
            }}
          >
            ✕ إخفاء
          </button>
          <button
            onClick={() => setView(v => v === 'app' ? 'plan' : 'app')}
            style={{
              padding: '10px 15px',
              background: '#1e293b', color: '#fff',
              border: 'none', borderRadius: 8, cursor: 'pointer',
              boxShadow: '0 4px 6px rgba(0,0,0,0.25)',
              fontSize: 12, fontWeight: 700,
            }}
          >
            {view === 'app' ? '📋 الخطة التنفيذية' : '📱 عرض التطبيق'}
          </button>
        </div>
      )}
    </div>
  );
}
