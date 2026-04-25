// ── DomeSim Service Worker ──────────────────────────────────────────────────
// BUMP THIS STRING on every deploy → forces all clients to get the new version
const VERSION = '2026-04-25-001';
const CACHE   = `domesim-${VERSION}`;

// Assets to pre-cache on install (adjust paths to match your repo)
const PRECACHE = [
  './',
  './index.html',
  './2160.png',
];

// ── Install: pre-cache core assets ──────────────────────────────────────────
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE)
      .then(c => c.addAll(PRECACHE.map(u => new Request(u, { cache: 'reload' }))))
      .then(() => self.skipWaiting())   // activate immediately, don't wait for old tabs to close
  );
});

// ── Activate: delete all old caches ─────────────────────────────────────────
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(k => k !== CACHE).map(k => caches.delete(k))
      ))
      .then(() => self.clients.claim())  // take control of all open tabs immediately
  );
});

// ── Fetch: network-first for HTML, cache-first for static assets ─────────────
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);

  // Always go to network for HTML — so new deploys are picked up immediately
  if (e.request.destination === 'document' || url.pathname.endsWith('.html')) {
    e.respondWith(
      fetch(e.request)
        .then(res => {
          if (res && res.status === 200) {
            const clone = res.clone();
            caches.open(CACHE).then(c => c.put(e.request, clone));
          }
          return res;
        })
        .catch(() => caches.match(e.request))  // offline fallback
    );
    return;
  }

  // CDN resources (Three.js etc) — network-first with cache fallback
  if (url.hostname !== self.location.hostname) {
    e.respondWith(
      fetch(e.request)
        .then(res => {
          if (res && res.status === 200) {
            const clone = res.clone();
            caches.open(CACHE).then(c => c.put(e.request, clone));
          }
          return res;
        })
        .catch(() => caches.match(e.request))
    );
    return;
  }

  // Everything else (images, fonts, etc) — cache-first, network fallback
  e.respondWith(
    caches.match(e.request)
      .then(cached => {
        if (cached) return cached;
        return fetch(e.request).then(res => {
          if (res && res.status === 200) {
            const clone = res.clone();
            caches.open(CACHE).then(c => c.put(e.request, clone));
          }
          return res;
        });
      })
  );
});

// ── Message: allow page to trigger skipWaiting manually ─────────────────────
self.addEventListener('message', e => {
  if (e.data === 'skipWaiting') self.skipWaiting();
});
