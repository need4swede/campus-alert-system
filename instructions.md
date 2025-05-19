# Step-by-Step Guide to Setting Up the Campus Alert System with Docker

Based on your project files, here's a simple guide to get your Campus Alert System up and running using Docker:

## Prerequisites

1. __Docker__ and __Docker Compose__ installed on your system
2. Git repository cloned to your local machine

## Step 1: Set Up Environment Variables

1. Create a `.env` file based on the provided `.env.example`:

   ```bash
   cp .env.example .env
   ```

2. Edit the `.env` file to set your desired configuration:

   - Set a secure database password
   - Configure organization settings
   - Set ports for the web app, database, and pgAdmin
   - For production, add Microsoft OAuth credentials

## Step 2: Choose Your Deployment Method

You have two options:

### Option A: Using Pre-built Images (Recommended for Quick Start)

```bash
# For development mode
BUILD_MODE=development PORT=8080 DB_PASSWORD=your_secure_password docker-compose up

# For production mode
BUILD_MODE=production PORT=80 DB_PASSWORD=your_secure_password docker-compose up

# Or simply (defaults to production)
DB_PASSWORD=your_secure_password docker-compose up
```

### Option B: Building Images Locally

```bash
# For development mode
BUILD_MODE=development PORT=8080 DB_PASSWORD=your_secure_password docker-compose -f docker-compose.build.yml up --build

# For production mode
BUILD_MODE=production PORT=80 DB_PASSWORD=your_secure_password docker-compose -f docker-compose.build.yml up --build
```

## Step 3: Verify the Setup

1. __Web Application__: Access at `http://localhost:8080` (or your configured PORT)

2. __pgAdmin__: Access at `http://localhost:5050`

   - Login with the email and password from your `.env` file (defaults: admin@example.com / admin)

   - Add a new server with:

     - Name: Campus Alert
     - Host: db
     - Port: 5432
     - Username: postgres
     - Password: (your DB_PASSWORD)

## Step 4: Test the Database

Run the provided test script to verify the database setup:

```bash
# Make the script executable
chmod +x test-database.sh

# Run the test script
./test-database.sh
```

This will test:

- Database connection
- Multi-tenant functionality
- Data access for different organizations

## Step 5: Development vs. Production

- __Development Mode__:

  - Uses local authentication with mock users
  - Optimized for development workflow
  - Runs on port 8080 by default

- __Production Mode__:

  - Uses Microsoft OAuth for authentication
  - Optimized for performance
  - Runs on port 80 by default
  - Requires valid Microsoft OAuth credentials

## Common Issues and Troubleshooting

1. __Docker containers not starting__:

   - Check Docker is running
   - Verify no port conflicts with existing services

2. __Database connection issues__:

   - Check the DB_PASSWORD is consistent
   - Ensure the database container is running

3. __Web application not loading__:

   - Check the container logs: `docker-compose logs app`
   - Verify the PORT setting

4. __Authentication issues in production__:

   - Verify Microsoft OAuth credentials are correctly set
