# Kafy CRM

Expo 57 CRM backed by an Express API and PostgreSQL. The database implements
leads, supplier/customer accounts and users, customer branches, and the
operational ticket, manager, contact, and conversation records used by the app.

## Local setup

```bash
npm install
cp .env.example .env
docker compose up -d postgres
npm run db:migrate
npm run db:seed
npm run server
```

In another terminal, run `npm run web` (or `npm run ios` / `npm run android`).
Use your computer's LAN IP in `EXPO_PUBLIC_API_URL` for a physical device.
`EXPO_PUBLIC_USE_LOCAL_DATA=true` is an explicit offline-demo mode.

`db:seed` transactionally loads the app's development dataset. With
`ALLOW_DB_RESET=true`, **Reset demo** can reload it from the app.

## WhatsApp Cloud API

Configure `WHATSAPP_ACCESS_TOKEN`, `WHATSAPP_PHONE_NUMBER_ID`, and optionally
`WHATSAPP_GRAPH_API_VERSION` in the server environment. Tokens never enter the
Expo bundle. Without credentials, CRM writes still work and sends return a
controlled unavailable response.

## Authentication

Development defaults to `AUTH_DISABLED=true`. In production, set it to `false`
and configure `KEYCLOAK_ISSUER` (realm URL) and `KEYCLOAK_AUDIENCE` (client ID).
Protected routes verify bearer JWTs using Keycloak's remote JWKS.

## Commands and endpoints

- `npm run db:migrate` — apply ordered SQL migrations
- `npm run db:seed` — load the development dataset
- `npm run server` — run the API in watch mode
- `npm test`, `npm run lint`, `npm run typecheck`
- `GET/PUT /api/crm`
- `POST /api/crm/reset` (requires `ALLOW_DB_RESET=true`)
- `GET/POST/PATCH/DELETE /api/leads`
- `GET/POST /api/customers/:id/branches`
- `GET/POST /api/{customers|suppliers}/:id/users`
- `POST /api/whatsapp/messages`
- `GET /health`

`docker compose up --build` starts PostgreSQL and the API. The existing
Dockerfile exports the static web client; pass
`--build-arg EXPO_PUBLIC_API_URL=...` for a non-default API location.
