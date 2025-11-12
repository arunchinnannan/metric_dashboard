#!/bin/bash
# Initialize database for Kafka Metrics Dashboard

echo "========================================="
echo "Database Initialization Script"
echo "========================================="
echo ""

# Database connection details
DB_HOST="${DB_HOST:-host.docker.internal}"
DB_PORT="${DB_PORT:-5432}"
DB_NAME="${DB_NAME:-kafka_metrics}"
DB_USER="${DB_USER:-kafka_user}"
DB_PASSWORD="${DB_PASSWORD:-admin}"

echo "Connecting to PostgreSQL..."
echo "Host: $DB_HOST"
echo "Port: $DB_PORT"
echo "Database: $DB_NAME"
echo "User: $DB_USER"
echo ""

# Run the setup script using Docker
docker run --rm \
  -e PGPASSWORD="$DB_PASSWORD" \
  -v "$(pwd)/deployment/setup-database.sql:/setup.sql" \
  --add-host=host.docker.internal:host-gateway \
  postgres:15-alpine \
  psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -f /setup.sql

if [ $? -eq 0 ]; then
    echo ""
    echo "========================================="
    echo "✅ Database initialized successfully!"
    echo "========================================="
else
    echo ""
    echo "========================================="
    echo "❌ Database initialization failed!"
    echo "========================================="
    echo ""
    echo "Make sure:"
    echo "1. PostgreSQL is running"
    echo "2. Database '$DB_NAME' exists"
    echo "3. User '$DB_USER' has proper permissions"
    echo ""
    echo "To create database and user, run as postgres superuser:"
    echo "  CREATE DATABASE $DB_NAME;"
    echo "  CREATE USER $DB_USER WITH PASSWORD '$DB_PASSWORD';"
    echo "  GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;"
    exit 1
fi
