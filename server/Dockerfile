# syntax=docker/dockerfile:1
FROM node:20-alpine

WORKDIR /app

# Install dependencies using the server package manifest
COPY server/package*.json ./
RUN npm install

# Copy application source
COPY server/. ./

# Generate the Prisma client at build time so runtime containers
# always have an up-to-date client available.
RUN npx prisma generate

EXPOSE 4000

CMD ["npm", "start"]
