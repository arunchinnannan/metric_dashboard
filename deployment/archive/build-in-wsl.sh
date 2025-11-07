#!/bin/bash
# Build Docker images inside WSL to handle Linux symlinks properly

set -e

echo "========================================"
echo "Building Docker Images in WSL"
echo "========================================"
echo ""

# Get the script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
METRIC_DIR="$(dirname "$SCRIPT_DIR")"

cd "$METRIC_DIR"

echo "Working directory: $(pwd)"
echo ""

# Extract node_modules
echo "Extracting node_modules..."
cd frontend
tar -xzf node_modules-linux.tar.gz
echo "✓ Frontend extracted"
cd ..

cd backend
tar -xzf node_modules-linux.tar.gz
echo "✓ Backend extracted"
cd ..

echo ""

# Build frontend
echo "========================================"
echo "Building Frontend Image..."
echo "========================================"
docker build -f deployment/Dockerfile.frontend -t metric-dashboard-frontend:test .
if [ $? -eq 0 ]; then
    echo "✓ Frontend image built successfully!"
else
    echo "✗ Frontend build failed!"
    exit 1
fi
echo ""

# Build backend
echo "========================================"
echo "Building Backend Image..."
echo "========================================"
docker build -f deployment/Dockerfile.backend -t metric-dashboard-backend:test .
if [ $? -eq 0 ]; then
    echo "✓ Backend image built successfully!"
else
    echo "✗ Backend build failed!"
    exit 1
fi
echo ""

# Start containers
echo "========================================"
echo "Starting Containers..."
echo "========================================"

echo "Starting backend..."
docker run -d --name metric-backend-test -p 5000:5000 metric-dashboard-backend:test
sleep 3

echo "Starting frontend..."
docker run -d --name metric-frontend-test -p 8080:8080 metric-dashboard-frontend:test
sleep 3
echo ""

# Show status
echo "========================================"
echo "Container Status"
echo "========================================"
docker ps --filter "name=metric-"
echo ""

echo "========================================"
echo "Backend Logs (last 15 lines)"
echo "========================================"
docker logs --tail 15 metric-backend-test
echo ""

echo "========================================"
echo "Frontend Logs (last 15 lines)"
echo "========================================"
docker logs --tail 15 metric-frontend-test
echo ""

echo "========================================"
echo "Test Complete!"
echo "========================================"
echo ""
echo "Containers are running:"
echo "  Frontend: http://localhost:8080"
echo "  Backend:  http://localhost:5000"
echo ""
echo "To stop and remove:"
echo "  docker stop metric-frontend-test metric-backend-test"
echo "  docker rm metric-frontend-test metric-backend-test"
echo ""
