# UpDown Frontend - Quantitative Strategy Optimizer

Dieses Repository enthält das hochperformante Frontend für die **UpDown Mean-Reversion Backtesting Engine (v2)**. Die Anwendung ist als Single-Page-Application (SPA) konzipiert und darauf optimiert, große Mengen an quantitativen Finanzdaten (Konto-Equity-Kurven, tausende Trade-Datensätze) verzögerungsfrei zu rendern und interaktiv zu analysieren.

## Features

- **Dynamic Strategy Configuration:** Flexibles Formular zur Eingabe von Ticker-Listen, Zeiträumen, Startkapital und Gebühren (`fee_pct`).
- **Smart Toggle Logic:** Wenn der *Comparison Mode* aktiv ist, können mehrere Algorithmen (Kadane, SMA, Mean-Reversion) parallel simuliert werden. Im Single-Modus verhalten sich die Toggles exklusiv zueinander.
- **Conditional Visibility:** Fortgeschrittene Parameter (Stop-Loss, Allocation) und Machine-Learning-Optionen (LightGBM) klappen sich dynamisch ein und grauen visuell aus, wenn sie für die gewählte Strategie nicht kompatibel sind.
- **High-Performance Charting:** Interaktiver Linien-Graph auf Basis von **Apache ECharts** mit reaktiver Filterung nach Zeiträumen (1M, 6M, 1Y, All) und einzelnen Aktientickern mittels hocheffizientem HTML5-Canvas-Rendering.
- **Filterable Trade History:** Eine vollständig sortier-, such- und filterbare Datentabelle (PrimeVue) mit dedizierten Dropdowns für Ticker, Exit-Gründe und Strategie-Badges. Standardmäßig eingeklappt für ein sauberes Dashboard-UI.

---

## Tech Stack

- **Framework:** Vue 3 (Composition API mit `<script setup>`)
- **Build Tool:** Vite (blitzschnelles HMR & optimiertes Bundling)
- **Styling:** Tailwind CSS (Utility-First, konsistente Slate-Dunkelpalette)
- **UI-Komponenten:** PrimeVue (Data Table)
- **Charts:** Apache ECharts (`vue-echarts` mit vollem Tree-Shaking)
- **HTTP Client:** Axios (mit automatischer Umgebungserkennung für API-Anfragen)

---

## Lokale Entwicklung (Local Development)

### Voraussetzungen
Stelle sicher, dass **Node.js (v20 oder neuer)** und `npm` auf deinem Computer installiert sind.

### 1. Installation
Klone das Repository und installiere die Abhängigkeiten im Hauptverzeichnis:
```bash
cd updown-frontend
npm install
```

### 2. Umgebungsvariablen anlegen
Das Frontend erkennt automatisch, ob es lokal oder in der Produktion läuft. Erstelle bei Bedarf eine .env.production Datei für den Live-Gang:

```bash
# Für die Produktion (GCP VM IP anpassen)
VITE_API_BASE_URL=http://<DEINE_GCP_VM_IP>/v1
Hinweis: Wenn keine Variable gesetzt ist, fällt Axios automatisch auf den lokalen Entwicklungs-Server des Backends (http://localhost:8000/v1) zurück.
```

### 3. Entwicklungs-Server starten
```bash
npm run dev
```
Die App ist nun lokal unter http://localhost:5173 erreichbar.

### Docker Deployment (Produktion)
Für den produktionsreifen Einsatz nutzt das Projekt einen Multi-Stage Docker Build. Dadurch wird der Quellcode in einer Node-Umgebung kompiliert und anschließend in einen extrem schlanken, performanten Nginx-Webserver injiziert (Image-Größe nur ~30MB, kein unnötiger Overhead durch node_modules).

Starten via Docker Compose
Stelle sicher, dass der lokale Node-Server gestoppt ist, und führe folgenden Befehl aus:

```Bash
docker compose up -d --build
```
Das produktionsreife Frontend läuft nun isoliert im Docker-Container und ist auf Port 8080 freigegeben: http://localhost:8080.

### CI/CD Pipeline (GitHub Actions)
Das Repository verfügt über einen automatisierten Deployment-Workflow unter .github/workflows/deploy.yml.

Sobald Code in den main-Branch gepusht oder gemerged wird, triggert GitHub die Pipeline:

Verbindung zur Google Cloud Platform (GCP) VM via SSH.

Automatischer git pull origin main im Zielordner der VM.

Ausführung von docker compose up -d --build direkt auf der VM für ein hocheffizientes, containerisiertes Update ohne Downtime.

Erforderliche Repository-Secrets
Damit die Pipeline erfolgreich durchläuft, müssen unter Settings -> Secrets and variables -> Actions im GitHub-Repo folgende Secrets hinterlegt sein:

GCP_HOST: Die öffentliche IP-Adresse deiner Google Cloud VM.

GCP_USER: Dein SSH-Benutzername auf der VM.

GCP_SSH_KEY: Dein privater SSH-Schlüssel (Private Key).

### Projektstruktur
```Plaintext
updown-frontend/
├── .github/workflows/   # CI/CD GitHub Actions Deployment-Pipeline
├── src/
│   ├── components/      # Wiederverwendbare UI-Komponenten
│   │   ├── StrategyForm.vue  # Das komplexe Konfigurationsformular
│   │   ├── EquityChart.vue   # Der reaktive Apache ECharts Linien-Graph
│   │   └── TradeTable.vue    # Die filterbare PrimeVue Trade-Historie
│   ├── services/
│   │   └── api.js       # Axios-Konfiguration & API-Routen zum Python-Backend
│   ├── App.vue          # Hauptkomponente (Zustands- und Daten-Orchestrierung)
│   └── main.js          # App-Initialisierung & PrimeVue-Registrierung
├── Dockerfile           # Multi-Stage Docker-Konfiguration (Node + Nginx)
└── docker-compose.yml   # Docker Compose Rezept für Port-Mapping (8080:80)
```
⚠
### Performance- & Architektur-Hinweise
**shallowRef für Massendaten**: 
Um ein Einfrieren des Browsers bei extrem großen Backtest-Ergebnissen (z. B. 10.000 Trades) zu verhindern, wird das backtestResult in der App.vue als shallowRef gehalten. Dadurch wird die Tiefen-Reaktivität von Vue für Sub-Objekte deaktiviert, was massiv CPU-Leistung einspart.

**PrimeVue Scoped Overrides**: 
Die Anpassung des Tabellen-Header-Designs und der Zeilen-Paddings wurde mittels des :deep() Selektors in der TradeTable.vue isoliert gelöst. Dadurch werden Konflikte zwischen dem Tailwind CSS-Reset und dem PrimeVue-Theme sauber abgefangen, ohne globale Styles zu verschmutzen.