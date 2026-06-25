# ==========================================
# STAGE 1: Build-Phase mit Node.js
# ==========================================
FROM node:20-alpine AS build-stage

# Arbeitsverzeichnis im Container festlegen
WORKDIR /app

# Paket-Dateien kopieren und Abhängigkeiten installieren
COPY package*.json ./
RUN npm install

# Den gesamten restlichen Quellcode kopieren
COPY . .

# Das Projekt für die Produktion kompilieren (erstellt den /dist Ordner)
RUN npm run build


# ==========================================
# STAGE 2: Serve-Phase mit Nginx
# ==========================================
FROM nginx:stable-alpine AS production-stage

# Die fertig kompilierten Dateien aus der Build-Stage in den Nginx-Web-Ordner kopieren
COPY --from=build-stage /app/dist /usr/share/nginx/html

# Port 80 nach außen freigeben
EXPOSE 80

# Nginx im Vordergrund starten
CMD ["nginx", "-g", "daemon off;"]