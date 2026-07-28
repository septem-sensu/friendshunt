<?php

declare( strict_types = 1 );

require_once ( __DIR__ . '/../classes/baseObject.php' );
require_once ( __DIR__ . '/../classes/presentation.php' );

/**
 * Player Class for the Friends-Hunt App.
 *
 * This Class represents the Player Class for the Friends-Hunt App with his Properties and Methods.
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
 * @example     $objPlayer = new Player( $strPlayerId );
 *
*/
class Player extends BaseObject {

/* Class Properties */
  protected string $name;
  protected string $password;
  protected string $role;
  protected string $email;
  protected string $emailInvitation              = 'false';
  protected string $image;
  protected array  $games                        = [];
  protected string $title;
  protected string $description;
  protected string $themes;

  protected int $asPlayerCountSteps              = 0;
  protected int $asHunterCountSteps              = 0;
  protected int $asManagementCountSteps          = 0;
  protected int $asPlayerDistance                = 0;
  protected int $asHunterDistance                = 0;
  protected int $asManagementDistance            = 0;
  protected int $asPlayerCountGames              = 0;
  protected int $asHunterCountGames              = 0;
  protected int $asManagementCountGames          = 0;
  protected int $asPlayerTime                    = 0;
  protected int $asHunterTime                    = 0;
  protected int $asManagementTime                = 0;
  protected int $asPlayerViolationOfTheRules     = 0;
  protected int $asHunterViolationOfTheRules     = 0;
  protected int $asManagementViolationOfTheRules = 0;
  protected int $asPlayerSpeedHunts              = 0;
  protected int $asHunterSpeedHunts              = 0;
  protected int $asManagementSpeedHunts          = 0;
  protected int $asPlayerCaptured                = 0;
  protected int $asHunterCaptured                = 0;
  protected int $asManagementCaptured            = 0;
  protected int $asPlayerCountMessages           = 0;
  protected int $asHunterCountMessages           = 0;
  protected int $asManagementCountMessages       = 0;
  protected int $asPlayerCountMessagesAll        = 0;
  protected int $asHunterCountMessagesAll        = 0;
  protected int $asManagementCountMessagesAll    = 0;
  protected int $asPlayerDistanceDriven          = 0;
  protected int $asHunterDistanceDriven          = 0;
  protected int $asManagementDistanceDriven      = 0;

/**
 * This static Method add a new Player to the App.
 *
 * @access     public
 * @since      2026-06-05
 * @version    0.1.0
 *
 * @param      object     $objNewPlayerRequestObject    The Request Object
 * @return     object     $objNewPlayerRequestObject    The Request Object
 *
 * @example    $objNewPlayerRequestObject = Player::newPlayer( $objNewPlayerRequestObject );
 *
*/
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
    $objNewPlayerRequestObject->redirect    = 'index.php?view=player';

    BaseObject::saveFileEnCrypted( BaseObject::FILEPATHJSON . 'data/dataPlayer.json', $objAllPlayer );

    if( ! file_exists( __DIR__ . '/../files/player/' ) ) mkdir( __DIR__ . '/../files/player' );
    if( ! file_exists( __DIR__ . '/../files/player/' . $strEmail ) ) mkdir( __DIR__ . '/../files/player/' . $strEmail );

    copy( __DIR__ . '/../images/favicons/friendshunt-app-icon-180x180.png', __DIR__ . '/../files/player/' . $strEmail . '/avatar.png' );

    return $objNewPlayerRequestObject;
  }

/**
 * This static method creates a new player via the registration template.
 * The new player's data is initially saved in the dataRegister.json file.
 * The player will be sent an email with a confirmation link.
 *
 * @access     public
 * @since      2026-07-26
 * @version    0.1.0
 *
 * @param      object     $objRequestObject    The Request Object
 * @return     object     $objRequestObject    The Request Object
 *
 * @example    Player::register( $objRequestObject );
 *
*/
  public static function register( object $objRequestObject ) : object {
    $objRequestObject->role     = 'player';
    $objRequestObject->image    = 'avatar.png';
    $objAllPlayer               = BaseObject::getObjects( 'Player' );
    $objRegisteredPlayer        = BaseObject::loadFileDeCrypted( BaseObject::FILEPATHJSON . 'data/dataRegister.json' );
    $objFields                  = BaseObject::loadFileDeCrypted( BaseObject::FILEPATHJSON . 'fields/player.json' );
    $strEmail                   = $objRequestObject->email;
    $objValidateResult          = Presentation::validateFields( $objFields, $objRequestObject );
    $objRequestObject->password = isset( $objRequestObject->password ) ? BaseObject::enCrypteOnly( $objRequestObject->password ) : null;

    if( ! $objValidateResult->success ) {
      $objRequestObject->formErrors = $objValidateResult->formErrors;

      return $objRequestObject;
    }

    if( isset( $objAllPlayer->$strEmail ) || isset( $objRegisteredPlayer->$strEmail ) ) {
      $objRequestObject->formErrors = [];
      array_push( $objRequestObject->formErrors, Presentation::newFormError( '#email', 'Spieler existiert schon' ) );

      return $objRequestObject;
    }

    $objNewPlayer                   = BaseObject::cleanObject( $objRequestObject, $objFields );
    $strRegisterKey                 = base64_encode( BaseObject::enCrypte( $strEmail . '|||' . $objRequestObject->password ) );
    $objNewPlayer->created          = time();
    $objRegisteredPlayer->$strEmail = $objNewPlayer;
    $arrCryptKeys                   = BaseObject::getCryptKeys();
    $strRegisterLink                = Presentation::getBaseUrl() . '?view=registerFinished&register=' . $strRegisterKey;
    $objEmail                       = new stdClass();
    $objEmail->mailAddress          = $arrCryptKeys[ 'mailAddress' ];
    $objEmail->to                   = $strEmail;
    $objEmail->subject              = BaseObject::getConfig()->registerMailSubject;
    $objEmail->message              = file_get_contents( __DIR__ . '/../templates/mail/register.tmpl' );
    $objEmail->message              = str_replace( '{{NAME}}', $objRequestObject->name, $objEmail->message );
    $objEmail->message              = str_replace( '{{APPNAMESHORT}}', BaseObject::getConfig()->appNameShort, $objEmail->message );
    $objEmail->message              = str_replace( '{{APPNAME}}', BaseObject::getConfig()->appName, $objEmail->message );
    $objEmail->message              = str_replace( '{{REGISTERLINK}}', $strRegisterLink, $objEmail->message );
    $objRequestObject->redirect     = '?view=registerSuccess';

    BaseObject::saveFileEnCrypted( BaseObject::FILEPATHJSON . 'data/dataRegister.json', $objRegisteredPlayer );
    Presentation::sendHtmlMail( $objEmail, false );

    return $objRequestObject;
  }

/**
 * This static method is executed before the registerFinished View.
 * The registerFinished view is executed from the email confirmation and is intended to add the pre-registered player to the app as a registered player.
 *
 * @access     public
 * @since      2026-07-26
 * @version    0.1.0
 *
 * @param      object   $objController    The Controller Object
 * @return     object   $objController    The Controller Object
 *
 * @example    $objController = Player::registerFinished( $objController );
 *
*/
  public static function registerFinished( Controller $objController ) : object {
    $strRegisterKey       = isset( $_GET[ 'register' ] ) && $_GET[ 'register' ] != '' ? $_GET[ 'register' ] : null;
    $strRegisterKey       = isset( $strRegisterKey ) ? base64_decode( $strRegisterKey ) : null;
    $strRegisterKey       = isset( $strRegisterKey ) ? BaseObject::deCrypte( $strRegisterKey ) : null;
    $arrRegisterKey       = isset( $strRegisterKey ) ? explode( '|||', $strRegisterKey ) : [];
    $objAllPlayer         = BaseObject::getObjects( 'Player' );
    $objRegisteredPlayer  = BaseObject::loadFileDeCrypted( BaseObject::FILEPATHJSON . 'data/dataRegister.json' );
    $boolHasErrors        = false;
    $strEmail             = null;

    if( count( $arrRegisterKey ) < 2 ) $boolHasErrors = true;

    $strEmail     = ! $boolHasErrors && isset( $arrRegisterKey[ 0 ] ) && $arrRegisterKey[ 0 ] != '' ? $arrRegisterKey[ 0 ] : null;
    $strPassword  = ! $boolHasErrors && isset( $arrRegisterKey[ 1 ] ) && $arrRegisterKey[ 1 ] != '' ? $arrRegisterKey[ 1 ] : null;

    if( ! isset( $strEmail ) ) $boolHasErrors = true;
    if( ! isset( $strPassword ) ) $boolHasErrors = true;
    if( ! $boolHasErrors && isset( $objAllPlayer->$strEmail ) ) $boolHasErrors = true;
    if( ! $boolHasErrors && ! isset( $objRegisteredPlayer->$strEmail ) ) $boolHasErrors = true;

    $objPlayer   = ! $boolHasErrors ? $objRegisteredPlayer->$strEmail : null;

    if( ! isset( $objPlayer ) || $objPlayer->password != $strPassword ) $boolHasErrors = true;

    if( ! $boolHasErrors ) {
      $objPlayer->created         = time();
      $objPlayer->emailInvitation = 'false';
      $objAllPlayer->$strEmail    = $objPlayer;

      if( ! file_exists( __DIR__ . '/../files/player/' ) ) mkdir( __DIR__ . '/../files/player' );
      if( ! file_exists( __DIR__ . '/../files/player/' . $strEmail ) ) mkdir( __DIR__ . '/../files/player/' . $strEmail );

      copy( __DIR__ . '/../images/favicons/friendshunt-app-icon-180x180.png', __DIR__ . '/../files/player/' . $strEmail . '/avatar.png' );
      unset( $objRegisteredPlayer->$strEmail );
      BaseObject::saveFileEnCrypted( BaseObject::FILEPATHJSON . 'data/dataPlayer.json', $objAllPlayer );
      BaseObject::saveFileEnCrypted( BaseObject::FILEPATHJSON . 'data/dataRegister.json', $objRegisteredPlayer );

      $objController->getPresentationObject()->assignTemplateVar( 'registerFinishedSuccsess', 'Player', null, 'true' );
    } else {
      $objController->getPresentationObject()->assignTemplateVar( 'registerFinishedSuccsess', 'Player', null, 'false' );
    }

    return $objController;
  }

/**
 * This Method add the Game Objects to the Template Variables for the Template Engine.
 *
 * @access     public
 * @since      2026-06-05
 * @version    0.1.0
 *
 * @param      object     $objRequestObject    The Request Object
 * @return     object     $objRequestObject    The Request Object
 *
 * @example    $objRequestObject = $objPlayer->addGamesToTemplate( $objRequestObject );
 *
*/
  public function addGamesToTemplate( object $objRequestObject ) : object {
    $arrGameIds = $this->games;
    $arrGames   = [];

    if( ! is_array( $arrGameIds ) ) return $objRequestObject;

    foreach( $arrGameIds as $gameId ) {
      $objGame         = new Game( $gameId );
      array_push( $arrGames, $objGame->serializeObject() );
    }

    $objRequestObject->getPresentationObject()->assignTemplateVar( 'gameObjects', 'Player', $this->fields( 'Player' ), json_encode( $arrGames ) );
    $objRequestObject->getPresentationObject()->assignTemplateVar( 'gameFields', 'Game', $this->fields( 'Game' ), json_encode( $this->fields( 'Game' ) ) );

    return $objRequestObject;
  }

/**
 * This static Method manage the Login of a Player and controlls the App Cookie, set the System Role and the Controller Player Object.
 *
 * @access     public
 * @since      2026-06-05
 * @version    0.1.0
 *
 * @param      mixed     $objController    The Controller Object
 * @return     bool      $boolLoginTrue    The Login
 *
 * @example    $boolLoginTrue = Player::checkLogin( $objController );
 *
*/
  public static function checkLogin( object | null $objController = null ) : bool {
    $objConfig      = BaseObject::getConfig();
    $strCookieName  = $objConfig->cookieName;
    $objViewObject  = isset( $objController ) ? $objController->getViewObject() : null;
    $strResultType  = isset( $objController ) ? $objController->getResultType() : 'json';

    if( ! isset( $_COOKIE ) || ! isset( $_COOKIE[ $strCookieName ] ) ) return false;

    $objAllPlayer          = BaseObject::getObjects( $objConfig->userClass );
    $objCookie             = json_decode( $_COOKIE[ $strCookieName ] );
    $strToken              = BaseObject::deCrypte( $objCookie->token );
    $arrToken              = explode( '|||', html_entity_decode( $strToken ) );
    $strPlayerIdFromCookie = $arrToken[0];
    $strPasswordFromCookie = $arrToken[1];

    if( ! isset( $objAllPlayer ) || ! isset( $objAllPlayer->$strPlayerIdFromCookie ) ) return false;
    if( ! isset( $objAllPlayer->$strPlayerIdFromCookie->password ) || ! hash_equals( $objAllPlayer->$strPlayerIdFromCookie->password, $strPasswordFromCookie ) ) return false;

    if( isset( $objController ) ) {
      $objController->setRole( $objAllPlayer->$strPlayerIdFromCookie->role );
      $objController->setPlayerId( $strPlayerIdFromCookie );
      $objController->setObject( new Player( $strPlayerIdFromCookie ) );
    }

    if( $strResultType == 'content' && isset( $objViewObject ) && isset( $objViewObject->alias ) && $objViewObject->alias == 'login' ) {
      header( 'Location: index.php?view=' . $objConfig->defaultLoginView  );
      exit;
    }

    return true;
  }

/**
 * This static Method returns the PlayerId from the App Cookie.
 *
 * @access     public
 * @since      2026-06-05
 * @version    0.1.0
 *
 * @return     mixed   $strPlayerId | null    The PlayerId from the Cookie if available
 *
 * @example    $strPlayerId = Player::getPlayerIdFromCookie();
 *
*/
  public static function getPlayerIdFromCookie() : string | null {
    $strToken  = BaseObject::deCrypte( Presentation::getCookieProperty( 'token' ) );
    $arrToken  = isset( $strToken  ) ? explode( '|||', $strToken ) : null;

    return isset( $arrToken ) && count( $arrToken ) > 0 ? $arrToken[ 0 ] : null;
  }

/**
 * This static Method check the Player Login from the Login Page.
 *
 * @access     public
 * @since      2026-06-05
 * @version    0.1.0
 *
 * @param      object     $objLoginObject    The Request Object
 * @return     object     $objLoginObject    The Request Object
 *
 * @example    $objLoginObject = Player::login( $objLoginObject );
 *
*/
  public static function login( object $objLoginObject ) : object {
    $objLoginObject->formErrors  = [];
    $objPlayer                   = null;
    $objConfig                   = BaseObject::getConfig();
    $objAllPlayer                = BaseObject::getObjects( 'Player' );
    $strRedirect                 = 'index.php?view=' . $objConfig->defaultLoginView;

    if( Player::checkLogin( null ) ) {
      $objLoginObject->redirect = $strRedirect;
      $objLoginObject->success = true;

      return $objLoginObject;
    }

    $strPlayerInput     = isset( $objLoginObject->name )     ? $objLoginObject->name     : null;
    $strPasswordInput   = isset( $objLoginObject->password ) ? $objLoginObject->password : null;
    $objPlayer          = isset( $strPlayerInput ) && isset( $objAllPlayer->$strPlayerInput ) ? $objAllPlayer->$strPlayerInput : null;

    if( ! isset( $objPlayer ) || ! isset( $strPasswordInput ) || ! hash_equals( $objPlayer->password, BaseObject::enCrypteOnly( $strPasswordInput ) ) ) {
      array_push( $objLoginObject->formErrors, Presentation::newFormError( '#name', 'Login fehlgeschlagen' ) );
      array_push( $objLoginObject->formErrors, Presentation::newFormError( '#password', 'Login fehlgeschlagen' ) );
      $objLoginObject->success = false;

      return $objLoginObject;
    }

    $objParams = new stdClass();
    $objParams->token = BaseObject::enCrypte( $strPlayerInput . '|||' . BaseObject::enCrypteOnly( $strPasswordInput ) );
    Presentation::writeCookie( $objParams );

    $objLoginObject->redirect = $strRedirect;
    $objLoginObject->success = true;

    return $objLoginObject;
  }

/**
 * This Method renamed the Avatar Image File after Upload.
 *
 * @access     public
 * @since      2026-06-05
 * @version    0.1.0
 *
 * @param      string     $strFileName    The Avatar Image File Name after Upload
 * @return     void
 *
 * @example    $objPlayer->avatarFileUploaded( $strFileName );
 *
*/
  public function avatarFileUploaded( string $strFileName ) : void {
    $strClass  = isset( $_POST[ 'class' ] ) ? $_POST[ 'class' ] : null;
    $strId     = isset( $_POST[ 'id' ] ) ? $_POST[ 'id' ] : null;

    if( $strClass !== 'Player' ) return;

    $strPath   = __DIR__ . '/../files/' . lcfirst( $strClass ) . '/' . $strId . '/';
    $strRealPath = realpath( $strPath );

    if( $strRealPath === false || ! str_starts_with( $strRealPath, realpath( __DIR__ . '/../files/' ) ) ) return;

    if( file_exists( $strPath . 'avatar.png' ) ) unlink( $strPath . 'avatar.png' );
    if( file_exists( $strPath . 'avatar.jpg' ) ) unlink( $strPath . 'avatar.jpg' );
    if( file_exists( $strPath . 'avatar.webp' ) ) unlink( $strPath . 'avatar.webp' );

    $arrPathInfo = pathinfo( $strPath . $strFileName );

    rename( $strPath . $strFileName, $strPath . 'avatar.' . strtolower( $arrPathInfo[ 'extension' ] ) );

    $objPlayer = new $strClass( $strId );
    $objPlayer->set( 'image', 'avatar.' . strtolower( $arrPathInfo[ 'extension' ] ) );

    return;
  }

/**
 * This Method delete the current Player with all Files and Directories.
 *
 * @access     public
 * @since      2026-06-05
 * @version    0.1.0
 *
 * @param      object     $objRequestObject    The Request Object
 * @return     object     $objRequestObject    The Request Object
 *
 * @example    $objRequestObject = $objPlayer->deletePlayer( $objRequestObject );
 *
*/
  public function deletePlayer( object $objRequestObject ) : object {
    $objAllPlayer  = BaseObject::loadFileDeCrypted( __DIR__ . '/../json/data/dataPlayer.json' );
    $strPlayerId   = $this->id();

    $this->deleteDirectory( __DIR__ . '/../files/player/' . $strPlayerId . '/' );
    unset( $objAllPlayer->$strPlayerId );
    BaseObject::saveFileEnCrypted( __DIR__ . '/../json/data/dataPlayer.json', $objAllPlayer );

    $objRequestObject->redirect = 'index.php?view=login';

    return $objRequestObject;
  }

/**
 * This Method delete a Player with all Files and Directories.
 *
 * @access     public
 * @since      2026-06-05
 * @version    0.1.0
 *
 * @param      object     $objRequestObject    The Request Object
 * @return     object     $objRequestObject    The Request Object
 *
 * @example    $objRequestObject = $objPlayer->deletePlayerFromApp( $objRequestObject );
 *
*/
  public function deletePlayerFromApp( object $objRequestObject ) : object {
    $objAllPlayer  = BaseObject::loadFileDeCrypted( __DIR__ . '/../json/data/dataPlayer.json' );
    $strPlayerId   = $objRequestObject->deletePlayerId;

    $this->deleteDirectory( __DIR__ . '/../files/player/' . $strPlayerId . '/' );
    unset( $objAllPlayer->$strPlayerId );
    BaseObject::saveFileEnCrypted( __DIR__ . '/../json/data/dataPlayer.json', $objAllPlayer );

    $objRequestObject->redirect = 'index.php?view=playerList';

    return $objRequestObject;
  }

/**
 * This Method is the Setup Routine for the App. The Method generates the following:
 * - creates the dataPlayer.json file with the Administrator Data from the Setup Form
 * - creates the dataGame.json
 * - creates the Player File Directory and copies the default Avatar in the Directory
 * - sets the Passphrases in the PHP Config Package
 *
 * @access     public
 * @since      2026-06-05
 * @version    0.1.0
 *
 * @param      object     $objRequestObject    The Request Object
 * @return     object     $objRequestObject    The Request Object
 *
 * @example    $objRequestObject = $objPlayer->setup( $objRequestObject );
 *
*/
  public static function setup( object $objRequestObject ) : object {
    $objConfig                   = BaseObject::getConfig();
    $objSetupPlayer              = new stdClass();
    $objSetupPlayer->id          = isset( $objRequestObject->email ) ? $objRequestObject->email : '';
    $objSetupPlayer->email       = isset( $objRequestObject->email ) ? $objRequestObject->email : '';
    $objSetupPlayer->password    = isset( $objRequestObject->password ) ? $objRequestObject->password : '';
    $objSetupPlayer->name        = isset( $objRequestObject->name ) ? $objRequestObject->name : '';
    $objSetupPlayer->title       = isset( $objRequestObject->title ) ? $objRequestObject->title : '';
    $objSetupPlayer->description = isset( $objRequestObject->description ) ? $objRequestObject->description : '';
    $objSetupPlayer->image       = 'avatar.png?v=' . time();
    $objSetupPlayer->role        = 'administrator';
    $objSetupPlayer->games       = [];
    $objFields                   = BaseObject::fields( 'player' );
    $objValidationResult         = Presentation::validateFields( $objFields, $objSetupPlayer );
    $strConfig                   = file_get_contents( __DIR__ . '/../classes/config.php' );
    $strConfig                   = str_replace( '{{PASSPHRASE1}}', BaseObject::generateRandomString( 15 ), $strConfig );
    $strConfig                   = str_replace( '{{PASSPHRASE2}}', BaseObject::generateRandomString( 15 ), $strConfig );
    $strConfig                   = str_replace( '{{MAILADDRESS}}', $objSetupPlayer->name . '<' . $objSetupPlayer->email . '>', $strConfig );

    if( ! $objValidationResult->success ) {
      $objRequestObject->formErrors = $objValidationResult->formErrors;
      return $objRequestObject;
    }

    file_put_contents( __DIR__ . '/../classes/config.php', $strConfig );

    if( function_exists( 'opcache_invalidate' ) ) opcache_invalidate( __DIR__ . '/../classes/config.php', true );

    if( ! file_exists( __DIR__ . '/../json/data/dataGame.json' ) ) BaseObject::saveFileEnCrypted( __DIR__ . '/../json/data/dataGame.json', new stdClass() );
    if( ! file_exists( __DIR__ . '/../json/data/dataRegister.json' ) ) BaseObject::saveFileEnCrypted( __DIR__ . '/../json/data/dataRegister.json', new stdClass() );

    if( ! file_exists( __DIR__ . '/../json/data/dataPlayer.json' ) ) {
      $objFirstPlayer                    = new stdClass();
      $objSetupPlayer->password          = BaseObject::enCrypteOnly( $objSetupPlayer->password );
      $strFirstPlayerId                  = $objSetupPlayer->id;
      $objFirstPlayer->$strFirstPlayerId = $objSetupPlayer;

      BaseObject::saveFileEnCrypted( __DIR__ . '/../json/data/dataPlayer.json', $objFirstPlayer );
    }

    if( ! file_exists( __DIR__ . '/../files/player/' . $objSetupPlayer->id . '/' ) ) {
      mkdir( __DIR__ . '/../files/player/' . $objSetupPlayer->id . '/' );
      copy( __DIR__ . '/../images/favicons/friendshunt-app-icon-180x180.png', __DIR__ . '/../files/player/' . $objSetupPlayer->id . '/avatar.png' );
    }

    $objRequestObject->redirect = 'index.php?view=' . $objConfig->defaultView;

    return $objRequestObject;
  }

/**
 * This Method returns a List of all App Player Objects.
 *
 * @access     public
 * @since      2026-06-05
 * @version    0.1.0
 *
 * @param      object     $objRequestObject    The Request Object
 * @return     object     $objRequestObject    The Request Object
 *
 * @example    $objRequestObject = $objPlayer->getPlayerList( $objRequestObject );
 *
*/
  public function getPlayerList( object $objRequestObject ) : object {
    $objRequestObject->playerList = BaseObject::loadFileDeCrypted( __DIR__ . '/../json/data/dataPlayer.json' );

    return $objRequestObject;
  }

/**
 * This Method returns a List of all archived Game Objects.
 *
 * @access     public
 * @since      2026-06-05
 * @version    0.1.0
 *
 * @param      object     $objRequestObject    The Request Object
 * @return     object     $objRequestObject    The Request Object
 *
 * @example    $objRequestObject = $objPlayer->getGameArchiveList( $objRequestObject );
 *
*/
  public function getGameArchiveList( object $objRequestObject ) : object {
    $objRequestObject->archiveGames = new stdClass();
    $strArchiveDir                  = __DIR__ . '/../files/game/archive/';
    $arrGameArchiveDirs             = scandir( $strArchiveDir );
    $strPlayerId                    = $this->getPlayerIdFromCookie();
    $objPlayer                      = new Player( $strPlayerId );
    $strPlayerRole                  = $objPlayer->get( 'role' );

    foreach( $arrGameArchiveDirs as $strGameId ) {
      $strPath = $strArchiveDir  . '/' . $strGameId . '/';

      if( ! is_dir( $strPath ) || $strGameId === '.' || $strGameId === '..' ) continue;

      $objGame = $this->loadFileDeCrypted( $strPath . 'dataGame.json' );

      if( $strPlayerRole != 'administrator' ) {
         if( ! isset( $objGame->owner ) || $objGame->owner != $strPlayerId ) continue;
      }

      $objRequestObject->archiveGames->$strGameId = $objGame;
    }

    return $objRequestObject;
  }

/**
 * This Method brings a Game Object with all Files back from the Archive to the Overview.
 *
 * @access     public
 * @since      2026-06-05
 * @version    0.1.0
 *
 * @param      object     $objRequestObject    The Request Object
 * @return     object     $objRequestObject    The Request Object
 *
 * @example    $objRequestObject = $objPlayer->backFromArchiveGame( $objRequestObject );
 *
*/
  public function backFromArchiveGame( object $objRequestObject ) : object {
    $arrGameRoles          = [ 'player', 'hunter', 'management' ];
    $objAllPlayer          = $this::getObjects( 'Player' );
    $strGameId             = $objRequestObject->gameId;
    $strPathSource         = __DIR__ . '/../files/game/archive/' . $strGameId . '/';
    $strPathTarget         = __DIR__ . '/../files/game/' . $strGameId . '/';
    $objGames              = BaseObject::loadFileDeCrypted( __DIR__ . '/../json/data/dataGame.json' );
    $objGame               = BaseObject::loadFileDeCrypted( $strPathSource . 'dataGame.json' );
    $objGames->$strGameId  = $objGame;
    $arrSourceFiles        = scandir( $strPathSource );
    $strPlayerRole         = $this->role;

    if( $strPlayerRole != 'administrator' ) {
      if( ! isset( $objGame->owner ) || $objGame->owner != $this->id() ) {
        $objError           = new stdClass();
        $objError->message  = 'Zugriff verweigert';

        array_push( $objRequestObject->controller->response->errors, $objError );

        return $objRequestObject;
      }
    }

    BaseObject::saveFileEnCrypted( __DIR__ . '/../json/data/dataGame.json', $objGames );

    if( ! file_exists( $strPathTarget ) ) mkdir( $strPathTarget );

    foreach( $arrSourceFiles as $strFile ) {
      if( $strFile == '.' || $strFile == '..' ) continue;

      $strSourceFile = $strPathSource . $strFile;
      $strTargetFile = $strPathTarget . $strFile;

      if( is_file( $strSourceFile ) ) copy( $strSourceFile, $strTargetFile );
    }

    foreach( $arrGameRoles as $strGameplayRole ) {
      $arrPlayer       = isset( $objGame->$strGameplayRole ) ? $objGame->$strGameplayRole : [];

      foreach( $arrPlayer as $strPlayerId ) {
        if( ! isset( $objAllPlayer->$strPlayerId ) ) continue;
        if( ! isset( $objAllPlayer->$strPlayerId->games ) ) $objAllPlayer->$strPlayerId->games = [];
        if( in_array( $strGameId, $objAllPlayer->$strPlayerId->games ) ) continue;

        array_push( $objAllPlayer->$strPlayerId->games, $strGameId );
      }
    }

    $this::saveFileEnCrypted( __DIR__ . '/../json/data/dataPlayer.json', $objAllPlayer );
    unlink( $strPathTarget . 'dataGame.json' );
    $this->deleteDirectory( $strPathSource );

    $objRequestObject->redirect = 'index.php?view=gameArchive';

    return $objRequestObject;
  }

/**
 * This Method delete a Game with all Files and the Directory in the Archive.
 *
 * @access     public
 * @since      2026-06-05
 * @version    0.1.0
 *
 * @param      object     $objRequestObject    The Request Object
 * @return     object     $objRequestObject    The Request Object
 *
 * @example    $objRequestObject = $objPlayer->deleteArchiveGame( $objRequestObject );
 *
*/
  public function deleteArchiveGame( object $objRequestObject ) : object {
    $strGameId      = $objRequestObject->gameId;
    $strPlayerRole  = $this->role;

    if( $strPlayerRole != 'administrator' ) {
      $strPathSource  = __DIR__ . '/../files/game/archive/' . $strGameId . '/';
      $objGame        = BaseObject::loadFileDeCrypted( $strPathSource . 'dataGame.json' );

      if( ! isset( $objGame->owner ) || $objGame->owner != $this->id() ) {
        $objError           = new stdClass();
        $objError->message  = 'Zugriff verweigert';

        array_push( $objRequestObject->controller->response->errors, $objError );

        return $objRequestObject;
      }
    }

    $this->deleteDirectory( __DIR__ . '/../files/game/archive/' . $strGameId . '/' );

    $objRequestObject->redirect = 'index.php?view=gameArchive';

    return $objRequestObject;
  }

}

// EOF
