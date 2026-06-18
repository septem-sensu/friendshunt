/**
 * This class represents the ReplayPlayer class with all necessary properties, methods and event handlers.
 * The Replay class uses the tracking data to create a replay of all players on the map at multiple speeds.
 *
 * @class
 *
 * @author    Markus Götz <info@septem-sensu.de>
 * @version   0.1.0
 * @since     2026-06-18
 *
 * @example   var replayPlayer = new ReplayPlayer( trackingData );
 *
 */
class ReplayPlayer {

/**
 * This method is the constructor of the class.
 *
 * @public
 *
 * @param     {object}   trackingData   The sorted tracking data
 * @return    {void}
 *
 * @example   var replayPlayer = new ReplayPlayer( trackingData );
 *
 */
  constructor( trackingData ) {
    this.tracking                 = trackingData;

    this.playbackTimer            = null;
    this.speedMultiplier          = 10;
    this.isPlaying                = false;
    this.justResized              = false;

    this.startTimestamp           = parseInt( this.tracking[ 0 ].timestamp );
    this.endTimestamp             = parseInt( this.tracking[ this.tracking.length - 1 ].timestamp );
    this.totalDuration            = this.endTimestamp - this.startTimestamp;

    this.currentVirtualTimestamp  = this.startTimestamp;
    this.lastProcessedIndex       = 0;
    this.playerIndices            = {};

    this.slider                   = document.querySelector( '#replay-slider' );
    this.slider.min               = 0;
    this.slider.max               = this.totalDuration;
    this.slider.value             = 0;

    this.init();
  }

/**
 * This method is the default getter of the class.
 *
 * @public
 *
 * @param     {string}   property   The property of the value
 * @return    {mixed}    value      The value of the property
 *
 * @example   var value = replayPlayer.get( property );
 * @example   var value = this.get( property );
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
 * @example   replayPlayer.set( property, value );
 * @example   this.set( property, value );
 *
 */
  set( property, value ) {
    this[ property ] = value;

    return;
  }

/**
 * This class initializes the object and registers all required event handlers
 *
 * @public
 *
 * @return    {void}
 *
 * @example   replayPlayer.init();
 * @example   this.init();
 *
 */
  init() {
    document.querySelector( '#btn-replay-play' ).addEventListener( 'click', ( objEvent ) => {
      this.play();
      this.toggleButtonClass( objEvent.target, '#btn-replay-pause' );

      return;
    } );

    document.querySelector( '#btn-replay-pause' ).addEventListener( 'click', ( objEvent ) => {
      this.pause();
      this.toggleButtonClass( objEvent.target, '#btn-replay-play' );

      return;
    } );

    document.querySelectorAll( '.btn-speed' ).forEach( ( objBtn ) => {
      objBtn.addEventListener( 'click', ( objEvent ) => {
        document.querySelectorAll( '.btn-speed' ).forEach( b => b.classList.remove( 'btn-active' ) );
        objEvent.target.classList.add( 'btn-active' );
        this.speedMultiplier = parseInt( objEvent.target.getAttribute( 'data-speed' ) );

        return;
      } );
    } );

    this.slider.addEventListener( 'input', ( objEvent ) => {
      this.pause();

      var iSliderSekunden          = parseInt( objEvent.target.value );

      this.currentVirtualTimestamp = this.startTimestamp + iSliderSekunden;
      this.lastProcessedIndex      = 0;

      this.renderTargetTime( this.currentVirtualTimestamp );

      return;
    } );

    return;
  }

/**
 * This method starts the replay on the map with all players at multiple speeds.
 *
 * @public
 *
 * @return    {void}
 *
 * @example   replayPlayer.play();
 * @example   this.play();
 *
 */
  play() {
    if( this.isPlaying ) return;

    this.isPlaying     = true;
    this.playbackTimer = setInterval( () => {
      var iVergangeneVirtuelleSekunden = 0.1 * this.speedMultiplier;

      this.currentVirtualTimestamp += iVergangeneVirtuelleSekunden;

      if( this.currentVirtualTimestamp >= this.endTimestamp ) {
        this.currentVirtualTimestamp = this.endTimestamp;

        this.pause();
        document.querySelector( '#btn-replay-pause' ).click();
      }

      this.slider.value = Math.round( this.currentVirtualTimestamp - this.startTimestamp );

      this.renderTargetTime( this.currentVirtualTimestamp );

      return;
    }, 100 );

    return;
  }

/**
 * This method pauses the replay on the map at the current location.
 *
 * @public
 *
 * @return    {void}
 *
 * @example   replayPlayer.pause();
 * @example   this.pause();
 *
 */
  pause() {
    this.isPlaying = false;
    if( this.playbackTimer ) clearInterval( this.playbackTimer );

    return;
  }

/**
 * This method renders the players' positions on the map and sets the players' markers.
 *
 * @public
 *
 * @param     {number}   targetTimestamp   The timestamp of the time at which the players' markers should be placed
 * @return    {void}
 *
 * @example   replayPlayer.renderTargetTime( targetTimestamp );
 * @example   this.renderTargetTime( targetTimestamp );
 *
 */
  renderTargetTime( targetTimestamp ) {
    var marker = window[ appAlias ].tracker.geoMapsObject.get( 'marker' );

    for( var playerId in marker ) {
      if( playerId.indexOf('@') == -1 ) continue
      if( ! marker.hasOwnProperty( playerId ) ) continue;

      var floatingPoint = this.calculateIntermediatePoint( playerId, targetTimestamp );

      if( floatingPoint !== null ) marker[ playerId ].setLatLng( [ floatingPoint.lat, floatingPoint.lng ] );
    }

    var targetTime = new Date( targetTimestamp * 1000 );
    document.querySelector( '#replay-clock' ).innerText = targetTime.toLocaleTimeString( 'de-DE' );

    return;
  }

/**
 * This method gets the players' positions from the tracking data and calculates intermediate positions around jumping
 * to prevent the individual positions.
 * The method returns the position or intermediate position.
 *
 * @public
 *
 * @param     {string}   playerId          The player ID for which the position or intermediate position should be calculated
 * @param     {number}   targetTimestamp   The timestamp of the time at which the players' markers should be placed
 * @return    {object}   position          An object with the position or intermediate position of a player
 *
 * @example   position = replayPlayer.calculateIntermediatePoint( playerId, targetTimestamp );
 * @example   position = this.calculateIntermediatePoint( playerId, targetTimestamp );
 *
 */
  calculateIntermediatePoint( playerId, targetTimestamp ) {
    var lastPing   = null;
    var nextPing   = null;

    if( typeof this.playerIndices[ playerId ] === 'undefined' ) this.playerIndices[ playerId ] = 0;
    if( this.tracking[ this.playerIndices[ playerId ] ] && parseInt( this.tracking[ this.playerIndices[ playerId ] ].timestamp ) > targetTimestamp ) this.playerIndices[ playerId ] = 0;

    for( var i = this.playerIndices[ playerId ]; i < this.tracking.length; i++ ) {
      var ping = this.tracking[ i ];

      if( ping.playerId !== playerId ) continue;
      if( ping.type !== 'tracking' ) continue;

      var pingTime = parseInt( ping.timestamp );

      if( pingTime <= targetTimestamp ) {
        lastPing                       = ping;
        this.playerIndices[ playerId ] = i;
      }

      if( pingTime > targetTimestamp && nextPing === null ) {
        nextPing = ping;
        break;
      }
    }

    if( lastPing === null ) return null;
    if( nextPing === null ) return { 'lat': parseFloat( lastPing.lat ), 'lng': parseFloat( lastPing.lng ) };

    var timeDeltaTotal = parseInt( nextPing.timestamp ) - parseInt( lastPing.timestamp );

    if( timeDeltaTotal <= 0 ) return { 'lat': parseFloat( lastPing.lat ), 'lng': parseFloat( lastPing.lng ) };

    var timeDeltaCurrent = targetTimestamp - parseInt( lastPing.timestamp );
    var progress         = timeDeltaCurrent / timeDeltaTotal;
    var interpolatedLat  = parseFloat( lastPing.lat ) + ( parseFloat( nextPing.lat ) - parseFloat( lastPing.lat ) ) * progress;
    var interpolatedLng  = parseFloat( lastPing.lng ) + ( parseFloat( nextPing.lng ) - parseFloat( lastPing.lng ) ) * progress;

    return { 'lat': interpolatedLat, 'lng': interpolatedLng };
  }

/**
 * This method switches the HTML button objects for playing and pausing the replay active or inactive
 *
 * @public
 *
 * @param     {object}   activeBtn          The currently active Html button object which should become inactive
 * @param     {object}   strInactiveBtnId   The currently inactive Html button object that should become active
 * @return    {void}
 *
 * @example   position = replayPlayer.toggleButtonClass( activeBtn, strInactiveBtnId );
 * @example   position = this.toggleButtonClass( activeBtn, strInactiveBtnId );
 *
 */
  toggleButtonClass( activeBtn, strInactiveBtnId ) {
    activeBtn.classList.add( 'btn-active' );
    document.querySelector( strInactiveBtnId ).classList.remove( 'btn-active' );
    return;
  }

}
