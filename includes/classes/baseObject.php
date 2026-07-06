<?php

declare( strict_types = 1 );

/**
 * Base Class for the Friends-Hunt App.
 *
 * This Class represents the base Class for the Friends-Hunt App with his Properties and Methods.
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
 * @example     $objFriendsHunt = new BaseObject( $strId );
 *
*/
class BaseObject {
  const FILEPATHBASE      = __DIR__ . '/../';
  const FILEPATHJSON      = __DIR__ . '/../json/';
  const FILEPATHDATA      = __DIR__ . '/../json/data/';

/* Class Properties */
  protected object $config;
  protected object $fields;
  protected string $className;
  protected string $id;

/**
 * This Method is the Constructor for this Class
 *
 * @access     public
 * @since      2026-06-05
 * @version    0.1.0
 *
 * @param      string   $strObjectId    Object Id
 * @return     void
 *
 * @example    $objBaseObject = new BaseObject( $strObjectId );
 *
*/
  public function __construct( string | null $strObjectId = null ) {
    $strClassName    = get_class( $this );
    $objAllFields    = $this->loadFileDeCrypted( $this::FILEPATHJSON . 'fields/' . strtolower( $strClassName ) . '.json' );
    $this->className = $strClassName;
    $this->config    = $this->loadFileDeCrypted( $this::FILEPATHJSON . 'config.json' );
    $this->id        = isset( $strObjectId ) ? $strObjectId : $this->newId( $this->className );
    $this->fields    = $objAllFields;

    $this->fillObject();

    return;
  }

/**
 * This static Method get the Class Fields from the JSON File and returs the Object.
 *
 * @access     public
 * @since      2026-06-05
 * @version    0.1.0
 *
 * @param      string  $strClassname   Classname
 * @return     object  $objAllFields   The Fields Object with all Properties
 *
 * @example    $objAllFields = BaseObject::fields( $strProperty );
 *
*/
  public static function fields( string $strClassname ) {
    $objAllFields    = BaseObject::loadFileDeCrypted( BaseObject::FILEPATHJSON . 'fields/' . strtolower( $strClassname ) . '.json' );

    return $objAllFields;
  }

/**
 * This Method loads the Objects File of the Class, decrypts it and fills the Object with its data.
 *
 * @access     public
 * @since      2026-06-05
 * @version    0.1.0
 *
 * @return     void
 *
 * @example    $objBaseObject->fillObject();
 *
*/
  public function fillObject() : void {
    $objClassObjects = $this->loadFileDeCrypted( $this::FILEPATHJSON . 'data/data' . $this->className . '.json' );
    $strObjectId     = $this->id;
    $objObject       = property_exists( $objClassObjects, $strObjectId ) ? $objClassObjects->$strObjectId : new StdClass();

    foreach( $this->fields as $strFieldname => $fieldValue ) {
      if( ! property_exists( $objObject, $strFieldname ) ) continue;

      $this->$strFieldname = $objObject->$strFieldname;
    }

    return;
  }

/**
 * This static Method get the Class Fields from the JSON File and returs the Object.
 *
 * @access     public
 * @since      2026-06-05
 * @version    0.1.0
 *
 * @return     string  $strId   The Id from the Object
 *
 * @example    $strId = $objBaseObject->id();
 *
*/
  public function id() : string {
    return $this->id;
  }

/**
 * This Method is the default getter.
 *
 * @access     public
 * @since      2026-06-05
 * @version    0.1.0
 *
 * @param      string  $strProperty   Property
 * @return     mixed   $value         Value of Property
 *
 * @example    $value = $objBaseObject->get( $strProperty );
 *
*/
  public function get( string $strProperty ) {
    if( ! property_exists( $this->fields, $strProperty ) ) throw new Exception("Property not exists or protected");

    return $this->$strProperty;
  }

/**
 * This Method is the default setter.
 *
 * @access     public
 * @since      2026-06-05
 * @version    0.1.0
 *
 * @param      mixed    $mixProperty    Property
 * @param      mixed    $mixValue       Value of Property
 * @return     void
 *
 * @example    $objBaseObject->set( $mixProperty, $mixValue );
*/
  public function set( string | int | array | object $mixProperty, string | int | array | object | null $mixValue = null ) : void {
    if( is_string( $mixProperty ) ) {
      if( ! property_exists( $this->fields, $mixProperty ) ) throw new Exception("Property not exists or protected");
      if( isset( $this->fields->$mixProperty->crypt ) && $this->fields->$mixProperty->crypt === true ) $mixValue = $this->enCrypteOnly( $mixValue );
      $this->$mixProperty = $mixValue;
    } else {
      foreach( $mixProperty as $strProperty => $mixValueArray ) {
        if( ! property_exists( $this->fields, $strProperty ) ) continue;
        if( property_exists( $this->fields->$strProperty, 'element' ) && $this->fields->$strProperty->element == 'cookie' ) {
          $objCookieElement               = new stdClass();
          $objCookieElement->$strProperty = $mixValueArray;

          Presentation::writeCookie( $objCookieElement );

          continue;
        }
        if( isset( $this->fields->$strProperty->crypt ) && $this->fields->$strProperty->crypt === true ) $mixValueArray = $this->enCrypteOnly( $mixValueArray );
        if( isset( $this->fields->$strProperty->type ) && $this->fields->$strProperty->type == 'number' ) {
          $this->$strProperty =  intval( $mixValueArray );
        } else {
          $this->$strProperty =  $mixValueArray;
        }
      }
    }

    $this->saveObject();

    return;
  }

/**
 * This Method delete the Object.
 *
 * @access     public
 * @since      2026-06-05
 * @version    0.1.0
 *
 * @return     void
 *
 * @example    $objBaseObject->deleteObject();
 *
*/
  public function deleteObject() : void {
    $strId           = $this->id();
    $objClassObjects = $this->loadFileDeCrypted( $this::FILEPATHJSON . 'data/data' . $this->className . '.json' );

    unset( $objClassObjects->$strId );

    $this->saveFileEnCrypted( $this::FILEPATHJSON . 'data/data' . $this->className . '.json', $objClassObjects );

    return;
  }

/**
 * This Method saved encrypted all Data from the Object in a JSON File.
 *
 * @access     public
 * @since      2026-06-05
 * @version    0.1.0
 *
 * @return     void
 *
 * @example    $objBaseObject->saveObject();
 *
*/
  public function saveObject() : void {
    $objClassObjects                   = $this->loadFileDeCrypted( $this::FILEPATHJSON . 'data/data' . $this->className . '.json' );
    $strObjectId                       = $this->id;
    $objClassObjects->$strObjectId     = $this->serializeObject();
    $objArrayObject                    = new ArrayObject( $objClassObjects->$strObjectId );

    if( $objArrayObject->count() < 1 ) return;

    $objClassObjects->$strObjectId->id = $strObjectId;

    $this->saveFileEnCrypted( $this::FILEPATHJSON . 'data/data' . $this->className . '.json', $objClassObjects );

    return;
  }

/**
 * This Method set the Parameters to the Object and saved the handed over Files.
 *
 * @access     public
 * @since      2026-06-05
 * @version    0.1.0
 *
 * @param      object    $objRequestObject     Request Object
 * @return     object    $objRequestObject     Request Object
 *
 * @example    $objRequestObject = $objBaseObject->saveRequestObject( $objRequestObject );
 *
*/
  public function saveRequestObject( object $objRequestObject ) : object {
    $strClassName = $objRequestObject->class;
    $strObjectId  = $objRequestObject->id;
    $objFields    = BaseObject::fields( $strClassName );
    $objObject    = new $strClassName( $strObjectId );
    $objSave      = new stdClass();

    foreach( $objRequestObject as $strProperty => $mixValue ) {
      if( ! isset( $objFields->$strProperty ) ) continue;
      if( isset( $objFields->$strProperty->readOnly ) && $objFields->$strProperty->readOnly ) continue;
      if( isset( $objFields->$strProperty->element ) && $objFields->$strProperty->element == 'img' ) {
        $arrImage                       = explode( '/', $mixValue );
        $objSave->$strProperty          = $arrImage[ count( $arrImage ) - 1 ];
        $objRequestObject->$strProperty = $objSave->$strProperty;
      } else {
        $objSave->$strProperty = $mixValue;
      }
    }

    $objObject->set( $objSave );

    return $objRequestObject;
  }

/**
 * This Method generate a new GUID.
 *
 * @access     public
 * @since      2026-06-05
 * @version    0.1.0
 *
 * @param      string   $strPrefix   Perfix of the GUID
 * @return     string   $strId       The generated GUID
 *
 * @example    $strId = $objBaseObject->newId( $strPrefix );
 *
*/
  public function newId( string $strPrefix ) : string {
    return uniqid( $strPrefix . '_', true );
  }

/**
 * This static method returns all Object from a Class.
 *
 * @static
 * @access     public
 * @since      2026-06-05
 * @version    0.1.0
 *
 * @param      string   $strClassName   The Class Name
 * @return     object   $objObjects     The Main Config Object of Friends-Hunt
 *
 * @example    $objObjects = BaseObject::getObjects( $strClassName );
 *
*/
  public static function getObjects( string $strClassName ) {
    return BaseObject::loadFileDeCrypted( BaseObject::FILEPATHDATA . 'data'. $strClassName  . '.json' );
  }

/**
 * This static method returns the Main Config Object of Friends-Hunt.
 *
 * @static
 * @access     public
 * @since      2026-06-05
 * @version    0.1.0
 *
 * @return     object   $objConfig    The Main Config Object of Friends-Hunt
 *
 * @example    $objConfig = BaseObject::getConfig();
 *
*/
  public static function getConfig() : object {
    return BaseObject::loadFileDeCrypted( BaseObject::FILEPATHJSON . 'config.json' );
  }

/**
 * This static Method is checked is the string a json.
 *
 * @access     public
 * @since      2026-06-05
 * @version    0.1.0
 *
 * @param      string   $strContent  String to test
 * @return     bool     $boolResult  Is the String a Json
 *
 * @example    $boolResult = BaseObject::isJson( $strContent );
 *
*/
  public static function isJson( string $strContent ) : bool {
    json_decode( $strContent );

    return json_last_error() === JSON_ERROR_NONE ? true : false;
  }

/**
 * This static Method returns the crypt passphrases Keys.
 *
 * @access     public
 * @since      2026-06-05
 * @version    0.1.0
 *
 * @return     array  $arrCryptKeys  The crypt passphrases Keys
 *
 * @example    $arrCryptKeys = BaseObject::getCryptKeys( $strContent );
 *
*/
  public static function getCryptKeys() : array {
    static $arrCryptKeys = null;

    if( $arrCryptKeys === null ) {
      if( file_exists( __DIR__ . '/../classes/.config.php' ) ) {
        $arrCryptKeys = include __DIR__ . '/../classes/.config.php';
      } else {
        $arrCryptKeys = include __DIR__ . '/../classes/config.php';
      }
    }

    return $arrCryptKeys;
  }

/**
 * This static Method encrypted SHA-256 a String.
 *
 * @access     public
 * @since      2026-06-05
 * @version    0.1.0
 *
 * @param      string   $strContent  String to encrypt
 * @return     string   $strContent  The encrypted Content String
 *
 * @example    $strContent = BaseObject::enCrypteOnly( $strContent );
 *
*/
  public static function enCrypteOnly ( string $strContent ) : string {
    return hash( 'sha256', $strContent );
  }

/**
 * This static method encrypted a string with AES-256-CBC.
 *
 * @static
 * @access     public
 * @since      2026-06-05
 * @version    0.1.0
 *
 * @param      string   $strContent   String to be encrypted
 * @return     string   $strContent   Encrypted String
 *
 * @example    $strContent = BaseObject::enCrypte( $strContent );
 *
*/
  public static function enCrypte( string $strContent ) : string {
    $arrCryptKeys = BaseObject::getCryptKeys();
    $strContent   = openssl_encrypt(
      $strContent, "AES-256-CBC",
      hash( 'sha256', $arrCryptKeys[ 'passphrase1' ] ), 0,
      substr( hash( 'sha256', $arrCryptKeys[ 'passphrase2' ] ), 0, 16 )
    );

    return $strContent;
  }

/**
 * This static method decrypted a encrypted string with AES-256-CBC.
 *
 * @static
 * @access     public
 * @since      2026-06-05
 * @version    0.1.0
 *
 * @param      string   $strContent   Encrypted String
 * @return     string   $strContent   String to be decrypted
 *
 * @example    $strContent = BaseObject::deCrypte( $strContent );
 *
*/
  public static function deCrypte( string $strContent ) : string {
    $arrCryptKeys = BaseObject::getCryptKeys();
    $strContent   = openssl_decrypt(
      $strContent, "AES-256-CBC",
      hash( 'sha256', $arrCryptKeys[ 'passphrase1' ] ), 0,
      substr( hash( 'sha256', $arrCryptKeys[ 'passphrase2' ] ), 0, 16 )
    );

    return $strContent;
  }

/**
 * This static method changes a Object in a json String, encrypted this json String with AES-256-CBC and saved this as File.
 *
 * @static
 * @access     public
 * @since      2026-06-05
 * @version    0.1.0
 *
 * @param      string   $strFile     Filepath and Filename to be encrypted json String saved
 * @param      object   $objObject   Object to be changed, encrypted and saved
 * @return     void
 *
 * @example    BaseObject::saveFileEnCrypted( $strFile, $objObject );
 *
*/
  public static function saveFileEnCrypted( string $strFile, object $objObject ) : void {
    $strContent = json_encode( $objObject );

    // file_put_contents( $strFile . '.json', $strContent, LOCK_EX );

    if( BaseObject::isJson( $strContent ) ) {
      $strContent = BaseObject::enCrypte( $strContent );
    }

    file_put_contents( $strFile, $strContent, LOCK_EX );

    return;
  }

/**
 * This static method load a File with encrypted json Content, decrypted it, to be changed it to an Object and return this Object.
 *
 * @static
 * @access     public
 * @since      2026-06-05
 * @version    0.1.0
 *
 * @param      string    $strFile     Filepath and Filename to the encrypted json File
 * @return     object    $objObject   The decrypted Object from the encrypted json File
 *
 * @example    $objObject = BaseObject::loadFileDeCrypted( $strFile );
 *
*/
  public static function loadFileDeCrypted( string $strFile ) : object | array {
    $strContent = file_get_contents( $strFile );
    $strContent = str_replace( array( "\r", "\n" ), '', $strContent );

    if( ! BaseObject::isJson( $strContent ) ) {
      $strContent = BaseObject::deCrypte( $strContent );
    }

    return json_decode( $strContent );
  }

/**
 * This method serializes an Object, removes particular Properties and returns the Standard Class Object.
 *
 * @access     public
 * @since      2026-06-05
 * @version    0.1.0
 *
 * @return     object    $objObject   The cleaned Standard Class Object
 *
 * @example    $objObject = $objBaseObject->serializeObject();
 *
*/
  public function serializeObject() : object {
    $objStdObject  = new StdClass();
    $objProperties = get_object_vars( $this );

    foreach( $objProperties as $strKey => $strValue ) {
      if( ! property_exists( $this->fields, $strKey ) ) continue;
      if( isset( $this->fields->$strKey->skipSave ) && $this->fields->$strKey->skipSave === true ) continue;
      if( ! isset( $strValue ) ) continue;

      $objStdObject->$strKey = $strValue;
    }

    return $objStdObject;
  }

/**
 * This static method removed a Element from a Array.
 *
 * @static
 * @access     public
 * @since      2026-06-05
 * @version    0.1.0
 *
 * @param      array    $arrArray     The Array to remove a Element from
 * @param      int      $intIndex     The Index of the Element to remove
 * @return     array    $arrArray     The Array without the Element.
 *
 * @example    $arrArray = BaseObject::removeFromArray( $arrArray, $intIndex );
 *
*/
  public static function removeFromArray( array $arrArray, int $intIndex ) : array {
    array_splice( $arrArray, $intIndex, 1 );

    return $arrArray;
  }

/**
 * This method sorts an object into an existing array based on the passed property (must be an int property).
 *
 * @static
 * @access     public
 * @since      2026-06-27
 * @version    0.1.0
 *
 * @param      array    $arrArray       The array into which the object should be sorted
 * @param      object   $objObject      The object to be sorted into the array
 * @param      string   $strProperty    The value of this property must always be an int
 * @return     void
 *
 * @example    BaseObject::insertSortedInArray( $arrArray, $objObject, $strProperty );
 *
*/
  public static function insertSortedInArray( array &$arrArray, object $objObject, string $strProperty ) : void {
    $intLow          = 0;
    $intHigh         = count( $arrArray ) - 1;
    $intTargetValue  = $objObject->$strProperty;

    while ( $intLow <= $intHigh ) {
      $intMiddle    = ( int )( ( $intLow + $intHigh ) / 2 );
      $intMiddleVal = $arrArray[ $intMiddle ]->$strProperty;

      if ( $intMiddleVal == $intTargetValue ) {
        $intLow = $intMiddle;
        break;
      } else if ( $intMiddleVal < $intTargetValue ) {
        $intLow = $intMiddle + 1;
      } else {
        $intHigh = $intMiddle - 1;
      }
    }

    array_splice( $arrArray, $intLow, 0, [ $objObject ] );

    return;
  }

/**
 * This static method cleans a object and removed all properties without Field-Entries in the Class Field Configuration.
 *
 * @static
 * @access     public
 * @since      2026-06-05
 * @version    0.1.0
 *
 * @param      object    $objObject     The Object to clean up
 * @param      object    $objFields     The Class Field Object with the Property Informations
 * @return     object    $objObject     The cleaned Object
 *
 * @example    $objObject = BaseObject::cleanObject( $objObject, $objFields );
 *
*/
  public static function cleanObject( object $objObject, object $objFields ) : object {
    $objStdObject  = new StdClass();
    $objProperties = get_object_vars( $objObject );

    foreach( $objProperties as $strKey => $strValue ) {
      if( ! property_exists( $objFields, $strKey ) ) continue;
      if( ! isset( $strValue ) ) continue;

      $objStdObject->$strKey = $strValue;
    }

    return $objStdObject;
  }

/**
 * This Method delete a Directory with all Files and Sub Directories recursively.
 *
 * @access     public
 * @since      2026-06-05
 * @version    0.1.0
 *
 * @param      string   $strPath        Path to Directory to be deleted
 * @return     bool     $boolSuccess    Is deleted
 *
 * @example    $boolSuccess = $objBaseObject->deleteDirectory( $strPath );
 *
*/
  public function deleteDirectory( string $strPath ) : bool {
    $strRealPath = realpath( $strPath );
    if( $strRealPath === false || ! str_starts_with( $strRealPath, realpath( self::FILEPATHBASE ) ) ) return false;

    if( ! is_dir( $strPath ) ) return unlink( $strPath );

    $arrFiles = substr( $strPath, 0, -1 ) == '/' ? glob( $strPath . '*' ) : glob( $strPath . '/*' );

    foreach( $arrFiles as $strFile ) {
      $this->deleteDirectory( $strFile );
    }

    return rmdir( $strPath );
  }

/**
 * This static Method generates a random String with a defined length.
 *
 * @access     public
 * @since      2026-06-05
 * @version    0.1.0
 *
 * @param      int      $intLength        The length of the random result String
 * @return     string   $strRandomString  The result random String with a defined length
 *
 * @example    $strRandomString = BaseObject::generateRandomString( $intLength );
 *
*/
  public static function generateRandomString( int $intLength = 15 ) : string {
    $strCharacters        = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    $intCharactersLength  = strlen( $strCharacters );
    $strRandomString      = '';

    for( $i = 0; $i < $intLength; $i++ ) {
        $strRandomString .= $strCharacters[ random_int( 0, $intCharactersLength - 1 ) ];
    }

    return $strRandomString;
  }

}

// EOF