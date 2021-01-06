importScripts('https://storage.googleapis.com/workbox-cdn/releases/6.0.2/workbox-sw.js')

if (workbox) {
    workbox.core.skipWaiting();
    workbox.core.clientsClaim();
    workbox.precaching.cleanupOutdatedCaches();

    workbox.precaching.precacheAndRoute(self.__WB_MANIFEST);
}
