const { injectManifest } = require('workbox-build');

let wbConfig = {
    globDirectory: 'dist/',
    globPatterns: [
      'favicon.ico',
      'index.html',
      '*.css',
      '*.js',
      '*.png',
    ],
    swSrc: 'src/service-worker.js',
    swDest: 'dist/service-worker.js',
}

injectManifest(wbConfig)
    .then(({count, size}) => {
        console.log(`Generated ${wbConfig.swDest}, which will precache ${count} files, totaling ${size} bytes.`)
    })
