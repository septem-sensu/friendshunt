<?php

declare( strict_types = 1 );

include_once ( __DIR__ . '/../classes/baseObject.php' );
include_once ( __DIR__ . '/../classes/game.php' );

class Gameplay extends Game {
  protected object $gameplayObject;
  protected string $gameplayPath;
  protected Player $currentPlayer;
  protected object $currentPlayerTracking;

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

    if( ! file_exists( $this->gameplayPath . 'tracking_' . $this->currentPlayer->id() . '.json' ) ) {
      $objTracking           = new stdClass();
      $objTracking->tracking = [];

      $this->saveFileEncrypted( $this->gameplayPath . 'tracking_' . $this->currentPlayer->id() . '.json', $objTracking );
    }

    $this->currentPlayerTracking = $this->loadFileDeCrypted( $this->gameplayPath . 'tracking_' . $this->currentPlayer->id() . '.json' );

    return;
  }

  private function addTracking( float $floatLat, float $floatLng, int $intPrecision ) : object {
    $objTracking            = new stdClass();
    $objTracking->lat       = $floatLat;
    $objTracking->lng       = $floatLng;
    $objTracking->precision = $intPrecision;
    $objTracking->timestamp = time();

    array_push( $this->currentPlayerTracking->tracking, $objTracking );

    $this->saveFileEncrypted( $this->gameplayPath . 'tracking_' . $this->currentPlayer->id() . '.json', $this->currentPlayerTracking );

    return $objTracking;
  }

  private function getGameSettings() : object {
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

  public function saveGameplay() : void {
    BaseObject::saveFileEncrypted( $this->gameplayPath . 'gameplay.json', $this->gameplayObject );

    return;
  }

  public function track( object $objRequestObject ) : object {
    $objRequestObject->positions = $this->getAllPlayerPositions();
    $objRequestObject->settings  = $this->getGameSettings();

    return $objRequestObject;
  }


}

// EOF
