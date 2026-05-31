window[ appAlias ]            = window[ appAlias ] || {};
window[ appAlias ].methods    = window[ appAlias ].methods || {};
window[ appAlias ].listener   = window[ appAlias ].listener || {};
window[ appAlias ].responses  = window[ appAlias ].responses || [];
window[ appAlias ].formErrors = window[ appAlias ].formErrors || [];


window[ appAlias ].methods.cStartGame = function( objElement ) {
  var objPost = { 'class': 'Game', 'methode': 'startGame' };
  objPost.id  = objElement.closest( '.content-container' ).querySelector( 'input[name="game-id"]' ).value;

  return window[ appAlias ].methods.request( 'POST', { "result": "json", "view": window[ appAlias ].view.alias }, objPost , 'proccessResponse' );
};

window[ appAlias ].methods.cProccessResponseSaveGame = function( objResponseObject ) {
  window[ appAlias ].methods.proccessResponse( objResponseObject );
  document.location = 'index.php?view=dashboard';

  return;
};

window[ appAlias ].methods.cProccessResponseAddPlayerToGame = function( objResponseObject ) {
  var arrMethods = objResponseObject.result.methods;

  for( var i = 0; i < arrMethods.length; i++ ) {
    if( arrMethods[ i ].methode != 'addPlayerToGame' ) continue;
    if( document.querySelector( '#' + arrMethods[ i ].player.replaceAll( '@', 'at' ).replaceAll( '.', 'punkt' ) ) != null ) {
      window[ appAlias ].methods.manageFormErrors( [ { 'field': '#search-player-field' } ] );
      return;
    }

    var strContentContainer        = document.createElement( 'div' );
    var objPlayer                  = arrMethods[ i ].playerObject;
    var strContentContainerContent = '';

    strContentContainer.id         = objPlayer.email.replaceAll( '@', 'at' ).replaceAll( '.', 'punkt' );    
    strContentContainerContent    += '<table class="w-100p"><tr><td class="w-160 align-top">';
    strContentContainerContent    += '<img class="c-dashboard-player-image mr-10" src="files/player/' + objPlayer.email + '/avatar.png?v="' + Date.now() + ' />';
    strContentContainerContent    += '</td><td class="align-top">';
    strContentContainerContent    += '<p><span class="bold">Name: ' + objPlayer.name + '</span></p>';
    strContentContainerContent    += '<p>Geschlecht: ' + window[ appAlias ].fields.gender.options[ objPlayer.gender ] + '</p>';
    strContentContainerContent    += '<p>Orientierung: ' + window[ appAlias ].fields.orientation.options[ objPlayer.orientation ] + '</p>';
    strContentContainerContent    += '<p>Charakter: ' + window[ appAlias ].fields.character.options[ objPlayer.character ] + '</p>';
    strContentContainerContent    += '<input type="hidden" name="player-id" value="' + objPlayer.email + '">';
    strContentContainerContent    += '<div class="align-right w-100p"><button onclick="javascript: this.closest(\'.content-container\').remove();" type="button" class="warning event-remove-player-from-game">Spieler entfernen</button></div>';
    strContentContainerContent    += '</td></tr></table>';
    strContentContainer.innerHTML  = strContentContainerContent;

    document.querySelector( '#search-player-field' ).value = '';

    strContentContainer.classList.add( 'content-container' );
    strContentContainer.classList.add( 'align-left' );
    document.querySelector( '#game-content-container' ).append( strContentContainer );
  }

  window[ appAlias ].methods.proccessResponse( objResponseObject );

  return;
};

window[ appAlias ].methods.cAddGamesToTemplate = function() {
  var arrGames  = typeof window[ appAlias ].games == 'object' && window[ appAlias ].games != null ? window[ appAlias ].games : [];
  var objFields = window[ appAlias ].gameFields;

  for( var i = 0; i < arrGames.length; i++ ) {
    var strContentContainer        = document.createElement( 'div' );
    var strContentContainerContent = '';

    strContentContainerContent    += '<table class="w-100p"><tr><td class="w-160 align-top">';
    strContentContainerContent    += '<img class="c-dashboard-player-image mr-10" src="files/game/' + arrGames[ i ].id + '/' + arrGames[ i ].avatar + '" />';
    strContentContainerContent    += '</td><td class="align-top">';
    strContentContainerContent    += '<p><span class="bold">Name: ' + arrGames[ i ].name + '</span></p>';
    strContentContainerContent    += '<p>Level: ' + objFields.level.options[ arrGames[ i ].level ] + '</span></p>';
    strContentContainerContent    += '<p>Story: ' + '</span></p>';
    strContentContainerContent    += '<input type="hidden" name="game-id" value="' + arrGames[ i ].id + '">';
    strContentContainerContent    += '</td><td class="align-top">';
    strContentContainerContent    += '<div class="align-right w-100p"><button type="button" class="w-140 info" onclick="javascript: window[ appAlias ].methods.cStartGame( this );">Spiel spielen</button></div>';
    strContentContainerContent    += '<div class="align-right w-100p"><button onclick="javascript: window[ appAlias ].methods.cDeleteGame( this );" type="button" class="w-140 mt-5 event-delete-game warning">Spiel löschen</button></div>';
    strContentContainerContent    += '</td></tr></table>';
    strContentContainer.innerHTML  = strContentContainerContent;
    
    strContentContainer.classList.add( 'content-container' );
    document.querySelector( '#game-content-container' ).append( strContentContainer );  
  }

  return;
};

window[ appAlias ].methods.cDeleteGame = function( strElement ) {  
  var objHtmlGamesContainer = strElement.closest( '.content-container' );
  var strGameId             = objHtmlGamesContainer.querySelector( 'input[name="game-id"]' ) != null ? objHtmlGamesContainer.querySelector( 'input[name="game-id"]' ).value : null;
  var objPost               = { 'class': 'Game', 'id': strGameId, 'methode': 'deleteGame' };

  if( typeof strGameId != 'string' || strGameId == null ) return;

  return window[ appAlias ].methods.request( 'POST', { "result": "json", "view": window[ appAlias ].view.alias }, objPost, 'cProccessResponseDeleteGame' );
};

window[ appAlias ].methods.cProccessResponseDeleteGame = function( objResponse ) {  
  var arrResultMethods = objResponse.result.methods;

  for( var i = 0; i < arrResultMethods.length; i++ ) {
    if( typeof arrResultMethods[ i ].methode != 'string' || arrResultMethods[ i ].methode != 'deleteGame' ) continue;
    if( typeof arrResultMethods[ i ].id != 'string' || arrResultMethods[ i ].id == '' ) continue;
    document.querySelector( 'input[value="' + arrResultMethods[ i ].id + '"]' ).closest('.content-container').remove();
  }

  return;
};



window.addEventListener( 'load', function() {
  window[ appAlias ].methods.cAddGamesToTemplate();
  
  return;
} );

window.addEventListener( 'pageshow', function() {
  
  return;
} ); 