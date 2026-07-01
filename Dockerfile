FROM node:22-bookworm-slim

WORKDIR /app

RUN apt-get update -y \
  && apt-get install -y --no-install-recommends openssl ca-certificates \
  && rm -rf /var/lib/apt/lists/*

COPY package.json package-lock.json ./
RUN npm install -g npm@11 && npm ci --no-audit --no-fund

COPY . .

RUN npx prisma generate && npm run build

ENV PORT=3000
EXPOSE 3000

CMD ["sh", "-c", "npx prisma migrate deploy && node prisma/seed.mjs && npx next start -p 3000"]
