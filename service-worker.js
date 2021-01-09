importScripts("https://storage.googleapis.com/workbox-cdn/releases/4.3.1/workbox-sw.js");

if (workbox) {
    workbox.core.setCacheNameDetails({prefix: "connect4-ai"});

    workbox.core.skipWaiting();
    workbox.core.clientsClaim();
    workbox.precaching.cleanupOutdatedCaches();
    workbox.precaching.precacheAndRoute([{"revision":"5e02cc55e799aeca0626736255b62545","url":"favicon.ico"},{"revision":"03607bfcfc21323932f78e420a08e77a","url":"index.html"},{"revision":"9b7a3703a16cdaed36266c0418f551e2","url":"precache-manifest.9b7a3703a16cdaed36266c0418f551e2.js"}]);
}
