/**
 * The Game class manages the individual games and contains all the required properties, methods and event handlers.
 * This class requires the GeoTracker class, the GeoMaps class and inherits from the Base class.
 * The Game class registers all required event handlers when instantiating.
 *
 * @class
 *
 * @author    Markus Götz <info@septem-sensu.de>
 * @version   0.1.0
 * @since     2026-06-18
 *
 * @example   var game = new Game();
 *
 */
class Game extends Base {

/**
 * This method is the constructor of the class.
 *
 * @public
 *
 * @return    {void}
 *
 * @example   var game = new Game();
 *
 */
  constructor() {
    super();

    this.geoTracker        = new GeoTracker();
    this.geoMaps           = new GeoMaps();

    var games              = [];

    this.registerEventListener();

    return;
  }

/**
 * This method registers all event handlers that are necessary for the class.
 * The method is called when instantiating a Game object.
 * The method also calls the Super method of the Base Object.
 *
 * @public
 *
 * @return    {void}
 *
 * @example   game.registerEventHandler();
 * @example   this.registerEventHandler();
 *
 */
  registerEventListener() {
    super.registerEventHandler();

    var mapInfoLayer = document.querySelectorAll('.event-open-map-layer');

    for( var i = 0; i < mapInfoLayer.length; i++ ) {
      mapInfoLayer[ i ].addEventListener( 'click', ( event ) => {
        var mapLayer = document.querySelector( '#info-layer-map' )

        mapLayer.classList.remove( 'hidden' );

        mapLayer.style.height = ( window.innerHeight - 60 ) + 'px';

        this.geoTracker.getCurrentPosition( this.showMapInInfoLayer.bind( this ) );
        this.geoTracker.set( 'caller', event );

        return;
      } );
    }

    var mapInfoLayerCloseButton = document.querySelector( '#info-layer-map-close-button' );

    if( mapInfoLayerCloseButton != null ) {
      mapInfoLayerCloseButton.addEventListener( 'click', ( event ) => {
        this.geoMaps.get( 'map' ).off('click');
        document.querySelector( '#info-layer-map' ).classList.add( 'hidden' );

        return;
      } );
    }

    var saveNewGameButton = document.querySelector( '#event-save-new-game' );

    if( saveNewGameButton != null ) {
      saveNewGameButton.addEventListener( 'click', ( event ) => {
        var playerHtmlObjects            = document.querySelectorAll('input[name="player-id"]');
        var hunterHtmlObjects            = document.querySelectorAll('input[name="hunter-id"]');
        var managementHtmlObjects        = document.querySelectorAll('input[name="management-id"]');
        var post                         = { 'player': [], 'hunter': [], 'management': [], 'class': 'Game', 'method': 'saveNewGame' };

        post.name                        = document.querySelector('#name') != null ? document.querySelector('#name').value : null;
        post.title                       = document.querySelector('#title') != null ? document.querySelector('#title').value : null;
        post.description                 = document.querySelector('#description') != null ? document.querySelector('#description').value : null;
        post.start                       = document.querySelector('#start') != null ? Utils.stringToPhpTimestamp( document.querySelector('#start').value ) : null;
        post.duration                    = document.querySelector('#duration') != null ? document.querySelector('#duration').value : null;
        post.pingInterval                = document.querySelector('#pingInterval') != null ? document.querySelector('#pingInterval').value : null;
        post.speedPingInterval           = document.querySelector('#speedPingInterval') != null ? document.querySelector('#speedPingInterval').value : null;
        post.speedPingCount              = document.querySelector('#speedPingCount') != null ? document.querySelector('#speedPingCount').value : null;
        post.startPosition               = document.querySelector('#startPosition') != null ? document.querySelector('#startPosition').value : null;
        post.exitPosition                = document.querySelector('#exitPosition') != null ? document.querySelector('#exitPosition').value : null;
        post.trackInterval               = document.querySelector('#trackInterval') != null ? document.querySelector('#trackInterval').value : null;
        post.showPlayer                  = document.querySelector('#showPlayer') != null ? document.querySelector('#showPlayer').value : null;
        post.showNames                   = document.querySelector('#showNames') != null ? document.querySelector('#showNames').value : null;
        post.sanctionForVehicleUse       = document.querySelector('#sanctionForVehicleUse') != null ? document.querySelector('#sanctionForVehicleUse').value : null;
        post.playingFieldCenterPosition  = document.querySelector('#playingFieldCenterPosition') != null ? document.querySelector('#playingFieldCenterPosition').value : null;
        post.playingFieldSize            = document.querySelector('#playingFieldSize') != null ? document.querySelector('#playingFieldSize').value : null;

        if( playerHtmlObjects.length < 1 ) {
          this.validator.manageFormErrors( [ { 'field': '#search-player-field' } ] );

          return;
        }

        if( hunterHtmlObjects.length < 1 ) {
          this.validator.manageFormErrors( [ { 'field': '#search-hunter-field' } ] );

          return;
        }

        for( var i = 0; i < playerHtmlObjects.length; i++ ) {
          post.player.push( playerHtmlObjects[ i ].value );
        }

        for( var i = 0; i < hunterHtmlObjects.length; i++ ) {
          post.hunter.push( hunterHtmlObjects[ i ].value );
        }

        for( var i = 0; i < managementHtmlObjects.length; i++ ) {
          post.management.push( managementHtmlObjects[ i ].value );
        }

        this.communicator.request( 'POST', { "result": "json", "view": window[ appAlias ].view.alias }, post, 'proccessResponse' );

        return;
      } );
    }

    var uploadGameImagesOpenDialog = document.querySelector( '#event-game-images-upload-button' );

    if( uploadGameImagesOpenDialog != null ) {
      uploadGameImagesOpenDialog.addEventListener( 'click', ( event ) => {
        if( document.querySelector( '#game-images-upload' ) != null ) document.querySelector( '#game-images-upload' ).click();

        return;
      } );
    }

    var fileUploadButtons = document.querySelectorAll( '#game-images-upload' );

    for( var i = 0; i < fileUploadButtons.length; i++ ) {
      fileUploadButtons[ i ].addEventListener( 'change', ( event ) => {
        if( ! event.target.files[ 0 ] ) return;

        var formData = new FormData();

        formData.append( 'files', document.querySelector( '#game-images-upload' ).files[ 0 ]);
        formData.append( 'class', 'Game' );
        formData.append( 'id', window[ appAlias ].id );
        formData.append( 'property', 'tmpImageAdd' );
        formData.append( 'method', 'Game::addGameImage' );

        if( window[ appAlias ].view.alias == 'gameDashboard' ) {
          formData.append( 'redirect', '?view=gameDashboard&class=Game&id=' + window[ appAlias ].id );
        }

        this.communicator.request( 'POSTBIN', { "result": "json", "view": window[ appAlias ].view.alias }, formData, 'proccessResponse' );

        return;
      } );
    }

    var fileUploadButtons = document.querySelectorAll( '#avatar-upload' );

    for( var i = 0; i < fileUploadButtons.length; i++ ) {
      fileUploadButtons[ i ].addEventListener( 'change', ( event ) => {
        if( ! event.target.files[ 0 ] ) return;

        var formData = new FormData();

        formData.append( 'files', document.querySelector( '#avatar-upload' ).files[ 0 ] );
        formData.append( 'class', 'Game' );
        formData.append( 'id', window[ appAlias ].id );
        formData.append( 'property', 'avatar' );
        formData.append( 'method', 'Game::avatarFileUploaded' );
        formData.append( 'redirect', '?view=' + window[ appAlias ].view.alias + '&class=Game&id=' + window[ appAlias ].id );

        this.communicator.request( 'POSTBIN', { "result": "json", "view": window[ appAlias ].view.alias }, formData, 'proccessResponse' );

        return;
      } );
    }

    return;
  }

/**
 * This method shows a game's map, markers, and board in one layer.
 *
 * @public
 *
 * @param     {number}   lat         The latitude of a point on the map (starting point, exit point or center of the playing field)
 * @param     {number}   lng         The longitude of a point on the map (start point, exit point, or the center of the playing field)
 * @param     {number}   precision   The precision in meters, which indicates the accuracy of the latitude and longitude
 * @param     {object}   message     A message (not currently used)
 * @return    {void}
 *
 * @example   game.showMapInInfoLayer();
 * @example   this.showMapInInfoLayer();
 *
 */
  showMapInInfoLayer( lat, lng, precision, message ) {
    var caller            = this.geoTracker.get( 'caller' ).target;
    var markerId          = caller.id == 'startPosition' ? 'start' : 'exit';
    var strColor          = caller.id == 'startPosition' ? '#00aa00' : '#00aa00';
    var selector          = '#' + caller.id
    var selectorRadius    = '#playingFieldSize'
    var content           = caller.id == 'startPosition' ? '<span class="bold">Start Position</span>' : '<span class="bold">Exit Position</span>';
    var defaultRadius     = 1000;

    this.geoMaps.setMap( lat, lng, 'map' );

    if( caller.id == 'playingFieldCenterPosition' ) {
      this.geoMaps.setCircleInteractive( caller.id, defaultRadius, '#ff0000', 1, '#ff0000', 0.08, selector, selectorRadius );
    } else {
      this.geoMaps.setMarkerInteractive( markerId, markerId, strColor, content, selector );
    }

    return;
  }

/**
 * This method starts a game and sends all the required information to the endpoint.
 * The response returns the game settings and the game status.
 *
 * @public
 *
 * @return    {void}
 *
 * @example   game.startGame();
 * @example   this.startGame();
 *
 */
  startGame() {
    var post       = { 'class': 'Game', 'method': 'startGame', 'id': window[ appAlias ].id };

    Utils.playMessagePiep();
    Utils.triggerMessageVibration();

    this.communicator.request( 'POST', { "result": "json", "view": window[ appAlias ].view.alias }, post , 'proccessResponse' );

    return;
  }

/**
 * This method fetches the individual players from the end point and inserts them in their roles into the game dashboard in the designated places.
 *
 * @public
 *
 * @return    {void}
 *
 * @example   game.addGameplayDataToTemplate();
 * @example   this.addGameplayDataToTemplate();
 *
 */
  addGameplayDataToTemplate() {
    var members      = [ 'player', 'hunter', 'management' ];
    var gameplayData = typeof window[ appAlias ].gameplayData == 'object' && window[ appAlias ].gameplayData != null ? window[ appAlias ].gameplayData : null;

    for( var i = 0; i < members.length; i++ ) {
      for( var j = 0; j < gameplayData[ members[ i ] ].length; j++ ) {
        var contentContainer        = document.createElement( 'div' );
        var contentContainerContent = '<div class="content-container align-left">';

        contentContainerContent    += '<table class="w-100p"><tr><td class="align-top mr-15" style="width: 195px">';
        contentContainerContent    += '<img class="c-dashboard-player-image my-account-image mr-10" src="includes/files/player/' + gameplayData[ members[ i ] ][ j ].email + '/' + gameplayData[ members[ i ] ][ j ].image + '" />';
        contentContainerContent    += '</td><td class="align-top">';
        contentContainerContent    += '<p class="bold mb-10">' + gameplayData[ members[ i ] ][ j ].name + '</p>';
        contentContainerContent    += '<p><a href="mailto:' + gameplayData[ members[ i ] ][ j ].email + '">✉ ' + gameplayData[ members[ i ] ][ j ].email + '</a></p>';
        contentContainerContent    += '<p>' + gameplayData[ members[ i ] ][ j ].role.charAt(0).toUpperCase() + gameplayData[ members[ i ] ][ j ].role.slice(1); + '</p>';
        contentContainerContent    += '<p>' + gameplayData[ members[ i ] ][ j ].title + '</p>';
        contentContainerContent    += '</td></tr></table>';
        contentContainerContent    += '</div>';

        contentContainer.innerHTML  = contentContainerContent;

        document.querySelector( '#game-content-container-' + members[ i ] ).append( contentContainer );
      }
    }

    return;
  }

/**
 * This method inserts the images of a game into the designated location on the dashboard.
 *
 * @public
 *
 * @return    {void}
 *
 * @example   game.addGameImagesContent();
 * @example   this.addGameImagesContent();
 *
 */
  addGameImagesContent() {
    if( typeof window[ appAlias ].gameImages != 'object' || window[ appAlias ].gameImages == null ) return;

    var gameImages = window[ appAlias ].gameImages;

    for( var i = 0; i < gameImages.length; i++ ) {
      var imageTrash = document.createElement( 'div' );
      var imageCover = document.createElement( 'div' );
      var imageTag   = document.createElement( 'img' );

      imageTag.classList.add( 'c-dashboard-player-image' );
      imageTag.classList.add( 'game-image-gallery-image' );
      imageTag.classList.add( 'mr-5' );
      imageTag.classList.add( 'ml-5' );
      imageTag.classList.add( 'mb-6' );
      imageTag.classList.add( 'zoom-image' );
      imageTag.classList.add( 'pointer' );
      imageCover.classList.add( 'inline-block' );
      imageCover.classList.add( 'relative' );
      imageTrash.classList.add( 'delete-game-image-button' );
      imageTrash.setAttribute( 'data-image-id', gameImages[ i ] );

      imageTrash.addEventListener( 'click', ( event ) => {
        var post      = { 'class': 'Game', 'method': 'deleteGameImage', 'class': 'Game', 'id': window[ appAlias ].id };

        post.imageId  = event.target.getAttribute( 'data-image-id' );

        this.communicator.request( 'POST', { "result": "json", "view": window[ appAlias ].view.alias }, post, 'proccessResponse' );

        return;
      } );

      imageTag.addEventListener( 'click', ( event ) => {
        document.querySelector('.full-image-layer').style.display = 'block';
        document.querySelector('.full-image').style.display       = 'block';

        var tagImage = '<img src="' + event.target.src + '" />';

        document.querySelector('.full-image').innerHTML = tagImage;

        return;
      } );

      if( typeof window[ appAlias ].systemRole != 'string' || window[ appAlias ].systemRole != 'administrator' ) imageTrash.classList.add( 'hidden' );

      imageTag.src         = 'includes/files/game/' + window[ appAlias ].id + '/' + gameImages[ i ];
      imageTrash.innerHTML = '<img src="includes/images/icon-trash.png" alt="Löschbutton" />'

      imageCover.append( imageTag );
      imageCover.append( imageTrash );
      document.querySelector( '#game-images-content-container' ).append( imageCover );
    }

    return;
  }

/**
 * This method fires a request to the endpoint to get the data of the archived games.
 * The response of this method is passed from the Communictor object to the proccessResponseGameArchiveList.
 *
 * @public
 *
 * @return    {void}
 *
 * @example   game.getGameArchiveList();
 * @example   this.getGameArchiveList();
 *
 */
  getGameArchiveList() {
    var post = { 'class': 'Player', 'id': window[ appAlias ].id, 'method': 'getGameArchiveList', 'callbackMethod': 'cProccessResponseGameArchiveList' };

    this.communicator.request( 'POST', { "result": "json", "view": window[ appAlias ].view.alias }, post, this.proccessResponseGameArchiveList.bind( this ) );

    return;
  }

/**
 * This method prepares the response information from the getGameArchiveList request and
 * Adds the archived games to the archive list at the designated location.
 *
 * @public
 *
 * @param     {object}   response     The response object from the endpoint
 * @return    {void}
 *
 * @example   game.proccessResponseGameArchiveList( response );
 * @example   this.proccessResponseGameArchiveList( response );
 *
 */
  proccessResponseGameArchiveList( response ) {
    var archiveGames = response.result.archiveGames;

    for (var gameId in archiveGames ) {
      var contentContainer        = document.createElement( 'div' );
      var contentContainerContent = '<div class="content-container align-left">';

      contentContainerContent    += '<table class="w-100p"><tr><td class="align-top mr-15" style="width: 195px">';
      contentContainerContent    += '<img class="c-dashboard-player-image my-account-image mr-10" src="includes/files/game/archive/' + gameId + '/' + archiveGames[ gameId ].avatar + '" />';
      contentContainerContent    += '</td><td class="align-top">';
      contentContainerContent    += '<p class="bold mb-10">' + archiveGames[ gameId ].name + '</p>';
      contentContainerContent    += '<p>' + archiveGames[ gameId ].title + '</p>';
      contentContainerContent    += '<p class="bold mt-5 mb-5">Start: ' + Utils.timestampPhpToString( archiveGames[ gameId ].start ) + '</p>';
      contentContainerContent    += '<p>Dauer: ' + archiveGames[ gameId ].duration + ' Stunden</p>';
      contentContainerContent    += '<p><button data-game-id="' + gameId + '" onclick="javascript: window[ appAlias ].objects.game.bringBackArchiveGame( this );" type="button" class="w-160 mt-10 primary">Zurück holen</button></p>';
      contentContainerContent    += '<p><button data-game-id="' + gameId + '" onclick="javascript: window[ appAlias ].objects.game.deleteArchiveGame( this );" type="button" class="w-160 mt-4 danger">Löschen</button></p>';
      contentContainerContent    += '</td></tr></table>';
      contentContainerContent    += '</div>';

      contentContainer.innerHTML  = contentContainerContent;
      document.querySelector( '#content-container-game-archive' ).append( contentContainer );
    }

    return;
  }

/**
 * This method fires a request to the endpoint via the Communicator object to bring an archived game back to the dashboard.
 *
 * @public
 *
 * @param     {object}  element  The element (button) that was clicked to find out the game ID
 * @return    {void}
 *
 * @example   game.bringBackArchiveGame( element );
 * @example   this.bringBackArchiveGame( element);
 *
 */
  bringBackArchiveGame( element ) {
    var post    = { 'class': 'Player', 'id': window[ appAlias ].id, 'method': 'backFromArchiveGame' };

    post.gameId = element.getAttribute( 'data-game-id' );

    this.communicator.request( 'POST', { "result": "json", "view": window[ appAlias ].view.alias }, post, 'proccessResponse' );

    return;
  }

/**
 * This method creates a Request object and fires it via the Communicator object to the endpoint for a game
 * which is in the archive to be deleted.
 *
 * @public
 *
 * @param     {object}  element  The element (button) that was clicked to find out the game ID
 * @return    {void}
 *
 * @example   game.deleteArchiveGame( element );
 * @example   this.deleteArchiveGame( element );
 *
 */
  deleteArchiveGame( element ) {
    var post    = { 'class': 'Player', 'id': window[ appAlias ].id, 'method': 'deleteArchiveGame' };

    post.gameId = element.getAttribute( 'data-game-id' );

    this.communicator.request( 'POST', { "result": "json", "view": window[ appAlias ].view.alias }, post, 'proccessResponse' );

    return;
  }

}