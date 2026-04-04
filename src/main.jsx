import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import reportWebVitals from './utils/reportWebVitals.js'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)

// PERF-A1: Web Vitals — قياس LCP/CLS/INP/FCP/TTFB
reportWebVitals((metric) => {
  if (import.meta.env.DEV) {
    console.log(`[WebVital] ${metric.name}: ${metric.value.toFixed(2)}`)
  }
})