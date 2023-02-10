# Ⓥreiheit - Discord Bot & Integration

## Einrichtung und Entwicklung:

### Voraussetzungen
Zuerste muss Node.js installiert sein, dafür musst du die LTS version auf https://nodejs.org/de/ herunterladen und
installieren. Wichtig hierbei ist, dass node.js zum `PATH` hinzugefügt wird. Bei der Frage nach Installation der
Build-Tools, kann (und sollte unter Windows) der Haken rausgenommen werden.

Auch Git muss installiert sein, dafür folgst du am Besten den Anweisungen auf https://git-scm.com/downloads.
Wichtig bei der Installation ist, dass der Style "Checkout as is, commit unix style line endings" ausgewählt ist und
ein beliebiger Editor außer vi/vim zum Bearbeiten der Commit Messages ausgewählt ist (natürlich geht auch VIM, ist aber
wesentlich schwerer zu lernen).

Danach muss PNPM installiert werden, dies erledigst du über das folgendes Kommando in einer Befehlszeile deiner Wahl:
```shell
npm i -g pnpm
```

Jetzt musst du nur noch Git konfigurieren:
```shell
git config --global user.name "Dein Github Name Hier"
git config --global user.email "Deine Github Email Hier"
```

Docker muss installiert sein und docker-compose muss zur Verfügung stehen, um lokal die Datenbank starten zu können.
Folge hierzu den Anweisung spezifisch für dein Betriebssystem.

Zum Entwickeln empfehle ich dir eine Entwicklungsumgebung wie Webstorm, VSCode, etc.

### Installation
Folgendes Kommando muss innerhalb des Anwendungsverzeichnisses ausgeführt werden:
```shell
pnpm i
```
Darauf hin muss eine `.env.local` Datei angelegt werden, in der die Discord Bot und Application Daten eingetragen
werden. Hierfür kannst du einfach die .env Datei kopieren und dann mit deinen eigenen Daten bestücken.

Um die Datenbank zu starten, führe folgenden Befehl im Projekt-Verzeichnis aus:
```shell
docker compose up -d
```

Zum Starten des Bots kannst du folgendes Kommando verwenden:
```shell
pnpm run dev
```

Um den Code für die Produktivumgebung zu bauen, kannst du folgendes Kommando benutzen:
```shell
pnpm run build
```

Um deinen Code auf Formatierungsfehler zu prüfen:
```shell
pnpm run lint
```

