FROM node:20-slim AS deps
WORKDIR /app

# Install dependencies using lockfile for reproducible builds
COPY package.json package-lock.json ./
RUN npm ci --include=optional \
    && npm install --no-save --no-package-lock @rollup/rollup-linux-x64-gnu@4.57.1

FROM node:20-slim AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ARG VITE_API_URL=/api
ENV VITE_API_URL=$VITE_API_URL
RUN npm run build

FROM nginx:stable-alpine AS runner
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
