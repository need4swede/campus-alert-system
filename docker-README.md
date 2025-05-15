# Docker Setup for the Rapid Emergency Alert Communications Tool

This document provides instructions for deploying REACT using Docker in both development and production environments.

## Docker Configuration

The Docker setup consists of:

1. **Dockerfile**: Multi-stage build that creates an optimized image for the application
2. **nginx.conf**: Configuration for the Nginx server that serves the built React application
3. **docker-compose.build.yml**: For building the image locally
4. **docker-compose.yml**: For pulling the pre-built image from 'need4swede/react'

## Environment Modes

The setup supports two environment modes:

- **Development**: Uses local authentication with mock users
- **Production**: Uses Microsoft OAuth for authentication

## Building and Running Locally

To build and run the application locally:

### Development Mode

```bash
# Build and run in development mode
BUILD_MODE=development PORT=8080 docker-compose -f docker-compose.build.yml up --build
```

This will:
- Build the application using the development build script (`npm run build:dev`)
- Use the `.env.development` environment variables
- Run the container on port 8080 (or your specified PORT)
- Use local authentication with mock users

### Production Mode

```bash
# Build and run in production mode
BUILD_MODE=production PORT=80 docker-compose -f docker-compose.build.yml up --build
```

This will:
- Build the application using the production build script (`npm run build`)
- Use the `.env.production` environment variables
- Run the container on port 80 (or your specified PORT)
- Use Microsoft OAuth for authentication

## Using Pre-built Images

To use the pre-built images from 'need4swede/react':

### Development Mode

```bash
# Run in development mode
BUILD_MODE=development PORT=8080 docker-compose up
```

### Production Mode

```bash
# Run in production mode
BUILD_MODE=production PORT=80 docker-compose up
```

Or simply:

```bash
# Default is production mode
docker-compose up
```

## Environment Variables

The Docker setup uses the following environment variables:

- `BUILD_MODE`: Set to either 'development' or 'production' (default: 'production')
- `PORT`: The port to expose the application on (default: 8080)

## Architecture

The Docker setup uses a multi-stage build process:

1. **Build Stage**:
   - Uses Node.js to install dependencies and build the application
   - Builds either the development or production version based on the BUILD_MODE

2. **Production Stage**:
   - Uses Nginx to serve the built application
   - Configures Nginx for optimal performance and security
   - Handles client-side routing for the React application

## Notes

- The application uses different authentication methods based on the environment:
  - Development: Local authentication with mock users
  - Production: Microsoft OAuth

- Make sure to update the `.env.production` file with your actual Microsoft OAuth credentials before deploying to production.
