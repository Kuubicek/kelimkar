
// service-worker.js
const CACHE_NAME = 'kelimky-app-v1';
const ASSETS = [
  'index.html',
  'kelimkar.html',
  'stankar.html',
  'nadrizeny.html',
  'style.css',
  'manifest.json',
  '/android-launchericon-192-192.png',
  '/android-launchericon-512-512.png',
  'https://cdn.jsdelivr.net/npm/@supabase/supabase-js'
];

self.addEventListener('install', e => {
  e.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    await Promise.all(
      ASSETS.map(async url => {
        try {
          await cache.add(url);
          console.log('✔️ Cached', url);
        } catch (err) {
          console.warn('❌ Failed to cache', url, err);
        }
      })
    );
  })());
});

self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request)
      .then(cached => cached || fetch(e.request))
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(k => k !== CACHE_NAME)
            .map(k => caches.delete(k))
      )
    )
  );
});

