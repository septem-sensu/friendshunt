/**
 * This class represents the player class with all the necessary properties, methods and event handlers.
 * The class inherits from the Base class.
 *
 * @class
 *
 * @see BaseObject
 * @see Communicator
 * @see Utils
 *
 * @author    Markus Götz <info@septem-sensu.de>
 * @version   0.1.0
 * @since     2026-06-18
 *
 * @example   const player = new Player( playerId );
 *
 */

class Player extends BaseObject {
/**
 * This method is the constructor of the class.
 *
 * @public
 *
 * @param     {string}   playerId       The player ID
 * @return    {void}
 *
 * @example   const player = new Player( playerId );
 *
 */
  constructor( playerId ) {
    super();

    this.playerId      = playerId;
    this.games         = window[ appAlias ].objects.games;

    return;
  }

/**
 * This method registers all event handlers that are necessary for the class.
 * The method is called when instantiating a Player object.
 * The method also calls the Super method of the Base Object.
 *
 * @public
 *
 * @return    {void}
 *
 * @example   player.registerEventHandler();
 *
 */
  registerEventHandler() {
    super.registerEventHandler();

    if( Utils.globalRegisteredEvents[ 'Player' ] ) return;
    Utils.globalRegisteredEvents[ 'Player' ] = true;

    const registerButton = document.querySelector( '#event-register-new-player' );

    if( registerButton != null ) {
      registerButton.addEventListener( 'click', ( event ) => {
        const post       = { 'class': 'Player', 'method': 'register' };

        post.id          = document.querySelector( '#email' ).value;
        post.email       = document.querySelector( '#email' ).value;
        post.password    = document.querySelector( '#password' ).value;
        post.password2   = document.querySelector( '#password2' ).value;
        post.name        = document.querySelector( '#name' ).value;
        post.title       = document.querySelector( '#title' ).value;
        post.description = document.querySelector( '#description' ).value;

        this.communicator.request( 'POST', { "result": "json", "view": window[ appAlias ].objects.view.alias }, post, 'processResponse' );

        return;
      } );
    }

    const loginButtons = document.querySelectorAll( '.event-login' );

    for( let i = 0; i < loginButtons.length; i++ ) {
      loginButtons[ i ].addEventListener( 'click', ( event ) => {
        const post    = { 'class': 'Player', 'method': 'login', 'id': null };

        post.name     = document.querySelector( '#name' ).value;
        post.password = document.querySelector( '#password' ).value;

        this.communicator.request( 'POST', { "result": "json", "view": window[ appAlias ].objects.view.alias }, post, 'processResponse' );

        return;
      } );
    }

    const registerButtons = document.querySelectorAll( '.event-new-player' );

    for( let i = 0; i < registerButtons.length; i++ ) {
      registerButtons[ i ].addEventListener( 'click', ( event ) => {
        const post = this.communicator.newJsonRequestObject( 'Player', 'newPlayer', null);

        post.id    =  post.email;
        post.image = 'avatar.png';

        this.communicator.request( 'POST', { "result": "json", "view": window[ appAlias ].objects.view.alias }, post, 'processResponse' );

        return;
      } );
    }

    const passwordChangeButton = document.querySelector( '#event-change-player-password' );

    if( passwordChangeButton != null ) {
      passwordChangeButton.addEventListener( 'click', ( event ) => {
        const element = event.target;

        if( element.hasAttribute( 'disabled' ) && typeof element.getAttribute( 'disabled' ) === 'string' && element.getAttribute( 'disabled' ) === 'disabled' ) return;

        const password1 = document.querySelector( '#password' ) != null ? document.querySelector( '#password' ).value : null;
        const password2 = document.querySelector( '#password2' ) != null ? document.querySelector( '#password2' ).value : null;
        const post      = { 'class': window[ appAlias ].class, 'id': window[ appAlias ].id, 'method': 'saveRequestObject', 'password': password1, 'redirect': 'index.php?view=player' };

        if( password1 == null || password2 == null || password1 !== password2 || ! this.validator._validatePassword( password1 ) ) {
          this.validator.manageFormErrors( [ { 'field': '#password' }, { 'field': '#password2' } ] );
          return;
        }

        this.validator.resetFormErrors();

        this.communicator.request( 'POST', { "result": "json", "view": window[ appAlias ].objects.view.alias }, post, 'processResponse' );

        return;
      } );
    }

    const changePlayerButton = document.querySelector( '#event-save-object' );

    if( changePlayerButton != null ) {
      changePlayerButton.addEventListener( 'click', () => {
        const post = this.communicator.newJsonRequestObject( 'Player', 'saveRequestObject', window[ appAlias ].id );

        post.redirect = 'index.php?view=player';

        this.communicator.request( 'POST', { "result": "json", "view": window[ appAlias ].objects.view.alias }, post, 'processResponse' );
      } );
    }

    const addPlayerToGameButton = document.querySelector( '#event-add-player-to-game' );

    if( addPlayerToGameButton != null ) {
      addPlayerToGameButton.addEventListener( 'click', () => {
        this.validator.resetFormErrors();

        const searchField = document.querySelector( '#search-player-field' ) != null ? document.querySelector( '#search-player-field' ).value : null;
        const post        = { 'class': 'Game', 'method': 'addPlayerToGame', 'player': searchField };

        if( searchField == null || searchField.length < 6 ) {
          this.validator.manageFormErrors( [ { 'field': '#search-player-field' } ] );          return;
        }

        this.communicator.request( 'POST', { "result": "json", "view": window[ appAlias ].objects.view.alias }, post, this.processResponseAddPlayerToGame.bind( this ) );

        return;
      } );
    }

    const addHunterToGameButton = document.querySelector( '#event-add-hunter-to-game' );

    if( addHunterToGameButton != null ) {
      addHunterToGameButton.addEventListener( 'click', () => {
        this.validator.resetFormErrors();

        const searchField = document.querySelector( '#search-hunter-field' ) != null ? document.querySelector( '#search-hunter-field' ).value : null;
        const post        = { 'class': 'Game', 'method': 'addHunterToGame', 'player': searchField };

        if( searchField == null || searchField.length < 6 ) {
          this.validator.manageFormErrors( [ { 'field': '#search-hunter-field' } ] );

          return;
        }

        this.communicator.request( 'POST', { "result": "json", "view": window[ appAlias ].objects.view.alias }, post, this.processResponseAddHunterToGame.bind( this ) );

        return;
      } );
    }

    const addManagementToGameButton = document.querySelector( '#event-add-management-to-game' );

    if( addManagementToGameButton != null ) {
      addManagementToGameButton.addEventListener( 'click', () => {
        this.validator.resetFormErrors();

        const searchField = document.querySelector( '#search-management-field' ) != null ? document.querySelector( '#search-management-field' ).value : null;
        const post        = { 'class': 'Game', 'method': 'addManagementToGame', 'player': searchField };

        if( searchField == null || searchField.length < 6 ) {
          this.validator.manageFormErrors( [ { 'field': '#search-management-field' } ] );

          return;
        }

        this.communicator.request( 'POST', { "result": "json", "view": window[ appAlias ].objects.view.alias }, post, this.processResponseAddManagementToGame.bind( this ) );

        return;
      } );
    }

    const inputLoginName     = document.querySelector( 'input#name' );
    const inputLoginPassword = document.querySelector( 'input#password' );
    const loginSubmit        = document.querySelector( 'button.event-login' );

    if( loginSubmit != null && inputLoginName != null && inputLoginPassword != null ) {
      inputLoginName.addEventListener( 'keydown', function( event ) {
        if( event.key === 'Enter' ) {
          event.preventDefault();
          loginSubmit.click();
        }

        return;
      } );

      inputLoginPassword.addEventListener( 'keydown', function( event ) {
        if( event.key === 'Enter' ) {
          event.preventDefault();
          loginSubmit.click();
        }

        return;
      } );
    }

    const setupButton = document.querySelector( '.event-setup' );

    if( setupButton != null ) {
      setupButton.addEventListener( 'click', () => {
        const post       = { 'class': 'Player', 'method': 'setup' };

        post.email       = document.querySelector('#email') != null ? document.querySelector('#email').value : null;
        post.password    = document.querySelector('#password') != null ? document.querySelector('#password').value : null;
        post.name        = document.querySelector('#name') != null ? document.querySelector('#name').value : null;
        post.title       = document.querySelector('#title') != null ? document.querySelector('#title').value : null;
        post.description = document.querySelector('#description') != null ? document.querySelector('#description').value : null;

        this.communicator.request( 'POST', { "result": "json", "view": window[ appAlias ].objects.view.alias }, post, 'processResponse' );

        return;
      } );
    }

    const playerDeleteButton = document.querySelector( '#event-delete-player' );

    if( playerDeleteButton != null ) {
      playerDeleteButton.addEventListener( 'click', () => {
        const post = { 'class': window[ appAlias ].class, 'method': 'deletePlayer', 'id': window[ appAlias ].id };

        this.communicator.request( 'POST', { "result": "json", "view": window[ appAlias ].objects.view.alias }, post, 'processResponse' );

        return;
      } );
    }

    const fileUploadButtons = document.querySelectorAll( '#avatar-upload' );

    for( let i = 0; i < fileUploadButtons.length; i++ ) {
      fileUploadButtons[ i ].addEventListener( 'change', ( event ) => {
        if( ! event.target.files[ 0 ] ) return;

        const formData = new FormData();

        formData.append( 'files', document.querySelector( '#avatar-upload' ).files[ 0 ] );
        formData.append( 'class', 'Player' );
        formData.append( 'id', window[ appAlias ].id );
        formData.append( 'property', 'image' );
        formData.append( 'method', 'avatarFileUploaded' );
        formData.append( 'redirect', '?view=' + window[ appAlias ].objects.view.alias + '&class=Player&id=' + window[ appAlias ].id );

        return this.communicator.request( 'POSTBIN', { "result": "json", "view": window[ appAlias ].objects.view.alias }, formData, 'processResponse' );
      } );
    }

    const gameTitleSuggest = document.querySelectorAll( '.suggest-game-title' );

    for( let i = 0; i < gameTitleSuggest.length; i++ ) {
      gameTitleSuggest[ i ].value = window[ appAlias ].objects.titles.game[ Math.floor( Math.random() * window[ appAlias ].objects.titles.game.length - 1 ) ];

      gameTitleSuggest[ i ].addEventListener( 'keyup', ( event ) => {
        if( event.target.value === '?' ) event.target.value = window[ appAlias ].objects.titles.game[ Math.floor( Math.random() * window[ appAlias ].objects.titles.game.length - 1 ) ];

        return;
      } );
    }

    const playerTitleSuggest = document.querySelectorAll( '.suggest-player-title' );

    for( let i = 0; i < playerTitleSuggest.length; i++ ) {
      if( playerTitleSuggest[ i ].value === "" ) playerTitleSuggest[ i ].value = window[ appAlias ].objects.titles.player[ Math.floor( Math.random() * window[ appAlias ].objects.titles.player.length - 1 ) ];

      playerTitleSuggest[ i ].addEventListener( 'keyup', ( event ) => {
        if( event.target.value === '?' ) event.target.value = window[ appAlias ].objects.titles.player[ Math.floor( Math.random() * window[ appAlias ].objects.titles.player.length - 1 ) ];

        return;
      } );
    }

    window.addEventListener( 'beforeinstallprompt', ( event ) => {
      event.preventDefault();
      this.activateInstallAppButton( event );

      return;

    } );

    return;
  }

/**
 * This method creates a Request object to fetch the players of a game and fires it to the endpoint via the Communicator object.
 * The callback method is the processResponsePlayerList method which further processes the player data.
 *
 * @public
 *
 * @return    {void}
 *
 * @example   player.getPlayerList();
 *
 */
  getPlayerList() {
    const post          = { 'class': 'Player', 'id': window[ appAlias ].id, 'method': 'getPlayerList' };

    post.callbackMethod = 'processResponsePlayerList';

    this.communicator.request( 'POST', { "result": "json", "view": window[ appAlias ].objects.view.alias }, post, this.processResponse.bind( this ) );

    return;
  }

/**
 * This method is the callback method of the getPlayerList method and sets the players, hunters and game management
 * in the designated place when creating a new game.
 *
 * @public
 *
 * @param     {object}   response   The Response object returned by the Communicator object
 * @return    {void}
 *
 * @todo      Player avatar must be fetched by the player and not saved in the games folder.
 *
 * @example   player.processResponsePlayerList( response );
 *
 */
  processResponsePlayerList( response ) {
    const playerList  = response.result.playerList;
    let playerCounter = 0;

    for( const playerId in playerList ) {
      const contentContainer      = document.createElement( 'div' );
      let contentContainerContent = '<div class="content-container align-left ' + this.cssContainerClasses[ playerCounter % this.cssContainerClasses.length ] + '">';

      contentContainerContent    += '<table class="w-100p"><tr><td class="align-top mr-15" style="width: 195px">';
      contentContainerContent    += '<img class="c-dashboard-player-image my-account-image mr-10" src="includes/files/player/' + playerList[ playerId ].email + '/' + playerList[ playerId ].image + '" alt="Profilbild" />';
      contentContainerContent    += '</td><td class="align-top">';
      contentContainerContent    += '<p class="bold mb-10">' + playerList[ playerId ].name + '</p>';
      contentContainerContent    += '<p>' + playerList[ playerId ].email + '</p>';
      contentContainerContent    += '<p>' + playerList[ playerId ].role + '</p>';
      contentContainerContent    += '<p>' + playerList[ playerId ].title + '</p>';
      contentContainerContent    += '<button data-player-id="' + playerId + '" onclick="javascript: window[ appAlias ].objects.player.deletePlayerFromApp( this );" type="button" class="w-160 mt-10 danger">Spieler löschen</button>';
      contentContainerContent    += '</td></tr></table>';
      contentContainerContent    += '</div>';

      contentContainer.innerHTML  = contentContainerContent;
      document.querySelector( '#content-container-player' ).append( contentContainer );
      playerCounter++;
    }

    return;
  }

/**
 * This method adds a player's games to the designated location in the player dashboard view.
 *
 * @public
 *
 * @return    {void}
 *
 * @example   player.addGamesToTemplate();
 *
 */
  addGamesToTemplate() {
    const games      = this.games;
    const fields     = window[ appAlias ].objects.gameFields;

    for( let i = 0; i < games.length; i++ ) {
      const contentContainer      = document.createElement( 'div' );
      const gameStart             = games[ i ].start;
      const gameDuration          = parseInt( games[ i ].duration );
      const gameEnd               = gameStart + gameDuration * 60 * 60;
      const nowTimestamp          = Date.now() / 1000;
      let contentContainerContent = '';
      let gameStartCssClass       = '';
      let addGameStartText        = '';

      if( nowTimestamp > gameStart && nowTimestamp < gameEnd ) {
        gameStartCssClass = ' success-text';
        addGameStartText  = ' - Spiel läuft gerade.';
      } else if( nowTimestamp > gameEnd ) {
        gameStartCssClass = ' danger-text';
        addGameStartText  = ' - Spiel ist beendet.';
      }

      contentContainerContent    += '<table class="w-100p"><tr>';
      contentContainerContent    += '<td class="align-top align-left">';
      contentContainerContent    += '<div class="w-100p"><button type="button" class="w-160 info" onclick="javascript: window[ appAlias ].objects.player.startGame( this );">Spiel spielen</button></div>';
      contentContainerContent    += '<div class="w-100p"><button onclick="javascript: document.location.href=\'?view=gameDashboard&id=' + games[ i ].id + '&class=game\' " type="button" class="w-160 mt-4 event-delete-game primary">Dashboard</button></div>';
      contentContainerContent    += '<div class="w-100p"><button type="button" class="w-160 warning mt-4 hidden game-archive-button" onclick="javascript: window[ appAlias ].objects.player.archiveGame( this );">Spiel archivieren</button></div>';
      contentContainerContent    += '<div class="w-100p hidden game-delete-button"><button onclick="javascript: window[ appAlias ].objects.player.deleteGame( this );" type="button" class="w-160 mt-4 event-delete-game danger">Spiel löschen</button></div>';
      contentContainerContent    += '</td>';
      contentContainerContent    += '<td class="w-160 align-top align-right">';
      contentContainerContent    += '<img class="c-dashboard-player-image my-account-image" src="includes/files/game/' + games[ i ].id + '/' + games[ i ].avatar + '" alt="Spiel Avatar" />';
      contentContainerContent    += '</td>';
      contentContainerContent    += '</tr></table>';
      contentContainerContent    += '<table><tr><td class="h-30"><span class="bold">Name:</span></td><td class="h-30"><span class="bold">' + games[ i ].name + '</span></td></tr>';
      contentContainerContent    += '<tr><td class="align-top h-20">Titel:</td><td class="align-top h-20">' + games[ i ].title + '</td></tr>';
      contentContainerContent    += '<tr><td class="pr-10 align-top">Beschreibung:</td><td class="align-top">' + games[ i ].description  + '</td></tr>';
      contentContainerContent    += '<tr><td class="pr-10 bold align-top h-20">Start:</td><td class="bold align-top h-20' + gameStartCssClass + '">' + Utils.timestampPhpToString( gameStart ) + ' Uhr'  + addGameStartText + '</td></tr>';
      contentContainerContent    += '<tr><td class="pr-10 align-top h-20">Ende:</td><td class="align-top h-20">' + Utils.timestampPhpToString( gameEnd ) + ' Uhr</td></tr></table>';
      contentContainerContent    += '<input type="hidden" name="game-id" value="' + games[ i ].id + '">';
      contentContainer.innerHTML  = contentContainerContent;

      contentContainer.classList.add( 'content-container' );
      contentContainer.classList.add( this.cssContainerClasses[ i % this.cssContainerClasses.length ] );
      contentContainer.classList.add( 'align-left' );
      document.querySelector( '#game-content-container' ).append( contentContainer );

      if( games[ i ].owner === window[ appAlias ].id ) {
        contentContainer.querySelector( '.game-archive-button' ).classList.remove( 'hidden' );
        contentContainer.querySelector( '.game-delete-button' ).classList.remove( 'hidden' );
      }

    }

    this.unhideGameAdministratorButtons();

    return;
  }

/**
 * This method starts a selected game from the player dashboard view.
 *
 * @public
 *
 * @param     {HTMLElement}   element  The element (button) that was clicked to find out the game ID
 * @return    {void}
 *
 * @example   player.startGame( element );
 *
 */
  startGame( element ) {
    const post = { 'class': 'Game', 'method': 'startGame' };

    post.id    = element.closest( '.content-container' ).querySelector( 'input[name="game-id"]' ).value;

    Utils.playMessageBeep();
    Utils.triggerMessageVibration();

    this.communicator.request( 'POST', { "result": "json", "view": window[ appAlias ].objects.view.alias }, post , 'processResponse' );

    return;
  }

/**
 * This method is the callback method and adds a player in the game configuration view to the for it
 * add designated location.
 *
 * @public
 *
 * @param     {object}  response   The Response object returned by the Communicator object
 * @return    {void}
 *
 * @example   player.processResponseAddPlayerToGame( response );
 *
 */
  processResponseAddPlayerToGame( response ) {
    if( response.result.method !== 'addPlayerToGame' ) return;

    if( document.querySelector( '#' + response.result.player.replaceAll( '@', 'at' ).replaceAll( '.', 'punkt' ) ) != null ) {
      this.validator.manageFormErrors( [ { 'field': '#search-player-field' } ] );

      return;
    }

    if( typeof response.result.playerObject !== 'object' || response.result.playerObject == null ) {
      this.validator.manageFormErrors( [ { 'field': '#search-player-field' } ] );

      return;
    }

    const contentContainer      = document.createElement( 'div' );
    const player                = response.result.playerObject;

    contentContainer.innerHTML  = this.getPlayerInfoHtml( player, 'player-id' );
    contentContainer.id         = player.email.replaceAll( '@', 'at' ).replaceAll( '.', 'punkt' );

    document.querySelector( '#search-player-field' ).value = '';

    contentContainer.classList.add( 'content-container' );
    contentContainer.classList.add( this.cssContainerClasses[ Math.floor( Math.random() * this.cssContainerClasses.length ) % this.cssContainerClasses.length ] );
    contentContainer.classList.add( 'align-left' );
    document.querySelector( '#game-content-container-player' ).append( contentContainer );

    return;
  }

/**
 * This method is the callback method and adds a hunter in the game configuration view to the for it
 * add designated location.
 *
 * @public
 *
 * @param     {object}  response   The Response object returned by the Communicator object
 * @return    {void}
 *
 * @example   player.processResponseAddHunterToGame( response );
 *
 */
  processResponseAddHunterToGame( response ) {
    if( response.result.method !== 'addHunterToGame' ) return;

    if( document.querySelector( '#' + response.result.player.replaceAll( '@', 'at' ).replaceAll( '.', 'punkt' ) ) != null ) {
      this.validator.manageFormErrors( [ { 'field': '#search-hunter-field' } ] );

      return;
    }

    if( typeof response.result.playerObject !== 'object' || response.result.playerObject == null ) {
      this.validator.manageFormErrors( [ { 'field': '#search-hunter-field' } ] );

      return;
    }

    const contentContainer      = document.createElement( 'div' );
    const player                = response.result.playerObject;

    contentContainer.innerHTML  = this.getPlayerInfoHtml( player, 'hunter-id' );
    contentContainer.id         = player.email.replaceAll( '@', 'at' ).replaceAll( '.', 'punkt' );

    document.querySelector( '#search-hunter-field' ).value = '';

    contentContainer.classList.add( 'content-container' );
    contentContainer.classList.add( 'align-left' );
    document.querySelector( '#game-content-container-hunter' ).append( contentContainer );

    return;
  }

/**
 * This method is the callback method and adds a manager in the game configuration view to the for it
 * add designated location.
 *
 * @public
 *
 * @param     {object}  response   The Response object returned by the Communicator object
 * @return    {void}
 *
 * @example   player.processResponseAddManagementToGame( response );
 *
 */
  processResponseAddManagementToGame( response ) {
    if( response.result.method !== 'addManagementToGame' ) return;

    if( document.querySelector( '#' + response.result.player.replaceAll( '@', 'at' ).replaceAll( '.', 'punkt' ) ) != null ) {
      this.validator.manageFormErrors( [ { 'field': '#search-management-field' } ] );

      return;
    }

    if( typeof response.result.playerObject !== 'object' || response.result.playerObject == null ) {
      this.validator.manageFormErrors( [ { 'field': '#search-management-field' } ] );

      return;
    }

    const contentContainer      = document.createElement( 'div' );
    const player                = response.result.playerObject;

    contentContainer.innerHTML  = this.getPlayerInfoHtml( player, 'management-id' );
    contentContainer.id         = player.email.replaceAll( '@', 'at' ).replaceAll( '.', 'punkt' );

    document.querySelector( '#search-management-field' ).value = '';

    contentContainer.classList.add( 'content-container' );
    contentContainer.classList.add( 'align-left' );
    document.querySelector( '#game-content-container-management' ).append( contentContainer );

    return;
  }

/**
 * This method is the callback method and adds a player or a hunter or a manager in the game configuration view to the for it
 * add designated location.
 *
 * @public
 *
 * @param     {object}   player      The player object to be added
 * @param     {string}   inputName   The input field name in which the player email address was entered
 * @return    {void}
 *
 * @example   player.getPlayerInfoHtml( player, inputName );
 *
 */
  getPlayerInfoHtml( player, inputName ) {
    let contentContainerContent = '';

    if( typeof player !== 'object' || player == null ) return;

    contentContainerContent    += '<table class="w-100p"><tr><td class="w-160 align-top">';
    contentContainerContent    += '<img class="c-dashboard-player-image" src="includes/files/player/' + player.email + '/' + player.image + '" alt="Profilbild" />';
    contentContainerContent    += '<div class="align-left w-100p mt-10"><button onclick="javascript: this.closest(\'.content-container\').remove();" type="button" class="w-140 warning event-remove-player-from-game">Spieler entfernen</button></div>';
    contentContainerContent    += '</td><td class="align-top">';
    contentContainerContent    += '<p class="bold mb-10">' + player.name + '</p>';
    contentContainerContent    += '<p>' + player.email + '</p>';
    contentContainerContent    += '<p>' + player.role + '</p>';
    contentContainerContent    += '<p>' + player.title + '</p>';
    contentContainerContent    += '<input type="hidden" name="' + inputName + '" value="' + player.email + '">';

    contentContainerContent    += '</td></tr></table>';

    return contentContainerContent;
  }

/**
 * This method creates a request object to archive a game and fires it to the endpoint via the Communicator object.
 * The callback method is the processResponseArchiveGame method.
 *
 * @public
 *
 * @param     {HTMLElement}   element  The element (button) that was clicked to find out the game ID
 * @return    {void}
 *
 * @example   player.archiveGame( element );
 *
 */
  archiveGame( element ) {
    const htmlGamesContainer = element.closest( '.content-container' );
    const gameId             = htmlGamesContainer.querySelector( 'input[name="game-id"]' ) != null ? htmlGamesContainer.querySelector( 'input[name="game-id"]' ).value : null;
    const post               = { 'class': 'Game', 'id': gameId, 'method': 'archiveGame', 'callbackMethod': 'processResponseArchiveGame', 'playerId': window[ appAlias ].id };

    if( typeof gameId !== 'string' || gameId == null ) return;

    this.communicator.request( 'POST', { "result": "json", "view": window[ appAlias ].objects.view.alias }, post, this.processResponse.bind( this ) );

    return;
  }

/**
 * This method is the callback method of the archiveGame method and updates the games in the player dashboard view.
 *
 * @public
 *
 * @param     {object}  response   The Response object returned by the Communicator object
 * @return    {void}
 *
 * @example   player.processResponseArchiveGame( response );
 *
 */
  processResponseArchiveGame( response ) {
    if( typeof response.result.method !== 'string' || response.result.method !== 'archiveGame' ) return;
    if( typeof response.result.id !== 'string' || response.result.id === '' ) return;

    document.querySelector( 'input[value="' + response.result.id + '"]' ).closest('.content-container').remove();

    return;
  }

/**
 * This method creates a request object to delete a game in the player dashboard view.
 * The Request object is fired to the endpoint via the Communicator object.
 * The callback method for this request is the processResponseDeleteGame method.
 *
 * @public
 *
 * @param     {HTMLElement}   element  The element (button) that was clicked to find out the game ID
 * @return    {void}
 *
 * @example   player.deleteGame( element );
 *
 */
  deleteGame( element ) {
    const htmlGamesContainer = element.closest( '.content-container' );
    const gameId             = htmlGamesContainer.querySelector( 'input[name="game-id"]' ) != null ? htmlGamesContainer.querySelector( 'input[name="game-id"]' ).value : null;
    const post               = { 'class': 'Game', 'id': gameId, 'method': 'deleteGame', 'callbackMethod': 'processResponseDeleteGame', 'playerId': window[ appAlias ].id };

    if( typeof gameId !== 'string' || gameId == null ) return;

    this.communicator.request( 'POST', { "result": "json", "view": window[ appAlias ].objects.view.alias }, post, this.processResponse.bind( this ) );

    return;
  }

/**
 * This method is the callback method from the deleteGame method and updates the games in the player dashboard view.
 *
 * @public
 *
 * @param     {object}  response   The Response object returned by the Communicator object
 * @return    {void}
 *
 * @example   player.processResponseDeleteGame( response );
 *
 */
  processResponseDeleteGame( response ) {
    if( typeof response.result.method !== 'string' || response.result.method !== 'deleteGame' ) return;
    if( typeof response.result.id !== 'string' || response.result.id === '' ) return;

    document.querySelector( 'input[value="' + response.result.id + '"]' ).closest('.content-container').remove();

    return;
  }

/**
 * This method creates a Request object to delete the current player and fires it to the endpoint via the Communicator object.
 *
 * @public
 *
 * @param     {HTMLElement}   element  The element (button) that was clicked to find out the player ID
 * @return    {void}
 *
 * @example   player.deletePlayerFromApp( element );
 *
 */
  deletePlayerFromApp( element ) {
    const post          = { 'class': 'Player', 'id': window[ appAlias ].id, 'method': 'deletePlayerFromApp' };

    post.deletePlayerId = element.getAttribute( 'data-player-id' );

    this.communicator.request( 'POST', { "result": "json", "view": window[ appAlias ].objects.view.alias }, post, 'processResponse' );

    return;
  }

/**
 * This method fills the select box in the edit mode of the My Account with the available themes as options.
 * Furthermore, an event handler is registered on the select box, which immediately changes the changed theme in the body.
 *
 * @public
 *
 * @return    {void}
 *
 * @example   player.setThemes();
 *
 */
  setThemes() {
    const themesSelect = document.querySelector( '#themes' );
    const themeLinkTag = document.querySelector( '#theme' );
    const themes       = window[ appAlias ].objects.themes

    if( themesSelect == null || themeLinkTag == null ) return;

    for( let i = 0; i < themes.length; i++ ) {
      const option     = document.createElement( 'option' );

      option.value     = themes[ i ];
      option.innerHTML = themes[ i ].charAt(0).toUpperCase() + themes[ i ].slice(1);

      if( themes[ i ] == window[appAlias ].theme ) option.setAttribute( 'selected', 'selected' );

      themesSelect.append( option )
    }

    themesSelect.addEventListener( 'change', ( event ) => {
      themeLinkTag.href= 'includes/css/themes/' + event.target.value + '.css';

      return;
    } );

    return;
  }

/**
 * This method activates the app installation buttons when the event is available.
 *
 * @public
 *
 * @param     {object}   installEvent  The installation event for installing the app
 * @return    {void}
 *
 * @example   player.activateInstallAppButton( installEvent );
 *
 */
  activateInstallAppButton( installEvent ) {
    const appInstallButtons = document.querySelectorAll( '.app-install-button' );

    for( let i = 0; i < appInstallButtons.length; i++ ) {
      appInstallButtons[ i ].removeAttribute( 'disabled' );
      appInstallButtons[ i ].classList.remove( 'hidden' );
      appInstallButtons[ i ].addEventListener( 'click', ( event ) => {
        installEvent.prompt();

        return;
     } );
    }

    return;
  }

};
