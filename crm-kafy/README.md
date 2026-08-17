# Kafy CRM (demo)

Frontend-only Expo 57 CRM for operations: tickets, customers, suppliers, and managers. Data lives in AsyncStorage with seed mock data. Ticket replies can optionally send via WhatsApp Cloud API.

## Run

```bash
cd /Users/fam/Documents/Programs/ai/ai_development/crm-kafy
npm install
cp .env.example .env   # optional, for WhatsApp
npm run web            # or: npm start / npm run ios / npm run android
```

## WhatsApp env

Copy `.env.example` to `.env` and set:

- `EXPO_PUBLIC_WHATSAPP_ACCESS_TOKEN`
- `EXPO_PUBLIC_WHATSAPP_PHONE_NUMBER_ID`
- `EXPO_PUBLIC_WHATSAPP_GRAPH_API_VERSION` (default `v21.0`)

Without credentials, replies still save locally (soft-fail). HTTP errors show an alert but still persist the message.

Test customer **Farhan** (`+916290363971`) has an OPEN ticket for outbound WhatsApp checks.

## Docker (static web)

```bash
docker build -t kafy-crm .
docker run --rm -p 8080:80 kafy-crm
```

Optional WhatsApp build-args: `EXPO_PUBLIC_WHATSAPP_ACCESS_TOKEN`, `EXPO_PUBLIC_WHATSAPP_PHONE_NUMBER_ID`, `EXPO_PUBLIC_WHATSAPP_GRAPH_API_VERSION` (baked in at `expo export` time).
