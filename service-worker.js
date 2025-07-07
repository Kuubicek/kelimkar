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
  'alert.mp3',
  'https://cdn.jsdelivr.net/npm/@supabase/supabase-js'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS)));
});

self.addEventListener('fetch', e => {
  e.respondWith(caches.match(e.request).then(res => res || fetch(e.request)));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys =>
    Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
  ));
});

// 🎯 Push notifikace
self.addEventListener('push', event => {
  const data = event.data.json();
  self.registration.showNotification(data.title, {
    body: data.body,
    icon: 'android-launchericon-192-192.png'
  });
});
