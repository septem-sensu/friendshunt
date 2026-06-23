/**
 * Geo Maps Class for the Friends Hunt App.
 *
 * This Class represents the Geo Maps Class for the Friends Hunt App with his Properties and Methods.
 * The Class is for handling Leaflet with OpenStreetMap.
 *
 * @class
 *
 * @see leaflet
 *
 * @author    Markus Götz <info@septem-sensu.de>
 * @version   0.1.0
 * @since     2026-06-05
 *
 * @example   const geoMaps = new GeoMaps();
 *
 */
class GeoMaps {

/**
 * This Method is the Constructor for this Class.
 *
 * @public
 *
 * @return    {void}
 *
 * @example   const geoMaps = new GeoMaps();
 *
 */
  constructor() {
    this.zoomLevel    = 14; // Standard-Zoomstufe für die Kartendarstellung
    this.maxZoomLevel = 19; // Maximale Zoomstufe, die von der Karte unterstützt wird
    this.selector     = 'map';
    this.marker       = {};
    this.centreZone   = {};
    this.isResizing   = {};
    this.justResized  = {};
    this.map          = null;
    this.debug        = window[ appAlias ].debug ? true : false;

    return;
  }

/**
 * This Method is the default getter of the Class.
 *
 * @public
 *
 * @param     {string}   property   The Property to get
 * @return    {*}        value      The Value of the Property
 *
 * @example   let value = geoMaps.get( property );
 *
 * @see GeoMaps#set
 *
 */
  get( property ) {
    return this[ property ];
  }

/**
 * This Method is the default setter of the Class.
 *
 * @public
 *
 * @param     {string}   property   The Property to set
 * @param     {*}        value      The Value to set
 * @return    {void}
 *
 * @example   geoMaps.set( property, value );
 *
 * @see GeoMaps#get
 *
 */
  set( property, value ) {
    this[ property ] = value;

    return;
  }

/**
 * This Method set the Map in the Page.
 *
 * @public
 *
 * @param     {number}  lat         The current Latitude
 * @param     {number}  lng         The current Longitude
 * @return    {object}  map      The Leaflet Map Object
 *
 * @example   const map      = geoMaps.setMap( lat, lng );
 *
 */
  setMap( lat, lng ) {
    if( this.map ) return;

    this.map = L.map( this.selector ).setView( [ lat, lng ], this.zoomLevel );

    L.tileLayer( 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: this.maxZoomLevel,
      attribution: '© OpenStreetMap'
    } ).addTo( this.map );

    return this.map;
  }

/**
 * This Method set a Marker with Popup on the Map.
 *
 * @public
 *
 * @param     {string}  id        The Game Player Id (Marker Id)
 * @param     {string}  role      The Game Player Role (player, hunter or management)
 * @param     {string}  color     The Game Player Color
 * @param     {number}  lat       The Latitude of the Game Player
 * @param     {number}  lng       The Longitude of the Game Player
 * @param     {string}  content   The Content of the Popup
 * @param     {string}  name      The Text at the Icon
 * @param     {string}  cssclass  The css Class for the Icon
 * @return    {void}
 *
 * @example   geoMaps.setMarker( id, role, color, lat, lng, content, name );
 *
 */
  setMarker( id, role, color, lat, lng, content, name, cssclass ) {
    const icon   = this.getIcon( role, color, name );

    if( cssclass && cssclass !== '' ) icon.classList.add( cssclass );

    if( this.marker[ id ] ) this.marker[ id ].remove();

    this.marker[ id ] = L.marker( [ lat, lng ], { icon: icon } ).addTo( this.map );
    if( typeof content === 'string' && content !== '' ) this.marker[ id ].bindPopup( content );

    return;
  }

/**
 * This Method remove a Marker from the Map.
 *
 * @public
 *
 * @param     {string}  id        The Game Player Id to remove from Map
 * @return    {void}
 *
 * @example   geoMaps.removeMarker( id );
 *
 */
  removeMarker( id ) {
    if( this.marker[ id ] ) this.marker[ id ].remove();

    return;
  }

/**
 * This Method set a Marker with Popup interactive with click on the Map.
 *
 * @public
 *
 * @param     {string}  id        The Game Player Id (Marker Id)
 * @param     {string}  role      The Game Player Role (player, hunter or management)
 * @param     {string}  color     The Game Player Color
 * @param     {string}  content   The Content of the Popup
 * @param     {string}  selector  The Selector of a input Fiel to set the coordinates
 * @return    {void}
 *
 * @example   geoMaps.setMarkerInteractive( id, role, color, content, selector );
 *
 */
  setMarkerInteractive( id, role, color, content, selector ) {
    document.querySelector( '#map' ).classList.add( 'mode-set-points' );

    this.map.on( 'click', ( event ) => {
      if( this.marker[ id ] ) this.marker[ id ].remove();

      this.marker[ id ] = L.marker( event.latlng, { 'icon': this.getIcon( role, color ) } ).addTo( this.map );
      this.marker[ id ].bindPopup( content );

      if( selector && document.querySelector( selector ) != null ) {
        const lat = event.latlng.lat;
        const lng = event.latlng.lng;

        document.querySelector( selector ).value = `${lat.toFixed( 6 )},${lng.toFixed( 6 )}`;
      }

      return;
    } );

    return;
  }

/**
 * This Method set a new Icon on the Marker.
 *
 * @public
 *
 * @param     {string}  id        The Game Player Id (Marker Id)
 * @param     {string}  role      The Game Player Role (player, hunter or management)
 * @param     {string}  color     The Game Player Color
 * @param     {string}  name      The Text at the Icon
 * @return    {void}
 *
 * @example   geoMaps.setIcon( id, role, color, name );
 *
 */
  setIcon( id, role, color, name ) {
    const icon = this.getIcon( role, color, name );

    this.marker[ id ].setIcon( icon );

    return;
  }

/**
 * This Method add a css Class to a Marker Icon.
 *
 * @public
 *
 * @param     {string}  id        The Game Player Id (Marker Id)
 * @param     {string}  cssClass  The css Class to add the Marker Icon
 * @return    {void}
 *
 * @example   geoMaps.addMarkerCssClass( id, cssClass );
 *
 */
  addMarkerCssClass( id, cssClass ) {
    const icon = this.marker[ id ]._icon;

    if( ! icon ) return;
    if( icon.classList.contains( cssClass ) ) return;

    icon.classList.add( cssClass );

    return;
  }

/**
 * This Method check a Marker Icon whether contains a css Class.
 *
 * @public
 *
 * @param     {string}  id         The Game Player Id (Marker Id)
 * @param     {string}  cssClass   The css Class to remove from the Marker Icon
 * @return    {boolean} result  Contains the css Class at the Marker Icon
 *
 * @example   const result = geoMaps.containsMarkerCssClass( id, cssClass );
 *
 */
  containsMarkerCssClass( id, cssClass ) {
    const icon = this.marker[ id ]._icon;

    if( ! icon ) return false;

    return icon.classList.contains( cssClass ) ? true : false;
  }

/**
 * This Method remove a css Class from a Marker Icon.
 *
 * @public
 *
 * @param     {string}  id        The Game Player Id (Marker Id)
 * @param     {string}  cssClass  The css Class to remove from the Marker Icon
 * @return    {void}
 *
 * @example   geoMaps.removeMarkerCssClass( id, cssClass );
 *
 */
  removeMarkerCssClass( id, cssClass ) {
    const icon = this.marker[ id ]._icon;

    if( ! icon ) return;
    if( ! icon.classList.contains( cssClass ) ) return;

    icon.classList.remove( cssClass );

    return;
  }

/**
 * This Method set a circle on the Map.
 *
 * @public
 *
 * @param     {string}  id        The Game Player Id (Circle Id)
 * @param     {number}  lat       The Latitude of the Center of the Circle
 * @param     {number}  lng       The Longitude of the Center of the Circle
 * @param     {number}  size      The Radius of the Circle
 * @param     {string}  color     The Color of the Circle edge
 * @param     {number}  weight    The weight of the Circle edge
 * @param     {string}  fillColor The fill Color of the Circle
 * @param     {number}  opacity   The Opacity of the Circle
 * @return    {void}
 *
 * @example   geoMaps.setCircle( id, lat, lng, size, color, weight, fillColor, opacity );
 *
 */
  setCircle( id, lat, lng, size, color, weight, fillColor, opacity ) {
    if( this.marker[ id ] ) this.marker[ id ].remove();

    this.marker[ id ] = L.circle( [ lat, lng ], {
      'radius': size,
      'color': color,
      'weight': weight,
      'fillColor': fillColor,
      'fillOpacity': opacity,
      'interactive': false
    } ).addTo( this.map );

    return;
  }

/**
 * This Method set a circle on the Map interactive with click to the Map.
 *
 * @public
 *
 * @param     {string}  id              The Game Player Id (Circle Id)
 * @param     {number}  size            The Radius of the Circle
 * @param     {string}  color           The Color of the Circle edge
 * @param     {number}  weight          The weight of the Circle edge
 * @param     {string}  fillColor       The fill Color of the Circle
 * @param     {number}  opacity         The Opacity of the Circle
 * @param     {string}  selector        The Selector of a input Field to set the coordinates
 * @param     {string}  selectorRadius  The Selector of a input Field to set the radius
 * @return    {void}
 *
 * @example   geoMaps.setCircleInteractive( id, size, color, weight, fillColor, opacity, selector, selectorRadius );
 *
 */
  setCircleInteractive( id, size, color, weight, fillColor, opacity, selector, selectorRadius ) {
    document.querySelector( '#map' ).classList.remove( 'mode-set-points' );

    this.map.on( 'click', ( event ) => {
      if( this.isResizing[ id ] || this.justResized[ id ] ) {
        this.justResized[ id ] = false;

        return;
      }

      this.centreZone[ id ] = event.latlng;

      if( selector && document.querySelector( selector ) != null ) {
        const lat = event.latlng.lat;
        const lng = event.latlng.lng;

        document.querySelector( selector ).value = `${lat.toFixed( 6 )},${lng.toFixed( 6 )}`;
      }

      if( this.marker[ id ] ) {
        this.marker[ id ].setLatLng( this.centreZone[ id ] );
      } else {
        this.marker[ id ] = L.circle( this.centreZone[ id ], {
          'radius': size,
          'color': color,
          'weight': weight,
          'fillColor': fillColor,
          'fillOpacity': opacity,
          'interactive': true
        } ).addTo( this.map );

        this.bindResizeEvents( id, selectorRadius );
      }

      return;
    } );

    return;
  }

/**
 * This Method is a Helper Method to bind Event Listener for Drag and Drop to set the circle radius on the Map interactive.
 *
 * @public
 *
 * @param     {string}  id              The Game Player Id (Circle Id)
 * @param     {number}  selectorRadius  The Selector of a input Field to set the radius
 * @return    {void}
 *
 * @example   geoMaps.bindResizeEvents( id, selectorRadius );
 *
 */
  bindResizeEvents( id, selectorRadius ) {
    const circleElement = this.marker[ id ].getElement();

    if( ! circleElement ) return;

    this.marker[ id ].on( 'mousedown', ( event ) => {
      this.isResizing[ id ]  = true;
      this.justResized[ id ] = false;

      L.DomEvent.stopPropagation( event );
      this.map.dragging.disable();

      return;
    } );

    circleElement.addEventListener( 'touchstart', ( htmlEvent ) => {
      this.isResizing[ id ]  = true;
      this.justResized[ id ] = false;

      htmlEvent.stopPropagation();
      this.map.dragging.disable();

      return;
    }, { 'passive': false } );

    this.map.on( 'mousemove', ( event ) => {
      if( ! this.isResizing[ id ] ) return;

      const radiusInMeters = this.marker[ id ].getLatLng().distanceTo( event.latlng );

      if( radiusInMeters >= 100 && radiusInMeters <= 10000 ) {
        this.marker[ id ].setRadius( radiusInMeters );

        if( radiusInMeters && document.querySelector( selectorRadius ) != null ) {
          if( this.debug ) console.log( 'Radius: ' + radiusInMeters + ' Meter' );

          document.querySelector( selectorRadius ).value = Math.round( radiusInMeters );
        }
      }

      return;
    } );

    window.addEventListener( 'touchmove', ( htmlEvent ) => {
      if( ! this.isResizing[ id ] ) return;

      htmlEvent.preventDefault();

      const touch          = htmlEvent.touches[ 0 ];
      const containerPoint = this.map.mouseEventToContainerPoint( touch );
      const geoCoords      = this.map.containerPointToLatLng( containerPoint );
      const radiusInMeters = this.marker[ id ].getLatLng().distanceTo( geoCoords );

      if( radiusInMeters >= 100 && radiusInMeters <= 10000 ) {
        this.marker[ id ].setRadius( radiusInMeters );

        if( radiusInMeters && document.querySelector( selectorRadius ) != null ) {
          if( this.debug ) console.log( 'Radius: ' + radiusInMeters + ' Meter' );

          document.querySelector( selectorRadius ).value = Math.round( radiusInMeters );
        }
      }

      return;
    }, { 'passive': false });

    this.map.on( 'mouseup', ( event ) => {
      if( this.isResizing[ id ] ) {
        L.DomEvent.stopPropagation( event );

        this.isResizing[ id ]  = false;
        this.justResized[ id ] = true;

        this.map.dragging.enable();
      }

      return;
    } );

    window.addEventListener( 'touchend', ( htmlEvent ) => {
      if( this.isResizing[ id ] ) {
        htmlEvent.stopPropagation();

        this.isResizing[ id ]  = false;
        this.justResized[ id ] = true;

        this.map.dragging.enable();
      }

      return;
    } );
  }

/**
 * This Method return the Position Object of a Id.
 *
 * @public
 *
 * @param     {string}  id            The Id
 * @return    {object}  position   The Leaflet Position Object
 *
 * @example   const position = geoMaps.getPosition( id );
 *
 */
  getPosition( id ) {
    return this.marker[ id ].getLatLng();
  }

/**
 * This Method return the calculated distance between two Ids in Meters.
 *
 * @public
 *
 * @param     {string}  id1             The Id1
 * @param     {string}  id2             The Id2
 * @return    {number}  distance   The distance between two Ids in Meters
 *
 * @example   const distance = geoMaps.getDistance( id1, id2 );
 *
 */
  getDistance( id1, id2 ) {
    const latLng1 = this.marker[ id1 ].getLatLng();
    const latLng2 = this.marker[ id2 ].getLatLng();

    return latLng1.distanceTo( latLng2 );
  }

/**
 * This Method returns a Icon Vector Object for the Game Player Role.
 *
 * @public
 *
 * @param     {string}  role      The Game Player Role (player, hunter or management)
 * @param     {string}  color     The Game Player Color
 * @param     {string}  name      The Text at the Icon
 * @return    {object}  icon       The Leaflet DivIcon Object
 *
 * @example   const icon = geoMaps.getIcon( role, color, name );
 *
 */
  getIcon( role, color, name ) {
    let svgContent = '';
    const size     = 30;
    let content    = '';

    switch ( role ) {
      case 'hunter': // Ein Fadenkreuz / Visier für die Jäger
        svgContent = `
          <svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="1" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10" stroke-dasharray="4 2"/>
            <circle cx="12" cy="12" r="3" fill="${color}"/>
            <line x1="12" y1="1" x2="12" y2="4"/>
            <line x1="12" y1="20" x2="12" y2="23"/>
            <line x1="1" y1="12" x2="4" y2="12"/>
            <line x1="20" y1="12" x2="23" y2="12"/>
          </svg>`;
        break;

      case 'player': // Ein schicker, rennender Keil / Pfeil für die Gejagten
        svgContent = `
          <svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="${color}" stroke="#FFFFFF" stroke-width="1">
            <path d="M12 2L2 22l10-4 10 4z"/>
          </svg>`;
        break;

      case 'management': // Ein Schild / Wappen mit Stern für die Spielleitung
        svgContent = `
          <svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            <polygon points="12 11 13.5 14.5 17 14.5 14 16.5 15.5 20 12 18 8.5 20 10 16.5 7 14.5 10.5 14.5" fill="${color}"/>
          </svg>`;
        break;

      case 'start': // Start-Flagge / Dropzone
        svgContent = `
          <svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <!-- Äußerer taktischer Ring -->
            <!-- <circle cx="12" cy="12" r="10" stroke-dasharray="3 3"/> -->
            <!-- Die Flagge -->
            <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" fill="${color}" fill-opacity="0.5"/>
            <line x1="4" y1="22" x2="4" y2="15"/>
          </svg>`;
        break;

      case 'exit': // Exit-Zone / Extraction Point
        svgContent = `
          <svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <!-- Äußerer Sicherheitsring -->
              <!-- <circle cx="12" cy="12" r="10"/> -->
              <!-- Das rettende Tor mit Pfeil nach draußen -->
              <path d="M10 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h4"/>
              <polyline points="14 17 19 12 14 7"/>
              <line x1="19" y1="12" x2="8" y2="12"/>
          </svg>`;
        break;

      default: // Fallback: Ein einfacher Punkt
        svgContent = `<svg width="${size}" height="${size}"><circle cx="18" cy="18" r="8" fill="${color}"/></svg>`;
    }

    if( name && name !== '' ) {
      content += '<div class="tactical-marker-wrapper">';
      content += svgContent;
      content += '<span class="marker-label" style="color: ' + color + ';">' + name + '</span>';
      content += '</div>';
    } else {
      content += svgContent;
    }

    return L.divIcon( {
      html: content,
      className: 'tactical-marker',
      iconSize: [size, size],
      iconAnchor: [size / 2, size / 2], // Zentriert das Icon exakt auf der Koordinate
      popupAnchor: [0, -size / 2]
    } );
  }
};
