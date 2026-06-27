/**
 * This communication class for the app. All requests go through this class.
 * The class contains all required properties and methods.
 * The class requires the Validator class.
 *
 * @class
 *
 * @see Validator
 *
 * @author    Markus Götz <info@septem-sensu.de>
 * @version   0.1.0
 * @since     2026-06-18
 *
 * @example   const communicator = new Communicator();
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
 * @example   const communicator = new Communicator();
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
    this.debug              = window[ appAlias ].debug ? true : false;

    this.isOnline           = navigator.onLine;
    this.offlineDbName      = 'trackingQueue';
    this.offlineStoreName   = window[ appAlias ].objects.configuration.cookieName + '_offline';
    this.offlineDb          = null;

    this.init();

    return;
  }

/**
 * This method initializes the Communicator class and registers the necessary event handlers,
 * among other things, the online status for processing the offline queue.
 *
 * @public
 *
 * @return    {void}
 *
 * @example   communicator.init();
 *
 */
  init() {
    window.addEventListener( 'online', () => {
      this.isOnline = true;
      this.flushOfflineQueue();
    } );

    window.addEventListener( 'offline', () => {
      this.isOnline = false;
    } );

    if( this.isOnline ) this.flushOfflineQueue();

    return;
  }

/**
 * This method is the default getter of the class and the derived class.
 *
 * @public
 *
 * @param     {string}   property   The property of the value
 * @return    {*}        value      The value of the property
 *
 * @example   let value = communicator.get( 'maxRequestCount' );
 *
 * @see Communicator#set
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
 * @param     {*}        value      The value you want to set to the property
 * @return    {void}
 *
 * @example   communicator.set( 'property', 5 );
 *
 * @see Communicator#get
 *
 */
  set( property, value ) {
    this[ property ] = value;

    return;
  }

/**
 * This method returns a request object for the Communicator to which you can attach further data.
 *
 * @public
 *
 * @param     {string}   className      The class name of the object
 * @param     {string}   method         The method to be executed on the server
 * @param     {string}   id             The ID of the object on which the method should be executed
 * @return    {object}   requestObject  The finished request object for the communicator
 *
 * @example   const requestObject = communicator.newJsonRequestObject( 'Player', 'deletePlayer', 'max@musterman.de' );
 *
 */
  newJsonRequestObject( className, method, id ) {
    const jsonRequestObject     = {};

    jsonRequestObject.class  = className;
    jsonRequestObject.method = method;

    if( typeof id === 'string' && id !== '' ) jsonRequestObject.id = id;

    for( const fieldname in window[ appAlias ].objects.fields ) {
      const field = document.querySelector( '#' + fieldname );
      let value   = null;

      if( field == null ) continue;

      if( typeof window[ appAlias ].objects.fields[ fieldname ].element === 'string' && window[ appAlias ].objects.fields[ fieldname ].element === 'img' ) {
        if( typeof field.src !== 'string' || field.src === '' ) continue;

        value = field.src;
      } else {
        if( typeof field.value === 'undefined' || field.value === '' ) continue;

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
 *
 */
  manageRequestQueue() {
    if( this.requestQueue.length < 1 ) return;
    if( typeof this.requestOnTheWay.requestId === 'string' && this.requestOnTheWay.requestId !== '' ) return;

    const request = this.requestQueue.shift();

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
 * @param     {boolean}   offlineRequest   Whether this request comes from the offline queue
 * @param     {number}    offlineDbEntryId The ID of the entry in the offline database
 * @return    {void}
 *
 * @example   communicator.request( 'POST', {}, {}, ref.function );
 *
 */
  request( method, getParams, postParams, callbackMethod, offlineRequest, offlineDbEntryId ) {
    const queueObject = { 'requestId': Utils.guid(), 'requestCount': 0 };

    queueObject.method           = method;
    queueObject.getParams        = getParams;
    queueObject.postParams       = postParams;
    queueObject.callbackMethod   = callbackMethod;
    queueObject.offlineRequest   = offlineRequest ? true : false;
    queueObject.offlineDbEntryId = offlineDbEntryId ? offlineDbEntryId : null;

    this.requestQueue.push( queueObject );
    this.manageRequestQueue();

    return;
  }

/**
 * This method executes the actual Xhr request.
 * All the necessary parameters are in the request object.
 * The response of this method is passed to the processResponse method.
 *
 * @private
 *
 * @param     {object}  request  The request object with all the required information
 * @return    {void}
 *
 * @example   communicator._request( request );
 *
 */
  _request( request ) {
    const xhr            = new XMLHttpRequest();
    const methodAjax     = request.method === 'POSTBIN' ? 'POST' : request.method;
    const getParams      = request.getParams;
    let url              = 'index.php';

    this.requestOnTheWay = request;

    for( const property in getParams ) {
      url += url.indexOf( '?' ) === -1 ? '?' : '&';
      url += property + '=' + encodeURIComponent( getParams[ property ] );
    }

    xhr.open( methodAjax, url, true );
    xhr.withCredentials = true;

    if( request.method !== 'POSTBIN' ) xhr.setRequestHeader( 'Content-type', 'application/json' );

    xhr.onreadystatechange = () => {
      if( xhr.readyState === 4 ) {
        if( xhr.status === 200 ) {
          this.responses.push( JSON.parse( xhr.responseText ) );

          if( this.responses.length > this.maxResponsesLength ) this.responses = this.responses.splice( 0, 10 );

          if( request.offlineDbEntryId ) this.removeFromOfflineDb( request.offlineDbEntryId );

          this.processResponse( request, JSON.parse( xhr.responseText ) );

          this.requestOnTheWay = {};
          this.manageRequestQueue();
        } else {
          if( request.requestCount > this.maxRequestCount ) {
            if( typeof request.postParams === 'object' && request.postParams !== null && request.postParams.gameplayMethod === 'track' && ! request.offlineRequest ) {
              this.addToOfflineDb( this.requestOnTheWay ).catch( ( error ) => {
                if( this.debug ) console.log( 'OfflineQueue add error: ', error );
              } );
            } else {
              if( request.offlineDbEntryId ) this.removeFromOfflineDb( request.offlineDbEntryId );

              const requestError           = { 'error': xhr.status + ' ' + xhr.statusText };

              requestError.requestObject = JSON.parse( JSON.stringify( this.requestOnTheWay ) );

              this.requestErrors.push( requestError );
            }

            this.requestOnTheWay = {};
            this.manageRequestQueue();
          } else {
            this.requestOnTheWay.requestCount += 1;
            this._request( this.requestOnTheWay );
          }
        }
      }
    };

    if( request.method === 'GET' ) {
      xhr.send();
    } else if( request.method === 'POSTBIN' ) {
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
 * @example   communicator.processResponse( request, response );
 *
 */
  processResponse( request, response ) {
    if( typeof response.errors == 'object' && response.errors != null && response.errors.length > 0 ) {
      for( let i = 0; i < response.errors; i++ ) {
        if( typeof response.errors[ i ].redirect === 'string' && response.errors[ i ].redirect !== '' ) this.manageRedirects( response.errors[ i ].redirect );
      }
    }

    if( typeof response.result === 'object' && response.result != null ) {
      if( typeof response.result.formErrors === 'object' && response.result.formErrors != null ) this.validator.manageFormErrors( response.result.formErrors );
      if( typeof response.result.redirect === 'string' && response.result.redirect !== '' ) this.manageRedirects( response.result.redirect );

      this.setFields( response.result );

      if( response.result.method && response.result.method === 'gameplay' && response.result.callback ) {
        if( this.debug ) console.log( 'Object Ajax-Response: ', response.result );

        if( typeof response.result.gameRole === 'string' ) window[ appAlias ].gameplayRole = response.result.gameRole;
      }
    }

    if( typeof response.object === 'object' && response.object != null ) {
      this.setFields( response.object );
      if( typeof response.object.redirect === 'string' && response.object.redirect !== '' ) this.manageRedirects( response.object.redirect );
    }

    if( typeof request.callbackMethod === 'function' ) request.callbackMethod( response );

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
 *
 */
  setFields( object ) {
    if( typeof object !== 'object' || object == null ) return;
    if( typeof window[ appAlias ].objects.fields !== 'object' || window[ appAlias ].objects.fields == null ) return;

    for( const property in object ) {
      const htmlObject = document.querySelector( '#' + property );

      if( typeof window[ appAlias ].objects.fields[ property ] === 'undefined' ) continue;
      if( htmlObject == null ) continue;

      if( window[ appAlias ].objects.fields[ property ].element === 'img' ) {
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
 *
 */
  manageRedirects( redirect ) {
    document.location = redirect;

    return;
  }

/**
 * This method flushes all queued offline tracking data to the server.
 * The requests are sent as fire-and-forget (the response is not processed)
 * so that the map is not updated with old positions.
 *
 * @public
 *
 * @return    {void}
 *
 * @example   communicator.flushOfflineQueue();
 *
 */
  flushOfflineQueue() {
    this.getAllFromOfflineDb().then( ( entries ) => {
      if( entries.length < 1 ) return;

      for( let i = 0; i < entries.length; i++ ) {
        entries[ i ].postParams.offlineRequest = true;
        this.request( 'POST', entries[ i ].getParams, entries[ i ].postParams, '', true, entries[ i ].id );
      }
    } ).catch( ( error ) => {
      if( this.debug ) console.log( 'OfflineQueue flush error: ', error );
    } );

    return;
  }

/**
 * This method opens the IndexedDB connection.
 * If the database does not exist, it is created with the required object store and index.
 *
 * @public
 *
 * @return    {Promise}  promise  A Promise that resolves with the IDBDatabase instance
 *
 * @example   communicator.openOfflineDb().then( ( db ) => { ... } );
 *
 */
  openOfflineDb() {
    return new Promise( ( resolve, reject ) => {
      if( this.offlineDb ) { resolve( this.offlineDb ); return; }

      const request = indexedDB.open( this.offlineDbName, 1 );

      request.onupgradeneeded = ( event ) => {
        const db    = event.target.result;
        const store = db.createObjectStore( this.offlineStoreName, { keyPath: 'id', autoIncrement: true } );

        store.createIndex( 'timestamp', 'postParams.timestamp', { unique: false } );
      };

      request.onsuccess = ( event ) => {
        this.offlineDb = event.target.result;
        resolve( this.offlineDb );
      };

      request.onerror = ( event ) => {
        reject( event.target.error );
      };
    } );
  }

/**
 * This method adds a failed request to the offline queue.
 *
 * @public
 *
 * @param     {object}   requestObject  The request object containing getParams and postParams
 * @return    {Promise}  promise        A Promise that resolves when the entry has been added
 *
 * @example   communicator.addToOfflineDb( requestObject );
 *
 */
  addToOfflineDb( requestObject ) {
    return new Promise( ( resolve, reject ) => {
      this.openOfflineDb().then( ( db ) => {
        const transaction = db.transaction( this.offlineStoreName, 'readwrite' );
        const store       = transaction.objectStore( this.offlineStoreName );
        const entry       = {
          getParams:  requestObject.getParams,
          postParams: requestObject.postParams,
          queuedAt:   Date.now()
        };

        const request = store.add( entry );

        request.onsuccess = () => { resolve(); };
        request.onerror   = ( event ) => { reject( event.target.error ); };
      } ).catch( ( error ) => { reject( error ); } );
    } );
  }

/**
 * This method retrieves all entries from the offline queue, sorted by client timestamp (oldest first).
 *
 * @public
 *
 * @return    {Promise}  promise  A Promise that resolves with an array of queued entries
 *
 * @example   communicator.getAllFromOfflineDb().then( ( entries ) => { ... } );
 *
 */
  getAllFromOfflineDb() {
    return new Promise( ( resolve, reject ) => {
      this.openOfflineDb().then( ( db ) => {
        const transaction = db.transaction( this.offlineStoreName, 'readonly' );
        const store       = transaction.objectStore( this.offlineStoreName );
        const index       = store.index( 'timestamp' );
        const request     = index.getAll();

        request.onsuccess = () => { resolve( request.result ); };
        request.onerror   = ( event ) => { reject( event.target.error ); };
      } ).catch( ( error ) => { reject( error ); } );
    } );
  }

/**
 * This method removes an entry from the offline queue by its ID.
 *
 * @public
 *
 * @param     {number}   id       The ID of the entry to remove
 * @return    {Promise}  promise  A Promise that resolves when the entry has been removed
 *
 * @example   communicator.removeFromOfflineDb( 1 );
 *
 */
  removeFromOfflineDb( id ) {
    return new Promise( ( resolve, reject ) => {
      this.openOfflineDb().then( ( db ) => {
        const transaction = db.transaction( this.offlineStoreName, 'readwrite' );
        const store       = transaction.objectStore( this.offlineStoreName );
        const request     = store.delete( id );

        request.onsuccess = () => { resolve(); };
        request.onerror   = ( event ) => { reject( event.target.error ); };
      } ).catch( ( error ) => { reject( error ); } );
    } );
  }

/**
 * This method returns the number of entries currently in the offline queue.
 *
 * @public
 *
 * @return    {Promise<number>}  promise  A Promise that resolves with the count of entries
 *
 * @example   communicator.getCountFromOfflineDb().then( ( count ) => { ... } );
 *
 */
  getCountFromOfflineDb() {
    return new Promise( ( resolve, reject ) => {
      this.openOfflineDb().then( ( db ) => {
        const transaction = db.transaction( this.offlineStoreName, 'readonly' );
        const store       = transaction.objectStore( this.offlineStoreName );
        const request     = store.count();

        request.onsuccess = () => { resolve( request.result ); };
        request.onerror   = ( event ) => { reject( event.target.error ); };
      } ).catch( () => { resolve( 0 ); } );
    } );
  }


}