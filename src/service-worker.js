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
    workbox.precaching.precacheAndRoute(self.__WB_MANIFEST);
}
