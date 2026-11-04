const CACHE_NAME = 'prod-calc-v21';
const ASSETS = [
    './',
    './index.html',
    './manifest.json?v=4',
    './ICON.png?v=2',
    './icons/icon-192.png',
    './icons/icon-512.png',
    './icons/icon-maskable-1024.png',
    './icons/apple-touch-icon.png',
    './icons/favicon-48.png',
    './css/styles.css?v=13',
    './js/app.js?v=17',
    './js/store.js?v=10',
    './js/theme.js?v=13',
    './js/calculator.js',
    './js/export.js',
    './js/format.js',
    './js/ui-templates.js?v=12',
    './js/ui-production.js?v=13',
    './js/ui-history.js?v=12',
    './js/ui-drive.js?v=1',
    './js/config.js',
    './js/drive.js',
    './js/drive-model.js',
    './js/sheet-utils.js',
    './js/seed-data.js',
    './vendor/xlsx.full.min.js?v=1'
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
