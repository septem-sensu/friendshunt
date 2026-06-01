<?php

declare( strict_types = 1 );

include_once ( __DIR__ . '/../classes/baseObject.php' );
include_once ( __DIR__ . '/../classes/gameplay.php' );

class Game extends BaseObject {

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

  public function startGame( object $objRequestObject ) : object {
    $objRequestObject->redirect = "index.php?view=game&class=Game&id=" . $objRequestObject->id;

    return $objRequestObject;
  }

  public function deleteGame( object $objRequestObject ) : object {
    $strClass     = $objRequestObject->class;
    $strId        = $objRequestObject->id;
    $objGame      = new $strClass( $strId );
    $arrPlayerIds = $objGame->get( 'player' );

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

    $this->deleteDirectory( __DIR__ . '/../files/game/' . $strId . '/' );
    $this->deleteObject();

    return $objRequestObject;
  }

  public static function saveNewGame( object $objRequestObject ) : object {
    $arrCalc                       = [ 'man' => 0, 'girl' => 0, 'domgirl' => 0, 'devgirl' => 0, 'domboy' => 0, 'devboy' => 0, 'level' => $objRequestObject->level ];
    $objAvatars                    = BaseObject::loadFileDeCrypted( __DIR__ . '/../json/data/dataAvatar.json' );
    $strGameId                     = uniqid( 'game_', true );
    $objGame                       = new Game( $strGameId );
    $arrPlayer                     = $objRequestObject->player;
    $strModeratorId                = $objRequestObject->moderator;
    $objRequestObject->redirect    = 'index.php?view=dashboard';
    $strGameplayPath               = __DIR__ . '/../files/game/' . $strGameId . '/';
    $objGameplay                   = new StdClass();
    $objGameplay->player           = [];
    $objGameplay->level            = $objRequestObject->level;
    $objGameplay->name             = $objRequestObject->name;
    $objGameplay->moderator        = $objAvatars->moderators->$strModeratorId;
    $objGameplay->creationDate     = date( "Y-m-d H:i:s" );
    $objGameplay->foundedRoomItems = new StdClass();

    for( $i = 0; $i < count( $arrPlayer ); $i++ ) {
      $objPlayer      = new Player( $arrPlayer[ $i ] );
      $arrGames       = $objPlayer->get( 'games' );
      $arrGames       = isset( $arrGames ) ? $arrGames : [];
      $strCharacter   = $objPlayer->get( 'character' );
      $objPlayer->set( 'id', $arrPlayer[ $i ] );

      array_push( $objGameplay->player, $objPlayer );

      if( $objPlayer->get( 'gender' ) == 'girl' ) {
        $arrCalc[ 'girl' ]    = $arrCalc[ 'girl' ] + 1;
        $arrCalc[ 'devgirl' ] = $strCharacter == 'more-devot' || $strCharacter == 'devot' ? $arrCalc[ 'devgirl' ] + 1 : $arrCalc[ 'devgirl' ];
        $arrCalc[ 'domgirl' ] = $strCharacter == 'more-dominant' || $strCharacter == 'dominant' ? $arrCalc[ 'domgirl' ] + 1 : $arrCalc[ 'domgirl' ];
      } else {
        $arrCalc[ 'boy' ]     = $arrCalc[ 'boy' ] + 1;
        $arrCalc[ 'devboy' ]  = $strCharacter == 'more-devot' || $strCharacter == 'devot' ? $arrCalc[ 'devboy' ] + 1 : $arrCalc[ 'devboy' ];
        $arrCalc[ 'domboy' ]  = $strCharacter == 'more-dominant' || $strCharacter == 'dominant' ? $arrCalc[ 'domboy' ] + 1 : $arrCalc[ 'domboy' ];
      }

      array_push( $arrGames, $strGameId );
      $objPlayer->set( 'games', $arrGames );
    }

    //$strAvatar                 = Game::getAvatar( $arrCalc );
    //$objRequestObject->avatar  = $strAvatar;


    mkdir( $strGameplayPath );
    //copy( __DIR__ . '/../images/avatars/game/' . $strAvatar, $strGameplayPath . $strAvatar );
    BaseObject::saveFileEnCrypted( $strGameplayPath . 'gameplay.json', $objGameplay );
    BaseObject::saveFileEnCrypted( $strGameplayPath . 'messages.json', new StdClass() );

    //$objGame->set( 'avatar', $strAvatar );
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







}

// EOF