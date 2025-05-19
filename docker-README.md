# Docker Setup for the Campus Alert System

This document provides instructions for deploying the Campus Alert System using Docker in both development and production environments, including the PostgreSQL database.

## Docker Configuration

The Docker setup consists of:

1. **Dockerfile**: Multi-stage build that creates an optimized image for the web application
2. **nginx.conf**: Configuration for the Nginx server that serves the built React application
3. **docker-compose.build.yml**: For building the image locally
4. **docker-compose.yml**: For pulling the pre-built image from 'need4swede/react'
5. **init-db/**: SQL scripts for initializing the PostgreSQL database

## Components

The Docker setup includes the following components:

1. **Web Application**: React frontend for the Campus Alert System
2. **PostgreSQL Database**: Stores data for organizations, users, alerts, and devices
3. **pgAdmin**: Web-based administration tool for PostgreSQL

## Environment Modes

The setup supports two environment modes:

- **Development**: Uses local authentication with mock users
- **Production**: Uses Microsoft OAuth for authentication

## Building and Running Locally

To build and run the application locally:

### Development Mode

```bash
# Build and run in development mode
BUILD_MODE=development PORT=8080 DB_PASSWORD=your_secure_password docker-compose -f docker-compose.build.yml up --build
```

This will:
- Build the application using the development build script (`npm run build:dev`)
- Use the `.env.development` environment variables
- Run the container on port 8080 (or your specified PORT)
- Use local authentication with mock users
- Set up the PostgreSQL database with the specified password
- Make pgAdmin available on port 5050

### Production Mode

```bash
# Build and run in production mode
BUILD_MODE=production PORT=80 DB_PASSWORD=your_secure_password docker-compose -f docker-compose.build.yml up --build
```

This will:
- Build the application using the production build script (`npm run build`)
- Use the `.env.production` environment variables
- Run the container on port 80 (or your specified PORT)
- Use Microsoft OAuth for authentication
- Set up the PostgreSQL database with the specified password
- Make pgAdmin available on port 5050

## Using Pre-built Images

To use the pre-built images:

### Development Mode

```bash
# Run in development mode
BUILD_MODE=development PORT=8080 DB_PASSWORD=your_secure_password docker-compose up
```

### Production Mode

```bash
# Run in production mode
BUILD_MODE=production PORT=80 DB_PASSWORD=your_secure_password docker-compose up
```

Or simply:

```bash
# Default is production mode
DB_PASSWORD=your_secure_password docker-compose up
```

## Environment Variables

The Docker setup uses the following environment variables:

- `BUILD_MODE`: Set to either 'development' or 'production' (default: 'production')
- `PORT`: The port to expose the web application on (default: 8080)
- `DB_PASSWORD`: Password for the PostgreSQL database (default: postgres)
- `ORGANIZATION_ID`: ID of the organization (default: campus_alert)
- `DB_PORT`: Port to expose the PostgreSQL database (default: 5432)
- `PGADMIN_EMAIL`: Email for pgAdmin login (default: admin@example.com)
- `PGADMIN_PASSWORD`: Password for pgAdmin login (default: admin)
- `PGADMIN_PORT`: Port to expose pgAdmin (default: 5050)

## Multi-Tenant Architecture

The PostgreSQL database is set up with multi-tenant support:

1. **Row-Level Security**: Each organization can only access its own data
2. **Organization Context**: Functions to set and clear the current organization context
3. **Trigger-Based Enforcement**: Ensures all data operations respect organization boundaries

## Database Schema

The database schema includes the following tables:

1. **organizations**: Stores information about school districts
2. **users**: Stores user information with roles and organization affiliations
3. **alerts**: Stores alert information including type, status, and who initiated/resolved it
4. **devices**: Stores information about mobile devices for push notifications

## Testing the Database

A test script is provided to verify the database setup:

```bash
# Make the script executable
chmod +x test-database.sh

# Run the test script
./test-database.sh
```

## Accessing pgAdmin

To access the pgAdmin web interface:

1. Open a web browser and navigate to `http://localhost:5050`
2. Log in with the email and password specified in the environment variables
3. Add a new server with the following details:
   - Name: Campus Alert
   - Host: db
   - Port: 5432
   - Username: postgres
   - Password: (the value of DB_PASSWORD)

## Architecture

The Docker setup uses a multi-stage build process:

1. **Build Stage**:
   - Uses Node.js to install dependencies and build the application
   - Builds either the development or production version based on the BUILD_MODE

2. **Production Stage**:
   - Uses Nginx to serve the built application
   - Configures Nginx for optimal performance and security
   - Handles client-side routing for the React application

3. **Database Stage**:
   - Uses PostgreSQL for data storage
   - Initializes the database schema and seed data
   - Implements multi-tenant functionality

## Notes

- The application uses different authentication methods based on the environment:
  - Development: Local authentication with mock users
  - Production: Microsoft OAuth

- Make sure to update the `.env.production` file with your actual Microsoft OAuth credentials before deploying to production.

- For security in production, use a strong password for the database and change the default pgAdmin credentials.

- The database is configured to support the iOS companion app as specified in the technical documentation.
