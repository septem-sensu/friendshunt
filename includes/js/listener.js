/**
 * Event Listener Package for the Friends Hunt App.
 *
 * This Package represents the Event Listener Package for the Friends Hunt App with his Functions.
 *
 * @public
 * @module        listener.js
 * @namespace     friendshunt
 * @access        public
 * @author        Markus Götz <info@septem-sensu.de>
 * @since         2026-06-06
 * @version       0.1.0
 * @copyright     2026 Markus Götz <info@septem-sensu.de>
 *
*/
window[ appAlias ]            = window[ appAlias ] || {};
window[ appAlias ].listener   = window[ appAlias ].listener || {};
window[ appAlias ].tracker    = window[ appAlias ].tracker || {};

/**
 * This Function register the Event Listener for the Login Buttons at the Login Page and process the Functions by Click Event.
 * The Function generate and fired the Ajax Request for the Player Login.
 * The Event Listener registered at Pageload Ready.
 *
 * @function
 * @public
 * @name       loginButtons
 * @memberof   friendshunt
 * @access     public
 * @since      2026-06-06
 * @version    0.1.0
 * @return     {void}
 * @example    friendshunt.listener.loginButtons();
 *
*/
window[ appAlias ].listener.loginButtons = function() {
  var arrLoginButtons = document.querySelectorAll( '.event-login' );

  for( var i = 0; i < arrLoginButtons.length; i++ ) {
    arrLoginButtons[ i ].addEventListener( 'click', function() {
      return window[ appAlias ].methods.request( 'POST', { "result": "json", "view": window[ appAlias ].view.alias }, window[ appAlias ].methods.newJsonRequestObject( 'Player', 'login', null ), 'proccessResponse' );
    } );
  }

  return;
};

/**
 * This Function register the Event Listener for the New Player Button at the My Account Page for Administrators and process the Functions by Click Event.
 * The Function generate and fired the Ajax Request for a new Player (only available for Administrators).
 * The Event Listener registered at Pageload Ready.
 *
 * @function
 * @public
 * @name       newPlayerButtons
 * @memberof   friendshunt
 * @access     public
 * @since      2026-06-06
 * @version    0.1.0
 * @return     {void}
 * @example    friendshunt.listener.newPlayerButtons();
 *
*/
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

/**
 * This Function register the Event Listener for the Save Button and process the Functions by Click Event.
 * The Function generate and fired the Ajax Request for save a Object.
 * The Event Listener registered at Pageload Ready.
 *
 * @function
 * @public
 * @name       saveObject
 * @memberof   friendshunt
 * @access     public
 * @since      2026-06-06
 * @version    0.1.0
 * @return     {void}
 * @example    friendshunt.listener.saveObject();
 *
*/
window[ appAlias ].listener.saveObject = function() {
  if( document.querySelector( '#event-save-object' ) == null ) return;

  document.querySelector( '#event-save-object' ).addEventListener( 'click', function() {
    var objPost = window[ appAlias ].methods.newJsonRequestObject( 'Player', 'saveRequestObject', window[ appAlias ].id );

    objPost.redirect = 'index.php?view=player';

    return window[ appAlias ].methods.request( 'POST', { "result": "json", "view": window[ appAlias ].view.alias }, objPost, 'proccessResponse' );
  } );

  return;
};

/**
 * This Function register the Event Listener for add a Game Player Player to the Game Button on the New Game Page and process the Functions by Click Event.
 * The Function generate and fired the Ajax Request for add Game Player Player to the Game (only available for Administrators).
 * The Event Listener registered at Pageload Ready.
 *
 * @function
 * @public
 * @name       addPlayerToGame
 * @memberof   friendshunt
 * @access     public
 * @since      2026-06-06
 * @version    0.1.0
 * @return     {void}
 * @example    friendshunt.listener.addPlayerToGame();
 *
*/
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

/**
 * This Function register the Event Listener for add a Game Hunter Player to the Game Button on the New Game Page and process the Functions by Click Event.
 * The Function generate and fired the Ajax Request for add Game Hunter Player to the Game (only available for Administrators).
 * The Event Listener registered at Pageload Ready.
 *
 * @function
 * @public
 * @name       addHunterToGame
 * @memberof   friendshunt
 * @access     public
 * @since      2026-06-06
 * @version    0.1.0
 * @return     {void}
 * @example    friendshunt.listener.addHunterToGame();
 *
*/
window[ appAlias ].listener.addHunterToGame = function() {
  if( document.querySelector( '#event-add-hunter-to-game' ) == null ) return;

  document.querySelector( '#event-add-hunter-to-game' ).addEventListener( 'click', function() {
    window[ appAlias ].methods.resetFormErrors();

    var strSearchField = document.querySelector( '#search-hunter-field' ) != null ? document.querySelector( '#search-hunter-field' ).value : null;
    var objPost        = { 'class': 'Game', 'methode': 'addHunterToGame', 'player': strSearchField };

    if( strSearchField == null || strSearchField.length < 6 ) {
      window[ appAlias ].methods.manageFormErrors( [ { 'field': '#search-hunter-field' } ] );
      return;
    }

    return window[ appAlias ].methods.request( 'POST', { "result": "json", "view": window[ appAlias ].view.alias }, objPost, 'cProccessResponseAddHunterToGame' );
  } );

  return;
};

/**
 * This Function register the Event Listener for add a Game Management Player to the Game Button on the New Game Page and process the Functions by Click Event.
 * The Function generate and fired the Ajax Request for add Game Management Player to the Game (only available for Administrators).
 * The Event Listener registered at Pageload Ready.
 *
 * @function
 * @public
 * @name       addManagementToGame
 * @memberof   friendshunt
 * @access     public
 * @since      2026-06-06
 * @version    0.1.0
 * @return     {void}
 * @example    friendshunt.listener.addManagementToGame();
 *
*/
window[ appAlias ].listener.addManagementToGame = function() {
  if( document.querySelector( '#event-add-management-to-game' ) == null ) return;

  document.querySelector( '#event-add-management-to-game' ).addEventListener( 'click', function() {
    window[ appAlias ].methods.resetFormErrors();

    var strSearchField = document.querySelector( '#search-management-field' ) != null ? document.querySelector( '#search-management-field' ).value : null;
    var objPost        = { 'class': 'Game', 'methode': 'addManagementToGame', 'player': strSearchField };

    if( strSearchField == null || strSearchField.length < 6 ) {
      window[ appAlias ].methods.manageFormErrors( [ { 'field': '#search-management-field' } ] );
      return;
    }

    return window[ appAlias ].methods.request( 'POST', { "result": "json", "view": window[ appAlias ].view.alias }, objPost, 'cProccessResponseAddManagementToGame' );
  } );

  return;
};

/**
 * This Function register the Event Listener for delete a Player to from the Game Button on the My Account Page and process the Functions by Click Event.
 * The Function generate and fired the Ajax Request for delete a Player (only available for Administrators).
 * The Event Listener registered at Pageload Ready.
 *
 * @function
 * @public
 * @name       deletePlayer
 * @memberof   friendshunt
 * @access     public
 * @since      2026-06-06
 * @version    0.1.0
 * @return     {void}
 * @example    friendshunt.listener.deletePlayer();
 *
*/
window[ appAlias ].listener.deletePlayer = function() {
  if( document.querySelector( '#event-delete-player' ) == null ) return;

  document.querySelector( '#event-delete-player' ).addEventListener( 'click', function(){
    var objPost        = { 'class': window[ appAlias ].class, 'methode': 'deletePlayer', 'id': window[ appAlias ].id };

    return window[ appAlias ].methods.request( 'POST', { "result": "json", "view": window[ appAlias ].view.alias }, objPost, 'proccessResponse' );
  } );

  return;
};

/**
 * This Function register the Event Listener for save a new Game Button on the new Game Page and process the Functions by Click Event.
 * The Function generate and fired the Ajax Request for save a new Game (only available for Administrators).
 * The Event Listener registered at Pageload Ready.
 *
 * @function
 * @public
 * @name       saveNewGame
 * @memberof   friendshunt
 * @access     public
 * @since      2026-06-06
 * @version    0.1.0
 * @return     {void}
 * @example    friendshunt.listener.saveNewGame();
 *
*/
window[ appAlias ].listener.saveNewGame = function() {
  if( document.querySelector( '#event-save-new-game' ) == null ) return;

  document.querySelector( '#event-save-new-game' ).addEventListener( 'click', function() {
    var arrPlayerHtmlObjects     = document.querySelectorAll('input[name="player-id"]');
    var arrHunterHtmlObjects     = document.querySelectorAll('input[name="hunter-id"]');
    var arrManagementHtmlObjects = document.querySelectorAll('input[name="management-id"]');

    var objPost                  = { 'player': [], 'hunter': [], 'management': [], 'class': 'Game', 'methode': 'saveNewGame' };

    objPost.name                 = document.querySelector('#name') != null ? document.querySelector('#name').value : null;
    objPost.title                = document.querySelector('#title') != null ? document.querySelector('#title').value : null;
    objPost.description          = document.querySelector('#description') != null ? document.querySelector('#description').value : null;
    objPost.start                = document.querySelector('#start') != null ? document.querySelector('#start').value : null;
    objPost.duration             = document.querySelector('#duration') != null ? document.querySelector('#duration').value : null;
    objPost.pingInterval         = document.querySelector('#pingInterval') != null ? document.querySelector('#pingInterval').value : null;
    objPost.speedPingInterval    = document.querySelector('#speedPingInterval') != null ? document.querySelector('#speedPingInterval').value : null;
    objPost.speedPingCount       = document.querySelector('#speedPingCount') != null ? document.querySelector('#speedPingCount').value : null;
    objPost.startPosition        = document.querySelector('#startPosition') != null ? document.querySelector('#startPosition').value : null;
    objPost.exitPosition         = document.querySelector('#exitPosition') != null ? document.querySelector('#exitPosition').value : null;
    objPost.trackInterval        = document.querySelector('#trackInterval') != null ? document.querySelector('#trackInterval').value : null;
    objPost.showPlayer           = document.querySelector('#showPlayer') != null ? document.querySelector('#showPlayer').value : null;
    objPost.showNames            = document.querySelector('#showNames') != null ? document.querySelector('#showNames').value : null;

    if( arrPlayerHtmlObjects.length < 1 ) {
      window[ appAlias ].methods.manageFormErrors( [ { 'field': '#search-player-field' } ] );
      return;
    }

    if( arrHunterHtmlObjects.length < 1 ) {
      window[ appAlias ].methods.manageFormErrors( [ { 'field': '#search-hunter-field' } ] );
      return;
    }

    for( var i = 0; i < arrPlayerHtmlObjects.length; i++ ) {
      objPost.player.push( arrPlayerHtmlObjects[ i ].value );
    }

    for( var i = 0; i < arrHunterHtmlObjects.length; i++ ) {
      objPost.hunter.push( arrHunterHtmlObjects[ i ].value );
    }

    for( var i = 0; i < arrManagementHtmlObjects.length; i++ ) {
      objPost.management.push( arrManagementHtmlObjects[ i ].value );
    }

    return window[ appAlias ].methods.request( 'POST', { "result": "json", "view": window[ appAlias ].view.alias }, objPost, 'proccessResponse' );
  } );

  return;
};

/**
 * This Function register the Event Listener for save a new Password Button on the My Account Edit Page and process the Functions by Click Event.
 * The Function generate and fired the Ajax Request for save a new Password.
 * The Event Listener registered at Pageload Ready.
 *
 * @function
 * @public
 * @name       changePlayerPassword
 * @memberof   friendshunt
 * @access     public
 * @since      2026-06-06
 * @version    0.1.0
 * @return     {void}
 * @example    friendshunt.listener.changePlayerPassword();
 *
*/
window[ appAlias ].listener.changePlayerPassword = function() {
  if( document.querySelector( '#event-change-player-password' ) == null ) return;

  document.querySelector( '#event-change-player-password' ).addEventListener( 'click', function() {
    if( this.hasAttribute( 'disabled' ) && typeof this.getAttribute( 'disabled' ) == 'string' && this.getAttribute( 'disabled' ) == 'disabled' ) return;

    var strPassword1 = document.querySelector( '#password' ) != null ? document.querySelector( '#password' ).value : null;
    var strPassword2 = document.querySelector( '#password2' ) != null ? document.querySelector( '#password2' ).value : null;
    var objPost      = { 'class': window[ appAlias ].class, 'id': window[ appAlias ].id, 'methode': 'saveRequestObject', 'password': strPassword1, 'redirect': 'index.php?view=player' };

    if( strPassword1 == null || strPassword2 == null || strPassword1 != strPassword2 || ! window[ appAlias ].methods._validatePassword( strPassword1 ) ) {
      window[ appAlias ].methods.manageFormErrors( [ { 'field': '#password' }, { 'field': '#password2' } ] );
      return;
    }

    window[ appAlias ].methods.resetFormErrors();

    return window[ appAlias ].methods.request( 'POST', { "result": "json", "view": window[ appAlias ].view.alias }, objPost, 'proccessResponse' );
  } );

  return;
};

/**
 * This Function register the Event Listener for save a new Player or Game Avatar Button on the My Account / Game Dashboard Page and process the Functions by Click Event.
 * The Function generate and fired the Ajax Request for save a new Avatar (Game Avatar is only available for Administrators).
 * The Event Listener registered at Pageload Ready.
 *
 * @function
 * @public
 * @name       uploadAvatar
 * @memberof   friendshunt
 * @access     public
 * @since      2026-06-06
 * @version    0.1.0
 * @return     {void}
 * @example    friendshunt.listener.uploadAvatar();
 *
*/
window[ appAlias ].listener.uploadAvatar = function() {
  var arrFileUploadButtons = document.querySelectorAll( '#avatar-upload' );

  for( var i = 0; i < arrFileUploadButtons.length; i++ ) {
    arrFileUploadButtons[ i ].addEventListener( 'change', function( objEvent ) {
      if( ! objEvent.target.files[ 0 ] ) return;

      var objFormData = new FormData();
      var strClass    = 'Player';
      var strMethode  = 'Player::avatarFileUploaded';
      var strProperty = 'image';

      if( typeof window[ appAlias ].class != 'undefined' && window[ appAlias ].class == 'Game' ) {
        strClass = 'Game';
        strMethode = 'Game::avatarFileUploaded';
        strProperty = 'avatar';
      }

      objFormData.append( 'files', document.querySelector( '#avatar-upload' ).files[ 0 ] );
      objFormData.append( 'class', strClass );
      objFormData.append( 'id', window[ appAlias ].id );
      objFormData.append( 'property', strProperty );
      objFormData.append( 'methode', strMethode );
      objFormData.append( 'redirect', '?view=' + window[ appAlias ].view.alias + '&class=' + strClass + '&id=' + window[ appAlias ].id );

      return window[ appAlias ].methods.request( 'POSTBIN', { "result": "json", "view": window[ appAlias ].view.alias }, objFormData, 'proccessResponse' );
    } );
  }

  return;
};

/**
 * This Function register the Event Listener for show the Zoom Image Layer and process the Functions by Click Event.
 * The Event Listener registered at Pageload Ready.
 *
 * @function
 * @public
 * @name       zoomImageListenter
 * @memberof   friendshunt
 * @access     public
 * @since      2026-06-06
 * @version    0.1.0
 * @return     {void}
 * @example    friendshunt.listener.zoomImageListenter();
 *
*/
window[ appAlias ].listener.zoomImageListenter = function() {
  var arrZoomImages = document.querySelectorAll('.zoom-image');

  for( var i = 0; i < arrZoomImages.length; i++ ) {
    arrZoomImages[ i ].addEventListener( 'click', function() {
      document.querySelector('.full-image-layer').style.display = 'block';
      document.querySelector('.full-image').style.display = 'block';

      var tagImage = '<img src="' + this.src + '" />';

      document.querySelector('.full-image').innerHTML = tagImage;

      return;
    });
  }

  return;
};

/**
 * This Function register the Event Listener for uplaod a new Game Image Button and process the Functions by Change the File Dialog Event.
 * The Function generate and fired the Ajax Request for upload a new Game Image.
 * The Event Listener registered at Pageload Ready.
 *
 * @function
 * @public
 * @name       uploadGameImages
 * @memberof   friendshunt
 * @access     public
 * @since      2026-06-06
 * @version    0.1.0
 * @return     {void}
 * @example    friendshunt.listener.uploadGameImages();
 *
*/
window[ appAlias ].listener.uploadGameImages = function() {
  var arrFileUploadButtons = document.querySelectorAll( '#game-images-upload' );

  for( var i = 0; i < arrFileUploadButtons.length; i++ ) {
    arrFileUploadButtons[ i ].addEventListener( 'change', function( objEvent ) {
      if( ! objEvent.target.files[ 0 ] ) return;

      var objFormData = new FormData();

      objFormData.append( 'files', document.querySelector( '#game-images-upload' ).files[ 0 ]);
      objFormData.append( 'class', 'Game' );
      objFormData.append( 'id', window[ appAlias ].id );
      objFormData.append( 'property', 'tmpImageAdd' );
      objFormData.append( 'methode', 'Game::addGameImage' );

      if( window[ appAlias ].view.alias == 'gameDashboard' ) {
        objFormData.append( 'redirect', '?view=gameDashboard&class=Game&id=' + window[ appAlias ].id );
      }

      return window[ appAlias ].methods.request( 'POSTBIN', { "result": "json", "view": window[ appAlias ].view.alias }, objFormData, 'proccessResponse' );
    } );
  }

  return;
};

/**
 * This Function register the Event Listener for show the File Dialog to upload a new Avatar and process the Functions by Click Event.
 * The Event Listener registered at Pageload Ready.
 *
 * @function
 * @public
 * @name       uploadAvatarOpenDialog
 * @memberof   friendshunt
 * @access     public
 * @since      2026-06-06
 * @version    0.1.0
 * @return     {void}
 * @example    friendshunt.listener.uploadAvatarOpenDialog();
 *
*/
window[ appAlias ].listener.uploadAvatarOpenDialog = function() {
  if( document.querySelector( '#avatar' ) == null ) return;

  document.querySelector( '#avatar' ).addEventListener( 'click', function() {
    if( document.querySelector( '#avatar-upload' ) != null ) document.querySelector( '#avatar-upload' ).click();

    return;
  } );

  return;
};

/**
 * This Function register the Event Listener for show the File Dialog to upload a new game Image and process the Functions by Click Event.
 * The Event Listener registered at Pageload Ready.
 *
 * @function
 * @public
 * @name       uploadGameImagesOpenDialog
 * @memberof   friendshunt
 * @access     public
 * @since      2026-06-06
 * @version    0.1.0
 * @return     {void}
 * @example    friendshunt.listener.uploadGameImagesOpenDialog();
 *
*/
window[ appAlias ].listener.uploadGameImagesOpenDialog = function() {
  if( document.querySelector( '#event-game-images-upload-button' ) == null ) return;

  document.querySelector( '#event-game-images-upload-button' ).addEventListener( 'click', function() {
    if( document.querySelector( '#game-images-upload' ) != null ) document.querySelector( '#game-images-upload' ).click();

    return;
  } );

  return;
};

/**
 * This Function register the Event Listener for Links and process the Functions by Click Event.
 * The Event Listener registered at Pageload Ready.
 *
 * @function
 * @public
 * @name       links
 * @memberof   friendshunt
 * @access     public
 * @since      2026-06-06
 * @version    0.1.0
 * @return     {void}
 * @example    friendshunt.listener.links();
 *
*/
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

/**
 * This Function register the Event Listener for Reset Forms and process the Functions by Click Event.
 * The Event Listener registered at Pageshow.
 *
 * @function
 * @public
 * @name       resetForms
 * @memberof   friendshunt
 * @access     public
 * @since      2026-06-06
 * @version    0.1.0
 * @return     {void}
 * @example    friendshunt.listener.resetForms();
 *
*/
window[ appAlias ].listener.resetForms = function() {
  var arrForms = document.querySelectorAll( 'form' );

  for( var i = 0; i < arrForms.length; i++ ) {
    if( arrForms[ i ].querySelector( 'input[name="resetForm"]' ) == null ) continue;
    if( arrForms[ i ].querySelector( 'input[name="resetForm"]' ).value != "1" ) continue;
    arrForms[ i ].reset();
  }

  return;
};

/**
 * This Function register the Event Listener for format Date Time and process the Functions by Click Event.
 * The Event Listener registered at Pageload Ready.
 *
 * @function
 * @public
 * @name       formatDateTime
 * @memberof   friendshunt
 * @access     public
 * @since      2026-06-06
 * @version    0.1.0
 * @return     {void}
 * @example    friendshunt.listener.formatDateTime();
 *
*/
window[ appAlias ].listener.formatDateTime = function() {
  var arrFormateTags = document.querySelectorAll( '.format-date-time' );

  for( var i = 0; i < arrFormateTags.length; i++ ) {
    arrFormateTags[ i ].innerHTML = window[ appAlias ].methods.TimeStringToTimeString( arrFormateTags[ i ].innerHTML );
  }

  return;
};

/**
 * This Function register the Event Listener for press the Enter Key.
 * The Event Listener registered at Pageload Ready.
 *
 * @function
 * @public
 * @name       enterKey
 * @memberof   friendshunt
 * @access     public
 * @since      2026-06-06
 * @version    0.1.0
 * @return     {void}
 * @example    friendshunt.listener.enterKey();
 *
*/
window[ appAlias ].listener.enterKey = function() {
  var objInputLoginName     = document.querySelector( 'input#name' );
  var objInputLoginPassword = document.querySelector( 'input#password' );
  var objLoginSubmit        = document.querySelector( 'button.event-login' );

  if( objLoginSubmit != null && objInputLoginName != null && objInputLoginPassword != null ) {
    objInputLoginName.addEventListener( 'keydown', function( objEvent ) {
      if ( objEvent.key === 'Enter' ) {
        objEvent.preventDefault();
        objLoginSubmit.click();
      }

      return;
    } );

    objInputLoginPassword.addEventListener( 'keydown', function( objEvent ) {
      if ( objEvent.key === 'Enter' ) {
        objEvent.preventDefault();
        objLoginSubmit.click();
      }

      return;
    } );
  }



  return;
};

/**
 * This Function register the Event Listener for click the Setup Button.
 * The Event Listener registered at Pageload Ready.
 *
 * @function
 * @public
 * @name       setupButton
 * @memberof   friendshunt
 * @access     public
 * @since      2026-06-06
 * @version    0.1.0
 * @return     {void}
 * @example    friendshunt.listener.setupButton();
 *
*/
window[ appAlias ].listener.setupButton = function() {
  var objSetupButton = document.querySelector( '.event-setup' );

  if( objSetupButton != null ) {
    objSetupButton.addEventListener( 'click', function() {
      var objPost                  = { 'class': 'Player', 'methode': 'setup' };

      objPost.email                = document.querySelector('#email') != null ? document.querySelector('#email').value : null;
      objPost.password             = document.querySelector('#password') != null ? document.querySelector('#password').value : null;
      objPost.name                 = document.querySelector('#name') != null ? document.querySelector('#name').value : null;
      objPost.title                = document.querySelector('#title') != null ? document.querySelector('#title').value : null;
      objPost.description          = document.querySelector('#description') != null ? document.querySelector('#description').value : null;

      return window[ appAlias ].methods.request( 'POST', { "result": "json", "view": window[ appAlias ].view.alias }, objPost, 'proccessResponse' );
    } );
  }

  return;
};

/**
 * This Function register the Event Listener for click the delete Game Image Button.
 * The Event Listener registered at Pageload Ready.
 *
 * @function
 * @public
 * @name       deleteGameplayImageButton
 * @memberof   friendshunt
 * @access     public
 * @since      2026-06-06
 * @version    0.1.0
 * @return     {void}
 * @example    friendshunt.listener.deleteGameplayImageButton();
 *
*/
window[ appAlias ].listener.deleteGameplayImageButton = function() {
  var arrImageButtons = document.querySelectorAll('.delete-game-image-button');

  for( var i = 0; i < arrImageButtons.length; i++ ) {
    arrImageButtons[i].addEventListener( 'click', function() {
      var objPost                  = { 'class': 'Game', 'methode': 'deleteGameImage', 'class': 'Game', 'id': window[ appAlias ].id };
      objPost.imageId  = this.getAttribute( 'data-image-id' );

      return window[ appAlias ].methods.request( 'POST', { "result": "json", "view": window[ appAlias ].view.alias }, objPost, 'proccessResponse' );
    } );
  }

  return;
}

/**
 * This Function register the Event Listener for click start Position Input Field or the exit Position Input Field at Game Configuration Form.
 * The Function opened the OpenStreetMaps Layer.
 * The Event Listener registered at Pageload Ready.
 *
 * @function
 * @public
 * @name       clickOpenMapInLayer
 * @memberof   friendshunt
 * @access     public
 * @since      2026-06-06
 * @version    0.1.0
 * @return     {void}
 * @example    friendshunt.listener.clickOpenMapInLayer();
 *
*/
window[ appAlias ].listener.clickOpenMapInLayer = function() {
  arrMapInfoLayer = document.querySelectorAll('.event-open-map-layer');

  for( var i = 0; i < arrMapInfoLayer.length; i++ ) {
    arrMapInfoLayer[ i ].addEventListener( 'click', function() {
      var objMapLayer = document.querySelector( '#info-layer-map' )

      objMapLayer.classList.remove( 'hidden' );

      objMapLayer.style.height = ( window.innerHeight - 20 ) + 'px';

      window[ appAlias ].tracker.geoTrackerObject = new GeoTracker();

      window[ appAlias ].tracker.geoTrackerObject.getCurrentPosition( 'cShowMapInInfoLayer' );
      window[ appAlias ].tracker.geoTrackerObject.set( 'caller', this );

      return;
    } );
  }

  return;
}




window.addEventListener( 'load', function() {
  window[ appAlias ].listener.loginButtons();
  window[ appAlias ].listener.newPlayerButtons();
  window[ appAlias ].listener.links();
  window[ appAlias ].listener.uploadAvatar();
  window[ appAlias ].listener.uploadGameImages();
  window[ appAlias ].listener.uploadAvatarOpenDialog();
  window[ appAlias ].listener.uploadGameImagesOpenDialog();
  window[ appAlias ].listener.saveObject();
  window[ appAlias ].listener.changePlayerPassword();
  window[ appAlias ].listener.addPlayerToGame();
  window[ appAlias ].listener.addHunterToGame();
  window[ appAlias ].listener.addManagementToGame();
  window[ appAlias ].listener.saveNewGame();
  window[ appAlias ].listener.deletePlayer();
  window[ appAlias ].listener.zoomImageListenter();
  window[ appAlias ].listener.formatDateTime();
  window[ appAlias ].listener.enterKey();
  window[ appAlias ].listener.setupButton();
  window[ appAlias ].listener.deleteGameplayImageButton();
  window[ appAlias ].listener.clickOpenMapInLayer();

  return;
} );



window.addEventListener( 'pageshow', function() {
  window[ appAlias ].listener.resetForms();

  return;
} );