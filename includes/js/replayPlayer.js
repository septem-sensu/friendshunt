class ReplayPlayer {
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

    this.initEvents();
  }

  initEvents() {
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

  pause() {
    this.isPlaying = false;
    if( this.playbackTimer ) clearInterval( this.playbackTimer );

    return;
  }

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

  toggleButtonClass( activeBtn, strInactiveBtnId ) {
    activeBtn.classList.add( 'btn-active' );
    document.querySelector( strInactiveBtnId ).classList.remove( 'btn-active' );
    return;
  }
}
