<?php

declare( strict_types = 1 );

require_once ( __DIR__ . '/../classes/baseObject.php' );
require_once ( __DIR__ . '/../classes/gameplay.php' );

/**
 * Game Class for the Friends-Hunt App.
 *
 * This Class represents the Game Class for the Friends-Hunt App with his Properties and Methods.
 * The Game Class controls the Game Settings.
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
 * @example     $objGame = new Game( $strGameId );
 *
*/
class Game extends BaseObject {

  const GAMEROLES = [ 'player' => 'Spieler', 'hunter' => 'Hunter', 'management' => 'Spielleitung' ];

/* Class Properties */
  protected string $name;
  protected string $title;
  protected string $description;
  protected array  $player;
  protected array  $hunter;
  protected array  $management;
  protected int    $start;
  protected int    $duration;
  protected string $avatar;
  protected int    $pingInterval;
  protected int    $speedPingInterval;
  protected int    $speedPingCount;
  protected string $startPosition;
  protected string $exitPosition;
  protected array  $images = [];
  protected string $tmpImageAdd;
  protected string $showPlayer;
  protected int    $trackInterval;
  protected string $showNames;
  protected string $playingFieldCenterPosition;
  protected int    $playingFieldSize;
  protected string $sanctionForVehicleUse;
  protected int    $minimumDistancePlayer;
  protected string $owner;

/**
 * This static Method set a uploaded Game Image to the Game Object.
 *
 * @access     public
 * @since      2026-06-05
 * @version    0.1.0
 *
 * @param      string   $strFileName    The File Name of the Image
 * @return     void
 *
 * @example    $objGame->addGameImage( $strFileName );
 *
*/
  public function addGameImage( string $strFileName ) : void {
    $strClass        = isset( $_POST[ 'class' ] ) ? $_POST[ 'class' ] : null;
    $strId           = isset( $_POST[ 'id' ] ) ? $_POST[ 'id' ] : null;

    if( $strClass !== 'Game' ) return;

    $objGame   = new $strClass( $strId );
    $arrImages = $objGame->get( 'images' );

    array_push( $arrImages, $strFileName );
    $objGame->set( 'images', $arrImages );
    $objGame->set( 'tmpImageAdd', '' );

    return;
  }

/**
 * This Method delete a Gameplay Image.
 *
 * @access     public
 * @since      2026-06-05
 * @version    0.1.0
 *
 * @param      object   $objRequestObject    The Ajax Request Object
 * @return     object   $objRequestObject    The Ajax Request Object
 *
 * @example    $objRequestObject = $objGame->deleteGameImage( $objRequestObject );
 *
*/
  public function deleteGameImage( object $objRequestObject ) : object {
    $strImageName  = $objRequestObject->imageId;
    $arrImages     = $this->get( 'images' );
    $strPlayerId   = $objRequestObject->playerId;
    $objPlayer     = new Player( $strPlayerId );
    $strPlayerRole = $objPlayer->get( 'role' );
    $strGameOwner  = $this->owner;

    if( $strPlayerRole != 'administrator' ) {
      if( ! isset( $strGameOwner ) || $strGameOwner != $strPlayerId ) {
        $objError           = new stdClass();
        $objError->message  = 'Zugriff verweigert';

        array_push( $objRequestObject->controller->response->errors, $objError );

        return $objRequestObject;
      }
    }

    unlink( __DIR__ . '/../files/game/' . $this->id() . '/' . $strImageName );

    foreach( $arrImages as $i => $strImage ) {
      if( $strImage != $strImageName ) continue;

      $arrImages = BaseObject::removeFromArray( $arrImages, $i );

      $this->set( 'images', $arrImages );

      break;
    }

    $objRequestObject->redirect = '?view=gameDashboard&class=game&id=' . $this->id();

    return $objRequestObject;
  }

/**
 * This Method sets a uploaded Game Avatar to the Game Object and renames the Image.
 *
 * @access     public
 * @since      2026-06-05
 * @version    0.1.0
 *
 * @param      string   $strFileName    The Avatar File Name of the Image
 * @return     void
 *
 * @example    $objPlayer->avatarFileUploaded( $strFileName );
 *
*/
  public function avatarFileUploaded( string $strFileName ) : void {
    $strClass        = isset( $_POST[ 'class' ] ) ? $_POST[ 'class' ] : null;
    $strId           = isset( $_POST[ 'id' ] ) ? $_POST[ 'id' ] : null;

    if( $strClass !== 'Game' ) return;

    $strPath         = __DIR__ . '/../files/' . lcfirst( $strClass ) . '/' . $strId . '/';
    $strRealPath     = realpath( $strPath );

    if( $strRealPath === false || ! str_starts_with( $strRealPath, realpath( __DIR__ . '/../files/' ) ) ) return;

    if( file_exists( $strPath . 'avatar.png' ) ) unlink( $strPath . 'avatar.png' );
    if( file_exists( $strPath . 'avatar.jpg' ) ) unlink( $strPath . 'avatar.jpg' );
    if( file_exists( $strPath . 'avatar.webp' ) ) unlink( $strPath . 'avatar.webp' );

    $arrPathInfo = pathinfo( $strPath . $strFileName );

    rename( $strPath . $strFileName, $strPath . 'avatar.' . strtolower( $arrPathInfo[ 'extension' ] ) );

    $objPlayer = new $strClass( $strId );
    $objPlayer->set( 'avatar', 'avatar.' . strtolower( $arrPathInfo[ 'extension' ] ) . '?v=' . time() );

    return;
  }

/**
 * This Method starts the Game with a redirect to the Game.
 *
 * @access     public
 * @since      2026-06-05
 * @version    0.1.0
 *
 * @param      object   $objRequestObject    The Ajax Request Object
 * @return     object   $objRequestObject    The Ajax Request Object
 *
 * @example    $objRequestObject = $objGame->startGame( $objRequestObject );
 *
*/
  public function startGame( object $objRequestObject ) : object {
    $objRequestObject->redirect = "index.php?view=game&class=Game&id=" . $objRequestObject->id;

    return $objRequestObject;
  }

/**
 * This Method set the Gameplay Data to the Template Engine.
 *
 * @access     public
 * @since      2026-06-05
 * @version    0.1.0
 *
 * @param      object   $objRequestObject    The Ajax Request Object
 * @return     object   $objRequestObject    The Ajax Request Object
 *
 * @example    $objRequestObject = $objGame->addGamePlayDataToGame( $objRequestObject );
 *
*/
  public function addGamePlayDataToGame( object $objRequestObject ) : object {
    $objGameplayData = BaseObject::loadFileDeCrypted( __DIR__ . '/../files/game/' . $this->id() . '/gameplay.json' );

    $objRequestObject->getPresentationObject()->assignTemplateVar( 'gameplayData', 'Gameplay', null, json_encode( $objGameplayData ) );

    return $objRequestObject;
  }

/**
 * This Method delete a Game with all Files.
 *
 * @access     public
 * @since      2026-06-05
 * @version    0.1.0
 *
 * @param      object   $objRequestObject    The Ajax Request Object
 * @return     object   $objRequestObject    The Ajax Request Object
 *
 * @example    $objRequestObject = $objGame->deleteGame( $objRequestObject );
 *
*/
  public function deleteGame( object $objRequestObject ) : object {
    $arrGameRoles     = static::GAMEROLES;
    $strClass         = $objRequestObject->class;
    $strId            = $objRequestObject->id;
    $objGame          = new $strClass( $strId );
    $strGameOwner     = $objGame->get( 'owner' );
    $strPlayerId      = $objRequestObject->playerId;
    $objPlayer        = new Player( $strPlayerId );
    $strPlayerRole    = $objPlayer->get( 'role' );

    if( $strPlayerRole != 'administrator' ) {
      if( ! isset( $strGameOwner ) || $strGameOwner != $strPlayerId ) {
        $objError           = new stdClass();
        $objError->message  = 'Zugriff verweigert';

        array_push( $objRequestObject->controller->response->errors, $objError );

        return $objRequestObject;
      }
    }

    foreach( $arrGameRoles as $strRoleId => $strRoleName ) {
      $arrPlayerIds = $objGame->get( $strRoleId );

      foreach( $arrPlayerIds as $strPlayerId ) {
        $objPlayer   = new Player( $strPlayerId );
        $arrGames    = $objPlayer->get( 'games' );
        $arrGames    = isset( $arrGames ) ? $arrGames : [];
        $arrGamesNew = [];

        foreach( $arrGames as $strGameId ) {
          if( $strGameId === $strId ) continue;
          array_push( $arrGamesNew, $strGameId );
        }

        $objPlayer->set( 'games', $arrGamesNew );
      }
    }

    $this->deleteDirectory( __DIR__ . '/../files/game/' . $strId . '/' );
    $this->deleteObject();

    return $objRequestObject;
  }

/**
 * This static Method save all Game Data for a new Game in a encrypted JSON File.
 *
 * @access     public
 * @since      2026-06-05
 * @version    0.1.0
 *
 * @param      object   $objRequestObject    The Ajax Request Object
 * @return     object   $objRequestObject    The Ajax Request Object
 *
 * @example    $objRequestObject = Game::saveNewGame( $objRequestObject );
 *
*/
  public static function saveNewGame( object $objRequestObject ) : object {
    $arrGameRoles                             = Game::GAMEROLES;
    $arrStatisticProperties                   = Gameplay::STATISTICPROPERTIES;
    $strGameId                                = uniqid( 'game_', true );
    $objGame                                  = new Game( $strGameId );

    $objRequestObject->redirect               = 'index.php?view=player';
    $strGameplayPath                          = __DIR__ . '/../files/game/' . $strGameId . '/';
    $objGameplay                              = new stdClass();
    $objGameplay->player                      = [];
    $objGameplay->hunter                      = [];
    $objGameplay->management                  = [];
    $objGameplay->speedHunts                  = [];
    $objGameplay->captured                    = [];
    $objGameplay->name                        = $objRequestObject->name;
    $objGameplay->title                       = $objRequestObject->title;
    $objGameplay->description                 = $objRequestObject->description;
    $objGameplay->start                       = $objRequestObject->start;
    $objGameplay->duration                    = $objRequestObject->duration;
    $objGameplay->pingInterval                = $objRequestObject->pingInterval;
    $objGameplay->speedPingInterval           = $objRequestObject->speedPingInterval;
    $objGameplay->speedPingCount              = $objRequestObject->speedPingCount;
    $objGameplay->startPosition               = $objRequestObject->startPosition;
    $objGameplay->exitPosition                = $objRequestObject->exitPosition;
    $objGameplay->showPlayer                  = $objRequestObject->showPlayer;
    $objGameplay->showNames                   = $objRequestObject->showNames;
    $objGameplay->trackInterval               = $objRequestObject->trackInterval;
    $objGameplay->playingFieldCenterPosition  = $objRequestObject->playingFieldCenterPosition;
    $objGameplay->sanctionForVehicleUse       = $objRequestObject->sanctionForVehicleUse;
    $objGameplay->playingFieldSize            = $objRequestObject->playingFieldSize;
    $objGameplay->minimumDistancePlayer       = $objRequestObject->minimumDistancePlayer;
    $objGameplay->violationsOfTheRules        = new stdClass();
    $objGameplay->isTransfered                = false;
    $objGameplay->owner                       = $objRequestObject->owner;

    $objGameplay->creationDate                = date( "Y-m-d H:i:s" );

    mkdir( $strGameplayPath );

    foreach( $arrGameRoles as $strRoleId => $strRoleName ) {
      $arrPlayer = $objRequestObject->$strRoleId;

      foreach( $arrPlayer as $strPlayerId ) {
        $objPlayer           = new Player( $strPlayerId );
        $arrGames            = $objPlayer->get( 'games' );
        $arrGames            = isset( $arrGames ) ? $arrGames : [];
        $objSerializedPlayer = Game::removePlayerProperties( $objPlayer );
        $strProfileImage     = $objPlayer->get( 'image' );

        if( isset( $strProfileImage ) && $strProfileImage != '' ) {
          $strProfileImage     = explode( '?', $strProfileImage )[ 0 ];
          $strProfileImagePath = __DIR__ . '/../files/player/' . $strPlayerId . '/' . $strProfileImage;
          if( file_exists( $strProfileImagePath ) ) {
            copy( $strProfileImagePath, $strGameplayPath . 'profile_image_' . $strPlayerId . '_' . $strProfileImage );
          }
        }

        $objPlayer->set( 'id', $strPlayerId );

        unset( $objSerializedPlayer->games );
        unset( $objSerializedPlayer->password );

        foreach( $arrStatisticProperties as $strStatisticProperty ) {
          unset( $objSerializedPlayer->$strStatisticProperty );
        }

        array_push( $objGameplay->$strRoleId, $objSerializedPlayer );

        if( ! in_array( $strGameId, $arrGames ) ) {
          array_push( $arrGames, $strGameId );
          $objPlayer->set( 'games', $arrGames );
        }
      }
    }

    $objRequestObject->avatar  = 'avatar.png';


    copy( __DIR__ . '/../images/favicons/friendshunt-app-icon-180x180.png', $strGameplayPath . 'avatar.png' );
    BaseObject::saveFileEnCrypted( $strGameplayPath . 'gameplay.json', $objGameplay );

    $objGame->set( 'avatar', 'avatar.png' );
    $objGame->set( $objRequestObject );
    $objGame->set( 'id', $strGameId );

    return $objRequestObject;
  }

/**
 * This static Method converts a Player Object in a serialized Object and removes all not used Properties in the Game from the Object.
 *
 * @access     public
 * @since      2026-06-05
 * @version    0.1.0
 *
 * @param      Player   $objPlayer    The Player Object
 * @return     object   $objPlayer    The cleaned, serialized Player Object
 *
 * @example    $objPlayer = Game::removePlayerProperties( $objPlayer );
 *
*/
  public static function removePlayerProperties( Player $objPlayer ) : object {
    $objPlayer = $objPlayer->serializeObject();

    unset( $objPlayer->games );
    unset( $objPlayer->password );

    foreach( Gameplay::STATISTICPROPERTIES as $strStatisticProperty ) {
      unset( $objPlayer->$strStatisticProperty );
    }

    return $objPlayer;
  }

/**
 * This static Method add a Player to a new Game and set the Template Variables for the Template Engine.
 *
 * @access     public
 * @since      2026-06-05
 * @version    0.1.0
 *
 * @param      object   $objRequestObject    The Ajax Request Object
 * @return     object   $objRequestObject    The Ajax Request Object
 *
 * @example    $objRequestObject = Game::addPlayerToGame( $objRequestObject );
 *
*/
  public static function addPlayerToGame( object $objRequestObject ) : object {
    $objAllPlayer  = BaseObject::getObjects( 'Player' );
    $strPlayerId   = $objRequestObject->player;
    $objPlayer     = isset( $objAllPlayer ) && isset( $strPlayerId ) && $strPlayerId != '' && isset( $objAllPlayer->$strPlayerId ) ? $objAllPlayer->$strPlayerId : null;

    if( ! isset( $objPlayer ) ) {
      $objRequestObject->formErrors = [];
      array_push( $objRequestObject->formErrors, Presentation::newFormError( '#search-player-field', 'Spieler nicht gefunden' ) );

      return $objRequestObject;
    }

    $objRequestObject->playerObject = $objPlayer;

    return $objRequestObject;
  }

/**
 * This static Method add a Hunter to a new Game and set the Template Variables for the Template Engine.
 *
 * @access     public
 * @since      2026-06-05
 * @version    0.1.0
 *
 * @param      object   $objRequestObject    The Ajax Request Object
 * @return     object   $objRequestObject    The Ajax Request Object
 *
 * @example    $objRequestObject = Game::addHunterToGame( $objRequestObject );
 *
*/
  public static function addHunterToGame( object $objRequestObject ) : object {
    $objAllPlayer  = BaseObject::getObjects( 'Player' );
    $strPlayerId   = $objRequestObject->player;
    $objPlayer     = isset( $objAllPlayer ) && isset( $strPlayerId ) && $strPlayerId != '' && isset( $objAllPlayer->$strPlayerId ) ? $objAllPlayer->$strPlayerId : null;

    if( ! isset( $objPlayer ) ) {
      $objRequestObject->formErrors = [];
      array_push( $objRequestObject->formErrors, Presentation::newFormError( '#search-hunter-field', 'Jäger nicht gefunden' ) );

      return $objRequestObject;
    }

    $objRequestObject->playerObject = $objPlayer;

    return $objRequestObject;
  }

/**
 * This static Method add a Management to a new Game and set the Template Variables for the Template Engine.
 *
 * @access     public
 * @since      2026-06-05
 * @version    0.1.0
 *
 * @param      object   $objRequestObject    The Ajax Request Object
 * @return     object   $objRequestObject    The Ajax Request Object
 *
 * @example    $objRequestObject = Game::addManagementToGame( $objRequestObject );
 *
*/
  public static function addManagementToGame( object $objRequestObject ) : object {
    $objAllPlayer  = BaseObject::getObjects( 'Player' );
    $strPlayerId   = $objRequestObject->player;
    $objPlayer     = isset( $objAllPlayer ) && isset( $strPlayerId ) && $strPlayerId != '' && isset( $objAllPlayer->$strPlayerId ) ? $objAllPlayer->$strPlayerId : null;

    if( ! isset( $objPlayer ) ) {
      $objRequestObject->formErrors = [];
      array_push( $objRequestObject->formErrors, Presentation::newFormError( '#search-management-field', 'Management nicht gefunden' ) );

      return $objRequestObject;
    }

    $objRequestObject->playerObject = $objPlayer;

    return $objRequestObject;
  }

/**
 * This static Method set the Game Settings and the Player Id as Template Variables for the Template Engine.
 *
 * @access     public
 * @since      2026-06-05
 * @version    0.1.0
 *
 * @param      object   $objController    The Controller Object
 * @return     object   $objController    The Controller Object
 *
 * @example    $objController = Game::setPlayerIdToTemplate( $objController );
 *
*/
  public static function setPlayerIdToTemplate( Controller $objController ) : object {
    $strPlayerId = Player::getPlayerIdFromCookie();
    $strGameId   = isset( $_GET[ 'id' ] ) ? $_GET[ 'id' ] : null;

    if( isset( $strGameId ) ) {
      $objPlayer            = new Player( $strPlayerId );
      $objGameplay          = new Gameplay( $strGameId, $objPlayer );
      $objGameSettings      = $objGameplay->getGameSettings();
      $objGameSettings->end = $objGameSettings->start + ( $objGameSettings->duration * 60 * 60 );

      $objController->getPresentationObject()->assignTemplateVar( 'gameSettings', 'Gameplay', null, json_encode( $objGameSettings ) );
    }

    $objController->getPresentationObject()->assignTemplateVar( 'playerId', 'Game', null, $strPlayerId );

    return $objController;
  }

/**
 * This Method is the Game Archive Method and moved all Files in the Archive Folder.
 *
 * @access     public
 * @since      2026-06-05
 * @version    0.1.0
 *
 * @param      object   $objRequestObject    The Ajax Request Object
 * @return     object   $objRequestObject    The Ajax Request Object
 *
 * @example    $objRequestObject = $objGame->archiveGame( $objRequestObject );
 *
*/
  public function archiveGame( object $objRequestObject ) : object {
    $strClass         = $objRequestObject->class;
    $strId            = $objRequestObject->id;
    $strPlayerId      = $objRequestObject->playerId;
    $objGame          = new $strClass( $strId );
    $objPlayer        = new Player( $strPlayerId );
    $strPlayerRole    = $objPlayer->get( 'role' );
    $strGameOwner     = $objGame->get( 'owner' );
    $strPathSource    = __DIR__ . '/../files/game/' . $strId . '/';
    $strPathArchive   = __DIR__ . '/../files/game/archive/';
    $strPathTarget    = __DIR__ . '/../files/game/archive/' . $strId . '/';
    $arrSourceFiles   = scandir( $strPathSource );

    if( $strPlayerRole != 'administrator' ) {
      if( ! isset( $strGameOwner ) || $strGameOwner != $strPlayerId ) {
        $objError           = new stdClass();
        $objError->message  = 'Zugriff verweigert';

        array_push( $objRequestObject->controller->response->errors, $objError );

        return $objRequestObject;
      }
    }

    if( ! file_exists( $strPathArchive ) ) mkdir( $strPathArchive );
    if( ! file_exists( $strPathTarget ) ) mkdir( $strPathTarget );

    BaseObject::saveFileEnCrypted( $strPathTarget . 'dataGame.json', $objGame->serializeObject() );

    foreach( $arrSourceFiles as $strFile ) {
      if( $strFile == '.' || $strFile == '..' ) continue;

      $strSourceFile = $strPathSource . $strFile;
      $strTargetFile = $strPathTarget . $strFile;

      if( is_file( $strSourceFile ) ) copy( $strSourceFile, $strTargetFile );
    }

    $this->deleteGame( $objRequestObject );

    return $objRequestObject;
  }

/**
 * This Method controls the Gameplay and redirects the Requests to the Gameplay Object.
 *
 * @access     public
 * @since      2026-06-05
 * @version    0.1.0
 *
 * @param      object   $objRequestObject    The Ajax Request Object
 * @return     object   $objRequestObject    The Ajax Request Object
 *
 * @example    $objRequestObject = $objGame->gameplay( $objRequestObject );
 *
*/
  public function gameplay( object $objRequestObject ) : object {
    $objPermissions   = BaseObject::loadFileDeCrypted( BaseObject::FILEPATHDATA . 'dataPermissions.json' );
    $strPlayerId      = isset( $objRequestObject->playerId ) ? $objRequestObject->playerId : Player::getPlayerIdFromCookie();
    $objPlayer        = new Player( $strPlayerId );
    $strRole          = $objPlayer->get( 'role' );
    $strMethod        = $objRequestObject->gameplayMethod;

    if( ! in_array( 'Gameplay::' . $strMethod, $objPermissions->$strRole->methods ) ) {
      $objRequestObject->formErrors = [];
      array_push( $objRequestObject->formErrors, Presentation::newFormError( '#gameplayMethod', 'Zugriff verweigert' ) );

      return $objRequestObject;
    }

    $objGameplay      = new Gameplay( $this->id, $objPlayer );
    $objRequestObject = $objGameplay->$strMethod( $objRequestObject );

    return $objRequestObject;
  }
}

// EOF