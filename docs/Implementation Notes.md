# Implementation Notes

## Frontend
- React + Vite SPA housed under `client/` with Material UI based layout.
- Routes managed via `src/routes.js` covering home, login, registration, and catalog flows.
- Auth state managed with `AuthProvider` storing JWT tokens in `localStorage`.

## Backend
- Express API under `server/` with modular structure that mirrors frontend features (auth, catalog).
- Prisma schema defines `User`, `Product`, `Order`, and `OrderItem` models for Postgres.
- Request logging via Morgan + Winston; centralized error handling.
- Swagger docs exposed at `/api-docs`.

## Environment
- `.env.example` files provided for both client and server capturing required configuration values.
