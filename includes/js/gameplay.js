/**
 * Gameplay Package for the Friends Hunt App.
 *
 * This Package represents the Gameplay Package for the Friends Hunt App with his Functions.
 * The package is only loaded on the Gameplay Page.
 *
 * @public
 * @module        gameplay.js
 * @namespace     friendshunt
 * @access        public
 * @author        Markus Götz <info@septem-sensu.de>
 * @since         2026-06-06
 * @version       0.1.0
 * @copyright     2026 Markus Götz <info@septem-sensu.de>
 *
*/
window[ appAlias ].methods.gameplay       = window[ appAlias ].methods.gameplay || {};
window[ appAlias ].listener.gameplay      = window[ appAlias ].listener.gameplay || {};
window[ appAlias ].tracker                = window[ appAlias ].tracker || {};
window[ appAlias ].gameplayState          = window[ appAlias ].gameplayState || {};
window[ appAlias ].systemMessagesDontShow = window[ appAlias ].systemMessagesDontShow || {};
window[ appAlias ].stepCount              = window[ appAlias ].stepCount || 0;
window[ appAlias ].outOfPlayingField      = window[ appAlias ].outOfPlayingField || false;
window[ appAlias ].capturedPlayerIds      = window[ appAlias ].capturedPlayerIds || [];

/**
 * This Function init the Gameplay, starts the Game Player Tracking, the Step Counter and used the Wake Lock API.
 *
 * @function
 * @public
 * @name       init
 * @memberof   friendshunt
 * @access     public
 * @since      2026-06-06
 * @version    0.1.0
 * @return     {void}
 * @example    friendshunt.methods.gameplay.init();
 *
*/
window[ appAlias ].methods.gameplay.init = function() {
  window[ appAlias ].tracker.geoTrackerObject = new GeoTracker();
  window[ appAlias ].tracker.geoTrackerObject.getCurrentPosition( 'setMap' );
  window[ appAlias ].tracker.geoTrackerObject.startIntervalTracking( 'track' );
  window[ appAlias ].tracker.geoTrackerObject.startPedometer();
  window[ appAlias ].tracker.geoTrackerObject.startWakeLock();

  return;
};

/**
 * This Function set the Map for the Gameplay after Game start.
 *
 * @function
 * @public
 * @name       setMap
 * @memberof   friendshunt
 * @access     public
 * @since      2026-06-06
 * @version    0.1.0
 * @param      {number}   lat         The Latitude Coordinate (float)
 * @param      {number}   lng         The Longitude Coordinate (float)
 * @param      {number}   precision   The Precision in Meters (int)
 * @param      {object}   message     The Message of the Geo Tracker Methode
 * @return     {void}
 * @example    friendshunt.methods.gameplay.setMap( lat, lng, precision, message );
 *
*/
window[ appAlias ].methods.gameplay.setMap = function( lat, lng, precision, message ) {
  var strSpielstart     = window[ appAlias ].methods.TimeStringToTimeString( window[ appAlias ].gameSettings.start );
  var intSpielstart     = window[ appAlias ].gameSettings.start;
  var strContentStart   = '<p class="bold">Startposition des Spiels</p>';
  var strContentExit    = '<p class="bold">Exitpunkt des Spiels</p>';
  var arrStartPosition  = window[ appAlias ].gameSettings.startPosition.split( ',' );
  var arrExitPosition   = window[ appAlias ].gameSettings.exitPosition.split( ',' );
  var arrFieldCenter    = window[ appAlias ].gameSettings.playingFieldCenterPosition.split( ',' );

  strContentStart      += '<p>Spielstart: ' + window[ appAlias ].methods.TimeStringToTimeString( window[ appAlias ].gameSettings.start ) + '</p>';
  strContentStart      += '<p>Spielende: ' + window[ appAlias ].gameSettings.end + '</p>';
  strContentExit       += '<p>Spielstart: ' + window[ appAlias ].methods.TimeStringToTimeString( window[ appAlias ].gameSettings.start ) + '</p>';
  strContentExit       += '<p>Spielende: ' + window[ appAlias ].gameSettings.end + '</p>';

  window[ appAlias ].tracker.geoMapsObject = new GeoMaps();

  window[ appAlias ].tracker.geoMapsObject.setMap( lat, lng, 'map' );
  window[ appAlias ].tracker.geoMapsObject.setMarker( 'start', 'start', '#00aa00', arrStartPosition[ 0 ], arrStartPosition[ 1 ], strContentStart );
  window[ appAlias ].tracker.geoMapsObject.setMarker( 'exit', 'exit', '#00aa00', arrExitPosition[ 0 ], arrExitPosition[ 1 ], strContentExit );

  window[ appAlias ].tracker.geoMapsObject.setCircle( 'playingFieldCenterPosition', arrFieldCenter[ 0 ], arrFieldCenter[ 1 ], window[ appAlias ].gameSettings.playingFieldSize, '#ff0000', 1, '#ff0000', 0.08 );

  window[ appAlias ].methods.gameplay.track( lat, lng, precision, message );

  return;
};

/**
 * This Function generate the Ajax Request to track the Game Player with the current Position Coordinates.
 *
 * @function
 * @public
 * @name       track
 * @memberof   friendshunt
 * @access     public
 * @since      2026-06-06
 * @version    0.1.0
 * @param      {number}   lat         The Latitude Coordinate (float)
 * @param      {number}   lng         The Longitude Coordinate (float)
 * @param      {number}   precision   The Precision in Meters (int)
 * @param      {object}   message     The Message of the Geo Tracker Methode
 * @return     {void}
 * @example    friendshunt.methods.gameplay.track( lat, lng, precision, message );
 *
*/
window[ appAlias ].methods.gameplay.track = function( lat, lng, precision, message ) {
  var objPost      = { 'class': 'Game', 'id': window[ appAlias ].id, 'methode': 'gameplay' };
  var intStepCount = window[ appAlias ].tracker.geoTrackerObject.get( 'stepCount' );

  window[ appAlias ].stepCount = window[ appAlias ].stepCount + intStepCount;

  objPost.gameplayMethode      = 'track';
  objPost.callback             = 'setPositions';
  objPost.playerId             = window[ appAlias ].playerId;
  objPost.lat                  = lat;
  objPost.lng                  = lng;
  objPost.precision            = precision;
  objPost.message              = message;
  objPost.steps                = intStepCount;
  objPost.outOfPlayingField    = window[ appAlias ].outOfPlayingField;
  objPost.timestamp            = new Date().getTime();

  window[ appAlias ].tracker.geoTrackerObject.set( 'stepCount', 0 );

  return window[ appAlias ].methods.request( 'POST', { "result": "json", "view": window[ appAlias ].view.alias }, objPost, 'proccessResponse' );
};

/**
 * This Function is the Track Callback Function and set the Posistion from the Game Player to the Map.
 * The Function is a important Function to call other Functions like set State Line, set new Messages,
 * check the Game Rules and check System Messages and so on.
 *
 * @function
 * @public
 * @name       setPositions
 * @memberof   friendshunt
 * @access     public
 * @since      2026-06-06
 * @version    0.1.0
 * @param      {object}   objResponse   The Response Object from the Ajax Request
 * @return     {void}
 * @example    friendshunt.methods.gameplay.setPositions( objResponse );
 *
*/
window[ appAlias ].methods.gameplay.setPositions = function( objResponse ) {
  var arrGameplayRoles     = [ 'player', 'hunter', 'management' ];
  var strSpeedHuntPlayer   = '';


  if( window[ appAlias ].gameplayState.speedHuntState.speedHuntCount > 0 ) {
    for( var i = 0; i < objResponse.result.positions.player.length; i++ ) {
      if( objResponse.result.positions.player[ i ].id != window[ appAlias ].gameplayState.speedHuntState.playerId ) continue;
      if( window[ appAlias ].gameSettings.showNames == '1' ) {
        strSpeedHuntPlayer = window[ appAlias ].gameplayState.speedHuntState.playerName;
      } else {
        strSpeedHuntPlayer = 'Spieler ' + ( i + 1 );
      }

      break;
    }
  }

  for( var i = 0; i < window[ appAlias ].gameplayState.capturedPlayer.length; i++ ) {
    window[ appAlias ].capturedPlayerIds.push( window[ appAlias ].gameplayState.capturedPlayer[ i ].playerId );
    window[ appAlias ].tracker.geoMapsObject.removeMarker( window[ appAlias ].gameplayState.capturedPlayer[ i ].playerId );
  }

  for( var k = 0; k < arrGameplayRoles.length; k++ ) {
    for( var i = 0; i < objResponse.result.positions[  arrGameplayRoles[ k ] ].length; i++ ) {
      if( objResponse.result.positions[  arrGameplayRoles[ k ] ][ i ].position.length < 1 ) continue;

      var objTracking     = objResponse.result.positions[  arrGameplayRoles[ k ] ][ i ];

      if( window[ appAlias ].capturedPlayerIds.includes( objTracking.id ) ) continue;

      window[ appAlias ].methods.gameplay.setPosition( arrGameplayRoles[ k ], objTracking, objResponse.result, i + 1, strSpeedHuntPlayer );
    }
  }

  window[ appAlias ].methods.gameplay.setStateLine();
  window[ appAlias ].methods.gameplay.setMessages();
  window[ appAlias ].methods.gameplay.checkRules();
  window[ appAlias ].methods.gameplay.checkSystemMessages();

  return;
};

/**
 * This Function hide and unhide the Capture Layer of the Gamplay Page.
 *
 * @function
 * @public
 * @name       showCaptureLayer
 * @memberof   friendshunt
 * @access     public
 * @since      2026-06-06
 * @version    0.1.0
 * @return     {void}
 * @example    friendshunt.methods.gameplay.showCaptureLayer();
 *
*/
window[ appAlias ].methods.gameplay.showCaptureLayer = function() {
  var arrHunter             = window[ appAlias ].gameSettings.hunter;
  var objCaptureLayer       = document.querySelector( '#game-capture-container' );
  var objCaptureLayerInner  = document.querySelector( '#game-capture-hunter-container' );
  var strContent            = '';

  strContent               += '<div class="content-container">';
  strContent               += '<div>';
  strContent               += '<h2 class="align-left float-left">Gefangen</h2>';
  strContent               += '<button class="success float-right" onclick="javascript: document.querySelector(\'#game-capture-container\').classList.add(\'hidden\')">Doch nicht</button>';
  strContent               += '<div class="clear-both"></div>';
  strContent               += '</div>';
  strContent               += '<p class="align-left mt-10">Von wem wurdest du erwischt und gefangen?</p>';
  strContent               += '</div>';

  objCaptureLayerInner.innerHTML = strContent;

  for( var i = 0; i < arrHunter.length; i++ ) {
    var objNewHunterDiv       = document.createElement( 'div' );
    var strHunterContent      = '';
    strHunterContent         += '<div class="content-container">';
    strHunterContent         += '<p class="align-left"><input type="checkbox" name="hunterId" value="' + arrHunter[ i ].id + '" /> ' + arrHunter[ i ].id + '</p>';
    strHunterContent         += '</div>';

    objNewHunterDiv.innerHTML = strHunterContent;

    objCaptureLayerInner.append( objNewHunterDiv );
  }

  objCaptureLayer.classList.remove( 'hidden' );
  objCaptureLayer.style.height = ( window.innerHeight - 137 ) + 'px';

  return;
};

/**
 * This Function is checking the System-Messages and show the System Message Layer if a new Message in the Ajax Response.
 *
 * @function
 * @public
 * @name       checkSystemMessages
 * @memberof   friendshunt
 * @access     public
 * @since      2026-06-06
 * @version    0.1.0
 * @return     {void}
 * @example    friendshunt.methods.gameplay.checkSystemMessages();
 *
*/
window[ appAlias ].methods.gameplay.checkSystemMessages = function() {
  var objGameSettings             = window[ appAlias ].gameSettings;
  var arrSystemMessages           = window[ appAlias ].gameplayState.systemMessages;
  var objSystemMessagesDontShow   = window[ appAlias ].systemMessagesDontShow;
  var boolShowLayer               = false;
  var objSystemMessageLayer       = document.querySelector( '#game-system-message-container' );
  var objSystemMessages           = document.querySelector( '#game-system-messages' );

  objSystemMessages.innerHTML     = '';

  for( var i = 0; i < arrSystemMessages.length; i++ ) {
    if( ! arrSystemMessages[ i ].for.includes( window[ appAlias ].gameplayRole ) ) continue;
    if( objSystemMessagesDontShow[ arrSystemMessages[ i ].id ] ) continue;
    if( arrSystemMessages[ i ].showMessageOnlyOne ) objSystemMessagesDontShow[ arrSystemMessages[ i ].id ] = true;

    var objNewSystemMessage       = document.createElement( 'div' );
    var strMessage                = '';
    var strApplies                = '';
    var strCssClass               = typeof arrSystemMessages[ i ].cssClass == 'string' ? ' class="' + arrSystemMessages[ i ].cssClass + '"' : '';

    if( typeof arrSystemMessages[ i ].applies == 'string' && arrSystemMessages[ i ].applies != '' ) {
      if( window[ appAlias ].gameplayRole == 'hunter' && objGameSettings.showNames != '1' && arrSystemMessages[ i ].appliesRole == 'player' ) {
        strApplies = '<p' + strCssClass + '>Betrifft: Spieler ' + arrSystemMessages[ i ].appliesCount + '</p>';
      } else {
        strApplies = '<p' + strCssClass + '>Betrifft: ' + arrSystemMessages[ i ].appliesName + '</p>';
      }
    }

    strMessage                   += arrSystemMessages[ i ].message;
    strMessage                   += strApplies;
    strMessage                   += ! arrSystemMessages[ i ].showMessageOnlyOne ? '<input type="checkbox" name="dontShow" value="' + arrSystemMessages[ i ].id + '" /><span class="game-info-small">Nicht mehr anzeigen</span>' : '';

    objNewSystemMessage.innerHTML = strMessage;
    boolShowLayer                 = true;

    objNewSystemMessage.classList.add( 'game-system-message' );
    objSystemMessages.append( objNewSystemMessage );
  }

  if( ! boolShowLayer ) return;

  window[ appAlias ].methods.cPlayMessagePiep();
  window[ appAlias ].methods.cTriggerMessageVibration();

  objSystemMessageLayer.classList.remove( 'hidden' );
  objSystemMessageLayer.style.height = ( window.innerHeight - 137 ) + 'px';

  objSystemMessages.scrollTo( { 'top': objSystemMessages.scrollHeight, 'behavior': 'smooth' } );

  return;
};

/**
 * This Function save the no show Message on a Window Variable from the Checkboxes and closed the Message Layer.
 *
 * @function
 * @public
 * @name       closeSystemMessagesLayer
 * @memberof   friendshunt
 * @access     public
 * @since      2026-06-06
 * @version    0.1.0
 * @return     {void}
 * @example    friendshunt.methods.gameplay.closeSystemMessagesLayer();
 *
*/
window[ appAlias ].methods.gameplay.closeSystemMessagesLayer = function() {
  var arrDontShowMessages = document.querySelectorAll( 'input[name="dontShow"]' );

  for( var i = 0; i < arrDontShowMessages.length; ++i ) {
    if( ! arrDontShowMessages[ i ].checked ) continue;
    window[ appAlias ].systemMessagesDontShow[ arrDontShowMessages[ i ].value ] = true;
  }

  document.querySelector( '#game-system-message-container' ).classList.add( 'hidden' );

  return;
}

/**
 * This Function send the Ajax Request to the Server with captured Player Id and the Hunter Ids from the Checkboxes and closed the Capture Layer.
 *
 * @function
 * @public
 * @name       sendCaptured
 * @memberof   friendshunt
 * @access     public
 * @since      2026-06-06
 * @version    0.1.0
 * @return     {void}
 * @example    friendshunt.methods.gameplay.sendCaptured();
 *
*/
window[ appAlias ].methods.gameplay.sendCaptured = function() {
  var arrHunterIds        = document.querySelectorAll( 'input[name="hunterId"]' );
  var objPost             = { 'class': 'Game', 'id': window[ appAlias ].id, 'methode': 'gameplay' };

  objPost.gameplayMethode = 'captured';
  objPost.hunterIds       = [];
  objPost.playerId        = window[ appAlias ].playerId;

  for( var i = 0; i < arrHunterIds.length; ++i ) {
    if( ! arrHunterIds[ i ].checked ) continue;
    objPost.hunterIds.push( arrHunterIds[ i ].value )
  }

  if( objPost.hunterIds.length < 1 ) {
    document.querySelector( '#game-capture-container' ).classList.add( 'hidden' );
    return;
  }

  window[ appAlias ].methods.request( 'POST', { "result": "json", "view": window[ appAlias ].view.alias }, objPost, 'proccessResponse' );

  window[ appAlias ].tracker.geoMapsObject.removeMarker( window[ appAlias ].playerId );

  document.querySelector( '#game-capture-container' ).classList.add( 'hidden' );

  return;
}

/**
 * This Function checks the Game Rules and set the window Variable of the Game.
 *
 * @function
 * @public
 * @name       checkRules
 * @memberof   friendshunt
 * @access     public
 * @since      2026-06-06
 * @version    0.1.0
 * @return     {void}
 * @example    friendshunt.methods.gameplay.checkRules();
 *
*/
window[ appAlias ].methods.gameplay.checkRules = function() {
  if( window[ appAlias ].capturedPlayerIds.includes( window[ appAlias ].playerId ) ) return;
  if( ! window[ appAlias ].gameplayState.isRunning ) return;

  var floatPlayerDistance = window[ appAlias ].tracker.geoMapsObject.getDistance( 'playingFieldCenterPosition', window[ appAlias ].playerId );

  if( floatPlayerDistance > parseInt( window[ appAlias ].gameSettings.playingFieldSize ) + 50 ) {
    window[ appAlias ].outOfPlayingField = true;
  } else {
    window[ appAlias ].outOfPlayingField = false;
  }

  return;
};

/**
 * This Function is a Helper Function after the Track Ajax Request to set the
 * Gameplay Informations (Silent Hunt, Speed Hunt etc.) to the State Line of the Gameplay Page.
 *
 * @function
 * @public
 * @name       setStateLine
 * @memberof   friendshunt
 * @access     public
 * @since      2026-06-06
 * @version    0.1.0
 * @return     {void}
 * @example    friendshunt.methods.gameplay.setStateLine();
 *
*/
window[ appAlias ].methods.gameplay.setStateLine = function() {
  $strStateLine = '';

  if( window[ appAlias ].gameplayState.gameState == 'stopped' ) {
    $strStateLine += window[ appAlias ].gameplayState.gameStateMessage + ' ';

    document.querySelector( '#icon-game-state-stop' ).src = 'includes/images/icon-stop.png';
    document.querySelector( '#game-state-icon-container' ).removeAttribute( 'onclick' );
  } else {
    if( window[ appAlias ].gameplayState.speedHuntState.speedHuntCount > 0 ) {
      if( window[ appAlias ].gameplayRole != 'hunter' ) $strStateLine += '<span class="danger-text bold">ACHTUNG: </span><span class="danger-text">';
      $strStateLine += window[ appAlias ].gameplayState.speedHuntState.message + ' Ping ' + window[ appAlias ].gameplayState.speedHuntState.speedHuntCount + ' von ' + window[ appAlias ].gameplayState.speedHuntState.speedHuntCountMax + '.';
      if( window[ appAlias ].gameplayRole != 'hunter' ) $strStateLine += '</span> ';
    } else {
      $strStateLine += window[ appAlias ].gameplayState.speedHuntState.message + ' ';
    }

    $strStateLine += window[ appAlias ].gameplayState.nextSilentHuntMessage + ' ';

    document.querySelector( '#icon-game-state-stop' ).src = 'includes/images/icon-play.png';
    document.querySelector( '#game-state-icon-container' ).setAttribute( 'onclick', 'javascript: window[ appAlias ].methods.gameplay.checkSystemMessages();' );
  }

  document.querySelector( '#game-scrolling-info-text' ).innerHTML = $strStateLine;

  return;
}

/**
 * This Function is a Helper Function after the Track Ajax Request to set the
 * the Positions, the Popup Content to the Map in the Gampeplay Page.
 *
 * @function
 * @public
 * @name       setPosition
 * @memberof   friendshunt
 * @access     public
 * @since      2026-06-06
 * @version    0.1.0
 * @param      {string}   strGameplayRole      The Gameplay Role of the Player
 * @param      {object}   objTracking          The Tracking Object of the Player to set in the Map
 * @param      {object}   objResult            The Result Object from the Ajax Call
 * @param      {number}   intPlayerCount       The Player Number for set with no Names
 * @param      {string}   strSpeedHuntPlayer   The Player at run a Speed Hunt
 * @return     {void}
 * @example    friendshunt.methods.gameplay.setPosition( strGameplayRole, objTracking, objResult, intPlayerCount, strSpeedHuntPlayer );
 *
*/
window[ appAlias ].methods.gameplay.setPosition = function( strGameplayRole, objTracking, objResult, intPlayerCount, strSpeedHuntPlayer ) {
  var arrColors           = [ '#00aa00', '#ff0000', '#0000ff', '#ff00ff', '#00aaaa', '#aaaa00', '#000000', '#00aa00', '#ff0000', '#0000ff', '#ff00ff', '#00aaaa', '#aaaa00', '#000000' ];
  var objLastPosition     = objTracking.position.at( -1 );
  var objGameSettings     = window[ appAlias ].gameSettings;
  var objGameState        = window[ appAlias ].gameplayState;
  var objSpeedHuntState   = objGameState.speedHuntState;
  var strMyGameRole       = objResult.gameRole;
  var strMarkerContent    = '';
  var strSpeedHuntMessage = '';
  var strCapturedMessage  = '';

  if( objSpeedHuntState.speedHuntCount > 0 ) {
    strSpeedHuntMessage = ' Ping ' + objSpeedHuntState.speedHuntCount + ' von ' + objSpeedHuntState.speedHuntCountMax + '.';
  }

  if( strGameplayRole == 'player' ) {
    if( strMyGameRole == 'player' ) {
      if( objGameSettings.showPlayer == 0 && objTracking.id != window[ appAlias ].playerId ) return;

      strMarkerContent   += '<p class="bold">' + objTracking.name + '</p>';

      if( objSpeedHuntState.speedHuntCount > 0 ) {
        strMarkerContent   += '<p>' + objSpeedHuntState.message + strSpeedHuntMessage + '</p>';
      } else {
        strMarkerContent   += '<p>' + objSpeedHuntState.message + '</p>';
      }

      if( objTracking.id == window[ appAlias ].playerId ) {
        strCapturedMessage = '<p class="pointer bold danger-text" onclick="javascript: window[ appAlias ].methods.gameplay.showCaptureLayer();">Ich wurde gefangen...</p>';
      }
    } else if( strMyGameRole == 'hunter' ) {
      $strPlayerName = objGameSettings.showNames == '1' ? objTracking.name : 'Spieler ' + intPlayerCount;

      if( objSpeedHuntState.speedHuntCount == -1 ) {
        strMarkerContent   += '<p class="bold">' + $strPlayerName + '</p>';
        strMarkerContent   += '<p>' + objSpeedHuntState.message + '</p>';
      } else if( objSpeedHuntState.speedHuntCount == 0 ) {
        strMarkerContent   += '<p class="bold pointer" onclick="javascript: window[ appAlias ].methods.gameplay.speedHunt(\'' + objTracking.id + '\');">';
        strMarkerContent   += $strPlayerName;
        strMarkerContent   += '</p>';
        strMarkerContent   += '<p>' + objSpeedHuntState.message + '</p>';
      } else {
        if( objTracking.id == objSpeedHuntState.playerId ) {
          strMarkerContent   += '<p class="bold pointer" onclick="javascript: window[ appAlias ].methods.gameplay.speedHunt(\'' + objTracking.id + '\');">';
          strMarkerContent   += $strPlayerName;
          strMarkerContent   += '</p>';
        } else {
          strMarkerContent   += '<p class="bold">' + $strPlayerName + '</p>';
        }

        strMarkerContent   += '<p>' + objSpeedHuntState.message.slice(0, -1) + ' auf ' + strSpeedHuntPlayer + '.' + strSpeedHuntMessage + '</p>';
      }
    } else {
      strMarkerContent   += '<p class="bold">' + $strPlayerName + '</p>';

      if( objSpeedHuntState.speedHuntCount > 0 ) {
        strMarkerContent   += '<p>' + objSpeedHuntState.message.slice(0, -1) + ' auf ' + objSpeedHuntState.playerName + '.' + strSpeedHuntMessage + '</p>';
      } else {
        strMarkerContent   += '<p>' + objSpeedHuntState.message + '</p>';
      }
    }

    strMarkerContent   += '<p>' + window[ appAlias ].gameplayState.nextSilentHuntMessage + '</p>';
    strMarkerContent   += '<p>Rolle: Spieler</p>';
  } else if( strGameplayRole == 'hunter' ) {
    if( strMyGameRole == 'player' ) return;
    strMarkerContent   += '<p class="bold">' + objTracking.name + '</p>';
    strMarkerContent   += '<p>Rolle: Jäger</p>';
  } else {
    strMarkerContent   += '<p class="bold">' + objTracking.name + '</p>';
    strMarkerContent   += '<p>Rolle: Spielleitung</p>';
  }

  strMarkerContent   += '<p>Letztes Tracking: ' + window[ appAlias ].methods.gameplay.timestampToDateTimeString( objLastPosition.timestamp, 'time' ) + ' Uhr</p>';
  strMarkerContent   += '<p>Genauigkeit: ' + objLastPosition.precision + ' Meter</p>';
  strMarkerContent   += strCapturedMessage;

  window[ appAlias ].tracker.geoMapsObject.setMarker( objTracking.id, strGameplayRole, arrColors[ intPlayerCount ], objLastPosition.lat, objLastPosition.lng, strMarkerContent );

  return;
};

/**
 * This Function generate and fired the Ajax Request for a Speed Hunt.
 *
 * @function
 * @public
 * @name       speedHunt
 * @memberof   friendshunt
 * @access     public
 * @since      2026-06-06
 * @version    0.1.0
 * @param      {string}   strPlayerId   The Player Id being hunted
 * @return     {void}
 * @example    friendshunt.methods.gameplay.speedHunt( strPlayerId );
 *
*/
window[ appAlias ].methods.gameplay.speedHunt = function( strPlayerId ) {
  var objPost = { 'class': 'Game', 'id': window[ appAlias ].id, 'methode': 'gameplay' };

  objPost.gameplayMethode = 'speedHunt';
  objPost.callback        = 'setPositions';
  objPost.playerId        = strPlayerId;
  objPost.timestamp       = new Date().getTime();

  return window[ appAlias ].methods.request( 'POST', { "result": "json", "view": window[ appAlias ].view.alias }, objPost, 'proccessResponse' );
};

/**
 * This Function format a Timestamp to a Human readable Format.
 *
 * @function
 * @public
 * @name       timestampToDateTimeString
 * @memberof   friendshunt
 * @access     public
 * @since      2026-06-06
 * @version    0.1.0
 * @param      {string}   strTimestamp          The Timestamp
 * @param      {string}   strFormat             The Result Format ( date -> only Date, time -> only Time and datetime -> full Datetime )
 * @return     {string}   strFormatedDateTime   The formated, human readable DateTime String
 * @example    strFormatedDateTime = friendshunt.methods.gameplay.timestampToDateTimeString( strTimestamp, strFormat );
 *
*/
window[ appAlias ].methods.gameplay.timestampToDateTimeString = function( strTimestamp, strFormat ) {
  const objDateTime = new Date( strTimestamp * 1000 );

  if( strFormat == 'date' ) {
    return objDateTime.toLocaleDateString( 'de-DE' );
  } else if( strFormat == 'time' ) {
    return objDateTime.toLocaleTimeString( 'de-DE', { hour: '2-digit', minute: '2-digit', second: '2-digit' } );
  }

  return objDateTime.toLocaleString( 'de-DE' );
};

/**
 * This Function hide and unhide the Message Layer of the Gamplay Page scrolled to the End of the Messages.
 *
 * @function
 * @public
 * @name       showMessageLayer
 * @memberof   friendshunt
 * @access     public
 * @since      2026-06-06
 * @version    0.1.0
 * @return     {void}
 * @example    friendshunt.methods.gameplay.showMessageLayer();
 *
*/
window[ appAlias ].methods.gameplay.showMessageLayer = function() {
  var objMessageLayer     = document.querySelector( '#game-message-layer' );
  var objMessageContainer = document.querySelector( '#game-message-content' );

  if( objMessageLayer.classList.contains( 'hidden' ) ) {
    objMessageLayer.classList.remove( 'hidden' );
    document.querySelector( '.icon-new-message' ).classList.add( 'hidden' );
    objMessageContainer.scrollTo( { 'top': objMessageContainer.scrollHeight, 'behavior': 'smooth' } );

    objMessageLayer.style.height = ( window.innerHeight - 120 ) + 'px';
  } else {
    objMessageLayer.classList.add( 'hidden' );
  }

  return;
}

/**
 * This Function generate and fired a New Message Ajax Request from the current Player.
 *
 * @function
 * @public
 * @name       sendNewMessage
 * @memberof   friendshunt
 * @access     public
 * @since      2026-06-06
 * @version    0.1.0
 * @return     {void}
 * @example    friendshunt.methods.gameplay.sendNewMessage();
 *
*/
window[ appAlias ].methods.gameplay.sendNewMessage = function() {
  var objNewMessage = document.querySelector( '#new-game-message' );
  var objPost       = { 'class': 'Game', 'id': window[ appAlias ].id, 'methode': 'gameplay' };

  objPost.gameplayMethode = 'message';
  objPost.callback        = 'setMessages';
  objPost.playerId        = window[ appAlias ].playerId;
  objPost.timestamp       = new Date().getTime();
  objPost.message         = objNewMessage.value;

  return window[ appAlias ].methods.request( 'POST', { "result": "json", "view": window[ appAlias ].view.alias }, objPost, 'proccessResponse' );
}

/**
 * This Function set the Messages to the Message Layer at the Gameplay Page.
 *
 * @function
 * @public
 * @name       setMessages
 * @memberof   friendshunt
 * @access     public
 * @since      2026-06-06
 * @version    0.1.0
 * @return     {void}
 * @example    friendshunt.methods.gameplay.setMessages();
 *
*/
window[ appAlias ].methods.gameplay.setMessages = function() {
  var objNewMessage       = document.querySelector( '#new-game-message' ).value = '';
  var strLastMessageId    = '';
  var strContent          = '';
  var objMessageContainer = document.querySelector( '#game-message-content' );

  for( var i = 0; i < window[ appAlias ].gameplayMessages.length; i++ ) {
    var objMessage        = window[ appAlias ].gameplayMessages[ i ];
    var strRealPlayerName = objMessage.playerName;
    var strPlayerName     = '';

    strContent           += objMessage.playerId == window[ appAlias ].playerId ? '<div class="game-message-from-me"><div>' : '<div class="game-message-from-other" id="' + objMessage.id + '"><div>';

    if( objMessage.playerId != window[ appAlias ].playerId ) strLastMessageId = objMessage.id;

    if( strPlayerName == '' ) {
      for( var j = 0; j < window[ appAlias ].gameSettings.playerIds.length; j++ ) {
        if( window[ appAlias ].gameSettings.playerIds[ j ] != objMessage.playerId ) continue;

        strPlayerName  = window[ appAlias ].gameSettings.showNames == '1' ? strRealPlayerName + ' - Spieler' : 'Spieler ' + ( j + 1 );
        strPlayerName  = objMessage.playerId == window[ appAlias ].playerId ? strRealPlayerName + ' - Spieler' : strPlayerName;

        break;
      }
    }

    if( strPlayerName == '' ) {
      for( var j = 0; j < window[ appAlias ].gameSettings.hunterIds.length; j++ ) {
        if( window[ appAlias ].gameSettings.hunterIds[ j ] != objMessage.playerId ) continue;

        strPlayerName  = window[ appAlias ].gameSettings.showNames == '1' ? strRealPlayerName + ' - Jäger' : 'Jäger ' + ( j + 1 );
        strPlayerName  = objMessage.playerId == window[ appAlias ].playerId ? strRealPlayerName + ' - Jäger' : strPlayerName;

        break;
      }
    }

    if( strPlayerName == '' ) {
      for( var j = 0; j < window[ appAlias ].gameSettings.managementIds.length;j++ ) {
        if( window[ appAlias ].gameSettings.managementIds[ j ] != objMessage.playerId ) continue;

        strPlayerName  = window[ appAlias ].gameSettings.showNames == '1' ? strRealPlayerName + ' - Spielleitung' : 'Spielleitung ' + ( j + 1 );
        strPlayerName  = objMessage.playerId == window[ appAlias ].playerId ? strRealPlayerName + ' - Spielleitung' : strPlayerName;

        break;
      }
    }

    strContent += objMessage.message;
    strContent += '<p class="game-message-footer">' + strPlayerName + ' (' + window[ appAlias ].methods.gameplay.timestampToDateTimeString( objMessage.timestamp, '' ) + ')</p>';
    strContent += '</div></div>';
  }

  objMessageContainer.innerHTML = strContent;

  objMessageContainer.scrollTo( { 'top': objMessageContainer.scrollHeight, 'behavior': 'smooth' } );

  if( strLastMessageId != window[ appAlias ].lastMessageId ) {
    window[ appAlias ].lastMessageId = strLastMessageId;

    window[ appAlias ].methods.cPlayMessagePiep();
    window[ appAlias ].methods.cTriggerMessageVibration();

    if( document.querySelector( '#game-message-layer' ).classList.contains( 'hidden' ) ) document.querySelector( '.icon-new-message' ).classList.remove( 'hidden' );
  }

  return;
}









window.addEventListener( 'load', function() {
  window[ appAlias ].methods.gameplay.init();

  return;
} );

window.addEventListener( 'pageshow', function() {

  return;
} );