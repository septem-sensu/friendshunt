window[ appAlias ].methods.gameplay  = window[ appAlias ].methods.gameplay || {};
window[ appAlias ].listener.gameplay = window[ appAlias ].listener.gameplay || {};
window[ appAlias ].tracker           = window[ appAlias ].tracker || {};
window[ appAlias ].gameplayState     = window[ appAlias ].gameplayState || {};

window[ appAlias ].methods.gameplay.init = function() {
  window[ appAlias ].tracker.geoTrackerObject = new GeoTracker();
  window[ appAlias ].tracker.geoTrackerObject.getCurrentPosition( 'setMap' );
  window[ appAlias ].tracker.geoTrackerObject.startIntervalTracking( 'track' );

  return;
};

window[ appAlias ].methods.gameplay.setMap = function( lat, lng, precision, message ) {
  window[ appAlias ].tracker.geoMapsObject = new GeoMaps();

  window[ appAlias ].tracker.geoMapsObject.setMap( lat, lng, 'map' );
  window[ appAlias ].methods.gameplay.track( lat, lng, precision, message );

  return;
};

window[ appAlias ].methods.gameplay.track = function( lat, lng, precision, message ) {
  var objPost = { 'class': 'Game', 'id': window[ appAlias ].id, 'methode': 'gameplay' };

  objPost.gameplayMethode = 'track';
  objPost.callback        = 'setPositions';
  objPost.playerId        = window[ appAlias ].playerId;
  objPost.lat             = lat;
  objPost.lng             = lng;
  objPost.precision       = precision;
  objPost.message         = message;
  objPost.timestamp       = new Date().getTime();

  console.log( 'track' );

  return window[ appAlias ].methods.request( 'POST', { "result": "json", "view": window[ appAlias ].view.alias }, objPost, 'proccessResponse' );
};

window[ appAlias ].methods.gameplay.setPositions = function( objResponse ) {
  var arrColors = [ '#00aa00', '#ff0000', '#0000ff', '#ff00ff', '#00aaaa', '#aaaa00', '#000000', '#00aa00', '#ff0000', '#0000ff', '#ff00ff', '#00aaaa', '#aaaa00', '#000000' ];
  var i         = 0;

  for( i = 0; i < objResponse.result.positions.hunter.length; i++ ) {
    if( objResponse.result.positions.hunter[ i ].position.length < 1 ) continue;

    var objTracking     = objResponse.result.positions.hunter[ i ];
    var objLastPosition = objTracking.position.at( -1 );
    var strContent      = '<b>' + objTracking.name + '</b> Jäger <a id="TestMarkus" href="javascript: document.querySelector(\'#game-images-upload\').click();">Silent Hunt</a>' + objLastPosition.precision + ' Meter ' + window[ appAlias ].methods.gameplay.timestampToDateTimeString( objLastPosition.timestamp, 'time' );

    window[ appAlias ].tracker.geoMapsObject.setMarker( objTracking.id, 'hunter', arrColors[ i ], objLastPosition.lat, objLastPosition.lng, strContent );
  }

  for( i = 0; i < objResponse.result.positions.player.length; i++ ) {
    if( objResponse.result.positions.player[ i ].position.length < 1 ) continue;

    var objTracking     = objResponse.result.positions.player[ i ];
    var objLastPosition = objTracking.position.at( -1 );
    var strContent      = '<b>' + objTracking.name + '</b> Spieler ' + objLastPosition.precision + ' Meter ' + window[ appAlias ].methods.gameplay.timestampToDateTimeString( objLastPosition.timestamp, 'time' );

    window[ appAlias ].tracker.geoMapsObject.setMarker( objTracking.id, 'player', arrColors[ i ], objLastPosition.lat, objLastPosition.lng, strContent );
  }

  for( i = 0; i < objResponse.result.positions.management.length; i++ ) {
    if( objResponse.result.positions.management[ i ].position.length < 1 ) continue;

    var objTracking     = objResponse.result.positions.management[ i ];
    var objLastPosition = objTracking.position.at( -1 );
    var strContent      = '<b>' + objTracking.name + '</b> Spielleitung ' + objLastPosition.precision + ' Meter ' + window[ appAlias ].methods.gameplay.timestampToDateTimeString( objLastPosition.timestamp, 'time' );

    window[ appAlias ].tracker.geoMapsObject.setMarker( objTracking.id, 'management', arrColors[ i ], objLastPosition.lat, objLastPosition.lng, strContent );
  }

  return;
};

window[ appAlias ].methods.gameplay.timestampToDateTimeString = function( strTimestamp, strFormat ) {
  const objDateTime = new Date( strTimestamp * 1000 );

  if( strFormat == 'date' ) {
    return objDateTime.toLocaleDateString( 'de-DE' );
  } else if( strFormat == 'time' ) {
    return objDateTime.toLocaleTimeString( 'de-DE', { hour: '2-digit', minute: '2-digit', second: '2-digit' } );
  }

  return objDateTime.toLocaleString( 'de-DE' );
};












window.addEventListener( 'load', function() {
  window[ appAlias ].methods.gameplay.init();

  return;
} );

window.addEventListener( 'pageshow', function() {

  return;
} );