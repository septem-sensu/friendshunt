/**
 * The Gameplay class controls the game with all the options the game offers.
 * This method requires the Communicator class, the GeoTracker class, the GeoMaps class,
 * the Game class and the Battery Tracker class.
 * The class controls the Silent Hunts, the Speed Hunts, fires the tracking to the end point,
 * counts steps and monitors the device's battery level.
 *
 * @class
 *
 * @author    Markus Götz <info@septem-sensu.de>
 * @version   0.1.0
 * @since     2026-06-18
 *
 * @example   var gameplay = new Gameplay( playerId, gameId, gameSettings );
 *
 */
class Gameplay {

/**
 * This method is the constructor of the class.
 *
 * @public
 *
 * @param     {string}   playerId       The current player's ID
 * @param     {string}   gameId         The Game ID of the game to be played
 * @param     {object}   gameSettings   The Game Settings object with all of the game's settings
 * @return    {void}
 *
 * @example   var gameplay = new Gameplay( playerId, gameId, gameSettings );
 *
 */
  constructor( playerId, gameId, gameSettings ) {
    this.colors                 = [ '#00aa00', '#0000ff', '#ff00ff', '#00aaaa', '#aaaa00', '#000000', '#00aa00', '#0000ff', '#ff00ff', '#00aaaa', '#aaaa00', '#000000' ];
    this.affectedColor          = '#ff0000';
    this.capturedColor          = '#555555';
    this.markerCssClassAlarm    = 'game-marker-alarm';
    this.markerCssClassMyOwn    = 'game-my-own-marker';
    this.markerCssClassCaptured = 'game-marker-captured';

    this.communicator           = new Communicator();
    this.validator              = this.communicator.get( 'validator' );
    this.geoTracker             = new GeoTracker();
    this.batteryTracker         = new BatteryTracker();
    this.geoMaps                = new GeoMaps();
    this.game                   = new Game( gameId );
    this.gameId                 = gameId;
    this.playerId               = playerId;
    this.steps                  = 0;
    this.gameplayRole           = '';
    this.lastMessageId          = '';

    this.outOfPlayingField      = false;
    this.gameplayState          = {};
    this.gameSettings           = gameSettings;
    this.capturedPlayerIds      = [];
    this.capturedPlayer         = {};
    this.gameplayMessages       = [];
    this.systemMessagesDontShow = {};
    this.replayData             = null;

    this.init();

    return;
  }

/**
 * This method is the default getter of the class.
 *
 * @public
 *
 * @param     {string}   property   The property of the value
 * @return    {mixed}    value      The value of the property
 *
 * @example   var value = gameplay.get( property );
 * @example   var value = this.get( property );
 *
 */
  get( property ) {
    return this[ property ];
  }

/**
 * This method is the default setter for the class.
 *
 * @public
 *
 * @param     {string}   property   The property that you want to set
 * @param     {mixed}    value      The value you want to set to the property
 * @return    {void}
 *
 * @example   gameplay.set( property, value );
 * @example   this.set( property, value );
 *
 */
  set( property, value ) {
    this[ property ] = value;

    return;
  }

/**
 * This method initializes the object and is called when instantiated from the class.
 * The method sets the position of the card, starts interval tracking and starts wake lock.
 *
 * @public
 *
 * @return    {void}
 *
 * @example   gameplay.init();
 * @example   this.init();
 *
 */
  init() {
    this.geoTracker.getCurrentPosition( this.setMap.bind( this ) );

    if( Date.now() / 1000 > this.gameSettings.end ) {
      document.querySelector( '.game-permission-pedometer' ).classList.add( 'hidden' );
    } else {
      this.geoTracker.startIntervalTracking( this.track.bind( this ) );
    }

    this.geoTracker.startWakeLock();
    this.batteryTracker.init();

    this.registerEventHandler();

    return;
  }

/**
 * This method registers all required event handlers of the game.
 * The method is called when instantiating an object via the init method.
 *
 * @public
 *
 * @return    {void}
 *
 * @example   gameplay.registerEventHandler();
 * @example   this.registerEventHandler();
 *
 */
  registerEventHandler() {
    var menuBottomMessageButton = document.querySelector( '#menu-bottom-messages-button' );

    if( menuBottomMessageButton != null ) {
      document.querySelector( '#menu-bottom-messages-button' ).addEventListener( 'click', ( event ) => {
        this.showMessageLayer();

        return;
      } );
    }

    var gamePermissionPedometerButton = document.querySelector( '#game-permission-pedometer-button' );

    if( gamePermissionPedometerButton != null ) {
      gamePermissionPedometerButton.addEventListener( 'click', ( event ) => {
        this.geoTracker.checkPedometerSensor();
        document.querySelector( '.game-permission-pedometer' ).remove();

        return;
      } );
    }

    var gameSystemMessagesOkButton = document.querySelector( '#game-system-messages-ok-button' );

    if( gameSystemMessagesOkButton != null ) {
      gameSystemMessagesOkButton.addEventListener( 'click', ( event ) => {
        var arrDontShowMessages = document.querySelectorAll( 'input[name="dontShow"]' );

        for( var i = 0; i < arrDontShowMessages.length; ++i ) {
          if( ! arrDontShowMessages[ i ].checked ) continue;

          this.systemMessagesDontShow[ arrDontShowMessages[ i ].value ] = true;
        }

        document.querySelector( '#game-system-message-container' ).classList.add( 'hidden' );

        return;
      } )
    }

    var newGameplayMessageButton = document.querySelector( '#new-gameplay-message-button' );
    var newGameplayMessageInput  = document.querySelector( '#new-gameplay-message-input' );

    if( newGameplayMessageButton != null && newGameplayMessageInput != null ) {
      newGameplayMessageButton.addEventListener( 'click', ( event ) => {
        var post       = { 'class': 'Game', 'id': window[ appAlias ].id, 'method': 'gameplay' };

        post.gameplayMethod  = 'message';
        post.callbackMethod  = 'setMessages';
        post.playerId        = this.playerId;
        post.timestamp       = new Date().getTime();
        post.message         = newGameplayMessageInput.value;

        this.communicator.request( 'POST', { "result": "json", "view": window[ appAlias ].view.alias }, post, this.processResponse.bind( this ) );

        return;
      } );

      newGameplayMessageInput.addEventListener( 'keydown', function( event ) {
        if ( event.key === 'Enter' ) {
          if( this.value.length < 1 ) return;

          event.preventDefault();
          newGameplayMessageButton.click();
        }

        return;
      } );
    }

    var gameCaptureOkButton = document.querySelector( '#game-capture-ok-button' );

    if( gameCaptureOkButton != null ) {
      gameCaptureOkButton.addEventListener( 'click', ( event ) => {
        this.sendCaptured();

        return;
      } );
    }

    return;
  }

/**
 * This method controls the callback methods from the endpoint requests and passes them
 * Response data to the respective callback method.
 *
 * @public
 *
 * @param     {object}   response   The Response object returned by the Communicator object
 * @return    {void}
 *
 * @example   gameplay.processResponse( response );
 * @example   this.processResponse( response );
 *
 */
  processResponse( response ) {
    var result              = response.result ? response.result : response;

    this.gameplayState      = result.state ? result.state : this.gameplayState;
    this.gameSettings       = result.settings ? result.settings : this.gameSettings;
    this.gameplayRole       = result.gameRole ? result.gameRole : this.gameplayRole;
    this.gameplayMessages   = result.messages ? result.messages : this.gameplayMessages;
    this.outOfPlayingField  = result.outOfPlayingField ? result.outOfPlayingField : this.outOfPlayingField;
    this.playerId           = result.playerId ? result.playerId : this.playerId;

    if( result.callbackMethod ) this[ result.callbackMethod ]( response );

    return;
  }

/**
 * This method sets the map over the GeoMaps object such as the start point, the exit point and the playing field.
 *
 * @public
 *
 * @param     {number}   lat         The latitude of a point on the map (starting point, exit point or center of the playing field)
 * @param     {number}   lng         The longitude of a point on the map (start point, exit point, or the center of the playing field)
 * @param     {number}   precision   The precision in meters, which indicates the accuracy of the latitude and longitude
 * @param     {object}   message     A message (not currently used)
 * @return    {void}
 *
 * @example   gameplay.setMap( lat, lng, precision, message );
 * @example   this.setMap( lat, lng, precision, message );
 *
 */
  setMap( lat, lng, precision, message ) {
    var gameStart      = this.gameSettings.start;
    var contentStart   = '<p class="bold">Startposition des Spiels</p>';
    var contentExit    = '<p class="bold">Exitpunkt des Spiels</p>';
    var startPosition  = this.gameSettings.startPosition.split( ',' );
    var exitPosition   = this.gameSettings.exitPosition.split( ',' );
    var fieldCenter    = this.gameSettings.playingFieldCenterPosition.split( ',' );

    contentStart      += '<p>Spielstart: ' + Utils.timestampPhpToString( this.gameSettings.start ) + ' Uhr</p>';
    contentStart      += '<p>Spielende: ' + Utils.timestampPhpToString( this.gameSettings.end ) + ' Uhr</p>';
    contentExit       += '<p>Spielstart: ' + Utils.timestampPhpToString( this.gameSettings.start ) + ' Uhr</p>';
    contentExit       += '<p>Spielende: ' + Utils.timestampPhpToString( this.gameSettings.end ) + ' Uhr</p>';

    this.geoMaps.setMap( lat, lng, 'map' );
    this.geoMaps.setMarker( 'start', 'start', '#00aa00', startPosition[ 0 ], startPosition[ 1 ], contentStart );
    this.geoMaps.setMarker( 'exit', 'exit', '#00aa00', exitPosition[ 0 ], exitPosition[ 1 ], contentExit );

    this.geoMaps.setCircle( 'playingFieldCenterPosition', fieldCenter[ 0 ], fieldCenter[ 1 ], this.gameSettings.playingFieldSize, '#ff0000', 1, '#ff0000', 0.08 );

    if( Date.now() / 1000 > this.gameSettings.end && this.gameSettings.showReplay ) {
      this.getReplayData();
      return;
    }

    this.track( lat, lng, precision, message );

    return;
  };

/**
 * This method creates a tracking object with longitude, longitude, number of steps, battery level and some more
 * and sends this tracking object to the endpoint via the Communicator object.
 * Der Response geht an die setPositions Methode um dort verarbeitet zu werden.
 *
 * @public
 *
 * @param     {number}   lat         The latitude of a point on the map (starting point, exit point or center of the playing field)
 * @param     {number}   lng         The longitude of a point on the map (start point, exit point, or the center of the playing field)
 * @param     {number}   precision   The precision in meters, which indicates the accuracy of the latitude and longitude
 * @param     {object}   message     A message (not currently used)
 * @return    {void}
 *
 * @example   gameplay.track( lat, lng, precision, message );
 * @example   this.track( lat, lng, precision, message );
 *
 */
  track( lat, lng, precision, message ) {
    var post         = { 'class': 'Game', 'id': this.gameId, 'method': 'gameplay' };
    var stepCount    = this.geoTracker.get( 'stepCount' );
    var batteryState = this.batteryTracker.getBatteryData();

    this.steps               += stepCount;

    post.gameplayMethod       = 'track';
    post.callbackMethod       = 'setPositions';
    post.playerId             = this.playerId;
    post.lat                  = lat;
    post.lng                  = lng;
    post.precision            = precision;
    post.message              = message;
    post.steps                = stepCount;
    post.outOfPlayingField    = this.outOfPlayingField;
    post.batteryLevel         = batteryState.supported ? batteryState.level : 0;
    post.batteryIsCharging    = batteryState.supported ? batteryState.charging : false;
    post.timestamp            = Date.now() / 1000;

    this.geoTracker.set( 'stepCount', 0 );

    this.communicator.request( 'POST', { "result": "json", "view": window[ appAlias ].view.alias }, post, this.processResponse.bind( this ) );

    return;
  }

/**
 * This method evaluates the response from the end point and controls all other methods that set the positions of the players on the map,
 * displays messages and system messages, updates the status bar and checks the game rules.
 *
 * @public
 *
 * @param     {object}   response     The response object with all currently important information about the game
 * @return    {void}
 *
 * @example   gameplay.setPositions( response );
 * @example   this.setPositions( response );
 *
 */
  setPositions( response ) {
    var gameplayRoles     = [ 'player', 'hunter', 'management' ];
    var speedHuntPlayer   = '';

    if( this.gameplayState.speedHuntState.speedHuntCount > 0 ) {
      for( var i = 0; i < response.result.positions.player.length; i++ ) {
        if( response.result.positions.player[ i ].id != this.gameplayState.speedHuntState.playerId ) continue;
        if( this.gameSettings.showNames == '1' ) {
          speedHuntPlayer = this.gameplayState.speedHuntState.playerName;
        } else {
          speedHuntPlayer = 'Spieler ' + ( i + 1 );
        }

        break;
      }
    }

    for( var i = 0; i < this.gameplayState.capturedPlayer.length; i++ ) {
      this.capturedPlayerIds.push( this.gameplayState.capturedPlayer[ i ].playerId );
      this.capturedPlayer[ this.gameplayState.capturedPlayer[ i ].playerId ] = this.gameplayState.capturedPlayer[ i ];
    }

    for( var k = 0; k < gameplayRoles.length; k++ ) {
      for( var i = 0; i < response.result.positions[  gameplayRoles[ k ] ].length; i++ ) {
        if( response.result.positions[  gameplayRoles[ k ] ][ i ].position.length < 1 ) continue;

        var tracking     = response.result.positions[  gameplayRoles[ k ] ][ i ];

        this.setPosition( gameplayRoles[ k ], tracking, response.result, i + 1, speedHuntPlayer );
      }
    }

    this.setStateLine();
    this.setMessages();
    this.checkRules();
    this.checkSystemMessages();

    return;
  }

/**
 * This method shows the captured layer in the game with all selectable Hunters.
 *
 * @public
 *
 * @return    {void}
 *
 * @example   gameplay.showCaptureLayer();
 * @example   this.showCaptureLayer();
 *
 */
  showCaptureLayer() {
    var hunter             = this.gameSettings.hunter;
    var captureLayer       = document.querySelector( '#game-capture-container' );
    var captureLayerInner  = document.querySelector( '#game-capture-hunter-container' );
    var content            = '';

    content               += '<div class="content-container">';
    content               += '<div>';
    content               += '<h2 class="align-left float-left">Gefangen</h2>';
    content               += '<button class="success float-right" onclick="javascript: document.querySelector(\'#game-capture-container\').classList.add(\'hidden\')">Doch nicht</button>';
    content               += '<div class="clear-both"></div>';
    content               += '</div>';
    content               += '<p class="align-left mt-10">Von wem wurdest du erwischt und gefangen?</p>';
    content               += '</div>';

    captureLayerInner.innerHTML = content;

    for( var i = 0; i < hunter.length; i++ ) {
      var newHunterDiv       = document.createElement( 'div' );
      var hunterContent      = '';
      hunterContent         += '<div class="content-container">';
      hunterContent         += '<p class="align-left"><input type="checkbox" name="hunterId" value="' + hunter[ i ].id + '" /> ' + hunter[ i ].id + '</p>';
      hunterContent         += '</div>';

      newHunterDiv.innerHTML = hunterContent;

      captureLayerInner.append( newHunterDiv );
    }

    captureLayer.classList.remove( 'hidden' );
    captureLayer.style.height = ( window.innerHeight - 137 ) + 'px';

    return;
  }

/**
 * This method checks whether new system messages have been received and displays them to the player in a layer.
 * if there are new system messages, the player will be alerted with a beep
 * a vibrator is triggered on Android cell phones.
 *
 * @public
 *
 * @return    {void}
 *
 * @example   gameplay.checkSystemMessages();
 * @example   this.checkSystemMessages();
 *
 */
  checkSystemMessages() {
    var gameSettings             = this.gameSettings;
    var systemMessages           = this.gameplayState.systemMessages;
    var systemMessagesDontShow   = this.systemMessagesDontShow;
    var showLayer                = false;
    var systemMessageLayer       = document.querySelector( '#game-system-message-container' );
    var systemMessagesHtml       = document.querySelector( '#game-system-messages' );

    systemMessagesHtml.innerHTML     = '';

    for( var i = 0; i < systemMessages.length; i++ ) {
      if( ! systemMessages[ i ].for.includes( this.gameplayRole ) ) continue;
      if( this.systemMessagesDontShow[ systemMessages[ i ].id ] ) continue;
      if( systemMessages[ i ].showMessageOnlyOne ) this.systemMessagesDontShow[ systemMessages[ i ].id ] = true;

      var newSystemMessage       = document.createElement( 'div' );
      var message                = '';
      var applies                = '';
      var cssClass               = typeof systemMessages[ i ].cssClass == 'string' ? ' class="' + systemMessages[ i ].cssClass + '"' : '';

      if( typeof systemMessages[ i ].applies == 'string' && systemMessages[ i ].applies != '' ) {
        if( this.gameplayRole == 'hunter' && gameSettings.showNames != '1' && systemMessages[ i ].appliesRole == 'player' ) {
          applies = '<p' + cssClass + '>Betrifft: Spieler ' + systemMessages[ i ].appliesCount + '</p>';
        } else {
          applies = '<p' + cssClass + '>Betrifft: ' + systemMessages[ i ].appliesName + '</p>';
        }
      }

      message                   += '<p class="game-info-small">(' + Utils.timestampPhpToString( systemMessages[ i ].timestamp ) + ')</p>';
      message                   += systemMessages[ i ].message;
      message                   += applies;
      message                   += ! systemMessages[ i ].showMessageOnlyOne ? '<input type="checkbox" name="dontShow" value="' + systemMessages[ i ].id + '" /><span class="game-info-small">Nicht mehr anzeigen</span>' : '';

      newSystemMessage.innerHTML = message;
      showLayer                  = true;

      newSystemMessage.classList.add( 'game-system-message' );
      systemMessagesHtml.append( newSystemMessage );
    }

    if( ! showLayer ) return;

    Utils.playMessagePiep();
    Utils.triggerMessageVibration();

    systemMessageLayer.classList.remove( 'hidden' );
    systemMessageLayer.style.height = ( window.innerHeight - 137 ) + 'px';

    systemMessagesHtml.scrollTo( { 'top': systemMessagesHtml.scrollHeight, 'behavior': 'smooth' } );

    return;
  }

/**
 * This method closes the system message layer and evaluates the checkboxes of messages
 * which should no longer be displayed to the player.
 *
 * @public
 *
 * @return    {void}
 *
 * @example   gameplay.closeSystemMessagesLayer();
 * @example   this.closeSystemMessagesLayer();
 *
 */
  closeSystemMessagesLayer() {
    var dontShowMessages = document.querySelectorAll( 'input[name="dontShow"]' );

    for( var i = 0; i < dontShowMessages.length; ++i ) {
      if( ! dontShowMessages[ i ].checked ) continue;
      this.systemMessagesDontShow[ dontShowMessages[ i ].value ] = true;
    }

    document.querySelector( '#game-system-message-container' ).classList.add( 'hidden' );

    return;
  }

/**
 * This method creates a request object with the information that you were caught and who caught you.
 * This request object is fired to the endpoint via the Communcator object.
 *
 * @public
 *
 * @return    {void}
 *
 * @example   gameplay.sendCaptured();
 * @example   this.sendCaptured();
 *
 */
  sendCaptured() {
    var hunterIds        = document.querySelectorAll( 'input[name="hunterId"]' );
    var post             = { 'class': 'Game', 'id': this.gameId, 'method': 'gameplay' };

    post.gameplayMethod  = 'captured';
    post.hunterIds       = [];
    post.playerId        = this.playerId;

    for( var i = 0; i < hunterIds.length; ++i ) {
      if( ! hunterIds[ i ].checked ) continue;
      post.hunterIds.push( hunterIds[ i ].value )
    }

    if( post.hunterIds.length < 1 ) {
      document.querySelector( '#game-capture-container' ).classList.add( 'hidden' );
      return;
    }

    this.communicator.request( 'POST', { "result": "json", "view": window[ appAlias ].view.alias }, post, 'proccessResponse' );

    // this.geoMaps.removeMarker( this.playerId );

    document.querySelector( '#game-capture-container' ).classList.add( 'hidden' );

    return;
  }

/**
 * This method checks the game rules based on the player's game settings.
 *
 * @public
 *
 * @return    {void}
 *
 * @example   gameplay.checkRules();
 * @example   this.checkRules();
 *
 */
  checkRules() {
    if( this.capturedPlayerIds.includes( this.playerId ) ) return;
    if( ! this.gameplayState.isRunning ) return;

    var floatPlayerDistance = this.geoMaps.getDistance( 'playingFieldCenterPosition', this.playerId );

    if( floatPlayerDistance > parseInt( this.gameSettings.playingFieldSize ) + 50 ) {
      this.outOfPlayingField = true;
    } else {
      this.outOfPlayingField = false;
    }

    return;
  }

/**
 * This method sets the status line in the game with all currently important information.
 * Important information includes, for example, when the next Silent Hunt is, whether there is a Speed Hunt
 * is running or when this is possible.
 *
 * @public
 *
 * @return    {void}
 *
 * @example   gameplay.setStateLine();
 * @example   this.setStateLine();
 *
 */
  setStateLine() {
    var stateLine = '';
    var timeStampNow = Date.now() / 1000;

    if( this.gameplayState.gameState == 'stopped' ) {
      if( timeStampNow < this.gameSettings.start ) {
        stateLine += 'Das Spiel Startet am ' + Utils.timestampPhpToString( this.gameSettings.start ) + ' Uhr. ';
      } else {
        stateLine += 'Das Spiel ist beendet. ';
      }

      document.querySelector( '#icon-game-state-stop' ).src = 'includes/images/icon-stop.png';
      document.querySelector( '#game-state-icon-container' ).removeAttribute( 'onclick' );
    } else {
      if( this.gameplayState.speedHuntState.speedHuntCount > 0 ) {
        if( this.gameplayRole != 'hunter' ) stateLine += '<span class="danger-text bold">ACHTUNG: </span><span class="danger-text">';
        stateLine += 'Es läuft ein Speedhunt, Ping ' + this.gameplayState.speedHuntState.speedHuntCount + ' von ' + this.gameplayState.speedHuntState.speedHuntCountMax + '. ';
        if( this.gameplayRole != 'hunter' ) stateLine += '</span> ';
      } else {
        if( typeof this.gameplayState.speedHuntState.next != 'undefined' ) {
          stateLine += 'Der nächste Speedhunt ist am ' + Utils.timestampPhpToString( this.gameplayState.speedHuntState.next )  + ' Uhr verfügbar. ';
        } else {
          stateLine += 'Speedhunt ist verfügbar. ';
        }
      }

      if( this.gameplayState.nextSilentHunt >= this.gameSettings.end ) {
        stateLine += 'Es gibt keinen Silent Hunt vor Spielende mehr. ';
      } else {
        stateLine += 'Der nächste Silent Hunt ist am ' + Utils.timestampPhpToString( this.gameplayState.nextSilentHunt ) + ' Uhr. ';
      }

      document.querySelector( '#icon-game-state-stop' ).src = 'includes/images/icon-play.png';
      document.querySelector( '#game-state-icon-container' ).setAttribute( 'onclick', 'javascript: window[ appAlias ].methods.gameplay.checkSystemMessages();' );
    }

    document.querySelector( '#game-scrolling-info-text' ).innerHTML = stateLine;

    if( timeStampNow > this.gameplayState.timestampEnd ) {
      document.querySelector( '.game-permission-pedometer' ).classList.add( 'hidden' );
    }

    return;
  }

/**
 * This method sets the positions of each player on the map and populates the popup of players on the map
 * with all necessary information.
 *
 * @public
 *
 * @param     {string}   gameplayRole     The player role in the game (player, hunter or game leader)
 * @param     {object}   tracking         The current tracking object with all important information and movement data
 * @param     {object}   result           The response object with all currently important information about the game
 * @param     {number}   playerCount      The player number if the player names should not be displayed
 * @param     {string}   speedHuntPlayer  The player who is running a Speedhunt
 * @return    {void}
 *
 * @example   gameplay.setPosition( gameplayRole, tracking, result, playerCount, speedHuntPlayer );
 * @example   this.setPosition( gameplayRole, tracking, result, playerCount, speedHuntPlayer );
 *
 */
  setPosition( gameplayRole, tracking, result, playerCount, speedHuntPlayer ) {
    var markerCssClass    = null;
    var affectedPlayer    = [];
    var lastPosition      = tracking.position.at( -1 );
    var gameSettings      = this.gameSettings;
    var gameState         = this.gameplayState;
    var speedHuntState    = gameState.speedHuntState;
    var myGameRole        = result.gameRole;
    var markerContent     = '';
    var capturedMessage   = '';
    var silentHuntMessage = '';
    var markerColor       = this.colors[ playerCount ];
    var timestampNow      = Date.now() / 1000;
    var playerIsCaptured  = this.capturedPlayerIds.includes( tracking.id );

    if( playerIsCaptured ) {
      speedHuntState.message = '';
    } else {
      // Marker Message: Speed Hunt
      if( speedHuntState.speedHuntCount > 0 ) {
        speedHuntState.message = 'Es läuft ein Speedhunt, Ping ' + speedHuntState.speedHuntCount + ' von ' + speedHuntState.speedHuntCountMax + '.';
      } else {
        if( typeof speedHuntState.next != 'undefined' ) {
          if( speedHuntState.next >= this.gameSettings.end ) {
            speedHuntState.message = 'Es gibt keinen Speed Hunt vor Spielende mehr. ';
          } else {
            speedHuntState.message = 'Der nächste Speedhunt ist am ' + Utils.timestampPhpToString( this.gameplayState.speedHuntState.next )  + ' Uhr verfügbar. ';
          }
        } else if( timestampNow > this.gameSettings.end ) {
          speedHuntState.message = 'Das Spiel ist zu Ende. Es gibt keinen Speed Hunt mehr. ';
        } else {
          speedHuntState.message = 'Speedhunt ist verfügbar. ';
        }
      }

      // Marker Message: Silent Hunt
      if( this.gameplayState.nextSilentHunt >= this.gameSettings.end ) {
        silentHuntMessage += 'Es gibt keinen Silent Hunt vor Spielende mehr. ';
      } else if( timestampNow > this.gameSettings.end ) {
        silentHuntMessage += 'Das Spiel ist zu Ende. Es gibt keinen Silent Hunt mehr. ';
      } else {
        silentHuntMessage += 'Der nächste Silent Hunt ist am ' + Utils.timestampPhpToString( this.gameplayState.nextSilentHunt ) + ' Uhr. ';
      }

      // Marker Message: Violation of the Rules
      for( var i = 0; i < this.gameplayState.systemMessages.length; i++ ) {
        if( this.gameplayState.systemMessages[ i ].type != 'violationoftherules' ) continue;
        if( ! this.gameplayState.systemMessages[ i ].applies ) continue;

        affectedPlayer.push( this.gameplayState.systemMessages[ i ].applies );
      }
    }

    // Marker css Class if it is me myself
    if( tracking.id == this.playerId ) markerCssClass = this.markerCssClassMyOwn;

    // Set Marker Content
    if( gameplayRole == 'player' ) {
      if( myGameRole == 'player' ) {
        if( gameSettings.showPlayer == 0 && tracking.id != this.playerId ) return;

        markerContent   += '<p class="bold">' + tracking.name + '</p>';

        if( tracking.id == this.playerId && this.gameplayState.isRunning && ! playerIsCaptured ) {
          capturedMessage = '<p class="pointer bold danger-text" onclick="javascript: window[ appAlias ].objects.gameplay.showCaptureLayer();">Ich wurde gefangen...</p>';
        }
      } else if( myGameRole == 'hunter' ) {
        var playerName = gameSettings.showNames == '1' ? tracking.name : 'Spieler ' + playerCount;

        if( affectedPlayer.includes( tracking.id ) ) {
          markerColor    = this.affectedColor;
          markerCssClass = this.markerCssClassAlarm;
        }

        if( speedHuntState.speedHuntCount == -1 || playerIsCaptured ) {
          markerContent   += '<p class="bold">' + playerName + '</p>';
        } else if( speedHuntState.speedHuntCount == 0 && this.gameplayState.isRunning ) {
          markerContent   += '<p class="bold pointer success-text" onclick="javascript: window[ appAlias ].objects.gameplay.speedHunt( \'' + tracking.id + '\' );">';
          markerContent   += playerName;
          markerContent   += '</p>';
        } else {
          if( tracking.id == speedHuntState.playerId && this.gameplayState.isRunning ) {
            markerContent   += '<p class="bold pointer success-text" onclick="javascript: window[ appAlias ].objects.gameplay.speedHunt( \'' + tracking.id + '\' );">';
            markerContent   += playerName;
            markerContent   += '</p>';
            markerColor      = this.affectedColor;
            markerCssClass   = this.markerCssClassAlarm;
          } else {
            markerContent   += '<p class="bold">' + playerName + '</p>';
          }
        }
      } else {
        var playerName       = gameSettings.showNames == '1' ? tracking.name : tracking.name + ' (Spieler ' + playerCount + ')';
        markerContent   += '<p class="bold">' + playerName + '</p>';

        if( affectedPlayer.includes( tracking.id ) ) markerColor = this.affectedColor;

        if( speedHuntState.speedHuntCount > 0 && tracking.id == speedHuntState.playerId ) {
          markerColor    = this.affectedColor;
          markerCssClass = this.markerCssClassAlarm;
        }
      }

      markerContent   += '<p>Rolle: Spieler</p>';
      markerContent   += '<p>' + speedHuntState.message + '</p>';
      markerContent   += '<p>' + silentHuntMessage + '</p>';
    } else if( gameplayRole == 'hunter' ) {
      if( myGameRole == 'player' ) return;
      markerContent   += '<p class="bold">' + tracking.name + '</p>';
      markerContent   += '<p>Rolle: Jäger</p>';
    } else {
      markerContent   += '<p class="bold">' + tracking.name + '</p>';
      markerContent   += '<p>Rolle: Spielleitung</p>';
    }

    markerContent   += '<p>Letztes Tracking: ' + Utils.timestampPhpToString( lastPosition.timestamp, true ) + ' Uhr</p>';
    markerContent   += '<p>Genauigkeit: ' + lastPosition.precision + ' Meter</p>';
    markerContent   += capturedMessage;

    if( this.capturedPlayerIds.includes( tracking.id ) ) {
      markerContent  += '<p class="bold">Wurde am ' + Utils.timestampPhpToString( this.capturedPlayer[ tracking.id ].timestamp ) + ' Uhr gefangen.</p>';
      markerCssClass  = this.markerCssClassCaptured;

      this.geoMaps.setMarker( tracking.id, gameplayRole, this.capturedColor, lastPosition.lat, lastPosition.lng, markerContent );
    } else {
      this.geoMaps.setMarker( tracking.id, gameplayRole, markerColor, lastPosition.lat, lastPosition.lng, markerContent );
    }

    if( markerCssClass ) this.geoMaps.addMarkerCssClass( tracking.id, markerCssClass );

    return;
  }

/**
 * This method creates a request object for a speed hunt and fires it to the endpoint via the communicator object.
 * The method can only be used by hunters.
 *
 * @public
 *
 * @param     {string}   speedHuntPlayerId   The Player ID to which the Speed ​​Hunt Ping should be fired
 * @return    {void}
 *
 * @example   gameplay.speedHunt( 'max@musterman.de' );
 * @example   this.speedHunt( speedHuntPlayerId );
 *
 */
  speedHunt( speedHuntPlayerId ) {
    var post = { 'class': 'Game', 'id': this.gameId, 'method': 'gameplay' };

    post.gameplayMethod    = 'speedHunt';
    post.callbackMethod    = 'setPositions';
    post.playerId          = this.playerId;
    post.speedHuntPlayerId = speedHuntPlayerId;
    post.timestamp         = Date.now() / 1000;

    return this.communicator.request( 'POST', { "result": "json", "view": window[ appAlias ].view.alias }, post, this.processResponse.bind( this ) );
  }

/**
 * This method opens or closes the player's message layer.
 *
 * @public
 *
 * @return    {void}
 *
 * @example   gameplay.showMessageLayer();
 * @example   this.showMessageLayer();
 *
 */
  showMessageLayer() {
    var messageLayer     = document.querySelector( '#game-message-layer' );
    var messageContainer = document.querySelector( '#game-message-content' );
    var replayPanel      = document.querySelector( '.replay-panel' );

    if( messageLayer.classList.contains( 'hidden' ) ) {
      messageLayer.classList.remove( 'hidden' );
      document.querySelector( '.icon-new-message' ).classList.add( 'hidden' );
      messageContainer.scrollTo( { 'top': messageContainer.scrollHeight, 'behavior': 'smooth' } );

      messageLayer.style.height = ( window.innerHeight - 120 ) + 'px';

      if( this.replayData && replayPanel ) replayPanel.classList.add( 'hidden' );
    } else {
      messageLayer.classList.add( 'hidden' );

      if( this.replayData && replayPanel ) replayPanel.classList.remove( 'hidden' );
    }

    return;
  }

/**
 * This method places the messages in the message layer and scrolls to the end of the message list.
 *
 * @public
 *
 * @return    {void}
 *
 * @example   gameplay.setMessages();
 * @example   this.setMessages();
 *
 */
  setMessages() {
    var lastMessageId            = '';
    var content                  = '';
    var messageContainer         = document.querySelector( '#game-message-content' );
    var newGameplayMessageInput  = document.querySelector( '#new-gameplay-message-input' );

    if( newGameplayMessageInput != null ) newGameplayMessageInput.value = '';

    for( var i = 0; i < this.gameplayMessages.length; i++ ) {
      var message        = this.gameplayMessages[ i ];
      var realPlayerName = message.playerName;
      var playerName     = '';

      content           += message.playerId == this.playerId ? '<div class="game-message-from-me"><div>' : '<div class="game-message-from-other" id="' + message.id + '"><div>';

      if( message.playerId != this.playerId ) lastMessageId = message.id;

      if( playerName == '' ) {
        for( var j = 0; j < this.gameSettings.playerIds.length; j++ ) {
          if( this.gameSettings.playerIds[ j ] != message.playerId ) continue;

          playerName  = this.gameSettings.showNames == '1' ? realPlayerName + ' - Spieler' : 'Spieler ' + ( j + 1 );
          playerName  = message.playerId == this.playerId ? realPlayerName + ' - Spieler' : playerName;

          break;
        }
      }

      if( playerName == '' ) {
        for( var j = 0; j < this.gameSettings.hunterIds.length; j++ ) {
          if( this.gameSettings.hunterIds[ j ] != message.playerId ) continue;

          playerName  = this.gameSettings.showNames == '1' ? realPlayerName + ' - Jäger' : 'Jäger ' + ( j + 1 );
          playerName  = message.playerId == this.playerId ? realPlayerName + ' - Jäger' : playerName;

          break;
        }
      }

      if( playerName == '' ) {
        for( var j = 0; j < this.gameSettings.managementIds.length;j++ ) {
          if( this.gameSettings.managementIds[ j ] != message.playerId ) continue;

          playerName  = this.gameSettings.showNames == '1' ? realPlayerName + ' - Spielleitung' : 'Spielleitung ' + ( j + 1 );
          playerName  = message.playerId == this.playerId ? realPlayerName + ' - Spielleitung' : playerName;

          break;
        }
      }

      content += message.message;
      content += '<p class="game-message-footer">' + playerName + ' (' + Utils.timestampPhpToString( message.timestamp ) + ')</p>';
      content += '</div></div>';
    }

    messageContainer.innerHTML = content;

    messageContainer.scrollTo( { 'top': messageContainer.scrollHeight, 'behavior': 'smooth' } );

    if( lastMessageId != this.lastMessageId ) {
      this.lastMessageId = lastMessageId;

      Utils.playMessagePiep();
      Utils.triggerMessageVibration();

      if( document.querySelector( '#game-message-layer' ).classList.contains( 'hidden' ) ) document.querySelector( '.icon-new-message' ).classList.remove( 'hidden' );
    }

    return;
  }

/**
 * This method creates a Request Object for fetching the complete tracking data for the current game and fires it to the endpoint via the Communicator Object.
 * The callback method that processes the response is the generateReplayData method.
 * The request is only generated if there is no tracking data on the object yet, otherwise the ReplayPlayer is instantiated using the startReplayPlayer method.
 *
 * @public
 *
 * @return    {void}
 *
 * @example   gameplay.getReplayData();
 * @example   this.getReplayData();
 *
 */
  getReplayData() {
    if( this.replayData ) {
      this.startReplayPlayer();

      return;
    }

    var post             = { 'class': 'Game', 'id': window[ appAlias ].id, 'method': 'gameplay' };

    post.gameplayMethod  = 'statistic';
    post.callbackMethod  = 'generateReplayData';

    this.communicator.request( 'POST', { "result": "json", "view": window[ appAlias ].view.alias }, post, this.processResponse.bind( this ) );

    return;
  }

/**
 * This method is the callback method from the getReplayData method.
 * The method creates a replay object in which the tracking of all players is in an array sorted by timestamp.
 * After the Replay object is created, this method calls the startReplayPlayer method to start the Replay Player.
 *
 * @public
 *
 * @param     {object}   response   The response object from the endpoint with the tracking data
 * @return    {void}
 *
 * @example   gameplay.generateReplayData( response );
 * @example   this.generateReplayData( response );
 *
 */
  generateReplayData( response ) {
    response         = response.result;

    var speedHunts   = response.gameplay.speedHunts;
    var captured     = response.gameplay.captured;

    if( window[ appAlias ].debug ) console.log( 'generateReplay Response: ', response );

    this.replayData    = {
      'roles': { 'player': 'Spieler', 'hunter': 'Jäger', 'management': 'Spielleitung' },
      'names': {},
      'trackings': []
    };

    for( var role in this.replayData.roles ) {
      for( var i = 0; i < response.gameplay[ role ].length; i++ ) {
        this.replayData.names[ response.gameplay[ role ][ i ].id ] = {
          'id': response.gameplay[ role ][ i ].id,
          'name': response.gameplay[ role ][ i ].name,
          'role': role,
          'roleName': this.replayData.roles[ role ],
          'firstLat': null,
          'firstLng': null
        };
      }
    }

    for( var role in this.replayData.roles ) {
      var trackings     = response.positions[ role ];
      var playerCounter = -1;

      for( var playerId in trackings ) {
        var tracking = response.positions[ role ][ playerId ];

        playerCounter++;

        for( var i = 0; i < tracking.length; i++ ) {
          tracking[ i ].type        = 'tracking';
          tracking[ i ].role        = role;
          tracking[ i ].roleName    = this.replayData.roles[ role ];
          tracking[ i ].playerId    = playerId;
          tracking[ i ].playerName  = this.replayData.names[ playerId ].name;
          tracking[ i ].playerCount = playerCounter;

          this.replayData.names[ playerId ].firstLat = this.replayData.names[ playerId ].firstLat == null ? tracking[ i ].lat : this.replayData.names[ playerId ].firstLat;
          this.replayData.names[ playerId ].firstLng = this.replayData.names[ playerId ].firstLng == null ? tracking[ i ].lng : this.replayData.names[ playerId ].firstLng;

          this.replayData.trackings.push( tracking[ i ] );
        }
      }
    }

    for( var i = 0; i < speedHunts.length; i++ ) {
      for( var j = 0; j < speedHunts[ i ].timestamps.length; j++ ) {
        this.replayData.trackings.push( {
          'type': 'speedhunt',
          'role': this.replayData.names[ speedHunts[ i ].playerId ].role,
          'roleName': this.replayData.names[ speedHunts[ i ].playerId ].roleName,
          'playerId': speedHunts[ i ].playerId,
          'playerName': speedHunts[ i ].playerName,
          'timestamp': speedHunts[ i ].timestamps[ j ]
        } );
      }
    }

    for( var i = 0; i < captured.length; i++ ) {
      this.replayData.trackings.push( {
        'type': 'capture',
        'role': this.replayData.names[ captured[ i ].playerId ].role,
        'roleName': this.replayData.names[ captured[ i ].playerId ].roleName,
        'playerId': captured[ i ].playerId,
        'playerName': this.replayData.names[ captured[ i ].playerId ].name,
        'timestamp': captured[ i ].timestamp
      } );
    }

    this.replayData.trackings.sort( function( objA, objB ) {
      return objA.timestamp - objB.timestamp;
    } );

    this.startReplayPlayer();

    return;
  }

/**
 * This method instantiates the ReplayPlayer and removes the hidden Css class from the Replay Player panel.
 *
 * @public
 *
 * @return    {void}
 *
 * @example   gameplay.startReplayPlayer();
 * @example   this.startReplayPlayer();
 *
 */
  startReplayPlayer() {
    var replayPlayer = new ReplayPlayer( this.replayData, this );

    document.querySelector( '.replay-panel' ).classList.remove( 'hidden' );

    return;
  }

}
