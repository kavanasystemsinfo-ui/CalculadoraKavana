const CACHE_NAME = 'prod-calc-v13';
const ASSETS = [
    './',
    './index.html',
    './manifest.json?v=2',
    './ICON.png?v=2',
    './css/styles.css?v=10',
    './js/app.js?v=13',
    './js/store.js?v=9',
    './js/theme.js?v=12',
    './js/calculator.js',
    './js/export.js',
    './js/ui-templates.js?v=9',
    './js/ui-production.js?v=9',
    './js/ui-history.js?v=9'
];

self.addEventListener('install', event => {
    self.skipWaiting();
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
    );
});

self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.filter(name => name !== CACHE_NAME)
                    .map(name => caches.delete(name))
            );
        })
    );
});

self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request).then(response => {
            return response || fetch(event.request);
        })
    );
});
