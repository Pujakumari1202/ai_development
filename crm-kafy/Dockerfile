# Kafy CRM — static Expo web demo (nginx only at runtime)
#
# Build:
#   docker build -t kafy-crm .
# With WhatsApp env baked in (EXPO_PUBLIC_* are compile-time only):
#   docker build -t kafy-crm \
#     --build-arg EXPO_PUBLIC_WHATSAPP_ACCESS_TOKEN=... \
#     --build-arg EXPO_PUBLIC_WHATSAPP_PHONE_NUMBER_ID=... \
#     --build-arg EXPO_PUBLIC_WHATSAPP_GRAPH_API_VERSION=v21.0 \
#     .
# Run:
#   docker run --rm -p 8080:80 kafy-crm

# --- build ---
FROM node:22-alpine AS build
WORKDIR /app

# Optional WhatsApp Cloud API credentials (inlined into the JS bundle at export)
ARG EXPO_PUBLIC_WHATSAPP_ACCESS_TOKEN=
ARG EXPO_PUBLIC_WHATSAPP_PHONE_NUMBER_ID=
ARG EXPO_PUBLIC_WHATSAPP_GRAPH_API_VERSION=v21.0
ENV EXPO_PUBLIC_WHATSAPP_ACCESS_TOKEN=$EXPO_PUBLIC_WHATSAPP_ACCESS_TOKEN \
    EXPO_PUBLIC_WHATSAPP_PHONE_NUMBER_ID=$EXPO_PUBLIC_WHATSAPP_PHONE_NUMBER_ID \
    EXPO_PUBLIC_WHATSAPP_GRAPH_API_VERSION=$EXPO_PUBLIC_WHATSAPP_GRAPH_API_VERSION

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npx expo export --platform web

# --- serve ---
FROM nginx:alpine
COPY nginx.conf /etc/nginx/nginx.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
