FROM node:lts
RUN curl -L https://unpkg.com/@pnpm/self-installer | node
ENV DEBIAN_FRONTEND=noninteractive
RUN apt update && apt install -y libsodium23 ffmpeg && rm -rf /var/lib/apt/lists/*
WORKDIR /node-lib
COPY package.json pnpm-lock.yaml ./
RUN pnpm install
COPY . .
ARG DISCORD_TOKEN
ARG DISCORD_CLIENT_ID
ARG DISCORD_CLIENT_SECRET
ENV DISCORD_TOKEN=${DISCORD_TOKEN}
ENV DISCORD_CLIENT_ID=${DISCORD_CLIENT_ID}
ENV DISCORD_CLIENT_SECRET=${DISCORD_CLIENT_SECRET}
RUN pnpm run build
CMD ["node", "dist/main.js"]
