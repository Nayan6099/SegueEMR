# Use official Node.js LTS image based on Alpine Linux
FROM node:20-alpine

# Install openssl for Prisma
RUN apk add --no-cache openssl

# Set working directory
WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./

# Copy Prisma schema specifically (needed for prisma generate in postinstall)
COPY prisma ./prisma/

# Install dependencies (Prisma client generation will be triggered in postinstall)
RUN npm ci

# Copy the rest of the application code
COPY . .

# Expose port 5000
EXPOSE 5000

# Set environment variables defaults
ENV PORT=5000
ENV NODE_ENV=production

# Start command
CMD ["npm", "start"]
