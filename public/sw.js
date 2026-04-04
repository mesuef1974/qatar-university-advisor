/**
 * Service Worker — Qatar University Advisor PWA
 * PERF-A3: Enhanced caching strategies
 *
 * Strategies:
 *   - Cache First  → static assets (JS, CSS, fonts, images)
 *   - Network First → API calls (/api/*)
 *   - Offline fallback → offline.html for navigation requests
 */

const CACHE_VERSION = 2;
const CACHE_NAME    = `qatar-advisor-v${CACHE_VERSION}`;
const API_CACHE     = `qatar-advisor-api-v${CACHE_VERSION}`;
const OFFLINE_URL   = '/offline.html';

// App shell — precached on install
const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/offline.html',
  '/manifest.json',
];

// File extensions handled with cache-first strategy
const STATIC_EXT = /\.(js|css|woff2?|ttf|otf|eot|png|jpe?g|gif|svg|webp|avif|ico)$/i;

// ─── Install ─────────────────────────────────────────────────────────────────
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // Precache app shell; individual failures do not block install
      return Promise.allSettled(
        PRECACHE_URLS.map((url) =>
          cache.add(url).catch((err) => {
            console.warn('[SW] precache skip:', url, err.message);
          })
        )
      );
    })
  );
  // Activate immediately without waiting for existing clients to close
  self.skipWaiting();
});

// ─── Activate — clean old caches ─────────────────────────────────────────────
self.addEventListener('activate', (event) => {
  const KEEP = new Set([CACHE_NAME, API_CACHE]);
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => !KEEP.has(key))
          .map((key) => {
            console.info('[SW] deleting old cache:', key);
            return caches.delete(key);
          })
      )
    )
  );
  // Take control of all open clients immediately
  self.clients.claim();
});

// ─── Fetch Strategies ────────────────────────────────────────────────────────
self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Only handle GET requests; let other methods pass through
  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  // Skip cross-origin requests (CDN analytics, third-party scripts, etc.)
  if (url.origin !== self.location.origin) return;

  // ── Strategy 1: Network First for API calls (/api/*) ────────────────────
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(networkFirstAPI(request));
    return;
  }

  // ── Strategy 2: Cache First for static assets ───────────────────────────
  if (STATIC_EXT.test(url.pathname)) {
    event.respondWith(cacheFirstStatic(request));
    return;
  }

  // ── Strategy 3: Network First with offline fallback for navigation ──────
  if (request.mode === 'navigate') {
    event.respondWith(networkFirstNavigation(request));
    return;
  }

  // ── Default: try cache, then network ────────────────────────────────────
  event.respondWith(
    caches.match(request).then((cached) => cached || fetch(request))
  );
});

// ─── Network First — API ─────────────────────────────────────────────────────
// Try network; on success cache the response in API_CACHE; on failure serve
// cached version or a JSON error payload.
async function networkFirstAPI(request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const clone = response.clone();
      caches.open(API_CACHE).then((cache) => cache.put(request, clone));
    }
    return response;
  } catch {
    const cached = await caches.match(request);
    if (cached) return cached;
    return new Response(
      JSON.stringify({ error: 'أنت غير متصل بالإنترنت حالياً.' }),
      {
        status: 503,
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
      }
    );
  }
}

// ─── Cache First — Static assets ─────────────────────────────────────────────
// Serve from cache when available; otherwise fetch, cache, and return.
async function cacheFirstStatic(request) {
  const cached = await caches.match(request);
  if (cached) return cached;

  try {
    const response = await fetch(request);
    if (response.ok) {
      const clone = response.clone();
      caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
    }
    return response;
  } catch {
    // No cache, no network — return a basic 503
    return new Response('', { status: 503, statusText: 'Offline' });
  }
}

// ─── Network First — Navigation (HTML pages) ─────────────────────────────────
// Try network first so users always get the latest page; fall back to cache
// then to the offline page.
async function networkFirstNavigation(request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const clone = response.clone();
      caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
    }
    return response;
  } catch {
    const cached = await caches.match(request);
    if (cached) return cached;

    // Last resort — offline page
    const offlinePage = await caches.match(OFFLINE_URL);
    if (offlinePage) return offlinePage;

    return new Response('غير متصل', {
      status: 503,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
  }
}
