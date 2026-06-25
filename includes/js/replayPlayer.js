/**
 * This class represents the ReplayPlayer class with all necessary properties, methods and event handlers.
 * The Replay class uses the tracking data to create a replay of all players on the map at multiple speeds.
 *
 * @class
 *
 * @see Gameplay
 * @see GeoMaps
 * @see Utils
 *
 * @author    Markus Götz <info@septem-sensu.de>
 * @version   0.1.0
 * @since     2026-06-18
 *
 * @example   const replayPlayer = new ReplayPlayer( replayData, gamePlay );
 *
 */
class ReplayPlayer {

/**
 * This method is the constructor of the class.
 *
 * @public
 *
 * @param     {object}   replayData      The sorted tracking data
 * @param     {object}   gameplay        The calling gameplay object
 * @return    {void}
 *
 * @example   const replayPlayer = new ReplayPlayer( replayData, gamePlay );
 *
 */
  constructor( replayData, gameplay ) {
    this.replayData               = replayData;
    this.tracking                 = this.replayData.trackings;
    this.gameplay                 = gameplay;
    this.geoMaps                  = this.gameplay.get( 'geoMaps' );
    this.currentPlayerId          = this.gameplay.get( 'playerId' );
    this.mapInstance              = this.geoMaps.get( 'map' );
    this.playerClassesAndColors   = {};

    this.playbackTimer            = null;
    this.speedMultiplier          = 10;
    this.isPlaying                = false;
    this.isTrackingMode           = this.gameplay.get( 'isTrackingMode' );
    this.isHighlightActive        = false;

    this.startTimestamp           = parseInt( this.tracking[ 0 ].timestamp );
    this.endTimestamp             = parseInt( this.tracking[ this.tracking.length - 1 ].timestamp );

    this.currentVirtualTimestamp  = this.startTimestamp;
    this.playerIndices            = {};
    this.processedHighlight       = {};

    this.slider                   = document.querySelector( '#replay-slider' );
    this.slider.min               = 0;
    this.slider.max               = this.endTimestamp - this.startTimestamp;
    this.slider.value             = 0;
    this.debug                    = window[ appAlias ].debug ? true : false;

    this.init();
  }

/**
 * This method is the default getter of the class.
 *
 * @public
 *
 * @param     {string}   property   The property of the value
 * @return    {*}        value      The value of the property
 *
 * @example   let value = replayPlayer.get( property );
 *
 * @see ReplayPlayer#set
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
 * @param     {*}        value      The value you want to set to the property
 * @return    {void}
 *
 * @example   replayPlayer.set( property, value );
 *
 * @see ReplayPlayer#get
 *
 */
  set( property, value ) {
    this[ property ] = value;

    return;
  }

/**
 * This method initializes the object and registers all required event handlers
 *
 * @public
 *
 * @return    {void}
 *
 * @example   replayPlayer.init();
 *
 */
  init() {
    if( Utils.globalRegisteredEvents[ 'ReplayPlayer' ] ) return;
    Utils.globalRegisteredEvents[ 'ReplayPlayer' ] = true;

    document.querySelector( '#btn-replay-play' ).addEventListener( 'click', ( event ) => {
      this.play();
      this.toggleButtonClass( event.target, '#btn-replay-pause' );

      return;
    } );

    document.querySelector( '#btn-replay-pause' ).addEventListener( 'click', ( event ) => {
      this.pause();
      this.toggleButtonClass( event.target, '#btn-replay-play' );

      return;
    } );

    document.querySelectorAll( '.btn-speed' ).forEach( ( btn ) => {
      btn.addEventListener( 'click', ( event ) => {
        document.querySelectorAll( '.btn-speed' ).forEach( b => b.classList.remove( 'btn-active' ) );
        event.target.classList.add( 'btn-active' );
        this.speedMultiplier = parseInt( event.target.getAttribute( 'data-speed' ) );

        return;
      } );
    } );

    this.slider.addEventListener( 'input', ( event ) => {
      this.pause();

      const sliderSeconds          = parseInt( event.target.value );

      this.currentVirtualTimestamp = this.startTimestamp + sliderSeconds;

      this.renderTargetTime( this.currentVirtualTimestamp );

      return;
    } );

    const colors        = this.gameplay.get( 'colors' );
    const playerCounter = { 'player': 1, 'hunter': 1, 'management': 1 };

    for( const playerId in this.replayData.names ) {
      if( ! this.replayData.names[ playerId ].firstLat || ! this.replayData.names[ playerId ].firstLng ) {
        playerCounter[ this.replayData.names[ playerId ].role ]++;
        continue;
      }

      this.replayData.names[ playerId ].color = colors[ playerCounter[ this.replayData.names[ playerId ].role ] ];

      this.geoMaps.setMarker(
        playerId,
        this.replayData.names[ playerId ].role,
        this.replayData.names[ playerId ].color,
        this.replayData.names[ playerId ].firstLat,
        this.replayData.names[ playerId ].firstLng,
        '',
        this.replayData.names[ playerId ].name
      );

      if( window[ appAlias ].playerId === playerId ) this.geoMaps.addMarkerCssClass( playerId, this.gameplay.get( 'markerCssClassMyOwn' ) );

      playerCounter[ this.replayData.names[ playerId ].role ]++;
    }

    document.querySelector( '.replay-panel' ).addEventListener( 'custom_moveend', ( event ) => {
      if( ! event || ! event.detail || ! event.detail.method ) return;
      if( typeof event.detail.method !== 'function' ) return;

      const executionMethod = event.detail.method.bind( this );

      executionMethod( event );

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
 *
 */
  play() {
    if( this.isPlaying ) return;

    this.isPlaying     = true;
    this.playbackTimer = setInterval( () => {
      const pastVirtualSeconds = 0.1 * this.speedMultiplier;

      this.currentVirtualTimestamp += pastVirtualSeconds;

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
 *
 */
  renderTargetTime( targetTimestamp ) {
    const marker = this.geoMaps.get( 'marker' );

    for( const playerId in marker ) {
      if( playerId.indexOf( '@' ) === -1 ) continue;
      if( ! marker.hasOwnProperty( playerId ) ) continue;

      const floatingPoint = this.calculateIntermediatePoint( playerId, targetTimestamp );

      if( floatingPoint !== null ) {
        marker[ playerId ].setLatLng( [ floatingPoint.lat, floatingPoint.lng ] );

        if( playerId === this.currentPlayerId ) {
          const isTrackingMode = this.gameplay.get( 'isTrackingMode' );
          if( isTrackingMode && ! this.isHighlightActive ) {
            const realLatLng   = L.latLng( floatingPoint.lat, floatingPoint.lng );
            const pixelPoint   = this.mapInstance.latLngToContainerPoint( realLatLng );

            pixelPoint.y      += 120;

            const offsetLatLng = this.mapInstance.containerPointToLatLng( pixelPoint );

            this.mapInstance.panTo( [ offsetLatLng.lat, offsetLatLng.lng ], { 'animate': true, 'duration': 0.1 } );
          }
        }

        if( this.playerClassesAndColors[ playerId ] ) {
          this.playerClassesAndColors[ playerId ].isSet = this.playerClassesAndColors[ playerId ].isSet || {};

          // Alarm
          if( this.playerClassesAndColors[ playerId ].alarm && ! this.playerClassesAndColors[ playerId ].isSet.capture ) {
            if( ( this.playerClassesAndColors[ playerId ].alarm > targetTimestamp ) || ( this.playerClassesAndColors[ playerId ].alarm + 300 < targetTimestamp ) ) {
              if( this.playerClassesAndColors[ playerId ].isSet.alarm ) {
                this.geoMaps.setIcon( playerId, this.replayData.names[ playerId ].role, this.replayData.names[ playerId ].color, this.replayData.names[ playerId ].name );

                this.playerClassesAndColors[ playerId ].isSet.alarm = false;

                if( window[ appAlias ].playerId === playerId ) this.geoMaps.addMarkerCssClass( playerId, this.gameplay.get( 'markerCssClassMyOwn' ) );
              }
            } else {
              if( ! this.playerClassesAndColors[ playerId ].isSet.alarm ) {
                this.geoMaps.setIcon( playerId, this.replayData.names[ playerId ].role, this.gameplay.get( 'affectedColor' ), this.replayData.names[ playerId ].name );
                this.geoMaps.addMarkerCssClass( playerId, this.gameplay.get( 'markerCssClassAlarm' ) );

                this.playerClassesAndColors[ playerId ].isSet.alarm = true;
              }
            }
          }

          // Capture
          if( this.playerClassesAndColors[ playerId ].capture ) {
            if( this.playerClassesAndColors[ playerId ].capture > targetTimestamp ) {
              if( this.playerClassesAndColors[ playerId ].isSet.capture ) {
                this.geoMaps.setIcon( playerId, this.replayData.names[ playerId ].role, this.replayData.names[ playerId ].color, this.replayData.names[ playerId ].name );

                this.playerClassesAndColors[ playerId ].isSet.capture = false;

                delete this.processedHighlight[ this.playerClassesAndColors[ playerId ].capture ];

                if( window[ appAlias ].playerId === playerId ) this.geoMaps.addMarkerCssClass( playerId, this.gameplay.get( 'markerCssClassMyOwn' ) );
              }
            }  else {
              if( ! this.playerClassesAndColors[ playerId ].isSet.capture ) {
                this.geoMaps.setIcon( playerId, this.replayData.names[ playerId ].role, this.gameplay.get( 'capturedColor' ), this.replayData.names[ playerId ].name );
                this.geoMaps.addMarkerCssClass( playerId, this.gameplay.get( 'markerCssClassCaptured' ) );

                this.playerClassesAndColors[ playerId ].isSet.capture   = true;

                if( window[ appAlias ].playerId === playerId ) this.geoMaps.addMarkerCssClass( playerId, this.gameplay.get( 'markerCssClassMyOwn' ) );
              }
            }
          }
        }
      }
    }

    const targetTime = new Date( targetTimestamp * 1000 );

    document.querySelector( '#replay-clock' ).innerText = targetTime.toLocaleTimeString( 'de-DE' );

    return;
  }

/**
 * This method can be used for highlights, it sets the timeline by 5 tracking points
 * of the passed player back, reduces the speed, sets the center of the map
 * on the passed player and zooms in on this point.
 * The “camera” then moves back to the starting point and leaves the replay in the
 * expire old speed.
 *
 * @public
 *
 * @param     {string}   playerId             The ID of the player this highlight is about
 * @param     {number}   highlightTimestamp   The timestamp of the timeline to the normal timeline was interrupted
 * @param     {number}   timelineIndex        The index of the timeline where the highlight was started
 * @return    {void}
 *
 * @example   replayPlayer.startHighlight( 'max@musterman.de', 1782150381, 378 );
 *
 */
  startHighlight( playerId, highlightTimestamp, timelineIndex ) {
    this.pause();

    document.querySelector( '#replay-highlight-repeat' ).classList.remove( 'hidden' );

    this.isHighlightActive        = true;

    const oldCameraCenterPosition = this.mapInstance.getCenter();
    const oldCameraZoom           = this.mapInstance.getZoom();
    const oldSpeed                = this.speedMultiplier;
    const savedTimelineTime       = this.currentVirtualTimestamp;
    let highlightPoint            = null;
    let foundPoints               = 0;

    for( let i = timelineIndex; i >= 0; i-- ) {
      if( this.tracking[ i ].timestamp > highlightTimestamp ) continue;
      if( this.tracking[ i ].playerId !== playerId || this.tracking[ i ].type !== 'tracking' ) continue;

      foundPoints++;

      if( foundPoints < 5 ) continue;

      highlightPoint = this.tracking[ i ];

      break;
    }

    if( highlightPoint === null ) return;

    this.currentVirtualTimestamp = highlightPoint.timestamp;

    const realLatLng   = L.latLng( highlightPoint.lat, highlightPoint.lng );
    const pixelPoint   = this.mapInstance.latLngToContainerPoint( realLatLng );

    pixelPoint.y      += 8;

    const offsetLatLng = this.mapInstance.containerPointToLatLng( pixelPoint );

    this.mapInstance.flyTo( [ parseFloat( offsetLatLng.lat ), parseFloat( offsetLatLng.lng ) ], 18, { 'animate': true, 'duration': 2.0, 'paddingBottomRight': [ 0, 100 ] } );

    const checkIsHighlight = () => {
      if( this.mapInstance.getZoom() !== 18 ) return;

      this.mapInstance.off( 'moveend', checkIsHighlight );

      const eventMoveEnd = new CustomEvent( 'custom_moveend', {
        'detail': {
          'method': this._highlightFadeIn,
          'oldCameraCenterPosition': oldCameraCenterPosition,
          'oldCameraZoom': oldCameraZoom,
          'highlightTimestamp': highlightTimestamp,
          'speedMultiplier': oldSpeed
        }
      } );

      document.querySelector( '.replay-panel' ).dispatchEvent( eventMoveEnd );

      return;
    };

    this.mapInstance.on( 'moveend', checkIsHighlight );

    return;
  }

/**
 * This method runs the initial sequence of the highlight.
 * It sets the playback speed to 10 times the normal speed
 * and zooms to the zoom level specified in the event details.
 *
 * @private
 *
 * @param     {object}   event  The event with additional information in the attribute detail
 * @return    {void}
 *
 * @example   replayPlayer._highlightFadeIn( event );
 *
 */
  _highlightFadeIn( event ) {
    this.speedMultiplier = 10;

    this.play();

    const highlightWatcher = setInterval( () => {
      if( this.currentVirtualTimestamp >= event.detail.highlightTimestamp ) {
        clearInterval( highlightWatcher );
        this.pause();

        setTimeout( () => {
          this.mapInstance.flyTo( event.detail.oldCameraCenterPosition, event.detail.oldCameraZoom, { 'animate': true, 'duration': 2.0 } );

          this.mapInstance.once( 'moveend', () => {
            event.detail.method = this._highlightFadeOut;
            document.querySelector( '.replay-panel' ).dispatchEvent( event );
          } );
        }, 2000 );
      }
    }, 100 );

    return;
  }

/**
 * This method ends the highlight and sets all parameters back to how they were before the highlight.
 *
 * @private
 *
 * @param     {object}   event  The event with additional information in the attribute detail
 * @return    {void}
 *
 * @example   replayPlayer._highlightFadeOut( event );
 *
 */
  _highlightFadeOut( event ) {
    this.currentVirtualTimestamp = event.detail.highlightTimestamp;
    this.speedMultiplier         = event.detail.speedMultiplier;
    this.isHighlightActive       = false;

    this.play();

    document.querySelector( '#replay-highlight-repeat' ).classList.add( 'hidden' );

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
 *
 */
  calculateIntermediatePoint( playerId, targetTimestamp ) {
    let lastPing = null;
    let nextPing = null;

    if( typeof this.playerIndices[ playerId ] === 'undefined' ) this.playerIndices[ playerId ] = 0;
    if( this.tracking[ this.playerIndices[ playerId ] ] && parseInt( this.tracking[ this.playerIndices[ playerId ] ].timestamp ) > targetTimestamp ) this.playerIndices[ playerId ] = 0;

    for( let i = this.playerIndices[ playerId ]; i < this.tracking.length; i++ ) {
      const ping = this.tracking[ i ];

      if( ping.playerId !== playerId ) continue;

      const pingTime = parseInt( ping.timestamp );

      if( ping.type !== 'tracking' ) {
        this.playerClassesAndColors[ playerId ] = this.playerClassesAndColors[ playerId ] || {};
        this.playerClassesAndColors[ playerId ][ ping.type ] = pingTime;

        if( ping.type === 'capture' && ! this.processedHighlight[ pingTime ] ) {
          this.processedHighlight[ pingTime ] = true;
          this.startHighlight( ping.playerId, pingTime, i );

          break;
        }

        continue;
      }

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

    const timeDeltaTotal = parseInt( nextPing.timestamp ) - parseInt( lastPing.timestamp );

    if( timeDeltaTotal <= 0 ) return { 'lat': parseFloat( lastPing.lat ), 'lng': parseFloat( lastPing.lng ) };

    const timeDeltaCurrent = targetTimestamp - parseInt( lastPing.timestamp );
    const progress         = timeDeltaCurrent / timeDeltaTotal;
    const interpolatedLat  = parseFloat( lastPing.lat ) + ( parseFloat( nextPing.lat ) - parseFloat( lastPing.lat ) ) * progress;
    const interpolatedLng  = parseFloat( lastPing.lng ) + ( parseFloat( nextPing.lng ) - parseFloat( lastPing.lng ) ) * progress;

    return { 'lat': interpolatedLat, 'lng': interpolatedLng };
  }

/**
 * This method switches the HTML button objects for playing and pausing the replay active or inactive
 *
 * @public
 *
 * @param     {object}   activeBtn          The currently active Html button object which should become inactive
 * @param     {string}   inactiveBtnId   The Css selector of the Html button object that should become active
 * @return    {void}
 *
 * @example   replayPlayer.toggleButtonClass( activeBtn, inactiveBtnId );
 *
 */
  toggleButtonClass( activeBtn, inactiveBtnId ) {
    activeBtn.classList.add( 'btn-active' );
    document.querySelector( inactiveBtnId ).classList.remove( 'btn-active' );

    return;
  }

}
