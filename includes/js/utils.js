/**
 * The Utils class only contains static methods to make work easier.
 *
 * @class
 *
 * @author    Markus Götz <info@septem-sensu.de>
 * @version   0.1.0
 * @since     2026-06-18
 *
 * @example   const guid = Utils.guid();
 *
 */
class Utils {

/**
 * Global, static register to avoid multiple registrations of event handlers.
 * Prevents double bindings, even with multiple class instances.
 *
 * @static
 *
 * @type      {Object<string, boolean>}
 *
 * @example   if( Utils.globalRegisteredEvents[ 'Gameplay' ] ) return;
 * Utils.globalRegisteredEvents[ 'Gameplay' ] = true;
 *
 */
  static globalRegisteredEvents = {};

/**
 * This static method creates a GUID.
 *
 * @public
 *
 * @return    {string}  guid  A GUID
 *
 * @example   const guid = Utils.guid();
 *
 */
  static guid() {
    return this.s4() + this.s4() + '-' + this.s4() + '-' + this.s4() + '-' + this.s4() + '-' + this.s4() + this.s4() + this.s4();
  }

/**
 * This static method generates a random string.
 *
 * @public
 *
 * @return    {string}  randomString  A random string
 *
 * @example   const randomString = Utils.s4();
 *
 */
  static s4() {
    return Math.floor( ( 1 + Math.random() ) * 0x10000 ).toString( 16 ).substring( 1 );
  }

/**
 * This static method converts a datetime string into a Php timestamp.
 *
 * @public
 *
 * @param     {string}  dateTimeString   The date time string
 * @return    {number}  timestamp        The Php Timestamp
 *
 * @example   const timestamp = Utils.stringToPhpTimestamp( dateTimeString );
 *
 */
  static stringToPhpTimestamp( dateTimeString ) {
    const dateTime = new Date( dateTimeString );

    return Math.floor( dateTime.getTime() / 1000 );
  }

/**
 * This static method converts a datetime string into a JavaScript timestamp.
 *
 * @public
 *
 * @param     {string}  dateTimeString   The date time string
 * @return    {number}  timestamp        The JavaScript Timestamp
 *
 * @example   const timestamp = Utils.stringToJsTimestamp( dateTimeString );
 *
 */
  static stringToJsTimestamp( dateTimeString ) {
    const dateTime = new Date( dateTimeString );

    return dateTime.getTime();
  }

/**
 * This static method converts a Php timestamp into a human-readable format.
 *
 * @public
 *
 * @param     {number}   timestamp       The Php Timestamp
 * @param     {boolean}  seconds         Should the seconds be returned for the time with true or false
 * @param     {string}   format          The return format, date for just the date, time for just the time, or datetime for both the date and time
 * @return    {string}   dateTimeString  The date time string
 *
 * @example   const dateTimeString = Utils.timestampPhpToString( timestamp, seconds, format );
 *
 */
  static timestampPhpToString( timestamp, seconds, format ) {
    return this.timestampJsToString( timestamp * 1000, seconds, format  );
  }

/**
 * This static method converts a JavaScript timestamp into a human-readable format.
 *
 * @public
 *
 * @param     {number}   timestamp       The JavaScript Timestamp
 * @param     {boolean}  seconds         Should the seconds be returned for the time with true or false
 * @param     {string}   format          The return format, date for just the date, time for just the time, or datetime for both the date and time
 * @return    {string}   dateTimeString  The date time string
 *
 * @example   const dateTimeString = Utils.timestampJsToString( timestamp, seconds, format );
 *
 */
  static timestampJsToString( timestamp, seconds, format ) {
    const dateTime = new Date( timestamp );
    const pad      = (num) => String( num ).padStart( 2, '0' );
    const date     = pad( dateTime.getDate() ) + '.' + pad( dateTime.getMonth() + 1 ) + '.' + dateTime.getFullYear();
    let time       = pad( dateTime.getHours() ) + ':' + pad( dateTime.getMinutes() );

    time           = seconds ? time + ':' + pad( dateTime.getSeconds() ) : time;

    if( format === 'date' ) {
      return date;
    } else if( format === 'time' ) {
      return time;
    }

    return date + ' ' + time;
  }

/**
 * This static method plays a New Message tone.
 *
 * @public
 *
 * @return    {void}
 *
 * @example   Utils.playMessageBeep();
 *
 */
  static playMessageBeep() {
    const audioCtx        = new ( window.AudioContext || window.webkitAudioContext )();
    const now             = audioCtx.currentTime;
    const osc1            = audioCtx.createOscillator();
    const gain1           = audioCtx.createGain();

    osc1.type             = 'sine';
    osc1.frequency.value  = 1200;

    gain1.gain.setValueAtTime( 0.2, now );
    gain1.gain.exponentialRampToValueAtTime( 0.001, now + 0.1 );
    osc1.connect( gain1 );
    gain1.connect( audioCtx.destination );
    osc1.start( now );
    osc1.stop( now + 0.1 );

    const startSound2     = now + 0.15;
    const osc2            = audioCtx.createOscillator();
    const gain2           = audioCtx.createGain();

    osc2.type             = 'sine';
    osc2.frequency.value  = 800;

    gain2.gain.setValueAtTime( 0.2, startSound2 );
    gain2.gain.exponentialRampToValueAtTime( 0.001, startSound2 + 0.4 );
    osc2.connect( gain2 );
    gain2.connect( audioCtx.destination );
    osc2.start( startSound2 );
    osc2.stop( startSound2 + 0.4 );

    return;
  }

/**
 * This static method triggers a vibration on an Android phone.
 *
 * @public
 *
 * @return    {void}
 *
 * @example   Utils.triggerMessageVibration();
 *
 */
  static triggerMessageVibration() {
    if( 'vibrate' in navigator ) navigator.vibrate( [ 200, 100, 200 ] );

    return;
  }

/**
 * This static method closes the full screen view layer.
 *
 * @public
 *
 * @return    {void}
 *
 * @example   Utils.closeFullImage();
 *
 */
  static closeFullImage() {
    document.querySelector('.full-image img').remove();
    document.querySelector('.full-image-layer').style.display = 'none';
    document.querySelector('.full-image').style.display = 'none';

    return;
  }

/**
 * This static method displays a console on the screen to display data, which can be very useful on mobile devices.
 *
 * @public
 *
 * @param     {*}      mixContent    The content to be displayed in the console
 * @return    {void}
 *
 * @example   Utils.log( mixContent );
 *
 */
  static log( mixContent ) {
    let debugConsole = document.querySelector( '#debug-console' );

    if( debugConsole == null ) {
      let content     = '';

      debugConsole    = document.createElement( 'div' );
      debugConsole.id = 'debug-console';

      content        += '<div id="#debug-console-button-bar" class="align-center">';
      content        += '<button onclick="javascript: document.querySelector(\'#debug-console\').classList.add(\'hidden\');" class="info w-140 mr-5 mt-5 mb-5">Schließen</button>';
      content        += '<button onclick="javascript: document.querySelector(\'#debug-console\').remove();" class="warning w-140 ml-5 mt-5 mb-5">Entfernen</button>';
      content        += '</div>';
      content        += '<div id="#debug-console-content"></div>';

      debugConsole.innerHTML = content;
      document.querySelector( 'body' ).prepend( debugConsole );
    }

    if( typeof mixContent === 'object' ) {
      if( mixContent == null ) return;
      mixContent = JSON.stringify( mixContent );
    } else if( mixContent === 'clear' ) {
      debugConsole.innerHTML = '<p>Debug Console</p>';
    } else if( mixContent === 'hide' ) {
      debugConsole.classList.add( 'hidden' );
    } else if( mixContent === 'unhide' ) {
      debugConsole.classList.remove( 'hidden' );
    }

    debugConsole.innerHTML   += '<p>> ' + mixContent + '</p>';
    debugConsole.style.height = ( window.innerHeight - 200 ) + 'px';

    debugConsole.scrollTo( { 'top': debugConsole.scrollHeight, 'behavior': 'smooth' } );

    return;
  }

};