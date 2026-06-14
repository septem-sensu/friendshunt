/**
 * Geo Battery Class for the Friends Hunt App.
 *
 * This Class represents the Battery Tracker Class for the Friends Hunt App with his Properties and Methods.
 * The Class is for handling Battery Level and is charging.
 * Unfortunately, accessing the battery does not work on the iPhone.
 *
 * @class
 *
 * @author    Markus Götz <info@septem-sensu.de>
 * @version   0.1.0
 * @since     2026-06-05
 *
 * @example   var objBatteryTracker = new BatteryTracker();
 *
 */
class BatteryTracker {
  constructor() {
    this.batteryLevel = null;
    this.isCharging   = false;
    this.isSupported  = false;
    this.batteryObj   = null;
    this.debug        = window[ appAlias ].debug ? true : false;

    return;
  }

/**
 * This Method is the default getter of the Class.
 *
 * @public
 *
 * @param     {string}   property   The Property to get
 * @return    {mixed}    value      The Value of the Property
 *
 * @example   var value = objBatteryTracker.get( property );
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
 * @param     {mixed}    value      The Value to set
 * @return    {void}
 *
 * @example   objBatteryTracker.set( property, value );
 *
 */
  set( property, value ) {
    this[ property ] = value;

    return;
  }

/**
 * This Method initializes the Battery API and binds the event listeners.
 *
 * @public
 *
 * @return    {Promise}  objPromise  Returns a promise once initialization is complete
 *
 * @example   var objPromise = objBatteryTracker.init();
 *
 */
  init() {
    if( typeof navigator.getBattery === 'undefined' ) {
      this.isSupported = false;

      if ( this.debug ) console.log( 'BatteryTracker: Nicht unterstützt (iOS/Safari Fallback aktiv).' );

      return Promise.resolve();
    }

    this.isSupported = true;

    return navigator.getBattery().then( ( objBattery ) => {
      this.batteryObj = objBattery;

      this.updateBatteryData();

      this.batteryObj.addEventListener( 'levelchange', () => this.updateBatteryData() );

      this.batteryObj.addEventListener( 'chargingchange', () => this.updateBatteryData() );
    } ).catch( ( objError ) => {
      console.error( 'BatteryTracker Fehler:', objError );
    } );
  }

/**
 * This Method updates the internal properties when the API fires an event.
 * The Method is the Callback Function of the init Method.
 *
 * @public
 *
 * @return    {void}
 *
 * @example   objBatteryTracker.updateBatteryData();
 *
 */
  updateBatteryData() {
    if ( !this.batteryObj ) return;

    this.batteryLevel = Math.round( this.batteryObj.level * 100 );
    this.isCharging   = this.batteryObj.charging;

    if ( this.debug ) console.log( `BatteryTracker Update: ${this.batteryLevel}% (Laden: ${this.isCharging})` );

    return;
  }

/**
 * This Method returns the current Battery State with Battery Level and is the Battery curren charging.
 *
 * @public
 *
 * @return    {object}  objBatteryState  objBatteryState
 *
 * @example   var objBatteryState = objBatteryTracker.getBatteryData();
 *
 */
  getBatteryData() {
    return {
      'level': this.batteryLevel,
      'charging': this.isCharging,
      'supported': this.isSupported
    };
  }
}
