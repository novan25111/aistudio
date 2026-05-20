# Dockerfile

# --- STAGE 1: Build Stage ---
FROM node:20-alpine AS builder
WORKDIR /app

# Copy dependency definitions
COPY package*.json ./

# Install ALL dependencies (including devDependencies for building)
RUN npm ci

# Copy the rest of the application files
COPY . .

# Build Vite frontend and compile Express server with esbuild
RUN npm run build

# --- STAGE 2: Production Safe Runner ---
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
# Force dev server / runner to bind on port 3000
ENV PORT=3000

# Copy package configuration
COPY package*.json ./

# Install only production dependencies (no devDependencies to keep container lean)
RUN npm ci --only=production

# Copy built products in `dist`
COPY --from=builder /app/dist ./dist

# Expose port (Internal reverse proxy runs on 3000, keep it consistent)
EXPOSE 3000

# Run production unified server
CMD ["npm", "start"]
