importScripts("https://storage.googleapis.com/workbox-cdn/releases/4.3.1/workbox-sw.js");

if (workbox) {
    workbox.core.setCacheNameDetails({prefix: "connect4-ai"});

    workbox.core.skipWaiting();
    workbox.core.clientsClaim();
    workbox.precaching.cleanupOutdatedCaches();
    workbox.precaching.precacheAndRoute([{"revision":"5e02cc55e799aeca0626736255b62545","url":"favicon.ico"},{"revision":"dab2dde42d2d121e998eec5a63cd8793","url":"index.html"},{"revision":"09b34566a7a38e4025d7edc488ad9c17","url":"precache-manifest.09b34566a7a38e4025d7edc488ad9c17.js"}]);
}
