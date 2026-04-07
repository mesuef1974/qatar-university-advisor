import React, { useState, useRef, useEffect, Suspense, lazy } from "react";
import QatarUniversityAdvisor from "./QatarUniversityAdvisor.jsx";
import PrivacyConsent from "./components/PrivacyConsent.jsx";
import AcademicDisclaimer from "./components/AcademicDisclaimer.jsx";
import LanguageToggle from "./components/LanguageToggle.jsx";

// ── C-03: Error Boundary — catches unexpected runtime errors and shows a
//    user-friendly Arabic recovery screen instead of a blank white page. ──
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ direction: 'rtl', textAlign: 'center', padding: '60px 20px', fontFamily: 'Tajawal, sans-serif' }}>
          <h1 style={{ color: '#8A1538', marginBottom: 16 }}>حدث خطأ غير متوقع</h1>
          <p style={{ color: '#666', marginBottom: 20 }}>نعتذر عن هذا الخلل. يرجى تحديث الصفحة.</p>
          <button
            onClick={() => window.location.reload()}
            style={{ background: '#8A1538', color: '#fff', border: 'none', padding: '12px 32px', borderRadius: 8, cursor: 'pointer', fontSize: '1em' }}
          >
            تحديث الصفحة
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

// UX-A1: Lazy Loading — الصفحات الثانوية تُحمَّل عند الحاجة فقط
const ExecutionPlan = lazy(() => import("./components/ExecutionPlan.jsx"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard.jsx"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy.jsx"));
const TermsOfService = lazy(() => import("./pages/TermsOfService.jsx"));
const DataRights = lazy(() => import("./pages/DataRights.jsx"));

// UX-A1: Loading fallback component
const LoadingFallback = () => (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', direction: 'rtl', fontFamily: "'Cairo', sans-serif" }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 32, marginBottom: 12 }}>⏳</div>
        <div style={{ color: '#666' }}>جارٍ التحميل...</div>
      </div>
    </div>
  );

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
        gap: 10, marginBottom: 28,
      }}>
        {PANEL_STATS.map(({ n, l }) => (
          <div key={l} style={{
            background: 'linear-gradient(145deg,rgba(255,255,255,0.08),rgba(255,255,255,0.04))',
            border: '1px solid rgba(197,165,90,0.25)',
            borderRadius: 14, padding: '16px 12px', textAlign: 'center',
            backdropFilter: 'blur(4px)',
            transition: 'transform 0.2s ease, border-color 0.2s ease',
          }}>
            <div style={{
              fontSize: 28, fontWeight: 800, color: '#C5A55A',
              fontFamily: "'Cairo',sans-serif", lineHeight: 1,
              textShadow: '0 0 20px rgba(197,165,90,0.3)',
            }}>{n}</div>
            <div style={{
              fontSize: 11, color: 'rgba(255,255,255,0.58)',
              marginTop: 6, lineHeight: 1.4,
              fontFamily: "'Tajawal',sans-serif",
            }}>{l}</div>
          </div>
        ))}
      </div>

      {/* Feature list */}
      <div style={{ flex: 1 }}>
        <div style={{
          fontSize: 10, fontWeight: 700, color: 'rgba(197,165,90,0.6)',
          letterSpacing: 1.5, marginBottom: 14,
          textTransform: 'uppercase', fontFamily: "'Tajawal',sans-serif",
        }}>
          ما يقدمه المستشار
        </div>
        {PANEL_FEATURES.map(({ icon, text }) => (
          <div key={text} style={{
            display: 'flex', alignItems: 'flex-start', gap: 10,
            marginBottom: 12, padding: '6px 0',
          }}>
            <span style={{
              fontSize: 15, width: 30, height: 30,
              background: 'linear-gradient(145deg,rgba(197,165,90,0.18),rgba(197,165,90,0.08))',
              border: '1px solid rgba(197,165,90,0.32)',
              borderRadius: 9, display: 'flex', alignItems: 'center',
              justifyContent: 'center', flexShrink: 0,
              boxShadow: '0 2px 8px rgba(197,165,90,0.08)',
            }}>{icon}</span>
            <span style={{
              fontSize: 13, color: 'rgba(255,255,255,0.75)',
              lineHeight: 1.65, paddingTop: 5,
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
function AppRoot() {
  const isWide = useIsWide();
  const [view, setView] = useState("app");

  // ── Privacy consent ──
  const [consentGiven, setConsentGiven] = useState(
    () => localStorage.getItem('advisor_privacy_consent') === 'true'
  );

  // ── C-01: Legal overlay shown from within the consent screen ──
  // 'privacy' | 'terms' | null
  const [legalOverlay, setLegalOverlay] = useState(null);

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
      // ENG-001: طلب كلمة المرور قبل منح الوصول — منع الدخول غير المصرح به
      const entered = window.prompt('Admin Password:');
      if (!entered) return;
      const adminPass = import.meta.env.VITE_ADMIN_UI_PASSWORD;
      if (!adminPass || entered !== adminPass) return;
      sessionStorage.setItem('admin_unlocked', 'true');
      setAdminUnlocked(true);
    }
  };

  const handleConsent = () => {
    localStorage.setItem('advisor_privacy_consent', 'true');
    setConsentGiven(true);
  };

  // LEGAL-A1: Rejection handled internally by PrivacyConsent component
  const handleConsentReject = () => {};

  // ── Admin route ──
  if (window.location.pathname === '/admin') {
    return <Suspense fallback={<LoadingFallback />}><AdminDashboard /></Suspense>;
  }

  // ── Legal pages routes ──
  if (window.location.pathname === '/privacy') {
    return <Suspense fallback={<LoadingFallback />}><PrivacyPolicy onBack={() => window.history.back()} /></Suspense>;
  }
  if (window.location.pathname === '/terms') {
    return <Suspense fallback={<LoadingFallback />}><TermsOfService onBack={() => window.history.back()} /></Suspense>;
  }
  if (window.location.pathname === '/data-rights') {
    return <Suspense fallback={<LoadingFallback />}><DataRights onBack={() => window.history.back()} /></Suspense>;
  }

  // ── C-01: Legal overlay shown from within the consent screen ──
  if (!consentGiven && legalOverlay === 'privacy') {
    return (
      <Suspense fallback={<LoadingFallback />}>
        <PrivacyPolicy onBack={() => setLegalOverlay(null)} />
      </Suspense>
    );
  }
  if (!consentGiven && legalOverlay === 'terms') {
    return (
      <Suspense fallback={<LoadingFallback />}>
        <TermsOfService onBack={() => setLegalOverlay(null)} />
      </Suspense>
    );
  }

  // ── Privacy consent screen ──
  if (!consentGiven) {
    return (
      <PrivacyConsent
        onAccept={handleConsent}
        onReject={handleConsentReject}
        onShowPrivacy={() => setLegalOverlay('privacy')}
        onShowTerms={() => setLegalOverlay('terms')}
      />
    );
  }

  // ── The main app content ──
  const AppContent = view === 'app'
    ? <QatarUniversityAdvisor />
    : <Suspense fallback={<LoadingFallback />}><ExecutionPlan /></Suspense>;

  return (
    <div style={{ position: 'relative', minHeight: '100vh', width: '100%' }}>
      <LanguageToggle />
      <AcademicDisclaimer position="bottom" />

      {/* ══ Desktop two-column layout ══ */}
      {isWide ? (
        <div style={{
          display: 'flex', height: '100vh', width: '100%', overflow: 'hidden',
        }}>
          {/* Left branding panel */}
          <DesktopPanel />

          {/* Right: app fills the full panel */}
          <div style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
            {view === 'app' ? <QatarUniversityAdvisor /> : <Suspense fallback={<LoadingFallback />}><ExecutionPlan /></Suspense>}
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

// ── C-03: Wrap the real app in ErrorBoundary so any unhandled render error
//    shows an Arabic recovery screen instead of a blank page. ──
export default function App() {
  return (
    <ErrorBoundary>
      <AppRoot />
    </ErrorBoundary>
  );
}
