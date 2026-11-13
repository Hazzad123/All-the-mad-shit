/* Keystone service worker: network-first for same-origin GETs, falling back to the cache when offline.
   Every successful response is cached, so after one full visit the whole site works without signal. */
const CACHE = 'keystone-v1';
self.addEventListener('install', e => { self.skipWaiting(); e.waitUntil(caches.open(CACHE).then(c => c.addAll(['./', 'index.html', 'pocket.html', 'manifest.webmanifest']).catch(() => {}))); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  const req = e.request; const url = new URL(req.url);
  if (req.method !== 'GET' || url.origin !== location.origin) return;
  e.respondWith((async () => {
    const cache = await caches.open(CACHE);
    try {
      const res = await fetch(req);
      if (res && res.ok) cache.put(req, res.clone());
      return res;
    } catch (err) {
      return (await cache.match(req)) || (await cache.match(req, { ignoreSearch: true })) || (await cache.match('index.html')) || new Response('Offline', { status: 503 });
    }
  })());
});
