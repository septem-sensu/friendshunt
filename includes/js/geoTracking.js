class GeoTracker {
  constructor() {
    this.options = {
      enableHighAccuracy: false, // GPS statt WLAN-Tracking
      timeout: 10000,            // Maximal 10 Sekunden auf das Signal warten
      maximumAge: 0              // Keinen alten Cache-Wert nutzen, sondern live abfragen
    }

    this.trackInterval = typeof window[ appAlias ].gameSettings == 'object' && typeof window[ appAlias ].gameSettings.trackInterval != 'undefined' ? window[ appAlias ].gameSettings.trackInterval * 1000 : 60000;
    this.stepCount     = 0;
    this.lastPulse     = 0;
    this.wakeLock      = null;
    this.debug         = true;

    return;
  }

  get( property ) {
    return this[ property ];
  }

  set( property, value ) {
    this[ property ] = value;

    return;
  }

  getCurrentPosition( callbackSuccess ) {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition (
        ( position ) => {
          const lat       = position.coords.latitude;
          const lng       = position.coords.longitude;
          const precision = position.coords.accuracy; // Genauigkeit in Metern

          if( this.debug ) console.log(`Erfolg! Breitengrad: ${lat}, Längengrad: ${lng}`);
          if( this.debug ) console.log(`Genauigkeit: ${precision} Meter`);

          window[ appAlias ].methods.gameplay[ callbackSuccess ]( lat, lng, precision, {} );
        },
        ( error ) => {
            // Fehlerbehandlung (z.B. wenn der Nutzer die Freigabe abgelehnt hat)
            if( this.debug ) console.error("Fehler bei der GPS-Abfrage: ", error.message);
            callbackSuccess( -1, -1, -1, {
              'error': 'GPS-Abfrage fehlgeschlagen',
              'errorType': error.name,
              'errorCode': error.code,
              'errorMessage': error.message
            } );
        },
        this.options
      );
    } else {
      callbackSuccess( -1, -1, -1, {
        'error': 'Browser unterstützt keine Geolocation API',
        'errorType': 'UnsupportedBrowser',
        'errorCode': 'UnsupportedBrowser',
        'errorMessage': 'Ihr Browser unterstützt die Geolocation API nicht. Bitte verwenden Sie einen modernen Browser.'
      } );
    }

    return;
  }

  startIntervalTracking( callbackSuccess ) {
    if( typeof window[ appAlias ].tracker.intervalTrackingId != 'undefined' && window[ appAlias ].tracker.intervalTrackingId != null ) return;
    if( this.debug ) console.log( 'Tracking läuft... Intervall: ' + this.trackInterval + ' ms' );

    window[ appAlias ].tracker.intervalTrackingId = setInterval( () => this.getCurrentPosition( callbackSuccess ), this.trackInterval );

    return;
  }

  stopIntervalTracking() {
    clearInterval( window[ appAlias ].tracker.intervalTrackingId );
    window[ appAlias ].tracker.intervalTrackingId = null;

    return;
  }

  async startWakeLock() {
    try {
      this.wakeLock = await navigator.wakeLock.request( 'screen' );
      if( this.debug ) console.log( 'Bildschirm-Sperre ist aktiv!' );
    } catch (err) {
      if( this.debug ) console.error( `${ err.name }, ${ err.message }` );
    }

    return;
  }

  stopWakeLock() {
    if( this.wakeLock !== null ) return;

    this.wakeLock.release().then( () => {
      this.wakeLock = null;
      if( this.debug ) console.log( 'Bildschirm-Sperre wurde aufgehoben.' );
    } );

    return;
  }

  startPedometer() {
    window.addEventListener( 'devicemotion', ( event ) => {
      const acc = event.accelerationIncludingGravity;

      // Die Gesamt-Beschleunigung in allen 3 Achsen (X, Y, Z) berechnen
      const totalAcceleration = Math.sqrt( acc.x * acc.x + acc.y * acc.y + acc.z * acc.z );

      // Ein typischer Schritt erzeugt eine Erschütterung (Wert über ca. 12 m/s²)
      // Das 'letzterImpuls'-Zeitfenster verhindert, dass ein Schritt doppelt gezählt wird
      if ( totalAcceleration > 12 && ( Date.now() - letzterImpuls > 300 ) ) {
        this.stepCount++;
        this.lastPulse = Date.now();
        if( this.debug ) console.log( 'Schritte: ' + this.stepCount );
      }
    });

    return;
  }

  calcDistance( lat1, lng1, lat2, lng2 ) {
    const EARTH_RADIUS_IN_METERS = 6371000;

    // Umrechnung von Grad in Bogenmaß (Radiant)
    const dLat     = ( lat2 - lat1 ) * Math.PI / 180;
    const dLng     = ( lng2 - lng1 ) * Math.PI / 180;
    const a        = Math.sin( dLat / 2 ) * Math.sin( dLat / 2 ) + Math.cos( lat1 * Math.PI / 180 ) * Math.cos( lat2 * Math.PI / 180 ) * Math.sin( dLng / 2 ) * Math.sin( dLng / 2 );
    const c        = 2 * Math.atan2( Math.sqrt( a ), Math.sqrt( 1 - a ) );
    const distance = EARTH_RADIUS_IN_METERS * c;

    return distance;
  }


};
