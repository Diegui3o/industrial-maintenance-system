FROM node:20-alpine AS builder

WORKDIR /app

# Solución para redes corporativas con inspección SSL
RUN npm config set strict-ssl false

COPY package*.json ./
RUN rm -rf node_modules package-lock.json && npm install

COPY . .
RUN npm run build

FROM nginx:alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80