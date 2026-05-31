window[ appAlias ]                 = window[ appAlias ] || {};
window[ appAlias ].methods         = window[ appAlias ].methods || {};
window[ appAlias ].listener        = window[ appAlias ].listener || {};
window[ appAlias ].responses       = window[ appAlias ].responses || [];
window[ appAlias ].formErrors      = window[ appAlias ].formErrors || [];
window[ appAlias ].requestQueue    = window[ appAlias ].requestQueue || [];
window[ appAlias ].requestOnTheWay = window[ appAlias ].requestOnTheWay || {};
window[ appAlias ].requestErrors   = window[ appAlias ].requestErrors || [];

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

window[ appAlias ].methods.manageRequestQueue = function() {
  if( window[ appAlias ].requestQueue.length < 1 ) return;
  if( typeof window[ appAlias ].requestOnTheWay.requestId == 'string' && window[ appAlias ].requestOnTheWay.requestId != '' ) return;

  var objRequest = window[ appAlias ].requestQueue.shift();

  window[ appAlias ].methods._request( objRequest );

  return;
};

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

window[ appAlias ].methods.proccessResponse = function( objResponse ) {
  var i = 0;

  if( typeof objResponse.result != 'object' || objResponse.result == null ) return;
  if( typeof objResponse.result.errors == 'object' && objResponse.result.errors != null && objResponse.result.errors.length > 0 ) {
    for ( i = 0; i < objResponse.result.errors; i++ ) {
      if( typeof objResponse.result.errors[ i ].redirect == 'string' && objResponse.result.errors[ i ].redirect != '' ) window[ appAlias ].methods.manageRedirects( objResponse.result.errors[ i ].redirect );
    }
  }

  if( typeof objResponse.result.methods == 'object' && objResponse.result.methods != null ) {
    for ( i = 0; i < objResponse.result.methods.length; i++ ) {
      if( typeof objResponse.result.methods[ i ].formErrors == 'object' && objResponse.result.methods[ i ].formErrors != null ) window[ appAlias ].methods.manageFormErrors( objResponse.result.methods[ i ].formErrors );
      if( typeof objResponse.result.methods[ i ].redirect == 'string' && objResponse.result.methods[ i ].redirect != '' ) window[ appAlias ].methods.manageRedirects( objResponse.result.methods[ i ].redirect ); 
      window[ appAlias ].methods.setFields( objResponse.result.methods[ i ] );
    }
  }

  if( typeof objResponse.result.object == 'object' && objResponse.result.object != null ) {
    window[ appAlias ].methods.setFields( objResponse.result.object );
  }  

  return;
};

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

window[ appAlias ].methods.manageRedirects = function( strRedirect ) {
  document.location = strRedirect;

  return;
};
/*
window[ appAlias ].methods.fileExists = function( strUrl ) {
  var objXhr = new XMLHttpRequest();

  return;
};
*/
window.addEventListener( 'load', function() {

  return;
} );

window.addEventListener( 'pageshow', function() {

  return;
} );  