<?php

declare( strict_types = 1 );

include_once ( __DIR__ . '/../classes/baseObject.php' );
include_once ( __DIR__ . '/../classes/gameplay.php' );

/**
 * Game Class for the Friendshunt App.
 *
 * This Class represents the Game Class for the Friendshunt App with his Properties and Methods.
 * The Game Class controls the Game Settings.
 *
 * @category    class
 * @package     Application
 * @subpackage  Friendshunt
 * @access      public
 * @author      Markus Götz <info@septem-sensu.de>
 * @copyright   2026 Markus Götz <info@septem-sensu.de>
 * @since       2026-06-05
 * @version     0.1.0
 * @example     $objGame = new Game( $strGameId );
 *
*/
class Game extends BaseObject {

/* Class Properties */
  protected string $name;
  protected string $title;
  protected string $description;
  protected array  $player;
  protected array  $hunter;
  protected array  $management;
  protected string $start;
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
  protected int    $hunterClosingTime;
  protected string $showNames;

/**
 * This static Method set a uploaded Game Image to the Game Object.
 *
 * @access     public
 * @since      2026-06-05
 * @version    0.1.0
 * @param      string   $strFileName    The File Name of the Image
 * @return     void
 * @example    Game::addGameImage( $strFileName );
 * @example    $this::addGameImage( $strFileName );
 *
*/
  public static function addGameImage( string $strFileName ) : void {
    $strClass        = isset( $_POST[ 'class' ] ) ? $_POST[ 'class' ] : null;
    $strId           = isset( $_POST[ 'id' ] ) ? $_POST[ 'id' ] : null;

    $objGame = new $strClass( $strId );
    $arrImmages = $objGame->get( 'images' );

    array_push( $arrImmages, $strFileName );
    $objGame->set( 'images', $arrImmages );
    $objGame->set( 'tmpImageAdd', '' );

    return;
  }

/**
 * This static Method set a uploaded Game Avatar to the Game Object and renamed the Image.
 *
 * @access     public
 * @since      2026-06-05
 * @version    0.1.0
 * @param      string   $strFileName    The Avatar File Name of the Image
 * @return     void
 * @example    Game::avatarFileUploaded( $strFileName );
 * @example    $this::avatarFileUploaded( $strFileName );
 *
*/
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
    $objPlayer->set( 'avatar', 'avatar.' . strtolower( $arrPathInfo[ 'extension' ] ) . '?v=' . time() );

    return;
  }

/**
 * This Method starts the Game with a redirect to the Game.
 *
 * @access     public
 * @since      2026-06-05
 * @version    0.1.0
 * @param      object   $objRequestObject    The Ajax Request Object
 * @return     object   $objRequestObject    The Ajax Request Object
 * @example    objRequestObject = $this->startGame( $objRequestObject );
 * @example    objRequestObject = $objGame->startGame( $objRequestObject );
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
 * @param      object   $objRequestObject    The Ajax Request Object
 * @return     object   $objRequestObject    The Ajax Request Object
 * @example    objRequestObject = $this->addGamePlayDataToGame( $objRequestObject );
 * @example    objRequestObject = $objGame->addGamePlayDataToGame( $objRequestObject );
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
 * @param      object   $objRequestObject    The Ajax Request Object
 * @return     object   $objRequestObject    The Ajax Request Object
 * @example    objRequestObject = $this->deleteGame( $objRequestObject );
 * @example    objRequestObject = $objGame->deleteGame( $objRequestObject );
 *
*/
  public function deleteGame( object $objRequestObject ) : object {
    $strClass         = $objRequestObject->class;
    $strId            = $objRequestObject->id;
    $objGame          = new $strClass( $strId );
    $arrPlayerIds     = $objGame->get( 'player' );
    $arrHunterIds     = $objGame->get( 'hunter' );
    $arrManagementIds = $objGame->get( 'management' );

    for( $i = 0; $i < count( $arrPlayerIds ); $i++ ) {
      $objPlayer   = new Player( $arrPlayerIds[ $i ] );
      $arrGames    = $objPlayer->get( 'games' );
      $arrGames    = isset( $arrGames ) ? $arrGames : [];
      $arrGamesNew = [];

      for( $j = 0; $j < count( $arrGames ); $j++ ) {
        if( $arrGames[ $j ] == $strId ) continue;
        array_push( $arrGamesNew, $arrGames[ $j ] );
      }

      $objPlayer->set( 'games', $arrGamesNew );
    }

    for( $i = 0; $i < count( $arrHunterIds ); $i++ ) {
      $objPlayer   = new Player( $arrHunterIds[ $i ] );
      $arrGames    = $objPlayer->get( 'games' );
      $arrGames    = isset( $arrGames ) ? $arrGames : [];
      $arrGamesNew = [];

      for( $j = 0; $j < count( $arrGames ); $j++ ) {
        if( $arrGames[ $j ] == $strId ) continue;
        array_push( $arrGamesNew, $arrGames[ $j ] );
      }

      $objPlayer->set( 'games', $arrGamesNew );
    }

    for( $i = 0; $i < count( $arrManagementIds ); $i++ ) {
      $objPlayer   = new Player( $arrManagementIds[ $i ] );
      $arrGames    = $objPlayer->get( 'games' );
      $arrGames    = isset( $arrGames ) ? $arrGames : [];
      $arrGamesNew = [];

      for( $j = 0; $j < count( $arrGames ); $j++ ) {
        if( $arrGames[ $j ] == $strId ) continue;
        array_push( $arrGamesNew, $arrGames[ $j ] );
      }

      $objPlayer->set( 'games', $arrGamesNew );
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
 * @param      object   $objRequestObject    The Ajax Request Object
 * @return     object   $objRequestObject    The Ajax Request Object
 * @example    objRequestObject = Game::saveNewGame( $objRequestObject );
 * @example    objRequestObject = $this::saveNewGame( $objRequestObject );
 *
*/
  public static function saveNewGame( object $objRequestObject ) : object {
    $strGameId                      = uniqid( 'game_', true );
    $objGame                        = new Game( $strGameId );
    $arrPlayer                      = $objRequestObject->player;
    $arrHunter                      = $objRequestObject->hunter;
    $arrManagement                  = $objRequestObject->management;

    $objRequestObject->redirect     = 'index.php?view=player';
    $strGameplayPath                = __DIR__ . '/../files/game/' . $strGameId . '/';
    $objGameplay                    = new StdClass();
    $objGameplay->player            = [];
    $objGameplay->hunter            = [];
    $objGameplay->management        = [];
    $objGameplay->name              = $objRequestObject->name;
    $objGameplay->title             = $objRequestObject->title;
    $objGameplay->description       = $objRequestObject->description;
    $objGameplay->start             = $objRequestObject->start;
    $objGameplay->duration          = $objRequestObject->duration;
    $objGameplay->pingInterval      = $objRequestObject->pingInterval;
    $objGameplay->speedPingInterval = $objRequestObject->speedPingInterval;
    $objGameplay->speedPingCount    = $objRequestObject->speedPingCount;
    $objGameplay->startPosition     = $objRequestObject->startPosition;
    $objGameplay->exitPosition      = $objRequestObject->exitPosition;
    $objGameplay->showPlayer        = $objRequestObject->showPlayer;
    $objGameplay->showNames         = $objRequestObject->showNames;
    $objGameplay->trackInterval     = $objRequestObject->trackInterval;
    $objGameplay->hunterClosingTime = $objRequestObject->hunterClosingTime;
    $objGameplay->creationDate      = date( "Y-m-d H:i:s" );

    for( $i = 0; $i < count( $arrPlayer ); $i++ ) {
      $objPlayer           = new Player( $arrPlayer[ $i ] );
      $arrGames            = $objPlayer->get( 'games' );
      $arrGames            = isset( $arrGames ) ? $arrGames : [];
      $objSerializedPlayer = $objPlayer->serializeObject();

      $objPlayer->set( 'id', $arrPlayer[ $i ] );

      unset( $objSerializedPlayer->games );
      unset( $objSerializedPlayer->password );

      array_push( $objGameplay->player, $objSerializedPlayer );

      if( ! in_array( $strGameId, $arrGames ) ) {
        array_push( $arrGames, $strGameId );
        $objPlayer->set( 'games', $arrGames );
      }
    }

    for( $i = 0; $i < count( $arrHunter ); $i++ ) {
      $objPlayer           = new Player( $arrHunter[ $i ] );
      $arrGames            = $objPlayer->get( 'games' );
      $arrGames            = isset( $arrGames ) ? $arrGames : [];
      $objSerializedPlayer = $objPlayer->serializeObject();

      $objPlayer->set( 'id', $arrHunter[ $i ] );

      unset( $objSerializedPlayer->games );
      unset( $objSerializedPlayer->password );

      array_push( $objGameplay->hunter, $objSerializedPlayer );

      if( ! in_array( $strGameId, $arrGames ) ) {
        array_push( $arrGames, $strGameId );
        $objPlayer->set( 'games', $arrGames );
      }
    }

    for( $i = 0; $i < count( $arrManagement ); $i++ ) {
      $objPlayer           = new Player( $arrManagement[ $i ] );
      $arrGames            = $objPlayer->get( 'games' );
      $arrGames            = isset( $arrGames ) ? $arrGames : [];
      $objSerializedPlayer = $objPlayer->serializeObject();

      $objPlayer->set( 'id', $arrManagement[ $i ] );

      unset( $objSerializedPlayer->games );
      unset( $objSerializedPlayer->password );

      array_push( $objGameplay->management, $objSerializedPlayer );

      if( ! in_array( $strGameId, $arrGames ) ) {
        array_push( $arrGames, $strGameId );
        $objPlayer->set( 'games', $arrGames );
      }
    }

    $objRequestObject->avatar  = 'avatar.png';

    mkdir( $strGameplayPath );
    copy( __DIR__ . '/../images/apple-touch-icon.png', $strGameplayPath . 'avatar.png' );
    BaseObject::saveFileEnCrypted( $strGameplayPath . 'gameplay.json', $objGameplay );

    $objGame->set( 'avatar', 'avatar.png' );
    $objGame->set( $objRequestObject );
    $objGame->set( 'id', $strGameId );

    return $objRequestObject;
  }

/**
 * This static Method add a Player to a new Game and set the Template Variables for the Template Engine.
 *
 * @access     public
 * @since      2026-06-05
 * @version    0.1.0
 * @param      object   $objRequestObject    The Ajax Request Object
 * @return     object   $objRequestObject    The Ajax Request Object
 * @example    objRequestObject = Game::addPlayerToGame( $objRequestObject );
 * @example    objRequestObject = $this::addPlayerToGame( $objRequestObject );
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
 * @param      object   $objRequestObject    The Ajax Request Object
 * @return     object   $objRequestObject    The Ajax Request Object
 * @example    objRequestObject = Game::addHunterToGame( $objRequestObject );
 * @example    objRequestObject = $this::addHunterToGame( $objRequestObject );
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
 * @param      object   $objRequestObject    The Ajax Request Object
 * @return     object   $objRequestObject    The Ajax Request Object
 * @example    objRequestObject = Game::addManagementToGame( $objRequestObject );
 * @example    objRequestObject = $this::addManagementToGame( $objRequestObject );
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
 * @param      object   $objController    The Controler Object
 * @return     object   $objController    The Controler Object
 * @example    objController = Game::setPlayerIdToTemplate( $objController );
 * @example    objController = $this::setPlayerIdToTemplate( $objController );
 *
*/
  public static function setPlayerIdToTemplate( Controller $objController ) : object {
    $strPlayerId = Player::getPlayerIdFromCookie();
    $strGameId   = isset( $_GET[ 'id' ] ) ? $_GET[ 'id' ] : null;

    if( isset( $strGameId ) ) {
      $objPlayer        = new Player( $strPlayerId );
      $objGameplay      = new Gameplay( $strGameId, $objPlayer );
      $objGameSettings  = $objGameplay->getGameSettings();

      $objController->getPresentationObject()->assignTemplateVar( 'gameSettings', 'Gameplay', null, json_encode( $objGameSettings ) );;
    }

    $objController->getPresentationObject()->assignTemplateVar( 'playerId', 'Game', null, $strPlayerId );

    return $objController;
  }

/**
 * This Method is the Game Archive Methode and moved all Files in the Archive Folder.
 *
 * @access     public
 * @since      2026-06-05
 * @version    0.1.0
 * @param      object   $objRequestObject    The Ajax Request Object
 * @return     object   $objRequestObject    The Ajax Request Object
 * @example    objRequestObject = $this->archiveGame( $objRequestObject );
 * @example    objRequestObject = $objGame->archiveGame( $objRequestObject );
 *
*/
  public function archiveGame( object $objRequestObject ) : object {
    $strClass         = $objRequestObject->class;
    $strId            = $objRequestObject->id;
    $objGame          = new $strClass( $strId );
    $strPathSource    = __DIR__ . '/../files/game/' . $strId . '/';
    $strPathArchive   = __DIR__ . '/../files/game/archive/';
    $strPathTarget    = __DIR__ . '/../files/game/archive/' . $strId . '/';
    $arrSourceFiles   = scandir( $strPathSource );

    if( ! file_exists( $strPathArchive ) ) mkdir( $strPathArchive );
    if( ! file_exists( $strPathTarget ) ) mkdir( $strPathTarget );

    $this->saveFileEnCrypted( $strPathTarget . 'dataGame.json', $objGame );

    foreach ( $arrSourceFiles as $strFile ) {
      if ( $strFile == '.' || $strFile == '..' ) continue;

      $strSourceFile = $strPathSource . $strFile;
      $strTargetFile = $strPathTarget . $strFile;

      if ( is_file( $strSourceFile ) ) copy( $strSourceFile, $strTargetFile );
    }

    $this->deleteGame( $objRequestObject );

    return $objRequestObject;
  }

/**
 * This Method controlls the Gameplay and redirect the Requests to the Gameplay Object.
 *
 * @access     public
 * @since      2026-06-05
 * @version    0.1.0
 * @param      object   $objRequestObject    The Ajax Request Object
 * @return     object   $objRequestObject    The Ajax Request Object
 * @example    objRequestObject = $this->gameplay( $objRequestObject );
 * @example    objRequestObject = $objGame->gameplay( $objRequestObject );
 *
*/
  public function gameplay( object $objRequestObject ) : object {
    $objPlayer        = new Player( $objRequestObject->playerId );
    $objGameplay      = new Gameplay( $this->id, $objPlayer );
    $strMethode       = $objRequestObject->gameplayMethode;
    $objRequestObject = $objGameplay->$strMethode( $objRequestObject );

    return $objRequestObject;
  }
}

// EOF