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
  protected object $messages;

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

    if( ! file_exists( $this->gameplayPath . 'messages.json' ) ) {
      $objMessages = new stdClass();
      $objMessages->messages = [];

      $this->saveFileEncrypted( $this->gameplayPath . 'messages.json', $objMessages );
    }

    $this->messages              = $this->loadFileDeCrypted( $this->gameplayPath . 'messages.json' );
    $this->currentPlayerTracking = $this->loadFileDeCrypted( $this->gameplayPath . 'tracking_' . $this->currentPlayer->id() . '.json' );
    $this->gameSettings          = $this->getGameSettings();

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
    $objGameConfiguration                = clone $this->gameplayObject;
    $objGameConfiguration->playerIds     = [];
    $objGameConfiguration->hunterIds     = [];
    $objGameConfiguration->managementIds = [];

    unset( $objGameConfiguration->player );
    unset( $objGameConfiguration->hunter );
    unset( $objGameConfiguration->management );
    unset( $objGameConfiguration->silentHunt );
    unset( $objGameConfiguration->speedHunts );

    for( $i = 0; $i < count( $this->gameplayObject->player ); $i++ ) {
      array_push( $objGameConfiguration->playerIds, $this->gameplayObject->player[ $i ]->id );
    }

    for( $i = 0; $i < count( $this->gameplayObject->hunter ); $i++ ) {
      array_push( $objGameConfiguration->hunterIds, $this->gameplayObject->hunter[ $i ]->id );
    }

    for( $i = 0; $i < count( $this->gameplayObject->management ); $i++ ) {
      array_push( $objGameConfiguration->managementIds, $this->gameplayObject->management[ $i ]->id );
    }

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
      if( $this->currentPlayerGameRole == 'hunter' ) {
        $arrPlayerId = $arrPlayer[ $i ]->id;
        array_push( $objPositions->player, $this->gameplayObject->silentHunt->tracking->$arrPlayerId );
      } else {
        $objPlayer = new Player( $arrPlayer[ $i ]->id );
        array_push( $objPositions->player, $this->getPlayerPosition( $objPlayer, 1 ) );
      }
    }

    for( $i = 0; $i < count( $arrHunter ); $i++ ) {
      $objPlayer = new Player( $arrHunter[ $i ]->id );
      array_push( $objPositions->hunter, $this->getPlayerPosition( $objPlayer, 1 ) );
    }

    for( $i = 0; $i < count( $arrManagement ); $i++ ) {
      $objPlayer = new Player( $arrManagement[ $i ]->id );
      array_push( $objPositions->management, $this->getPlayerPosition( $objPlayer, 1 ) );
    }

    return $objPositions;
  }

  private function getPlayerPosition( Player $objPlayer, int $intCount ) : object {
    $objPositions            = new stdClass();
    $objPositions->name      = $objPlayer->get( 'name' );
    $objPositions->id        = $objPlayer->id();
    $objPositions->timestamp = time();
    $objTracking             = file_exists( $this->gameplayPath . 'tracking_' . $objPlayer->id() . '.json' ) ? $this->loadFileDeCrypted( $this->gameplayPath . 'tracking_' . $objPlayer->id() . '.json' ) : new stdClass();
    $arrTracking             = isset( $objTracking->tracking ) ? array_slice( $objTracking->tracking, -$intCount ) : [];
    $objPositions->position  = $arrTracking ;

    return $objPositions;
  }

  private function saveGameplay() : void {
    BaseObject::saveFileEncrypted( $this->gameplayPath . 'gameplay.json', $this->gameplayObject );

    return;
  }

  private function saveMessages() : void {
    BaseObject::saveFileEncrypted( $this->gameplayPath . 'messages.json', $this->messages );

    return;
  }

  private function silentHunt( object $objState ) : object {
    $intSilentHuntInterval = $this->gameSettings->pingInterval * 60;
    $intStartTimestamp     = Presentation::stringToTimestamp( $this->gameSettings->start );
    $intDurationSec        = $this->gameSettings->duration * 60 * 60;
    $intEndTimestamp       = $intStartTimestamp + $intDurationSec;
    $intNowTimestamp       = time();

    if( ! isset( $this->gameplayObject->silentHunt ) ) {
      $objSilentHunt                = new stdClass();
      $objSilentHunt->tracking      = new stdClass();
      $objSilentHunt->nextTimestamp = $intStartTimestamp + $intSilentHuntInterval;

      for( $i = 0; $i < count( $this->gameplayObject->player ); $i++ ) {
        $strPlayerId                            = $this->gameplayObject->player[ $i ]->id;
        $objPlayer                              = new Player( $strPlayerId );
        $objSilentHunt->tracking->$strPlayerId  = $this->getPlayerPosition( $objPlayer, 1 );
      }

      $this->gameplayObject->silentHunt = $objSilentHunt;

      $this->saveGameplay();
    }

    if( $this->gameplayObject->silentHunt->nextTimestamp > $intNowTimestamp ) {
      if( $this->gameplayObject->silentHunt->nextTimestamp > $intEndTimestamp ) {
        $objState->nextSilentHunt        = '';
        $objState->nextSilentHuntMessage = 'Es gibt keinen Silent Hunt vor Spielende mehr.';
      } else {
        $objState->nextSilentHunt        = Presentation::timestampToString( $this->gameplayObject->silentHunt->nextTimestamp );
        $objState->nextSilentHuntMessage = 'Der nächste Silent Hunt ist am ' . $objState->nextSilentHunt . ' Uhr.';
      }
    } else if( $objState->timestampEnd < $intNowTimestamp ) {
      $objState->nextSilentHunt        = '';
      $objState->nextSilentHuntMessage = 'Es gibt keinen Silent Hunt. Das Spiel ist beendet.';
    } else if( $intNowTimestamp > $this->gameplayObject->silentHunt->nextTimestamp ) {
      for( $i = 0; $i < count( $this->gameplayObject->player ); $i++ ) {
        $strPlayerId  = $this->gameplayObject->player[ $i ]->id;
        $objPlayer    = new Player( $strPlayerId );
        $this->gameplayObject->silentHunt->tracking->$strPlayerId  = $this->getPlayerPosition( $objPlayer, 1 );
      }

      $this->gameplayObject->silentHunt->nextTimestamp = $this->gameplayObject->silentHunt->nextTimestamp + $intSilentHuntInterval;
      $objState->nextSilentHunt                        = Presentation::timestampToString( $this->gameplayObject->silentHunt->nextTimestamp );
      $objState->nextSilentHuntMessage                 = 'Der nächste Silent Hunt ist am ' . $objState->nextSilentHunt . ' Uhr.';

      $this->saveGameplay();
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
      $objState->gameState        = 'stopped';
      $objState->gameStateMessage = 'Das Spiel startet am ' . Presentation::timestampToString( $intStartTimestamp ) . ' Uhr.';
    } else if( $intEndTimestamp < $intNowTimestamp ) {
      $objState->gameState        = 'stopped';
      $objState->gameStateMessage = 'Das Spiel ist schon beendet.';
    } else {
      $objState->gameState        = 'running';
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
    $intNextSpeedhunt = intval( $intLastSpeedhunt ) + ( intval( $this->gameplayObject->speedPingInterval ) * 60 );

    if( $intNextSpeedhunt > time() ) {
      $objState->speedHuntState->speedHuntCount    = -1;
      $objState->speedHuntState->speedHuntCountMax = -1;
      $objState->speedHuntState->message           = 'Der nächste Speedhunt ist am ' . Presentation::timestampToString( $intNextSpeedhunt )  . ' Uhr verfügbar.';
      $objState->speedHuntState->state             = 'not available';

      return $objState;
    }

    $objState->speedHuntState->speedHuntCount    = 0;
    $objState->speedHuntState->speedHuntCountMax = $this->gameplayObject->speedPingCount;
    $objState->speedHuntState->message           = 'Speedhunt ist verfügbar.';
    $objState->speedHuntState->state             = 'available';

    return $objState;
  }

  public function speedHunt( object $objRequestObject ) : object {
    if( ! isset( $this->gameplayObject->speedHunts ) ) $this->gameplayObject->speedHunts = [];
    if( ! isset( $this->gameplayObject->speedHunt ) ) {
      $objPlayer                                   = new Player( $objRequestObject->playerId );
      $this->gameplayObject->speedHunt             = new stdClass();
      $this->gameplayObject->speedHunt->timestamps = [];
      $this->gameplayObject->speedHunt->playerId   = $objRequestObject->playerId;
      $this->gameplayObject->speedHunt->playerName = $objPlayer->get( 'name' );
    }

    array_push( $this->gameplayObject->speedHunt->timestamps, time() );

    $intSpeedHuntCount                                        = count( $this->gameplayObject->speedHunt->timestamps );
    $strPlayerId                                              = $this->gameplayObject->speedHunt->playerId;
    $objPlayer                                                = new Player( $strPlayerId );
    $objRequestObject->positions                              = new stdClass();
    $objTracking                                              = $this->getPlayerPosition( $objPlayer, 1 );
    $objRequestObject->positions->player                      = [ $objTracking ];
    $objRequestObject->positions->hunter                      = [];
    $objRequestObject->positions->management                  = [];
    $this->gameplayObject->silentHunt->tracking->$strPlayerId = $objTracking;

    if( $intSpeedHuntCount >= $this->gameplayObject->speedPingCount ) {
      $this->gameplayObject->lastSpeedHunt = time();

      array_push( $this->gameplayObject->speedHunts, $this->gameplayObject->speedHunt );
      unset( $this->gameplayObject->speedHunt );
    }

    $this->saveGameplay();

    $objState                    = new stdClass();
    $objState                    = $this->getGameplayState( $objState );
    $objState                    = $this->silentHunt( $objState );
    $objState                    = $this->getGameplaySpeedHunt( $objState );
    $objRequestObject->state     = $objState;
    $objRequestObject->settings  = $this->gameSettings;
    $objRequestObject->gameRole  = $this->currentPlayerGameRole;
    $objRequestObject->messages  = $this->messages->messages;

    return $objRequestObject;
  }

  public function track( object $objRequestObject ) : object {
    $this->addTracking( $objRequestObject->lat, $objRequestObject->lng, $objRequestObject->precision );

    $objState                    = new stdClass();
    $objState                    = $this->getGameplayState( $objState );
    $objState                    = $this->silentHunt( $objState );
    $objState                    = $this->getGameplaySpeedHunt( $objState );

    $objRequestObject->positions = $this->getAllPlayerPositions();
    $objRequestObject->state     = $objState;
    $objRequestObject->settings  = $this->gameSettings;
    $objRequestObject->gameRole  = $this->currentPlayerGameRole;
    $objRequestObject->messages  = $this->messages->messages;

    return $objRequestObject;
  }

  public function message( object $objRequestObject ) : object {
    if( $objRequestObject->message == '' ) return $objRequestObject;

    $objMessage             = new stdClass();
    $objMessage->message    = $objRequestObject->message;
    $objMessage->playerId   = $this->currentPlayer->id();
    $objMessage->timestamp  = time();
    $objMessage->playerName = $this->currentPlayer->get( 'name' );
    $objMessage->id         = $this->newId( 'message' );

    array_push( $this->messages->messages, $objMessage );

    if( count( $this->messages->messages ) > 20 ) $this->messages->messages = array_slice( $this->messages->messages, -20 );

    $this->saveMessages();

    $objRequestObject->messages = $this->messages->messages;

    return $objRequestObject;
  }


}

// EOF
