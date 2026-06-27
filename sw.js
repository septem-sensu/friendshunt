const CACHE_NAME = 'friendshunt-v0.1.0.22';

const STATIC_ASSETS = [
  './includes/css/themes/default.css',
  './includes/css/classes.css',
  './includes/css/core.css',
  './includes/css/gameplay.css',
  './includes/css/spacer.css',
  './includes/css/style.css',

  './includes/css/fonts/orbitron-v35-latin-regular.woff2',
  './includes/css/fonts/orbitron-v35-latin-500.woff2',
  './includes/css/fonts/orbitron-v35-latin-600.woff2',
  './includes/css/fonts/orbitron-v35-latin-700.woff2',
  './includes/css/fonts/orbitron-v35-latin-800.woff2',
  './includes/css/fonts/roboto-condensed-v31-latin-regular.woff2',
  './includes/css/fonts/roboto-condensed-v31-latin-500.woff2',
  './includes/css/fonts/roboto-condensed-v31-latin-600.woff2',
  './includes/css/fonts/roboto-condensed-v31-latin-700.woff2',
  './includes/css/fonts/roboto-condensed-v31-latin-800.woff2',
  './includes/css/fonts/roboto-condensed-v31-latin-300.woff2',
  './includes/css/fonts/roboto-condensed-v31-latin-100.woff2',
  './includes/css/fonts/roboto-condensed-v31-latin-200.woff2',

  './includes/js/baseObject.js',
  './includes/js/batteryTracker.js',
  './includes/js/communicator.js',
  './includes/js/game.js',
  './includes/js/gameplay.js',
  './includes/js/geoMaps.js',
  './includes/js/geoTracker.js',
  './includes/js/player.js',
  './includes/js/replayPlayer.js',
  './includes/js/statistic.js',
  './includes/js/validator.js',
  './includes/js/utils.js',

  './includes/libs/leaflet/leaflet.js',
  './includes/libs/leaflet/leaflet.css',

  './includes/images/favicons/friendshunt-app-icon-512x512.png',
  './includes/images/favicons/friendshunt-app-icon-192x192.png',
  './includes/images/favicons/friendshunt-app-icon-180x180.png',
  './includes/images/favicons/friendshunt-app-icon-32x32.png',
  './includes/images/favicons/friendshunt-app-icon-16x16.png'
];

// INSTALL: Precaching static assets, not PHP endpoints
self.addEventListener( 'install', ( event ) => {
  event.waitUntil(
    caches.open( CACHE_NAME )
      .then( ( cache ) => cache.addAll( STATIC_ASSETS ) )
      .then( () => self.skipWaiting() )
  );
} );

// ACTIVATE: Delete old caches, take control immediately
self.addEventListener( 'activate', ( event ) => {
  event.waitUntil(
    caches.keys().then( ( names ) =>
      Promise.all(
        names.filter( ( name ) => name !== CACHE_NAME ).map( ( name ) => caches.delete( name ) )
      )
    ).then( () => self.clients.claim() )
  );
});

// FETCH: Network-first for HTML, cache-first for static assets
self.addEventListener( 'fetch', ( event ) => {
  const { request } = event;
  const url = new URL( request.url );

  // Ignore non-HTTP(S) requests (chrome-extension, data, blob, etc.)
  if( !url.protocol.startsWith( 'http' ) ) return;

  // Allow AJAX requests to pass through completely
  if( url.searchParams.has( 'result' ) ) return;

  // Navigation (HTML pages): Network-first, cache as offline fallback
  if( request.mode === 'navigate' ) {
    event.respondWith(
      fetch( request )
        .then( ( response ) => {
          // Cache successful response for offline
          const clone = response.clone();
          caches.open( CACHE_NAME ).then( ( cache ) => cache.put( request, clone ) );
          return response;
        })
        .catch( () =>
          // Network error → cached page or minimal offline page
          caches.match( request ).then( ( cached ) =>
            cached || new Response(
              '<html><body style="background-color: #0a0d14; color: #cccccc;"><h1>Offline</h1><p>Keine Netzwerkverbindung. Bitte versuche es erneut, wenn du wieder online bist.</p></body></html>',
              { headers: { 'Content-Type': 'text/html; charset=utf-8' } }
            )
          )
        )
    );
    return;
  }

  // Static Assets: Cache-first, Network-Fallback
  event.respondWith(
    caches.match( request ).then( ( cached ) => {
      if( cached ) return cached;
      return fetch( request ).then( ( response ) => {
        if( response.ok ) {
          const clone = response.clone();
          caches.open( CACHE_NAME ).then( ( cache ) => cache.put( request, clone ) );
        }
        return response;
      } );
    } )
  );
} );
