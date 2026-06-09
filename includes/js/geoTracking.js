/**
 * Geo Tracker Class for the Friends Hunt App.
 *
 * This Class represents the Geo Tracker Class for the Friends Hunt App with his Properties and Methods.
 * The Class is for handling Position Tracking, Step Counting and Calculte Distances.
 * The Class can start inverval Tracking and used the Wake Lock API.
 *
 * @class
 *
 * @author    Markus Götz <info@septem-sensu.de>
 * @version   0.1.0
 * @since     2026-06-05
 *
 * @example   var objGeoTracker = new GeoTracker();
 *
 */
class GeoTracker {

  /**
 * This Method is the Constructor for this Class.
 *
 * @constructor
 *
 * @example   var objGeoTracker = new GeoTracker();
 *
 */
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
    this.caller        = null;

    return;
  }

/**
 * This Method is the default getter of the Class.
 *
 * @public
 * @param     {string}   property   The Property to get
 * @return    {mixed}    value      The Value of the Property
 *
 * @example   var value = objGeoTracker.stepCount( property );
 *
 */
  get( property ) {
    return this[ property ];
  }

/**
 * This Method is the default setter of the Class.
 *
 * @public
 * @param     {string}   property   The Property to set
 * @param     {mixed}    value      The Value to set
 * @return    {void}
 *
 * @example   objGeoTracker.set( property, value );
 *
 */
  set( property, value ) {
    this[ property ] = value;

    return;
  }

/**
 * This Method get the current Position, called the Callback Function and hand over the Position Data.
 *
 * @public
 * @param     {string}   callbackSuccess   The Property to set
 * @return    {void}
 *
 * @example   objGeoTracker.getCurrentPosition( callbackSuccess );
 *
 */
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

/**
 * This Method start the interval Tracking and get periodically the current Position, called the Callback Function and hand over the Position Data.
 *
 * @public
 * @param     {string}   callbackSuccess   The Property to set
 * @return    {void}
 *
 * @example   objGeoTracker.startIntervalTracking( callbackSuccess );
 *
 */
  startIntervalTracking( callbackSuccess ) {
    if( typeof window[ appAlias ].tracker.intervalTrackingId != 'undefined' && window[ appAlias ].tracker.intervalTrackingId != null ) return;
    if( this.debug ) console.log( 'Tracking läuft... Intervall: ' + this.trackInterval + ' ms' );

    window[ appAlias ].tracker.intervalTrackingId = setInterval( () => this.getCurrentPosition( callbackSuccess ), this.trackInterval );

    return;
  }

/**
 * This Method stop the interval Tracking.
 *
 * @public
 * @return    {void}
 *
 * @example   objGeoTracker.stopIntervalTracking();
 *
 */
  stopIntervalTracking() {
    clearInterval( window[ appAlias ].tracker.intervalTrackingId );
    window[ appAlias ].tracker.intervalTrackingId = null;

    return;
  }

/**
 * This Method starts the Wake Look, so that the Device does not go into Sleep Mode or lock the Screen.
 *
 * @async
 * @public
 * @return    {void}
 *
 * @example   objGeoTracker.startWakeLock();
 *
 */
  async startWakeLock() {
    try {
      this.wakeLock = await navigator.wakeLock.request( 'screen' );
      if( this.debug ) console.log( 'Bildschirm-Sperre ist aktiv!' );
    } catch (err) {
      if( this.debug ) console.error( `${ err.name }, ${ err.message }` );
    }

    return;
  }

/**
 * This Method stops the Wake Look Mode, the Device can go into Sleep Mode or lock the Screen.
 *
 * @public
 * @return    {void}
 *
 * @example   objGeoTracker.stopWakeLock();
 *
 */
  stopWakeLock() {
    if( this.wakeLock !== null ) return;

    this.wakeLock.release().then( () => {
      this.wakeLock = null;
      if( this.debug ) console.log( 'Bildschirm-Sperre wurde aufgehoben.' );
    } );

    return;
  }

/**
 * This Method start the Pedometer to count the steps.
 *
 * @public
 * @return    {void}
 *
 * @example   objGeoTracker.startPedometer();
 *
 */
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

/**
 * This Method calculate the Distance between two Points on the Earth's surface with the Haversine-Formula.
 *
 * @public
 * @param     {number}  lat1       The Latidude of Waypoint 1 (float)
 * @param     {number}  lng1       The Langidude of Waypoint 1 (float)
 * @param     {number}  lat2       The Latidude of Waypoint 2 (float)
 * @param     {number}  lng2       The Langidude of Waypoint 2 (float)
 * @return    {number}  distance   The Distance between Waypoint 1 and Waypoint 2 in Meters (float)
 *
 * @example   var floatDistance = objGeoTracker.calcDistance( lat1, lng1, lat2, lng2 );
 *
 */
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
