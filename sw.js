// Rede primeiro (sempre a versão mais nova); sem internet, usa o que ficou guardado.
const CACHE = 'guia-video-v3';
const BASE = ['./', 'index.html', 'support.js', 'vendor/react.js', 'vendor/react-dom.js',
  'manifest.webmanifest', 'icon-192.png', 'icon-512.png', 'apple-touch-icon.png'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(BASE.map((u) => new Request(u, { cache: 'reload' })))).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys()
    .then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
    .then(() => self.clients.claim()));
});

self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  // Arquivos do próprio site: confere no servidor (o GitHub Pages manda guardar por 10 min).
  const doSite = new URL(e.request.url).origin === self.location.origin;
  const rede = doSite ? fetch(e.request.url, { cache: 'no-cache' }) : fetch(e.request);
  e.respondWith(rede.then((res) => {
    if (res.ok || res.type === 'opaque') {
      const copia = res.clone();
      caches.open(CACHE).then((c) => c.put(e.request, copia));
    }
    return res;
  }).catch(() => caches.match(e.request).then((r) => r || caches.match('./'))));
});
