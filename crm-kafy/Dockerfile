# Kafy CRM — static Expo web demo (nginx only at runtime)
#
# Build:
#   docker build -t kafy-crm .
# Run:
#   docker run --rm -p 8080:80 kafy-crm

# --- build ---
FROM node:22-alpine AS build
WORKDIR /app

ARG EXPO_PUBLIC_API_URL=http://localhost:3001
ENV EXPO_PUBLIC_API_URL=$EXPO_PUBLIC_API_URL

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
