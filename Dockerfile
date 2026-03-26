FROM node:20-slim

RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    ffmpeg imagemagick webp ca-certificates && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm ci --omit=dev

COPY . .

ENV NODE_ENV=production

EXPOSE 8000

CMD ["node", "index.js"]
