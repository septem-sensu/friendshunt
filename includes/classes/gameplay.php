<?php

declare( strict_types = 1 );

include_once ( __DIR__ . '/../classes/baseObject.php' );
include_once ( __DIR__ . '/../classes/game.php' );

class Gameplay extends Game {
  protected object $gameplayObject;
  protected string $gameplayPath;
  protected Player $currentPlayer;
  protected string $currentPlayerGameRole;
  protected object $currentPlayerTracking;
  protected object $gameSettings;

  public function __construct( string $strObjectId, player $objCurrentPlayer ) {
    $this->id            = $strObjectId;
    $this->currentPlayer = $objCurrentPlayer;

    $this->init();

    return;
  }

  private function init() : void {
    $this->gameplayPath   = __DIR__ . '/../files/game/' . $this->id . '/';
    $this->gameplayObject = BaseObject::loadFileDeCrypted( $this->gameplayPath . 'gameplay.json' );
    $this->fields         = $this->loadFileDeCrypted( $this::FILEPATHJSON . 'fields/gameplay.json' );

    for( $i = 0; $i < count( $this->gameplayObject->player ); $i++ ) {
      if( $this->gameplayObject->player[ $i ]->id != $this->currentPlayer->id ) continue;
      $this->currentPlayerGameRole = 'player';
      break;
    }

    if( ! isset( $this->currentPlayerGameRole ) ) {
      for( $i = 0; $i < count( $this->gameplayObject->hunter ); $i++ ) {
        if( $this->gameplayObject->hunter[ $i ]->id != $this->currentPlayer->id ) continue;
        $this->currentPlayerGameRole = 'hunter';
        break;
      }
    }

    if( ! isset( $this->currentPlayerGameRole ) ) $this->currentPlayerGameRole = 'management';

    if( ! file_exists( $this->gameplayPath . 'tracking_' . $this->currentPlayer->id() . '.json' ) ) {
      $objTracking           = new stdClass();
      $objTracking->tracking = [];

      $this->saveFileEncrypted( $this->gameplayPath . 'tracking_' . $this->currentPlayer->id() . '.json', $objTracking );
    }

    $this->currentPlayerTracking = $this->loadFileDeCrypted( $this->gameplayPath . 'tracking_' . $this->currentPlayer->id() . '.json' );

    return;
  }

  private function addTracking( float $floatLat, float $floatLng, int $intPrecision ) : void {
    $objTracking            = new stdClass();
    $objTracking->lat       = $floatLat;
    $objTracking->lng       = $floatLng;
    $objTracking->precision = $intPrecision;
    $objTracking->timestamp = time();

    array_push( $this->currentPlayerTracking->tracking, $objTracking );

    $this->saveFileEncrypted( $this->gameplayPath . 'tracking_' . $this->currentPlayer->id() . '.json', $this->currentPlayerTracking );

    return;
  }

  public function getGameSettings() : object {
    $objGameConfiguration = clone $this->gameplayObject;

    unset( $objGameConfiguration->player );
    unset( $objGameConfiguration->hunter );
    unset( $objGameConfiguration->management );

    return $objGameConfiguration;
  }

  private function getAllPlayerPositions() : object {
    $objPositions             = new stdClass();
    $objPositions->player     = [];
    $objPositions->hunter     = [];
    $objPositions->management = [];
    $arrPlayer                = $this->gameplayObject->player;
    $arrHunter                = $this->gameplayObject->hunter;
    $arrManagement            = $this->gameplayObject->management;

    for( $i = 0; $i < count( $arrPlayer ); $i++ ) {
      $objPlayer = new Player( $arrPlayer[ $i ]->id );
      array_push( $objPositions->player, $this->getPlayerPosition( $objPlayer, 3 ) );
    }

    for( $i = 0; $i < count( $arrHunter ); $i++ ) {
      $objPlayer = new Player( $arrHunter[ $i ]->id );
      array_push( $objPositions->hunter, $this->getPlayerPosition( $objPlayer, 3 ) );
    }

    for( $i = 0; $i < count( $arrManagement ); $i++ ) {
      $objPlayer = new Player( $arrManagement[ $i ]->id );
      array_push( $objPositions->management, $this->getPlayerPosition( $objPlayer, 3 ) );
    }

    return $objPositions;
  }

  private function getPlayerPosition( Player $objPlayer, int $intCount ) : object {
    $objPositions            = new stdClass();
    $objPositions->name      = $objPlayer->get( 'name' );
    $objPositions->id        = $objPlayer->id();
    $objPositions->timestamp = time();
    $objTracking             = file_exists( $this->gameplayPath . 'tracking_' . $objPlayer->id() . '.json' ) ? $this->loadFileDeCrypted( $this->gameplayPath . 'tracking_' . $objPlayer->id() . '.json' ) : new stdClass();
    $arrTracking             = isset( $objTracking->tracking ) ? array_slice( $objTracking->tracking, -3 ) : [];
    $objPositions->position  = $arrTracking ;

    return $objPositions;
  }

  private function saveGameplay() : void {
    BaseObject::saveFileEncrypted( $this->gameplayPath . 'gameplay.json', $this->gameplayObject );

    return;
  }

  private function getGameplayNextSilentHunt( object $objState ) : object {
    $intSilentHuntInterval = $this->gameSettings->pingInterval * 60;
    $intNowTimestamp       = time();

    if( $objState->timestampStart > $intNowTimestamp ) {
      $objState->nextSilentHunt        = Presentation::timestampToString( $objState->timestampStart + $intSilentHuntInterval );
      $objState->nextSilentHuntMessage = 'Der nächste Silent Hunt ist am ' . $objState->nextSilentHunt . '.';
    } else if( $objState->timestampEnd < $intNowTimestamp ) {
      $objState->nextSilentHunt        = '';
      $objState->nextSilentHuntMessage = '';
    } else {
      $intPastTimeSeconds    = $intNowTimestamp - $objState->timestampStart;
      $intRestTimeSeconds    = $intPastTimeSeconds % $intSilentHuntInterval;
      $intNextTimeSeconds    = $intSilentHuntInterval - $intRestTimeSeconds;
      $intNextSilentHunt     = $intNowTimestamp + $intNextTimeSeconds;

      if( $intNextSilentHunt > $objState->timestampEnd ) {
        $objState->nextSilentHunt        = '';
        $objState->nextSilentHuntMessage = 'Es gibt keinen Silent Hunt vor Spielende mehr.';
      } else {
        $objState->nextSilentHunt        = Presentation::timestampToString( $intNextSilentHunt );
        $objState->nextSilentHuntMessage = 'Der nächste Silent Hunt ist am ' . $objState->nextSilentHunt . '.';
      }
    }

    return $objState;
  }

  private function getGameplayState( object $objState ) : object {
    $intStartTimestamp        = Presentation::stringToTimestamp( $this->gameSettings->start );
    $intDurationSec           = $this->gameSettings->duration * 60 * 60;
    $intEndTimestamp          = $intStartTimestamp + $intDurationSec;
    $intNowTimestamp          = time();
    $objState->timestampStart = $intStartTimestamp;
    $objState->timestampEnd   = $intEndTimestamp;

    if( $intStartTimestamp > $intNowTimestamp ) {
      $objState->gameState        = 'offline';
      $objState->gameStateMessage = 'Das Spiel startet am ' . Presentation::timestampToString( $intStartTimestamp );
    } else if( $intEndTimestamp < $intNowTimestamp ) {
      $objState->gameState        = 'offline';
      $objState->gameStateMessage = 'Das Spiel ist schon beendet.';
    } else {
      $objState->gameState        = 'online';
      $objState->gameStateMessage = 'Das Spiel läuft gerade.';
    }

    return $objState;
  }

  private function getGameplaySpeedHunt( object $objState ) : object {
    $objState->speedHuntState = new stdClass();

    if( isset( $this->gameplayObject->speedHunt ) ) {
      $objState->speedHuntState->speedHuntCount    = count(  $this->gameplayObject->speedHunt->timestamps );
      $objState->speedHuntState->speedHuntCountMax = $this->gameplayObject->speedPingCount;
      $objState->speedHuntState->playerId          = $this->gameplayObject->speedHunt->playerId;
      $objState->speedHuntState->playerName        = $this->gameplayObject->speedHunt->playerName;
      $objState->speedHuntState->message           = 'Es läuft ein Speedhunt.';
      $objState->speedHuntState->state             = 'running';

      return $objState;
    }

    $intLastSpeedhunt = isset( $this->gameplayObject->lastSpeedHunt ) ? $this->gameplayObject->lastSpeedHunt : Presentation::stringToTimestamp( $this->gameplayObject->start );
    $intLastSpeedhunt = intval( $intLastSpeedhunt ) + ( intval( $this->gameplayObject->speedPingInterval ) * 60 );

    if( $intLastSpeedhunt < time() ) {
      $objState->speedHuntState->speedHuntCount    = -1;
      $objState->speedHuntState->speedHuntCountMax = -1;
      $objState->speedHuntState->message           = 'Der nächste Speedhunt ist am ' . Presentation::timestampToString( $intLastSpeedhunt )  . ' verfügbar.';
      $objState->speedHuntState->state             = 'not available';

      return $objState;
    }

    $objState->speedHuntState->speedHuntCount    = 0;
    $objState->speedHuntState->speedHuntCountMax = $this->gameplayObject->speedPingCount;
    $objState->speedHuntState->message           = 'Speedhunt ist verfügbar.';
    $objState->speedHuntState->state             = 'available';

    return $objState;
  }

  private function getGameplayStateLine( object $objState ) : object {



    return $objState;
  }

  public function speedHuntPing( object $objRequestObject ) : object {
    if( ! isset( $this->gameplayObject->speedHunts ) ) $this->gameplayObject->speedHunts = [];
    if( ! isset( $this->gameplayObject->speedHunt ) ) {
      $this->gameplayObject->speedHunt             = new stdClass();
      $this->gameplayObject->speedHunt->timestamps = [];
      $this->gameplayObject->speedHunt->playerId   = $objRequestObject->playerId;
      $this->gameplayObject->speedHunt->playerName = $objRequestObject->playerName;
    }

    array_push( $this->gameplayObject->speedHunt->timestamps, time() );

    $intSpeedHuntCount                    = count( $this->gameplayObject->speedHunt->timestamps );
    $objPlayer                            = new Player( $this->gameplayObject->speedHunt->playerId );
    $objRequestObject->positions          = $this->getPlayerPosition( $objPlayer, 1 );
    $objRequestObject->speedHuntCount     = $intSpeedHuntCount;
    $objRequestObject->speedHuntCountMax  = $this->gameplayObject->speedPingCount;

    if( $intSpeedHuntCount >= $this->gameplayObject->speedPingCount ) {
      $this->gameplayObject->lastSpeedHunt = time();

      array_push( $this->gameplayObject->speedHunts, $this->gameplayObject->speedHunt );
      unset( $this->gameplayObject->speedHunt );
    }

    $this->saveGameplay();

    return $objRequestObject;
  }

  public function track( object $objRequestObject ) : object {
    $this->addTracking( $objRequestObject->lat, $objRequestObject->lng, $objRequestObject->precision );

    $this->gameSettings          = $this->getGameSettings();
    $objState                    = new stdClass();
    $objState                    = $this->getGameplayState( $objState );
    $objState                    = $this->getGameplayNextSilentHunt( $objState );
    $objState                    = $this->getGameplaySpeedHunt( $objState );
    $objState                    = $this->getGameplayStateLine( $objState );

    $objRequestObject->positions = $this->getAllPlayerPositions();
    $objRequestObject->state     = $objState;
    $objRequestObject->settings  = $this->gameSettings;
    $objRequestObject->gameRole  = $this->currentPlayerGameRole;

    return $objRequestObject;
  }


}

// EOF
