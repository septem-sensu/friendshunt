/**
 * Statistic Package for the Friends Hunt App.
 *
 * This Package represents the Statistic Package for the Friends Hunt App with his Functions.
 *
 * @public
 * @module        statistics.js
 * @namespace     friendshunt
 * @access        public
 * @author        Markus Götz <info@septem-sensu.de>
 * @since         2026-06-06
 * @version       0.1.0
 * @copyright     2026 Markus Götz <info@septem-sensu.de>
 *
*/

window[ appAlias ].methods.statistics = window[ appAlias ].methods.statistics || {}

/**
 * This Function called the Ajax Request to the Server to get the Gameplay Values for the Statistics.
 * The Callback Function for this Function is generateGameStatistics.
 *
 * @function
 * @public
 * @name       getGameStatistics
 * @memberof   friendshunt
 * @access     public
 * @since      2026-06-06
 * @version    0.1.0
 *
 * @return     {void}
 *
 * @example    window[ appAlias ].methods.gameplay.getGameStatistics();
 *
*/
window[ appAlias ].methods.statistics.getGameStatistics = function() {
  var objPost             = { 'class': 'Game', 'id': window[ appAlias ].id, 'methode': 'gameplay' };
  objPost.gameplayMethode = 'statistic';
  objPost.callback        = 'generateGameStatistics';

  return window[ appAlias ].methods.request( 'POST', { "result": "json", "view": window[ appAlias ].view.alias }, objPost, 'proccessResponse' );
};

/**
 * This Function is the Callback Function of the Ajax Request an controlls all other Statistic Functions
 *
 * @function
 * @public
 * @name       generateGameStatistics
 * @memberof   friendshunt
 * @access     public
 * @since      2026-06-06
 * @version    0.1.0
 *
 * @param      {object}   objResponse   The Response Object of the Ajax Request
 * @return     {void}
 *
 * @example    window[ appAlias ].methods.gameplay.generateGameStatistics( objResponse );
 *
*/
window[ appAlias ].methods.gameplay.generateGameStatistics = function( objResponse ) {
  if( window[ appAlias ].debug ) console.log( objResponse.result );

  objResponse        = objResponse.result;
  objStatistics      = window[ appAlias ].methods.statistics.gameStatistic( objResponse, '.player-dashboard-container' );

  window[ appAlias ].methods.statistics.addPlayerDistancesContainers( objStatistics );
  window[ appAlias ].methods.statistics.addOutOfPlayfield( objStatistics );
  window[ appAlias ].methods.statistics.addMessagesContainer( objStatistics );
  window[ appAlias ].methods.statistics.addSpeedHuntsContainer( objStatistics, objResponse );
  window[ appAlias ].methods.statistics.addCapturedContainer( objStatistics );
  window[ appAlias ].methods.statistics.addGameOverviewContainer( objStatistics )

  return;
};

/**
 * This Function add the Overview Statistic Container from the Game to the Game Dashboard.
 *
 * @function
 * @public
 * @name       addGameOverviewContainer
 * @memberof   friendshunt
 * @access     public
 * @since      2026-06-06
 * @version    0.1.0
 *
 * @param      {object}   objStatistics   The Statistic Object with all important Values
 * @return     {void}
 *
 * @example    window[ appAlias ].methods.statistics.addGameOverviewContainer( objStatistics );
 *
*/
window[ appAlias ].methods.statistics.addGameOverviewContainer = function( objStatistics ) {
  var strContent = '';

  strContent    += '<div class="card">';
  strContent    += '<div class="card-title">Spiel-Überblick</div>';
  strContent    += '<div class="align-left">';

  strContent    += '<div class="card-content-flex">';
  strContent    += '<span>Distanz</span>';
  strContent    += '<span>' + objStatistics.distance + ' km</span>';
  strContent    += '</div>';

  strContent    += '<div class="card-content-flex">';
  strContent    += '<span>Gefahren</span>';
  strContent    += '<span>' + objStatistics.drived + ' km</span>';
  strContent    += '</div>';

  strContent    += '<div class="card-content-flex">';
  strContent    += '<span>Schritte</span>';
  strContent    += '<span>' + objStatistics.steps + '</span>';
  strContent    += '</div>';

  strContent    += '<div class="card-content-flex">';
  strContent    += '<span class="success-text">Speed Hunts</span>';
  strContent    += '<span class="success-text">' + objStatistics.speedHunts + '</span>';
  strContent    += '</div>';

  strContent    += '<div class="card-content-flex">';
  strContent    += '<span class="warning-text">Spielfeld verlassen</span>';
  strContent    += '<span class="warning-text">' + objStatistics.outOfPlayfield.length + '</span>';
  strContent    += '</div>';

  strContent    += '<div class="card-content-flex">';
  strContent    += '<span class="danger-text">Erwischt</span>';
  strContent    += '<span class="danger-text">' + objStatistics.captured.length + '</span>';
  strContent    += '</div>';

  strContent    += '<div class="card-content-flex">';
  strContent    += '<span class="info-text">Nachrichten</span>';
  strContent    += '<span class="info-text">' + objStatistics.messages + '</span>';
  strContent    += '</div>';

  strContent    += '<div class="card-content-flex">';
  strContent    += '<span class="info-text">Nachrichten Länge</span>';
  strContent    += '<span class="info-text">' + objStatistics.messageSize + '</span>';
  strContent    += '</div>';

  strContent    += '</div>';
  strContent    += '</div>';

  objStatistics.statisticContainer.innerHTML += strContent;

  return;
};

/**
 * This Function add the Speed Hunt Statistic Container from the Game to the Game Dashboard.
 *
 * @function
 * @public
 * @name       addSpeedHuntsContainer
 * @memberof   friendshunt
 * @access     public
 * @since      2026-06-06
 * @version    0.1.0
 *
 * @param      {object}   objStatistics   The Statistic Object with all important Values
 * @param      {object}   objResponse     The Response Object of the Ajax Request
 * @return     {void}
 *
 * @example    window[ appAlias ].methods.statistics.addSpeedHuntsContainer( objStatistics, objResponse );
 *
*/
window[ appAlias ].methods.statistics.addSpeedHuntsContainer = function( objStatistics, objResponse ) {
  var arrSpeedHunts = objResponse.gameplay.speedHunts
  var strContent  = '';

  if( arrSpeedHunts.length < 1 ) return;

  strContent     += '<div class="card card-full">';
  strContent     += '<div class="card-title">Speed Hunts</div>';
  strContent     += '<table class="w-100p">';
  strContent     += '<thead><tr>';
  strContent     += '<th class="align-left pr-10">Name</th>';
  strContent     += '<th class="align-right pr-10">Pings</th>';
  strContent     += '<th class="align-right pr-10">Erster Ping</th>';
  strContent     += '<th class="align-right pr-10">Letzter Ping</th>';
  strContent     += '</tr></thead>';
  strContent     += '<tbody>';

  for( var i = 0; i < arrSpeedHunts.length; i++ ) {
    var strCssClass = objStatistics.names[ arrSpeedHunts[ i ].playerId ].captured ? ' danger-text' : '';

    strContent     += '<tr>';
    strContent     += '<td class="align-left pr-10' + strCssClass + '">' + arrSpeedHunts[ i ].playerName + '</td>';
    strContent     += '<td class="align-right pr-10">' + arrSpeedHunts[ i ].timestamps.length + '</td>';
    strContent     += '<td class="align-right pr-10">' + window[ appAlias ].methods.timestampPhpToString( arrSpeedHunts[ i ].timestamps[ 0 ] ) + '</td>';
    strContent     += '<td class="align-right pr-10">' + window[ appAlias ].methods.timestampPhpToString( arrSpeedHunts[ i ].timestamps[ arrSpeedHunts[ i ].timestamps.length -1 ] ) + '</td>';
    strContent     += '</tr>';
  }

  strContent    += '</tbody>';
  strContent    += '</table>'
  strContent    += '</div>';

  objStatistics.statisticContainer.innerHTML += strContent;

  return;
};

/**
 * This Function add the Messages Statistic Container from the Game to the Game Dashboard.
 *
 * @function
 * @public
 * @name       addMessagesContainer
 * @memberof   friendshunt
 * @access     public
 * @since      2026-06-06
 * @version    0.1.0
 *
 * @param      {object}   objStatistics   The Statistic Object with all important Values
 * @return     {void}
 *
 * @example    window[ appAlias ].methods.statistics.addMessagesContainer( objStatistics );
 *
*/
window[ appAlias ].methods.statistics.addMessagesContainer = function( objStatistics ) {
  var strContent    = '';
  var intBatteryMin = 100;
  var intBatteryMax = 0;

  strContent     += '<div class="card card-full">';
  strContent     += '<div class="card-title">Nachrichten & Akku Übersicht</div>';
  strContent     += '<table class="w-100p">';
  strContent     += '<thead><tr>';
  strContent     += '<th class="align-left pr-10">Name</th>';
  strContent     += '<th class="align-right pr-10">Anzahl</th>';
  strContent     += '<th class="align-right pr-10">Zeichen</th>';
  strContent     += '<th class="align-right pr-10">Akku Min / Max</th>';
  strContent     += '<th class="align-right pr-10">Geladen</th>';
  strContent     += '</tr></thead>';
  strContent     += '<tbody>';

  for( var strPlayerId in objStatistics.names ) {
    var strCssClass         = objStatistics.names[ strPlayerId ].captured ? ' danger-text' : '';
    var strCssClassBattery  = 'success-text';
    var strCharched         = objStatistics.names[ strPlayerId ].batteryCharged ? 'Ja' : 'Nein';
    var strCssClassCharched = objStatistics.names[ strPlayerId ].batteryCharged ? 'info-text' : 'warning-text';

    intBatteryMin           = intBatteryMin > objStatistics.names[ strPlayerId ].batteryMin ? objStatistics.names[ strPlayerId ].batteryMin : intBatteryMin;
    intBatteryMax           = intBatteryMax < objStatistics.names[ strPlayerId ].batteryMax ? objStatistics.names[ strPlayerId ].batteryMax : intBatteryMax;

    strCssClassBattery      = objStatistics.names[ strPlayerId ].batteryMin < 70 ? 'info-text' : strCssClassBattery;
    strCssClassBattery      = objStatistics.names[ strPlayerId ].batteryMin < 40 ? 'warning-text' : strCssClassBattery;
    strCssClassBattery      = objStatistics.names[ strPlayerId ].batteryMin < 20 ? 'danger-text' : strCssClassBattery;

    strContent             += '<tr>';
    strContent             += '<td class="align-left pr-10' + strCssClass + '">' + objStatistics.names[ strPlayerId ].name + '</td>';
    strContent             += '<td class="align-right pr-10">' + objStatistics.names[ strPlayerId ].messages + '</td>';
    strContent             += '<td class="align-right pr-10">' + objStatistics.names[ strPlayerId ].messageSize + '</td>';
    strContent             += '<td class="align-right pr-10 ' + strCssClassBattery + '">' + objStatistics.names[ strPlayerId ].batteryMin + '% / ' + objStatistics.names[ strPlayerId ].batteryMax + '%</td>';
    strContent             += '<td class="align-right pr-10 ' + strCssClassCharched + '">' + strCharched + '</td>';
    strContent             += '</tr>';
  }

  strContent    += '</tbody>';

  strContent    += '<tfoot><tr>';
  strContent    += '<th class="align-left pr-10"></th>';
  strContent    += '<th class="align-right pr-10">' + objStatistics.messages + '</th>';
  strContent    += '<th class="align-right pr-10">' + objStatistics.messageSize + '</th>';
  strContent    += '<th class="align-right pr-10">' + intBatteryMin + '% / ' + intBatteryMax + '%</th>';
  strContent    += '<th class="align-right pr-10"></th>';
  strContent    += '</tr></tfoot>';

  strContent    += '</table>'
  strContent    += '</div>';

  objStatistics.statisticContainer.innerHTML += strContent;

  return;
};

/**
 * This Function add the Violations of the Rules Statistic Container from the Game to the Game Dashboard.
 *
 * @function
 * @public
 * @name       addViolationsOfTheRules
 * @memberof   friendshunt
 * @access     public
 * @since      2026-06-06
 * @version    0.1.0
 *
 * @param      {object}   objStatistics   The Statistic Object with all important Values
 * @param      {object}   objResponse     The Response Object of the Ajax Request
 * @return     {void}
 *
 * @example    window[ appAlias ].methods.statistics.addViolationsOfTheRules( objStatistics, objResponse );
 *
*/
window[ appAlias ].methods.statistics.addOutOfPlayfield = function( objStatistics ) {
  var boolShow                = false;
  var strContent              = '';

  strContent                 += '<div class="card card-full">';
  strContent                 += '<div class="card-title">Regelbruch - Spielfeld verlassen</div>';
  strContent                 += '<table class="w-100p">';
  strContent                 += '<thead><tr>';
  strContent                 += '<th class="align-left pr-10">Name</th>';
  strContent                 += '<th class="align-right pr-10">Start</th>';
  strContent                 += '<th class="align-right pr-10">Ende</th>';
  strContent                 += '</tr></thead>';
  strContent                 += '<tbody>';

  for( var i = 0; i < objStatistics.outOfPlayfield.length; i++ ) {
    var strCssClass = objStatistics.names[ objStatistics.outOfPlayfield[ i ].playerId ].captured ? ' danger-text' : '';
    var strEnd      = typeof objStatistics.outOfPlayfield[ i ].end != 'undefined' ? window[ appAlias ].methods.timestampPhpToString( objStatistics.outOfPlayfield[ i ].end ) : '--';

    boolShow        = true;

    strContent     += '<tr>';
    strContent     += '<td class="align-left pr-10' + strCssClass + '">' + objStatistics.names[ objStatistics.outOfPlayfield[ i ].playerId ].name + '</td>';
    strContent     += '<td class="align-right pr-10 danger-text">' + window[ appAlias ].methods.timestampPhpToString( objStatistics.outOfPlayfield[ i ].start ) + '</td>';
    strContent     += '<td class="align-right pr-10 info-text">' + strEnd + '</td>';
    strContent     += '</tr>';

  }

  strContent    += '</tbody>';
  strContent    += '</table>'
  strContent    += '</div>';

  if( boolShow ) objStatistics.statisticContainer.innerHTML += strContent;

  return;
};

/**
 * This Function add the Statistic Container for the captured Player from the Game to the Game Dashboard.
 *
 * @function
 * @public
 * @name       addCapturedContainer
 * @memberof   friendshunt
 * @access     public
 * @since      2026-06-06
 * @version    0.1.0
 *
 * @param      {object}   objStatistics   The Statistic Object with all important Values
 * @return     {void}
 *
 * @example    window[ appAlias ].methods.statistics.addCapturedContainer( objStatistics );
 *
*/
window[ appAlias ].methods.statistics.addCapturedContainer = function( objStatistics ) {
  var strContent = '';

  for( var i = 0; i < objStatistics.captured.length; i++ ) {
    strContent  += '<div class="card">';
    strContent  += '<div class="card-title">Ausgeschieden</div>';
    strContent  += '<div class="align-left">';
    strContent  += '<p class="align-left mb-10 danger-text bold">' + objStatistics.names[ objStatistics.captured[ i ].playerId ].name + '</p>';
    strContent  += '<p class="align-left mb-10">' + window[ appAlias ].methods.timestampPhpToString( objStatistics.captured[ i ].timestamp ) + ' Uhr</p>';
    strContent  += '<p class="align-left bold mb-5 info-text">Jäger:</p>';

    for( var j = 0; j < objStatistics.captured[ i ].hunterIds.length; j++ ) {
      strContent  += '<p class="align-left">' + objStatistics.names[ objStatistics.captured[ i ].hunterIds[ j ]  ].name + '</p>';
    }

    strContent  += '</div>';
    strContent  += '</div>';
  }

  objStatistics.statisticContainer.innerHTML += strContent;

  return;
};

/**
 * This Function add Distances and Steps Statistic Container from the Game to the Game Dashboard.
 *
 * @function
 * @public
 * @name       addPlayerDistancesContainers
 * @memberof   friendshunt
 * @access     public
 * @since      2026-06-06
 * @version    0.1.0
 *
 * @param      {object}   objStatistics   The Statistic Object with all important Values
 * @return     {void}
 *
 * @example    window[ appAlias ].methods.statistics.addPlayerDistancesContainers( objStatistics );
 *
*/
window[ appAlias ].methods.statistics.addPlayerDistancesContainers = function( objStatistics ) {
  for( var strRole in objStatistics.roles ) {
    var strContent        = '';
    var boolShow          = false;
    var intStepAll        = 0;
    var floatDistanceAll  = 0;
    var floatDrivedAll    = 0;

    strContent    += '<div class="card card-full">';
    strContent    += '<div class="card-title">Distanzen als ' + objStatistics.roles[ strRole ] + '</div>';
    strContent    += '<table class="w-100p">';
    strContent    += '<thead><tr>';
    strContent    += '<th class="align-left pr-10">Name</th>';
    strContent    += '<th class="align-right pr-10">Schritte</th>';
    strContent    += '<th class="align-right pr-10">Distanz</th>';
    strContent    += '<th class="align-right pr-10">Gefahren</th>';
    strContent    += '<th class="align-right">Status</th>';
    strContent    += '</tr></thead>';
    strContent    += '<tbody>';

    for( var strPlayerId in objStatistics.names ) {
      if( strRole != objStatistics.names[ strPlayerId ].role ) continue;

      var strCssClass = objStatistics.names[ strPlayerId ].captured ? ' danger-text' : '';

      boolShow          = true;
      intStepAll       += objStatistics.names[ strPlayerId ].steps;
      floatDistanceAll += objStatistics.names[ strPlayerId ].distance;
      floatDrivedAll   += objStatistics.names[ strPlayerId ].drived;

      strContent       += '<tr>';
      strContent       += '<td class="align-left pr-10' + strCssClass + '">' + objStatistics.names[ strPlayerId ].name + '</td>';
      strContent       += '<td class="align-right pr-10">' + objStatistics.names[ strPlayerId ].steps + '</td>';
      strContent       += '<td class="align-right pr-10">' + objStatistics.names[ strPlayerId ].distance + ' km</td>';

      if( objStatistics.names[ strPlayerId ].role == 'player' ) {
        strContent  += '<td class="align-right warning-text pr-10">' + objStatistics.names[ strPlayerId ].drived + ' km</td>';
      } else {
        strContent  += '<td class="align-right pr-10">' + objStatistics.names[ strPlayerId ].drived + ' km</td>';
      }

      if( objStatistics.names[ strPlayerId ].captured ) {
        strContent  += '<td class="align-right danger-text">Erwischt</td>';
      } else {
        strContent  += '<td class="align-right success-text">Aktiv</td>';
      }

      strContent  += '</tr>';
    }

    strContent    += '</tbody>';

    strContent    += '<tfoot><tr>';
    strContent    += '<th class="align-left pr-10"></th>';
    strContent    += '<th class="align-right pr-10">' + intStepAll + '</th>';
    strContent    += '<th class="align-right pr-10">' + floatDistanceAll + ' km</th>';
    strContent    += '<th class="align-right pr-10">' + floatDrivedAll + ' km</th>';
    strContent    += '<th class="align-right"></th>';
    strContent    += '</tr></tfoot>';

    strContent    += '</table>'
    strContent    += '</div>';

    if( boolShow ) objStatistics.statisticContainer.innerHTML += strContent;
  }

  return;
};

/**
 * This Function generate the Statistic Object width all important Values from Ajax Request.
 *
 * @function
 * @public
 * @name       gameStatistic
 * @memberof   friendshunt
 * @access     public
 * @since      2026-06-06
 * @version    0.1.0
 *
 * @param      {object}   objResponse    The Response Object of the Ajax Request
 * @param      {string}   strSelector    The Css-Selector for the Statistic Container for to add Statistics to the Game Dashboard
 * @return     {object}   objStatistic   The Statistic Object width all important Values from Ajax Request
 *
 * @example    var objStatistic = window[ appAlias ].methods.statistics.gameStatistic( objResponse, objStatistics );
 *
*/
window[ appAlias ].methods.statistics.gameStatistic = function( objResponse, strSelector ) {
  var objGeoTracker         = new GeoTracker();
  var objStatistic          = {
    'roles': { 'player': 'Spieler', 'hunter': 'Jäger', 'management': 'Spielleitung' },
    'names': {},
    'captured': [],
    'steps': 0,
    'outOfPlayfield': [],
    'distance': 0,
    'drived': 0,
    'messages': 0,
    'messageSize': 0,
    'speedHunts': 0,
    'statisticContainer': document.querySelector( strSelector )
  };

  // objStatistic.names
  for( var strRole in objStatistic.roles ) {
    for( var i = 0; i < objResponse.gameplay[ strRole ].length; i++ ) {
     objStatistic.names[ objResponse.gameplay[ strRole ][ i ].id ] = {
        'id': objResponse.gameplay[ strRole ][ i ].id,
        'name': objResponse.gameplay[ strRole ][ i ].name,
        'role': strRole,
        'roleName': objStatistic.roles[ strRole ],
        'captured': null,
        'steps': 0,
        'distance': 0,
        'drived': 0,
        'messages': 0,
        'messageSize': 0,
        'outOfPlayfield': [],
        'speedHunts': 0,
        'batteryMin': 100,
        'batteryMax': 0,
        'batteryCharged': false
      };
    }
  }

  // distances
  for( var strRole in objStatistic.roles ) {
    var objTrackings = objResponse.positions[ strRole ];

    for( var strPlayerId in objTrackings ) {
      var arrTracking           = objResponse.positions[ strRole ][ strPlayerId ];
      var intCountSteps         = 0;
      var intDistance           = 0;
      var intDrived             = 0;
      var intBatteryMin         = 100;
      var intBatteryMax         = 0;
      var boolBassteryIsCharged = false;
      var boolOutOfPlayfield    = false;

      for( var i = 0; i < arrTracking.length; i++ ) {
        intCountSteps         += arrTracking[ i ].steps;
        intBatteryMin          = intBatteryMin > arrTracking[ i ].batteryLevel ? arrTracking[ i ].batteryLevel : intBatteryMin;
        intBatteryMax          = intBatteryMax < arrTracking[ i ].batteryLevel ? arrTracking[ i ].batteryLevel : intBatteryMax;
        boolBassteryIsCharged  = arrTracking[ i ].batteryIsCharching ? true : boolBassteryIsCharged;

        if( strRole != 'management' ) {
          if( boolOutOfPlayfield == false && arrTracking[ i ].outOfPlayingField == true ) {
            objStatistic.names[ strPlayerId ].outOfPlayfield.push( { 'start': arrTracking[ i ].timestamp, 'playerId': strPlayerId } );
            objStatistic.outOfPlayfield.push( { 'start': arrTracking[ i ].timestamp, 'playerId': strPlayerId } );

            boolOutOfPlayfield = true;
          } else if( boolOutOfPlayfield == true && arrTracking[ i ].outOfPlayingField == false ) {
            var intOutOfPlayfieldLengthPlayer = objStatistic.names[ strPlayerId ].outOfPlayfield.length - 1;
            var intOutOfPlayfieldLength       = objStatistic.outOfPlayfield.length - 1;

            objStatistic.names[ strPlayerId ].outOfPlayfield[ intOutOfPlayfieldLengthPlayer ].end = arrTracking[ i ].timestamp;
            objStatistic.outOfPlayfield[ intOutOfPlayfieldLength ].end                            = arrTracking[ i ].timestamp;

            boolOutOfPlayfield = false;
          }
        }

        if( arrTracking[ i ].isDrived && i > 0 ) {
          intDrived += objGeoTracker.calcDistance( arrTracking[ i ].lat, arrTracking[ i ].lng, arrTracking[ i - 1 ].lat, arrTracking[ i - 1 ].lng );
        }

        if( i > arrTracking.length - 2 ) continue;

        intDistance += objGeoTracker.calcDistance( arrTracking[ i ].lat, arrTracking[ i ].lng, arrTracking[ i + 1 ].lat, arrTracking[ i + 1 ].lng );
      }

      objStatistic.steps                               += intCountSteps;
      objStatistic.distance                            += intDistance;
      objStatistic.drived                              += intDrived;

      objStatistic.names[ strPlayerId ].steps           = intCountSteps;
      objStatistic.names[ strPlayerId ].distance        = ( Math.ceil( intDistance / 100 ) ) / 10;
      objStatistic.names[ strPlayerId ].drived          = ( Math.ceil( intDrived / 100 ) ) / 10;

      objStatistic.names[ strPlayerId ].batteryMin      = Math.round( intBatteryMin );
      objStatistic.names[ strPlayerId ].batteryMax      = Math.round( intBatteryMax );
      objStatistic.names[ strPlayerId ].batteryCharged  = boolBassteryIsCharged;
    }
  }

  objStatistic.distance = ( Math.ceil( objStatistic.distance / 100 ) ) / 10;
  objStatistic.drived   = ( Math.ceil( objStatistic.drived / 100 ) ) / 10;

  // messages
  for( var i = 0; i < objResponse.messages.length; i++ ) {
    objStatistic.names[ objResponse.messages[ i ].playerId ].messages     += 1;
    objStatistic.names[ objResponse.messages[ i ].playerId ].messageSize  += objResponse.messages[ i ].message.length;
    objStatistic.messages    += 1;
    objStatistic.messageSize += objResponse.messages[ i ].message.length;
  }

  // captured
  for( var i = 0; i < objResponse.gameplay.captured.length; i++ ) {
    objStatistic.names[ objResponse.gameplay.captured[ i ].playerId ].captured = objResponse.gameplay.captured[ i ];
    objStatistic.captured.push( objResponse.gameplay.captured[ i ] );
  }

  // speed hunts
  for( var i = 0; i < objResponse.gameplay.speedHunts.length; i++ ) {
    objStatistic.names[ objResponse.gameplay.speedHunts[ i ].playerId ].speedHunts += 1;
    objStatistic.speedHunts += 1;
  }

  if( window[ appAlias ].debug ) console.log( objStatistic );

  return objStatistic;
};
