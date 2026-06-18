/**
 * This communication class for the app. All requests go through this class.
 * The class contains all required properties and methods.
 * The class requires the Validator class.
 *
 * @class
 *
 * @author    Markus Götz <info@septem-sensu.de>
 * @version   0.1.0
 * @since     2026-06-18
 *
 * @example   var communicator = new Communicator();
 *
 */
class Communicator {

/**
 * This method is the constructor of the class.
 *
 * @public
 *
 * @return    {void}
 *
 * @example   var communicator = new Communicator();
 *
 */
  constructor() {
    this.validator          = new Validator();
    this.url                = 'index.php';
    this.requestOnTheWay    = {};
    this.responses          = [];
    this.requestErrors      = [];
    this.requestQueue       = [];
    this.maxResponsesLength = 20;
    this.maxRequestCount    = 4;

    return;
  }

/**
 * This method is the default getter of the class and the derived class.
 *
 * @public
 *
 * @param     {string}   property   The property of the value
 * @return    {mixed}    value      The value of the property
 *
 * @example   var value = communicator.get( 'maxRequestCount' );
 * @example   var value = this.get( property );
 *
 */
  get( property ) {
    return this[ property ];
  }

/**
 * This method is the default setter for the class and the derived classes.
 *
 * @public
 *
 * @param     {string}   property   The property that you want to set
 * @param     {mixed}    value      The value you want to set to the property
 * @return    {void}
 *
 * @example   communicator.set( 'property', 5 );
 * @example   this.set( property, value );
 *
 */
  set( property, value ) {
    this[ property ] = value;

    return;
  }

/**
 * This method returns a request object for the Commicator to which you can attach further data.
 *
 * @public
 *
 * @param     {string}   className      The class name of the object
 * @param     {string}   method         The method to be executed on the server
 * @param     {string}   id             The ID of the object on which the method should be executed
 * @return    {object}   requestObject  The finished request object for the communicator
 *
 * @example   var requestObject = communicator.newJsonRequestObject( 'Player', 'deletePlayer', 'max@musterman.de' );
 * @example   var requestObject = this.newJsonRequestObject( className, method, id );
 *
 */
  newJsonRequestObject( className, method, id ) {
    var jsonRequestObject     = {};

    jsonRequestObject.class  = className;
    jsonRequestObject.method = method;

    if( typeof id == 'string' && id != '' ) jsonRequestObject.id = id;

    for( var fieldname in window[ appAlias ].fields ) {
      var field = document.querySelector( '#' + fieldname );
      var value = null;

      if( field == null ) continue;
      if( typeof window[ appAlias ].fields[ fieldname ].element == 'string' && window[ appAlias ].fields[ fieldname ].element == 'img' ) {
        if( typeof field.src != 'string' || field.src == '' ) continue;
        value = field.src;
      } else {
        if( typeof field.value == 'undefined' || field.value == '' ) continue;
        value = field.value;
      }

      jsonRequestObject[ fieldname ] = value;
    }

    return jsonRequestObject;
  }

/**
 * This method controls the request queue.
 * The method passes the request objects one after the other to the _request method until a current request has been processed.
 *
 * @public
 *
 * @return    {void}
 *
 * @example   communicator.manageRequestQueue();
 * @example   this.manageRequestQueue();
 *
 */
  manageRequestQueue() {
    if( this.requestQueue.length < 1 ) return;
    if( typeof this.requestOnTheWay.requestId == 'string' && this.requestOnTheWay.requestId != '' ) return;

    var request = this.requestQueue.shift();

    this._request( request );

    return;
  }

/**
 * This method receives the request objects, prepares them and pushes them into the request queue.
 *
 * @public
 *
 * @param     {string}    method           The method in which the data should be sent to the endpoint
 * @param     {object}    getParams        All parameters that should be appended to the Url as Url parameters
 * @param     {object}    postParams       All parameters that should be sent as post parameters (the request object)
 * @param     {function}  callbackMethod   The callback method to which the response data should be passed
 * @return    {void}
 *
 * @example   communicator.request( 'POST', {}, {}, ref.function );
 * @example   this.request( 'method', getParams, postParams, callbackMethod );
 *
 */
  request( method, getParams, postParams, callbackMethod ) {
    var queueObject = { 'requestId': Utils.guid(), 'requestCount': 0 };

    queueObject.method         = method;
    queueObject.getParams      = getParams;
    queueObject.postParams     = postParams;
    queueObject.callbackMethod = callbackMethod;

    this.requestQueue.push( queueObject );
    this.manageRequestQueue();

    return;
  }

/**
 * This method executes the actual Xhr request.
 * All the necessary parameters are in the request object.
 * The response of this method is passed to the processResponse method.
 *
 * @public
 *
 * @param     {object}  request  The request object with all the required information
 * @return    {void}
 *
 * @example   communicator._request( request );
 * @example   this._request( request );
 *
 */
  _request( request ) {
    var xhr              = new XMLHttpRequest();
    var url              = 'index.php';
    var methodAjax      = request.method == 'POSTBIN' ? 'POST' : request.method;
    var getParams        = request.getParams;

    this.requestOnTheWay = request;

    for( var property in getParams ) {
      url += url.indexOf( '?' ) == -1 ? '?' : '&';
      url += property + '=' + encodeURIComponent( getParams[ property ] );
    }

    xhr.open( methodAjax, url, true );
    xhr.withCredentials = true;
    if( request.method != 'POSTBIN' ) xhr.setRequestHeader( 'Content-type', 'application/json' );

    xhr.onreadystatechange = () => {
      if( xhr.readyState === 4 ) {
        if( xhr.status === 200 ) {
          this.responses.push( JSON.parse( xhr.responseText ) );

          if( this.responses.length > this.maxResponsesLength ) this.responses = this.responses.splice( 0, 10 );

          this.proccessResponse( request, JSON.parse( xhr.responseText ) );

          this.requestOnTheWay = {};
          this.manageRequestQueue();
        } else {
          if( request.requestCount > this.maxRequestCount ) {
            var requestError           = { 'error': xhr.status + ' ' + xhr.statusText };

            requestError.requestObject = JSON.parse( JSON.stringify( this.requestOnTheWay ) );

            this.requestErrors.push( requestError );
            this.requestOnTheWay = {};
            this.manageRequestQueue();
          } else {
            this.requestOnTheWay.requestCount += 1;
            this._request( this.requestOnTheWay );
          }
        }
      }
    };

    if( request.method == 'GET' ) {
      xhr.send();
    } else if( request.method == 'POSTBIN' ) {
      xhr.send( request.postParams );
    } else {
      xhr.send( JSON.stringify( request.postParams ) );
    }

    return;
  }

/**
 * This method takes the response from the request, checks for errors, and forwards it to a redirect if desired
 * and passes the response information to the callback method.
 *
 * @public
 *
 * @param     {object}  request   The request object that was sent to the endpoint
 * @param     {object}  response  The response object that came back from the endpoint and is passed on to the callback method
 * @return    {void}
 *
 * @example   communicator.proccessResponse( request, response );
 * @example   this.proccessResponse( request, response );
 *
 */
  proccessResponse( request, response ) {
    if( typeof response.errors == 'object' && response.errors != null && response.errors.length > 0 ) {
      for( var i = 0; i < response.errors; i++ ) {
        if( typeof response.errors[ i ].redirect == 'string' && response.errors[ i ].redirect != '' ) this.manageRedirects( response.errors[ i ].redirect );
      }
    }

    if( typeof response.result == 'object' && response.result != null ) {
      if( typeof response.result.formErrors == 'object' && response.result.formErrors != null ) this.validator.manageFormErrors( response.result.formErrors );
      if( typeof response.result.redirect == 'string' && response.result.redirect != '' ) this.manageRedirects( response.result.redirect );

      this.setFields( response.result );

      if( response.result.method && response.result.method == 'gameplay' && response.result.callback ) {
        if(this.debug ) console.log( 'Object Ajax-Response: ', response.result );
        window[ appAlias ].lastMessageId    = window[ appAlias ].lastMessageId || '';
        window[ appAlias ].gameplayState    = typeof response.result.state == 'object' && response.result.state != null ? response.result.state : {};
        window[ appAlias ].gameplayMessages = typeof response.result.messages == 'object' && response.result.messages != null ? response.result.messages : [];
        if( typeof response.result.gameRole == 'string' ) window[ appAlias ].gameplayRole = response.result.gameRole;
      }
    }

    if( typeof response.object == 'object' && response.object != null ) {
      this.setFields( response.object );
      if( typeof response.object.redirect == 'string' && response.object.redirect != '' ) this.manageRedirects( response.object.redirect );
    }

    if( typeof request.callbackMethod == 'function' ) {
      request.callbackMethod( response );
    } else if( typeof request.callbackMethod == 'string' && request.callbackMethod != '' ) {
      //window[ appAlias ].methods[ request.callbackMethod ]( JSON.parse( xhr.responseText ) );
    }

    return;
  }

/**
 * The response object contains an object that is compatible with the currently accessed page
 * these input Html fields are set from the object.
 *
 * @public
 *
 * @param     {object}  object  The object from the response from the endpoint
 * @return    {void}
 *
 * @example   communicator.setFields( object );
 * @example   this.setFields( object );
 *
 */
  setFields( object ) {
    if( typeof object != 'object' || object == null ) return;
    if( typeof window[ appAlias ].fields != 'object' || window[ appAlias ].fields == null ) return;

    for( var property in object ) {
      var htmlObject = document.querySelector( '#' + property );

      if( typeof window[ appAlias ].fields[ property ] == 'undefined') continue;
      if( htmlObject == null ) continue;

      if( window[ appAlias ].fields[ property ].element == 'img' ) {
        htmlObject.src = 'files/' + window[ appAlias ].class.toLowerCase() + '/' + window[ appAlias ].id + '/' + object[ property ];
      }
    }

    return;
  }

/**
 * This method redirects to a redirect url if desired
 *
 * @public
 *
 * @param     {string}  redirect  The Redirect Url
 * @return    {void}
 *
 * @example   communicator.manageRedirects( '?view=Game' );
 * @example   this.manageRedirects( redirect );
 *
 */
  manageRedirects( redirect ) {
    document.location = redirect;

    return;
  };

}