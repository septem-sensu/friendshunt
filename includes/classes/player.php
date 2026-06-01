<?php

declare( strict_types = 1 );

include_once ( __DIR__ . '/../classes/baseObject.php' );
include_once ( __DIR__ . '/../classes/presentation.php' );

class Player extends BaseObject {

  protected string $name;
  protected string $password;
  protected string $role;
  protected string $email;
  protected string $image;
  protected array  $games;
  protected string $title;
  protected string $description;

  public static function newPlayer( object $objNewPlayerRequestObject ) : object {
    $objAllPlayer                        = BaseObject::getObjects( 'Player' );
    $objFields                           = BaseObject::loadFileDeCrypted( BaseObject::FILEPATHJSON . 'fields/player.json' );
    $objValidateResult                   = Presentation::validateFields( $objFields, $objNewPlayerRequestObject );
    $strEmail                            = $objNewPlayerRequestObject->email;
    $objNewPlayerRequestObject->password = isset( $objNewPlayerRequestObject->password ) ? BaseObject::enCrypteOnly( $objNewPlayerRequestObject->password ) : null;

    if( ! $objValidateResult->success ) {
      $objNewPlayerRequestObject->formErrors = $objValidateResult->formErrors;

      return $objNewPlayerRequestObject;
    }

    if( isset( $objAllPlayer->$strEmail ) ) {
      $objNewPlayerRequestObject->formErrors = [];
      array_push( $objNewPlayerRequestObject->formErrors, Presentation::newFormError( '#email', 'Spieler existiert schon' ) );

      return $objNewPlayerRequestObject;
    }

    $objNewPlayerRequestObject              = BaseObject::cleanObject( $objNewPlayerRequestObject, $objFields );
    $objAllPlayer->$strEmail                = $objNewPlayerRequestObject;

    BaseObject::saveFileEnCrypted( BaseObject::FILEPATHJSON . 'data/dataPlayer.json', $objAllPlayer );

    if( ! file_exists( __DIR__ . '/../files/player/' ) ) mkdir( __DIR__ . '/../files/player' );
    if( ! file_exists( __DIR__ . '/../files/player/' . $strEmail ) ) mkdir( __DIR__ . '/../files/player/' . $strEmail );

    copy( __DIR__ . '/../images/no-profil-image.png', __DIR__ . '/../files/player/' . $strEmail . '/avatar.png' );

    return $objNewPlayerRequestObject;
  }

  public static function checkLogin( object | null $objController = null ) : bool {
    $objConfig                   = BaseObject::getConfig();
    $strCookieName               = $objConfig->cookieName;
    $objViewObject               = isset( $objController ) ? $objController->getViewObject() : null;
    $strResultType               = isset( $objController ) ? $objController->getResultType() : 'json';

    if( ! isset( $_COOKIE ) || ! isset( $_COOKIE[ $strCookieName ] ) ) return false;

    $objAllPlayer          = BaseObject::getObjects( $objConfig->userClass );
    $objCookie             = json_decode( $_COOKIE[ $strCookieName ] );
    $strToken              = BaseObject::deCrypte( $objCookie->token );
    $strPlayerIdFromCookie = explode( '|||', html_entity_decode( $strToken )  )[0];
    $strPasswordFromCookie = explode( '|||', html_entity_decode( $strToken )  )[1];

    if( ! isset( $objAllPlayer ) || ! isset( $objAllPlayer->$strPlayerIdFromCookie ) ) return false;
    if( ! isset( $objAllPlayer->$strPlayerIdFromCookie->password ) || $strPasswordFromCookie != $objAllPlayer->$strPlayerIdFromCookie->password ) return false;

    if( isset( $objController ) ) {
      $objController->setRole( $objAllPlayer->$strPlayerIdFromCookie->role );
      $objController->setObject( new Player( $strPlayerIdFromCookie ) );
    }

    if( $strResultType == 'content' && isset( $objViewObject ) && isset( $objViewObject->alias ) && $objViewObject->alias == 'login' ) {
      header( 'Location: index.php?view=' . $objConfig->defaultLoginView  );
      exit;
    }

    return true;
  }

  public static function getPlayerIdFromCookie() : string | null {
    $strToken  = BaseObject::deCrypte( Presentation::getCookieProperty( 'token' ) );
    $arrToken  = isset( $strToken  ) ? explode( '|||', $strToken ) : null;

    return isset( $arrToken ) && count( $arrToken ) > 0 ? $arrToken[ 0 ] : null;
  }

  public static function login( object $objLoginObject ) : object {
    $objLoginObject->formErrors  = [];
    $objPlayer                   = null;
    $objConfig                   = BaseObject::getConfig();
    $objAllPlayer                = BaseObject::getObjects( 'Player' );
    $strRedirect                 = 'index.php?view=' . $objConfig->defaultLoginView;

    if( Player::checkLogin( null ) ) {
      $objLoginObject->redirect = $strRedirect;
      $objLoginObject->succsess = true;

      return $objLoginObject;
    }

    $strPlayerInput     = isset( $objLoginObject->name )     ? $objLoginObject->name     : null;
    $strPasswordInput   = isset( $objLoginObject->password ) ? $objLoginObject->password : null;
    $objPlayer          = isset( $strPlayerInput ) && isset( $objAllPlayer->$strPlayerInput ) ? $objAllPlayer->$strPlayerInput : null;

    if( ! isset( $objPlayer ) || ! isset( $strPasswordInput ) || BaseObject::enCrypteOnly( $strPasswordInput ) != $objPlayer->password ) {
      array_push( $objLoginObject->formErrors, Presentation::newFormError( '#name', 'Login fehlgeschlagen' ) );
      array_push( $objLoginObject->formErrors, Presentation::newFormError( '#password', 'Login fehlgeschlagen' ) );
      $objLoginObject->succsess = false;

      return $objLoginObject;
    }

    $objParams = new stdClass();
    $objParams->token = BaseObject::enCrypte( $strPlayerInput . '|||' . BaseObject::enCrypteOnly( $strPasswordInput ) );
    Presentation::writeCookie( $objParams );

    $objLoginObject->redirect = $strRedirect;
    $objLoginObject->succsess = true;

    return $objLoginObject;
  }

  public static function avatarFileUploaded( string $strFileName ) : void {
    $strClass        = isset( $_POST[ 'class' ] ) ? $_POST[ 'class' ] : null;
    $strId           = isset( $_POST[ 'id' ] ) ? $_POST[ 'id' ] : null;
    $strPath         = __DIR__ . '/../files/' . lcfirst( $strClass ) . '/' . $strId . '/';

    if( file_exists( $strPath . 'avatar.png' ) ) unlink( $strPath . 'avatar.png' );
    if( file_exists( $strPath . 'avatar.jpg' ) ) unlink( $strPath . 'avatar.jpg' );
    if( file_exists( $strPath . 'avatar.webp' ) ) unlink( $strPath . 'avatar.webp' );

    $arrPathInfo = pathinfo( $strPath . $strFileName );

    rename( $strPath . $strFileName, $strPath . 'avatar.' . strtolower( $arrPathInfo[ 'extension' ] ) );

    $objPlayer = new $strClass( $strId );
    $objPlayer->set( 'image', 'avatar.' . strtolower( $arrPathInfo[ 'extension' ] ) . '?v=' . time() );

    //Presentation::logToFile( $strPath . $strFileName, null, true );

    return;
  }

  public function deletePlayer( object $objRequestObject ) : object {
    //$arrGames         = $this->games;
    $objAllPlayer     = BaseObject::loadFileDeCrypted( __DIR__ . '/../json/data/dataPlayer.json' );
    $strPlayerId      = $this->id();

    /*
    for( $i = 0; $i < count( $arrGames ); $i++ ) {
      $objGame   = new Game( $arrGames[ $i ] );
      $objDelete = new stdClass();

      $objDelete->class = 'Game';
      $objDelete->id    = $arrGames[ $i ];

      $objGame->deleteGame( $objDelete );
    }
    */

    $this->deleteDirectory( __DIR__ . '/../files/player/' . $strPlayerId . '/' );
    unset( $objAllPlayer->$strPlayerId );
    BaseObject::saveFileEnCrypted( __DIR__ . '/../json/data/dataPlayer.json', $objAllPlayer );

    $objRequestObject->redirect = 'index.php?view=login';

    return $objRequestObject;
  }
}

// EOF
