importScripts("https://storage.googleapis.com/workbox-cdn/releases/4.3.1/workbox-sw.js");

if (workbox) {
    workbox.core.setCacheNameDetails({prefix: "connect4-ai"});

    workbox.core.skipWaiting();
    workbox.core.clientsClaim();
    workbox.precaching.cleanupOutdatedCaches();
    workbox.precaching.precacheAndRoute([{"revision":"5e02cc55e799aeca0626736255b62545","url":"favicon.ico"},{"revision":"1ced7c6192bb71ffaf7bc176a268cf7e","url":"index.html"},{"revision":"cc6577963d72b202a47e6be00a5d8ef4","url":"precache-manifest.cc6577963d72b202a47e6be00a5d8ef4.js"}]);
}
