var CACHE = 'strefa-pwa-v3';
var ASSETS = [
  './',
  './index.html',
  './manifest.json',
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
  // Tylko GET — nie cache'uj POST/PUT (Firebase, itp.)
  if (e.request.method !== 'GET') return;
  // Nie cache'uj requestów do zewnętrznych API
  var url = e.request.url;
  if (url.indexOf('firestore.googleapis.com') >= 0 ||
      url.indexOf('firebase') >= 0 ||
      url.indexOf('googleapis.com') >= 0 ||
      url.indexOf('gstatic.com') >= 0) return;

  e.respondWith(
    caches.match(e.request).then(function(cached) {
      var fresh = fetch(e.request).then(function(res) {
        var clone = res.clone();
        caches.open(CACHE).then(function(c) { c.put(e.request, clone); });
        return res;
      }).catch(function() { return cached; });
      return cached || fresh;
    })
  );
});
