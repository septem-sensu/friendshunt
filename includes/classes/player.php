<?php

declare( strict_types = 1 );

include_once ( __DIR__ . '/../classes/baseObject.php' );
include_once ( __DIR__ . '/../classes/presentation.php' );

class Player extends BaseObject {

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
      $objController->setRole( 'player' );
      $objController->setObject( new Player( $strPlayerIdFromCookie ) );
    }

    if( $strResultType == 'content' && isset( $objViewObject ) && isset( $objViewObject->alias ) && $objViewObject->alias == 'login' ) {
      header( 'Location: index.php?view=dashboard' );
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
    $objConfig                   = BaseObject::getConfig();
    $strCookieName               = $objConfig->cookie_name;
    $objLoginObject->formErrors  = [];
    $objResult                   = new stdClass();
    $objPlayer                   = null;
    $objAllPlayer                = BaseObject::getObjects( 'Player' );
    $strRedirect                 = 'index.php?view=dashboard';

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
}

// EOF
