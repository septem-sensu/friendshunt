/**
 * Communication Package for the Friends Hunt App.
 *
 * This Package represents the Communication Package for the Friends Hunt App with his Functions.
 *
 * @public
 * @module        communication.js
 * @namespace     friendshunt
 * @access        public
 * @author        Markus Götz <info@septem-sensu.de>
 * @since         2026-06-06
 * @version       0.1.0
 * @copyright     2026 Markus Götz <info@septem-sensu.de>
 *
*/
window[ appAlias ]
window[ appAlias ]                 = window[ appAlias ] || {};
window[ appAlias ].methods         = window[ appAlias ].methods || {};
window[ appAlias ].listener        = window[ appAlias ].listener || {};
window[ appAlias ].responses       = window[ appAlias ].responses || [];
window[ appAlias ].formErrors      = window[ appAlias ].formErrors || [];
window[ appAlias ].requestQueue    = window[ appAlias ].requestQueue || [];
window[ appAlias ].requestOnTheWay = window[ appAlias ].requestOnTheWay || {};
window[ appAlias ].requestErrors   = window[ appAlias ].requestErrors || [];

window[ appAlias ].debug           = false;

/**
 * This Function is a helper Function to create a Ajax Request Object.
 *
 * @function
 * @public
 * @name       newJsonRequestObject
 * @memberof   friendshunt
 * @access     public
 * @since      2026-06-06
 * @version    0.1.0
 * @param      {string}   strClass          The Server-side Class Name for the Ajax Request
 * @param      {string}   strMethode        The Server-side Method in the Class for the Ajax Request
 * @param      {string}   strId             The Server-side Id of the Object for the Ajax Request
 * @return     {object}   objRequestObject  The prepared Ajax Request Object
 * @example    objRequestObject = friendshunt.methods.newJsonRequestObject( strClass, strMethode, strId );
 *
*/
window[ appAlias ].methods.newJsonRequestObject = function( strClass, strMethode, strId ) {
  var objJsonRequestObject     = {};

  objJsonRequestObject.class   = strClass;
  objJsonRequestObject.methode = strMethode;

  if( typeof strId == 'string' && strId != '' ) objJsonRequestObject.id = strId;

  for( var strFieldname in window[ appAlias ].fields ) {
    var objField = document.querySelector( '#' + strFieldname );
    var strValue = null;

    if( objField == null ) continue;
    if( typeof window[ appAlias ].fields[ strFieldname ].element == 'string' && window[ appAlias ].fields[ strFieldname ].element == 'img' ) {
      if( typeof objField.src != 'string' || objField.src == '' ) continue;
      strValue = objField.src;
    } else {
      if( typeof objField.value == 'undefined' || objField.value == '' ) continue;
      strValue = objField.value;
    }

    objJsonRequestObject[ strFieldname ] = strValue;
  }

  return objJsonRequestObject;
};

/**
 * This Function is the base Function for a Ajax Request and start the Request Queue.
 *
 * @function
 * @public
 * @name       request
 * @memberof   friendshunt
 * @access     public
 * @since      2026-06-06
 * @version    0.1.0
 * @param      {string}   strMethode          The Server-side Method in the Class for the Ajax Request
 * @param      {object}   objGetParams        All Get Parameters for the Ajax Request
 * @param      {object}   objPostParams       All Post Parameters for the Ajax Request
 * @param      {string}   strCallback         The Callback Function by the Ajax Response to Call
 * @return     {void}
 * @example    friendshunt.methods.request( strMethode, objGetParams, objPostParams, strCallback );
 *
*/
window[ appAlias ].methods.request = function( strMethode, objGetParams, objPostParams, strCallback ) {
  var objQueueObject = { 'requestId': window[ appAlias ].methods.guid, 'requestCount': 0 };

  objQueueObject.methode    = strMethode;
  objQueueObject.getParams  = objGetParams;
  objQueueObject.postParams = objPostParams;
  objQueueObject.callback   = strCallback;

  window[ appAlias ].requestQueue.push( objQueueObject );
  window[ appAlias ].methods.manageRequestQueue();

  return;
};

/**
 * This Function controlls the Request Queue and calls the Ajax Request.
 *
 * @function
 * @public
 * @name       manageRequestQueue
 * @memberof   friendshunt
 * @access     public
 * @since      2026-06-06
 * @version    0.1.0
 * @return     {void}
 * @example    friendshunt.methods.manageRequestQueue();
 *
*/
window[ appAlias ].methods.manageRequestQueue = function() {
  if( window[ appAlias ].requestQueue.length < 1 ) return;
  if( typeof window[ appAlias ].requestOnTheWay.requestId == 'string' && window[ appAlias ].requestOnTheWay.requestId != '' ) return;

  var objRequest = window[ appAlias ].requestQueue.shift();

  window[ appAlias ].methods._request( objRequest );

  return;
};

/**
 * This Function is the Ajax Request Function. It is called by the manageRequestQueue() Function.
 *
 * @function
 * @private
 * @name       _request
 * @memberof   friendshunt
 * @access     private
 * @since      2026-06-06
 * @version    0.1.0
 * @param      {object}  objRequest  The prepared Ajax Request Object for fire to Server with all Parameters
 * @return     {void}
 * @example    friendshunt.methods._request( objRequest );
 *
*/
window[ appAlias ].methods._request = function( objRequest ) {
  var objXhr                         = new XMLHttpRequest();
  var strUrl                         = 'index.php';
  var strMethodeAjax                 = objRequest.methode == 'POSTBIN' ? 'POST' : objRequest.methode;
  var objGetParams                   = objRequest.getParams;

  window[ appAlias ].requestOnTheWay = objRequest;

  for( var strProperty in objGetParams ) {
    strUrl += strUrl.indexOf( '?' ) == -1 ? '?' : '&';
    strUrl += strProperty + '=' + encodeURIComponent( objGetParams[ strProperty ] );
  }

  objXhr.open( strMethodeAjax, strUrl, true );
  objXhr.withCredentials = true;
  if( objRequest.methode != 'POSTBIN' ) objXhr.setRequestHeader( 'Content-type', 'application/json' );

  objXhr.onreadystatechange = function() {
    if( objXhr.readyState === 4 ) {
      if( objXhr.status === 200 ) {
        window[ appAlias ].responses.push( JSON.parse( objXhr.responseText ) );

        if( window[ appAlias ].responses.length > 100 ) window[ appAlias ].responses = window[ appAlias ].responses.splice( 0, 50 );

        if( typeof objRequest.callback == 'string' && objRequest.callback != '' ) {
          window[ appAlias ].methods[ objRequest.callback ]( JSON.parse( objXhr.responseText ) );
        }

        window[ appAlias ].requestOnTheWay = {};
        window[ appAlias ].methods.manageRequestQueue();
      } else {
        if( objRequest.requestCount > 4 ) {
          var objRequestError           = { 'error': objXhr.status + ' ' + objXhr.statusText };

          objRequestError.requestObject = JSON.parse( JSON.stringify( window[ appAlias ].requestOnTheWay ) );

          window[ appAlias ].requestErrors.push( objRequestError );
          window[ appAlias ].requestOnTheWay = {};
          window[ appAlias ].methods.manageRequestQueue();
        } else {
          window[ appAlias ].requestOnTheWay.requestCount = window[ appAlias ].requestOnTheWay.requestCount + 1;
          window[ appAlias ].methods._request( window[ appAlias ].requestOnTheWay );
        }
      }
    }
  };

  if( objRequest.methode == 'GET' ) {
    objXhr.send();
  } else if( objRequest.methode == 'POSTBIN' ) {
    objXhr.send( objRequest.postParams );
  } else {
    objXhr.send( JSON.stringify( objRequest.postParams ) );
  }

  return;
};

/**
 * This Function manage the Ajax Response from the Server and procces it.
 * It will check if there is an error and call the Callback Function.
 * The Function is called after the Ajex Request is finished.
 *
 * @function
 * @public
 * @name       proccessResponse
 * @memberof   friendshunt
 * @access     public
 * @since      2026-06-06
 * @version    0.1.0
 * @param      {object}  objResponse  The Response Object from the Server
 * @return     {void}
 * @example    friendshunt.methods.proccessResponse( objResponse );
 *
*/
window[ appAlias ].methods.proccessResponse = function( objResponse ) {
  var i = 0;

  if( typeof objResponse.errors == 'object' && objResponse.errors != null && objResponse.errors.length > 0 ) {
    for ( i = 0; i < objResponse.errors; i++ ) {
      if( typeof objResponse.errors[ i ].redirect == 'string' && objResponse.errors[ i ].redirect != '' ) window[ appAlias ].methods.manageRedirects( objResponse.errors[ i ].redirect );
    }
  }

  if( typeof objResponse.result == 'object' && objResponse.result != null ) {
    if( typeof objResponse.result.formErrors == 'object' && objResponse.result.formErrors != null ) window[ appAlias ].methods.manageFormErrors( objResponse.result.formErrors );
    if( typeof objResponse.result.redirect == 'string' && objResponse.result.redirect != '' ) window[ appAlias ].methods.manageRedirects( objResponse.result.redirect );
    window[ appAlias ].methods.setFields( objResponse.result );

    if( objResponse.result.methode && objResponse.result.methode == 'gameplay' && objResponse.result.callback ) {
      if( window[ appAlias ].debug ) console.log( 'Object Ajax-Response: ', objResponse.result );
      window[ appAlias ].lastMessageId    = window[ appAlias ].lastMessageId || '';
      window[ appAlias ].gameplayState    = typeof objResponse.result.state == 'object' && objResponse.result.state != null ? objResponse.result.state : {};
      window[ appAlias ].gameplayMessages = typeof objResponse.result.messages == 'object' && objResponse.result.messages != null ? objResponse.result.messages : [];
      if( typeof objResponse.result.gameRole == 'string' ) window[ appAlias ].gameplayRole = objResponse.result.gameRole;
      window[ appAlias ].methods.gameplay[ objResponse.result.callback ]( objResponse );
    }
  }

  if( typeof objResponse.object == 'object' && objResponse.object != null ) {
    window[ appAlias ].methods.setFields( objResponse.object );
    if( typeof objResponse.object.redirect == 'string' && objResponse.object.redirect != '' ) window[ appAlias ].methods.manageRedirects( objResponse.object.redirect );
  }

  return;
};

/**
 * This Function set the Form Fields Values after the Ajax Request is done.
 *
 * @function
 * @public
 * @name       setFields
 * @memberof   friendshunt
 * @access     public
 * @since      2026-06-06
 * @version    0.1.0
 * @param      {object}  objObject  The Object with the Form Fields and his Values
 * @return     {void}
 * @todo       Manage Form Errors...
 * @example    friendshunt.methods.setFields( objObject );
 *
*/
window[ appAlias ].methods.setFields = function( objObject ) {
  if( typeof objObject != 'object' || objObject == null ) return;
  if( typeof window[ appAlias ].fields != 'object' || window[ appAlias ].fields == null ) return;

  for( var strProperty in objObject ) {
    var objHtmlObject = document.querySelector( '#' + strProperty );

    if( typeof window[ appAlias ].fields[ strProperty ] == 'undefined') continue;
    if( objHtmlObject == null ) continue;

    if( window[ appAlias ].fields[ strProperty ].element == 'img' ) {
      objHtmlObject.src = 'files/' + window[ appAlias ].class.toLowerCase() + '/' + window[ appAlias ].id + '/' + objObject[ strProperty ];
    }
  }

  return;
};

/**
 * This Function manage the Redirect after the Ajax Request is done.
 *
 * @function
 * @public
 * @name       manageRedirects
 * @memberof   friendshunt
 * @access     public
 * @since      2026-06-06
 * @version    0.1.0
 * @param      {string}  strRedirect  The Redirect Url
 * @return     {void}
 * @example    friendshunt.methods.manageRedirects( strRedirect );
 *
*/
window[ appAlias ].methods.manageRedirects = function( strRedirect ) {
  document.location = strRedirect;

  return;
};




window.addEventListener( 'load', function() {

  return;
} );

window.addEventListener( 'pageshow', function() {

  return;
} );