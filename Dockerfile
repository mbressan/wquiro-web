# Build stage — compila o React com Vite
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
ARG VITE_API_URL=http://localhost:8000/api/v1
ENV VITE_API_URL=${VITE_API_URL}
RUN npm run build

# Prod stage — apenas os assets gerados (servidos via nginx volume)
FROM alpine:latest AS prod
COPY --from=build /app/dist /app/dist
CMD ["echo", "Frontend build complete — serve dist/ via nginx volume"]
