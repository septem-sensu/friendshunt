window[ appAlias ]            = window[ appAlias ] || {};
window[ appAlias ].methods    = window[ appAlias ].methods || {};
window[ appAlias ].listener   = window[ appAlias ].listener || {};
window[ appAlias ].responses  = window[ appAlias ].responses || [];
window[ appAlias ].formErrors = window[ appAlias ].formErrors || [];


window[ appAlias ].methods.cStartGame = function( objElement ) {
  var objPost       = { 'class': 'Game', 'methode': 'startGame' };
  var objGeoTracker = new GeoTracker();

  objPost.id        = objElement.closest( '.content-container' ).querySelector( 'input[name="game-id"]' ).value;

  // Berechtigung für iOS (Safari) anfordern – muss durch einen Klick getriggert werden!
  if ( typeof DeviceMotionEvent.requestPermission === 'function' ) {
    DeviceMotionEvent.requestPermission().then( strPermissionState => {
      if ( strPermissionState === 'granted' ) objGeoTracker.startPedometer();
    } );
  }

  return window[ appAlias ].methods.request( 'POST', { "result": "json", "view": window[ appAlias ].view.alias }, objPost , 'proccessResponse' );
};

window[ appAlias ].methods.cProccessResponseSaveGame = function( objResponseObject ) {
  window[ appAlias ].methods.proccessResponse( objResponseObject );
  document.location = 'index.php?view=dashboard';

  return;
};

window[ appAlias ].methods.cGetPlayerInfoHtml = function( objPlayer, strInputName ) {
  var strContentContainerContent = '';

  strContentContainerContent    += '<table class="w-100p"><tr><td class="w-160 align-top">';
  strContentContainerContent    += '<img class="c-dashboard-player-image" src="includes/files/player/' + objPlayer.email + '/' + objPlayer.image + '" />';
  strContentContainerContent    += '<div class="align-left w-100p mt-10"><button onclick="javascript: this.closest(\'.content-container\').remove();" type="button" class="w-140 warning event-remove-player-from-game">Spieler entfernen</button></div>';
  strContentContainerContent    += '</td><td class="align-top">';
  strContentContainerContent    += '<p class="bold mb-10">' + objPlayer.name + '</p>';
  strContentContainerContent    += '<p>' + objPlayer.email + '</p>';
  strContentContainerContent    += '<p>' + objPlayer.role + '</p>';
  strContentContainerContent    += '<p>' + objPlayer.title + '</p>';
  strContentContainerContent    += '<input type="hidden" name="' + strInputName + '" value="' + objPlayer.email + '">';

  strContentContainerContent    += '</td></tr></table>';

  return strContentContainerContent;
};

window[ appAlias ].methods.cProccessResponseAddManagementToGame = function( objResponseObject ) {
  var arrMethods = objResponseObject.result.methods;

  if( objResponseObject.result.methode != 'addManagementToGame' ) return;
  if( document.querySelector( '#' + objResponseObject.result.player.replaceAll( '@', 'at' ).replaceAll( '.', 'punkt' ) ) != null ) {
    window[ appAlias ].methods.manageFormErrors( [ { 'field': '#search-management-field' } ] );
    return;
  }

  var strContentContainer        = document.createElement( 'div' );
  var objPlayer                  = objResponseObject.result.playerObject;
  strContentContainer.innerHTML  = window[ appAlias ].methods.cGetPlayerInfoHtml( objPlayer, 'management-id' );
  strContentContainer.id         = objPlayer.email.replaceAll( '@', 'at' ).replaceAll( '.', 'punkt' );

  document.querySelector( '#search-management-field' ).value = '';

  strContentContainer.classList.add( 'content-container' );
  strContentContainer.classList.add( 'align-left' );
  document.querySelector( '#game-content-container-management' ).append( strContentContainer );

  window[ appAlias ].methods.proccessResponse( objResponseObject );

  return;
};

window[ appAlias ].methods.cProccessResponseAddPlayerToGame = function( objResponseObject ) {
  var arrMethods = objResponseObject.result.methods;

  if( objResponseObject.result.methode != 'addPlayerToGame' ) return;
  if( document.querySelector( '#' + objResponseObject.result.player.replaceAll( '@', 'at' ).replaceAll( '.', 'punkt' ) ) != null ) {
    window[ appAlias ].methods.manageFormErrors( [ { 'field': '#search-player-field' } ] );
    return;
  }

  var strContentContainer        = document.createElement( 'div' );
  var objPlayer                  = objResponseObject.result.playerObject;
  strContentContainer.innerHTML  = window[ appAlias ].methods.cGetPlayerInfoHtml( objPlayer, 'player-id' );
  strContentContainer.id         = objPlayer.email.replaceAll( '@', 'at' ).replaceAll( '.', 'punkt' );

  document.querySelector( '#search-player-field' ).value = '';

  strContentContainer.classList.add( 'content-container' );
  strContentContainer.classList.add( 'align-left' );
  document.querySelector( '#game-content-container-player' ).append( strContentContainer );

  window[ appAlias ].methods.proccessResponse( objResponseObject );

  return;
};

window[ appAlias ].methods.cProccessResponseAddHunterToGame = function( objResponseObject ) {
  var arrMethods = objResponseObject.result.methods;

  if( objResponseObject.result.methode != 'addHunterToGame' ) return;
  if( document.querySelector( '#' + objResponseObject.result.player.replaceAll( '@', 'at' ).replaceAll( '.', 'punkt' ) ) != null ) {
    window[ appAlias ].methods.manageFormErrors( [ { 'field': '#search-hunter-field' } ] );
    return;
  }

  var strContentContainer        = document.createElement( 'div' );
  var objPlayer                  = objResponseObject.result.playerObject;
  strContentContainer.innerHTML  = window[ appAlias ].methods.cGetPlayerInfoHtml( objPlayer, 'hunter-id' );
  strContentContainer.id         = objPlayer.email.replaceAll( '@', 'at' ).replaceAll( '.', 'punkt' );

  document.querySelector( '#search-hunter-field' ).value = '';

  strContentContainer.classList.add( 'content-container' );
  strContentContainer.classList.add( 'align-left' );
  document.querySelector( '#game-content-container-hunter' ).append( strContentContainer );

  window[ appAlias ].methods.proccessResponse( objResponseObject );

  return;
};

window[ appAlias ].methods.cAddGamesToTemplate = function() {
  var arrGames  = typeof window[ appAlias ].games == 'object' && window[ appAlias ].games != null ? window[ appAlias ].games : [];
  var objFields = window[ appAlias ].gameFields;

  for( var i = 0; i < arrGames.length; i++ ) {
    var strContentContainer        = document.createElement( 'div' );
    var strContentContainerContent = '';

    strContentContainerContent    += '<table class="w-100p"><tr>';
    strContentContainerContent    += '<td class="align-top align-left">';
    strContentContainerContent    += '<div class="w-100p"><button type="button" class="w-160 info" onclick="javascript: window[ appAlias ].methods.cStartGame( this );">Spiel spielen</button></div>';
    strContentContainerContent    += '<div class="w-100p"><button onclick="javascript: document.location.href=\'?view=gameDashboard&id=' + arrGames[ i ].id + '&class=game\' " type="button" class="w-160 mt-5 event-delete-game primary">Dashboard</button></div>';
    strContentContainerContent    += '<div class="w-100p"><button type="button" class="w-160 warning mt-5 hidden game-archive-button" onclick="javascript: window[ appAlias ].methods.cArchiveGame( this );">Spiel archivieren</button></div>';
    strContentContainerContent    += '<div class="w-100p hidden game-delete-button"><button onclick="javascript: window[ appAlias ].methods.cDeleteGame( this );" type="button" class="w-160 mt-5 event-delete-game danger">Spiel löschen</button></div>';
    strContentContainerContent    += '</td>';
    strContentContainerContent    += '<td class="w-160 align-top align-right">';
    strContentContainerContent    += '<img class="c-dashboard-player-image my-account-image" src="includes/files/game/' + arrGames[ i ].id + '/' + arrGames[ i ].avatar + '" />';
    strContentContainerContent    += '</td>';
    strContentContainerContent    += '</tr></table>';
    strContentContainerContent    += '<table><tr><td><span class="bold">Name:</span></td><td><span class="bold">' + arrGames[ i ].name + '</span></td></tr>';
    strContentContainerContent    += '<tr><td>Titel:</td><td>' + arrGames[ i ].title + '</td></tr>';
    strContentContainerContent    += '<tr><td class="pr-10">Beschreibung:</td><td>' + arrGames[ i ].description  + '</td></tr>';
    strContentContainerContent    += '<tr><td class="pr-10 bold">Start:</td><td class="bold">' + window[ appAlias ].methods.TimeStringToTimeString( arrGames[ i ].start )  + '</td></tr></table>';
    strContentContainerContent    += '<input type="hidden" name="game-id" value="' + arrGames[ i ].id + '">';
    strContentContainer.innerHTML  = strContentContainerContent;

    strContentContainer.classList.add( 'content-container' );
    strContentContainer.classList.add( 'align-left' );
    document.querySelector( '#game-content-container' ).append( strContentContainer );
  }

  window[ appAlias ].methods.unhideGameDeleteButtons();

  return;
};

window[ appAlias ].methods.cAddGameplayDataToTemplate = function() {
  $arrMembers      = [ 'player', 'hunter', 'management' ];
  $objGameplayData = typeof window[ appAlias ].gameplayData == 'object' && window[ appAlias ].gameplayData != null ? window[ appAlias ].gameplayData : null;

  for( var i = 0; i < $arrMembers.length; i++ ) {
    for( var j = 0; j < $objGameplayData[ $arrMembers[ i ] ].length; j++ ) {
      var strContentContainer        = document.createElement( 'div' );
      var strContentContainerContent = '<div class="content-container align-left">';

      strContentContainerContent    += '<table class="w-100p"><tr><td class="align-top mr-15" style="width: 195px">';
      strContentContainerContent    += '<img class="c-dashboard-player-image my-account-image mr-10" src="includes/files/player/' + $objGameplayData[ $arrMembers[ i ] ][ j ].email + '/' + $objGameplayData[ $arrMembers[ i ] ][ j ].image + '" />';
      strContentContainerContent    += '</td><td class="align-top">';
      strContentContainerContent    += '<p class="bold mb-10">' + $objGameplayData[ $arrMembers[ i ] ][ j ].name + '</p>';
      strContentContainerContent    += '<p>' + $objGameplayData[ $arrMembers[ i ] ][ j ].email + '</p>';
      strContentContainerContent    += '<p>' + $objGameplayData[ $arrMembers[ i ] ][ j ].role + '</p>';
      strContentContainerContent    += '<p>' + $objGameplayData[ $arrMembers[ i ] ][ j ].title + '</p>';
      strContentContainerContent    += '</td></tr></table>';
      strContentContainerContent    += '</div>';

      strContentContainer.innerHTML  = strContentContainerContent;
      document.querySelector( '#game-content-container-' + $arrMembers[ i ] ).append( strContentContainer );
    }
  }

  return;
};

window[ appAlias ].methods.cAddGameImagesContent = function() {
  if( typeof window[ appAlias ].gameImages != 'object' || window[ appAlias ].gameImages == null ) return;

  var arrGameImages = window[ appAlias ].gameImages;

  for( var i = 0; i < arrGameImages.length; i++ ) {
    var objImageTag = document.createElement( 'img' );
    objImageTag.classList.add( 'c-dashboard-player-image' );
    objImageTag.classList.add( 'game-image-gallery-image' );
    objImageTag.classList.add( 'mr-5' );
    objImageTag.classList.add( 'ml-5' );
    objImageTag.classList.add( 'mb-6' );
    objImageTag.classList.add( 'zoom-image' );
    objImageTag.classList.add( 'pointer' );

    objImageTag.src = 'includes/files/game/' + window[ appAlias ].id + '/' + arrGameImages[ i ];

    document.querySelector( '#game-images-content-container' ).append( objImageTag );
  }

  return;
};

window[ appAlias ].methods.cArchiveGame = function( strElement ) {
  var objHtmlGamesContainer = strElement.closest( '.content-container' );
  var strGameId             = objHtmlGamesContainer.querySelector( 'input[name="game-id"]' ) != null ? objHtmlGamesContainer.querySelector( 'input[name="game-id"]' ).value : null;
  var objPost               = { 'class': 'Game', 'id': strGameId, 'methode': 'archiveGame' };

  if( typeof strGameId != 'string' || strGameId == null ) return;

  return window[ appAlias ].methods.request( 'POST', { "result": "json", "view": window[ appAlias ].view.alias }, objPost, 'cProccessResponseArchiveGame' );
};

window[ appAlias ].methods.cProccessResponseArchiveGame = function( objResponse ) {
  var arrResultMethods = objResponse.result.methods;

  if( typeof objResponse.result.methode != 'string' || objResponse.result.methode != 'archiveGame' ) return;
  if( typeof objResponse.result.id != 'string' || objResponse.result.id == '' ) return;
  document.querySelector( 'input[value="' + objResponse.result.id + '"]' ).closest('.content-container').remove();

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

  if( typeof objResponse.result.methode != 'string' || objResponse.result.methode != 'deleteGame' ) return;
  if( typeof objResponse.result.id != 'string' || objResponse.result.id == '' ) return;
  document.querySelector( 'input[value="' + objResponse.result.id + '"]' ).closest('.content-container').remove();

  return;
};

window[ appAlias ].methods.TimeStringToTimeString = function( strTime ) {
  const objDateTimer     = new Date( strTime );
  const strFormattedDate = objDateTimer.toLocaleString( 'de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  } );

  return strFormattedDate;
}

window[ appAlias ].methods.cCloseFullImage = function() {
  document.querySelector('.full-image img').remove();
  document.querySelector('.full-image-layer').style.display = 'none';
  document.querySelector('.full-image').style.display = 'none';

  return;
};








window.addEventListener( 'load', function() {


  return;
} );

window.addEventListener( 'pageshow', function() {

  return;
} );