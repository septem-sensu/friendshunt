const CACHE_NAME      = 'friendshunt-v0.1.0.66';
const TILE_CACHE_NAME = 'friendshunt-tiles-v1';
const TILE_MAX_AGE_MS = 2 * 60 * 60 * 1000; // 2 hours

const STATIC_ASSETS = [
  './includes/css/themes/default.css',
  './includes/css/themes/gray.css',
  './includes/css/themes/rubin.css',
  './includes/css/themes/black.css',

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
  './includes/images/favicons/friendshunt-app-icon-16x16.png',

  './includes/images/screenshots/screenshot-friends-hunt-setup-550x1024.png',
  './includes/images/screenshots/screenshot-friends-hunt-gameplay-550x1024.png',
  './includes/images/screenshots/screenshot-friends-hunt-dashboard-550x1024.png',
  './includes/images/screenshots/screenshot-friends-hunt-messages-550x1024.png',
  './includes/images/screenshots/screenshot-friends-hunt-my-account-550x1024.png',
  './includes/images/screenshots/screenshot-friends-hunt-system-messages-550x1024.png',
  './includes/images/screenshots/screenshot-friends-hunt-replay-player-550x1024.png',
  './includes/images/screenshots/screenshot-friends-hunt-themes-550x1024.png'
];

// Tile-URLs recognize (OpenStreetMap, OpenTopoMap etc.)
const TILE_HOSTS = [ 'tile.openstreetmap.org', 'tile.opentopomap.org' ];

function isTileRequest( url ) {
  return TILE_HOSTS.some( ( host ) => url.hostname === host );
}

// Remove expired tiles from the tile cache
function cleanExpiredTiles( cache ) {
  const now = Date.now();
  return cache.keys().then( ( keys ) =>
    Promise.all(
      keys.map( ( key ) =>
        cache.match( key ).then( ( response ) => {
          const dateHeader = response.headers.get( 'sw-cached-at' );
          if( dateHeader && ( now - parseInt( dateHeader, 10 ) ) > TILE_MAX_AGE_MS ) {
            return cache.delete( key );
          }
        } )
      )
    )
  );
}

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
        names
          .filter( ( name ) => name !== CACHE_NAME && name !== TILE_CACHE_NAME )
          .map( ( name ) => caches.delete( name ) )
      )
    )
    .then( () => caches.open( TILE_CACHE_NAME ).then( cleanExpiredTiles ) )
    .then( () => self.clients.claim() )
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

  // Map tiles: Stale-While-Revalidate with a 2 hour process
  if( isTileRequest( url ) ) {
    event.respondWith(
      caches.open( TILE_CACHE_NAME ).then( ( cache ) =>
        cache.match( request ).then( ( cached ) => {
          // Update in the background (Revalidate)
          const revalidate = fetch( request ).then( ( response ) => {
            if( response.ok ) {
              const headers = new Headers( response.headers );
              headers.set( 'sw-cached-at', Date.now().toString() );
              const stamped = new Response( response.body, { status: response.status, statusText: response.statusText, headers } );
              cache.put( request, stamped );
            }
            return response;
          } ).catch( () => {} ); // Ignore network errors, cache is enough

          // Return the cached tile immediately, otherwise wait for the network
          if( cached ) return cached;
          return revalidate;
        } )
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
