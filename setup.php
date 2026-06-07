<?php

declare( strict_types = 1 );

include_once( __DIR__ . '/includes/classes/baseObject.php' );
include_once( __DIR__ . '/includes/classes/presentation.php' );

main();

function main() : void {
  setup( null );

  return;
}

function setup( object | null $objFormErrors ) : void {
  $strFields      = file_get_contents( __DIR__ . '/includes/json/fields/player.json' );
  $objConfig      = BaseObject::getConfig();

  if( isset( $objFormErrors ) && ! $objFormErrors->success ) {

  }

  $strContent   = file_get_contents( __DIR__ . '/includes/templates/setup.tmpl' );
  $strContent  .= file_get_contents( __DIR__ . '/includes/templates/footer.tmpl' );
  $strContent   = str_replace( '{{FIELDS}}', $strFields, $strContent );
  $strContent   = str_replace( '{{APPALIAS}}', $objConfig->appAlias, $strContent );
  $strContent   = str_replace( '{{APPNAME}}', $objConfig->appName, $strContent );

  echo $strContent;

  exit;
}

function executeSetup() : void {
  $strEMail                          = isset( $_POST[ 'email' ] ) ? $_POST[ 'email' ] : '';
  $strName                           = isset( $_POST[ 'name' ] ) ? $_POST[ 'name' ] : '';
  $strPassword                       = isset( $_POST[ 'password' ] ) ? $_POST[ 'password' ] : '';
  $strTitle                          = isset( $_POST[ 'title' ] ) ? $_POST[ 'title' ] : '';
  $strDescription                    = isset( $_POST[ 'description' ] ) ? $_POST[ 'description' ] : '';
  $strFieldsFile                     = __DIR__ . '/includes/json/fields/player.json';
  $strFields                         = file_get_contents( $strFieldsFile );
  $objFields                         = json_decode( $strFields );
  $strConfigFile                     = __DIR__ . '/includes/classes/config.php';
  $strPlayerFile                     = __DIR__ . '/includes/json/data/dataPlayer.json';
  $strGameFile                       = __DIR__ . '/includes/json/data/dataGame.json';
  $strPlayerFilePath                 = __DIR__ . '/includes/files/player/';
  $objPlayer                         = new stdClass();
  $strConfig                         = file_get_contents( $strConfigFile );
  $strConfig                         = str_replace( '{{PASSPHRASE1}}', generateRandomString( 15 ), $strConfig );
  $strConfig                         = str_replace( '{{PASSPHRASE2}}', generateRandomString( 15 ), $strConfig );
  $objFields                         = json_decode( $strFields );
  $objPlayer->$strEMail              = new stdClass();
  $objPlayer->$strEMail->id          = $strEMail;
  $objPlayer->$strEMail->name        = $strName;
  $objPlayer->$strEMail->password    = BaseObject::enCrypteOnly( $strPassword );
  $objPlayer->$strEMail->role        = 'administrator';
  $objPlayer->$strEMail->image       = 'avatar.png?v=' . time();
  $objPlayer->$strEMail->title       = $strTitle;
  $objPlayer->$strEMail->description = $strDescription;
  $objPlayer->$strEMail->games       = [];
  $objValidationResult               = Presentation::validateFields( $objFields, $objPlayer->$strEMail );

  if( ! $objValidationResult->success ) setup( $objValidationResult );

  file_put_contents( $strConfigFile, $strConfig );

  if( ! file_exists( $strPlayerFilePath ) ) mkdir( $strPlayerFilePath );
  if( ! file_exists( $strPlayerFile ) ) BaseObject::saveFileEnCrypted( $strPlayerFile, $objPlayer );
  if( ! file_exists( $strGameFile ) ) BaseObject::saveFileEnCrypted( $strGameFile, new stdClass() );

  copy( __DIR__ . '/includes/images/favicons/friendshunt-app-icon-180x180.png', __DIR__ . '/includes/files/player/' . $strEMail . '/avatar.png' );

  header( 'Location: index.php?setup=success' );
  setup( null );

  return;
}

function generateRandomString( int $intLength = 15 ) : string {
  $strCharacters        = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  $intCharactersLength  = strlen( $strCharacters );
  $strRandomString      = '';

  for ( $i = 0; $i < $intLength; $i++ ) {
      $strRandomString .= $strCharacters[ random_int( 0, $intCharactersLength - 1 ) ];
  }

  return $strRandomString;
}

// EOF