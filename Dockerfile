# Stage 1: Build client and server
FROM node:20-alpine AS builder

WORKDIR /app

# Copy root and workspace package files
COPY package*.json ./
COPY client/package*.json ./client/
COPY server/package*.json ./server/

# Install dependencies across workspaces
RUN npm install --prefix client
RUN npm install --prefix server
RUN npm install

# Copy source code
COPY . .

# Build both frontend and backend
RUN npm run build

# Stage 2: Production runtime image
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=5001

# Copy package configurations
COPY package*.json ./
COPY server/package*.json ./server/

# Install server production dependencies
RUN npm install --prefix server --omit=dev

# Copy compiled artifacts
COPY --from=builder /app/client/dist ./client/dist
COPY --from=builder /app/server/dist ./server/dist

# Expose web port
EXPOSE 5001

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:5001/api/health || exit 1

# Start the unified PrepIQ service
CMD ["node", "server/dist/index.js"]
