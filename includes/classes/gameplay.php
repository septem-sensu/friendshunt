<?php

declare( strict_types = 1 );

include_once ( __DIR__ . '/../classes/baseObject.php' );
include_once ( __DIR__ . '/../classes/game.php' );

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
    'asPlayerDistanceDrived',
    'asHunterDistanceDrived',
    'asManagementDistanceDrived'
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
 * @param      player   $objCurrentPlayer    Object Id of the Game
 * @return     void
 *
 * @example    $objGameplay = new Gameplay( $strObjectId, objCurrentPlayer );
 *
*/
  public function __construct( string $strObjectId, player $objCurrentPlayer ) {
    $this->id               = $strObjectId;
    $this->currentPlayer    = $objCurrentPlayer;
    $this->generateTestData = true;
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
 * This Method is the init the Gameplay, set all Properties and create the Directories and Files for the Game.
 *
 * @access     private
 * @since      2026-06-05
 * @version    0.1.0
 *
 * @return     void
 *
 * @example    $this->init();
 * @example    $objGameplay->init();
 *
*/
  private function init() : void {
    $this->gameplayPath   = __DIR__ . '/../files/game/' . $this->id . '/';
    $this->gameplayObject = BaseObject::loadFileDeCrypted( $this->gameplayPath . 'gameplay.json' );
    $this->fields         = $this->loadFileDeCrypted( $this::FILEPATHJSON . 'fields/gameplay.json' );

    if( ! isset( $this->gameplayObject->violationsOfTheRules ) ) {
      $this->gameplayObject->violationsOfTheRules = new stdClass();
      $this->saveGameplay();
    }

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
      $objMessages           = new stdClass();
      $objMessages->messages = [];

      $this->saveFileEncrypted( $this->gameplayPath . 'messages.json', $objMessages );
    }

    $this->messages                   = $this->loadFileDeCrypted( $this->gameplayPath . 'messages.json' );
    $this->currentPlayerTracking      = $this->loadFileDeCrypted( $this->gameplayPath . 'tracking_' . $this->currentPlayer->id() . '.json' );
    $this->gameSettings               = $this->getGameSettings();
    $this->gameplayRoles              = new stdClass();
    $this->gameplayRoles->player      = 'Spieler';
    $this->gameplayRoles->hunter      = 'Jäger';
    $this->gameplayRoles->management  = 'Spielleitung';
    $this->startTimestamp             = $this->gameSettings->start;
    $this->endTimestamp               = $this->startTimestamp + ( $this->gameSettings->duration * 60 * 60 );
    $this->isRunning                  = time() > $this->startTimestamp && time() < $this->endTimestamp ? true : false;
    $this->gameSettings->end          = $this->endTimestamp;

    $this->transferStatistics();

    return;
  }

/**
 * This Method generate the Statistics and set the Gameplay Values at the Player Objects.
 * This Method is called by the end of the Game by a Administrator from the init Method.
 *
 * @access     private
 * @since      2026-06-05
 * @version    0.1.0
 *
 * @return     void
 *
 * @example    $this->transferStatistics();
 * @example    $objGameplay->transferStatistics();
 *
*/
  private function transferStatistics() {
    if( isset( $this->gameplayObject->isTransfered ) && $this->gameplayObject->isTransfered == true ) return;
    if( $this->currentPlayer->get( 'role' ) != 'administrator' ) return;

    $arrGameplayRoles          = [ 'player' => 'Player', 'hunter' => 'Hunter', 'management' => 'Management' ];
    $arrPlayerProperties       = $this::STATISTICPROPERTIES;
    $arrSpeedHunts             = isset( $this->gameplayObject->speedHunts ) ? $this->gameplayObject->speedHunts : [];
    $arrCaptured               = isset( $this->gameplayObject->captured ) ? $this->gameplayObject->captured : [];
    $arrMessages               = isset( $this->messages->messages ) ? $this->messages->messages : [];
    $intTimestampNow           = time();
    $intViolationOfTheRulesAll = 0;

    if( $intTimestampNow < $this->endTimestamp ) return;

    foreach( $arrGameplayRoles as $strGamplayRoleId => $strGameplayRoleName ) {
      $arrPlayerGameplayObjects = $this->gameplayObject->$strGamplayRoleId;

      for( $i = 0; $i < count( $arrPlayerGameplayObjects ); $i++ ) {
        $strPlayerId            = $arrPlayerGameplayObjects[ $i ]->id;
        $objTracking            = file_exists( $this->gameplayPath . 'tracking_' . $strPlayerId . '.json' ) ? $this->loadFileDeCrypted( $this->gameplayPath . 'tracking_' . $strPlayerId . '.json' ) : new stdClass();
        $arrTracking            = isset( $objTracking->tracking ) ? $objTracking->tracking : [];
        $objPlayer              = new Player( $strPlayerId );
        $objPlaySetObject       = new stdClass();
        $intSteps               = 0;
        $intDistance            = 0;
        $intDistanceDrived      = 0;
        $intViolationOfTheRules = 0;
        $intCountSpeedHunts     = 0;
        $intCountCaptured       = 0;
        $intCountMessages       = 0;
        $intCountMessagesAll    = 0;

        for( $j = 0; $j < count( $arrPlayerProperties ); $j++ ) {
          $strPlayerProperty = $arrPlayerProperties[ $j ];
          if( strpos( $strPlayerProperty, $strGameplayRoleName ) === false ) continue;
          $objPlaySetObject->$strPlayerProperty = intval( $objPlayer->get( $strPlayerProperty ) );
        }

        for( $j = 0; $j < count( $arrTracking ); $j++ ) {
          $intSteps += $arrTracking[ $j ]->steps;

          if( isset( $arrTracking[ $j ]->outOfPlayingField ) && $arrTracking[ $j ]->outOfPlayingField && $strGamplayRoleId != 'management' ) {
            $intViolationOfTheRules++;
            $intViolationOfTheRulesAll++;
          }

          if( $arrTracking[ $j ]->isDrived ) {
            $intDistanceDrived += $this->calcDistance( $arrTracking[ $j ]->lat, $arrTracking[ $j ]->lng, $arrTracking[ $j - 1 ]->lat, $arrTracking[ $j - 1 ]->lng );
          }

          if( $j > count( $arrTracking ) - 2 ) continue;

          $intDistance += $this->calcDistance( $arrTracking[ $j ]->lat, $arrTracking[ $j ]->lng, $arrTracking[ $j + 1 ]->lat, $arrTracking[ $j + 1 ]->lng );
        }

        if( $strGamplayRoleId == 'hunter' || $strGamplayRoleId == 'management' ) {
          $intCountSpeedHunts = count( $arrSpeedHunts );
        } else {
          for( $j = 0; $j < count( $arrSpeedHunts ); $j++ ) {
            $intCountSpeedHunts = $arrSpeedHunts[ $j ]->playerId == $strPlayerId ? $intCountSpeedHunts + 1 : $intCountSpeedHunts;
          }
        }

        if( $strGamplayRoleId == 'management' ) {
          $intCountCaptured = count( $arrCaptured );
        } else {
          for( $j = 0; $j < count( $arrCaptured ); $j++ ) {
            if( $strGamplayRoleId == 'hunter' ) {
              $intCountCaptured = in_array( $strPlayerId, $arrCaptured[ $j ]->hunterIds ) ? $intCountCaptured + 1 : $intCountCaptured;
            } else {
              $intCountCaptured = $arrCaptured[ $j ]->playerId == $strPlayerId ? $intCountCaptured + 1 : $intCountCaptured;
            }
          }
        }

        $intViolationOfTheRules = $strGamplayRoleId == 'management' ? $intViolationOfTheRulesAll : $intViolationOfTheRules;

        for( $j = 0; $j < count( $arrMessages ); $j++ ) {
          $intCountMessagesAll++;
          if( $strPlayerId != $arrMessages[ $j ]->playerId ) continue;
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
        $objPlaySetObject       = $this->setStatisticProperty( $objPlaySetObject, $strGameplayRoleName, 'DistanceDrived', $intDistanceDrived );

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
 * @return     object   $objSetObject   The Result Object with new seted Property
 *
 * @example    objSetObject = $this->setStatisticProperty( $objSetObject, $strRoleName, $strProperty, $floatValue );
 * @example    objSetObject = $objGameplay->setStatisticProperty( $objSetObject, $strRoleName, $strProperty, $floatValue );
 *
*/
  private function setStatisticProperty( object $objSetObject, string $strRoleName, string $strProperty, float $floatValue  ) : object {
    $strProperty          = 'as' . $strRoleName . $strProperty;
    $arrPlayerProperties  = $this::STATISTICPROPERTIES;

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
 * @param      bool    $boolOutOfPlayingField  The count of Steps that have been run since the last Tracking
 * @param      int     $intBatteryLevel        The current Battery Level
 * @param      bool    $boolBatteryIsCharching The is the Battery current charging
 * @return     void
 *
 * @example    $this->addTracking( $floatLat, $floatLng, $intPrecision, $intSteps, $boolOutOfPlayingField, $intBatteryLevel, $boolBatteryIsCharching );
 * @example    $objGameplay->addTracking( $floatLat, $floatLng, $intPrecision, $intSteps, $boolOutOfPlayingField, $intBatteryLevel, $boolBatteryIsCharching );
 *
*/
  private function addTracking( float $floatLat, float $floatLng, int $intPrecision, int $intSteps, bool $boolOutOfPlayingField, int $intBatteryLevel, bool $boolBatteryIsCharching ) : void {
    $objTracking                     = new stdClass();
    $objTracking->lat                = $floatLat;
    $objTracking->lng                = $floatLng;
    $objTracking->precision          = $intPrecision;
    $objTracking->steps              = $intSteps;
    $objTracking->outOfPlayingField  = $boolOutOfPlayingField;
    $objTracking->batteryLevel       = $intBatteryLevel;
    $objTracking->batteryIsCharching = $boolBatteryIsCharching;
    $objTracking->isDrived           = $this->isDrived( $floatLat, $floatLng );
    $objTracking->timestamp          = time();

    array_push( $this->currentPlayerTracking->tracking, $objTracking );

    $this->saveFileEncrypted( $this->gameplayPath . 'tracking_' . $this->currentPlayer->id() . '.json', $this->currentPlayerTracking );

    if( $this->generateTestData ) {
      foreach( $this->testDataSource as $strTestPlayerId => $arrTestPlayerData ) {
        $objTestPlayerTracking = null;

        if( ! file_exists( $this->gameplayPath . 'tracking_' . $strTestPlayerId . '.json' ) ) {
          $objTestPlayerTracking           = new stdClass();
          $objTestPlayerTracking->tracking = [];

          $this->saveFileEncrypted( $this->gameplayPath . 'tracking_' . $strTestPlayerId . '.json', $objTestPlayerTracking );
        } else {
          $objTestPlayerTracking = $this->loadFileDeCrypted( $this->gameplayPath . 'tracking_' . $strTestPlayerId . '.json' );
        }

        $objTrackingClone      = clone $objTracking;
        $objTrackingClone->lat = $objTrackingClone->lat + $arrTestPlayerData[ 'latShift' ];
        $objTrackingClone->lng = $objTrackingClone->lng + $arrTestPlayerData[ 'lngShift' ];

        array_push( $objTestPlayerTracking->tracking, $objTrackingClone );

        $this->saveFileEncrypted( $this->gameplayPath . 'tracking_' . $strTestPlayerId . '.json', $objTestPlayerTracking );
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
 * @return     bool    $boolIsDrived           Is the Player the distance drived or not
 *
 * @example    $boolIsDrive = $this->isDrived( $floatLat, $floatLng );
 * @example    $boolIsDrive = $objGameplay->isDrived( $floatLat, $floatLng );
 *
*/
  private function isDrived( float $floatLat, float $floatLng ) : bool {
    if( count( $this->currentPlayerTracking->tracking ) < 1 ) return false;

    $arrLastPosition   = array_slice( $this->currentPlayerTracking->tracking, -1 );
    $floatTime         = ( $arrLastPosition[ 0 ]->timestamp - time() ) / 60 / 60;
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
 * @example    $objGameSettings = $this->getGameSettings();
 * @example    $objGameSettings = $objGameplay->getGameSettings();
 *
*/
  public function getGameSettings() : object {
    $objGameConfiguration                = clone $this->gameplayObject;
    $objGameConfiguration->showReplay    = $this->getConfig()->showReplay;
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

    for( $i = 0; $i < count( $this->gameplayObject->player ); $i++ ) {
      array_push( $objGameConfiguration->playerIds, $this->gameplayObject->player[ $i ]->id );
    }

    for( $i = 0; $i < count( $this->gameplayObject->hunter ); $i++ ) {
      $objHunter       = new stdClass();
      $objHunter->id   = $this->gameplayObject->hunter[ $i ]->id;
      $objHunter->name = $this->gameplayObject->hunter[ $i ]->name;

      array_push( $objGameConfiguration->hunter, $objHunter );
      array_push( $objGameConfiguration->hunterIds, $this->gameplayObject->hunter[ $i ]->id );
    }

    for( $i = 0; $i < count( $this->gameplayObject->management ); $i++ ) {
      array_push( $objGameConfiguration->managementIds, $this->gameplayObject->management[ $i ]->id );
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
 * @example    $floatDistance = $this->calcDistance( $floatLat1, $floatLng1, $floatLat2, $floatLng2 );
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
 * @example    $objDistances = $this->calcPlayerDistances( $mixPlayer );
 * @example    $objDistances = $objGameplay->calcPlayerDistances( $mixPlayer );
 *
*/
  public function calcPlayerDistances( string | Player $mixPlayer ) : object {
    $objDistances           = new stdClass();
    $objDistances->steps    = 0;
    $objDistances->distance = 0;
    $strPlayerId            = is_object( $mixPlayer ) ? $mixPlayer->id() : $mixPlayer;
    $objTracking            = $this->loadFileDeCrypted( $this->gameplayPath . 'tracking_' . $strPlayerId . '.json' );
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
 * This Method returs a Standard Object with the Position Coordinates from all Players.
 *
 * @access     private
 * @since      2026-06-05
 * @version    0.1.0
 *
 * @return     object   $objPositions    Standard Object with the Position Coordinates from all Players
 *
 * @example    $objPositions = $this->getAllPlayerPositions();
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

/**
 * This Method returs a Standard Object with the Position Coordinates from one Player.
 *
 * @access     private
 * @since      2026-06-05
 * @version    0.1.0
 *
 * @param      Player     $objPlayer       Player Object
 * @param      int        $intCount        Count of the last Trackings do you get
 * @return     object     $objPositions    Standard Object with the Position Coordinates from one Player
 *
 * @example    $objPositions = $this->getPlayerPosition( $objPlayer, $intCount );
 * @example    $objPositions = $objGameplay->getPlayerPosition( $objPlayer, $intCount );
 *
*/
  private function getPlayerPosition( Player $objPlayer, int $intCount ) : object {
    $objPositions            = new stdClass();
    $objPositions->name      = $objPlayer->get( 'name' );
    $objPositions->id        = $objPlayer->id();
    $objPositions->timestamp = time();
    $objTracking             = file_exists( $this->gameplayPath . 'tracking_' . $objPlayer->id() . '.json' ) ? $this->loadFileDeCrypted( $this->gameplayPath . 'tracking_' . $objPlayer->id() . '.json' ) : new stdClass();
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
 * @example    $this->saveGameplay();
 * @example    $objGameplay->saveGameplay();
 *
*/
  private function saveGameplay() : void {
    BaseObject::saveFileEncrypted( $this->gameplayPath . 'gameplay.json', $this->gameplayObject );

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
 * @example    $this->saveMessages();
 * @example    $objGameplay->saveMessages();
 *
*/
  private function saveMessages() : void {
    BaseObject::saveFileEncrypted( $this->gameplayPath . 'messages.json', $this->messages );

    return;
  }

/**
 * This Method controlls a silent Hunt from the Current Player and added to the Response State Object.
 *
 * @access     private
 * @since      2026-06-05
 * @version    0.1.0
 *
 * @param      object     $objState    Gameplay State Object for the Response
 * @return     object     $objState    Gameplay State Object for the Response
 *
 * @example    $objState = $this->silentHunt( $objState );
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

      for( $i = 0; $i < count( $this->gameplayObject->player ); $i++ ) {
        $strPlayerId                            = $this->gameplayObject->player[ $i ]->id;
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
      for( $i = 0; $i < count( $this->gameplayObject->player ); $i++ ) {
        $strPlayerId  = $this->gameplayObject->player[ $i ]->id;
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
 * @example    $objState = $this->checkRulesAndAddSystemMessages( $objState );
 * @example    $objState = $objGameplay->checkRulesAndAddSystemMessages( $objState );
 *
*/
  private function checkRulesAndAddSystemMessages( object $objState ) : object {
    if( ! isset( $objState->systemMessages ) ) $objState->systemMessages = [];

    $intNowTimestamp   = time();
    $arrCaptured       = $this->gameSettings->captured;

    // Welcoming and bidding farewell to the players
    if( $intNowTimestamp > $this->startTimestamp && $intNowTimestamp <  $this->startTimestamp + 600 ) {
      $objSystemMessage                     = new stdClass();
      $objSystemMessage->type               = 'friendliness';
      $objSystemMessage->subType            = 'welcoming';
      $objSystemMessage->for                = [ 'player', 'hunter', 'management' ];
      $objSystemMessage->message            = '<p class="bold success-text">💥 DIE JAGD ERÖFFNET 💥</p>';
      $objSystemMessage->message           .= '<p>Lagezentrum online. Satellitenverbindung steht. Die Spielleitung begrüßt die Hunter-Taskforce und die Gejagten. Der Countdown läuft unerbittlich – die Jagd ist offiziell eröffnet! Möge die Ausdauer mit euch sein.</p>';
      $objSystemMessage->showMessageOnlyOne = true;
      $objSystemMessage->id                 = 'gameStartMessage';
      $objSystemMessage->timestamp          = $intNowTimestamp;

      array_push( $objState->systemMessages, $objSystemMessage );
    } else if( $intNowTimestamp > $this->endTimestamp && $intNowTimestamp <  $this->endTimestamp +  3600 ) {
      $arrExitMeetLocation                  = [ 'in der Kneipe', 'im Biergarten', 'in der Gaststätte', 'im Wirtshaus', 'im Café', 'in der Bar' ];

      foreach( $this->gameplayRoles as $strGameplayRole => $strGameplayRoleName ) {
        $arrObjects = $this->gameplayObject->$strGameplayRole;

        for( $i = 0; $i < count( $arrObjects ); $i++ ) {
          array_push( $arrExitMeetLocation, 'bei ' . $arrObjects[ $i ]->name );
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

    foreach( $this->gameplayRoles as $strGameplayRole => $strGameplayRoleName ) {
      $arrObjects = $this->gameplayObject->$strGameplayRole;

      for( $i = 0; $i < count( $arrObjects ); $i++ ) {
        $strPlayerId        = $arrObjects[ $i ]->id;
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
          $objSystemMessage->message           .= $strGameplayRole == 'player' ? '<p class="danger-text">Das Tracking für diesen Spieler wurde aktuallisiert.<p>' : '<p class="danger-text">' . $objPlayer->get( 'name' ) . ' muss ein Bier ausgeben.<p>';
          $objSystemMessage->applies            = $strPlayerId;
          $objSystemMessage->appliesName        = $objPlayer->get( 'name' );
          $objSystemMessage->appliesRole        = $strGameplayRole;
          $objSystemMessage->appliesRoleName    = $strGameplayRoleName;
          $objSystemMessage->cssClass           = 'danger-text';
          $objSystemMessage->appliesCount       = $i + 1;
          $objSystemMessage->showMessageOnlyOne = false;
          $objSystemMessage->id                 = 'outOfPlayingField_' . $strPlayerId . '_' . $objPosition->position[ 0 ]->timestamp;
          $objSystemMessage->timestamp          = $objPosition->position[ 0 ]->timestamp;

          array_push( $objState->systemMessages, $objSystemMessage );

          if( ! isset( $this->gameplayObject->violationsOfTheRules->$strPlayerId ) ) $this->gameplayObject->violationsOfTheRules->$strPlayerId = [];

          array_push( $this->gameplayObject->violationsOfTheRules->$strPlayerId, $objPosition->position[ 0 ]->timestamp );

          $this->saveGameplay();
        }

        // Violations Of The Rules - Vehicle used
        if( $objPosition->position[ 0 ]->isDrived && $this->gameplayRoles == 'player' && $this->gameSettings->sanctionForVehicleUse == '1' ) {

          $this->gameplayObject->silentHunt->tracking->$strPlayerId = $objPosition;

          $objSystemMessage                     = new stdClass();
          $objSystemMessage->type               = 'violationoftherules';
          $objSystemMessage->subType            = 'vehicleused';
          $objSystemMessage->for                = [ 'player', 'hunter', 'management' ];
          $objSystemMessage->message            = '<p class="danger-text bold">REGELVERSTOSS</p>';
          $objSystemMessage->message           .= '<p class="danger-text">Ein Spieler hat unerlaubt ein Fahrzeug benutzt.</p>';
          $objSystemMessage->message           .= '<p class="danger-text">Das Tracking für diesen Spieler wurde aktuallisiert.<p>';
          $objSystemMessage->applies            = $strPlayerId;
          $objSystemMessage->appliesName        = $objPlayer->get( 'name' );
          $objSystemMessage->appliesRole        = 'player';
          $objSystemMessage->appliesRoleName    = 'Spieler';
          $objSystemMessage->cssClass           = 'danger-text';
          $objSystemMessage->appliesCount       = $i + 1;
          $objSystemMessage->showMessageOnlyOne = false;
          $objSystemMessage->id                 = 'usedVehicle_' . $strPlayerId . '_' . $objPosition->position[ 0 ]->timestamp;
          $objSystemMessage->timestamp          = $objPosition->position[ 0 ]->timestamp;

          array_push( $objState->systemMessages, $objSystemMessage );

          if( ! isset( $this->gameplayObject->violationsOfTheRules->$strPlayerId ) ) $this->gameplayObject->violationsOfTheRules->$strPlayerId = [];

          array_push( $this->gameplayObject->violationsOfTheRules->$strPlayerId, $objPosition->position[ 0 ]->timestamp );

          $this->saveGameplay();
        }

        // Speed Hunt is Running
        if( isset( $this->gameplayObject->speedHunt ) && $this->gameplayObject->speedHunt->playerId == $strPlayerId ) {
          $intLastPingTimestamp                 = count( $this->gameplayObject->speedHunt->timestamps ) > 0 ? end( $this->gameplayObject->speedHunt->timestamps ) : time();

          $objSystemMessage                     = new stdClass();
          $objSystemMessage->type               = 'speedhunt';
          $objSystemMessage->subType            = 'isrunning';
          $objSystemMessage->for                = [ 'player', 'hunter', 'management' ];
          $objSystemMessage->message            = '<p class="danger-text bold">SPEEDHUNT LÄUFT</p>';
          $objSystemMessage->message           .= '<p class="danger-text">Aktuell läuft ein Speedhunt auf einen Spieler.</p>';
          $objSystemMessage->message           .= '<p class="danger-text">Ping ' . count(  $this->gameplayObject->speedHunt->timestamps ) . ' von ' . $this->gameplayObject->speedPingCount . '</p>';
          $objSystemMessage->appliesRole        = 'player';
          $objSystemMessage->appliesRoleName    = 'Spieler';
          $objSystemMessage->cssClass           = 'danger-text';
          $objSystemMessage->appliesCount       = $i + 1;
          $objSystemMessage->showMessageOnlyOne = false;
          $objSystemMessage->id                 = 'speedhunt_' . $this->gameplayObject->speedHunt->playerId . '_' . $intLastPingTimestamp;
          $objSystemMessage->timestamp          = $intLastPingTimestamp;

          array_push( $objState->systemMessages, $objSystemMessage );
        }

      }
    }

    // A Player was captured
    for( $i = 0; $i < count( $arrCaptured ); $i++ ) {
      if( $intNowTimestamp > $arrCaptured[ $i ]->timestamp + 1200 ) continue;

      $strPlayerId                          = $arrCaptured[ $i ]->playerId;
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
      $objSystemMessage->appliesCount       = $i + 1;
      $objSystemMessage->showMessageOnlyOne = false;
      $objSystemMessage->id                 = 'caputured_' . $strPlayerId;
      $objSystemMessage->timestamp          = $arrCaptured[ $i ]->timestamp;

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
 * @example    $objState = $this->getGameplayState( $objState );
 * @example    $objState = $objGameplay->getGameplayState( $objState );
 *
*/
  private function getGameplayState( object $objState ) : object {
    $intNowTimestamp          = time();
    $objState->timestampStart = $this->startTimestamp;
    $objState->timestampEnd   = $this->endTimestamp;
    $objState->capturedPlayer = $this->gameSettings->captured;
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
 * @example    $objState = $this->getGameplaySpeedHunt( $objState );
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
 * This Method set a Player as captured.
 *
 * @access     public
 * @since      2026-06-05
 * @version    0.1.0
 *
 * @param      object     $objRequestObject    The Request Object
 * @return     object     $objRequestObject    The Request Object
 *
 * @example    $objRequestObject = $this->captured( $objRequestObject );
 * @example    $objRequestObject = $objGameplay->captured( $objRequestObject );
 *
*/
  public function captured( object $objRequestObject ) : object {
    if( ! $this->isRunning ) return $this->stopped( $objRequestObject );

    $objCaptured             = new stdClass();

    $objCaptured->timestamp  = time();
    $objCaptured->playerId   = $objRequestObject->playerId;
    $objCaptured->hunterIds  = $objRequestObject->hunterIds;

    if( ! isset( $this->gameplayObject->captured ) ) $this->gameplayObject->captured = [];

    array_push( $this->gameplayObject->captured, $objCaptured );

    if( isset( $this->gameplayObject->speedHunt ) && $this->gameplayObject->speedHunt->playerId == $objRequestObject->playerId ) {
      $this->gameplayObject->lastSpeedHunt = time();

      array_push( $this->gameplayObject->speedHunts, $this->gameplayObject->speedHunt );
      unset( $this->gameplayObject->speedHunt );
    }

    $this->saveGameplay();

    return $objRequestObject;
  }

/**
 * This Method controlls the Speed Hunts and returns the State of the Speed Hunts.
 *
 * @access     public
 * @since      2026-06-05
 * @version    0.1.0
 *
 * @param      object     $objRequestObject    The Request Object
 * @return     object     $objRequestObject    The Request Object
 *
 * @example    $objRequestObject = $this->speedHunt( $objRequestObject );
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

    $objState                                                           = new stdClass();
    $objState                                                           = $this->getGameplayState( $objState );
    $objState                                                           = $this->silentHunt( $objState );
    $objState                                                           = $this->getGameplaySpeedHunt( $objState );
    $objState                                                           = $this->checkRulesAndAddSystemMessages( $objState );
    $objRequestObject->positions                                        = $this->getAllPlayerPositions();
    $objRequestObject->state                                            = $objState;
    $objRequestObject->settings                                         = $this->gameSettings;
    $objRequestObject->gameRole                                         = $this->currentPlayerGameRole;
    $objRequestObject->messages                                         = $this->messages->messages;

    if( $intSpeedHuntCount >= $this->gameplayObject->speedPingCount ) {
      $this->gameplayObject->lastSpeedHunt = time();

      array_push( $this->gameplayObject->speedHunts, $this->gameplayObject->speedHunt );
      unset( $this->gameplayObject->speedHunt );
    }

    $this->saveGameplay();

    return $objRequestObject;
  }

/**
 * This Method controlls and adds the Player Tracking for the current Player.
 *
 * @access     public
 * @since      2026-06-05
 * @version    0.1.0
 *
 * @param      object     $objRequestObject    The Request Object
 * @return     object     $objRequestObject    The Request Object
 *
 * @example    $objRequestObject = $this->track( $objRequestObject );
 * @example    $objRequestObject = $objGameplay->track( $objRequestObject );
 *
*/
  public function track( object $objRequestObject ) : object {
    if( ! $this->isRunning ) return $this->stopped( $objRequestObject );

    $this->addTracking( $objRequestObject->lat, $objRequestObject->lng, intval( $objRequestObject->precision ), intval( $objRequestObject->steps ), $objRequestObject->outOfPlayingField, intval( $objRequestObject->batteryLevel ), $objRequestObject->batteryIsCharging );

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
 * This Method controlls a new Message from the current Player and adds the Message Queue for the Response.
 *
 * @access     public
 * @since      2026-06-05
 * @version    0.1.0
 *
 * @param      object     $objRequestObject    The Request Object
 * @return     object     $objRequestObject    The Request Object
 *
 * @example    $objRequestObject = $this->message( $objRequestObject );
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
 * This Method set the requirered Response Object if the Game is stopped.
 *
 * @access     private
 * @since      2026-06-05
 * @version    0.1.0
 *
 * @param      object     $objRequestObject    The Request Object
 * @return     object     $objRequestObject    The Request Object
 *
 * @example    $objRequestObject = $this->stopped( $objRequestObject );
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
 * @example    $objRequestObject = $this->statistic( $objRequestObject );
 * @example    $objRequestObject = $objGameplay->statistic( $objRequestObject );
 *
*/
  public function statistic( object $objRequestObject )  : object {
    $arrRoles = $this::GAMEROLES;

    $objRequestObject->positions = new stdClass();
    $objRequestObject->messages  = $this->messages->messages;
    $objRequestObject->gameplay  = $this->gameplayObject;

    foreach( $arrRoles as $strRoleId => $strRoleName ) {
      $objRequestObject->positions->$strRoleId = new stdClass();
      $arrPlayer = $objRequestObject->gameplay->$strRoleId;

      for( $i = 0; $i < count( $arrPlayer ); $i++ ) {
        $strPlayerId = $arrPlayer[ $i ]->id;

        if( ! file_exists( $this->gameplayPath . 'tracking_' . $strPlayerId . '.json' ) ) continue;

        $objTracking = $this->loadFileDeCrypted( $this->gameplayPath . 'tracking_' . $strPlayerId . '.json' );
        $objRequestObject->positions->$strRoleId->$strPlayerId = $objTracking->tracking;
      }
    }

    return $objRequestObject;
  }
}

// EOF
