window[ appAlias ].methods.gameplay  = window[ appAlias ].methods.gameplay || {};
window[ appAlias ].listener.gameplay = window[ appAlias ].listener.gameplay || {};
window[ appAlias ].tracker           = window[ appAlias ].tracker || {};
window[ appAlias ].gameplayState     = window[ appAlias ].gameplayState || {};

window[ appAlias ].methods.gameplay.init = function() {
  window[ appAlias ].tracker.geoTrackerObject = new GeoTracker();
  window[ appAlias ].tracker.geoTrackerObject.getCurrentPosition( 'setMap' );
  window[ appAlias ].tracker.geoTrackerObject.startIntervalTracking( 'track' );

  return;
};

window[ appAlias ].methods.gameplay.setMap = function( lat, lng, precision, message ) {
  window[ appAlias ].tracker.geoMapsObject = new GeoMaps();

  window[ appAlias ].tracker.geoMapsObject.setMap( lat, lng, 'map' );
  window[ appAlias ].methods.gameplay.track( lat, lng, precision, message );

  return;
};

window[ appAlias ].methods.gameplay.track = function( lat, lng, precision, message ) {
  var objPost = { 'class': 'Game', 'id': window[ appAlias ].id, 'methode': 'gameplay' };

  objPost.gameplayMethode = 'track';
  objPost.callback        = 'setPositions';
  objPost.playerId        = window[ appAlias ].playerId;
  objPost.lat             = lat;
  objPost.lng             = lng;
  objPost.precision       = precision;
  objPost.message         = message;
  objPost.timestamp       = new Date().getTime();

  return window[ appAlias ].methods.request( 'POST', { "result": "json", "view": window[ appAlias ].view.alias }, objPost, 'proccessResponse' );
};

window[ appAlias ].methods.gameplay.setPositions = function( objResponse ) {
  var arrGameplayRoles   = [ 'player', 'hunter', 'management' ];
  var strSpeedHuntPlayer = '';

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

  for( var k = 0; k < arrGameplayRoles.length; k++ ) {
    for( var i = 0; i < objResponse.result.positions[  arrGameplayRoles[ k ] ].length; i++ ) {
      if( objResponse.result.positions[  arrGameplayRoles[ k ] ][ i ].position.length < 1 ) continue;

      var objTracking     = objResponse.result.positions[  arrGameplayRoles[ k ] ][ i ];

      window[ appAlias ].methods.gameplay.setPosition( arrGameplayRoles[ k ], objTracking, objResponse.result, i + 1, strSpeedHuntPlayer );
    }
  }

  window[ appAlias ].methods.gameplay.setStateLine();
  window[ appAlias ].methods.gameplay.setMessages();

  return;
};

window[ appAlias ].methods.gameplay.setStateLine = function() {
  $strStateLine = '';

  if( window[ appAlias ].gameplayState.gameState == 'stopped' ) {
    $strStateLine += window[ appAlias ].gameplayState.gameStateMessage + ' ';
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
  }

  document.querySelector( '#game-scrolling-info-text' ).innerHTML = $strStateLine;

  return;
}

window[ appAlias ].methods.gameplay.setPosition = function( strGameplayRole, objTracking, objResult, intPlayerCount, strSpeedHuntPlayer ) {
  var arrColors           = [ '#00aa00', '#ff0000', '#0000ff', '#ff00ff', '#00aaaa', '#aaaa00', '#000000', '#00aa00', '#ff0000', '#0000ff', '#ff00ff', '#00aaaa', '#aaaa00', '#000000' ];
  var objLastPosition     = objTracking.position.at( -1 );
  var objGameSettings     = window[ appAlias ].gameSettings;
  var objGameState        = window[ appAlias ].gameplayState;
  var objSpeedHuntState   = objGameState.speedHuntState;
  var strMyGameRole       = objResult.gameRole;
  var strMarkerContent    = '';
  var strSpeedHuntMessage = '';

  if( objSpeedHuntState.speedHuntCount > 0 ) {
    strSpeedHuntMessage = ' Ping ' + objSpeedHuntState.speedHuntCount + ' von ' + objSpeedHuntState.speedHuntCountMax + '.';
  }

  if( strGameplayRole == 'player' ) {
    if( strMyGameRole == 'player' && objGameSettings.showPlayer == 0 && objTracking.id != window[ appAlias ].playerId ) return;
    if( strMyGameRole == 'player' ) {
      strMarkerContent   += '<p class="bold">' + objTracking.name + '</p>';

      if( objSpeedHuntState.speedHuntCount > 0 ) {
        strMarkerContent   += '<p>' + objSpeedHuntState.message + strSpeedHuntMessage + '</p>';
      } else {
        strMarkerContent   += '<p>' + objSpeedHuntState.message + '</p>';
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

  window[ appAlias ].tracker.geoMapsObject.setMarker( objTracking.id, strGameplayRole, arrColors[ intPlayerCount ], objLastPosition.lat, objLastPosition.lng, strMarkerContent );

  return;
};

window[ appAlias ].methods.gameplay.speedHunt = function( strPlayerId ) {
  var objPost = { 'class': 'Game', 'id': window[ appAlias ].id, 'methode': 'gameplay' };

  objPost.gameplayMethode = 'speedHunt';
  objPost.callback        = 'setPositions';
  objPost.playerId        = strPlayerId;
  objPost.timestamp       = new Date().getTime();

  console.log( 'speedHunt' );

  return window[ appAlias ].methods.request( 'POST', { "result": "json", "view": window[ appAlias ].view.alias }, objPost, 'proccessResponse' );
};

window[ appAlias ].methods.gameplay.timestampToDateTimeString = function( strTimestamp, strFormat ) {
  const objDateTime = new Date( strTimestamp * 1000 );

  if( strFormat == 'date' ) {
    return objDateTime.toLocaleDateString( 'de-DE' );
  } else if( strFormat == 'time' ) {
    return objDateTime.toLocaleTimeString( 'de-DE', { hour: '2-digit', minute: '2-digit', second: '2-digit' } );
  }

  return objDateTime.toLocaleString( 'de-DE' );
};

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

window[ appAlias ].methods.gameplay.setMessages = function() {
  var objNewMessage       = document.querySelector( '#new-game-message' ).value = '';
  var strLastMessageId    = '';
  var strContent          = '';
  var objMessageContainer = document.querySelector( '#game-message-content' );

  for( var i = 0; i < window[ appAlias ].gameplayMessages.length; i++ ) {
    var objMessage     = window[ appAlias ].gameplayMessages[ i ];
    var strPlayerName  = '';

    strContent        += objMessage.playerId == window[ appAlias ].playerId ? '<div class="game-message-from-me"><div>' : '<div class="game-message-from-other" id="' + objMessage.id + '"><div>';

    if( objMessage.playerId != window[ appAlias ].playerId ) strLastMessageId = objMessage.id;

    if( window[ appAlias ].gameSettings.showNames == '1' ) {
      strPlayerName = objMessage.playerName;
    } else {
      if( objMessage.playerId == window[ appAlias ].playerId ) strPlayerName = objMessage.playerName;

      if( strPlayerName == '' ) {
        for( var j = 0; j < window[ appAlias ].gameSettings.playerIds.length; j++ ) {
          if( window[ appAlias ].gameSettings.playerIds[ j ] == objMessage.playerId ) {
            strPlayerName = 'Spieler ' + ( j + 1 );
            break;
          }
        }
      }

      if( strPlayerName == '' ) {
        for( var j = 0; j < window[ appAlias ].gameSettings.hunterIds.length; j++ ) {
          if( window[ appAlias ].gameSettings.hunterIds[ j ] == objMessage.playerId ) {
            strPlayerName = 'Jäger ' + ( j + 1 );
            break;
          }
        }
      }

      if( strPlayerName == '' ) {
        for( var j = 0; j < window[ appAlias ].gameSettings.managementIds.length;j++ ) {
          if( window[ appAlias ].gameSettings.managementIds[ j ] == objMessage.playerId ) {
            strPlayerName = 'Spielleitung ' + ( j + 1 );
            break;
          }
        }
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