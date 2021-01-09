importScripts("https://storage.googleapis.com/workbox-cdn/releases/4.3.1/workbox-sw.js");

if (workbox) {
    workbox.core.setCacheNameDetails({prefix: "connect4-ai"});

    workbox.core.skipWaiting();
    workbox.core.clientsClaim();
    workbox.precaching.cleanupOutdatedCaches();
    workbox.precaching.precacheAndRoute([{"revision":"5e02cc55e799aeca0626736255b62545","url":"favicon.ico"},{"revision":"fea95d5172b1599b4ad90ff1e8adf8b1","url":"index.html"},{"revision":"ef33a918f6b4ee373df50c68cec32b40","url":"precache-manifest.ef33a918f6b4ee373df50c68cec32b40.js"}]);
}
