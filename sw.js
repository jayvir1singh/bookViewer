var cacheName = "v17";
var cacheFiles = [
    'index.html',
    'index.css',
    'dark.css',
    'oled.css',
    'not_available.jpeg',
    'loading.gif',
    'checkmark_black.png',
    'checkmark_white.png',
    'index.js',
    'settings.js',
    'iconMask.png',
    'manifest.json',
    "/",
];

self.addEventListener("install", async (e) => e.waitUntil(onInstall()));
self.addEventListener('fetch', (e) => e.respondWith(onfetch(e)));

async function onInstall() {
    var cache = await caches.open(cacheName);
    await cache.addAll(cacheFiles)
}

async function onfetch(e) {
    var requestR = await caches.match(e.request);
    if(requestR === undefined) {
        var response = await fetch(e.request);
        var cache = await caches.open(cacheName);
        cache.put(e.request, response.clone());
        return response;
    }
    else {
        return requestR;
    }
}
