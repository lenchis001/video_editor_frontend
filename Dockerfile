# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json* yarn.lock* ./
RUN npm install

COPY . .

RUN npm run build

# Production stage
FROM nginx:alpine

# Remove default nginx static assets
RUN rm -rf /usr/share/nginx/html/*

# Copy built React app from builder
COPY --from=builder /app/build /usr/share/nginx/html

# Copy custom nginx config
COPY nginx.conf.tmp /etc/nginx/nginx.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]