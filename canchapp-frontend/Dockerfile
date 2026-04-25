# ETAPA 1: Construcción
FROM node:20-alpine AS build
WORKDIR /app

# Copiamos package.json e instalamos dependencias
COPY package*.json ./
RUN npm ci --legacy-peer-deps --no-audit --network-timeout=600000
RUN chmod +x node_modules/.bin/tsc

# Copiamos el código y compilamos
COPY . .
RUN npm run build

# ETAPA 2: Servidor con Nginx
FROM nginx:alpine
# OJO: Si usas Vite es /app/dist. Si usas Create React App (CRA) es /app/build
COPY --from=build /app/dist /usr/share/nginx/html

# Descomenta esta línea SOLAMENTE si ya tienes un archivo nginx.conf en tu proyecto de React
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]