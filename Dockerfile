# Stackr Bitcoin DCA Application - Main Service Container
# 
# PURPOSE: Containerizes the Node.js application with TypeScript, LangGraph, and SQLite
# RELATED: Bitcoin Knots container, docker-compose orchestration
# TAGS: docker, nodejs, typescript, langgraph, bitcoin-dca

# Use Node.js 18 LTS as base image
FROM node:18-alpine

# Set working directory for the application
WORKDIR /app

# Install system dependencies for SQLite and other native modules
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    sqlite \
    && rm -rf /var/cache/apk/*

# Copy package files first for better caching
COPY package*.json ./
COPY yarn.lock* ./

# Install dependencies
RUN npm ci --only=production && npm cache clean --force

# Copy application source code
COPY . .

# Build TypeScript application
RUN npm run build

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Change ownership of app directory
RUN chown -R nodejs:nodejs /app
USER nodejs

# Expose port for the application
EXPOSE 3000

# Health check to ensure application is running
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD node healthcheck.js || exit 1

# Default command to run the application
CMD ["npm", "start"] 