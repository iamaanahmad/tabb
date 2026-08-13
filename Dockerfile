# Use Node.js official lightweight image
FROM node:20-slim AS builder

WORKDIR /app

# Copy dependency configs
COPY package.json package-lock.json* ./

# Install dependencies
RUN npm ci --omit=dev || npm install

# Copy application source code
COPY . .

# Build Vite frontend bundle
RUN npm run build

# Production runtime stage
FROM node:20-slim AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=8080

COPY package.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/server ./server
COPY --from=builder /app/dist ./dist

EXPOSE 8080

CMD ["node", "server/index.js"]
