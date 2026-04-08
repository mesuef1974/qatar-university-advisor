import React, { useState, useRef, Suspense, lazy } from "react";
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

// UX-A1: Skeleton loading component — matches app layout
const LoadingFallback = () => (
  <div style={{ padding: 20, direction: 'rtl' }}>
    <div style={{ height: 60, background: '#8A1538', borderRadius: 12, marginBottom: 16 }} />
    <div style={{ height: 20, background: '#E0D5CC', borderRadius: 8, width: '70%', marginBottom: 12 }} />
    <div style={{ height: 20, background: '#E0D5CC', borderRadius: 8, width: '50%', marginBottom: 12 }} />
    <div style={{ height: 200, background: '#F5F0EB', borderRadius: 16, marginBottom: 16 }} />
    <div style={{ height: 48, background: '#E0D5CC', borderRadius: 24 }} />
  </div>
);

// ── Secret admin unlock (5 taps / 3 s on bottom-left corner) ──
const ADMIN_TAPS   = 5;
const ADMIN_WINDOW = 3000;

// ══════════════════════════════════════════════════════════
// Root App
// ══════════════════════════════════════════════════════════
function AppRoot() {
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

      {/* ══ App content — desktop two-column handled inside QatarUniversityAdvisor ══ */}
      <div style={{ minHeight: '100vh' }}>
        {AppContent}
      </div>

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
              cursor: 'pointer', fontSize: 12,
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
