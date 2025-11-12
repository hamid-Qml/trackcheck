# ---- build stage ----
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY tsconfig*.json nest-cli.json ./
COPY src ./src
RUN npm run build

# ---- runtime ----
FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY package*.json ./
RUN npm ci --omit=dev

# app code
COPY --from=build /app/dist ./dist

# uploads directory (also mounted as volume)
RUN mkdir -p /data/uploads

EXPOSE 8000
CMD ["node", "dist/main.js"]
