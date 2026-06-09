/**
 * Geo Maps Class for the Friends Hunt App.
 *
 * This Class represents the Geo Maps Class for the Friends Hunt App with his Properties and Methods.
 * The Class is for handling Leaflet with OpenStreetMap.
 *
 * @class
 *
 * @author    Markus Götz <info@septem-sensu.de>
 * @version   0.1.0
 * @since     2026-06-05
 *
 * @example   var objGeoMaps = new GeoMaps();
 *
 */
class GeoMaps {

/**
 * This Method is the Constructor for this Class.
 *
 * @example   var objGeoMaps = new GeoMaps();
 *
 * @constructor
 */
  constructor() {
    this.zoomLevel    = 14; // Standard-Zoomstufe für die Kartendarstellung
    this.maxZoomLevel = 19; // Maximale Zoomstufe, die von der Karte unterstützt wird
    this.selector     = 'map';
    this.marker       = {};
    this.map          = {};

    return;
  }

/**
 * This Method is the default getter of the Class.
 *
 * @public
 * @param     {string}   property   The Property to get
 * @return    {mixed}    value      The Value of the Property
 *
 * @example   var value = objGeoMaps.get( property );
 *
 */
  get( property ) {
    return this[ property ];
  }

/**
 * This Method is the default setter of the Class.
 *
 * @public
 * @param     {string}   property   The Property to set
 * @param     {mixed}    value      The Value to set
 * @return    {void}
 *
 * @example   objGeoMaps.set( property, value );
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
 * @param     {number}  lat         The current Latidude
 * @param     {number}  lng         The current Langidude
 * @return    {object}  objMap      The Leaflet Map Object
 *
 * @example   var objMap = objGeoMaps.setMap( lat, lng );
 *
 */
  setMap( lat, lng ) {
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
 * @param     {string}  id        The Game Player Id
 * @param     {string}  role      The Game Player Role (player, hunter or management)
 * @param     {string}  color     The Game Player Color
 * @param     {number}  lat       The Latidude of the Game Player
 * @param     {number}  lng       The Langidude of the Game Player
 * @param     {string}  content   The Content of the Popup
 * @return    {void}
 *
 * @example   objGeoMaps.setMarker( id, role, color, lat, lng, content );
 *
 */
  setMarker( id, role, color, lat, lng, content ) {
    const icon   = this.getIcon( role, color );

    if( this.marker[ id ] ) this.marker[ id ].remove();

    this.marker[ id ] = L.marker( [ lat, lng ], { icon: icon } ).addTo( this.map );
    this.marker[ id ].bindPopup( content );

    return;
  }

/**
 * This Method returns a Icon Vector Object for the Game Player Role.
 *
 * @public
 * @param     {string}  role      The Game Player Role (player, hunter or management)
 * @param     {string}  color     The Game Player Color
 * @return    {string}  strImage  The Vector Object Image
 *
 * @example   strImage = objGeoMaps.getIcon( role, color );
 *
 */
  getIcon( role, color ) {
    let svgContent = "";
    const size = 30;

    switch ( role ) {
      case 'hunter': // Ein Fadenkreuz / Visier für die Jäger
        svgContent = `
          <svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
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
          <svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="${color}" stroke="#FFFFFF" stroke-width="1.5">
            <path d="M12 2L2 22l10-4 10 4z"/>
          </svg>`;
        break;

      case 'management': // Ein Schild / Wappen mit Stern für die Spielleitung
        svgContent = `
          <svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            <polygon points="12 11 13.5 14.5 17 14.5 14 16.5 15.5 20 12 18 8.5 20 10 16.5 7 14.5 10.5 14.5" fill="${color}"/>
          </svg>`;
        break;

      case 'start': // Start-Flagge / Dropzone
        svgContent = `
          <svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <!-- Äußerer taktischer Ring
              <circle cx="12" cy="12" r="10" stroke-dasharray="3 3"/> -->
              <!-- Die Flagge -->
              <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" fill="${color}" fill-opacity="0.2"/>
              <line x1="4" y1="22" x2="4" y2="15"/>
          </svg>`;
        break;

      case 'exit': // Exit-Zone / Extraction Point
        svgContent = `
          <svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <!-- Äußerer Sicherheitsring
              <circle cx="12" cy="12" r="10"/> -->
              <!-- Das rettende Tor mit Pfeil nach draußen -->
              <path d="M10 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h4"/>
              <polyline points="14 17 19 12 14 7"/>
              <line x1="19" y1="12" x2="8" y2="12"/>
          </svg>`;
        break;

      default: // Fallback: Ein einfacher Punkt
        svgContent = `<svg width="${size}" height="${size}"><circle cx="18" cy="18" r="8" fill="${color}"/></svg>`;
    }

    return L.divIcon( {
      html: svgContent,
      className: 'tactical-marker',
      iconSize: [size, size],
      iconAnchor: [size / 2, size / 2], // Zentriert das Icon exakt auf der Koordinate
      popupAnchor: [0, -size / 2]
    } );
  }
};
