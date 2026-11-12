// 앱 화면(HTML/CSS/JS)만 캐시합니다. 영상은 항상 유튜브에서 스트리밍됩니다.
const CACHE = 'alphablocks-tv-v4';
const SHELL = [
  './',
  'index.html',
  'css/style.css',
  'css/style.css?v=4',
  'js/app.js',
  'js/app.js?v=4',
  'js/data.js',
  'js/blocks.js',
  'manifest.webmanifest',
  'icons/icon.svg',
  'icons/icon-192.png',
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE)
      .then((c) => Promise.all(SHELL.map((u) => fetch(u, { cache: 'reload' }).then((r) => c.put(u, r)))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil((async () => {
    const keys = await caches.keys();
    const old = keys.filter((k) => k !== CACHE);
    await Promise.all(old.map((k) => caches.delete(k)));
    await self.clients.claim();
    // 이전 버전 캐시에서 업그레이드된 경우 열려있는 화면을 최신 버전으로 새로고침
    if (old.length > 0) {
      const clients = await self.clients.matchAll({ type: 'window' });
      for (const client of clients) client.navigate(client.url);
    }
  })());
});

// 같은 출처 요청: 항상 네트워크 최신본 우선(브라우저 디스크 캐시 우회), 오프라인일 때만 캐시 사용
self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET' || url.origin !== location.origin) return;
  e.respondWith(
    fetch(e.request, { cache: 'no-cache' })
      .then((res) => {
        const copy = res.clone();
        caches.open(CACHE).then((c) => c.put(e.request, copy));
        return res;
      })
      .catch(() => caches.match(e.request, { ignoreSearch: true }))
  );
});
