importScripts('https://storage.googleapis.com/workbox-cdn/releases/6.0.2/workbox-sw.js')

if (workbox) {
    workbox.core.skipWaiting();
    workbox.core.clientsClaim();
    workbox.precaching.cleanupOutdatedCaches();

    workbox.precaching.precacheAndRoute([{"revision":"5e02cc55e799aeca0626736255b62545","url":"favicon.ico"},{"revision":"04cef3764d4c2d6a7e14152be3fcabaf","url":"index.html"},{"revision":"acf7540439dbb57624a0885e245ea470","url":"precache-manifest.acf7540439dbb57624a0885e245ea470.js"}]);
}
