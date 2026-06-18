/**
 * This is the base class for the players and the games.
 *
 * This class represents the base class from which other classes are derived.
 * The class contains all the necessary properties and methods that are necessary for derived classes.
 * The class does not require any parameters for instantiation.
 *
 * This class requires the Communicator class.
 *
 * @class
 *
 * @author    Markus Götz <info@septem-sensu.de>
 * @version   0.1.0
 * @since     2026-06-18
 *
 * @example   var baseObject = new Base();
 *
 */
class Base {

/**
 * This method is the constructor of the class.
 *
 * @public
 *
 * @return    {void}
 *
 * @example   var baseObject = new Base();
 *
 */
  constructor() {
    this.communicator = new Communicator();
    this.validator    = this.communicator.get( 'validator' );

    return;
  }

/**
 * This method is the default getter of the class and the derived class.
 *
 * @public
 *
 * @param     {string}   property   The property of the value
 * @return    {mixed}    value      The value of the property
 *
 * @example   var value = baseObject.get( property );
 * @example   var value = this.get( property );
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
 * @param     {mixed}    value      The value you want to set to the property
 * @return    {void}
 *
 * @example   baseObject.set( property, value );
 * @example   this.set( property, value );
 *
 */
  set( property, value ) {
    this[ property ] = value;

    return;
  }

/**
 * This method registers all event handlers that are necessary for the class.
 * The method should be executed by the derived classes.
 *
 * @public
 *
 * @return    {void}
 *
 * @example   baseObject.registerEventHandler();
 * @example   this.registerEventHandler();
 *
 */
  registerEventHandler() {
    var links = document.querySelectorAll( '.event-link' );

    for( var i = 0; i < links.length; i++ ) {
      if( ! links[ i ].hasAttribute( 'data-link' ) ) continue;

      links[ i ].addEventListener( 'click', function() {
        document.location = this.getAttribute( 'data-link' );
        return;
      });
    }

    var htmlSpanTags = document.querySelectorAll( 'span.js-calc' );

    for( var i = 0; i < htmlSpanTags.length; i++ ) {
      var htmlSpanTag = htmlSpanTags[ i ];

      if( htmlSpanTag.classList.contains( 'js-calc-set-default-int' ) ) {
        if( htmlSpanTag.innerHTML == '' ) htmlSpanTag.innerHTML = '0';
      }

      if( htmlSpanTag.classList.contains( 'js-calc-m-km' ) ) {
        htmlSpanTag.innerHTML = htmlSpanTag.innerHTML / 1000;
      }

      if( htmlSpanTag.classList.contains( 'js-calc-round' ) ) {
        htmlSpanTag.innerHTML = Math.ceil( htmlSpanTag.innerHTML );
      }

      if( htmlSpanTag.classList.contains( 'js-calc-custom-round' ) ) {
        htmlSpanTag.innerHTML = ( Math.ceil( htmlSpanTag.innerHTML * 10 ) ) / 10;
      }

      if( htmlSpanTag.classList.contains( 'js-calc-datetime' ) ) {
        htmlSpanTag.innerHTML = Utils.timestampPhpToString( htmlSpanTag.innerHTML );
      }

    }

    var zoomImages = document.querySelectorAll( '.zoom-image' );

    for( var i = 0; i < zoomImages.length; i++ ) {
      zoomImages[ i ].addEventListener( 'click', ( event ) => {
        document.querySelector('.full-image-layer').style.display = 'block';
        document.querySelector('.full-image').style.display = 'block';

        var tagImage = '<img src="' + this.src + '" />';

        document.querySelector('.full-image').innerHTML = tagImage;

        return;
      } );
    }

    var uploadAvatarOpenDialog = document.querySelector( '#avatar' );

    if( uploadAvatarOpenDialog != null ) {
      uploadAvatarOpenDialog.addEventListener( 'click', ( event ) => {
        if( document.querySelector( '#avatar-upload' ) != null ) document.querySelector( '#avatar-upload' ).click();

        return;
      } );
    }

    var forms = document.querySelectorAll( 'form' );

    for( var i = 0; i < forms.length; i++ ) {
      if( forms[ i ].querySelector( 'input[name="resetForm"]' ) == null ) continue;
      if( forms[ i ].querySelector( 'input[name="resetForm"]' ).value != "1" ) continue;

      forms[ i ].reset();
    }

  }

/**
 * This method receives the response from the Communicator class and sets the class variables
 * and executes the method of the class that was specified as a callbackMethod in the request.
 *
 * @public
 *
 * @param     {object}   response   The response of the query from the Communicator class
 * @return    {void}
 *
 * @example   baseObject.processResponse( response );
 * @example   this.processResponse( response );
 *
 */
  processResponse( response ) {
    var result              = response.result ? response.result : response;

    console.log( result );

    if( result.callbackMethod ) this[ result.callbackMethod ]( response );

    return;
  }

/**
 * This method shows the buttons for which the user has the rights.
 * This method hides all other buttons.
 *
 * @public
 *
 * @return    {void}
 *
 * @example   baseObject.unhideGameAdministratorButtons();
 * @example   this.unhideGameAdministratorButtons();
 *
 */
  unhideGameAdministratorButtons() {
    var role             = window[ appAlias ].systemRole;
    var deleteButtons    = document.querySelectorAll( '.game-delete-button' );
    var archiveButtons   = document.querySelectorAll( '.game-archive-button' );
    var playerListButton = document.querySelector( '#player-list-button-container' );
    var newGameButton    = document.querySelector( '.new-game-button' );
    var newPlayerButton  = document.querySelector( '#new-player-button-container' );
    var archiveButton    = document.querySelector( '#game-archive-button-container' );

    if( role == 'administrator' ) {
      for( var i = 0; i < deleteButtons.length; i++ ) {
        deleteButtons[ i ].classList.remove( 'hidden' );
      }

      for( var i = 0; i < archiveButtons.length; i++ ) {
        archiveButtons[ i ].classList.remove( 'hidden' );
      }

      if( newGameButton != null ) newGameButton.classList.remove( 'hidden' );
      if( newPlayerButton != null ) newPlayerButton.classList.remove( 'hidden' );
      if( playerListButton != null ) playerListButton.classList.remove( 'hidden' );
      if( archiveButton != null ) archiveButton.classList.remove( 'hidden' );
    }
  }
}
