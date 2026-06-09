var CACHE = 'strefa-pwa-v2';
var ASSETS = [
  './',
  './index.html',
  './gm-nx7k3.html',
  './admin-zx9k2.html',
  './manifest.json',
  './manifest-gm.json',
  './manifest-admin.json',
  './icon-192.png',
  './icon-512.png'
];

self.addEventListener('install', function(e) {
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE).then(function(c) { return c.addAll(ASSETS); })
  );
});

self.addEventListener('activate', function(e) {
  e.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(
        keys.filter(function(k) { return k !== CACHE; })
            .map(function(k) { return caches.delete(k); })
      );
    }).then(function() { return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function(e) {
  e.respondWith(
    caches.match(e.request).then(function(cached) {
      var fresh = fetch(e.request).then(function(res) {
        caches.open(CACHE).then(function(c) { c.put(e.request, res.clone()); });
        return res;
      }).catch(function() { return cached; });
      return cached || fresh;
    })
  );
});
