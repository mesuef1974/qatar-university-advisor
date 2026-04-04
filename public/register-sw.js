// SEC-A1: Service Worker registration — externalized from inline script for CSP compliance
if ('serviceWorker' in navigator) {
  window.addEventListener('load', function() {
    navigator.serviceWorker.register('/sw.js')
      .catch(function() {}); // تجاهل أخطاء SW
  });
}
