/**
 * Geo Tracker Class for the Friends Hunt App.
 *
 * This Class represents the Geo Tracker Class for the Friends Hunt App with its Properties and Methods.
 * The Class is for handling Position Tracking, Step Counting and Calculate Distances.
 * The Class can start interval Tracking and uses the Wake Lock API.
 *
 * @class
 * @see GeoMaps
 *
 * @author    Markus Götz <info@septem-sensu.de>
 * @version   0.1.0
 * @since     2026-06-05
 *
 * @example   const geoTracker = new GeoTracker();
 *
 */
class GeoTracker {

  /**
 * This Method is the Constructor for this Class.
 *
 * @public
 *
 * @return    {void}
 *
 * @example   const geoTracker = new GeoTracker();
 *
 */
  constructor() {
    this.options = {
      enableHighAccuracy: true,
      timeout: 20000,            // Wait a maximum of 20 seconds for the signal
      maximumAge: 0              // Do not use old cache values, query them live
    };

    this.trackInterval      = typeof window[ appAlias ].gameSettings == 'object' && typeof window[ appAlias ].gameSettings.trackInterval != 'undefined' ? window[ appAlias ].gameSettings.trackInterval * 1000 : 60000;
    this.stepCount          = 0;
    this.lastPulse          = 0;
    this.wakeLock           = null;
    this.debug              = window[ appAlias ].debug ? true : false;
    this.caller             = null;
    this.intervalTrackingId = null;

    return;
  }

/**
 * This Method is the default getter of the Class.
 *
 * @public
 *
 * @param     {string}   property   The Property to get
 * @return    {*}        value      The Value of the Property
 *
 * @example   let value = geoTracker.stepCount( property );
 *
 * @see GeoTracker#set
 *
 */
  get( property ) {
    return this[ property ];
  }

/**
 * This Method is the default setter of the Class.
 *
 * @public
 *
 * @param     {string}   property   The Property to set
 * @param     {*}        value      The Value to set
 * @return    {void}
 *
 * @example   geoTracker.set( property, value );
 *
 * @see GeoTracker#get
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
 *
 * @param     {function} callbackSuccess   The callback function for the position
 * @return    {void}
 *
 * @example   geoTracker.getCurrentPosition( callbackSuccess );
 *
 */
  getCurrentPosition( callbackSuccess ) {
    if("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition (
        ( position ) => {
          const lat       = position.coords.latitude;
          const lng       = position.coords.longitude;
          const precision = position.coords.accuracy;

          if( this.debug ) console.log(`Erfolg! Breitengrad: ${lat}, Längengrad: ${lng}`);
          if( this.debug ) console.log(`Genauigkeit: ${precision} Meter`);

          callbackSuccess( lat, lng, precision, {} );
        },
        ( error ) => {
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
 *
 * @param     {function} callbackSuccess   The callback function for the position
 * @return    {void}
 *
 * @example   geoTracker.startIntervalTracking( callbackSuccess );
 *
 */
  startIntervalTracking( callbackSuccess ) {
    //if( typeof window[ appAlias ].tracker.intervalTrackingId != 'undefined' && window[ appAlias ].tracker.intervalTrackingId != null ) return;
    if( this.debug ) console.log( 'Tracking läuft... Intervall: ' + this.trackInterval + ' ms' );

    this.intervalTrackingId = setInterval(
      this.getCurrentPosition.bind(this, callbackSuccess),
      this.trackInterval
    );

    return;
  }

/**
 * This Method stop the interval Tracking.
 *
 * @public
 *
 * @return    {void}
 *
 * @example   geoTracker.stopIntervalTracking();
 *
 */
  stopIntervalTracking() {
    clearInterval( window[ appAlias ].tracker.intervalTrackingId );
    window[ appAlias ].tracker.intervalTrackingId = null;

    return;
  }

/**
 * This Method starts the Wake Lock, so that the Device does not go into Sleep Mode or lock the Screen.
 *
 * @async
 * @public
 *
 * @return    {void}
 *
 * @example   geoTracker.startWakeLock();
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
 * This Method stops the Wake Lock Mode, the Device can go into Sleep Mode or lock the Screen.
 *
 * @public
 *
 * @return    {void}
 *
 * @example   geoTracker.stopWakeLock();
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
 *
 * @return    {void}
 *
 * @example   geoTracker.startPedometer();
 *
 */
  startPedometer() {
    if( this.debug ) Utils.log( 'Pedo gestartet' );

    this.lastPulse = Date.now();

    window.addEventListener( 'devicemotion', ( objEvent ) => {
      const objAcc = objEvent.accelerationIncludingGravity;

      if( !objAcc || objAcc.x === null ) return;

      const totalAcceleration = Math.sqrt( objAcc.x * objAcc.x + objAcc.y * objAcc.y + objAcc.z * objAcc.z );

      if( totalAcceleration > 12 && ( Date.now() - this.lastPulse > 300 ) ) {
        this.stepCount++;

        if( this.debug ) Utils.log( 'Schritte: ' + this.stepCount );
        if( this.debug ) console.log( 'Schritte: ' + this.stepCount );

        this.lastPulse = Date.now();

      }
    } );

    return;
  }

/**
 * This Method checked the Permission and start the Pedometer to count the steps.
 *
 * @public
 *
 * @return    {void}
 *
 * @example   geoTracker.checkPedometerSensor();
 *
 */
  checkPedometerSensor() {
    if( typeof DeviceMotionEvent !== 'undefined' && typeof DeviceMotionEvent.requestPermission === 'function' ) {
      DeviceMotionEvent.requestPermission().then( permissionState => {
        if( permissionState === 'granted' ) {
          this.startPedometer();
        } else {
          alert( "Ohne Bewegungssensor funktioniert der Schrittzähler leider nicht." );
        }
      } ).catch( console.error );
    } else {
      this.startPedometer();
    }

    return;
  }

/**
 * This Method calculate the Distance between two Points on the Earth's surface with the Haversine-Formula.
 *
 * @public
 *
 * @param     {number}  lat1       The Latitude of Waypoint 1 (float)
 * @param     {number}  lng1       The Longitude of Waypoint 1 (float)
 * @param     {number}  lat2       The Latitude of Waypoint 2 (float)
 * @param     {number}  lng2       The Longitude of Waypoint 2 (float)
 * @return    {number}  distance   The Distance between Waypoint 1 and Waypoint 2 in Meters (float)
 *
 * @example   let floatDistance = geoTracker.calcDistance( lat1, lng1, lat2, lng2 );
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
}
