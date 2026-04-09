import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)

// Web Vitals — Core Performance Monitoring (Q-15-03)
if (typeof window !== 'undefined') {
  import('web-vitals').then(({ onCLS, onFCP, onLCP, onTTFB, onINP }) => {
    const reportVital = (metric) => {
      // Log to console in development
      if (import.meta.env.DEV) {
        console.log(`[Web Vital] ${metric.name}: ${metric.value.toFixed(2)}`);
      }
      // Send to Vercel Analytics if available
      if (window.__VERCEL_ANALYTICS_ID) {
        const body = JSON.stringify({
          dsn: window.__VERCEL_ANALYTICS_ID,
          id: metric.id,
          page: window.location.pathname,
          href: window.location.href,
          event_name: metric.name,
          value: metric.value.toString(),
          speed: navigator?.connection?.effectiveType || '',
        });
        navigator.sendBeacon?.('/_vercel/insights/vitals', body);
      }
    };
    onCLS(reportVital);
    onFCP(reportVital);
    onLCP(reportVital);
    onTTFB(reportVital);
    onINP(reportVital);
  });
}