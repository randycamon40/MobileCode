const CACHE = 'mobile-code-v4';
const HTML_URL = './';
const PRE_CACHE = [
  './',
  'manifest.json',
  'icon-192.png',
  'icon-512.png',
  'index.html',
  'style.css',
  'app.js',
  'script.js'
];

self.addEventListener('install', (e) => {
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE).then((c) =>
      Promise.all(PRE_CACHE.map((u) => c.add(u).catch(() => null)))
    )
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('message', (e) => {
  if (e.data && e.data.type === 'SKIP_WAITING') self.skipWaiting();
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  // only handle same-origin
  if (url.origin !== self.location.origin) return;

  const isHTML =
    req.mode === 'navigate' ||
    (req.headers.get('accept') || '').includes('text/html');

  if (isHTML) {
    e.respondWith(
      (async () => {
        try {
          const fresh = await fetch(req, { cache: 'no-store' });
          if (fresh && fresh.ok) {
            const cache = await caches.open(CACHE);
            const cached = await cache.match(HTML_URL);
            if (cached) {
              try {
                const [oldText, newText] = await Promise.all([
                  cached.clone().text(),
                  fresh.clone().text(),
                ]);
                if (oldText !== newText) {
                  const clients = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
                  clients.forEach((c) => c.postMessage({ type: 'HTML_UPDATED' }));
                }
              } catch (_) {}
            }
            cache.put(HTML_URL, fresh.clone());
            // also cache index.html explicitly
            cache.put('index.html', fresh.clone());
          }
          return fresh;
        } catch (_) {
          const cached = await caches.match(HTML_URL) || await caches.match('index.html');
          return cached || new Response('Offline', { status: 503, headers: { 'content-type': 'text/html' } });
        }
      })()
    );
    return;
  }

  e.respondWith(
    (async () => {
      const cached = await caches.match(req);
      if (cached) {
        fetch(req)
          .then((res) => { if (res && res.ok) caches.open(CACHE).then((c) => c.put(req, res.clone())); })
          .catch(() => {});
        return cached;
      }
      try {
        const res = await fetch(req);
        if (res && res.ok) caches.open(CACHE).then((c) => c.put(req, res.clone()));
        return res;
      } catch (_) {
        return cached || new Response('Offline', { status: 503 });
      }
    })()
  );
});
