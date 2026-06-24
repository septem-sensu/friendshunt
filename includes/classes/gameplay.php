<?php

declare( strict_types = 1 );

require_once ( __DIR__ . '/../classes/baseObject.php' );
require_once ( __DIR__ . '/../classes/game.php' );

/**
 * Gameplay Class for the Friends Hunt App.
 *
 * This Class represents the Gameplay Class for the Friends Hunt App with his Properties and Methods.
 * The Gameplay Class controls the complete Gameplay with Tracking and save all Informations to the Gameplay.
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
 * @example     $objGameplay = new Gameplay( $strGameId, $objCurrentPlayer );
 *
*/
class Gameplay extends Game {

  const STATISTICPROPERTIES = [
    'asPlayerCountSteps',
    'asHunterCountSteps',
    'asManagementCountSteps',
    'asPlayerDistance',
    'asHunterDistance',
    'asManagementDistance',
    'asPlayerCountGames',
    'asHunterCountGames',
    'asManagementCountGames',
    'asPlayerTime',
    'asHunterTime',
    'asManagementTime',
    'asPlayerViolationOfTheRules',
    'asHunterViolationOfTheRules',
    'asManagementViolationOfTheRules',
    'asPlayerSpeedHunts',
    'asHunterSpeedHunts',
    'asManagementSpeedHunts',
    'asPlayerCaptured',
    'asHunterCaptured',
    'asManagementCaptured',
    'asPlayerCountMessages',
    'asHunterCountMessages',
    'asManagementCountMessages',
    'asPlayerCountMessagesAll',
    'asHunterCountMessagesAll',
    'asManagementCountMessagesAll',
    'asPlayerDistanceDriven',
    'asHunterDistanceDriven',
    'asManagementDistanceDriven'
  ];


/* Class Properties */
  protected object $gameplayObject;
  protected string $gameplayPath;
  protected Player $currentPlayer;
  protected string $currentPlayerGameRole;
  protected object $currentPlayerTracking;
  protected object $gameSettings;
  protected object $messages;
  protected object $gameplayRoles;
  protected bool   $isRunning;
  protected int    $startTimestamp;
  protected int    $endTimestamp;
  protected bool   $generateTestData;
  protected array  $testDataSource;

/**
 * This Method is the Constructor for this Class
 *
 * @access     public
 * @since      2026-06-05
 * @version    0.1.0
 *
 * @param      string   $strObjectId    Object Id of the Game
 * @param      Player   $objCurrentPlayer    Object Id of the Game
 * @return     void
 *
 * @example    $objGameplay = new Gameplay( $strObjectId, $objCurrentPlayer );
 *
*/
  public function __construct( string $strObjectId, Player $objCurrentPlayer ) {
    $this->id               = $strObjectId;
    $this->currentPlayer    = $objCurrentPlayer;
    $this->generateTestData = false;
    $this->testDataSource   = [
      'curly@media-island-design.de' => [
        'latShift' => -0.0025,
        'lngShift' => -0.0023
      ],
      'katharina@septem-sensu.de' => [
        'latShift' => 0.0012,
        'lngShift' => 0.0024
      ]
    ];

    $this->init();

    return;
  }

/**
 * This Method initializes the Gameplay, sets all Properties and creates the Directories and Files for the Game.
 *
 * @access     private
 * @since      2026-06-05
 * @version    0.1.0
 *
 * @return     void
 *
 * @example    $objGameplay->init();
 *
*/
  private function init() : void {
    $this->gameplayPath   = __DIR__ . '/../files/game/' . $this->id . '/';
    $this->gameplayObject = BaseObject::loadFileDeCrypted( $this->gameplayPath . 'gameplay.json' );
    $this->fields         = BaseObject::loadFileDeCrypted( static::FILEPATHJSON . 'fields/gameplay.json' );

    if( ! isset( $this->gameplayObject->violationsOfTheRules ) ) {
      $this->gameplayObject->violationsOfTheRules = new stdClass();
      $this->saveGameplay();
    }

    foreach( $this->gameplayObject->player as $objPlayerEntry ) {
      if( $objPlayerEntry->id != $this->currentPlayer->id ) continue;
      $this->currentPlayerGameRole = 'player';
      break;
    }

    if( ! isset( $this->currentPlayerGameRole ) ) {
      foreach( $this->gameplayObject->hunter as $objHunterEntry ) {
        if( $objHunterEntry->id != $this->currentPlayer->id ) continue;
        $this->currentPlayerGameRole = 'hunter';
        break;
      }
    }

    if( ! isset( $this->currentPlayerGameRole ) ) $this->currentPlayerGameRole = 'management';

    if( ! file_exists( $this->gameplayPath . 'tracking_' . $this->currentPlayer->id() . '.json' ) ) {
      $objTracking           = new stdClass();
      $objTracking->tracking = [];

      BaseObject::saveFileEnCrypted( $this->gameplayPath . 'tracking_' . $this->currentPlayer->id() . '.json', $objTracking );
    }

    if( ! file_exists( $this->gameplayPath . 'messages.json' ) ) {
      $objMessages           = new stdClass();
      $objMessages->messages = [];

      BaseObject::saveFileEnCrypted( $this->gameplayPath . 'messages.json', $objMessages );
    }

    $this->messages                   = BaseObject::loadFileDeCrypted( $this->gameplayPath . 'messages.json' );
    $this->currentPlayerTracking      = BaseObject::loadFileDeCrypted( $this->gameplayPath . 'tracking_' . $this->currentPlayer->id() . '.json' );
    $this->gameSettings               = $this->getGameSettings();
    $this->gameplayRoles              = new stdClass();
    $this->gameplayRoles->player      = 'Spieler';
    $this->gameplayRoles->hunter      = 'Jäger';
    $this->gameplayRoles->management  = 'Spielleitung';
    $this->startTimestamp             = $this->gameSettings->start;
    $this->endTimestamp               = $this->startTimestamp + ( $this->gameSettings->duration * 60 * 60 );
    $this->isRunning                  = time() > $this->startTimestamp && time() < $this->endTimestamp;
    $this->gameSettings->end          = $this->endTimestamp;

    $this->transferStatistics();

    return;
  }

/**
 * This Method generates the Statistics and sets the Gameplay Values at the Player Objects.
 * This Method is called by the end of the Game by an Administrator from the init Method.
 *
 * @access     private
 * @since      2026-06-05
 * @version    0.1.0
 *
 * @return     void
 *
 * @example    $objGameplay->transferStatistics();
 *
*/
  private function transferStatistics() {
    if( isset( $this->gameplayObject->isTransfered ) && $this->gameplayObject->isTransfered == true ) return;
    if( $this->currentPlayer->get( 'role' ) != 'administrator' ) return;

    $arrGameplayRoles          = [ 'player' => 'Player', 'hunter' => 'Hunter', 'management' => 'Management' ];
    $arrPlayerProperties       = static::STATISTICPROPERTIES;
    $arrSpeedHunts             = isset( $this->gameplayObject->speedHunts ) ? $this->gameplayObject->speedHunts : [];
    $arrCaptured               = isset( $this->gameplayObject->captured ) ? $this->gameplayObject->captured : [];
    $arrMessages               = isset( $this->messages->messages ) ? $this->messages->messages : [];
    $intTimestampNow           = time();
    $intViolationOfTheRulesAll = 0;

    if( $intTimestampNow < $this->endTimestamp ) return;

    foreach( $arrGameplayRoles as $strGamplayRoleId => $strGameplayRoleName ) {
      $arrPlayerGameplayObjects = $this->gameplayObject->$strGamplayRoleId;

      foreach( $arrPlayerGameplayObjects as $objPlayerGameplay ) {
        $strPlayerId            = $objPlayerGameplay->id;
        $objTracking            = file_exists( $this->gameplayPath . 'tracking_' . $strPlayerId . '.json' ) ? BaseObject::loadFileDeCrypted( $this->gameplayPath . 'tracking_' . $strPlayerId . '.json' ) : new stdClass();
        $arrTracking            = isset( $objTracking->tracking ) ? $objTracking->tracking : [];
        $objPlayer              = new Player( $strPlayerId );
        $objPlaySetObject       = new stdClass();
        $intSteps               = 0;
        $intDistance            = 0;
        $intDistanceDriven      = 0;
        $intViolationOfTheRules = 0;
        $intCountSpeedHunts     = 0;
        $intCountCaptured       = 0;
        $intCountMessages       = 0;
        $intCountMessagesAll    = 0;

        foreach( $arrPlayerProperties as $strPlayerProperty ) {
          if( strpos( $strPlayerProperty, $strGameplayRoleName ) === false ) continue;
          $objPlaySetObject->$strPlayerProperty = intval( $objPlayer->get( $strPlayerProperty ) );
        }

        $intCountTracking = count( $arrTracking );
        for( $j = 0; $j < $intCountTracking; $j++ ) {
          $intSteps += $arrTracking[ $j ]->steps;

          if( isset( $arrTracking[ $j ]->outOfPlayingField ) && $arrTracking[ $j ]->outOfPlayingField && $strGamplayRoleId != 'management' ) {
            $intViolationOfTheRules++;
            $intViolationOfTheRulesAll++;
          }

          if( $arrTracking[ $j ]->isDriven ) {
            $intDistanceDriven += $this->calcDistance( $arrTracking[ $j ]->lat, $arrTracking[ $j ]->lng, $arrTracking[ $j - 1 ]->lat, $arrTracking[ $j - 1 ]->lng );
          }

          if( $j >= $intCountTracking - 1 ) continue;

          $intDistance += $this->calcDistance( $arrTracking[ $j ]->lat, $arrTracking[ $j ]->lng, $arrTracking[ $j + 1 ]->lat, $arrTracking[ $j + 1 ]->lng );
        }

        if( $strGamplayRoleId == 'hunter' || $strGamplayRoleId == 'management' ) {
          $intCountSpeedHunts = count( $arrSpeedHunts );
        } else {
          foreach( $arrSpeedHunts as $objSpeedHunt ) {
            $intCountSpeedHunts = $objSpeedHunt->playerId == $strPlayerId ? $intCountSpeedHunts + 1 : $intCountSpeedHunts;
          }
        }

        if( $strGamplayRoleId == 'management' ) {
          $intCountCaptured = count( $arrCaptured );
        } else {
          foreach( $arrCaptured as $objCapturedEntry ) {
            if( $strGamplayRoleId == 'hunter' ) {
              $intCountCaptured = in_array( $strPlayerId, $objCapturedEntry->hunterIds ) ? $intCountCaptured + 1 : $intCountCaptured;
            } else {
              $intCountCaptured = $objCapturedEntry->playerId == $strPlayerId ? $intCountCaptured + 1 : $intCountCaptured;
            }
          }
        }

        $intViolationOfTheRules = $strGamplayRoleId == 'management' ? $intViolationOfTheRulesAll : $intViolationOfTheRules;

        foreach( $arrMessages as $objMessage ) {
          $intCountMessagesAll++;
          if( $strPlayerId != $objMessage->playerId ) continue;
          $intCountMessages++;
        }

        $objPlaySetObject       = $this->setStatisticProperty( $objPlaySetObject, $strGameplayRoleName, 'CountSteps', $intSteps );
        $objPlaySetObject       = $this->setStatisticProperty( $objPlaySetObject, $strGameplayRoleName, 'Distance', $intDistance );
        $objPlaySetObject       = $this->setStatisticProperty( $objPlaySetObject, $strGameplayRoleName, 'ViolationOfTheRules', $intViolationOfTheRules );
        $objPlaySetObject       = $this->setStatisticProperty( $objPlaySetObject, $strGameplayRoleName, 'SpeedHunts', $intCountSpeedHunts );
        $objPlaySetObject       = $this->setStatisticProperty( $objPlaySetObject, $strGameplayRoleName, 'CountGames', 1 );
        $objPlaySetObject       = $this->setStatisticProperty( $objPlaySetObject, $strGameplayRoleName, 'Time', intval( $this->gameSettings->duration ) );
        $objPlaySetObject       = $this->setStatisticProperty( $objPlaySetObject, $strGameplayRoleName, 'Captured', $intCountCaptured );
        $objPlaySetObject       = $this->setStatisticProperty( $objPlaySetObject, $strGameplayRoleName, 'CountMessages', $intCountMessages );
        $objPlaySetObject       = $this->setStatisticProperty( $objPlaySetObject, $strGameplayRoleName, 'CountMessagesAll', $intCountMessagesAll );
        $objPlaySetObject       = $this->setStatisticProperty( $objPlaySetObject, $strGameplayRoleName, 'DistanceDriven', $intDistanceDriven );

        foreach( $objPlaySetObject as $strProperty => $floatValue ) {
          $objPlaySetObject->$strProperty = intval( $floatValue );
        }

        $objPlayer->set( $objPlaySetObject );
      }
    }

    $this->gameplayObject->isTransfered = true;

    $this->saveGameplay();

    return;
  }

/**
 * This Method is a Helper Method and set the Property Values to the Set Object for the Player Object.
 * The Method is called by the transferStatistics Method.
 *
 * @access     private
 * @since      2026-06-05
 * @version    0.1.0
 *
 * @param      object   $objSetObject   The Set Object for the Player Object
 * @param      string   $strRoleName    The Gameplay Role Name
 * @param      string   $strProperty    The Part of the Property Name
 * @param      float    $floatValue     The Value to set
 * @return     object   $objSetObject   The Result Object with new set Property
 *
 * @example    $objSetObject = $objGameplay->setStatisticProperty( $objSetObject, $strRoleName, $strProperty, $floatValue );
 *
*/
  private function setStatisticProperty( object $objSetObject, string $strRoleName, string $strProperty, float $floatValue  ) : object {
    $strProperty          = 'as' . $strRoleName . $strProperty;
    $arrPlayerProperties  = static::STATISTICPROPERTIES;

    if( ! in_array( $strProperty, $arrPlayerProperties ) ) return $objSetObject;

    $objSetObject->$strProperty += $floatValue;

    return $objSetObject;
  }

/**
 * This Method save the Tracking and the Steps that have been run since the last Tracking.
 *
 * @access     private
 * @since      2026-06-05
 * @version    0.1.0
 *
 * @param      float   $floatLat               The Tracking coordinates
 * @param      float   $floatLng               The Tracking coordinates
 * @param      int     $intPrecision           The Precision of the Tracking coordinates
 * @param      int     $intSteps               The count of Steps that have been run since the last Tracking
 * @param      bool    $boolOutOfPlayingField  Whether the Player is out of the Playing Field
 * @param      int     $intBatteryLevel        The current Battery Level
 * @param      bool    $boolBatteryIsCharging  Whether the Battery is currently charging
 * @return     void
 *
 * @example    $objGameplay->addTracking( $floatLat, $floatLng, $intPrecision, $intSteps, $boolOutOfPlayingField, $intBatteryLevel, $boolBatteryIsCharging );
 *
*/
  private function addTracking( float $floatLat, float $floatLng, int $intPrecision, int $intSteps, bool $boolOutOfPlayingField, int $intBatteryLevel, bool $boolBatteryIsCharging ) : void {
    $objTracking                     = new stdClass();
    $objTracking->lat                = $floatLat;
    $objTracking->lng                = $floatLng;
    $objTracking->precision          = $intPrecision;
    $objTracking->steps              = $intSteps;
    $objTracking->outOfPlayingField  = $boolOutOfPlayingField;
    $objTracking->batteryLevel       = $intBatteryLevel;
    $objTracking->batteryIsCharging  = $boolBatteryIsCharging;
    $objTracking->isDriven           = $this->isDriven( $floatLat, $floatLng );
    $objTracking->timestamp          = time();

    array_push( $this->currentPlayerTracking->tracking, $objTracking );

    BaseObject::saveFileEnCrypted( $this->gameplayPath . 'tracking_' . $this->currentPlayer->id() . '.json', $this->currentPlayerTracking );

    if( $this->generateTestData ) {
      foreach( $this->testDataSource as $strTestPlayerId => $arrTestPlayerData ) {
        $objTestPlayerTracking = null;

        if( ! file_exists( $this->gameplayPath . 'tracking_' . $strTestPlayerId . '.json' ) ) {
          $objTestPlayerTracking           = new stdClass();
          $objTestPlayerTracking->tracking = [];

          BaseObject::saveFileEnCrypted( $this->gameplayPath . 'tracking_' . $strTestPlayerId . '.json', $objTestPlayerTracking );
        } else {
          $objTestPlayerTracking = BaseObject::loadFileDeCrypted( $this->gameplayPath . 'tracking_' . $strTestPlayerId . '.json' );
        }

        $objTrackingClone      = clone $objTracking;
        $objTrackingClone->lat = $objTrackingClone->lat + $arrTestPlayerData[ 'latShift' ];
        $objTrackingClone->lng = $objTrackingClone->lng + $arrTestPlayerData[ 'lngShift' ];

        array_push( $objTestPlayerTracking->tracking, $objTrackingClone );

        BaseObject::saveFileEnCrypted( $this->gameplayPath . 'tracking_' . $strTestPlayerId . '.json', $objTestPlayerTracking );
      }
    }

    return;
  }

/**
 * This Method checks whether the Player covered the last distance by driving or running.
 * If the speed between the last position and the current position was greater than 15 km/h, then the Player was being driven.
 *
 * @access     private
 * @since      2026-06-05
 * @version    0.1.0
 *
 * @param      float   $floatLat               The current Tracking coordinates
 * @param      float   $floatLng               The current Tracking coordinates
 * @return     bool    $boolIsDriven           Is the Player the distance driven or not
 *
 * @example    $boolIsDrive = $objGameplay->isDriven( $floatLat, $floatLng );
 *
*/
  private function isDriven( float $floatLat, float $floatLng ) : bool {
    if( count( $this->currentPlayerTracking->tracking ) < 1 ) return false;

    $arrLastPosition   = array_slice( $this->currentPlayerTracking->tracking, -1 );
    $floatTime         = ( time() - $arrLastPosition[ 0 ]->timestamp ) / 60 / 60;
    $floatDistance     = $this->calcDistance( $floatLat, $floatLng, $arrLastPosition[ 0 ]->lat, $arrLastPosition[ 0 ]->lng ) / 1000;

    if( $floatTime == 0 ) return false;

    return $floatDistance / $floatTime > 15 ? true : false;
  }

/**
 * This Method return the Game Settings.
 *
 * @access     public
 * @since      2026-06-05
 * @version    0.1.0
 *
 * @return     object $objGameSettings  The Game Settings Object
 *
 * @example    $objGameSettings = $objGameplay->getGameSettings();
 *
*/
  public function getGameSettings() : object {
    $objGameConfiguration                = clone $this->gameplayObject;
    $objGameConfiguration->showReplay    = BaseObject::getConfig()->showReplay;
    $objGameConfiguration->playerIds     = [];
    $objGameConfiguration->hunterIds     = [];
    $objGameConfiguration->managementIds = [];
    $objGameConfiguration->hunter        = [];

    unset( $objGameConfiguration->player );
    unset( $objGameConfiguration->hunter );
    unset( $objGameConfiguration->management );
    unset( $objGameConfiguration->silentHunt );
    unset( $objGameConfiguration->speedHunts );

    $objGameConfiguration->hunter = [];

    foreach( $this->gameplayObject->player as $objPlayerEntry ) {
      array_push( $objGameConfiguration->playerIds, $objPlayerEntry->id );
    }

    foreach( $this->gameplayObject->hunter as $objHunterEntry ) {
      $objHunter       = new stdClass();
      $objHunter->id   = $objHunterEntry->id;
      $objHunter->name = $objHunterEntry->name;

      array_push( $objGameConfiguration->hunter, $objHunter );
      array_push( $objGameConfiguration->hunterIds, $objHunterEntry->id );
    }

    foreach( $this->gameplayObject->management as $objManagementEntry ) {
      array_push( $objGameConfiguration->managementIds, $objManagementEntry->id );
    }

    return $objGameConfiguration;
  }

/**
 * This Method calculates the Distance between two Points with the Haversine-Formula.
 *
 * @access     public
 * @since      2026-06-05
 * @version    0.1.0
 *
 * @param      float   $floatLat1        The Tracking coordinates from Point 1
 * @param      float   $floatLng1        The Tracking coordinates from Point 1
 * @param      float   $floatLat2        The Tracking coordinates from Point 2
 * @param      float   $floatLng2        The Tracking coordinates from Point 2
 * @return     float   $floatDistance    The Distance in Meters from Point 1 to Point 2
 *
 * @example    $floatDistance = $objGameplay->calcDistance( $floatLat1, $floatLng1, $floatLat2, $floatLng2 );
 *
*/
  public function calcDistance( float $floatLat1, float $floatLng1, float $floatLat2, float $floatLng2 ) : float {
    $intEarthRadiusInMeters = 6371000;

    // Umrechnung von Grad in Bogenmaß (Radiant)
    $floatDLat = deg2rad( $floatLat2 - $floatLat1 );
    $floatDLng = deg2rad( $floatLng2 - $floatLng1 );
    $a         = sin( $floatDLat / 2 ) * sin( $floatDLat / 2 ) + cos( deg2rad( $floatLat1 ) ) * cos( deg2rad( $floatLat2 ) ) * sin( $floatDLng / 2 ) * sin( $floatDLng / 2 );
    $c         = 2 * atan2(sqrt($a), sqrt(1 - $a));

    return $intEarthRadiusInMeters * $c;
  }

/**
 * This Method calculates the Distances and Steps from a full Game for a User.
 *
 * @access     public
 * @since      2026-06-05
 * @version    0.1.0
 *
 * @param      mixed    $mixPlayer       Player Object or Player Id
 * @return     object   $objDistances    The Distances and Steps from a Player for a full Game
 *
 * @example    $objDistances = $objGameplay->calcPlayerDistances( $mixPlayer );
 *
*/
  public function calcPlayerDistances( string | Player $mixPlayer ) : object {
    $objDistances           = new stdClass();
    $objDistances->steps    = 0;
    $objDistances->distance = 0;
    $strPlayerId            = is_object( $mixPlayer ) ? $mixPlayer->id() : $mixPlayer;
    $objTracking            = BaseObject::loadFileDeCrypted( $this->gameplayPath . 'tracking_' . $strPlayerId . '.json' );
    $arrTracking            = $objTracking->tracking;
    $intCountTracking       = count( $arrTracking );

    for( $i = 0; $i < $intCountTracking; $i++ ) {
      $objDistances->trackCount = $i;
      $objDistances->steps      = isset( $arrTracking[ $i ]->steps ) ? $objDistances->steps + $arrTracking[ $i ]->steps : $objDistances->steps;

      if( $i < $intCountTracking - 1 ) {
        if( ! isset( $arrTracking[ $i ]->lat ) || ! isset( $arrTracking[ $i ]->lng ) ) continue;
        if( ! isset( $arrTracking[ $i + 1 ]->lat ) || ! isset( $arrTracking[ $i + 1 ]->lng ) ) continue;
        if( $arrTracking[ $i ]->lat == 0 || $arrTracking[ $i ]->lng == 0 ) continue;
        if( $arrTracking[ $i + 1 ]->lat == 0 || $arrTracking[ $i + 1 ]->lng == 0 ) continue;
        if( $arrTracking[ $i ]->lat == -1 || $arrTracking[ $i ]->lng == -1 ) continue;
        if( $arrTracking[ $i + 1 ]->lat == -1 || $arrTracking[ $i + 1 ]->lng == -1 ) continue;

        $objDistances->distance = $objDistances->distance + $this->calcDistance( $arrTracking[ $i ]->lat, $arrTracking[ $i ]->lng, $arrTracking[ $i + 1 ]->lat, $arrTracking[ $i + 1 ]->lng );
      }
    }

    return $objDistances;
  }

/**
 * This Method returns a Standard Object with the Position Coordinates from all Players.
 *
 * @access     private
 * @since      2026-06-05
 * @version    0.1.0
 *
 * @return     object   $objPositions    Standard Object with the Position Coordinates from all Players
 *
 * @example    $objPositions = $objGameplay->getAllPlayerPositions();
 *
*/
  private function getAllPlayerPositions() : object {
    $objPositions             = new stdClass();
    $objPositions->player     = [];
    $objPositions->hunter     = [];
    $objPositions->management = [];
    $arrPlayer                = $this->gameplayObject->player;
    $arrHunter                = $this->gameplayObject->hunter;
    $arrManagement            = $this->gameplayObject->management;

    foreach( $arrPlayer as $objPlayerEntry ) {
      if( $this->currentPlayerGameRole == 'hunter' ) {
        $arrPlayerId = $objPlayerEntry->id;
        array_push( $objPositions->player, $this->gameplayObject->silentHunt->tracking->$arrPlayerId );
      } else {
        $objPlayer = new Player( $objPlayerEntry->id );
        array_push( $objPositions->player, $this->getPlayerPosition( $objPlayer, 1 ) );
      }
    }

    foreach( $arrHunter as $objHunterEntry ) {
      $objPlayer = new Player( $objHunterEntry->id );
      array_push( $objPositions->hunter, $this->getPlayerPosition( $objPlayer, 1 ) );
    }

    foreach( $arrManagement as $objManagementEntry ) {
      $objPlayer = new Player( $objManagementEntry->id );
      array_push( $objPositions->management, $this->getPlayerPosition( $objPlayer, 1 ) );
    }

    return $objPositions;
  }

/**
 * This Method returns a Standard Object with the Position Coordinates from one Player.
 *
 * @access     private
 * @since      2026-06-05
 * @version    0.1.0
 *
 * @param      Player     $objPlayer       Player Object
 * @param      int        $intCount        Count of the last Trackings do you get
 * @return     object     $objPositions    Standard Object with the Position Coordinates from one Player
 *
 * @example    $objPositions = $objGameplay->getPlayerPosition( $objPlayer, $intCount );
 *
*/
  private function getPlayerPosition( Player $objPlayer, int $intCount ) : object {
    $objPositions            = new stdClass();
    $objPositions->name      = $objPlayer->get( 'name' );
    $objPositions->id        = $objPlayer->id();
    $objPositions->timestamp = time();
    $objTracking             = file_exists( $this->gameplayPath . 'tracking_' . $objPlayer->id() . '.json' ) ? BaseObject::loadFileDeCrypted( $this->gameplayPath . 'tracking_' . $objPlayer->id() . '.json' ) : new stdClass();
    $arrTracking             = isset( $objTracking->tracking ) ? array_slice( $objTracking->tracking, -$intCount ) : [];
    $objPositions->position  = $arrTracking;

    return $objPositions;
  }

/**
 * This Method save the Gameplay to a encrypted JSON File.
 *
 * @access     private
 * @since      2026-06-05
 * @version    0.1.0
 *
 * @return     void
 *
 * @example    $objGameplay->saveGameplay();
 *
*/
  private function saveGameplay() : void {
    BaseObject::saveFileEnCrypted( $this->gameplayPath . 'gameplay.json', $this->gameplayObject );

    return;
  }

/**
 * This Method save the Game Messages to a encrypted JSON File.
 *
 * @access     private
 * @since      2026-06-05
 * @version    0.1.0
 *
 * @return     void
 *
 * @example    $objGameplay->saveMessages();
 *
*/
  private function saveMessages() : void {
    BaseObject::saveFileEnCrypted( $this->gameplayPath . 'messages.json', $this->messages );

    return;
  }

/**
 * This Method controls a silent Hunt from the Current Player and added to the Response State Object.
 *
 * @access     private
 * @since      2026-06-05
 * @version    0.1.0
 *
 * @param      object     $objState    Gameplay State Object for the Response
 * @return     object     $objState    Gameplay State Object for the Response
 *
 * @example    $objState = $objGameplay->silentHunt( $objState );
 *
*/
  private function silentHunt( object $objState ) : object {
    $intSilentHuntInterval = $this->gameSettings->pingInterval * 60;
    $intNowTimestamp       = time();

    if( ! isset( $this->gameplayObject->silentHunt ) ) {
      $objSilentHunt                = new stdClass();
      $objSilentHunt->tracking      = new stdClass();
      $objSilentHunt->nextTimestamp = $this->startTimestamp + $intSilentHuntInterval;

      foreach( $this->gameplayObject->player as $objPlayerEntry ) {
        $strPlayerId                            = $objPlayerEntry->id;
        $objPlayer                              = new Player( $strPlayerId );
        $objSilentHunt->tracking->$strPlayerId  = $this->getPlayerPosition( $objPlayer, 1 );
      }

      $this->gameplayObject->silentHunt = $objSilentHunt;

      $this->saveGameplay();
    }

    if( $this->gameplayObject->silentHunt->nextTimestamp > $intNowTimestamp ) {
      if( $this->gameplayObject->silentHunt->nextTimestamp > $this->endTimestamp ) {
        $objState->nextSilentHunt        = $this->gameplayObject->silentHunt->nextTimestamp;
      } else {
        $objState->nextSilentHunt        = $this->gameplayObject->silentHunt->nextTimestamp;
      }
    } else if( $objState->timestampEnd < $intNowTimestamp ) {
      $objState->nextSilentHunt             = '';
    } else if( $intNowTimestamp > $this->gameplayObject->silentHunt->nextTimestamp ) {
      foreach( $this->gameplayObject->player as $objPlayerEntry ) {
        $strPlayerId  = $objPlayerEntry->id;
        $objPlayer    = new Player( $strPlayerId );
        $this->gameplayObject->silentHunt->tracking->$strPlayerId  = $this->getPlayerPosition( $objPlayer, 1 );
      }

      $this->gameplayObject->silentHunt->nextTimestamp = $this->gameplayObject->silentHunt->nextTimestamp + $intSilentHuntInterval;
      $objState->nextSilentHunt                        = $this->gameplayObject->silentHunt->nextTimestamp;

      $this->saveGameplay();
    }

    return $objState;
  }

/**
 * This Method checks the Rules and set the System Messages.
 *
 * @access     private
 * @since      2026-06-05
 * @version    0.1.0
 *
 * @param      object     $objState    Gameplay State Object for the Response
 * @return     object     $objState    Gameplay State Object for the Response
 *
 * @example    $objState = $objGameplay->checkRulesAndAddSystemMessages( $objState );
 *
*/
  private function checkRulesAndAddSystemMessages( object $objState ) : object {
    if( ! isset( $objState->systemMessages ) ) $objState->systemMessages = [];

    $intNowTimestamp   = time();
    $arrCaptured       = $this->gameplayObject->captured;

    // Welcoming and bidding farewell to the players
    if( $intNowTimestamp > $this->startTimestamp && $intNowTimestamp <  $this->startTimestamp + 600 ) {
      $objSystemMessage                     = new stdClass();
      $objSystemMessage->type               = 'friendliness';
      $objSystemMessage->subType            = 'welcoming';
      $objSystemMessage->for                = [ 'player', 'hunter', 'management' ];
      $objSystemMessage->message            = '<p class="bold success-text">💥 DIE JAGD IST ERÖFFNET 💥</p>';
      $objSystemMessage->message           .= '<p>Lagezentrum online. Satellitenverbindung steht. Die Spielleitung begrüßt die Hunter-Taskforce und die Gejagten. Der Countdown läuft unerbittlich – die Jagd ist offiziell eröffnet! Möge die Ausdauer mit euch sein.</p>';
      $objSystemMessage->showMessageOnlyOne = true;
      $objSystemMessage->id                 = 'gameStartMessage';
      $objSystemMessage->timestamp          = $intNowTimestamp;

      array_push( $objState->systemMessages, $objSystemMessage );
    } else if( $intNowTimestamp > $this->endTimestamp && $intNowTimestamp <  $this->endTimestamp + 7200 && count( $this->gameplayObject->captured ) < count( $this->gameplayObject->player ) ) {
      $arrExitMeetLocation = [ 'in der Kneipe', 'im Biergarten', 'in der Gaststätte', 'im Wirtshaus', 'im Café', 'in der Bar' ];

      foreach( $this->gameplayRoles as $strGameplayRole => $strGameplayRoleName ) {
        $arrObjects = $this->gameplayObject->$strGameplayRole;

        foreach( $arrObjects as $objEntry ) {
          array_push( $arrExitMeetLocation, 'bei ' . $objEntry->name );
        }
      }

      $objSystemMessage                     = new stdClass();
      $objSystemMessage->type               = 'friendliness';
      $objSystemMessage->subType            = 'saygoodbye';
      $objSystemMessage->for                = [ 'player', 'hunter', 'management' ];
      $objSystemMessage->message            = '<p class="bold success-text">🏁 SPIEL BEENDET! - SAMMELN AM EXIT POINT 🏁</p>';
      $objSystemMessage->message           .= '<p>FINALE! Die Satellitenortung wurde abgeschaltet. Alle Einheiten – egal ob Jäger oder Gejagte – stellen das Tracking ein und rücken unverzüglich zur finalen Exit Zone (Wir treffen uns ' . $arrExitMeetLocation[ rand( 0, count( $arrExitMeetLocation ) - 1 ) ] . '.) vor. Zeit für das Debriefing!</p>';
      $objSystemMessage->showMessageOnlyOne = true;
      $objSystemMessage->id                 = 'gameEndMessage';
      $objSystemMessage->timestamp          = $intNowTimestamp;

      array_push( $objState->systemMessages, $objSystemMessage );
    }

    // Hunters won
    if( count( $this->gameplayObject->captured ) >= count( $this->gameplayObject->player ) && $intNowTimestamp <  $this->endTimestamp + 7200 ) {
      $arrExitMeetLocation = [ 'in der Kneipe', 'im Biergarten', 'in der Gaststätte', 'im Wirtshaus', 'im Café', 'in der Bar' ];

      foreach( $this->gameplayRoles as $strGameplayRole => $strGameplayRoleName ) {
        $arrObjects = $this->gameplayObject->$strGameplayRole;

        foreach( $arrObjects as $objEntry ) {
          array_push( $arrExitMeetLocation, 'bei ' . $objEntry->name );
        }
      }

      $objSystemMessage                     = new stdClass();
      $objSystemMessage->type               = 'friendliness';
      $objSystemMessage->subType            = 'win';
      $objSystemMessage->for                = [ 'player', 'hunter', 'management' ];
      $objSystemMessage->message            = '<p class="bold success-text">🏁 MISSION ERFÜLLT! - ALLE SPIELER WURDEN GEFANGEN - SAMMELN AM EXIT POINT 🏁</p>';
      $objSystemMessage->message           .= '<p>Totale Funkstille im Sektor! Die Hunter-Taskforce hat unerbittlich zugeschlagen und alle Zielobjekte erfolgreich eliminiert. Die Gejagten sitzen in Ketten – die Jagd ist vorbei! Jäger, tretet vor und lasst euch feiern. Gejagte... tja, die nächste Runde geht auf euch! (Wir treffen uns ' . $arrExitMeetLocation[ rand( 0, count( $arrExitMeetLocation ) - 1 ) ] . '.) vor. Zeit für das Debriefing!</p>';
      $objSystemMessage->showMessageOnlyOne = true;
      $objSystemMessage->id                 = 'winMessage';
      $objSystemMessage->timestamp          = $intNowTimestamp;

      array_push( $objState->systemMessages, $objSystemMessage );

      $this->isRunning = false;
    }

    if( ! $this->isRunning ) return $objState;

    foreach( $this->gameplayRoles as $strGameplayRole => $strGameplayRoleName ) {
      $arrObjects       = $this->gameplayObject->$strGameplayRole;

      foreach( $arrObjects as $intIndex => $objEntry ) {
        $strPlayerId        = $objEntry->id;
        $objPlayer          = new Player( $strPlayerId );
        $objPosition        = $this->getPlayerPosition( $objPlayer, 1 );

        if( count( $objPosition->position ) < 1 ) continue;

        // Violations Of The Rules - Out of Playfield
        if( $objPosition->position[ 0 ]->outOfPlayingField ) {

          $this->gameplayObject->silentHunt->tracking->$strPlayerId = $objPosition;

          $objSystemMessage                     = new stdClass();
          $objSystemMessage->type               = 'violationoftherules';
          $objSystemMessage->subType            = 'outofplayfield';
          $objSystemMessage->for                = [ 'player', 'hunter', 'management' ];
          $objSystemMessage->message            = '<p class="danger-text bold">REGELVERSTOSS</p>';
          $objSystemMessage->message           .= '<p class="danger-text">Ein ' . $strGameplayRoleName . ' hat das Spielfeld verlassen.</p>';
          $objSystemMessage->message           .= $strGameplayRole == 'player' ? '<p class="danger-text">Das Tracking für diesen Spieler wurde aktuallisiert.</p>' : '<p class="danger-text">' . $objPlayer->get( 'name' ) . ' muss ein Bier ausgeben.</p>';
          $objSystemMessage->applies            = $strPlayerId;
          $objSystemMessage->appliesName        = $objPlayer->get( 'name' );
          $objSystemMessage->appliesRole        = $strGameplayRole;
          $objSystemMessage->appliesRoleName    = $strGameplayRoleName;
          $objSystemMessage->cssClass           = 'danger-text';
          $objSystemMessage->appliesCount       = $intIndex + 1;
          $objSystemMessage->showMessageOnlyOne = false;
          $objSystemMessage->id                 = 'outOfPlayingField_' . $strPlayerId . '_' . $objPosition->position[ 0 ]->timestamp;
          $objSystemMessage->timestamp          = $objPosition->position[ 0 ]->timestamp;

          array_push( $objState->systemMessages, $objSystemMessage );

          if( ! isset( $this->gameplayObject->violationsOfTheRules->$strPlayerId ) ) $this->gameplayObject->violationsOfTheRules->$strPlayerId = [];

          array_push( $this->gameplayObject->violationsOfTheRules->$strPlayerId, $objPosition->position[ 0 ]->timestamp );

          $this->saveGameplay();
        }

        // Violations Of The Rules - Vehicle used
        if( isset( $objPosition->position[ 0 ]->isDriven ) &&  $objPosition->position[ 0 ]->isDriven && $strGameplayRole == 'player' && $this->gameSettings->sanctionForVehicleUse == '1' ) {

          $this->gameplayObject->silentHunt->tracking->$strPlayerId = $objPosition;

          $objSystemMessage                     = new stdClass();
          $objSystemMessage->type               = 'violationoftherules';
          $objSystemMessage->subType            = 'vehicleused';
          $objSystemMessage->for                = [ 'player', 'hunter', 'management' ];
          $objSystemMessage->message            = '<p class="danger-text bold">REGELVERSTOSS</p>';
          $objSystemMessage->message           .= '<p class="danger-text">Ein Spieler hat unerlaubt ein Fahrzeug benutzt.</p>';
          $objSystemMessage->message           .= '<p class="danger-text">Das Tracking für diesen Spieler wurde aktuallisiert.</p>';
          $objSystemMessage->applies            = $strPlayerId;
          $objSystemMessage->appliesName        = $objPlayer->get( 'name' );
          $objSystemMessage->appliesRole        = 'player';
          $objSystemMessage->appliesRoleName    = 'Spieler';
          $objSystemMessage->cssClass           = 'danger-text';
          $objSystemMessage->appliesCount       = $intIndex + 1;
          $objSystemMessage->showMessageOnlyOne = false;
          $objSystemMessage->id                 = 'usedVehicle_' . $strPlayerId . '_' . $objPosition->position[ 0 ]->timestamp;
          $objSystemMessage->timestamp          = $objPosition->position[ 0 ]->timestamp;

          array_push( $objState->systemMessages, $objSystemMessage );

          if( ! isset( $this->gameplayObject->violationsOfTheRules->$strPlayerId ) ) $this->gameplayObject->violationsOfTheRules->$strPlayerId = [];

          array_push( $this->gameplayObject->violationsOfTheRules->$strPlayerId, $objPosition->position[ 0 ]->timestamp );

          $this->saveGameplay();
        }

        // Speed Hunt
        $objSpeedHunt = isset( $this->gameplayObject->speedHunt ) ? $this->gameplayObject->speedHunt : null;
        $objSpeedHunt = ! isset( $objSpeedHunt ) && count( $this->gameplayObject->speedHunts ) > 0 ? end( $this->gameplayObject->speedHunts ) : $objSpeedHunt;

        if( isset( $objSpeedHunt ) && $objSpeedHunt->playerId == $strPlayerId ) {
          $intLastPingTimestamp                 = count( $objSpeedHunt->timestamps ) > 0 ? end( $objSpeedHunt->timestamps ) : time();

          $objSystemMessage                     = new stdClass();
          $objSystemMessage->type               = 'speedhunt';
          $objSystemMessage->subType            = 'isrunning';
          $objSystemMessage->for                = [ 'player', 'hunter', 'management' ];
          $objSystemMessage->message            = '<p class="danger-text bold">SPEEDHUNT LÄUFT</p>';
          $objSystemMessage->message           .= '<p class="danger-text">Aktuell läuft ein Speedhunt auf einen Spieler.</p>';
          $objSystemMessage->message           .= '<p class="danger-text">Ping ' . count(  $objSpeedHunt->timestamps ) . ' von ' . $this->gameplayObject->speedPingCount . '</p>';
          $objSystemMessage->appliesRole        = 'player';
          $objSystemMessage->appliesRoleName    = 'Spieler';
          $objSystemMessage->cssClass           = 'danger-text';
          $objSystemMessage->appliesCount       = $intIndex + 1;
          $objSystemMessage->showMessageOnlyOne = false;
          $objSystemMessage->id                 = 'speedhunt_' . $intLastPingTimestamp;
          $objSystemMessage->timestamp          = $intLastPingTimestamp;

          array_push( $objState->systemMessages, $objSystemMessage );
        }
      }
    }

    // A Player was captured
    foreach( $arrCaptured as $objCapturedEntry ) {
      if( $intNowTimestamp > $objCapturedEntry->timestamp + 1200 ) continue;

      $strPlayerId                          = $objCapturedEntry->playerId;
      $objPlayer                            = new Player( $strPlayerId );

      $objSystemMessage                     = new stdClass();
      $objSystemMessage->type               = 'message';
      $objSystemMessage->subType            = 'captured';
      $objSystemMessage->for                = [ 'player', 'hunter', 'management' ];
      $objSystemMessage->message            = '<p class="danger-text bold">ERWISCHT UND GEFANGEN</p>';
      $objSystemMessage->message           .= '<p class="danger-text">' .$objPlayer->get( 'name' ) . ' wurde leider erwischt und gefangen.</p>';
      $objSystemMessage->message           .= '<p class="danger-text">Herzlichen Glückwunsch der Hunter-Taskforce.</p>';
      $objSystemMessage->applies            = $strPlayerId;
      $objSystemMessage->appliesName        = $objPlayer->get( 'name' );
      $objSystemMessage->appliesRole        = 'player';
      $objSystemMessage->appliesRoleName    = 'Spieler';
      $objSystemMessage->cssClass           = 'danger-text';
      $objSystemMessage->appliesCount       = $intIndex + 1;
      $objSystemMessage->showMessageOnlyOne = false;
      $objSystemMessage->id                 = 'captured_' . $strPlayerId;
      $objSystemMessage->timestamp          = $objCapturedEntry->timestamp;

      array_push( $objState->systemMessages, $objSystemMessage );
    }

    return $objState;
  }

/**
 * This Method added the Gameplay State to the Gameplay State Object for the current Player for the Response.
 *
 * @access     private
 * @since      2026-06-05
 * @version    0.1.0
 *
 * @param      object     $objState    Gameplay State Object for the Response
 * @return     object     $objState    Gameplay State Object for the Response
 *
 * @example    $objState = $objGameplay->getGameplayState( $objState );
 *
*/
  private function getGameplayState( object $objState ) : object {
    $intNowTimestamp          = time();
    $objState->timestampStart = $this->startTimestamp;
    $objState->timestampEnd   = $this->endTimestamp;
    $objState->capturedPlayer = $this->gameplayObject->captured;
    $objState->isRunning      = $this->isRunning;

    if( $this->startTimestamp > $intNowTimestamp ) {
      $objState->gameState        = 'stopped';
    } else if( $this->endTimestamp < $intNowTimestamp ) {
      $objState->gameState        = 'stopped';
    } else {
      $objState->gameState        = 'running';
    }

    return $objState;
  }

/**
 * This Method added the Speed Hunt Informations to the Gameplay State Object for the current Player for the Response.
 *
 * @access     private
 * @since      2026-06-05
 * @version    0.1.0
 *
 * @param      object     $objState    Gameplay State Object for the Response
 * @return     object     $objState    Gameplay State Object for the Response
 *
 * @example    $objState = $objGameplay->getGameplaySpeedHunt( $objState );
 *
*/
  private function getGameplaySpeedHunt( object $objState ) : object {
    $objState->speedHuntState = new stdClass();

    if( isset( $this->gameplayObject->speedHunt ) ) {
      $objState->speedHuntState->speedHuntCount    = count(  $this->gameplayObject->speedHunt->timestamps );
      $objState->speedHuntState->speedHuntCountMax = $this->gameplayObject->speedPingCount;
      $objState->speedHuntState->playerId          = $this->gameplayObject->speedHunt->playerId;
      $objState->speedHuntState->playerName        = $this->gameplayObject->speedHunt->playerName;
      $objState->speedHuntState->state             = 'running';

      return $objState;
    }

    $intLastSpeedhunt = isset( $this->gameplayObject->lastSpeedHunt ) ? $this->gameplayObject->lastSpeedHunt : $this->gameplayObject->start;
    $intNextSpeedhunt = intval( $intLastSpeedhunt ) + ( intval( $this->gameplayObject->speedPingInterval ) * 60 );

    if( $intNextSpeedhunt > time() ) {
      $objState->speedHuntState->speedHuntCount    = -1;
      $objState->speedHuntState->speedHuntCountMax = -1;
      $objState->speedHuntState->state             = 'not available';
      $objState->speedHuntState->next              = $intNextSpeedhunt;

      return $objState;
    }

    $objState->speedHuntState->speedHuntCount    = 0;
    $objState->speedHuntState->speedHuntCountMax = $this->gameplayObject->speedPingCount;
    $objState->speedHuntState->state             = 'available';

    return $objState;
  }

/**
 * This method creates a default response and fills it with all the necessary information.
 *
 * @access     private
 * @since      2026-06-20
 * @version    0.1.0
 *
 * @param      object     $objRequestObject    The Request Object
 * @return     object     $objRequestObject    The Request Object
 *
 * @example    $objRequestObject = $objGameplay->response( $objRequestObject );
 *
*/
  private function response( object $objRequestObject ) : object {
    $objState                    = new stdClass();
    $objState                    = $this->getGameplayState( $objState );
    $objState                    = $this->silentHunt( $objState );
    $objState                    = $this->getGameplaySpeedHunt( $objState );
    $objState                    = $this->checkRulesAndAddSystemMessages( $objState );

    $objRequestObject->positions = $this->getAllPlayerPositions();
    $objRequestObject->state     = $objState;
    $objRequestObject->settings  = $this->gameSettings;
    $objRequestObject->gameRole  = $this->currentPlayerGameRole;
    $objRequestObject->messages  = $this->messages->messages;

    return $objRequestObject;
  }

/**
 * This Method set a Player as captured.
 *
 * @access     public
 * @since      2026-06-05
 * @version    0.1.0
 *
 * @param      object     $objRequestObject    The Request Object
 * @return     object     $objRequestObject    The Request Object
 *
 * @example    $objRequestObject = $objGameplay->captured( $objRequestObject );
 *
*/
  public function captured( object $objRequestObject ) : object {
    if( ! $this->isRunning ) return $this->stopped( $objRequestObject );

    $objCaptured             = new stdClass();

    $objCaptured->timestamp  = time();
    $objCaptured->playerId   = $objRequestObject->playerId;
    $objCaptured->hunterIds  = $objRequestObject->hunterIds;

    array_push( $this->gameplayObject->captured, $objCaptured );

    if( isset( $this->gameplayObject->speedHunt ) && $this->gameplayObject->speedHunt->playerId == $objRequestObject->playerId ) {
      $this->gameplayObject->lastSpeedHunt = time();

      array_push( $this->gameplayObject->speedHunts, $this->gameplayObject->speedHunt );
      unset( $this->gameplayObject->speedHunt );
    }

    $this->saveGameplay();

    return $this->response( $objRequestObject );
  }

/**
 * This Method controls the Speed Hunts and returns the State of the Speed Hunts.
 *
 * @access     public
 * @since      2026-06-05
 * @version    0.1.0
 *
 * @param      object     $objRequestObject    The Request Object
 * @return     object     $objRequestObject    The Request Object
 *
 * @example    $objRequestObject = $objGameplay->speedHunt( $objRequestObject );
 *
*/
  public function speedHunt( object $objRequestObject ) : object {
    if( ! $this->isRunning ) return $this->stopped( $objRequestObject );
    if( ! isset( $this->gameplayObject->speedHunts ) ) $this->gameplayObject->speedHunts = [];
    if( ! isset( $this->gameplayObject->speedHunt ) ) {
      $objPlayer                                   = new Player( $objRequestObject->speedHuntPlayerId );
      $this->gameplayObject->speedHunt             = new stdClass();
      $this->gameplayObject->speedHunt->timestamps = [];
      $this->gameplayObject->speedHunt->playerId   = $objRequestObject->speedHuntPlayerId;
      $this->gameplayObject->speedHunt->playerName = $objPlayer->get( 'name' );
    }

    array_push( $this->gameplayObject->speedHunt->timestamps, time() );

    $intSpeedHuntCount                                                  = count( $this->gameplayObject->speedHunt->timestamps );
    $strSpeedHuntPlayerId                                               = $this->gameplayObject->speedHunt->playerId;
    $objPlayer                                                          = new Player( $strSpeedHuntPlayerId );
    $this->gameplayObject->silentHunt->tracking->$strSpeedHuntPlayerId  = $this->getPlayerPosition( $objPlayer, 1 );

    $objRequestObject                                                   = $this->response( $objRequestObject );

    if( $intSpeedHuntCount >= $this->gameplayObject->speedPingCount ) {
      $this->gameplayObject->lastSpeedHunt = time();

      array_push( $this->gameplayObject->speedHunts, $this->gameplayObject->speedHunt );
      unset( $this->gameplayObject->speedHunt );
    }

    $this->saveGameplay();

    return $objRequestObject;
  }

/**
 * This Method controls and adds the Player Tracking for the current Player.
 *
 * @access     public
 * @since      2026-06-05
 * @version    0.1.0
 *
 * @param      object     $objRequestObject    The Request Object
 * @return     object     $objRequestObject    The Request Object
 *
 * @example    $objRequestObject = $objGameplay->track( $objRequestObject );
 *
*/
  public function track( object $objRequestObject ) : object {
    if( ! $this->isRunning ) return $this->stopped( $objRequestObject );

    $arrCapturedIds = array_map( fn( $obj ) => $obj->playerId, $this->gameplayObject->captured );

    if( ! in_array( $this->currentPlayer->id(), $arrCapturedIds ) ) {
      $this->addTracking(
        $objRequestObject->lat,
        $objRequestObject->lng,
        intval( $objRequestObject->precision ),
        intval( $objRequestObject->steps ),
        $objRequestObject->outOfPlayingField,
        intval( $objRequestObject->batteryLevel ),
        $objRequestObject->batteryIsCharging
      );
    }

    return $this->response( $objRequestObject );
  }

/**
 * This Method controls a new Message from the current Player and adds the Message Queue for the Response.
 *
 * @access     public
 * @since      2026-06-05
 * @version    0.1.0
 *
 * @param      object     $objRequestObject    The Request Object
 * @return     object     $objRequestObject    The Request Object
 *
 * @example    $objRequestObject = $objGameplay->message( $objRequestObject );
 *
*/
  public function message( object $objRequestObject ) : object {
    if( $objRequestObject->message == '' ) {
      $objRequestObject->messages = $this->messages->messages;

      return $objRequestObject;
    }

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

/**
 * This Method sets the required Response Object if the Game is stopped.
 *
 * @access     private
 * @since      2026-06-05
 * @version    0.1.0
 *
 * @param      object     $objRequestObject    The Request Object
 * @return     object     $objRequestObject    The Request Object
 *
 * @example    $objRequestObject = $objGameplay->stopped( $objRequestObject );
 *
*/
  private function stopped( object $objRequestObject ) : object {
    $objState                                    = new stdClass();
    $objState                                    = $this->getGameplayState( $objState );
    $objState                                    = $this->silentHunt( $objState );

    $objState->speedHuntState                    = new stdClass();
    $objState->speedHuntState->speedHuntCount    = 0;
    $objState->speedHuntState->speedHuntCountMax = $this->gameplayObject->speedPingCount;
    $objState->speedHuntState->state             = 'not available';

    $objState->systemMessages                    = [];

    $objState                                    = $this->checkRulesAndAddSystemMessages( $objState );
    $objRequestObject->positions                 = $this->getAllPlayerPositions();
    $objRequestObject->state                     = $objState;
    $objRequestObject->settings                  = $this->gameSettings;
    $objRequestObject->gameRole                  = $this->currentPlayerGameRole;
    $objRequestObject->messages                  = $this->messages->messages;

    return $objRequestObject;
  }

/**
 * This Method returns all Gameplay Data with Tracking Data and Messages for Statistics.
 *
 * @access     public
 * @since      2026-06-05
 * @version    0.1.0
 *
 * @param      object     $objRequestObject    The Request Object
 * @return     object     $objRequestObject    The Request Object
 *
 * @example    $objRequestObject = $objGameplay->statistic( $objRequestObject );
 *
*/
  public function statistic( object $objRequestObject )  : object {
    $arrRoles                    = static::GAMEROLES;
    $objState                    = new stdClass();
    $objState                    = $this->checkRulesAndAddSystemMessages( $objState );

    $objRequestObject->state     = $objState;
    $objRequestObject->positions = new stdClass();
    $objRequestObject->messages  = $this->messages->messages;
    $objRequestObject->gameplay  = $this->gameplayObject;
    $objRequestObject->settings  = $this->gameSettings;
    $objRequestObject->gameRole  = $this->currentPlayerGameRole;

    foreach( $arrRoles as $strRoleId => $strRoleName ) {
      $objRequestObject->positions->$strRoleId = new stdClass();
      $arrPlayer = $objRequestObject->gameplay->$strRoleId;

      foreach( $arrPlayer as $objPlayerEntry ) {
        $strPlayerId = $objPlayerEntry->id;

        if( ! file_exists( $this->gameplayPath . 'tracking_' . $strPlayerId . '.json' ) ) continue;

        $objTracking = BaseObject::loadFileDeCrypted( $this->gameplayPath . 'tracking_' . $strPlayerId . '.json' );
        $objRequestObject->positions->$strRoleId->$strPlayerId = $objTracking->tracking;
      }
    }

    return $objRequestObject;
  }
}

// EOF
