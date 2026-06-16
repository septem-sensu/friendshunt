/**
 * Core Package for the Friends Hunt App.
 *
 * This Package represents the Core Package for the Friends Hunt App with his Core Functions.
 *
 * @public
 * @module        core.js
 * @namespace     friendshunt
 * @access        public
 * @author        Markus Götz <info@septem-sensu.de>
 * @since         2026-06-06
 * @version       0.1.0
 * @copyright     2026 Markus Götz <info@septem-sensu.de>
 *
*/
window[ appAlias ]                  = window[ appAlias ] || {};
window[ appAlias ].methods          = window[ appAlias ].methods || {};

/**
 * This Function convert a Date Time String to a PHP Timestamp.
 *
 * @function
 * @public
 * @name       stringToPhpTimestamp
 * @memberof   friendshunt
 * @access     public
 * @since      2026-06-06
 * @version    0.1.0
 *
 * @param      {string}   strDateTime   The Date Time String
 * @return     {number}   intTimestamp  The PHP Timestamp
 *
 * @example    var intTimestamp = window[ appAlias ].methods.stringToPhpTimestamp( strDateTime );
 *
*/
window[ appAlias ].methods.stringToPhpTimestamp = function( strDateTime ) {
  const objDateTime = new Date( strDateTime );

  return Math.floor( objDateTime.getTime() / 1000 );
};

/**
 * This Function convert a Date Time String to a JavaScript Timestamp.
 *
 * @function
 * @public
 * @name       stringToJsTimestamp
 * @memberof   friendshunt
 * @access     public
 * @since      2026-06-06
 * @version    0.1.0
 *
 * @param      {string}   strDateTime   The Date Time String
 * @return     {number}   intTimestamp  The PHP Timestamp
 *
 * @example    var intTimestamp = window[ appAlias ].methods.stringToJsTimestamp( strDateTime );
 *
*/
window[ appAlias ].methods.stringToJsTimestamp = function( strDateTime ) {
  const objDateTime = new Date( strDateTime );

  return objDateTime.getTime();
};

/**
 * This Function convert a PHP Timestamp in a human readable Format.
 *
 * @function
 * @public
 * @name       timestampPhpToString
 * @memberof   friendshunt
 * @access     public
 * @since      2026-06-06
 * @version    0.1.0
 *
 * @param      {number}   intTimestamp   The PHP Timestamp
 * @param      {bool}     boolSeconds    If true show the Seconds
 * @param      {string}   strFormat      The output Format ( date: only the Date, time: only the Time, datetime: Date and Time)
 * @return     {string}   strDateTime    The Date Time String
 *
 * @example    var strDateTime = window[ appAlias ].methods.timestampPhpToString( intTimestamp, boolSeconds, strFormat );
 *
*/
window[ appAlias ].methods.timestampPhpToString = function( intTimestamp, boolSeconds, strFormat ) {
  return window[ appAlias ].methods.timestampJsToString( intTimestamp * 1000, boolSeconds, strFormat  )
};

/**
 * This Function convert a JavaScript Timestamp in a human readable Format.
 *
 * @function
 * @public
 * @name       timestampJsToString
 * @memberof   friendshunt
 * @access     public
 * @since      2026-06-06
 * @version    0.1.0
 *
 * @param      {number}   intTimestamp   The JavaScript Timestamp
 * @param      {bool}     boolSeconds    If true show the Seconds
 * @param      {string}   strFormat      The output Format ( date: only the Date, time: only the Time, datetime: Date and Time)
 * @return     {string}   strDateTime    The Date Time String
 *
 * @example    var strDateTime = window[ appAlias ].methods.timestampJsToString( intTimestamp, boolSeconds, strFormat );
 *
*/
window[ appAlias ].methods.timestampJsToString = function( intTimestamp, boolSeconds, strFormat ) {
  const objDateTime = new Date( intTimestamp );
  const pad         = (num) => String( num ).padStart( 2, '0' );
  var strDate       = pad( objDateTime.getDate() ) + '.' + pad( objDateTime.getMonth() + 1 ) + '.' + objDateTime.getFullYear();
  var strTime       = pad( objDateTime.getHours() ) + ':' + pad( objDateTime.getMinutes() );

  strTime           = boolSeconds ? strTime + ':' + pad( objDateTime.getSeconds() ) : strTime;

  if( strFormat == 'date' ) {
    return strDate;
  } else if( strFormat == 'time' ) {
    return strTime
  }

  return strDate + ' ' + strTime;
};
