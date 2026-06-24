<?php

declare( strict_types = 1 );

require_once ( __DIR__ . '/../classes/baseObject.php' );

/**
 * Presentation Class for the Friends Hunt App.
 *
 * This Class represents the Presentation Class for the Friends Hunt App with his Properties and Methods.
 * The Presentation Class contains the Template Engine, the server-side Validation, E-Mail Management and different Utils like:
 * formatting Date Time and Timestamps, Cookie Management, short Text, Header and CORS Utils, Logging, URL Utils and cleaning Ids.
 *
 * @category    class
 * @package     Application
 * @subpackage  FriendsHunt
 * @access      public
 * @author      Markus Götz <info@septem-sensu.de>
 * @copyright   2026 Markus Götz <info@septem-sensu.de>
 * @since       2026-06-05
 * @version     0.1.0
 *
 * @example     $objPresentation = new Presentation();
 *
*/
class Presentation {
  const FILEPATHTEMPLATES = __DIR__ . '/../templates/';

/* Class Properties */
  protected object $templateVars;
  protected object $config;

/**
 * This Method is the Constructor for this Class
 *
 * @access     public
 * @since      2026-06-05
 * @version    0.1.0
 * @return     void
 * @example    $objPresentation = new Presentation();
 *
*/
  public function __construct() {
    $this->config = BaseObject::getConfig();

    $this->initTemplateVars();

    return;
  }

/**
 * This Method init the default Template Variables for the App.
 *
 * @access     public
 * @since      2026-06-05
 * @version    0.1.0
 *
 * @return     void
 *
 * @example    $objPresentation->initTemplateVars();
 *
*/
  public function initTemplateVars() {
    $this->templateVars = new stdClass();

    $this->assignTemplateVar( 'appAlias', 'default', null, $this->config->appAlias );
    $this->assignTemplateVar( 'appName', 'default', null, $this->config->appName );
    $this->assignTemplateVar( 'version', 'default', null, $this->config->version );
    $this->assignTemplateVar( 'passwordRules', 'default', null, json_encode( $this->config->passwordRules ) );
    $this->assignTemplateVar( 'timestamp', 'default', null, strval( time() ) );

    return;
  }

/**
 * This Method assigns Template Variables to the Template Engine.
 *
 * @access     public
 * @since      2026-06-05
 * @version    0.1.0
 *
 * @param      mixed     $mixProperty    The Property to set to Template
 * @param      string    $strClass       The Class Name to set to Template
 * @param      mixed     $objFields      The Field Settings Object
 * @param      mixed     $mixValue       The Value to set to Template
 * @return     void
 *
 * @example    $objPresentation->assignTemplateVar( $mixProperty, $strClass, $objFields, $mixValue );
 *
*/
  public function assignTemplateVar( mixed $mixProperty, string $strClass, object | null $objFields = null, string | null $mixValue = null ) : void {
    if( is_object( $mixProperty ) ) {
      foreach( $mixProperty as $strProperty => $strValue ) {
        $strTemplateVarName                       = $strClass . '::' . $strProperty;
        $this->templateVars->$strTemplateVarName  = $strValue;

        $strTranslateVarName = 'Translate::' . $strClass . '::' . $strProperty;

        if( isset( $objFields ) && isset( $objFields->$strProperty ) && isset( $objFields->$strProperty->options ) && isset( $objFields->$strProperty->options->$strValue ) ) {
          $this->templateVars->$strTranslateVarName = $objFields->$strProperty->options->$strValue;
        }
      }
    } else {
      $strTemplateVarName = $strClass . '::' . $mixProperty;
      $this->templateVars->$strTemplateVarName = strval( $mixValue );
    }

    return;
  }

/**
 * This Method rendering the Template and replaced the Template Variables.
 *
 * @access     public
 * @since      2026-06-05
 * @version    0.1.0
 *
 * @param      string    $strTemplateName       The Template File Name
 * @return     string    $strTemplateName       The rendered Content Template
 *
 * @example    $strTemplateName = $objPresentation->processTemplate( $strTemplateName );
 *
*/
  public function processTemplate( string $strTemplateName ) : string {
    $strContent = file_get_contents( Presentation::FILEPATHTEMPLATES . $strTemplateName );

    foreach( $this->templateVars as $strProperty => $strValue ) {
      if( gettype( $strValue ) == 'object' || gettype( $strValue ) == 'array' ) $strValue = json_encode( $strValue );
      $strContent = str_replace( '{{' . $strProperty . '}}', strval( $strValue ), $strContent );
    }

     return preg_replace( '/\{\{.*?\}\}/s', '', $strContent );
  }

/**
 * This static Method convert a Date Time String to a Timestamp.
 *
 * @access     public
 * @since      2026-06-05
 * @version    0.1.0
 *
 * @param      string    $strTimestamp       The Date Time String
 * @return     int       $intTimestamp       The Timestamp
 *
 * @example    $intTimestamp = Presentation::stringToTimestamp( $strTimestamp );
 *
*/
  public static function stringToTimestamp ( string $strTimestamp ) : int {
    return strtotime( $strTimestamp );
  }

/**
 * This static Method convert a Timestamp to a formatted Date Time String.
 *
 * @access     public
 * @since      2026-06-05
 * @version    0.1.0
 *
 * @param      int      $intTimestamp       The Timestamp
 * @return     string   $strTimestamp       The formated Date Time String
 *
 * @example    $strTimestamp = Presentation::timestampToString( $intTimestamp );
 *
*/
  public static function timestampToString( int $intTimestamp ) : string {
    return date( 'd.m.Y H:i', $intTimestamp );
  }

/**
 * This static Method set App Cookie Variables to the JSON Cookie Value.
 *
 * @access     public
 * @since      2026-06-05
 * @version    0.1.0
 *
 * @param      object      $objParams   The Cookie Variables to set
 * @return     void
 *
 * @example    Presentation::writeCookie( $objParams );
 *
*/
  public static function writeCookie( object $objParams ) : void {
    $objConfig      = BaseObject::getConfig();
    $strCookieName  = $objConfig->cookieName;
    $objCookie      = new stdClass();

    if( isset( $_COOKIE ) && isset( $_COOKIE[ $strCookieName ] ) ) $objCookie = json_decode( $_COOKIE[ $strCookieName ] );

    foreach( $objParams as $strParam => $strValue ) {
      $objCookie->$strParam = $strValue;
    }

    setcookie( $strCookieName, json_encode( $objCookie ), [ 'expires' => time() + 60 * 60 * 24 * 30, 'path' => '/' ] );

    return;
  }

/**
 * This static Method delete the App Cookie.
 *
 * @access     public
 * @since      2026-06-05
 * @version    0.1.0
 *
 * @return     void
 *
 * @example    Presentation::deleteCookie();
 *
*/
  public static function deleteCookie() : void {
    $objConfig      = BaseObject::getConfig();
    $strCookieName  = $objConfig->cookieName;

    setcookie( $strCookieName, '', [ 'expires' => time() - 3600, 'path' => '/' ] );

    return;
  }

/**
 * This static Method get a Value from the App Cookie Json Value.
 *
 * @access     public
 * @since      2026-06-05
 * @version    0.1.0
 *
 * @param      string    $strCookieProperty   The Cookie Property to get the Value
 * @return     mixed     $strCookieValue      The Cookie Value from the Hand over Property
 *
 * @example    $strCookieValue = Presentation::getCookieProperty( $strCookieProperty );
 *
*/
  public static function getCookieProperty( string $strCookieProperty ) : string | null {
    $objConfig      = BaseObject::getConfig();
    $strCookieName  = $objConfig->cookieName;
    $objCookie      = null;

    if( isset( $_COOKIE ) && isset( $_COOKIE[ $strCookieName ] ) ) $objCookie = json_decode( $_COOKIE[ $strCookieName ] );

    return isset( $objCookie ) && isset( $objCookie->$strCookieProperty ) ? $objCookie->$strCookieProperty : null;
  }

/**
 * This static Method returns a new Form Error Object for the given Field and Message.
 *
 * @access     public
 * @since      2026-06-05
 * @version    0.1.0
 *
 * @param      string    $strField      The Field Id from the Form
 * @param      string    $strMessage    The Error Message
 * @return     object    $objFormError  The Form Error Object
 *
 * @example    $objFormError = Presentation::newFormError( $strField, $strMessage );
 *
*/
  public static function newFormError( string $strField, string $strMessage ) : object {
    $objFormError          = new stdClass();
    $objFormError->field   =  $strField;
    $objFormError->message = $strMessage;

    return $objFormError;
  }

/**
 * This static Method returns the Base Url from the App.
 *
 * @access     public
 * @since      2026-06-05
 * @version    0.1.0
 *
 * @return     string    $strBaseUrl   The Base Url from the App
 *
 * @example    $strBaseUrl = Presentation::getBaseUrl();
 *
*/
  public static function getBaseUrl() : string {
    $objConfig = BaseObject::getConfig();
    $strUrl    = Presentation::getFullUrl();
    $strPath   = parse_url( $strUrl, PHP_URL_PATH );

    $strHost = isset( $_SERVER[ 'HTTP_HOST' ] ) && in_array( $_SERVER[ 'HTTP_HOST' ], $objConfig->allowedHosts ) ? $_SERVER[ 'HTTP_HOST' ] : $objConfig->defaultHost;

    return 'https://' . $strHost . $strPath;
  }

/**
 * This static Method returns the full Request Url from the App Request.
 *
 * @access     public
 * @since      2026-06-05
 * @version    0.1.0
 *
 * @return     string    $strFullRequestUrl   The full Request Url from the App
 *
 * @example    $strFullRequestUrl = Presentation::getFullUrl();
 *
*/
  public static function getFullUrl() : string {
    $objConfig = BaseObject::getConfig();
    $strHost   = isset( $_SERVER[ 'HTTP_HOST' ] ) && in_array( $_SERVER[ 'HTTP_HOST' ], $objConfig->allowedHosts ) ? $_SERVER[ 'HTTP_HOST' ] : $objConfig->defaultHost;

    return 'https://' . $strHost . $_SERVER[ 'REQUEST_URI' ];
  }

/**
 * This Method send a Html E-Mail over the PHP mail Function.
 *
 * @access     public
 * @since      2026-06-05
 * @version    0.1.0
 *
 * @param      object    $objEmail      The Standard Class Object with all E-Mail Parameters
 * @return     void
 *
 * @example    $objPresentation->sendHtmlMail( $objEmail );
 *
*/
  public function sendHtmlMail( object $objEmail ) : void {
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

/**
 * This static Method validate a Form with the Field Objects.
 *
 * @access     public
 * @since      2026-06-05
 * @version    0.1.0
 *
 * @param      object    $objFields      The Standard Class Object with the Field Configuration
 * @param      object    $objObject      The Standard Class Object all Fields and Values of the Form
 * @return     object    $objFormErrors   The Standard Class Object with the Result of Validation
 *
 * @example    $objFormErrors = Presentation::validateFields( $objFields, $objObject );
 *
*/
  public static function validateFields( object $objFields, object $objObject ) : object {
    $objConfig             = BaseObject::getConfig();
    $objResult             = new stdClass();
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
      if( isset( $objField->mail ) && $objField->mail && ! filter_var( $objObject->$strFieldname, FILTER_VALIDATE_EMAIL ) ) array_push( $objResult->formErrors, Presentation::newFormError( '#' . $strFieldname, 'Not an E-Mail Address' ) );
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

/**
 * This static Method write logs to a File for debuging.
 *
 * @access     public
 * @since      2026-06-05
 * @version    0.1.0
 *
 * @param      mixed    $strMessage      The Content which should be written to the File
 * @param      bool     $boolTimestamp   If is true then write a formated Timestamp before the Content of every Message
 * @param      mixed    $strFile         The Log File with Path
 * @return     void
 *
 * @example    Presentation::logToFile( $strMessage, $boolTimestamp, $strFile );
 *
*/
  public static function logToFile( string | array | object $strMessage, bool $boolTimestamp = true, string | null $strFile = null  ) : void {
    $strFile    = isset( $strFile ) ? $strFile : __DIR__ . '/../logs/messages.log';
    $strMessage = is_object( $strMessage ) || is_array( $strMessage ) ? json_encode( $strMessage ) : strval( $strMessage );
    $strMessage = $boolTimestamp ? date( "Y-m-d H:i:s" ) . ' ' . $strMessage : $strMessage;

    file_put_contents( $strFile, $strMessage . PHP_EOL, FILE_APPEND | LOCK_EX );

    return;
  }

/**
 * This Method short a String.
 *
 * @access     public
 * @since      2026-06-05
 * @version    0.1.0
 *
 * @param      string    $strText          The String which should be shorten
 * @param      bool      $boolPoints       If is true then the shorted Text ended with three Points
 * @param      mixed     $intLength        The Length of the shorted String
 * @return     string    $strShortedText   The Shorted Text
 *
 * @example    $strShortedText = $objPresentation->shortText( $strText, $boolPoints, $intLength );
 *
*/
  public function shortText( string $strText, bool $boolPoints, int $intLength ) : string {
    if( strlen( $strText ) > $intLength ) return $boolPoints ? substr( $strText, 0, $intLength - 3 ) . '...' : substr( $strText, 0, $intLength );

    return $strText;
  }

/**
 * This Method cleaned a Id.
 *
 * @access     public
 * @since      2026-06-05
 * @version    0.1.0
 *
 * @param      string    $strContent  The Id
 * @return     string    $strContent  The cleaned Id
 *
 * @example    $strContent = Presentation::cleanId( $strContent );
 *
*/
  public static function cleanId( string $strContent ) : string {
    $strContent = str_replace( '@', 'at', $strContent );
    $strContent = str_replace( '.', 'punkt', $strContent );
    $strContent = str_replace( ' ', '_', $strContent );

    return $strContent;
  }

/**
 * This Method set the Cors Header for the Response.
 *
 * @access     public
 * @since      2026-06-05
 * @version    0.1.0
 *
 * @return     void
 *
 * @example    $objPresentation->cors();
 *
*/
  public function cors() : void {
    $objConfig = BaseObject::getConfig();

    if( isset( $_SERVER[ 'HTTP_ORIGIN' ] ) && isset( $objConfig->allowedOrigins ) && in_array( $_SERVER[ 'HTTP_ORIGIN' ], $objConfig->allowedOrigins ) ) {
      header( "Access-Control-Allow-Origin: {$_SERVER[ 'HTTP_ORIGIN' ]}" );
      header( 'Access-Control-Allow-Credentials: true' );
      header( 'Access-Control-Max-Age: 86400' );
    }

    if( $_SERVER[ 'REQUEST_METHOD' ] == 'OPTIONS' ) {
      if( isset( $_SERVER[ 'HTTP_ACCESS_CONTROL_REQUEST_METHOD' ] ) ) {
        header( "Access-Control-Allow-Methods: GET, POST, OPTIONS" );
      }

      if( isset( $_SERVER[ 'HTTP_ACCESS_CONTROL_REQUEST_HEADERS' ] ) ) {
        header( "Access-Control-Allow-Headers: {$_SERVER[ 'HTTP_ACCESS_CONTROL_REQUEST_HEADERS' ]}" );
      }

      exit(0);
    }

    return;
  }

/**
 * This Method set the JSON Header for the Response.
 *
 * @access     public
 * @since      2026-06-05
 * @version    0.1.0
 *
 * @return     void
 *
 * @example    $objPresentation->getJsonHeader();
 *
*/
  public function getJsonHeader() : void {
    header( 'Content-type: application/json' );
    return;
  }

/**
 * This Method set the JavaScript Header for the Response.
 *
 * @access     public
 * @since      2026-06-05
 * @version    0.1.0
 *
 * @return     void
 *
 * @example    $objPresentation->getJavaScriptHeader();
 *
*/
  public function getJavaScriptHeader() : void {
    header( 'Content-type: text/javascript' );
    return;
  }
}

// EOF
