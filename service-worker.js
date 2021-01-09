importScripts("https://storage.googleapis.com/workbox-cdn/releases/4.3.1/workbox-sw.js");

if (workbox) {
    workbox.core.setCacheNameDetails({prefix: "connect4-ai"});

    self.addEventListener('message', (event) => {
        if (event.data && event.data.type === 'SKIP_WAITING') {
            self.skipWaiting();
        }
    });

    workbox.core.clientsClaim();
    workbox.precaching.cleanupOutdatedCaches();
    workbox.precaching.precacheAndRoute([{"revision":"5e02cc55e799aeca0626736255b62545","url":"favicon.ico"},{"revision":"1fa21817fe7b80326990ac2ef4cdf7b7","url":"index.html"},{"revision":"5ae59acc7caa4c876fa2b6f373c7bd37","url":"precache-manifest.5ae59acc7caa4c876fa2b6f373c7bd37.js"}]);
}
