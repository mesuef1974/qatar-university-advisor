/**
 * PWA Install Prompt — اقتراح تثبيت التطبيق
 */
import { useState, useEffect } from 'react';

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showPrompt, setShowPrompt]         = useState(false);

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowPrompt(true);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') setShowPrompt(false);
    setDeferredPrompt(null);
  };

  if (!showPrompt) return null;

  return (
    <div
      role="banner"
      aria-label="اقتراح تثبيت التطبيق"
      style={{
        position: 'fixed',
        bottom: '80px',
        left: '50%',
        transform: 'translateX(-50%)',
        background: '#1a56db',
        color: 'white',
        padding: '12px 20px',
        borderRadius: '12px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        fontSize: '14px',
        maxWidth: '90vw',
      }}
    >
      <span>📱 ثبّت التطبيق للوصول السريع</span>
      <button
        onClick={handleInstall}
        aria-label="تثبيت التطبيق"
        style={{ background: 'white', color: '#1a56db', border: 'none', padding: '6px 14px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
      >
        تثبيت
      </button>
      <button
        onClick={() => setShowPrompt(false)}
        aria-label="إغلاق الاقتراح"
        style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer', fontSize: '18px' }}
      >
        ×
      </button>
    </div>
  );
}
