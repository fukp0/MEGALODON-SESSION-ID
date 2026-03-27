# Image Node.js basée sur Debian stable
FROM node:lts-bullseye

# Installation des dépendances système nécessaires
RUN apt-get update && \
    apt-get install -y --no-install-recommends ffmpeg imagemagick webp && \
    rm -rf /var/lib/apt/lists/*

# Créer un répertoire de travail
WORKDIR /usr/src/app

# Copier les fichiers de dépendances
COPY package*.json ./

# Installer les dépendances du projet
RUN npm install

# Installer PM2 globalement (facultatif, si utilisé)
RUN npm install -g pm2 qrcode-terminal

# Copier le reste des fichiers (code source, sessions, config, etc.)
COPY . .

# Créer un volume pour les sessions si tu utilises `useMultiFileAuthState`
VOLUME [ "/usr/src/app/sessions" ]

# Exposer le port utilisé par ton Express (ou non utilisé si c’est un bot terminal)
EXPOSE 8000

# Commande de démarrage (ajuste selon ton fichier principal)
CMD ["node", "index.js"]
