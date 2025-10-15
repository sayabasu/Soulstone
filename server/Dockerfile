# syntax=docker/dockerfile:1
FROM node:20-alpine

# Ensure OpenSSL libraries are available for Prisma Client at runtime
RUN apk add --no-cache openssl

WORKDIR /app

# Install dependencies using the server package manifest
COPY server/package*.json ./
RUN npm install

# Copy application source
COPY server/. ./
COPY .env.example ./

EXPOSE 4000

CMD ["npm", "start"]
