<?php

declare( strict_types = 1 );

include_once ( __DIR__ . '/../classes/baseObject.php' );

class Game extends BaseObject {

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

  public function initGame( object | null $objController = null ) : void {
    if( isset( $_GET[ 'result' ] ) && $_GET[ 'result' ] == 'json' ) return;

    $objAvatars     = BaseObject::loadFileDeCrypted( __DIR__ . '/../json/data/dataAvatar.json' );
    $objConfig      = BaseObject::getConfig();
    $strModeratorId = $this->get( 'moderator' );
    $objModerrator  = $objAvatars->moderators->$strModeratorId;
    $arrPlayerIds   = $this->get( 'player' );
    $objPlayer      = new Player( Player::getPlayerIdFromCookie() );
    $strContent     = '<div>';
    $arrColors      = [ '#00ff00', '#ff0000', '#0000ff', '#ff00ff', '#00ffff', '#ffff00' ];

    $strContent .= $this->getPlayerAvatarTemplate(
      $strModeratorId,
      $objModerrator->name,
      'images/avatars/' . $objModerrator->gender  . '/' . $strModeratorId . '/avatar_bg.png?v=' . time(),
      'float-left mr-5 active game-border-green animation-reverse',
      array_shift( $arrColors ),
      true
    );

    $strContent .= $this->getPlayerAvatarTemplate(
      $objPlayer->id(),
      $objPlayer->get( 'name' ),
      'files/player/' . $objPlayer->id() . '/avatar_bg.png?v=' . time(),
      'player-self float-left active game-border-green',
      array_shift( $arrColors ),
      false,
      true
    );

    for( $i = 0; $i < count( $arrPlayerIds ); $i++ ) {
      $objTeammates       = new Player( $arrPlayerIds[ $i ] );
      $strAnimationClass  = $i % 2 == 0 ? '' : ' animation-reverse';

      if( $objTeammates->id() ==  $objPlayer->id() ) continue;
      $strContent .= $this->getPlayerAvatarTemplate(
        $objTeammates->id(),
        $objTeammates->get( 'name' ),
        'files/player/' . $objTeammates->id() . '/avatar_bg.png?v=' . time(),
        'float-right ml-5 active game-border-magenta' . $strAnimationClass,
        array_shift( $arrColors )
      );
    }

    $strContent   .= '</div>';

    $objController->getPresentationObject()->assignTemplateVar( 'gameAvatarContainerContent', 'default', null, $strContent );
    $objController->getPresentationObject()->assignTemplateVar( 'startRoomClass', 'default', null, $objConfig->cGameStartRoom );

    //$objGameplay = new Gameplay( $this->id() );

    //$objGameplay->play();

    return;
  }

  public function getPlayerAvatarTemplate( string $strPlayerId, string $strPlayerName, string $strPlayerAvatar, string $strClasses, string $strPlayerColor, bool $boolIsMod = false, bool $boolIsSelf = false ) : string {
    $strIsMod            = $boolIsMod ? 'true' : 'false';
    $strIsSelf           = $boolIsSelf ? '' : ' onclick="javascript: window[ appAlias ].methods.showPrivateMessages(this);"';
    $strTemplateContent  = '<div' . $strIsSelf . ' data-player-is-mod="' . $strIsMod . '" data-player-name="' . $strPlayerName . '" data-player-color="' . $strPlayerColor . '" data-player-id="' . $strPlayerId . '" class="game-player-avatar ' . $strClasses . '" id="game_player_' . Presentation::cleanId( $strPlayerId ) . '">';
    $strTemplateContent .= '<div class="hidden new-message-from">&#x2709;</div>';
    $strTemplateContent .= '<img class="game-player-image" src="' . $strPlayerAvatar . '" />';
    $strTemplateContent .= '<p><span class="game-avatar-state-led">&#11044;</span> ' . $strPlayerName . '</p>';
    $strTemplateContent .= '</div>';

    return $strTemplateContent;
  }

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

    //Presentation::logToFile( $strPath . $strFileName, null, true );

    return;
  }

  public function startGame( object $objRequestObject ) : object {
    $objRequestObject->redirect = "index.php?view=game&class=Game&id=" . $objRequestObject->id;

    return $objRequestObject;
  }

  public function addGamePlayDataToGame( object $objRequestObject ) : object {





    return $objRequestObject;
  }

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
    copy( __DIR__ . '/../images/no-profil-image.png', $strGameplayPath . 'avatar.png' );
    BaseObject::saveFileEnCrypted( $strGameplayPath . 'gameplay.json', $objGameplay );

    $objGame->set( 'avatar', 'avatar.png' );
    $objGame->set( $objRequestObject );
    $objGame->set( 'id', $strGameId );

    return $objRequestObject;
  }

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



}

// EOF