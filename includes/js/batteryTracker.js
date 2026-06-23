/**
 * BatteryTracker Class for the Friends Hunt App.
 *
 * This Class represents the Battery Tracker Class for the Friends Hunt App with its Properties and Methods.
 * The Class is for handling Battery Level and is charging.
 * Unfortunately, accessing the battery does not work on the iPhone.
 *
 * @class
 *
 * @author    Markus Götz <info@septem-sensu.de>
 * @version   0.1.0
 * @since     2026-06-05
 *
 * @example   const batteryTracker = new BatteryTracker();
 *
 */
class BatteryTracker {

/**
 * This method is the constructor of the class.
 *
 * @public
 *
 * @return    {void}
 *
 * @example   const batteryTracker = new BatteryTracker();
 *
 */
  constructor() {
    this.batteryLevel = null;
    this.isCharging   = false;
    this.isSupported  = false;
    this.battery   = null;
    this.debug        = window[ appAlias ].debug ? true : false;

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
 * @example   let value = batteryTracker.get( property );
 *
 * @see BatteryTracker#set
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
 * @example   batteryTracker.set( property, value );
 *
 * @see BatteryTracker#get
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
 * @return    {Promise}  promise  Returns a promise once initialization is complete
 *
 * @example   const promise = batteryTracker.init();
 *
 */
  init() {
    if( typeof navigator.getBattery !== 'function' ) {
      this.isSupported = false;

      if( this.debug ) console.log( 'BatteryTracker: Nicht unterstützt (iOS/Safari Fallback aktiv).' );

      return Promise.resolve();
    }

    this.isSupported = true;

    return navigator.getBattery().then( ( battery ) => {
      this.battery = battery;

      this.updateBatteryData();

      this.battery.addEventListener( 'levelchange', () => this.updateBatteryData() );

      this.battery.addEventListener( 'chargingchange', () => this.updateBatteryData() );
    } ).catch( ( error ) => {
      console.error( 'BatteryTracker Fehler:', error );
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
 * @example   batteryTracker.updateBatteryData();
 *
 */
  updateBatteryData() {
    if( !this.battery ) return;

    this.batteryLevel = Math.round( this.battery.level * 100 );
    this.isCharging   = this.battery.charging;

    if( this.debug ) console.log( `BatteryTracker Update: ${this.batteryLevel}% (Laden: ${this.isCharging})` );

    return;
  }

/**
 * This Method returns the current Battery State with Battery Level and is the Battery curren charging.
 *
 * @public
 *
 * @return    {object}  batteryState  The current battery state with level, charging and supported properties
 *
 * @example   const batteryState = batteryTracker.getBatteryData();
 *
 */
  getBatteryData() {
    return {
      'level': this.batteryLevel,
      'charging': this.isCharging,
      'supported': this.isSupported
    };
  }
};
