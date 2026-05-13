# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Generate Prisma client and build TypeScript
RUN npx prisma generate
RUN npm run build

# Production stage
FROM node:18-alpine

WORKDIR /app

# Copy built files and production dependencies
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/prisma ./prisma

# Create the data directory for SQLite
RUN mkdir -p /app/prisma/data

EXPOSE 3000

# Start the application
CMD ["npm", "run", "start"]
