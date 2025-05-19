#!/bin/bash

# Test script for the PostgreSQL database

# Set environment variables
export DB_PASSWORD=${DB_PASSWORD:-postgres}
export ORGANIZATION_ID=${ORGANIZATION_ID:-campus_alert}

echo "Testing PostgreSQL database for Campus Alert System"
echo "=================================================="
echo

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
  echo "Error: Docker is not running. Please start Docker and try again."
  exit 1
fi

# Check if the containers are running
if ! docker-compose ps | grep -q "db.*Up"; then
  echo "Starting Docker containers..."
  docker-compose up -d

  # Wait for the database to be ready
  echo "Waiting for the database to be ready..."
  sleep 10
fi

echo "Testing database connection..."
if docker exec -it ${ORGANIZATION_ID}-db psql -U postgres -d ${ORGANIZATION_ID} -c "SELECT 1" > /dev/null 2>&1; then
  echo "✅ Database connection successful"
else
  echo "❌ Database connection failed"
  exit 1
fi

echo
echo "Testing multi-tenant functionality..."

# Test first organization
echo "Setting context to first organization..."
docker exec -it ${ORGANIZATION_ID}-db psql -U postgres -d ${ORGANIZATION_ID} -c "SELECT set_organization_context('00000000-0000-0000-0000-000000000001');"

echo "Querying users from first organization..."
docker exec -it ${ORGANIZATION_ID}-db psql -U postgres -d ${ORGANIZATION_ID} -c "SELECT id, name, email, role FROM users;"

echo
echo "Setting context to second organization..."
docker exec -it ${ORGANIZATION_ID}-db psql -U postgres -d ${ORGANIZATION_ID} -c "SELECT set_organization_context('00000000-0000-0000-0000-000000000002');"

echo "Querying users from second organization..."
docker exec -it ${ORGANIZATION_ID}-db psql -U postgres -d ${ORGANIZATION_ID} -c "SELECT id, name, email, role FROM users;"

echo
echo "Clearing organization context..."
docker exec -it ${ORGANIZATION_ID}-db psql -U postgres -d ${ORGANIZATION_ID} -c "SELECT clear_organization_context();"

echo
echo "Testing alerts table..."
docker exec -it ${ORGANIZATION_ID}-db psql -U postgres -d ${ORGANIZATION_ID} -c "SELECT set_organization_context('00000000-0000-0000-0000-000000000001');"
docker exec -it ${ORGANIZATION_ID}-db psql -U postgres -d ${ORGANIZATION_ID} -c "SELECT id, type, active, location FROM alerts;"

echo
echo "Testing devices table..."
docker exec -it ${ORGANIZATION_ID}-db psql -U postgres -d ${ORGANIZATION_ID} -c "SELECT set_organization_context('00000000-0000-0000-0000-000000000002');"
docker exec -it ${ORGANIZATION_ID}-db psql -U postgres -d ${ORGANIZATION_ID} -c "SELECT id, device_type, device_name FROM devices;"

echo
echo "Database test completed successfully!"
echo "You can access pgAdmin at http://localhost:5050"
echo "Login with:"
echo "  Email: ${PGADMIN_EMAIL:-admin@example.com}"
echo "  Password: ${PGADMIN_PASSWORD:-admin}"
