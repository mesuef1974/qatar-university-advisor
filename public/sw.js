/**
 * Service Worker — Qatar University Advisor PWA
 * استراتيجية: Cache First للـ static assets, Network First للـ API
 */

const CACHE_NAME    = 'qatar-advisor-v1';
const API_CACHE     = 'qatar-advisor-api-v1';
const OFFLINE_URL   = '/offline.html';

// Static assets to cache
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
];

// ─── Install ─────────────────────────────────────────────────────────────────
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(STATIC_ASSETS).catch(() => {
        // تجاهل أخطاء التخزين المؤقت
      });
    })
  );
  self.skipWaiting();
});

// ─── Activate ────────────────────────────────────────────────────────────────
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key !== CACHE_NAME && key !== API_CACHE)
          .map(key => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// ─── Fetch Strategy ──────────────────────────────────────────────────────────
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // API calls: Network First
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request)
        .catch(() => new Response(
          JSON.stringify({ error: 'أنت غير متصل بالإنترنت حالياً.' }),
          { headers: { 'Content-Type': 'application/json' } }
        ))
    );
    return;
  }

  // Static assets: Cache First
  event.respondWith(
    caches.match(request).then(cached => {
      if (cached) return cached;
      return fetch(request).then(response => {
        if (response.ok) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(request, clone));
        }
        return response;
      }).catch(() => {
        // Offline fallback للـ HTML pages
        if (request.mode === 'navigate') {
          return caches.match('/') || new Response('غير متصل');
        }
      });
    })
  );
});
