window[ appAlias ]            = window[ appAlias ] || {};
window[ appAlias ].listener   = window[ appAlias ].listener || {};

window[ appAlias ].listener.loginButtons = function() {
  var arrLoginButtons = document.querySelectorAll( '.event-login' );

  for( var i = 0; i < arrLoginButtons.length; i++ ) {
    arrLoginButtons[ i ].addEventListener( 'click', function() {
      return window[ appAlias ].methods.request( 'POST', { "result": "json", "view": window[ appAlias ].view.alias }, window[ appAlias ].methods.newJsonRequestObject( 'Player', 'login', null ), 'proccessResponse' );
    } );
  }

  return;
};

window[ appAlias ].listener.newPlayerButtons = function() {
  var arrRegisterButtons = document.querySelectorAll( '.event-new-player' );

  for( var i = 0; i < arrRegisterButtons.length; i++ ) {
    arrRegisterButtons[ i ].addEventListener( 'click', function() {
      var objPost = window[ appAlias ].methods.newJsonRequestObject( 'Player', 'newPlayer', null );
      objPost.id = objPost.email;
      objPost.image = 'avatar.png';

      return window[ appAlias ].methods.request( 'POST', { "result": "json", "view": window[ appAlias ].view.alias }, objPost, 'proccessResponse' );
    } );
  }

  return;
};

window[ appAlias ].listener.saveObject = function() {
  if( document.querySelector( '#event-save-object' ) == null ) return;

  document.querySelector( '#event-save-object' ).addEventListener( 'click', function() {
    return window[ appAlias ].methods.request( 'POST', { "result": "json", "view": window[ appAlias ].view.alias }, window[ appAlias ].methods.newJsonRequestObject( 'Player', 'saveRequestObject', window[ appAlias ].id ), 'cProccessResponseSaveGame' );
  } );

  return;
};

window[ appAlias ].listener.addPlayerToGame = function() {
  if( document.querySelector( '#event-add-player-to-game' ) == null ) return;

  document.querySelector( '#event-add-player-to-game' ).addEventListener( 'click', function() {
    window[ appAlias ].methods.resetFormErrors();

    var strSearchField = document.querySelector( '#search-player-field' ) != null ? document.querySelector( '#search-player-field' ).value : null;
    var objPost        = { 'class': 'Game', 'methode': 'addPlayerToGame', 'player': strSearchField };

    if( strSearchField == null || strSearchField.length < 6 ) {
      window[ appAlias ].methods.manageFormErrors( [ { 'field': '#search-player-field' } ] );
      return;
    }

    return window[ appAlias ].methods.request( 'POST', { "result": "json", "view": window[ appAlias ].view.alias }, objPost, 'cProccessResponseAddPlayerToGame' );
  } );

  return;
};

window[ appAlias ].listener.deletePlayer = function() {
  if( document.querySelector( '#event-delete-player' ) == null ) return;

  document.querySelector( '#event-delete-player' ).addEventListener( 'click', function(){
    var objPost        = { 'class': window[ appAlias ].class, 'methode': 'deletePlayer', 'id': window[ appAlias ].id };

    return window[ appAlias ].methods.request( 'POST', { "result": "json", "view": window[ appAlias ].view.alias }, objPost, 'proccessResponse' );
  } );

  return;
};

window[ appAlias ].listener.saveNewGame = function() {
  if( document.querySelector( '#event-save-new-game' ) == null ) return;

  document.querySelector( '#event-save-new-game' ).addEventListener( 'click', function() {
    var arrPlayerHtmlObjects = document.querySelectorAll('input[name="player-id"]');
    var objPost              = { 'player': [], 'class': 'Game', 'methode': 'saveNewGame' };

    objPost.level            = document.querySelector('#level') != null ? document.querySelector('#level').value : null;
    objPost.name             = document.querySelector('#name') != null ? document.querySelector('#name').value : null;
    objPost.moderator        = document.querySelector('#moderator') != null ? document.querySelector('#moderator').value : null;

    if( arrPlayerHtmlObjects.length < 2 ) {
      window[ appAlias ].methods.manageFormErrors( [ { 'field': '#search-player-field' } ] );
      return;
    }

    for( var i = 0; i < arrPlayerHtmlObjects.length; i++ ) {
      objPost.player.push( arrPlayerHtmlObjects[ i ].value );
    }

    return window[ appAlias ].methods.request( 'POST', { "result": "json", "view": window[ appAlias ].view.alias }, objPost, 'proccessResponse' );
  } );

  return;
};

window[ appAlias ].listener.changePlayerPassword = function() {
  if( document.querySelector( '#event-change-player-password' ) == null ) return;

  document.querySelector( '#event-change-player-password' ).addEventListener( 'click', function() {
    var strPassword1 = document.querySelector( '#password-temp' ) != null ? document.querySelector( '#password-temp' ).value : null;
    var strPassword2 = document.querySelector( '#password2-temp' ) != null ? document.querySelector( '#password2-temp' ).value : null;
    var objPost      = { 'class': window[ appAlias ].class, 'id': window[ appAlias ].id, 'methode': 'saveRequestObject', 'password': strPassword1 };

    if( strPassword1 == null || strPassword2 == null || strPassword1 != strPassword2 || ! window[ appAlias ].methods._validatePassword( strPassword1 ) ) {
      window[ appAlias ].methods.manageFormErrors( [ { 'field': '#password-temp' }, { 'field': '#password2-temp' } ] );
      return;
    }

    window[ appAlias ].methods.resetFormErrors();

    return window[ appAlias ].methods.request( 'POST', { "result": "json", "view": window[ appAlias ].view.alias }, objPost, 'proccessResponse' );
  } );

  return;
};

window[ appAlias ].listener.uploadAvatar = function() {
  var arrFileUploadButtons = document.querySelectorAll( '#avatar-upload' );

  for( var i = 0; i < arrFileUploadButtons.length; i++ ) {
    arrFileUploadButtons[ i ].addEventListener( 'change', function( objEvent ) {
      if( ! event.target.files[ 0 ] ) return;

      var objFormData = new FormData();

      objFormData.append( 'files', document.querySelector( '#avatar-upload' ).files[ 0 ]);
      objFormData.append( 'class', 'Player' );
      objFormData.append( 'id', window[ appAlias ].id );
      objFormData.append( 'property', 'image' );
      objFormData.append( 'methode', 'Player::avatarFileUploaded' );

      return window[ appAlias ].methods.request( 'POSTBIN', { "result": "json", "view": window[ appAlias ].view.alias }, objFormData, 'proccessResponse' );
    } );
  }

  return;
};

window[ appAlias ].listener.uploadAvatarOpenDialog = function() {
  if( document.querySelector( '#avatar' ) == null ) return;

  document.querySelector( '#avatar' ).addEventListener( 'click', function() {
    if( document.querySelector( '#avatar-upload' ) != null ) document.querySelector( '#avatar-upload' ).click();

    return;
  } );

  return;
};

window[ appAlias ].listener.changePlayerAvatar = function() {
  if( document.querySelector( '#event-change-player-avatar' ) == null ) return;

  document.querySelector( '#event-change-player-avatar' ).addEventListener( 'click', function(){
    return window[ appAlias ].methods.request( 'POST', { "result": "json", "view": window[ appAlias ].view.alias }, window[ appAlias ].methods.newJsonRequestObject( 'Player', 'changePlayerAvatar', window[ appAlias ].id ), 'proccessResponse' );
  } );

  return;
};

window[ appAlias ].listener.links = function() {
  var arrLinks = document.querySelectorAll( '.event-link' );

  for( var i = 0; i < arrLinks.length; i++ ) {
    if( ! arrLinks[ i ].hasAttribute( 'data-link' ) ) continue;
    arrLinks[ i ].addEventListener( 'click', function() {
      document.location = this.getAttribute( 'data-link' );
      return;
    });
  }

  return;
};

window[ appAlias ].listener.resetForms = function() {
  var arrForms = document.querySelectorAll( 'form' );

  for( var i = 0; i < arrForms.length; i++ ) {
    if( arrForms[ i ].querySelector( 'input[name="resetForm"]' ) == null ) continue;
    if( arrForms[ i ].querySelector( 'input[name="resetForm"]' ).value != "1" ) continue;
    arrForms[ i ].reset();
  }

  return;
};

window.addEventListener( 'load', function() {
  window[ appAlias ].listener.loginButtons();
  window[ appAlias ].listener.newPlayerButtons();
  window[ appAlias ].listener.links();
  window[ appAlias ].listener.uploadAvatar();
  window[ appAlias ].listener.changePlayerAvatar();
  window[ appAlias ].listener.uploadAvatarOpenDialog();
  window[ appAlias ].listener.saveObject();
  window[ appAlias ].listener.changePlayerPassword();
  window[ appAlias ].listener.addPlayerToGame();
  window[ appAlias ].listener.saveNewGame();
  window[ appAlias ].listener.deletePlayer();

  return;
} );

window.addEventListener( 'pageshow', function() {
  window[ appAlias ].listener.resetForms();

  return;
} );