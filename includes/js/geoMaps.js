class GeoMaps {
  constructor() {
    this.zoomLevel    = 14; // Standard-Zoomstufe für die Kartendarstellung
    this.maxZoomLevel = 19; // Maximale Zoomstufe, die von der Karte unterstützt wird
    this.selector     = 'map';
    this.marker       = {};
    this.map          = {};

    return;
  }

  setMap( lat, lng ) {
    this.map = L.map( this.selector ).setView( [ lat, lng ], this.zoomLevel );

    L.tileLayer( 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: this.maxZoomLevel,
      attribution: '© OpenStreetMap'
    } ).addTo( this.map );

    return;
  }

  setMarker( id, role, color, lat, lng, content ) {
    const icon   = this.getIcon( role, color );

    if( this.marker[ id ] ) this.marker[ id ].remove();

    this.marker[ id ] = L.marker( [ lat, lng ], { icon: icon } ).addTo( this.map );
    this.marker[ id ].bindPopup( content );

    return;
  }

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
