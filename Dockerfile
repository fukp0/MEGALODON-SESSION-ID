# Image Node.js basée sur Debian stable
FROM node:lts-bullseye

# Installation des dépendances système nécessaires
RUN apt-get update && \
    apt-get install -y --no-install-recommends ffmpeg imagemagick webp && \
    rm -rf /var/lib/apt/lists/*

# Répertoire de travail
WORKDIR /usr/src/app

# Copier les fichiers de dépendances
COPY package*.json ./

# Installer les dépendances
RUN npm install

# Installer PM2 (optionnel)
RUN npm install -g pm2 qrcode-terminal

# Copier le reste du projet
COPY . .

# ⚠️ SUPPRIMÉ : VOLUME interdit sur Railway
# VOLUME [ "/usr/src/app/sessions" ]

# Exposer le port
EXPOSE 8000

# Démarrage
CMD ["node", "index.js"]
