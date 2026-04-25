// Dome Sim | 3D — Service Worker
// Caches the full app for offline use on iPhone PWA

const CACHE_NAME = 'domesim-v1';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  './apple-touch-icon.png',
  // Three.js CDN — cache on first load
  'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js'
];

// Install: pre-cache core assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      // Cache local assets immediately
      const localAssets = ASSETS.filter(a => !a.startsWith('http'));
      return cache.addAll(localAssets).then(() => {
        // Try to cache CDN assets (non-blocking)
        const cdnAssets = ASSETS.filter(a => a.startsWith('http'));
        return Promise.allSettled(cdnAssets.map(url => cache.add(url)));
      });
    })
  );
  self.skipWaiting();
});

// Activate: clean old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch: cache-first for local, network-first for CDN
self.addEventListener('fetch', event => {
  const url = event.request.url;
  
  // CDN resources: try network, fall back to cache
  if (url.includes('cdnjs.cloudflare.com') || url.includes('fonts.googleapis.com')) {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
          return response;
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }

  // Local assets: cache-first
  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;
      return fetch(event.request).then(response => {
        if (response && response.status === 200 && response.type === 'basic') {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        }
        return response;
      });
    })
  );
});
