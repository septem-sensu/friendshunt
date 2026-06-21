/**
 * This class represents the statistics class with all required properties and methods.
 * The statistics class parses the tracking data, generates statistics from it and appends them
 * in the designated places in the game dashboard view.
 * This class requires the GeoTracker class and the Communicator class.
 *
 * @class
 *
 * @author    Markus Götz <info@septem-sensu.de>
 * @version   0.1.0
 * @since     2026-06-18
 *
 * @example   const statistic = new Statistic( selector );
 *
 */
class Statistic {

/**
 * This method is the constructor of the class.
 *
 * @public
 *
 * @param     {string}   selector   The Css selector where the statistics should be inserted
 * @return    {void}
 *
 * @example   const statistic = new Statistic( selector );
 *
 */
  constructor( selector ) {
    this.geoTracker   = new GeoTracker();
    this.communicator = new Communicator();
    this.validator    = this.communicator.get( 'validator' );

    this.statistic    = null;
    this.response     = null;
    this.selector     = selector
    this.isInit       = false;

    return;
  }

/**
 * This method is the default getter of the class.
 *
 * @public
 *
 * @param     {string}   property   The property of the value
 * @return    {mixed}    value      The value of the property
 *
 * @example   let value = statistic.get( property );
 * @example   let value = this.get( property );
 *
 */
  get( property ) {
    return this[ property ];
  }

/**
 * This method is the default setter for the class.
 *
 * @public
 *
 * @param     {string}   property   The property that you want to set
 * @param     {mixed}    value      The value you want to set to the property
 * @return    {void}
 *
 * @example   statistic.set( property, value );
 * @example   this.set( property, value );
 *
 */
  set( property, value ) {
    this[ property ] = value;

    return;
  }

/**
 * This method initializes the statistics object.
 * The method is executed when the class is instantiated.
 *
 * @public
 *
 * @return    {void}
 *
 * @example   statistic.init();
 * @example   this.init();
 *
 */
  init() {
    this.statistic = {
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
      'statisticContainer': document.querySelector( this.selector )
    };

    for( const role in this.statistic.roles ) {
      for( let i = 0; i < this.response.gameplay[ role ].length; i++ ) {
        this.statistic.names[ this.response.gameplay[ role ][ i ].id ] = {
          'id': this.response.gameplay[ role ][ i ].id,
          'name': this.response.gameplay[ role ][ i ].name,
          'role': role,
          'roleName': this.statistic.roles[ role ],
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

    this.gameStatistic();

    this.isInit = true;

    return;
  }

/**
 * This method creates a request object to fetch the tracking data and fires it to the endpoint via the Communicator object.
 * The callback method is the generateGameStatistics method.
 *
 * @public
 *
 * @return    {void}
 *
 * @example   statistic.getGameStatistics();
 * @example   this.getGameStatistics();
 *
 */
  getGameStatistics() {
    if( this.isInit ) return;

    const post           = { 'class': 'Game', 'id': window[ appAlias ].id, 'method': 'gameplay' };
    post.gameplayMethod  = 'statistic';

    this.communicator.request( 'POST', { "result": "json", "view": window[ appAlias ].view.alias }, post, this.generateGameStatistics.bind( this ) );

    return;
  }

/**
 * This method controls the generation of statistics and is the callback method from the getGameStatistics method.
 *
 * @public
 *
 * @param     {object}  response   The Response object returned by the Communicator object
 * @return    {void}
 *
 * @example   statistic.generateGameStatistics( response );
 * @example   this.generateGameStatistics( response );
 *
 */
  generateGameStatistics( response ) {
    if( window[ appAlias ].debug ) console.log( response.result );

    this.response = response.result;

    this.init();

    this.addPlayerDistancesContainers();
    this.addOutOfPlayfield();
    this.addMessagesContainer();
    this.addSpeedHuntsContainer();
    this.addCapturedContainer();
    this.addGameOverviewContainer();

    return;
  }

/**
 * This method generates the game overview container and inserts it into the designated locations in the game dashboard view.
 *
 * @public
 *
 * @return    {void}
 *
 * @example   statistic.addGameOverviewContainer();
 * @example   this.addGameOverviewContainer();
 *
 */
  addGameOverviewContainer() {
    let content = '';

    content    += '<div class="card">';
    content    += '<div class="card-title">Spiel-Überblick</div>';
    content    += '<div class="align-left">';

    content    += '<div class="card-content-flex">';
    content    += '<span>Distanz</span>';
    content    += '<span>' + this.statistic.distance + ' km</span>';
    content    += '</div>';

    content    += '<div class="card-content-flex">';
    content    += '<span>Gefahren</span>';
    content    += '<span>' + this.statistic.drived + ' km</span>';
    content    += '</div>';

    content    += '<div class="card-content-flex">';
    content    += '<span>Schritte</span>';
    content    += '<span>' + this.statistic.steps + '</span>';
    content    += '</div>';

    content    += '<div class="card-content-flex">';
    content    += '<span class="success-text">Speed Hunts</span>';
    content    += '<span class="success-text">' + this.statistic.speedHunts + '</span>';
    content    += '</div>';

    content    += '<div class="card-content-flex">';
    content    += '<span class="warning-text">Spielfeld verlassen</span>';
    content    += '<span class="warning-text">' + this.statistic.outOfPlayfield.length + '</span>';
    content    += '</div>';

    content    += '<div class="card-content-flex">';
    content    += '<span class="danger-text">Erwischt</span>';
    content    += '<span class="danger-text">' + this.statistic.captured.length + '</span>';
    content    += '</div>';

    content    += '<div class="card-content-flex">';
    content    += '<span class="info-text">Nachrichten</span>';
    content    += '<span class="info-text">' + this.statistic.messages + '</span>';
    content    += '</div>';

    content    += '<div class="card-content-flex">';
    content    += '<span class="info-text">Nachrichten Länge</span>';
    content    += '<span class="info-text">' + this.statistic.messageSize + '</span>';
    content    += '</div>';

    content    += '</div>';
    content    += '</div>';

    this.statistic.statisticContainer.innerHTML += content;

    return;
  }

/**
 * This method generates the game Speed ​​Hunt container and inserts it into the designated locations in the game dashboard view.
 *
 * @public
 *
 * @return    {void}
 *
 * @example   statistic.addSpeedHuntsContainer();
 * @example   this.addSpeedHuntsContainer();
 *
 */
  addSpeedHuntsContainer() {
    const speedHunts = this.response.gameplay.speedHunts;
    let content      = '';

    if( speedHunts.length < 1 ) return;

    content     += '<div class="card card-full">';
    content     += '<div class="card-title">Speed Hunts</div>';
    content     += '<table class="w-100p">';
    content     += '<thead><tr>';
    content     += '<th class="align-left pr-10">Name</th>';
    content     += '<th class="align-right pr-10">Pings</th>';
    content     += '<th class="align-right pr-10">Erster Ping</th>';
    content     += '<th class="align-right pr-10">Letzter Ping</th>';
    content     += '</tr></thead>';
    content     += '<tbody>';

    for( let i = 0; i < speedHunts.length; i++ ) {
      let cssClass = this.statistic.names[ speedHunts[ i ].playerId ].captured ? ' danger-text' : '';

      content     += '<tr>';
      content     += '<td class="align-left pr-10' + cssClass + '">' + speedHunts[ i ].playerName + '</td>';
      content     += '<td class="align-right pr-10">' + speedHunts[ i ].timestamps.length + '</td>';
      content     += '<td class="align-right pr-10">' + Utils.timestampPhpToString( speedHunts[ i ].timestamps[ 0 ] ) + '</td>';
      content     += '<td class="align-right pr-10">' + Utils.timestampPhpToString( speedHunts[ i ].timestamps[ speedHunts[ i ].timestamps.length -1 ] ) + '</td>';
      content     += '</tr>';
    }

    content    += '</tbody>';
    content    += '</table>'
    content    += '</div>';

    this.statistic.statisticContainer.innerHTML += content;

    return;
  }

/**
 * This method generates the news overview container and inserts it into the designated locations in the game dashboard view.
 *
 * @public
 *
 * @return    {void}
 *
 * @example   statistic.addMessagesContainer();
 * @example   this.addMessagesContainer();
 *
 */
  addMessagesContainer() {
    let content    = '';
    let batteryMin = 100;
    let batteryMax = 0;

    content     += '<div class="card card-full">';
    content     += '<div class="card-title">Nachrichten & Akku Übersicht</div>';
    content     += '<table class="w-100p">';
    content     += '<thead><tr>';
    content     += '<th class="align-left pr-10">Name</th>';
    content     += '<th class="align-right pr-10">Anzahl</th>';
    content     += '<th class="align-right pr-10">Zeichen</th>';
    content     += '<th class="align-right pr-10">Akku Min / Max</th>';
    content     += '<th class="align-right pr-10">Geladen</th>';
    content     += '</tr></thead>';
    content     += '<tbody>';

    for( const playerId in this.statistic.names ) {
      let cssClass         = this.statistic.names[ playerId ].captured ? ' danger-text' : '';
      let cssClassBattery  = 'success-text';
      let charched         = this.statistic.names[ playerId ].batteryCharged ? 'Ja' : 'Nein';
      let cssClassCharched = this.statistic.names[ playerId ].batteryCharged ? 'info-text' : 'warning-text';

      batteryMin           = batteryMin > this.statistic.names[ playerId ].batteryMin ? this.statistic.names[ playerId ].batteryMin : batteryMin;
      batteryMax           = batteryMax < this.statistic.names[ playerId ].batteryMax ? this.statistic.names[ playerId ].batteryMax : batteryMax;

      cssClassBattery      = this.statistic.names[ playerId ].batteryMin < 70 ? 'info-text' : cssClassBattery;
      cssClassBattery      = this.statistic.names[ playerId ].batteryMin < 40 ? 'warning-text' : cssClassBattery;
      cssClassBattery      = this.statistic.names[ playerId ].batteryMin < 20 ? 'danger-text' : cssClassBattery;

      content             += '<tr>';
      content             += '<td class="align-left pr-10' + cssClass + '">' + this.statistic.names[ playerId ].name + '</td>';
      content             += '<td class="align-right pr-10">' + this.statistic.names[ playerId ].messages + '</td>';
      content             += '<td class="align-right pr-10">' + this.statistic.names[ playerId ].messageSize + '</td>';
      content             += '<td class="align-right pr-10 ' + cssClassBattery + '">' + this.statistic.names[ playerId ].batteryMin + '% / ' + this.statistic.names[ playerId ].batteryMax + '%</td>';
      content             += '<td class="align-right pr-10 ' + cssClassCharched + '">' + charched + '</td>';
      content             += '</tr>';
    }

    content    += '</tbody>';

    content    += '<tfoot><tr>';
    content    += '<th class="align-left pr-10"></th>';
    content    += '<th class="align-right pr-10">' + this.statistic.messages + '</th>';
    content    += '<th class="align-right pr-10">' + this.statistic.messageSize + '</th>';
    content    += '<th class="align-right pr-10">' + batteryMin + '% / ' + batteryMax + '%</th>';
    content    += '<th class="align-right pr-10"></th>';
    content    += '</tr></tfoot>';

    content    += '</table>'
    content    += '</div>';

    this.statistic.statisticContainer.innerHTML += content;

    return;
  }

/**
 * This method generates the Out of Field / Rule Breaking container and inserts it into the designated locations in the Game Dashboard view.
 *
 * @public
 *
 * @return    {void}
 *
 * @example   statistic.addOutOfPlayfield();
 * @example   this.addOutOfPlayfield();
 *
 */
  addOutOfPlayfield() {
    let show                 = false;
    let content              = '';

    content                 += '<div class="card card-full">';
    content                 += '<div class="card-title">Regelbruch - Spielfeld verlassen</div>';
    content                 += '<table class="w-100p">';
    content                 += '<thead><tr>';
    content                 += '<th class="align-left pr-10">Name</th>';
    content                 += '<th class="align-right pr-10">Start</th>';
    content                 += '<th class="align-right pr-10">Ende</th>';
    content                 += '</tr></thead>';
    content                 += '<tbody>';

    for( let i = 0; i < this.statistic.outOfPlayfield.length; i++ ) {
      let cssClass = this.statistic.names[ this.statistic.outOfPlayfield[ i ].playerId ].captured ? ' danger-text' : '';
      let end      = typeof this.statistic.outOfPlayfield[ i ].end != 'undefined' ? Utils.timestampPhpToString( this.statistic.outOfPlayfield[ i ].end ) : '--';

      show        = true;

      content     += '<tr>';
      content     += '<td class="align-left pr-10' + cssClass + '">' + this.statistic.names[ this.statistic.outOfPlayfield[ i ].playerId ].name + '</td>';
      content     += '<td class="align-right pr-10 danger-text">' + Utils.timestampPhpToString( this.statistic.outOfPlayfield[ i ].start ) + '</td>';
      content     += '<td class="align-right pr-10 info-text">' + end + '</td>';
      content     += '</tr>';

    }

    content    += '</tbody>';
    content    += '</table>'
    content    += '</div>';

    if( show ) this.statistic.statisticContainer.innerHTML += content;

    return;
  }

/**
 * This method generates the overview container for captured players and inserts it into the designated locations in the game dashboard view.
 *
 * @public
 *
 * @return    {void}
 *
 * @example   statistic.addCapturedContainer();
 * @example   this.addCapturedContainer();
 *
 */
  addCapturedContainer() {
    let content = '';

    for( let i = 0; i < this.statistic.captured.length; i++ ) {
      content  += '<div class="card">';
      content  += '<div class="card-title">Ausgeschieden</div>';
      content  += '<div class="align-left">';
      content  += '<p class="align-left mb-10 danger-text bold">' + this.statistic.names[ this.statistic.captured[ i ].playerId ].name + '</p>';
      content  += '<p class="align-left mb-10">' + Utils.timestampPhpToString( this.statistic.captured[ i ].timestamp ) + ' Uhr</p>';
      content  += '<p class="align-left bold mb-5 info-text">Jäger:</p>';

      for( let j = 0; j < this.statistic.captured[ i ].hunterIds.length; j++ ) {
        content  += '<p class="align-left">' + this.statistic.names[ this.statistic.captured[ i ].hunterIds[ j ]  ].name + '</p>';
      }

      content  += '</div>';
      content  += '</div>';
    }

    this.statistic.statisticContainer.innerHTML += content;

    return;
  }

/**
 * This method generates the overview container for the distances and steps taken by the players and inserts it into the designated places in the game dashboard view.
 *
 * @public
 *
 * @return    {void}
 *
 * @example   statistic.addPlayerDistancesContainers();
 * @example   this.addPlayerDistancesContainers();
 *
 */
  addPlayerDistancesContainers() {
    for( const role in this.statistic.roles ) {
      let content      = '';
      let show         = false;
      let stepAll      = 0;
      let distanceAll  = 0;
      let drivedAll    = 0;

      content    += '<div class="card card-full">';
      content    += '<div class="card-title">Distanzen als ' + this.statistic.roles[ role ] + '</div>';
      content    += '<table class="w-100p">';
      content    += '<thead><tr>';
      content    += '<th class="align-left pr-10">Name</th>';
      content    += '<th class="align-right pr-10">Schritte</th>';
      content    += '<th class="align-right pr-10">Distanz</th>';
      content    += '<th class="align-right pr-10">Gefahren</th>';
      content    += '<th class="align-right">Status</th>';
      content    += '</tr></thead>';
      content    += '<tbody>';

      for( const playerId in this.statistic.names ) {
        if( role != this.statistic.names[ playerId ].role ) continue;

        let strCssClass = this.statistic.names[ playerId ].captured ? ' danger-text' : '';

        show          = true;
        stepAll       += this.statistic.names[ playerId ].steps;
        distanceAll   += this.statistic.names[ playerId ].distance;
        drivedAll     += this.statistic.names[ playerId ].drived;

        content       += '<tr>';
        content       += '<td class="align-left pr-10' + strCssClass + '">' + this.statistic.names[ playerId ].name + '</td>';
        content       += '<td class="align-right pr-10">' + this.statistic.names[ playerId ].steps + '</td>';
        content       += '<td class="align-right pr-10">' + this.statistic.names[ playerId ].distance + ' km</td>';

        if( this.statistic.names[ playerId ].role == 'player' ) {
          content  += '<td class="align-right warning-text pr-10">' + this.statistic.names[ playerId ].drived + ' km</td>';
        } else {
          content  += '<td class="align-right pr-10">' + this.statistic.names[ playerId ].drived + ' km</td>';
        }

        if( this.statistic.names[ playerId ].captured ) {
          content  += '<td class="align-right danger-text">Erwischt</td>';
        } else {
          content  += '<td class="align-right success-text">Aktiv</td>';
        }

        content  += '</tr>';
      }

      content    += '</tbody>';
      content    += '<tfoot><tr>';
      content    += '<th class="align-left pr-10"></th>';
      content    += '<th class="align-right pr-10">' + stepAll + '</th>';
      content    += '<th class="align-right pr-10">' + ( Math.round( distanceAll * 10 ) ) / 10 + ' km</th>';
      content    += '<th class="align-right pr-10">' + ( Math.round( drivedAll * 10 ) ) / 10 + ' km</th>';
      content    += '<th class="align-right"></th>';
      content    += '</tr></tfoot>';

      content    += '</table>'
      content    += '</div>';

      if( show ) this.statistic.statisticContainer.innerHTML += content;
    }

    return;
  }

/**
 * This method generates a tracking object from the players' existing tracking data with which the other methods can work better and returns it.
 *
 * @public
 *
 * @return    {object}  statistic  The created Statistic object
 *
 * @example   let statistic = statistic.gameStatistic();
 * @example   let statistic = this.gameStatistic();
 *
 */
gameStatistic() {
  // distances this.statistic this.response
  for( const role in this.statistic.roles ) {
    const trackings = this.response.positions[ role ];

    for( const playerId in trackings ) {
      const tracking         = this.response.positions[ role ][ playerId ];
      let countSteps         = 0;
      let distance           = 0;
      let drived             = 0;
      let batteryMin         = 100;
      let batteryMax         = 0;
      let batteryIsCharged   = false;
      let outOfPlayfield     = false;

      for( let i = 0; i < tracking.length; i++ ) {
        countSteps         += tracking[ i ].steps;
        batteryMin          = batteryMin > tracking[ i ].batteryLevel ? tracking[ i ].batteryLevel : batteryMin;
        batteryMax          = batteryMax < tracking[ i ].batteryLevel ? tracking[ i ].batteryLevel : batteryMax;
        batteryIsCharged  = tracking[ i ].batteryIsCharching ? true : batteryIsCharged;

        if( role != 'management' ) {
          if( outOfPlayfield == false && tracking[ i ].outOfPlayingField == true ) {
            this.statistic.names[ playerId ].outOfPlayfield.push( { 'start': tracking[ i ].timestamp, 'playerId': playerId } );
            this.statistic.outOfPlayfield.push( { 'start': tracking[ i ].timestamp, 'playerId': playerId } );

            outOfPlayfield = true;
          } else if( outOfPlayfield == true && tracking[ i ].outOfPlayingField == false ) {
            let intOutOfPlayfieldLengthPlayer = this.statistic.names[ playerId ].outOfPlayfield.length - 1;
            let intOutOfPlayfieldLength       = this.statistic.outOfPlayfield.length - 1;

            this.statistic.names[ playerId ].outOfPlayfield[ intOutOfPlayfieldLengthPlayer ].end = tracking[ i ].timestamp;
            this.statistic.outOfPlayfield[ intOutOfPlayfieldLength ].end                            = tracking[ i ].timestamp;

            outOfPlayfield = false;
          }
        }

        if( tracking[ i ].isDrived && i > 0 ) {
          drived += this.geoTracker.calcDistance( tracking[ i ].lat, tracking[ i ].lng, tracking[ i - 1 ].lat, tracking[ i - 1 ].lng );
        }

        if( i > tracking.length - 2 ) continue;

        distance += this.geoTracker.calcDistance( tracking[ i ].lat, tracking[ i ].lng, tracking[ i + 1 ].lat, tracking[ i + 1 ].lng );
      }

      this.statistic.steps                            += countSteps;
      this.statistic.distance                         += distance;
      this.statistic.drived                           += drived;

      this.statistic.names[ playerId ].steps           = countSteps;
      this.statistic.names[ playerId ].distance        = ( Math.ceil( distance / 100 ) ) / 10;
      this.statistic.names[ playerId ].drived          = ( Math.ceil( drived / 100 ) ) / 10;

      this.statistic.names[ playerId ].batteryMin      = Math.round( batteryMin );
      this.statistic.names[ playerId ].batteryMax      = Math.round( batteryMax );
      this.statistic.names[ playerId ].batteryCharged  = batteryIsCharged;
    }
  }

  this.statistic.distance = ( Math.ceil( this.statistic.distance / 100 ) ) / 10;
  this.statistic.drived   = ( Math.ceil( this.statistic.drived / 100 ) ) / 10;

  // messages
  for( let i = 0; i < this.response.messages.length; i++ ) {
    this.statistic.names[ this.response.messages[ i ].playerId ].messages     += 1;
    this.statistic.names[ this.response.messages[ i ].playerId ].messageSize  += this.response.messages[ i ].message.length;
    this.statistic.messages    += 1;
    this.statistic.messageSize += this.response.messages[ i ].message.length;
  }

  // captured
  for( let i = 0; i < this.response.gameplay.captured.length; i++ ) {
    this.statistic.names[ this.response.gameplay.captured[ i ].playerId ].captured = this.response.gameplay.captured[ i ];
    this.statistic.captured.push( this.response.gameplay.captured[ i ] );
  }

  // speed hunts
  for( let i = 0; i < this.response.gameplay.speedHunts.length; i++ ) {
    this.statistic.names[ this.response.gameplay.speedHunts[ i ].playerId ].speedHunts += 1;
    this.statistic.speedHunts += 1;
  }

  if( window[ appAlias ].debug ) console.log( this.statistic );

  return;
}



}