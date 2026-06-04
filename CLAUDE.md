# CLAUDE.md This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Projektübersicht

Friendshunt ist eine PHP-basierte Web-Anwendung für Geo-Games (Schnitzeljagd/Capture-the-Flag-Spiele) mit Live-GPS-Tracking. Spieler werden auf einer Karte verfolgt, Jäger (Hunter) versuchen sie zu finden. Die App UI ist auf Deutsch.

## Entwicklungsserver

Lokaler Dev-Server über Five Server (Proxy auf `http://127.0.0.1:8000`):
```bash
npx five-server
```
Konfiguration in `.fiveserverrc`. Kein Composer, kein npm-Build, keine Tests vorhanden.

## Architektur

### Request-Flow

1. **Einstiegspunkt**: `index.php` → erstellt `Controller`
2. **Controller** (`includes/classes/controller.php`): Liest `?view=X` und `?id=Y` aus GET-Parametern, lädt die entsprechende View-JSON
3. **View-JSON** (`includes/json/views/*.json`): Definiert Klasse, Rollen, Templates und Actions für jede Seite
4. **Rollen-Check**: Controller prüft `dataDependencies.json` für Methoden-Berechtigungen pro Rolle (`guest`, `player`, `administrator`)
5. **Zwei Antwort-Modi**: `?result=json` → JSON-API-Antwort, sonst → HTML-Rendering

### Klassen-Hierarchie

- **BaseObject** (`baseObject.php`): Wurzelklasse. Verwaltet JSON-Datei-Persistence mit AES-256-CBC-Verschlüsselung. Alle Daten liegen in `includes/json/data/` (verschlüsselt + Klartext-Duplicate mit `.json.json`-Endung). IDs werden per `uniqid()` generiert.
- **Presentation** (`presentation.php`): Template-Engine mit `{{Class::property}}`-Platzhaltern, Cookie-Verwaltung, Formularvalidierung, E-Mail-Versand
- **Player** (`player.php`): Erbt BaseObject. Login/Registrierung (E-Mail als ID), Cookie-basierte Authentifizierung mit verschlüsseltem Token
- **Game** (`game.php`): Erbt BaseObject. Spiele-Erstellung mit Spieler/Hunter/Management-Rollen, Gameplay-Daten in separaten Dateien unter `includes/files/game/{gameId}/`
- **Gameplay** (`gameplay.php`): Erbt Game. Laufzeit-Spiellogik: GPS-Tracking, Silent Hunt (periodische Positionsabfrage), Speed Hunt (beschleunigte Abfrage), Spielsatus-Berechnung

### Frontend

- **Template-System**: `.tmpl`-Dateien in `includes/templates/` mit `{{placeholder}}`-Syntax
- **JS-Architektur**: Alles hängt am globalen `window[appAlias]`-Objekt (appAlias = "Friendshunt")
  - `communication.js`: XHR-Request-Queue mit Retry-Logik
  - `listener.js`: Event-Listener für alle UI-Interaktionen
  - `validation.js`: Clientseitige Formularvalidierung
  - `custom.js`: UI-Helfer (Spiel-Listen, Dashboard-Rendering)
  - `geoTracking.js`: `GeoTracker`-Klasse für GPS-Positionsabfrage per `navigator.geolocation`
  - `geoMaps.js`: `GeoMaps`-Klasse, Leaflet-Karte mit rollenbasierten SVG-Markern
  - `gameplay.js`: Spielablauf-Steuerung (Tracking-Intervall, Karten-Updates)
- **Karte**: Leaflet.js mit OpenStreetMap-Tiles (`includes/libs/leaflet/`)

### Daten-Layout

| Pfad | Inhalt |
|------|---------|
| `includes/json/config.json` | App-Konfiguration (Version, Cookie-Name, Default-Views, Passwort-Regeln) |
| `includes/json/fields/*.json` | Feld-Definitionen pro Klasse (Typ, Pflicht, Position, Optionen) |
| `includes/json/views/*.json` | View-Konfiguration (Klasse, Rollen, Templates, Actions) |
| `includes/json/data/data*.json` | Verschlüsselte Persistenz-Daten |
| `includes/json/data/dataDependencies.json` | Methoden-Berechtigungen pro Rolle |
| `includes/files/player/{email}/` | Spieler-Dateien (Avatare) |
| `includes/files/game/{gameId}/` | Spiel-Dateien (Avatar, gameplay.json, tracking_{playerId}.json) |
| `includes/templates/*.tmpl` | HTML-Templates |
| `includes/css/` | Stylesheets (Theming über `themes/default.css`) |

## Konventionen

- PHP mit `declare(strict_types = 1)` durchgehend
- Verschlüsselung: Alle Daten-Dateien werden mit AES-256-CBC verschlüsselt gespeichert. Die `.json.json`-Klartext-Dublatten sind nur Dev-Debug-Hilfen und werden vor Produktivbetrieb gelöscht (Methode dann auskommentieren)
- IDs: Player nutzen E-Mail als ID, Games nutzen `uniqid('game_')`
- Auth: Cookie-basiert mit verschlüsseltem Token (`{email}|||{password_hash}`)
- Formularvalidierung: Serverseitig über `Presentation::validateFields()` mit Feld-Definitionen, Clientseitig über `validation.js`
- JS-Coding: `window[appAlias].methods.*` für Funktionen, `window[appAlias].listener.*` für Event-Listener
- Kein Composer, kein npm-Build, keine Test-框架 vorhanden
