import React, { useState } from "react";
import QatarUniversityAdvisor from "./QatarUniversityAdvisor.jsx";
import ExecutionPlan from "./components/ExecutionPlan.jsx";
import PrivacyConsent from "./components/PrivacyConsent.jsx";
import PrivacyPolicy from "./components/PrivacyPolicy.jsx";
import TermsOfService from "./components/TermsOfService.jsx";
import RefundPolicy from "./components/RefundPolicy.jsx";

export default function App() {
  const [view, setView] = useState("app");

  // ── الموافقة على الخصوصية (مرة واحدة فقط، تُحفَظ في localStorage) ──
  const [consentGiven, setConsentGiven] = useState(
    () => localStorage.getItem('advisor_privacy_consent') === 'true'
  );

  // ── صفحات قانونية (privacy | terms | refund | null) ──
  const [legalView, setLegalView] = useState(null);

  const handleConsent = () => {
    localStorage.setItem('advisor_privacy_consent', 'true');
    setConsentGiven(true);
  };

  // ─── صفحات قانونية مستقلة ───
  if (legalView === 'privacy') {
    return <PrivacyPolicy onBack={() => setLegalView(null)} />;
  }
  if (legalView === 'terms') {
    return <TermsOfService onBack={() => setLegalView(null)} />;
  }
  if (legalView === 'refund') {
    return <RefundPolicy onBack={() => setLegalView(null)} />;
  }

  // ─── شاشة الموافقة الأولى ───
  if (!consentGiven) {
    return (
      <PrivacyConsent
        onAccept={handleConsent}
        onShowPrivacy={() => setLegalView('privacy')}
        onShowTerms={() => setLegalView('terms')}
      />
    );
  }

  // ─── التطبيق الرئيسي ───
  return (
    <div style={{ position: "relative", minHeight: "100vh" }}>
      {/* Dev Navigation Toggle */}
      <div style={{
        position: "fixed",
        bottom: 20,
        right: 20,
        zIndex: 9999,
        display: "flex",
        gap: "8px",
        flexDirection: "column",
        alignItems: "flex-end",
      }}>
        <button
          onClick={() => setView(view === "app" ? "plan" : "app")}
          style={{
            padding: "10px 15px",
            background: "#1e293b",
            color: "#fff",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            boxShadow: "0 4px 6px rgba(0,0,0,0.2)",
            fontSize: "12px",
            fontWeight: "bold",
          }}
        >
          {view === "app" ? "📋 عرض الخطة التنفيذية" : "📱 عرض التطبيق"}
        </button>

        {/* Quick legal links */}
        <div style={{ display: "flex", gap: 5, flexWrap: "wrap", justifyContent: "flex-end" }}>
          {[
            { key: 'privacy', label: '🔒 الخصوصية' },
            { key: 'terms',   label: '📋 الشروط'    },
            { key: 'refund',  label: '💰 الاسترجاع' },
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setLegalView(key)}
              style={{
                padding: "6px 10px",
                background: "rgba(138,21,56,0.85)",
                color: "#fff",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
                fontSize: "11px",
                backdropFilter: "blur(4px)",
                fontFamily: "inherit",
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {view === "app" ? <QatarUniversityAdvisor /> : <ExecutionPlan />}
    </div>
  );
}
