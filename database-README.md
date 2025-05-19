# PostgreSQL Database for Campus Alert System

This document provides information about the PostgreSQL database setup for the Campus Alert System, including its schema, multi-tenant functionality, and how to use it with Docker.

## Overview

The Campus Alert System uses PostgreSQL as its database to store information about organizations, users, alerts, and devices. The database is designed to support a multi-tenant architecture, where each school district has its own isolated data environment.

## Database Schema

The database schema consists of the following tables:

1. **organizations**: Stores information about school districts
2. **users**: Stores user information with roles and organization affiliations
3. **alerts**: Stores alert information including type, status, and who initiated/resolved it
4. **devices**: Stores information about mobile devices for push notifications

## Multi-Tenant Architecture

The database implements multi-tenancy using PostgreSQL's Row-Level Security (RLS) feature. This ensures that each organization can only access its own data, even though they share the same database instance.

Key multi-tenant features:

1. **Row-Level Security Policies**: Restrict access to rows based on the organization ID
2. **Organization Context**: Functions to set and clear the current organization context
3. **Trigger-Based Enforcement**: Ensures all data operations respect organization boundaries

## Docker Setup

The database is containerized using Docker and can be run alongside the web application using Docker Compose.

### Docker Compose Configuration

The `docker-compose.yml` file includes:

1. **PostgreSQL Database**: Uses the official PostgreSQL 14 Alpine image
2. **pgAdmin**: Web-based administration tool for PostgreSQL
3. **Web Application**: The Campus Alert System web frontend

### Environment Variables

The following environment variables can be used to configure the database:

- `DB_PASSWORD`: Password for the PostgreSQL database (default: postgres)
- `ORGANIZATION_ID`: ID of the organization (default: campus_alert)
- `DB_PORT`: Port to expose the PostgreSQL database (default: 5432)
- `PGADMIN_EMAIL`: Email for pgAdmin login (default: admin@example.com)
- `PGADMIN_PASSWORD`: Password for pgAdmin login (default: admin)
- `PGADMIN_PORT`: Port to expose pgAdmin (default: 5050)

## Getting Started

To start the database and web application:

```bash
# Set a secure password for the database
export DB_PASSWORD=your_secure_password

# Start the containers
docker-compose up -d
```

To access pgAdmin:

1. Open a web browser and navigate to `http://localhost:5050`
2. Log in with the email and password specified in the environment variables
3. Add a new server with the following details:
   - Name: Campus Alert
   - Host: db
   - Port: 5432
   - Username: postgres
   - Password: (the value of DB_PASSWORD)

## Multi-Tenant Usage

The database includes functions to set and clear the organization context:

```sql
-- Set the organization context
SELECT set_organization_context('00000000-0000-0000-0000-000000000001');

-- Query data (will only show data for the specified organization)
SELECT * FROM users;

-- Clear the organization context
SELECT clear_organization_context();
```

## iOS Companion App Integration

The database schema is designed to work with the iOS companion app as specified in the technical documentation. It includes:

1. **Device Registration**: The `devices` table stores information about iOS devices
2. **Push Notifications**: The database structure supports sending push notifications to specific devices
3. **Multi-Tenant Support**: The iOS app can connect to the specific organization's data environment

## Security Considerations

1. **Data Isolation**: Each organization's data is isolated using Row-Level Security
2. **Authentication**: The database should be used with proper authentication mechanisms
3. **Encryption**: Data is stored securely and transmitted over encrypted connections

## Backup and Restore

The database data is persisted using Docker volumes. To backup the database:

```bash
# Backup the database
docker exec -t campus_alert-db pg_dump -U postgres campus_alert > backup.sql

# Restore the database
cat backup.sql | docker exec -i campus_alert-db psql -U postgres campus_alert
```

## Troubleshooting

If you encounter issues with the database:

1. **Check Logs**: `docker-compose logs db`
2. **Verify Connectivity**: `docker exec -it campus_alert-db psql -U postgres -d campus_alert`
3. **Check Volume Permissions**: Ensure the Docker volume has appropriate permissions

## Additional Resources

- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Docker PostgreSQL Image](https://hub.docker.com/_/postgres)
- [pgAdmin Documentation](https://www.pgadmin.org/docs/)
