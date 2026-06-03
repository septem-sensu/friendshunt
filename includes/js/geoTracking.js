class GeoTracker {
  constructor() {
    this.options = {
      enableHighAccuracy: false, // GPS statt WLAN-Tracking
      timeout: 10000,            // Maximal 10 Sekunden auf das Signal warten
      maximumAge: 0              // Keinen alten Cache-Wert nutzen, sondern live abfragen
    }

    this.trackInterval = typeof window[ appAlias ].gameSettings == 'object' && typeof window[ appAlias ].gameSettings.trackInterval != 'undefined' ? window[ appAlias ].gameSettings.trackInterval * 1000 : 60000;
    this.debug         = true;

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
            console.error("Fehler bei der GPS-Abfrage: ", error.message);
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


};
