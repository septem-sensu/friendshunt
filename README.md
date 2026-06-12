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
    <td><img src="includes/images/screenshots/screenshot-friendshunt-tracking-550x1024.png" alt="Friends-Hunt App - Tracking Ansicht"  width="230" title="Friends-Hunt App - Tracking Ansicht" /></td>
    <td><img src="includes/images/screenshots/screenshot-friendshunt-dashboard-550x1024.png" alt="Friends-Hunt App - Game Dashboard Ansicht"  width="230" title="Friends-Hunt App - Game Dashboard Ansicht" /></td> 
    <td><img src="includes/images/screenshots/screenshot-friendshunt-account-550x1024.png" alt="Friends-Hunt App - My Account Ansicht"  width="230" title="Friends-Hunt App - My Account Ansicht" /></td> 
    <td><img src="includes/images/screenshots/screenshot-friendshunt-messages-550x1024.png" alt="Friends-Hunt App - Nachrichten Ansicht"  width="230" title="Friends-Hunt App - Nachrichten Ansicht" /></td> 
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

* 🗺️ **OpenStreetMap-Integration:** Vektorkarten via Leaflet – völlig ohne teure API-Kosten.
* 🛡️ **Zero-Database (JSON):** Keine Datenbank erforderlich! Alle Spielzustände werden in JSON-Dateien verwaltet.
* 🔐 **Sicherheit:** Die JSON-Dateien werden serverseitig via **AES-256-CBC** verschlüsselt abgelegt.
* 👣 **Integrierter Schrittzähler:** Auswertungen der Laufleistung nach dem Spiel direkt über GPS-Distanzberechnungen (Haversine-Formel).
* 💬 **Nachrichtensystem:** Kommunikation zwischen Spielleitung, Jägern und Spielern.
* 📦 **Archiv-Funktion:** Abgelaufene Runden können nach dem Spiel in ein Archiv verschoben werden und stehen für Statistiken im Wirtshaus bereit.

---

## ⚙️ Spiel-Konfiguration

Jedes Match kann über das Dashboard maßgeschneidert konfiguriert werden:


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

Das Projekt trennt Logik und Darstellung. Das Backend agiert als passiver Datensammler.

### PHP Klassenstruktur (OOP)
```text
Controller/               # Steuerung der AJAX-Anfragen & Routings
Presentation/             # UI-Rendering und Template-System
BaseObject/               # Kern-Objekt mit Basis-Logiken
  ├── Player/             # Usermanagement, Rollen, Avatare & Auth
  └── Game/               # Spielinstanzen & JSON-File-Handling
        └── Gameplay/     # Geo-Berechnungen, Intervalle & Nachrichtensystem
```

### Technologie-Stack
* **Frontend:** HTML5, Vanilla CSS3 (kein schweres Bootstrap nötig), native JavaScript Web APIs.
* **Karten:** LeafletJS & OpenStreetMap.
* **Backend:** Objektorientiertes PHP.
* **Kommunikation:** Asynchrone PHP <-> JavaScript AJAX-Schnittstellen (JSON-Payloads).
* **Sicherheit:** Cookie-basierte Authentifizierung mit verschlüsselten Tokens, strikte client- und serverseitige Formularvalidierung.

---

## 🚀 Installation & Setup

1. Klicke auf GitHub auf **Code -> Download ZIP** oder klone das Repository:
   ```bash
   git clone https://github.com/septem-sensu/friendshunt.git
   ```
2. Lade den Ordner auf deinen PHP-fähigen Webserver (Apache / Nginx) hoch.
3. Stelle sicher, dass der Server über ein **SSL-Zertifikat (HTTPS)** verfügt, da mobile Browser den GPS-Zugriff im unverschlüsselten HTTP-Netz aus Datenschutzgründen blockieren.
4. Rufe die Domain auf, erstelle deinen Account und starte die Jagd!

---

## 📄 Lizenz

Dieses Projekt ist unter der [**MIT-Lizenz**](LICENSE) lizenziert. Du kannst es für deine privaten Spiele nutzen, modifizieren und erweitern.

---
*Entwickelt mit ❤️ für Freunde. Bereit für die Flucht?*
