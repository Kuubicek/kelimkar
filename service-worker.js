const CACHE_NAME = 'kelimky-app-v3';
const ASSETS = [
  'index.html',
  'kelimkar.html',
  'stankar.html',
  'nadrizeny.html',
  'style.css',
  'manifest.json',
  '/android-launchericon-192-192.png',
  '/android-launchericon-512-512.png',
  'alert.mp3',
  'https://cdn.jsdelivr.net/npm/@supabase/supabase-js'
];

// Instalace service workeru
self.addEventListener('install', event => {
  console.log('[SW] Installing...');
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(ASSETS);
    })
  );
});

// Aktivace – vyčištění starých cache
self.addEventListener('activate', event => {
  console.log('[SW] Activating...');
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(k => k !== CACHE_NAME)
            .map(k => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

// Fetch – cache-first fallback
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request).catch(() => {
        console.warn('[SW] Offline fallback for', event.request.url);
      });
    })
  );
});

// 🎯 Push notifikace
self.addEventListener('push', event => {
  const data = event.data?.json() || {};
  self.registration.showNotification(data.title || 'Kelímkář', {
    body: data.body || 'Nová notifikace',
    icon: 'android-launchericon-192-192.png'
  });
});
