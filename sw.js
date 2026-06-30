const CACHE_NAME = 'simple-schedule-v4';
const urlsToCache = [
  './',
  './index.html',
  './style.css',
  './script.js'
];

self.addEventListener('install', event => {
    // インストール完了後、すぐにアクティベート状態にする (skipWaiting)
    self.skipWaiting();
    
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                return cache.addAll(urlsToCache);
            })
    );
});

self.addEventListener('activate', event => {
    // アクティベート後、すぐにすべてのクライアントのコントロールを奪う (clients.claim)
    event.waitUntil(self.clients.claim());
    
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

self.addEventListener('fetch', event => {
    // キャッシュを無視して常にネットワークから最新を取得する (value: "no-cache")
    // ネットワークエラー時のみキャッシュを返す（オフライン対応）
    event.respondWith(
        fetch(event.request, { cache: "no-cache" })
            .catch(() => caches.match(event.request))
    );
});
