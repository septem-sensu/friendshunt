self.addEventListener( 'install', function( event ) {
  console.log( 'Service Worker Install' );
});

self.addEventListener( 'activate', function( event ) {
  console.log( 'Service Worker Activate' );
});

self.addEventListener( 'fetch', function( event ) {
  console.log( 'Service Worker Fetch' );
});