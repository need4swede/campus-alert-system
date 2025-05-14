# Multi-stage build for React application
# Stage 1: Build the application
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm ci

# Copy the rest of the application code
COPY . .

# ARG for build mode (development or production)
ARG BUILD_MODE=production
ENV BUILD_MODE=${BUILD_MODE}

# Build the application based on the mode
RUN if [ "$BUILD_MODE" = "development" ]; then \
    npm run build:dev; \
    else \
    npm run build; \
    fi

# Stage 2: Create the production image
FROM nginx:alpine

# Copy the built files from the builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
