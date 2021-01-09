importScripts("https://storage.googleapis.com/workbox-cdn/releases/4.3.1/workbox-sw.js");

if (workbox) {
    workbox.core.setCacheNameDetails({prefix: "connect4-ai"});

    workbox.core.skipWaiting();
    workbox.core.clientsClaim();
    workbox.precaching.cleanupOutdatedCaches();
    workbox.precaching.precacheAndRoute(self.__WB_MANIFEST);
}
