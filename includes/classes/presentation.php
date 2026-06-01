<?php

declare( strict_types = 1 );

include_once ( __DIR__ . '/../classes/baseObject.php' );

class Presentation {
  const FILEPATHTEMPLATES = __DIR__ . '/../templates/';

  protected object $templateVars;
  protected object $config;

  public function __construct() {
    $this->config = BaseObject::getConfig();

    $this->initTemplateVars();

    return;
  }

  public function initTemplateVars() {
    $this->templateVars = new StdClass();

    $this->assignTemplateVar( 'appAlias', 'default', null, $this->config->appAlias );
    $this->assignTemplateVar( 'appName', 'default', null, $this->config->appName );
    $this->assignTemplateVar( 'version', 'default', null, $this->config->version );
    $this->assignTemplateVar( 'passwordRules', 'default', null, json_encode( $this->config->passwordRules ) );
    $this->assignTemplateVar( 'timestamp', 'default', null, strval( time() ) );

    return;
  }

  public function assignTemplateVar( mixed $mixProperty, string $strClass, object | null $objFields = null, string | null $mixValue = null ) : void {
    if( is_object( $mixProperty ) ) {
      foreach( $mixProperty as $strProperty => $strValue ) {
        $strTemplateVarName                       = $strClass . '::' . $strProperty;
        $this->templateVars->$strTemplateVarName  = $strValue;

        if( isset( $objFields ) && isset( $objFields->$strProperty ) && isset( $objFields->$strProperty->options ) && isset( $objFields->$strProperty->options->$strValue ) ) {
          $strTemplateVarName                      = 'Translate::' . $strClass . '::' . $strProperty;
          $this->templateVars->$strTemplateVarName = $objFields->$strProperty->options->$strValue;
        }

        $this->templateVars->$strTemplateVarName = isset( $objFields ) && isset( $objFields->$strProperty ) && isset( $objFields->$strProperty->options ) && isset( $objFields->$strProperty->options->$strValue ) ? $objFields->$strProperty->options->$strValue : $strValue;
      }
    } else {
      $strTemplateVarName = $strClass . '::' . $mixProperty;
      $this->templateVars->$strTemplateVarName = strval( $mixValue );
    }

    return;
  }

  public function processTemplate( string $strTemplateName ) : string {
    $strContent = file_get_contents( Presentation::FILEPATHTEMPLATES . $strTemplateName );

    foreach( $this->templateVars as $strProperty => $strValue ) {
      if( gettype( $strValue ) == 'object' || gettype( $strValue ) == 'array' ) $strValue = json_encode( $strValue );
      $strContent = str_replace( '{{' . $strProperty . '}}', $strValue, $strContent );
    }

     return preg_replace( '/\{\{.*?\}\}/s', '', $strContent );
  }

  public static function writeCookie( object $objParams ) : void {
    $objConfig      = BaseObject::getConfig();
    $strCookieName  = $objConfig->cookieName;
    $objCookie      = new StdClass();

    if( isset( $_COOKIE ) && isset( $_COOKIE[ $strCookieName ] ) ) $objCookie = json_decode( $_COOKIE[ $strCookieName ] );

    foreach( $objParams as $strParam => $strValue ) {
      $objCookie->$strParam = $strValue;
    }

    setcookie( $strCookieName, json_encode( $objCookie ), [ 'expires' => time() + 60 * 60 * 24 * 30, 'path' => '/' ] );

    return;
  }

  public static function getCookieProperty( string $strCookieProperty ) : string | null {
    $objConfig      = BaseObject::getConfig();
    $strCookieName  = $objConfig->cookieName;
    $objCookie      = null;

    if( isset( $_COOKIE ) && isset( $_COOKIE[ $strCookieName ] ) ) $objCookie = json_decode( $_COOKIE[ $strCookieName ] );

    return isset( $objCookie ) && isset( $objCookie->$strCookieProperty ) ? $objCookie->$strCookieProperty : null;
  }

  public static function newFormError( string $strField, string $strMessage ) : object {
    $objFormError          = new StdClass();
    $objFormError->field   =  $strField;
    $objFormError->message = $strMessage;

    return $objFormError;
  }

  public static function getBaseUrl() : string {
    $strUrl  = Presentation::getFullUrl();
    $strPath = parse_url( $strUrl, PHP_URL_PATH );

    return 'https://' . $_SERVER[ 'HTTP_HOST' ] . $strPath;
  }

  public static function getFullUrl() : string {
    return 'https://' . $_SERVER[ 'HTTP_HOST' ] . $_SERVER[ 'REQUEST_URI' ];
  }

  public function sendHtmlMail( $objEmail ) : void {
    $objConfig   = BaseObject::getConfig();

    $arrHeader[] = 'MIME-Version: 1.0';
    $arrHeader[] = 'Content-type: text/html; charset=iso-8859-1';
    $arrHeader[] = 'To: ' . $objEmail->to;
    $arrHeader[] = 'From: ' . $objConfig->mailAddress;

    if( isset( $objEmail->cc ) ) $arrHeader[] = 'Cc: ' . $objEmail->cc;
    if( isset( $objEmail->bcc ) ) $arrHeader[] = 'Bcc: ' . $objEmail->bcc;

    mail( $objEmail->to, $objEmail->subject, $objEmail->message, implode( "\r\n", $arrHeader ) );

    return;
  }

  public static function validateFields( object $objFields, object $objObject ) : object {
    $objConfig             = BaseObject::getConfig();
    $objResult             = new StdClass();
    $objResult->formErrors = [];

    foreach( $objFields as $strFieldname => $objField ) {
      $intMinLengt = isset( $objField->minLength ) ? $objField->minLength : 1;
      if( ! $objField->mandatory ) continue;
      if( ! isset( $objObject->$strFieldname ) ) {
        array_push( $objResult->formErrors, Presentation::newFormError( '#' . $strFieldname, 'Field is Mandatory' ) );
        continue;
      }
      if( $objField->type == 'checkbox' ) continue;
      if( strlen( $objObject->$strFieldname ) < $intMinLengt ) array_push( $objResult->formErrors, Presentation::newFormError( '#' . $strFieldname, 'Field has too few characters' ) );
      if( isset( $objField->mail ) && $objField->mail && ! filter_var( $objObject->$strFieldname, FILTER_VALIDATE_EMAIL ) ) array_push( $objResult->formErrors, Presentation::newFormError( '#' . $strFieldname, 'Not a E-Mail Address' ) );
      if( $objField->type == 'password' ) {
        if( $objConfig->passwordRules->passwordHasCapitalLetters && ! preg_match( '/[A-Z]/', $objObject->$strFieldname ) ) array_push( $objResult->formErrors, Presentation::newFormError( '#' . $strFieldname, 'Password has no Capital Letters' ) );
        if( $objConfig->passwordRules->passwordHasLowercaseLetters && ! preg_match( '/[a-z]/', $objObject->$strFieldname ) ) array_push( $objResult->formErrors, Presentation::newFormError( '#' . $strFieldname, 'Password has no Lowercase Letters' ) );
        if( $objConfig->passwordRules->passwordHasNumbers && ! preg_match( '/[0-9]/', $objObject->$strFieldname ) ) array_push( $objResult->formErrors, Presentation::newFormError( '#' . $strFieldname, 'Password has no Numbers' ) );
        if( $objConfig->passwordRules->passwordHasSpecialCharacters && ! preg_match( '/[^A-Za-z0-9]/', $objObject->$strFieldname ) ) array_push( $objResult->formErrors, Presentation::newFormError( '#' . $strFieldname, 'Password has no Special Characters' ) );
      }
    }

    $objResult->success = count( $objResult->formErrors ) > 0 ? false : true;

    return $objResult;
  }

  public static function logToFile( $strMessage, bool $boolTimestamp = true, string | null $strFile = null  ) : void {
    $strFile    = isset( $strFile ) ? $strFile : __DIR__ . '/../logs/messages.log';
    $strMessage = is_object( $strMessage ) || is_array( $strMessage ) ? json_encode( $strMessage ) : strval( $strMessage );
    $strMessage = $boolTimestamp ? date( "Y-m-d H:i:s" ) . ' ' . $strMessage : $strMessage;

    file_put_contents( $strFile, $strMessage . PHP_EOL, FILE_APPEND | LOCK_EX );

    return;
  }

  public function shortText( string $strText, bool $boolPoints, int $intLength ) : string {
    if( strlen( $strText ) > $intLength ) return $boolPoints ? substr( $strText, 0, $intLength - 3 ) . '...' : substr( $strText, 0, $intLength );

    return $strText;
  }

  public static function cleanId( string $strContent ) : string {
    $strContent = str_replace( '@', 'at', $strContent );
    $strContent = str_replace( '.', 'punkt', $strContent );
    $strContent = str_replace( ' ', '_', $strContent );

    return $strContent;
  }

  public function cors() {
    if ( isset( $_SERVER[ 'HTTP_ORIGIN' ] ) ) {
      header( "Access-Control-Allow-Origin: {$_SERVER[ 'HTTP_ORIGIN']}" );
      header( 'Access-Control-Allow-Credentials: true' );
      header( 'Access-Control-Max-Age: 86400' );
    }

    if ($_SERVER[ 'REQUEST_METHOD' ] == 'OPTIONS') {
      if (isset( $_SERVER['HTTP_ACCESS_CONTROL_REQUEST_METHOD'] )){
        header( "Access-Control-Allow-Methods: GET, POST, OPTIONS" );
      }

      if ( isset( $_SERVER[ 'HTTP_ACCESS_CONTROL_REQUEST_HEADERS' ] ) ) {
        header( "Access-Control-Allow-Headers: {$_SERVER['HTTP_ACCESS_CONTROL_REQUEST_HEADERS']}" );
      }

      exit(0);
    }

    return;
  }

  public function getJsonHeader() {
    header( 'Content-type: application/json' );
    return;
  }

  public function getJavaScriptHeader() {
    header( 'Content-type: text/javascript' );
    return;
  }
}

// EOF
