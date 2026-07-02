# 🛰️ Friends-Hunt

<table>
  <tr>
    <td><br /><img src="includes/images/favicons/friendshunt-app-icon-180x180.png" alt="Friends-Hunt App - Logo Icon" width="150" /><br /><br /></td>
    <td><b>Friends-Hunt</b> ist eine selbst-hostbare Progressive Web App (PWA) für Reallife-Geo-Games im Stil bekannter YouTube-Formate. Präzise GPS-Wegpunkte und Intervalle machen dein Smartphone zur mobilen Einsatzzentrale.</td>
  </tr>
</table>

<p float="left">
  <a href="https://www.php.net/" target="_blank" title="PHP"><img src="includes/images/php.png" alt="PHP" height="46" /></a>
  <a href="https://developer.mozilla.org/de/docs/Web/JavaScript" target="_blank" title="JavaScript"><img src="includes/images/javascript.png" alt="JavaScript" height="46" /></a>
  <a href="https://developer.mozilla.org/de/docs/Glossary/HTML5" target="_blank" title="HTML5"><img src="includes/images/html.png" alt="HTML" height="46" /></a>
  <a href="https://developer.mozilla.org/de/docs/Web/CSS" target="_blank" title="CSS3"><img src="includes/images/css.png" alt="CSS3" height="46" /></a>
  <a href="https://www.json.org/" target="_blank" title="JSON"><img src="includes/images/json.png" alt="JSON" height="46" /></a>
  <a href="https://www.openstreetmap.de/" target="_blank" title="OpenStreetMap"><img src="includes/images/openstreetmap.png" alt="OpenStreetMap" height="46" /></a>
  <a href="https://leafletjs.com/" target="_blank" title="Leaflet"><img src="includes/images/leaflet.png" alt="Leaflet" height="46" /></a>
  <a href="https://mozilla.org/" target="_blank" title="Progressive Web App (PWA)"><img src="includes/images/pwa.png" alt="Progressive Web App (PWA)" height="46" /></a>
  <a href="LICENSE" target="_blank" title="MIT-Lizenz"><img src="includes/images/mit.png" alt="MIT-Lizenz" height="46" /></a>
</p>

---

## 🗺️ Screenshots

<table>
  <tr>
    <td align="center"><p>Setup Ansicht</p><img src="includes/images/screenshots/screenshot-friends-hunt-setup-550x1024.png" alt="Friends-Hunt App - Setup Ansicht"  width="230" title="Friends-Hunt App - Setup Ansicht" /></td>
    <td align="center"><p>Gameplay Ansicht</p><img src="includes/images/screenshots/screenshot-friends-hunt-gameplay-550x1024.png" alt="Friends-Hunt App - Gameplay Ansicht"  width="230" title="Friends-Hunt App - Gameplay Ansicht" /></td>
    <td align="center"><p>Game Dashboard Ansicht</p><img src="includes/images/screenshots/screenshot-friends-hunt-dashboard-550x1024.png" alt="Friends-Hunt App - Game Dashboard Ansicht"  width="230" title="Friends-Hunt App - Game Dashboard Ansicht" /></td>
    <td align="center"><p>Messages Ansicht</p><img src="includes/images/screenshots/screenshot-friends-hunt-messages-550x1024.png" alt="Friends-Hunt App - Messages Ansicht"  width="230" title="Friends-Hunt App - Messages Ansicht" /></td>
  </tr>
  <tr>
    <td align="center"><p>My Account Ansicht</p><img src="includes/images/screenshots/screenshot-friends-hunt-my-account-550x1024.png" alt="Friends-Hunt App - My Account Ansicht"  width="230" title="Friends-Hunt App - My Account Ansicht" /></td>
    <td align="center"><p>System Messages Ansicht</p><img src="includes/images/screenshots/screenshot-friends-hunt-system-messages-550x1024.png" alt="Friends-Hunt App - System Messages Ansicht"  width="230" title="Friends-Hunt App - System Messages Ansicht" /></td>
    <td align="center"><p>Replay Player Ansicht</p><img src="includes/images/screenshots/screenshot-friends-hunt-replay-player-550x1024.png" alt="Friends-Hunt App - Replay Player Ansicht"  width="230" title="Friends-Hunt App - Replay Player Ansicht" /></td>
    <td align="center"><p>Themes Ansicht</p><img src="includes/images/screenshots/screenshot-friends-hunt-themes-550x1024.png" alt="Friends-Hunt App - Themes Ansicht"  width="230" title="Friends-Hunt App - Themes Ansicht" /></td>
  </tr>
</table>

---

## 🎯 Spielprinzip

Ein oder mehrere **Spieler (Gejagte)** versuchen, sich in einem definierten Gebiet unentdeckt zu bewegen und rechtzeitig eine Flucht-Zone zu erreichen. Die **Jäger (Hunter)** versuchen, sie anhand zeitversetzter GPS-Signale aufzuspüren. Die **Spielleitung (optional)** behält die Kontrolle über das Regelwerk und dirigiert das Event im Hintergrund.

- **Die Gejagten:** Bewegen sich strategisch von Start- zu Exit-Positionen und versuchen, den Huntern unter Ausnutzung von Gelände zu entkommen.
- **Die Jäger - (Hunter):** Verfolgen die Positionen der Spieler zeitversetzt auf der Karte. Ein Intervall-Wechsel fordert schnelles Reagieren und clevere Wege.
- **Die Spielleitung (optional):** Behält über das integrierte Nachrichtensystem die Kontrolle und kann Spielern oder Jägern Hinweise zukommen lassen.

---

## ⚡ Key Features

* 📌 **Live-Positionstracking:** mit dynamisch konfigurierbaren Intervallen.
* 🗺️ **OpenStreetMap-Integration:** Vektorkarten via Leaflet – völlig ohne teure API-Kosten.
* 🛡️ **Zero-Database (JSON):** Keine Datenbank erforderlich! Alle Spielzustände werden in JSON-Dateien verwaltet.
* 🔐 **Sicherheit:** JSON-Dateien werden serverseitig via **AES-256-CBC** verschlüsselt abgelegt.
* 👣 **Integrierter Schrittzähler:** Auswertungen der Laufleistung nach dem Spiel direkt über GPS-Distanzberechnungen (Haversine-Formel).
* 🧭 **Offline Queue:** Tracking Signale werden Offline gesammelt und wenn wieder Online an den Server geschickt.
* 💬 **Nachrichtensystem:** Kommunikation zwischen Spielleitung, Jägern und Spielern.
* 👪 **Rollenbasiertes System:** Spielleitung, Jäger, Spieler.
* 📦 **Archiv-Funktion:** Abgelaufene Runden können nach dem Spiel in ein Archiv verschoben werden und stehen für Statistiken im Wirtshaus bereit.

---

## 🚀 Installation & Setup

1. Klicke in GitHub auf **Code -> Download ZIP** oder klone das Repository:
   ```bash
   git clone https://github.com/septem-sensu/friendshunt.git
   ```
2. Lade den Ordner auf deinen PHP-fähigen Webserver (Apache / Nginx) hoch.
3. Stelle sicher, dass der Server über ein **SSL-Zertifikat (HTTPS)** verfügt, da mobile Browser den GPS-Zugriff im unverschlüsselten HTTP-Netz aus Datenschutzgründen blockieren.
4. Rufe die Domain auf, erstelle deinen Account und starte die Jagd!

---

## ⚙️ Spiel-Konfiguration

Jedes Match lässt sich im Administrationsbereich exakt an das Gelände und die Spieleranzahl anpassen:


| Parameter | Beschreibung |
| :--- | :--- |
| **Start & Dauer** | Festlegung von Datum, Uhrzeit und Spielzeit in Stunden. |
| **Tracking-Intervall** | Hintergrund-Standortermittlung. |
| **Silent Hunt Intervall** | Feste Intervalle (Minuten), in denen Jäger reguläre Positions-Updates erhalten. |
| **Speed Hunt Intervall** | Extrem-Phasen (Minuten) mit aufeinanderfolgenden Positions-Updates. |
| **Start- & Exit-Position** | Definition der finalen *Extit Zone* (z. B. eine Gaststätte). |
| **Mitspieler / Namen anzeigen** | Taktische Filter, ob Jäger/Spieler einander auf der Karte sehen und namentlich identifizieren können. |

---

## 🛠️ Technische Architektur

Das Projekt trennt Logik und Darstellung.
Friends Hunt wurde nach dem Prinzip „Maximale Unabhängigkeit & Sicherheit“ entwickelt. Die Anwendung benötigt keine schwere relationale Datenbank (wie MySQL) und läuft dank optimierter JSON-Strukturen extrem ressourcensparend auf fast jedem Webspace.

Custom MVC, kein Framework. Alle Requests laufen über einen Single Entry Point:
```text
index.php → Controller::execute()
  ├─ ?view= → HTML-Antwort (Seitenansicht)
  └─ ?result= → JSON-Antwort (AJAX)
```

### Technologie-Stack
* **Frontend:** HTML5, Vanilla CSS3 (kein schweres Bootstrap nötig), natives objektorientiertes JavaScript, Web APIs.
* **Karten:** LeafletJS & OpenStreetMap.
* **Backend:** Objektorientiertes PHP.
* **Kommunikation:** Asynchrone PHP <-> JavaScript AJAX-Schnittstellen (JSON-Payloads).
* **Sicherheit:** Cookie-basierte Authentifizierung mit verschlüsselten Tokens, strikte client- und serverseitige Formularvalidierung.

### PHP Klassenstruktur (OOP)
```text
Controller/               # Steuerung der AJAX-Anfragen & Routings
Presentation/             # UI-Rendering und Template-System
BaseObject/               # Kern-Objekt mit Basis-Logiken
  ├── Player/             # Usermanagement, Rollen, Avatare & Auth
  └── Game/               # Spielinstanzen & JSON-File-Handling
        └── Gameplay/     # Geo-Berechnungen, Intervalle & Nachrichtensystem
```

### JavaScript Klassenstruktur (OOP)
```text
Communicator/             # Steuerung der AJAX-Anfragen
Validator/                # Formularvalidierung
BatteryTracker/           # Battery Status API
GeoMaps/                  # OpenStreetMaps-Integration über Leaflet
GeoTracker/               # GPS, Schrittzähler, Wake Lock
Statistic/                # Dashboard-Statistiken
ReplayPlayer/             # Spiel-Replay (Timelapse)
Utils/                    # Statitische Hilfs-Methoden (GUID, Timestamps, Audio, Vibration)
BaseObject/               # Kern-Objekt mit Basis-Logiken
  ├── Player/             # Login, Usermanagement, Rollen, Avatare & Auth
  └── Game/               # Spielinstanzen
        └── Gameplay/     # Laufzeitbetrieb, Intervalle & Nachrichtensystem
```

### Request Flow
1. `Controller::init()` lädt View-Config aus `includes/json/views/<view>.json`
2. View-JSON definiert: Klasse, Templates, erlaubte Rollen, Actions
3. `Controller::checkRole()` validiert Cookie-basierte Session
4. Actions werden ausgeführt, Templates via `Presentation::processTemplate()` mit `{{var}}`-Ersetzung gerendert

### Data Persistence
- Alle Daten liegen als AES-256-CBC-verschlüsselte JSON-Dateien in `includes/json/data/`
- `BaseObject` stellt CRUD-Operationen über `loadFileDeCrypted()` / `saveFileEnCrypted()` bereit
- Runtime-Daten während des Spiels in `includes/files/game/<gameId>/` (Tracking, Messages, Gameplay-Status)
- Uploads in `includes/files/player/` und `includes/files/game/`

### View & Template System
Views werden in `includes/json/views/*.json` definiert (Klasse, Templates, Rollen, Actions).
Templates in `includes/templates/*.tmpl` nutzen `{{Class::property}}`-Platzhalter.
Field-Definitionen in `includes/json/fields/*.json` steuert Formularfeld-Metadaten (Typ, Pflicht, Validierung).

### Roles & Auth
- `guest` (nicht authentifiziert), `player` (eingeloggt), `administrator`
- Cookie-basierte Auth mit AES-verschlüsseltem Token (`playerEmail|||hashedPassword`)
- Methoden-Zugriffskontrolle in `includes/json/data/dataPermissions.json`

### Client Storages
```text
Cookie            # Session Cookie (Login Check)
Local storage     # Last Message Id, Dont Show System Messages
Indexed DB        # Offline Tracking Queue
```

### Key Conventions
- PHP: `declare(strict_types=1)` in allen Dateien
- PHP-Klassen nutzen phpDocumentor-Kommentare
- JS: Vanilla ES6 Classes, kein Framework
- CSS: Custom Properties für Theming (`includes/css/themes/`), Mobile-First mit 650px-Breakpoint
- Leaflet.js ist als einzige Third-Party-Lib in `includes/libs/leaflet/` gebundelt

---

## 📄 Lizenz

Dieses Projekt ist unter der [**MIT-Lizenz**](LICENSE) lizenziert. Du kannst es für deine privaten Spiele nutzen, modifizieren und erweitern.

---
*Entwickelt mit ❤️ für Freunde. Bereit für die Flucht?*
