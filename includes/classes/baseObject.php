<?php

declare( strict_types = 1 );

class BaseObject {
  const FILEPATHBASE      = __DIR__ . '/../';
  const FILEPATHJSON      = __DIR__ . '/../json/';
  const FILEPATHDATA      = __DIR__ . '/../json/data/';

  protected object $config;
  protected object $fields;
  protected string $className;
  protected string $id;

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

  public static function fields( string $strClassname ) {
    $objAllFields    = BaseObject::loadFileDeCrypted( BaseObject::FILEPATHJSON . 'fields/' . strtolower( $strClassname ) . '.json' );

    return $objAllFields;
  }

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

  public function id() {
    return $this->id;
  }

  public function get( string $strProperty ) {
    if( ! property_exists( $this->fields, $strProperty ) ) throw new Exception("Property not exists or protected");

    return $this->$strProperty;
  }

  public function set( string | int | array | object $mixProperty, string | int | array | object | null $mixValue = null ) : void {
    if( gettype( $mixProperty ) == 'string' || gettype( $mixValue ) == 'integer' ) {
      if( ! property_exists( $this->fields, $mixProperty ) ) throw new Exception("Property not exists or protected");
      if( isset( $this->fields->$mixProperty->crypt ) && $this->fields->$mixProperty->crypt === true ) $mixValue = $this->enCrypteOnly( $mixValue );
      $this->$mixProperty = $mixValue;
    } else {
      foreach( $mixProperty as $strProperty => $mixValueArray ) {
        if( ! property_exists( $this->fields, $strProperty ) ) continue;//throw new Exception("Property not exists or protected");
        if( isset( $this->fields->$strProperty->crypt ) && $this->fields->$strProperty->crypt === true ) $mixValueArray = $this->enCrypteOnly( $mixValueArray );
        if( $this->fields->$strProperty->type == 'number' ) {
          $this->$strProperty =  intval( $mixValueArray );
        } else {
          $this->$strProperty =  $mixValueArray;
        }
      }
    }

    $this->saveObject();

    return;
  }

  public function deleteObject() : void {
    $strId           = $this->id();
    $objClassObjects = $this->loadFileDeCrypted( $this::FILEPATHJSON . 'data/data' . $this->className . '.json' );

    unset( $objClassObjects->$strId );

    $this->saveFileEnCrypted( $this::FILEPATHJSON . 'data/data' . $this->className . '.json', $objClassObjects );

    return;
  }

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

  public function saveRequestObject( object $objRequestObject ) : object {
    $strClassName = $objRequestObject->class;
    $strObjectId  = $objRequestObject->id;
    $objFields    = BaseObject::fields( $strClassName );
    $objObject    = new $strClassName( $strObjectId );
    $objSave      = new stdClass();

    foreach( $objRequestObject as $strProperty => $mixValue ) {
      if( ! isset( $objFields->$strProperty ) ) continue;
      if( isset( $objFields->$strProperty->readOnly ) && $objFields->$strProperty->readOnly ) continue;
      if( $objFields->$strProperty->element == 'img' ) {
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

  public function newId( string $strPrefix ) : string {
    return uniqid( $strPrefix . '_', true );
  }

  public static function getObjects( string $strClassName ) {
    return BaseObject::loadFileDeCrypted( BaseObject::FILEPATHDATA . 'data'. $strClassName  . '.json' );
  }

  public static function getConfig() : object {
    return BaseObject::loadFileDeCrypted( BaseObject::FILEPATHJSON . 'config.json' );
  }

  public static function isJson( string $strContent ) : bool {
    json_decode( $strContent );

    return json_last_error() === JSON_ERROR_NONE ? true : false;
  }

  public static function enCrypteOnly ( string $strContent ) : string {
    return hash( 'sha256', $strContent );
  }

  public static function enCrypte( string $strContent ) : string {
    $strContent = openssl_encrypt(
      $strContent, "AES-256-CBC",
      hash( 'sha256', 'suPerStrengGeheim' ), 0,
      substr( hash( 'sha256', 'PR0GramIeRerLungE' ), 0, 16 )
    );

    return $strContent;
  }

  public static function deCrypte( string $strContent ) : string {
    $strContent = openssl_decrypt(
      $strContent, "AES-256-CBC",
      hash( 'sha256', 'suPerStrengGeheim' ), 0,
      substr( hash( 'sha256', 'PR0GramIeRerLungE' ), 0, 16 )
    );

    return $strContent;
  }

  public static function saveFileEnCrypted( string $strFile, object $objObject ) : void {
    $strContent = json_encode( $objObject );

    file_put_contents( $strFile . '.json', $strContent, LOCK_EX );

    if( BaseObject::isJson( $strContent ) ) {
      $strContent = openssl_encrypt(
        $strContent, "AES-256-CBC",
        hash( 'sha256', 'suPerStrengGeheim' ), 0,
        substr( hash( 'sha256', 'PR0GramIeRerLungE' ), 0, 16 )
      );
    }

    file_put_contents( $strFile, $strContent, LOCK_EX );

    return;
  }

  public static function loadFileDeCrypted( string $strFile ) : object | array {
//    Presentation::logToFile( $strFile, true, 'test.log' );

    $strContent = file_get_contents( $strFile );
    $strContent = str_replace( array( "\r", "\n" ), '', $strContent );

    if( ! BaseObject::isJson( $strContent ) ) {
      $strContent = openssl_decrypt(
        $strContent, "AES-256-CBC",
        hash( 'sha256', 'suPerStrengGeheim' ), 0,
        substr( hash( 'sha256', 'PR0GramIeRerLungE' ), 0, 16 )
      );
    }

    $objObject = json_decode( $strContent );

    return $objObject;
  }

  public function serializeObject() : object {
    $objStdObject  = new StdClass();
    $objProperties = get_object_vars( $this );

    foreach ( $objProperties as $strKey => $strValue ) {
      if( ! property_exists( $this->fields, $strKey ) ) continue;
      if( isset( $this->fields->$strKey->skipSave ) && $this->fields->$strKey->skipSave === true ) continue;
      if( ! isset( $strValue ) ) continue;

      $objStdObject->$strKey = $strValue;
    }

    return $objStdObject;
  }

  public static function removeFromArray( array $arrArray, int $intIndex ) : array {
    $arrNewArray = [];

    for( $i = 0; $i < count( $arrArray ); $i++ ) {
      if( $i == $intIndex ) continue;
      array_push( $arrNewArray, $arrArray[ $i ] );
    }

    return $arrNewArray;
  }

  public static function cleanObject( object $objObject, object $objFields ) : object {
    $objStdObject  = new StdClass();
    $objProperties = get_object_vars( $objObject );

    foreach ( $objProperties as $strKey => $strValue ) {
      if( ! property_exists( $objFields, $strKey ) ) continue;
      if( ! isset( $strValue ) ) continue;

      $objStdObject->$strKey = $strValue;
    }

    return $objStdObject;
  }

  public function deleteDirectory( string $strPath ) : bool {
    if( ! is_dir( $strPath ) ) return unlink( $strPath );

    $arrFiles = substr( $strPath, 0, -1 ) == '/' ? glob( $strPath . '*' ) : glob( $strPath . '/*' );

    foreach ( $arrFiles as $strFile ) {
      $this->deleteDirectory( $strFile );
    }

    return rmdir( $strPath );
  }

}

// EOF