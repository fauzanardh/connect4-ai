importScripts('https://storage.googleapis.com/workbox-cdn/releases/6.0.2/workbox-sw.js')

if (workbox) {
    workbox.core.skipWaiting();
    workbox.core.clientsClaim();
    workbox.precaching.cleanupOutdatedCaches();

    workbox.precaching.precacheAndRoute([{"revision":"5e02cc55e799aeca0626736255b62545","url":"favicon.ico"},{"revision":"bc2d49dc78ab6f5617ab4c7d1bb93c33","url":"index.html"},{"revision":"9d7e426e9cdac394100a1d8989689389","url":"precache-manifest.9d7e426e9cdac394100a1d8989689389.js"}]);
}
